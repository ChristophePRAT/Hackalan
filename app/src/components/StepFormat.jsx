const FORMATS = [
  {
    id:    'meditation',
    label: 'Guided meditation',
    desc:  'A narrated audio with nature sounds. Listen with your eyes closed.',
  },
  {
    id:    'article',
    label: 'Article',
    desc:  'Structured, readable, with medical sources vetted by the Alan team.',
  },
  {
    id:    'video',
    label: 'Video script',
    desc:  'Narration + scene-by-scene breakdown, ready to shoot.',
  },
]

export default function StepFormat({ next, back }) {
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
        Which format works for you?
      </h2>
      <p className="text-base mb-10" style={{color: 'var(--color-alan-text-light)'}}>
        Choose based on how you prefer to consume content.
      </p>

      <div className="flex flex-col gap-4">
        {FORMATS.map(f => (
          <button
            key={f.id}
            onClick={() => next({ format: f.id })}
            className="text-left flex items-start gap-5 p-6 rounded-[24px] border transition-all duration-150 cursor-pointer"
            style={{borderColor: 'var(--color-alan-border)', backgroundColor: '#FFFFFF'}}
            onMouseEnter={e => { e.currentTarget.style.borderColor='var(--color-alan-blue)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(92, 88, 246, 0.08)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='var(--color-alan-border)'; e.currentTarget.style.boxShadow = 'none' }}
          >
            <div className="mt-1 shrink-0 flex items-center justify-center w-8 h-8 rounded-full" style={{backgroundColor: 'var(--color-alan-card)', color: 'var(--color-alan-blue)'}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7v14"/></svg>
            </div>
            <div>
              <p className="font-semibold mb-1.5 text-[1.1rem]" style={{color: 'var(--color-alan-text)'}}>{f.label}</p>
              <p className="text-[0.9rem] leading-relaxed" style={{color: 'var(--color-alan-text-light)'}}>{f.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
