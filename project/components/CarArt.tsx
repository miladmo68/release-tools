import type { Body } from "@/lib/types";

interface Shape { body: string; glass: string; wheels: [number, number]; pillar: number }

const SHAPES: Record<Body, Shape> = {
  sedan: { body: "M18 148 L24 124 Q30 112 70 108 L150 100 Q180 60 235 56 L305 56 Q350 60 378 98 L436 106 Q464 112 464 136 L464 148 Z", glass: "M168 98 Q192 66 238 64 L300 64 Q336 68 358 98 Z", wheels: [116, 372], pillar: 262 },
  suv: { body: "M16 148 L18 112 Q22 98 52 92 L120 86 Q132 44 190 40 L360 40 Q400 44 414 86 L448 94 Q468 100 468 126 L468 148 Z", glass: "M138 86 Q148 52 192 48 L356 48 Q388 52 400 86 Z", wheels: [116, 376], pillar: 270 },
  hatch: { body: "M24 148 L26 118 Q30 106 62 100 L128 94 Q158 52 210 48 L330 48 Q378 52 396 108 L440 112 Q460 118 460 138 L460 148 Z", glass: "M146 94 Q168 58 212 56 L326 56 Q362 62 380 100 Z", wheels: [118, 366], pillar: 262 },
  coupe: { body: "M14 148 L20 128 Q28 118 70 114 L170 106 Q210 70 262 68 L316 70 Q360 80 392 110 L440 116 Q468 122 468 140 L468 148 Z", glass: "M196 106 Q224 76 264 74 L312 76 Q344 84 368 108 Z", wheels: [112, 378], pillar: 280 },
  wagon: { body: "M16 148 L20 120 Q26 108 66 104 L140 98 Q170 58 230 54 L372 54 Q412 58 420 100 L450 108 Q470 114 470 138 L470 148 Z", glass: "M160 98 Q184 62 232 62 L368 62 Q396 66 406 98 Z", wheels: [116, 380], pillar: 296 },
  truck: { body: "M14 148 L16 110 L150 106 L166 66 Q172 50 200 48 L270 48 Q296 52 308 76 L322 106 L450 110 Q472 114 472 134 L472 148 Z", glass: "M178 104 L188 64 Q192 58 206 58 L266 58 Q282 60 290 76 L300 104 Z", wheels: [90, 380], pillar: 232 }
};

export function CarArt({ body, paint, label, className = "" }: { body: Body; paint: string; label: string; className?: string }) {
  const s = SHAPES[body];
  const uid = `${body}-${paint.replace("#", "")}`;
  return (
    <svg className={`car-art ${className}`} viewBox="0 0 488 190" role="img" aria-label={label}>
      <defs>
        <linearGradient id={`sheen-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".55" />
          <stop offset=".35" stopColor="#fff" stopOpacity=".08" />
          <stop offset=".75" stopColor="#000" stopOpacity=".1" />
          <stop offset="1" stopColor="#000" stopOpacity=".45" />
        </linearGradient>
        <linearGradient id={`glass-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2c4549" />
          <stop offset=".55" stopColor="#0b1a1c" />
          <stop offset="1" stopColor="#365257" />
        </linearGradient>
        <radialGradient id={`ground-${uid}`}>
          <stop offset="0" stopColor="#000" stopOpacity=".55" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <clipPath id={`clip-${uid}`}><path d={s.body} /></clipPath>
      </defs>
      <ellipse cx="244" cy="170" rx="224" ry="14" fill={`url(#ground-${uid})`} />
      <path d={s.body} fill={paint} />
      <g clipPath={`url(#clip-${uid})`}>
        <rect width="488" height="190" fill={`url(#sheen-${uid})`} />
        <path d="M30 124 Q240 112 462 126" fill="none" stroke="#fff" strokeOpacity=".28" strokeWidth="1.6" />
        <path d="M20 146 L470 146" stroke="#000" strokeOpacity=".25" strokeWidth="6" />
      </g>
      <path d={s.glass} fill={`url(#glass-${uid})`} />
      <path d={`M${s.pillar} ${body === "truck" ? 58 : 64} L${s.pillar} ${body === "truck" ? 104 : 98}`} stroke={paint} strokeWidth="5" />
      {s.wheels.map(cx => (
        <g key={cx}>
          <circle cx={cx} cy="148" r="38" fill="#08191b" />
          <circle cx={cx} cy="148" r="29" fill="#111" />
          <circle cx={cx} cy="148" r="19" fill="#c5ccce" />
          <circle cx={cx} cy="148" r="19" fill="none" stroke="#6b7679" strokeWidth="2" />
          {[0, 72, 144, 216, 288].map(a => (
            <line key={a} x1={cx} y1="148" x2={cx + 17 * Math.cos((a * Math.PI) / 180)} y2={148 + 17 * Math.sin((a * Math.PI) / 180)} stroke="#6b7679" strokeWidth="3" />
          ))}
          <circle cx={cx} cy="148" r="4" fill="#2b3234" />
        </g>
      ))}
      <rect x="448" y={body === "suv" || body === "truck" ? 104 : 114} width="14" height="6" rx="3" fill="#fff6c9" />
      <rect x="18" y={body === "truck" ? 114 : 122} width="8" height="5" rx="2" fill="#d33" />
    </svg>
  );
}
