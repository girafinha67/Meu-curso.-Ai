import { Info, Lightbulb, AlertTriangle, CheckCircle2, ImageIcon, ArrowRight } from 'lucide-react'
import { useSiteSetting } from '@/hooks/use-site-settings'
import { cn } from '@/lib/utils'
import type { LessonBlock } from '@/types/database'

const calloutStyles: Record<string, { icon: typeof Info; className: string }> = {
  info: { icon: Info, className: 'bg-primary-50 border-primary-200 text-primary-900' },
  tip: { icon: Lightbulb, className: 'bg-amber-50 border-amber-200 text-amber-900' },
  warning: { icon: AlertTriangle, className: 'bg-orange-50 border-orange-200 text-orange-900' },
  success: { icon: CheckCircle2, className: 'bg-green-50 border-green-200 text-green-900' },
}

export function LessonBlockRenderer({ block }: { block: LessonBlock }) {
  const c = block.content as any

  switch (block.type) {
    case 'heading':
      return <h2 className="mt-8 text-xl font-bold tracking-tight first:mt-0">{c.text}</h2>

    case 'paragraph':
      return <MarkdownParagraph text={c.text} />

    case 'callout': {
      const style = calloutStyles[c.variant] ?? calloutStyles.info
      const Icon = style.icon
      return (
        <div className={cn('flex gap-3 rounded-2xl border p-4', style.className)}>
          <Icon className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            {c.title && <p className="font-semibold">{c.title}</p>}
            <p className="mt-0.5 text-sm">{c.text}</p>
          </div>
        </div>
      )
    }

    case 'example':
      return (
        <div className="rounded-2xl border border-border bg-muted/40 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary-700">{c.title ?? 'Exemplo'}</p>
          <p className="mt-2 text-sm text-foreground">{c.text}</p>
        </div>
      )

    case 'cards':
      return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {c.items?.map((item: any, i: number) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-5">
              <p className="font-semibold">{item.title}</p>
              <p className="mt-1.5 text-sm text-muted-foreground">{item.text}</p>
            </div>
          ))}
        </div>
      )

    case 'comparison':
      return (
        <div>
          {c.title && <p className="mb-3 text-sm font-semibold text-muted-foreground">{c.title}</p>}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-2xl border-2 border-red-200 bg-red-50/50 p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-danger">{c.left?.title}</p>
              <p className="mt-2 whitespace-pre-line text-sm">{c.left?.text}</p>
            </div>
            <div className="rounded-2xl border-2 border-green-200 bg-green-50/50 p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-success">{c.right?.title}</p>
              <p className="mt-2 whitespace-pre-line text-sm">{c.right?.text}</p>
            </div>
          </div>
        </div>
      )

    case 'list':
      return <ListBlock content={c} />

    case 'checklist':
      return (
        <div className="rounded-2xl border border-border p-5">
          {c.title && <p className="mb-3 font-semibold">{c.title}</p>}
          <ul className="flex flex-col gap-2">
            {c.items?.map((item: string, i: number) => (
              <li key={i} className="flex items-start gap-2.5 text-sm">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border border-border" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )

    case 'steps':
      return (
        <div className="flex flex-col gap-3">
          {c.items?.map((item: any, i: number) => (
            <div key={i} className="flex gap-4 rounded-2xl border border-border p-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-600 text-sm font-bold text-white">
                {i + 1}
              </span>
              <div>
                <p className="font-semibold">{item.title}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      )

    case 'diagram':
      return (
        <div className="rounded-2xl border border-border bg-muted/30 p-6">
          {c.title && <p className="mb-4 text-center text-sm font-semibold text-muted-foreground">{c.title}</p>}
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center sm:gap-1">
            {c.steps?.map((step: any, i: number) => (
              <div key={i} className="flex items-center gap-1 sm:contents">
                <div className="flex min-w-[110px] flex-col items-center gap-1 rounded-xl bg-background px-3 py-3 text-center shadow-sm">
                  <span className="text-sm font-semibold">{step.label}</span>
                  {step.caption && <span className="text-[11px] text-muted-foreground">{step.caption}</span>}
                </div>
                {i < c.steps.length - 1 && (
                  <ArrowRight className="h-4 w-4 shrink-0 rotate-90 text-muted-foreground sm:rotate-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      )

    case 'code':
      return (
        <div className="overflow-hidden rounded-2xl border border-border">
          {c.caption && (
            <div className="border-b border-border bg-muted/50 px-4 py-2 text-xs font-medium text-muted-foreground">
              {c.caption}
            </div>
          )}
          <pre className="overflow-x-auto bg-[#0f172a] p-4 text-sm text-slate-100">
            <code>{c.code}</code>
          </pre>
        </div>
      )

    case 'image':
      return (
        <figure className="overflow-hidden rounded-2xl border border-dashed border-border">
          <div className="flex aspect-video flex-col items-center justify-center gap-2 bg-muted/50 text-muted-foreground">
            <ImageIcon className="h-8 w-8" />
            <span className="text-xs">{c.alt}</span>
          </div>
          {c.caption && <figcaption className="p-3 text-center text-xs text-muted-foreground">{c.caption}</figcaption>}
        </figure>
      )

    case 'ai_tools':
      return <AiToolsBlock />

    case 'dex_cta':
      return <DexCtaBlock />

    default:
      return null
  }
}

function ListBlock({ content }: { content: any }) {
  const items: string[] = content.items ?? []
  if (content.style === 'number') {
    return (
      <div>
        {content.title && <p className="mb-3 font-semibold">{content.title}</p>}
        <ol className="flex flex-col gap-2">
          {items.map((item, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className="font-semibold text-primary-700">{i + 1}.</span>
              <span dangerouslySetInnerHTML={{ __html: boldify(item) }} />
            </li>
          ))}
        </ol>
      </div>
    )
  }
  if (content.style === 'check') {
    return (
      <ul className="flex flex-col gap-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
            <span dangerouslySetInnerHTML={{ __html: boldify(item) }} />
          </li>
        ))}
      </ul>
    )
  }
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5 text-sm">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-600" />
          <span dangerouslySetInnerHTML={{ __html: boldify(item) }} />
        </li>
      ))}
    </ul>
  )
}

function MarkdownParagraph({ text }: { text: string }) {
  return <p className="text-[15px] leading-relaxed text-foreground" dangerouslySetInnerHTML={{ __html: boldify(text) }} />
}

function boldify(text: string) {
  return text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
}

function AiToolsBlock() {
  const { data } = useSiteSetting('ai_tools')
  if (!data) return null
  return (
    <div className="flex flex-col gap-4">
      {data.categories.map((cat, i) => (
        <div key={i} className="rounded-2xl border border-border p-5">
          <p className="font-semibold text-primary-700">{cat.name}</p>
          <div className="mt-3 flex flex-col gap-2">
            {cat.tools.map((tool, j) => (
              <div key={j} className="flex flex-col gap-0.5 rounded-xl bg-muted/50 p-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className="text-sm font-medium">{tool.name}</span>
                  <p className="text-xs text-muted-foreground">{tool.note}</p>
                </div>
                {tool.url && (
                  <a href={tool.url} target="_blank" rel="noreferrer" className="text-xs font-medium text-primary-600 hover:underline">
                    Acessar
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      {data.note && <p className="text-xs italic text-muted-foreground">{data.note}</p>}
    </div>
  )
}

function DexCtaBlock() {
  const { data } = useSiteSetting('dex')
  if (!data || !data.enabled) return null

  return (
    <div className="overflow-hidden rounded-2xl border border-primary-200 bg-gradient-to-br from-primary-50 to-background p-6 text-center">
      <p className="text-lg font-bold">{data.title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{data.description}</p>
      {data.url ? (
        <a
          href={data.url}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex h-11 items-center justify-center rounded-xl bg-primary-600 px-6 text-sm font-medium text-white hover:bg-primary-700"
        >
          {data.cta_text}
        </a>
      ) : (
        <span className="mt-4 inline-flex h-11 cursor-not-allowed items-center justify-center rounded-xl bg-muted px-6 text-sm font-medium text-muted-foreground">
          {data.cta_text} (em breve)
        </span>
      )}
      {data.promo_text && <p className="mt-3 text-xs text-muted-foreground">{data.promo_text}</p>}
    </div>
  )
}
