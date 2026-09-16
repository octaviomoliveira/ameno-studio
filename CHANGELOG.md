# Changelog — ameno.studio

Todas as mudanças relevantes são documentadas aqui.
Formato: `[commit] data — descrição`

---

## [Unreleased]

---

## v0.3.0 — 2026-09-16 · Assets 3D: slider GSAP peek carousel

### Adicionado
- **AssetsSection — GSAP ScrollTrigger peek carousel**
  - Cada modelo 3D é um slide de `75vw` → próximo card fica `25vw` visível à direita
  - GSAP pina a seção e arrasta o strip por `cardWidth` (não `100vw`) via `scrub: 1`
  - Contador dinâmico `01 / 02` no header, atualizado em tempo real pelo `onUpdate` do ScrollTrigger
  - Mobile: scroll snap nativo no `assets-strip-clip`, sem GSAP
  - Render (foto) na coluna **esquerda** — imagem começa na borda esquerda da tela
  - Viewer 3D na coluna **direita** com `border-left`
  - Altura: `min(50vw, calc(100dvh - 260px))` — `dvh` desconta barra do browser, evita cortar controles

- **Cadeira Axis adicionada**
  - `public/assets/3d/cadeira-axis/cadeira-axis.glb` (6.9MB)
  - `cadeira-axis-render-01.webp` + `cadeira-axis-render-02.webp` (2048px, WebP quality 90, ~107-141KB cada)
  - Fonte original: `G:\Meu Drive\00.Portfolio\ADM Design\Modelagem\Cadeira Axis\`

- **Padrão de nomeação de arquivos**
  - Pasta: `public/assets/3d/<slug>/`
  - Arquivos: `<slug>.glb`, `<slug>-render-01.webp`, `<slug>-render-02.webp`, ...
  - Sem nomes genéricos como `model.glb` ou `render.webp`

### Alterado
- `AssetsSection.tsx` — reescrito 3× até chegar na arquitetura final:
  1. Grid estático → strip horizontal CSS scroll snap
  2. Strip CSS → fullscreen 100vw por slide
  3. Fullscreen → GSAP ScrollTrigger + peek carousel (estado atual)
- `globals.css` — bloco assets refatorado:
  - `.assets-strip-clip` (novo): clip wrapper `100vw`, escapa container
  - `.assets-strip`: sem overflow-x (GSAP cuida), `will-change: transform`
  - `.asset-slide`: `75vw`, grid `1fr 1fr`, `height: min(50vw, calc(100dvh - 260px))`
  - Render panel sem `border-left`; viewer wrap com `border-left`
  - Mobile: `.assets-strip-clip` vira `overflow-x: auto; scroll-snap-type: x mandatory`

### Commits desta versão
```
b365a3b  feat: render (foto) na esquerda — imagem começa na borda esquerda do card
209b7e1  fix: slide height usa 100dvh-260px — controles inferiores ficam visiveis
1f07711  feat: peek carousel — card 75vw com 25vw do proximo visivel, GSAP move por cardWidth
cd0f97c  test: slide quadrado 1:1 — height: min(50vw, 100vh-220px)
c63199d  feat: assets GSAP ScrollTrigger — pina secao e arrasta slides 100vw pelo scroll
cc3c9e5  feat: assets slider fullscreen 100vw por slide — contador dinamico
f988f99  feat: cadeira-axis render-02 2048px WebP adicionado
cfb82f5  feat: cards 85% com peek do proximo — strip horizontal com gap e borda
0fd72dd  fix: assets-strip usa width: min(960px,100%) para scroll horizontal funcionar
9fa3c65  feat: assets em strip horizontal com scroll snap — sem paginacao
c781909  fix: assets renomeados com nome do modelo — sem arquivos genericos
b5c41d2  feat: cadeira-axis com render-01.webp 2048px no carrossel
16511f3  refactor: assets organizados por pasta + cadeira-axis adicionada
935758a  feat: renders 2048px WebP da fonte original 3000px — qualidade maxima
2f89db9  fix: qualidade das renders aumentada para 90 no next/image
ca8968e  feat: carrossel de assets 3D + remove tag duplicada no viewer
```

---

## v0.2.0 — 2026-09-12 · Portfolio, Keywords Wall, Assets 3D (base)

### Adicionado
- `ProjectScrollSection.tsx` — scroll horizontal GSAP com 5 projetos, `getDistance()` dinâmico
- `KeywordsWall` — estilo elephant skin com `cls: 'bold' | 'italic'`
- `AssetsSection.tsx` (versão inicial) — viewer Three.js + Cadeira Raia
- `AssetViewer.tsx` — Three.js + DracoLoader + OrbitControls autoRotate

### Commits
```
afd5697  feat: aspect-ratio 3/4 portrait no asset card
b07d751  fix: mobile asset card usa 4/3 em vez de 3/4
0bb4c0b  fix: mobile asset card 3/4 portrait — cadeira nao cortada
7b7dc6b  fix: limitar grid de assets a 960px para caber em 100% zoom
39ca4e8  redesign AssetsSection: viewer e render alinhados, texto como overlay
```

---

## v0.1.0 — 2026-09-11 · Intro, Hero, estrutura base

### Adicionado
- Hero vídeo reencoded (`-g 15`) para scrubbing suave
- Intro: vermelho removido, tom off-white
- Estrutura base Next.js 16 + Tailwind v4 + GSAP 3.15

### Commit inicial
```
6e0da9e  chore: estado estável inicial — build zero erros
```

---

## Como adicionar um novo modelo 3D

1. Criar pasta `public/assets/3d/<slug>/`
2. Copiar GLB como `<slug>.glb`
3. Processar renders do Drive:
   ```powershell
   ffmpeg -hide_banner -nostdin -y `
     -i "G:\Meu Drive\00.Portfolio\ADM Design\Modelagem\<Modelo>\Preview\foto.jpg" `
     -vf "scale=2048:2048:flags=lanczos" `
     -c:v libwebp -qscale:v 90 -compression_level 4 `
     "D:\Ameno\ameno-studio\public\assets\3d\<slug>\<slug>-render-01.webp"
   ```
4. Adicionar bloco no array `ASSETS` em `src/components/portfolio/AssetsSection.tsx`
5. `npm run build` → commit → push
