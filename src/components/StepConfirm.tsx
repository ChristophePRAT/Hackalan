'use client';

import { StepProps } from '../types';

const LABELS = {
  goal:     { sleep:'Sleep', stress:'Stress', detox:'Digital detox', nutrition:'Nutrition', tobacco:'Manage tobacco', breathing:'Breathing' },
  format:   { meditation:'Guided meditation', article:'Article', video:'Video script' },
  duration: { '5':'5 min', '10':'10 min', '20':'20 min' },
} as const;

export default function StepConfirm({ data, next, back }: Pick<StepProps, 'data' | 'next' | 'back'>) {
  const rows = [
    ['Goal',      data.goal ? LABELS.goal[data.goal as keyof typeof LABELS.goal] : ''],
    ['Format',    data.format ? LABELS.format[data.format as keyof typeof LABELS.format] : ''],
    ['Duration',  data.duration ? LABELS.duration[data.duration as keyof typeof LABELS.duration] : ''],
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

      <h2 className="font-bold leading-tight mb-4 text-[2rem] tracking-tight" style={{color: 'var(--color-alan-text)'}}>
        Everything is ready.
      </h2>
      <p className="text-[1.05rem] mb-12 leading-relaxed" style={{color: 'var(--color-alan-text-light)'}}>
        Mo will generate medically vetted content, designed specifically for you.
      </p>

      {/* Recap */}
      <div className="rounded-[20px] border-2 overflow-hidden mb-12" style={{borderColor: 'var(--color-alan-border)', backgroundColor: '#FAFAFA'}}>
        {rows.map(([k, v], i) => (
          <div key={k} className="flex items-center justify-between px-10 py-7" style={{borderBottom: i < rows.length - 1 ? '1px solid var(--color-alan-border)' : 'none'}}>
            <span className="text-xs font-bold uppercase tracking-widest shrink-0 mr-4" style={{color: 'var(--color-alan-text-light)'}}>{k}</span>
            <span className="text-[1rem] font-semibold text-right" style={{color: 'var(--color-alan-text)'}}>{v}</span>
          </div>
        ))}
      </div>

      <button
        onClick={() => next()}
        className="w-full py-5 rounded-2xl font-bold text-[1.05rem] cursor-pointer text-center transition-all duration-150"
        style={{backgroundColor: 'var(--color-alan-blue)', color: '#FFFFFF'}}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-alan-blue-hover)'}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--color-alan-blue)'}
      >
        Generate my content →
      </button>
    </div>
  )
}
