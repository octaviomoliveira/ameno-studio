export default function PluginDiagram({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`plugin-diagram${compact ? ' plugin-diagram-compact' : ''}`} aria-label="Esquema demonstrativo do Ameno Cotas">
      <div className="plugin-diagram-topline">
        <span>AMENO COTAS / 001</span>
        <span>3DS MAX TOOL</span>
      </div>
      <svg viewBox="0 0 720 560" aria-hidden="true">
        <defs>
          <pattern id="plugin-grid" width="36" height="36" patternUnits="userSpaceOnUse">
            <path d="M 36 0 L 0 0 0 36" fill="none" stroke="rgba(232,232,224,0.1)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="720" height="560" fill="url(#plugin-grid)" />
        <g fill="none" stroke="rgba(232,232,224,0.8)" strokeWidth="2">
          <path d="M120 410 L260 180 L490 180 L600 410 Z" />
          <path d="M260 180 V410 M490 180 V410 M120 410 H600" opacity="0.35" />
          <path d="M260 180 L350 108 L490 180" opacity="0.7" />
        </g>
        <g fill="none" stroke="#E63B2E" strokeWidth="1.5">
          <path d="M120 454 H600" />
          <path d="M120 444 V464 M600 444 V464" />
          <path d="M80 180 V410" />
          <path d="M70 180 H90 M70 410 H90" />
        </g>
        <g fill="#E63B2E" fontFamily="monospace" fontSize="14" letterSpacing="2">
          <text x="336" y="482">4.80m</text>
          <text x="30" y="305" transform="rotate(-90 30 305)">2.80m</text>
        </g>
        <circle cx="350" cy="108" r="5" fill="#E63B2E" />
      </svg>
      <div className="plugin-diagram-footer">
        <span>DIMENSION / LAYER</span>
        <span>RENDER INTEGRATED</span>
      </div>
    </div>
  )
}
