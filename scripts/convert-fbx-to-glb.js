#!/usr/bin/env node
/**
 * Converte arquivos .fbx para .glb com compressão Draco
 * Uso: node scripts/convert-fbx-to-glb.js caminho/arquivo.fbx
 *
 * Requer: npm install -D @gltf-transform/core @gltf-transform/extensions @gltf-transform/functions draco3dgltf
 * Instale com: npm install -D @gltf-transform/core @gltf-transform/extensions @gltf-transform/functions draco3dgltf
 *
 * NOTA: A conversão de .fbx → .gltf requer Blender (via CLI) ou
 * uma ferramenta separada. Este script assume que você já tem
 * um arquivo .gltf ou .glb e quer só aplicar a compressão Draco.
 *
 * Para converter .fbx → .glb em lote, use Blender:
 *   blender --background --python scripts/fbx_to_glb.py -- input.fbx output.glb
 *
 * Ou use o site: https://products.aspose.app/3d/conversion/fbx-to-glb
 */

const path = require('path')
const fs   = require('fs')

async function main() {
  const inputFile = process.argv[2]
  if (!inputFile) {
    console.error('Uso: node scripts/convert-fbx-to-glb.js arquivo.glb')
    console.error('')
    console.error('Para converter .fbx → .glb primeiro, use uma das opções:')
    console.error('  1. Blender: File > Export > glTF 2.0')
    console.error('  2. Online: https://products.aspose.app/3d/conversion/fbx-to-glb')
    console.error('  3. Instale o Blender e use o script fbx_to_glb.py')
    process.exit(1)
  }

  const ext = path.extname(inputFile).toLowerCase()
  if (ext === '.fbx') {
    console.log(`
Arquivo .fbx detectado: ${inputFile}

Para converter .fbx → .glb:
  Opção 1 (Blender):
    1. Abra o Blender
    2. File → Import → FBX → selecione o arquivo
    3. File → Export → glTF 2.0
    4. Marque "Draco mesh compression"
    5. Salve em public/assets/3d/

  Opção 2 (Online, rápido):
    https://products.aspose.app/3d/conversion/fbx-to-glb
    Depois use este script com o .glb resultante para verificar o tamanho.

  Opção 3 (npm):
    npm install -g @gltf-transform/cli
    gltf-transform optimize input.glb output.glb --compress draco
`)
    process.exit(0)
  }

  // Se já é .glb ou .gltf, aplica Draco
  try {
    const { NodeIO } = await import('@gltf-transform/core')
    const { draco }  = await import('@gltf-transform/functions')

    const io = new NodeIO()
    const document = await io.read(inputFile)

    await document.transform(draco({ method: 'edgebreaker' }))

    const outputFile = inputFile.replace(/\.(glb|gltf)$/i, '.compressed.glb')
    await io.write(outputFile, document)

    const originalSize  = fs.statSync(inputFile).size
    const compressedSize = fs.statSync(outputFile).size
    const reduction = ((1 - compressedSize / originalSize) * 100).toFixed(1)

    console.log(`✅ Compressão aplicada:`)
    console.log(`   Original:   ${(originalSize / 1024).toFixed(0)} KB`)
    console.log(`   Comprimido: ${(compressedSize / 1024).toFixed(0)} KB (${reduction}% menor)`)
    console.log(`   Saída: ${outputFile}`)
  } catch {
    console.error('Instale as dependências: npm install -D @gltf-transform/core @gltf-transform/functions')
    console.error('Ou use o Blender para exportar com Draco ativado diretamente.')
  }
}

main()
