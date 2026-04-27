import ReactMarkdown, { Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Fretboard } from './Fretboard'
import { ChordDiagram } from './ChordDiagram'
import { CircleOfFifths } from './CircleOfFifths'
import { GuitarDiagram } from './GuitarDiagram'

const components: Components = {
  code({ className, children, node: _node, ref: _ref, ...rest }) {
    const lang = (className ?? '').replace('language-', '')
    const raw = String(children).trim()

    if (lang === 'fretboard') {
      try {
        const data = JSON.parse(raw)
        return <Fretboard {...data} />
      } catch (e) {
        return (
          <pre className="diagram-error">
            Invalid <code>fretboard</code> JSON: {(e as Error).message}
          </pre>
        )
      }
    }
    if (lang === 'chord') {
      try {
        const data = JSON.parse(raw)
        return <ChordDiagram {...data} />
      } catch (e) {
        return (
          <pre className="diagram-error">
            Invalid <code>chord</code> JSON: {(e as Error).message}
          </pre>
        )
      }
    }
    if (lang === 'cof') {
      try {
        const data = JSON.parse(raw)
        return <CircleOfFifths {...data} />
      } catch (e) {
        return (
          <pre className="diagram-error">
            Invalid <code>cof</code> JSON: {(e as Error).message}
          </pre>
        )
      }
    }
    if (lang === 'guitar-anatomy') {
      try {
        const data = JSON.parse(raw)
        return <GuitarDiagram {...data} />
      } catch (e) {
        return (
          <pre className="diagram-error">
            Invalid <code>guitar-anatomy</code> JSON: {(e as Error).message}
          </pre>
        )
      }
    }
    return <code className={className} {...rest}>{children}</code>
  },
}

export function Markdown({ children }: { children: string }) {
  return (
    <div className="prose-rs">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  )
}
