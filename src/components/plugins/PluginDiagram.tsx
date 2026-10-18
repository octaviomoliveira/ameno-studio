import Image from 'next/image'

export default function PluginDiagram({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`plugin-diagram${compact ? ' plugin-diagram-compact' : ''}`}
      role="img"
      aria-label="Captura real do plugin Ameno Cotas em funcionamento no Autodesk 3ds Max 2026"
    >
      <div className="plugin-diagram-topline">
        <span>AMENO COTAS / 3DS MAX 2026</span>
        <span>CAPTURA REAL EM CENA</span>
      </div>
      <Image
        src="/images/plugins/cotas/tutorial_02_cotar_chain.png"
        alt="Ameno Cotas aberto no 3ds Max 2026 cotando marcenaria em cadeia contínua"
        width={1600}
        height={1020}
        unoptimized
        priority={!compact}
        style={{
          width: '100%',
          height: 'auto',
          display: 'block',
          border: '1px solid #262934',
        }}
      />
      <div className="plugin-diagram-footer">
        <span>LAYER: AMENO_COTAS</span>
        <span>PYSIDE6 + CORONA / V-RAY</span>
      </div>
    </div>
  )
}
