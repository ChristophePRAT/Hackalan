const LABELS = {
  goal:     { sleep:'Sleep', stress:'Stress', detox:'Digital detox', nutrition:'Nutrition', tobacco:'Manage tobacco', breathing:'Breathing' },
  format:   { meditation:'Guided meditation', article:'Article', video:'Video script' },
  duration: { '5':'5 min', '10':'10 min', '20':'20 min' },
}

export default function StepConfirm({ data, next, back }) {
  const rows = [
    ['Goal',      LABELS.goal[data.goal]],
    ['Format',    LABELS.format[data.format]],
    ['Duration',  LABELS.duration[data.duration]],
    ...(data.custom ? [['Situation', data.custom]] : []),
  ]

  return (
    <div>
      <button
        onClick={back}
        className="flex items-center gap-1.5 text-sm mb-7 font-medium transition-colors"
        style={{color: 'var(--color-alan-text-light)'}}
        onMouseEnter={e => e.currentTarget.style.color='var(--color-alan-text)'}
        onMouseLeave={e => e.currentTarget.style.color='var(--color-alan-text-light)'}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Back
      </button>

      <h2 className="font-semibold leading-tight mb-3 text-3xl" style={{color: 'var(--color-alan-text)'}}>
        Everything is ready.
      </h2>
      <p className="text-base mb-10" style={{color: 'var(--color-alan-text-light)'}}>
        Mo will generate medically vetted content, designed specifically for you.
      </p>

      {/* Recap */}
      <div className="rounded-[24px] border overflow-hidden mb-10" style={{borderColor: 'var(--color-alan-border)', backgroundColor: '#FFFFFF'}}>
        {rows.map(([k, v], i) => (
          <div key={k} className="flex items-start justify-between px-6 py-5" style={{borderBottom: i < rows.length - 1 ? '1px solid var(--color-alan-border)' : 'none'}}>
            <span className="text-sm font-semibold uppercase tracking-wider mt-0.5 shrink-0 mr-4" style={{color: 'var(--color-alan-text-light)'}}>{k}</span>
            <span className="text-base font-medium text-right" style={{color: 'var(--color-alan-text)'}}>{v}</span>
          </div>
        ))}
      </div>

      <button
        onClick={() => next()}
        className="w-full py-4 rounded-2xl font-semibold text-base transition-opacity hover:opacity-90 cursor-pointer text-center shadow-md"
        style={{backgroundColor: 'var(--color-alan-blue)', color: '#FFFFFF'}}
      >
        Generate my content
      </button>
    </div>
  )
}
