/**
 * Interactive guitar anatomy diagram.
 *
 * Renders a simplified silhouette (acoustic or electric) with clickable
 * hotspots over each labeled part. Clicking a part reveals its name and
 * description in a card below the diagram.
 *
 * Embed in markdown via:
 *
 *   ```guitar-anatomy
 *   { "variant": "acoustic" }
 *   ```
 */

import { useState } from 'react'

type Variant = 'acoustic' | 'electric'

type HotspotShape =
  | { kind: 'rect';   x: number; y: number; w: number; h: number }
  | { kind: 'circle'; cx: number; cy: number; r: number }

type Hotspot = {
  id: string
  label: string
  description: string
  shape: HotspotShape
}

export type GuitarDiagramProps = {
  variant: Variant
}

// ---------- Color tokens ----------
const WOOD = '#7A4F12'         // body wood
const WOOD_LIGHT = '#D4A23E'   // highlights / fretboard
const FRET_WIRE = '#FAF6EE'
const NUT = '#FAF6EE'
const STRING = '#C9962B'
const PICKUP = '#1A1A1A'
const PICKGUARD = '#0A0A0A'
const KNOB = '#FAF6EE'
const HIGHLIGHT = '#E25C2B'

// ---------- Acoustic geometry ----------
const ACOUSTIC = {
  viewBox: '0 0 320 820',
  // Body silhouette (figure-8 dreadnought-ish)
  bodyPath: `
    M 100 360
    C 60 360, 28 400, 30 460
    C 32 510, 70 530, 110 528
    C 120 555, 100 580, 90 600
    C 60 640, 20 670, 24 720
    C 30 770, 90 800, 160 805
    C 230 800, 290 770, 296 720
    C 300 670, 260 640, 230 600
    C 220 580, 200 555, 210 528
    C 250 530, 288 510, 290 460
    C 292 400, 260 360, 220 360
    Z
  `,
  hotspots: [
    { id: 'headstock',     label: 'Headstock',                     description: 'The widened top of the guitar that holds the tuning machines. The brand logo usually lives here, and the shape is often a maker\'s signature.',
      shape: { kind: 'rect', x: 90, y: 8, w: 140, h: 78 } },
    { id: 'tuners',        label: 'Tuning machines (tuners / pegs)', description: 'Geared mechanisms that wind each string. Turning them raises or lowers a string\'s pitch — that\'s how you tune.',
      shape: { kind: 'rect', x: 78, y: 14, w: 28, h: 80 } },
    { id: 'nut',           label: 'Nut',                            description: 'A grooved strip (usually bone, brass, or synthetic) where the strings transition from the headstock onto the fretboard. The nut sets the position of every open string.',
      shape: { kind: 'rect', x: 134, y: 88, w: 52, h: 8 } },
    { id: 'fretboard',     label: 'Fretboard',                      description: 'The smooth wooden surface along the neck where you press the strings. Common woods: rosewood, ebony, maple. Frets divide it into half-steps.',
      shape: { kind: 'rect', x: 138, y: 96, w: 44, h: 250 } },
    { id: 'frets',         label: 'Frets',                          description: 'Metal wires across the fretboard. Pressing just behind a fret shortens the string\'s vibrating length, raising its pitch by a half-step per fret.',
      shape: { kind: 'rect', x: 138, y: 110, w: 44, h: 230 } },
    { id: 'position',      label: 'Position markers (inlays)',      description: 'Dots or shapes on the fretboard at frets 3, 5, 7, 9, and 12. They help you find your place without counting frets.',
      shape: { kind: 'circle', cx: 160, cy: 220, r: 10 } },
    { id: 'neck',          label: 'Neck',                           description: 'The long piece of wood between the headstock and body. Inside runs the truss rod, an adjustable steel rod that controls neck curvature.',
      shape: { kind: 'rect', x: 138, y: 100, w: 44, h: 250 } },
    { id: 'heel',          label: 'Heel',                           description: 'The block where the neck joins the body. The heel\'s shape determines how easy it is to play higher frets.',
      shape: { kind: 'rect', x: 130, y: 348, w: 60, h: 20 } },
    { id: 'soundhole',     label: 'Soundhole',                      description: 'The opening in the body that lets sound from the vibrating top escape. Its size, placement, and shape all affect tone — most acoustics use a single round soundhole.',
      shape: { kind: 'circle', cx: 160, cy: 470, r: 38 } },
    { id: 'rosette',       label: 'Rosette',                        description: 'The decorative ring around the soundhole. Originally structural reinforcement; now mostly aesthetic — a classic place for inlay artistry.',
      shape: { kind: 'circle', cx: 160, cy: 470, r: 48 } },
    { id: 'top',           label: 'Top (soundboard)',               description: 'The front face of the body. The most acoustically important piece on the guitar — usually spruce or cedar — it vibrates with the strings to project sound.',
      shape: { kind: 'rect', x: 30, y: 400, w: 260, h: 100 } },
    { id: 'upper-bout',    label: 'Upper bout',                     description: 'The smaller curve of the body near the neck. Its shape contributes to balance and how the guitar sits against your body.',
      shape: { kind: 'rect', x: 28, y: 360, w: 264, h: 130 } },
    { id: 'waist',         label: 'Waist',                          description: 'The narrow midsection. The waist is where the guitar rests on your leg when seated — and it shapes the body\'s acoustic response.',
      shape: { kind: 'rect', x: 78, y: 510, w: 164, h: 70 } },
    { id: 'lower-bout',    label: 'Lower bout',                     description: 'The larger curve below the waist. Most of the soundboard area lives here, which is why dreadnoughts (with bigger lower bouts) have such bass response.',
      shape: { kind: 'rect', x: 20, y: 580, w: 280, h: 220 } },
    { id: 'bridge',        label: 'Bridge',                         description: 'The wooden plate glued to the top that anchors the strings. The string vibration transmits through the bridge into the top to make sound.',
      shape: { kind: 'rect', x: 110, y: 645, w: 100, h: 22 } },
    { id: 'saddle',        label: 'Saddle',                         description: 'The strip on top of the bridge that the strings pass over. Like the nut, it sets string height and is shaped to fine-tune intonation.',
      shape: { kind: 'rect', x: 110, y: 643, w: 100, h: 4 } },
    { id: 'bridge-pins',   label: 'Bridge pins',                    description: 'The small pegs that hold the string ends into the bridge. Pull them with a string winder when changing strings.',
      shape: { kind: 'rect', x: 128, y: 654, w: 64, h: 10 } },
    { id: 'strings',       label: 'Strings',                        description: 'Six metal strings (steel for acoustic, nylon for classical). From low to high: E, A, D, G, B, E. Lighter gauges feel softer; heavier gauges have more tone and tension.',
      shape: { kind: 'rect', x: 138, y: 100, w: 44, h: 560 } },
  ] as Hotspot[],
}

// ---------- Electric geometry (Strat-ish double-cutaway) ----------
const ELECTRIC = {
  viewBox: '0 0 320 820',
  bodyPath: `
    M 90 370
    C 50 370, 28 390, 30 430
    C 32 470, 70 480, 90 480
    L 90 510
    C 70 520, 35 545, 28 600
    C 25 670, 60 740, 130 770
    L 190 770
    C 260 740, 295 670, 292 600
    C 285 545, 250 520, 230 510
    L 230 480
    C 250 480, 288 470, 290 430
    C 292 390, 270 370, 230 370
    Z
  `,
  hotspots: [
    { id: 'headstock',     label: 'Headstock',                     description: 'The widened top of the guitar that holds six tuning machines. Electric guitars often use 6-in-line layouts (Fender) or 3+3 (Gibson).',
      shape: { kind: 'rect', x: 90, y: 8, w: 140, h: 78 } },
    { id: 'tuners',        label: 'Tuning machines',                description: 'Geared mechanisms that adjust string tension and pitch. Locking tuners hold strings without needing wraps.',
      shape: { kind: 'rect', x: 78, y: 14, w: 28, h: 80 } },
    { id: 'nut',           label: 'Nut',                            description: 'Sits at the start of the fretboard. On an electric, often graphite or synthetic for smoother bend response.',
      shape: { kind: 'rect', x: 134, y: 88, w: 52, h: 8 } },
    { id: 'fretboard',     label: 'Fretboard',                      description: 'The wood surface where you fret notes. Usually rosewood, maple, or ebony. The radius (curvature across) affects how chords vs. lead playing feel.',
      shape: { kind: 'rect', x: 138, y: 96, w: 44, h: 260 } },
    { id: 'frets',         label: 'Frets',                          description: 'Metal wires set into the fretboard. Bigger ("jumbo") frets favor lead playing and bends; smaller frets feel more controlled for chords.',
      shape: { kind: 'rect', x: 138, y: 110, w: 44, h: 240 } },
    { id: 'position',      label: 'Position markers',               description: 'Inlays at frets 3, 5, 7, 9, 12 (and beyond). On most electrics also visible from the side of the neck.',
      shape: { kind: 'circle', cx: 160, cy: 220, r: 10 } },
    { id: 'neck',          label: 'Neck',                           description: 'The long piece you grip. Bolted on (Fender) or set/glued (Gibson) — both yield distinct feel and tone characteristics.',
      shape: { kind: 'rect', x: 138, y: 100, w: 44, h: 260 } },
    { id: 'cutaways',      label: 'Cutaways',                       description: 'The horns at the upper body that scoop away wood near the neck joint, giving you access to the highest frets. Most modern electrics have two (double-cutaway).',
      shape: { kind: 'rect', x: 28, y: 370, w: 264, h: 110 } },
    { id: 'pickup-neck',   label: 'Neck pickup',                    description: 'Magnetic transducer near the neck. Captures string vibration where the swing is widest — produces a warm, full tone.',
      shape: { kind: 'rect', x: 130, y: 540, w: 60, h: 14 } },
    { id: 'pickup-middle', label: 'Middle pickup',                  description: 'Sits between neck and bridge. On a Strat, gives you the famous "quack" when combined with the neck or bridge pickup.',
      shape: { kind: 'rect', x: 130, y: 580, w: 60, h: 14 } },
    { id: 'pickup-bridge', label: 'Bridge pickup',                  description: 'Magnetic pickup near the bridge. Captures the brighter, sharper end of the string\'s vibration — bright, cutting, punchy.',
      shape: { kind: 'rect', x: 130, y: 620, w: 60, h: 14 } },
    { id: 'selector',      label: 'Pickup selector',                description: 'A switch that chooses which pickup(s) the signal comes from. Five-way (Strat) or three-way (Tele/Les Paul) are most common.',
      shape: { kind: 'rect', x: 80, y: 580, w: 24, h: 38 } },
    { id: 'volume',        label: 'Volume knob',                    description: 'Controls how much of the signal makes it to the output. Small volume changes can dramatically alter the tone of a hot pickup.',
      shape: { kind: 'circle', cx: 230, cy: 600, r: 12 } },
    { id: 'tone',          label: 'Tone knob',                      description: 'Cuts treble. Lower the tone knob and the sound mellows; turn it up and you get full brightness from the pickups.',
      shape: { kind: 'circle', cx: 230, cy: 640, r: 12 } },
    { id: 'bridge',        label: 'Bridge / tremolo',               description: 'Anchors the strings at the body end. A fixed bridge is solid; a tremolo bridge (with a "whammy" arm) lets you bend pitches by physically flexing the strings.',
      shape: { kind: 'rect', x: 130, y: 670, w: 60, h: 24 } },
    { id: 'jack',          label: 'Output jack',                    description: 'Where the cable plugs in. The signal travels from here to your amp or interface.',
      shape: { kind: 'circle', cx: 285, cy: 695, r: 8 } },
    { id: 'strap-button',  label: 'Strap button',                   description: 'Small post that the strap clips onto. Most guitars have two — one at the heel, one at the bottom edge of the body.',
      shape: { kind: 'circle', cx: 30, cy: 600, r: 6 } },
    { id: 'strings',       label: 'Strings',                        description: 'Six metal strings, usually nickel-wound steel for electric. Lighter gauges (.009-.042) bend easily; heavier (.011+) have more sustain and tone.',
      shape: { kind: 'rect', x: 138, y: 100, w: 44, h: 580 } },
  ] as Hotspot[],
}

// ---------- Component ----------
export function GuitarDiagram({ variant }: GuitarDiagramProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const cfg = variant === 'electric' ? ELECTRIC : ACOUSTIC
  const selected = cfg.hotspots.find(h => h.id === selectedId) ?? null

  return (
    <div className="my-8">
      <div className="text-[10px] uppercase tracking-[0.28em] text-gold-500 mb-3 text-center">
        {variant === 'acoustic' ? 'Acoustic anatomy' : 'Electric anatomy'} · Tap any part
      </div>
      <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
        <div className="w-full md:w-[55%] mx-auto" style={{ maxWidth: 380 }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox={cfg.viewBox}
            width="100%"
            style={{ display: 'block' }}
            role="img"
            aria-label={`${variant} guitar anatomy`}
          >
            {/* Headstock */}
            <path
              d="M 96 12 L 224 12 L 230 88 L 90 88 Z"
              fill={WOOD} stroke={WOOD_LIGHT} strokeWidth={0.6}
            />
            {/* Tuners (6 circles, 3 per side) */}
            {[
              [98, 22], [98, 50], [98, 78],
              [222, 22], [222, 50], [222, 78],
            ].map(([cx, cy], i) => (
              <circle key={i} cx={cx} cy={cy} r={6} fill={WOOD_LIGHT} stroke={WOOD} strokeWidth={0.6} />
            ))}

            {/* Nut */}
            <rect x={134} y={88} width={52} height={8} fill={NUT} />

            {/* Fretboard */}
            <rect
              x={138} y={96}
              width={44}
              height={variant === 'electric' ? 260 : 250}
              fill="#1c1610" stroke={WOOD_LIGHT} strokeWidth={0.6}
            />

            {/* Frets */}
            {[120, 144, 170, 198, 228, 260, 294, 330].map((y, i) => (
              <line key={i} x1={138} y1={y} x2={182} y2={y} stroke={FRET_WIRE} strokeWidth={1.2} />
            ))}

            {/* Position markers */}
            {[178, 220, 248, 282, 316].map((y, i) => (
              <circle key={i} cx={160} cy={y} r={2.5} fill={WOOD_LIGHT} />
            ))}

            {/* Body */}
            <path d={cfg.bodyPath} fill={WOOD} stroke={WOOD_LIGHT} strokeWidth={0.7} />

            {/* Body fixtures */}
            {variant === 'acoustic' ? (
              <>
                {/* Soundhole + rosette rings */}
                <circle cx={160} cy={470} r={48} fill="none" stroke={WOOD_LIGHT} strokeWidth={0.4} opacity={0.6} />
                <circle cx={160} cy={470} r={42} fill="none" stroke={WOOD_LIGHT} strokeWidth={0.6} />
                <circle cx={160} cy={470} r={38} fill="#000" stroke={WOOD_LIGHT} strokeWidth={0.8} />
                {/* Bridge */}
                <rect x={110} y={648} width={100} height={18} fill="#1c1610" stroke={WOOD_LIGHT} strokeWidth={0.5} />
                {/* Saddle */}
                <rect x={114} y={650} width={92} height={3} fill={NUT} />
                {/* Bridge pins */}
                {[131, 144, 157, 170, 183, 196].map((x, i) => (
                  <circle key={i} cx={x} cy={660} r={2} fill={NUT} />
                ))}
              </>
            ) : (
              <>
                {/* Pickguard suggestion (subtle) */}
                <rect x={94} y={500} width={134} height={180} fill={PICKGUARD} opacity={0.6} rx={20} />
                {/* Pickups */}
                <rect x={130} y={540} width={60} height={14} fill={PICKUP} stroke={WOOD_LIGHT} strokeWidth={0.4} />
                <rect x={130} y={580} width={60} height={14} fill={PICKUP} stroke={WOOD_LIGHT} strokeWidth={0.4} />
                <rect x={130} y={620} width={60} height={14} fill={PICKUP} stroke={WOOD_LIGHT} strokeWidth={0.4} />
                {/* Selector switch */}
                <rect x={88} y={584} width={16} height={32} fill="#1c1610" stroke={WOOD_LIGHT} strokeWidth={0.4} rx={2} />
                <circle cx={96} cy={595} r={2} fill={KNOB} />
                {/* Volume + tone knobs */}
                <circle cx={230} cy={600} r={9} fill="#1c1610" stroke={WOOD_LIGHT} strokeWidth={0.4} />
                <circle cx={230} cy={600} r={4} fill={KNOB} />
                <circle cx={230} cy={640} r={9} fill="#1c1610" stroke={WOOD_LIGHT} strokeWidth={0.4} />
                <circle cx={230} cy={640} r={4} fill={KNOB} />
                {/* Bridge */}
                <rect x={130} y={670} width={60} height={20} fill="#1c1610" stroke={WOOD_LIGHT} strokeWidth={0.4} />
                {/* Saddles */}
                {[136, 146, 156, 166, 176, 186].map((x, i) => (
                  <rect key={i} x={x} y={672} width={6} height={6} fill={NUT} />
                ))}
                {/* Output jack */}
                <circle cx={285} cy={695} r={6} fill="#1c1610" stroke={WOOD_LIGHT} strokeWidth={0.4} />
                <circle cx={285} cy={695} r={2.5} fill={KNOB} />
              </>
            )}

            {/* Strings — 6 thin lines from nut to bridge area */}
            {[140, 148, 156, 164, 172, 180].map((x, i) => {
              const bridgeY = variant === 'electric' ? 680 : 654
              return (
                <line key={i} x1={x} y1={96} x2={x} y2={bridgeY} stroke={STRING} strokeWidth={0.7} opacity={0.7} />
              )
            })}

            {/* Hotspots — invisible click areas, highlight when selected */}
            {cfg.hotspots.map(h => {
              const isSelected = h.id === selectedId
              const fillOpacity = isSelected ? 0.18 : 0.0001
              const strokeOpacity = isSelected ? 1 : 0
              const fill = HIGHLIGHT
              if (h.shape.kind === 'rect') {
                return (
                  <rect
                    key={h.id}
                    x={h.shape.x} y={h.shape.y} width={h.shape.w} height={h.shape.h}
                    fill={fill} fillOpacity={fillOpacity}
                    stroke={fill} strokeOpacity={strokeOpacity} strokeWidth={1.2}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelectedId(prev => prev === h.id ? null : h.id)}
                    role="button"
                    aria-label={`Show info for ${h.label}`}
                  />
                )
              } else {
                return (
                  <circle
                    key={h.id}
                    cx={h.shape.cx} cy={h.shape.cy} r={h.shape.r}
                    fill={fill} fillOpacity={fillOpacity}
                    stroke={fill} strokeOpacity={strokeOpacity} strokeWidth={1.2}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelectedId(prev => prev === h.id ? null : h.id)}
                    role="button"
                    aria-label={`Show info for ${h.label}`}
                  />
                )
              }
            })}
          </svg>
        </div>

        {/* Info panel */}
        <div className="w-full md:w-[45%] md:sticky md:top-6">
          {selected ? (
            <div className="card is-feature" style={{ padding: '1.25rem 1.5rem' }}>
              <div className="eyebrow mb-2">{variant} · Part</div>
              <div className="font-display text-xl tracking-[0.04em] text-cream-50 mb-2">{selected.label}</div>
              <p className="text-cream-50/75 text-sm leading-relaxed">{selected.description}</p>
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="mt-4 text-[10px] uppercase tracking-[0.22em] text-gold-500 hover:text-gold-100 transition"
              >
                Close
              </button>
            </div>
          ) : (
            <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
              <div className="eyebrow mb-2">{variant} guitar</div>
              <p className="text-cream-50/65 text-sm leading-relaxed">
                Tap any part of the diagram to see its name and what it does. Most parts work the same on both acoustic and electric — the body, pickups, and bridge style are where they diverge.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
