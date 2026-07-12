import { ViewState, Point } from './types';

/**
 * Converts screen coordinates to world coordinates based on the current view state and canvas bounds.
 */
export function screenToWorld(screenX: number, screenY: number, view: ViewState, canvasRect: { left: number, top: number }): Point {
    return {
        x: (screenX - canvasRect.left - view.x) / view.scale,
        y: (screenY - canvasRect.top - view.y) / view.scale
    };
}

/**
 * Returns the SVG string for the brain connectome visualization.
 */
export function getBrainSvgHTML(): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 920 350" width="100%" height="100%" style="pointer-events:none;display:block;">
  <!-- Background -->
  <rect width="920" height="350" rx="18" fill="#0d1117" opacity="0.85"/>

  <!-- Brain outline left hemisphere -->
  <path d="M200 260 Q120 240 100 190 Q80 140 130 105 Q160 85 195 90 Q185 70 210 60 Q240 48 265 65 Q280 40 310 38 Q345 35 360 60 Q375 45 400 48 Q420 50 430 70 Q440 55 460 55 Q480 55 490 72 Q500 60 520 62 Q540 65 545 85 Q565 75 580 90 Q600 105 595 130 Q620 140 630 170 Q640 200 615 225 Q590 250 555 255 Q540 275 510 275 Q490 280 470 265 Q450 280 420 278 Q395 280 375 262 Q350 280 320 278 Q295 280 275 265 Q250 280 220 270 Z"
    fill="none" stroke="#7b68ee" stroke-width="2" opacity="0.7"/>

  <!-- Brain fissures -->
  <path d="M310 38 Q315 80 300 120 Q290 150 305 190 Q315 220 300 260" fill="none" stroke="#7b68ee" stroke-width="1.2" opacity="0.5" stroke-dasharray="4,3"/>
  <path d="M400 48 Q395 90 410 130 Q425 170 405 210 Q390 240 400 270" fill="none" stroke="#7b68ee" stroke-width="1.2" opacity="0.5" stroke-dasharray="4,3"/>
  <path d="M490 72 Q480 110 495 150 Q510 185 495 225 Q485 250 490 275" fill="none" stroke="#7b68ee" stroke-width="1.2" opacity="0.5" stroke-dasharray="4,3"/>

  <!-- Connectome nodes -->
  <circle cx="200" cy="140" r="7" fill="#7b68ee" opacity="0.9"/>
  <circle cx="260" cy="100" r="6" fill="#5a9bd5" opacity="0.9"/>
  <circle cx="320" cy="130" r="8" fill="#7b68ee" opacity="0.9"/>
  <circle cx="380" cy="90" r="6" fill="#20c997" opacity="0.9"/>
  <circle cx="440" cy="120" r="9" fill="#5a9bd5" opacity="0.9"/>
  <circle cx="500" cy="95" r="6" fill="#7b68ee" opacity="0.9"/>
  <circle cx="560" cy="130" r="7" fill="#20c997" opacity="0.9"/>
  <circle cx="610" cy="180" r="8" fill="#5a9bd5" opacity="0.9"/>
  <circle cx="320" cy="220" r="6" fill="#20c997" opacity="0.9"/>
  <circle cx="440" cy="240" r="7" fill="#7b68ee" opacity="0.9"/>
  <circle cx="560" cy="210" r="6" fill="#5a9bd5" opacity="0.9"/>
  <circle cx="230" cy="210" r="5" fill="#5a9bd5" opacity="0.8"/>

  <!-- Connectome edges -->
  <line x1="200" y1="140" x2="260" y2="100" stroke="#7b68ee" stroke-width="1" opacity="0.5"/>
  <line x1="260" y1="100" x2="320" y2="130" stroke="#5a9bd5" stroke-width="1" opacity="0.5"/>
  <line x1="320" y1="130" x2="380" y2="90" stroke="#20c997" stroke-width="1" opacity="0.5"/>
  <line x1="380" y1="90" x2="440" y2="120" stroke="#7b68ee" stroke-width="1" opacity="0.5"/>
  <line x1="440" y1="120" x2="500" y2="95" stroke="#5a9bd5" stroke-width="1" opacity="0.5"/>
  <line x1="500" y1="95" x2="560" y2="130" stroke="#7b68ee" stroke-width="1" opacity="0.5"/>
  <line x1="560" y1="130" x2="610" y2="180" stroke="#20c997" stroke-width="1" opacity="0.5"/>
  <line x1="320" y1="130" x2="320" y2="220" stroke="#7b68ee" stroke-width="1" opacity="0.4"/>
  <line x1="440" y1="120" x2="440" y2="240" stroke="#5a9bd5" stroke-width="1" opacity="0.4"/>
  <line x1="560" y1="130" x2="560" y2="210" stroke="#20c997" stroke-width="1" opacity="0.4"/>
  <line x1="200" y1="140" x2="230" y2="210" stroke="#5a9bd5" stroke-width="1" opacity="0.4"/>
  <line x1="320" y1="220" x2="440" y2="240" stroke="#7b68ee" stroke-width="1" opacity="0.4"/>
  <line x1="440" y1="240" x2="560" y2="210" stroke="#5a9bd5" stroke-width="1" opacity="0.4"/>
  <line x1="610" y1="180" x2="560" y2="210" stroke="#20c997" stroke-width="1" opacity="0.4"/>

  <!-- Labels -->
  <text x="460" y="320" text-anchor="middle" fill="#7b68ee" font-size="13" font-family="Inter, sans-serif" opacity="0.9" font-weight="600">Brain Connectome — Neural Pathway Visualization</text>
  <text x="460" y="338" text-anchor="middle" fill="#aaa" font-size="10" font-family="Inter, sans-serif" opacity="0.7">Greenhouse Mental Health Research Platform</text>
</svg>`;
}

/**
 * Returns the SVG string for the SORREL ring visualization.
 */
export function getSorrelRingSvgHTML(): string {
    const phases = [
        { label: 'Specify',   angle: -90,  color: '#7b68ee' },
        { label: 'Observe',   angle: -30,  color: '#5a9bd5' },
        { label: 'Research',  angle:  30,  color: '#20c997' },
        { label: 'Refine',    angle:  90,  color: '#f0a500' },
        { label: 'Execute',   angle: 150,  color: '#e05a4e' },
        { label: 'Learn',     angle: 210,  color: '#c084fc' }
    ];
    const cx = 200, cy = 200, r = 140, nr = 18;
    const toRad = (d: number) => d * Math.PI / 180;
    let circles = '', labels = '', lines = '';
    phases.forEach((p, i) => {
        const x = cx + r * Math.cos(toRad(p.angle));
        const y = cy + r * Math.sin(toRad(p.angle));
        const next = phases[(i + 1) % phases.length];
        const nx = cx + r * Math.cos(toRad(next.angle));
        const ny = cy + r * Math.sin(toRad(next.angle));
        lines   += `<line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${nx.toFixed(1)}" y2="${ny.toFixed(1)}" stroke="${p.color}" stroke-width="1.5" opacity="0.5"/>`;
        circles += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${nr}" fill="${p.color}" opacity="0.85"/>`;
        const lx = cx + (r + 30) * Math.cos(toRad(p.angle));
        const ly = cy + (r + 30) * Math.sin(toRad(p.angle));
        labels  += `<text x="${lx.toFixed(1)}" y="${(ly + 4).toFixed(1)}" text-anchor="middle" fill="#eee" font-size="11" font-family="Inter,sans-serif" font-weight="600">${p.label}</text>`;
    });
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%" style="pointer-events:none;display:block;">
  <rect width="400" height="400" rx="200" fill="#0d1117" opacity="0.8"/>
  <circle cx="${cx}" cy="${cy}" r="${r + nr + 40}" fill="none" stroke="#7b68ee" stroke-width="1" opacity="0.2" stroke-dasharray="6,4"/>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#7b68ee" stroke-width="0.5" opacity="0.15"/>
  ${lines}
  ${circles}
  ${labels}
  <text x="${cx}" y="${cy - 10}" text-anchor="middle" fill="#fff" font-size="13" font-family="Inter,sans-serif" font-weight="700">SORREL</text>
  <text x="${cx}" y="${cy + 10}" text-anchor="middle" fill="#aaa" font-size="10" font-family="Inter,sans-serif">SDD Cycle</text>
</svg>`;
}
