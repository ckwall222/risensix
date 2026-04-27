/**
 * Interactive guitar anatomy diagram.
 *
 * Renders a photograph of an acoustic or electric guitar with clickable
 * hotspots over each labeled part. Clicking a part reveals its name and
 * description in a card alongside the image.
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

// All hotspot coordinates are in the 768×894 photo coordinate system.
// They're rough first-pass — easy to nudge once Chris tells us where
// they read off-center on a real screen.

const ACOUSTIC: { imageSrc: string; hotspots: Hotspot[] } = {
  imageSrc: '/anatomy/acoustic.png',
  hotspots: [
    { id: 'headstock', label: 'Headstock',
      description: 'The widened top of the guitar that holds the tuning machines. The brand logo usually sits here, and the shape is often a maker\'s signature.',
      shape: { kind: 'rect', x: 290, y: 80, w: 200, h: 130 } },
    { id: 'tuners-left', label: 'Tuning machines (tuners / pegs)',
      description: 'Geared mechanisms that wind the strings. Turn them to raise or lower each string\'s pitch — that\'s how you tune.',
      shape: { kind: 'rect', x: 250, y: 100, w: 60, h: 110 } },
    { id: 'tuners-right', label: 'Tuning machines (tuners / pegs)',
      description: 'Geared mechanisms that wind the strings. Turn them to raise or lower each string\'s pitch — that\'s how you tune.',
      shape: { kind: 'rect', x: 470, y: 100, w: 60, h: 110 } },
    { id: 'nut', label: 'Nut',
      description: 'A grooved strip (usually bone, brass, or synthetic) where the strings transition from the headstock onto the fretboard. The nut sets the position of every open string.',
      shape: { kind: 'rect', x: 348, y: 220, w: 80, h: 14 } },
    { id: 'fretboard', label: 'Fretboard',
      description: 'The smooth wooden surface along the neck where you press the strings. Common woods: rosewood, ebony, maple. Frets divide it into half-steps.',
      shape: { kind: 'rect', x: 350, y: 235, w: 75, h: 320 } },
    { id: 'frets', label: 'Frets',
      description: 'Metal wires across the fretboard. Pressing just behind a fret shortens the string\'s vibrating length, raising its pitch by a half-step per fret.',
      shape: { kind: 'rect', x: 350, y: 270, w: 75, h: 280 } },
    { id: 'position', label: 'Position markers (inlays)',
      description: 'Dots or shapes on the fretboard at frets 3, 5, 7, 9, and 12. They help you find your place without counting frets.',
      shape: { kind: 'circle', cx: 388, cy: 360, r: 14 } },
    { id: 'neck', label: 'Neck',
      description: 'The long piece of wood between the headstock and body. Inside runs the truss rod — an adjustable steel rod that controls neck curvature.',
      shape: { kind: 'rect', x: 350, y: 220, w: 75, h: 360 } },
    { id: 'soundhole', label: 'Soundhole',
      description: 'The opening in the body that lets sound from the vibrating top escape. Its size, placement, and shape all affect tone — most acoustics use a single round soundhole.',
      shape: { kind: 'circle', cx: 388, cy: 670, r: 60 } },
    { id: 'rosette', label: 'Rosette',
      description: 'The decorative ring around the soundhole. Originally a structural reinforcement; now mostly aesthetic — a classic place for inlay artistry.',
      shape: { kind: 'circle', cx: 388, cy: 670, r: 75 } },
    { id: 'top', label: 'Top (soundboard)',
      description: 'The front face of the body — the most acoustically important piece on the guitar. Usually spruce or cedar; vibrates with the strings to project sound.',
      shape: { kind: 'rect', x: 180, y: 580, w: 420, h: 140 } },
    { id: 'pickguard', label: 'Pickguard',
      description: 'A protective plate (often black or tortoise-shell) glued below the soundhole. Keeps your strumming hand from gouging the soundboard.',
      shape: { kind: 'rect', x: 410, y: 690, w: 110, h: 90 } },
    { id: 'upper-bout', label: 'Upper bout',
      description: 'The smaller curve of the body near the neck. Its shape contributes to balance and how the guitar sits against your body.',
      shape: { kind: 'rect', x: 175, y: 580, w: 425, h: 100 } },
    { id: 'waist', label: 'Waist',
      description: 'The narrow midsection. The waist is where the guitar rests on your leg when seated — and it shapes the body\'s acoustic response.',
      shape: { kind: 'rect', x: 220, y: 700, w: 335, h: 60 } },
    { id: 'lower-bout', label: 'Lower bout',
      description: 'The larger curve below the waist. Most of the soundboard area lives here — which is why dreadnoughts (with bigger lower bouts) have such bass response.',
      shape: { kind: 'rect', x: 130, y: 760, w: 510, h: 130 } },
    { id: 'bridge', label: 'Bridge',
      description: 'The wooden plate glued to the top that anchors the strings. The string vibration transmits through the bridge into the top to make sound.',
      shape: { kind: 'rect', x: 300, y: 800, w: 180, h: 30 } },
    { id: 'saddle', label: 'Saddle',
      description: 'The strip on top of the bridge that the strings pass over. Like the nut, it sets string height and is shaped to fine-tune intonation.',
      shape: { kind: 'rect', x: 305, y: 798, w: 175, h: 8 } },
    { id: 'strings', label: 'Strings',
      description: 'Six metal strings (steel for acoustic, nylon for classical). From low to high: E, A, D, G, B, E. Lighter gauges feel softer; heavier gauges have more tone and tension.',
      shape: { kind: 'rect', x: 360, y: 240, w: 60, h: 560 } },
  ],
}

const ELECTRIC: { imageSrc: string; hotspots: Hotspot[] } = {
  imageSrc: '/anatomy/electric.png',
  hotspots: [
    { id: 'headstock', label: 'Headstock',
      description: 'The widened top of the guitar that holds six tuning machines. Electric guitars often use 6-in-line layouts (Fender) or 3+3 (Gibson).',
      shape: { kind: 'rect', x: 320, y: 80, w: 180, h: 160 } },
    { id: 'tuners', label: 'Tuning machines',
      description: 'Geared mechanisms that adjust string tension and pitch. Locking tuners hold strings without needing wraps.',
      shape: { kind: 'rect', x: 350, y: 100, w: 130, h: 130 } },
    { id: 'nut', label: 'Nut',
      description: 'Sits at the start of the fretboard. On an electric, often graphite or synthetic for smoother bend response.',
      shape: { kind: 'rect', x: 360, y: 240, w: 70, h: 12 } },
    { id: 'fretboard', label: 'Fretboard',
      description: 'The wood surface where you fret notes. Usually rosewood, maple, or ebony. The radius (curvature across) affects how chords vs. lead playing feel.',
      shape: { kind: 'rect', x: 360, y: 252, w: 70, h: 290 } },
    { id: 'frets', label: 'Frets',
      description: 'Metal wires set into the fretboard. Bigger ("jumbo") frets favor lead playing and bends; smaller frets feel more controlled for chords.',
      shape: { kind: 'rect', x: 360, y: 280, w: 70, h: 260 } },
    { id: 'position', label: 'Position markers',
      description: 'Inlays at frets 3, 5, 7, 9, 12 (and beyond). On most electrics also visible from the side of the neck.',
      shape: { kind: 'circle', cx: 397, cy: 380, r: 12 } },
    { id: 'neck', label: 'Neck',
      description: 'The long piece you grip. Bolted on (Fender) or set/glued (Gibson) — both yield distinct feel and tone characteristics.',
      shape: { kind: 'rect', x: 360, y: 240, w: 70, h: 300 } },
    { id: 'cutaways', label: 'Cutaways (horns)',
      description: 'The horns at the upper body that scoop away wood near the neck joint, giving you access to the highest frets. Most modern electrics have two (double-cutaway).',
      shape: { kind: 'rect', x: 200, y: 540, w: 400, h: 110 } },
    { id: 'pickguard', label: 'Pickguard',
      description: 'The white plate that holds the pickups, switches, and knobs. Removable for electronics access — and an aesthetic statement.',
      shape: { kind: 'rect', x: 240, y: 580, w: 300, h: 230 } },
    { id: 'pickup-neck', label: 'Neck pickup',
      description: 'Magnetic transducer near the neck. Captures string vibration where the swing is widest — produces a warm, full tone.',
      shape: { kind: 'rect', x: 290, y: 600, w: 130, h: 30 } },
    { id: 'pickup-middle', label: 'Middle pickup',
      description: 'Sits between neck and bridge. On a Strat, gives you the famous "quack" when combined with the neck or bridge pickup.',
      shape: { kind: 'rect', x: 290, y: 660, w: 130, h: 30 } },
    { id: 'pickup-bridge', label: 'Bridge pickup',
      description: 'Magnetic pickup near the bridge. Captures the brighter, sharper end of the string\'s vibration — bright, cutting, punchy.',
      shape: { kind: 'rect', x: 290, y: 720, w: 130, h: 30 } },
    { id: 'volume', label: 'Volume knob',
      description: 'Controls how much of the signal makes it to the output. Small volume changes can dramatically alter the tone of a hot pickup.',
      shape: { kind: 'circle', cx: 470, cy: 720, r: 25 } },
    { id: 'tone', label: 'Tone knobs',
      description: 'Cuts treble. Lower the tone knob and the sound mellows; turn it up and you get full brightness from the pickups.',
      shape: { kind: 'circle', cx: 510, cy: 760, r: 25 } },
    { id: 'bridge', label: 'Bridge / tremolo',
      description: 'Anchors the strings at the body end. A fixed bridge is solid; a tremolo bridge (with a "whammy" arm) lets you bend pitches by physically flexing the strings.',
      shape: { kind: 'rect', x: 340, y: 770, w: 130, h: 50 } },
    { id: 'jack', label: 'Output jack',
      description: 'Where the cable plugs in. The signal travels from here to your amp or interface.',
      shape: { kind: 'circle', cx: 535, cy: 815, r: 25 } },
    { id: 'strings', label: 'Strings',
      description: 'Six metal strings, usually nickel-wound steel for electric. Lighter gauges (.009–.042) bend easily; heavier (.011+) have more sustain and tone.',
      shape: { kind: 'rect', x: 360, y: 250, w: 70, h: 540 } },
  ],
}

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
        <div className="w-full md:w-[55%] mx-auto" style={{ maxWidth: 480 }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 768 894"
            width="100%"
            style={{ display: 'block', backgroundColor: '#000' }}
            role="img"
            aria-label={`${variant} guitar anatomy`}
          >
            {/* Photograph as base layer */}
            <image
              href={cfg.imageSrc}
              x={0} y={0} width={768} height={894}
              preserveAspectRatio="xMidYMid meet"
            />

            {/* Hotspots — invisible click areas, highlight when selected */}
            {cfg.hotspots.map(h => {
              const isSelected = h.id === selectedId
              const fillOpacity = isSelected ? 0.28 : 0.0001
              const strokeOpacity = isSelected ? 1 : 0
              const fill = '#E25C2B'
              const handler = () => setSelectedId(prev => prev === h.id ? null : h.id)
              if (h.shape.kind === 'rect') {
                return (
                  <rect
                    key={h.id}
                    x={h.shape.x} y={h.shape.y} width={h.shape.w} height={h.shape.h}
                    fill={fill} fillOpacity={fillOpacity}
                    stroke={fill} strokeOpacity={strokeOpacity} strokeWidth={2.5}
                    style={{ cursor: 'pointer' }}
                    onClick={handler}
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
                    stroke={fill} strokeOpacity={strokeOpacity} strokeWidth={2.5}
                    style={{ cursor: 'pointer' }}
                    onClick={handler}
                    role="button"
                    aria-label={`Show info for ${h.label}`}
                  />
                )
              }
            })}
          </svg>
        </div>

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
                Tap any part of the photo to see its name and what it does. Most parts work the same on both acoustic and electric — the body, pickups, and bridge style are where they diverge.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
