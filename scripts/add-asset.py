#!/usr/bin/env python3
"""
add-asset.py — Adiciona novos modelos 3D ao ameno-studio automaticamente.

USO:
  1. Crie public/assets/3d/<slug>/
  2. Coloque dentro: <slug>.glb, renders (JPG/PNG), meta.json
  3. Execute: python scripts/add-asset.py [--push]

meta.json:
  { "name": "Nome do Modelo", "description": "Descrição curta." }

Se meta.json não existir, o script vai pedir nome e descrição.

FLAGS:
  --push      faz git add + commit + push apos processar
  --dry-run   mostra o que seria feito sem executar
  --slug=xyz  processa apenas o slug especificado
"""
import os, sys, json, re, shutil, subprocess
from pathlib import Path
from PIL import Image

# ── Configurações ────────────────────────────────────────────────────────────
ROOT        = Path(__file__).parent.parent
ASSETS_DIR  = ROOT / "public" / "assets" / "3d"
SECTION_TSX = ROOT / "src" / "components" / "portfolio" / "AssetsSection.tsx"
TARGET_H    = 1800       # altura final dos renders em px
PAD_RATIO   = 0.06       # 6% de padding ao redor do objeto
WHITE_THRESH = 248       # limiar para detecção de fundo branco
IMG_EXTS    = {".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff"}

# ── Flags ────────────────────────────────────────────────────────────────────
PUSH    = "--push"    in sys.argv
DRY_RUN = "--dry-run" in sys.argv
ONLY    = next((a.split("=",1)[1] for a in sys.argv if a.startswith("--slug=")), None)

def log(msg, color=""):
    codes = {"green": "\033[92m", "yellow": "\033[93m", "red": "\033[91m", "bold": "\033[1m", "": ""}
    reset = "\033[0m" if color else ""
    print(f"{codes[color]}{msg}{reset}")

def smart_crop_webp(src: Path, dst: Path):
    """Crop simetrico centrado + escala para TARGET_H."""
    img = Image.open(src).convert("RGB")
    w, h = img.size
    cx = w // 2
    pixels = img.load()
    x_min, x_max = w, 0
    for y in range(h):
        for x in range(w):
            r, g, b = pixels[x, y]
            if r < WHITE_THRESH or g < WHITE_THRESH or b < WHITE_THRESH:
                if x < x_min: x_min = x
                if x > x_max: x_max = x
    # Se nao detectou fundo branco (x_min == 0 e x_max == w-1): usa imagem inteira
    obj_w  = x_max - x_min
    pad_px = int(obj_w * PAD_RATIO)
    half   = max(cx - x_min, x_max - cx) + pad_px
    cx1    = max(0, cx - half)
    cx2    = min(w, cx + half)
    crop_w = cx2 - cx1
    cropped  = img.crop((cx1, 0, cx2, h))
    final_w  = int(crop_w * (TARGET_H / h))
    resized  = cropped.resize((final_w, TARGET_H), Image.LANCZOS)
    if not DRY_RUN:
        resized.save(dst, "WEBP", quality=90, method=4)
    size = dst.stat().st_size // 1024 if dst.exists() else 0
    log(f"    {src.name} -> {dst.name} ({final_w}x{TARGET_H}, {size}KB)", "green")

def find_source_renders(folder: Path, slug: str) -> list[Path]:
    """Encontra imagens-fonte (nao WebP finais, nao renders ja processados)."""
    finals = {f"-render-{i:02d}.webp" for i in range(1, 20)}
    sources = []
    for f in sorted(folder.iterdir()):
        if f.suffix.lower() in IMG_EXTS:
            # Ignora renders ja processados
            if any(f.name.endswith(s) for s in finals):
                continue
            sources.append(f)
    return sources

def asset_already_in_tsx(slug: str) -> bool:
    content = SECTION_TSX.read_text(encoding="utf-8")
    return f"slug: '{slug}'" in content or f'slug: "{slug}"' in content

def build_tsx_entry(slug: str, name: str, desc: str, renders: list[Path]) -> str:
    base = f"/assets/3d/{slug}"
    render_lines = "\n".join(
        f"      {{ src: '{base}/{r.name}', alt: '{name} — render {i:02d}' }},"
        for i, r in enumerate(renders, 1)
    )
    return f"""  {{
    slug: '{slug}',
    name: '{name}',
    description: '{desc}',
    glbSrc: '{base}/{slug}.glb',
    fallbackImg: '{base}/{renders[0].name}',
    renders: [
{render_lines}
    ],
  }},"""

def inject_into_tsx(entry: str):
    content = SECTION_TSX.read_text(encoding="utf-8")
    marker = "  // Para adicionar novo asset:"
    if marker not in content:
        log("AVISO: marcador nao encontrado no TSX — adicione manualmente.", "red")
        print(entry)
        return
    new_content = content.replace(marker, entry + "\n" + marker)
    if not DRY_RUN:
        SECTION_TSX.write_text(new_content, encoding="utf-8")
    log(f"  AssetsSection.tsx atualizado.", "green")

def process_folder(folder: Path):
    slug = folder.name
    log(f"\n{'='*60}", "bold")
    log(f"Processando: {slug}", "bold")

    # 1. GLB
    glb = folder / f"{slug}.glb"
    if not glb.exists():
        glbs = list(folder.glob("*.glb"))
        if not glbs:
            log(f"  ERRO: nenhum .glb encontrado em {folder}", "red")
            return
        src_glb = glbs[0]
        if not DRY_RUN:
            shutil.copy2(src_glb, glb)
        log(f"  GLB renomeado: {src_glb.name} -> {glb.name}", "green")

    # 2. Meta
    meta_path = folder / "meta.json"
    if meta_path.exists():
        meta = json.loads(meta_path.read_text(encoding="utf-8"))
        name = meta.get("name", slug.replace("-", " ").title())
        desc = meta.get("description", "Modelagem 3D de alta fidelidade.")
    else:
        log("  meta.json nao encontrado. Informe os dados:", "yellow")
        name = input(f"  Nome do modelo [{slug.replace('-',' ').title()}]: ").strip()
        if not name: name = slug.replace("-", " ").title()
        desc = input(f"  Descricao: ").strip()
        if not desc: desc = "Modelagem 3D de alta fidelidade."
        # Salva para proximas execucoes
        if not DRY_RUN:
            meta_path.write_text(json.dumps({"name": name, "description": desc}, ensure_ascii=False, indent=2), encoding="utf-8")

    log(f"  Nome: {name}")
    log(f"  Desc: {desc[:60]}...")

    # 3. Renders: converte fontes para WebP
    sources = find_source_renders(folder, slug)
    if not sources:
        log("  Nenhuma imagem-fonte encontrada. Buscando WebPs existentes...", "yellow")
        renders = sorted(folder.glob(f"{slug}-render-*.webp"))
    else:
        log(f"  {len(sources)} imagem(ns) fonte encontrada(s). Convertendo...")
        renders = []
        for i, src in enumerate(sources, 1):
            dst = folder / f"{slug}-render-{i:02d}.webp"
            smart_crop_webp(src, dst)
            renders.append(dst)

    if not renders:
        log("  ERRO: sem renders para adicionar.", "red")
        return

    # 4. TSX
    if asset_already_in_tsx(slug):
        log(f"  AVISO: '{slug}' ja existe no AssetsSection.tsx — pulando.", "yellow")
    else:
        entry = build_tsx_entry(slug, name, desc, renders)
        if DRY_RUN:
            log("\n  [DRY-RUN] Entry que seria inserida:", "yellow")
            print(entry)
        else:
            inject_into_tsx(entry)

    log(f"  Concluido: {slug}", "green")

def main():
    if not ASSETS_DIR.exists():
        log(f"ERRO: {ASSETS_DIR} nao encontrado.", "red")
        sys.exit(1)

    # Descobre quais slugs processar
    folders = [
        f for f in sorted(ASSETS_DIR.iterdir())
        if f.is_dir() and (ONLY is None or f.name == ONLY)
    ]

    new_folders = [
        f for f in folders
        if not asset_already_in_tsx(f.name)
    ]

    if not new_folders:
        log("Nenhuma pasta nova encontrada.", "yellow")
        return

    for folder in new_folders:
        process_folder(folder)

    if PUSH and not DRY_RUN:
        log("\nFazendo build + commit + push...", "bold")
        repo = str(ROOT)
        subprocess.run(["npm", "run", "build"], cwd=repo, shell=True, check=True)
        subprocess.run(["git", "-C", repo, "add", "-A"], check=True)
        slugs = ", ".join(f.name for f in new_folders)
        subprocess.run(["git", "-C", repo, "commit", "-m", f"feat: {slugs} — renders WebP + AssetsSection"], check=True)
        subprocess.run(["git", "-C", repo, "push"], check=True)
        log("Push concluido!", "green")
    elif not PUSH:
        log("\nDica: use --push para fazer build + commit + push automaticamente.", "yellow")

if __name__ == "__main__":
    main()