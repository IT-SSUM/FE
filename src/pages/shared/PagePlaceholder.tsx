type PagePlaceholderProps = {
  title: string
  description?: string
}

export function PagePlaceholder({ title, description }: PagePlaceholderProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-emerald-700">ISSUM</p>
      <h1 className="mt-2 text-2xl font-semibold text-slate-900">{title}</h1>
      {description ? (
        <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
      ) : null}
    </section>
  )
}
