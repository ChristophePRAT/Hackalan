'use client';

import { StepProps } from '../types';

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
] as const;

export default function StepFormat({ next, back }: Pick<StepProps, 'next' | 'back'>) {
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
      <h2 className="font-bold leading-tight mb-4 text-[2rem]" style={{color: 'var(--color-alan-text)'}}>
        Which format works for you?
      </h2>
      <p className="text-[1.05rem] mb-12" style={{color: 'var(--color-alan-text-light)'}}>
        Choose based on how you prefer to consume content.
      </p>

      <div className="flex flex-col gap-5">
        {FORMATS.map(f => (
          <button
            key={f.id}
            onClick={() => next({ format: f.id })}
            className="text-left flex items-start gap-6 px-10 py-9 rounded-[20px] border-2 transition-all duration-150 cursor-pointer"
            style={{borderColor: 'var(--color-alan-border)', backgroundColor: '#FAFAFA'}}
            onMouseEnter={e => { e.currentTarget.style.borderColor='var(--color-alan-blue)'; e.currentTarget.style.backgroundColor='#F5F4FF'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(92, 88, 246, 0.10)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='var(--color-alan-border)'; e.currentTarget.style.backgroundColor='#FAFAFA'; e.currentTarget.style.boxShadow = 'none' }}
          >
            <div className="mt-0.5 shrink-0 flex items-center justify-center w-10 h-10 rounded-full" style={{backgroundColor: 'rgba(92,88,246,0.1)', color: 'var(--color-alan-blue)'}}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7v14"/></svg>
            </div>
            <div>
              <p className="font-semibold mb-1 text-[1.15rem]" style={{color: 'var(--color-alan-text)'}}>{f.label}</p>
              <p className="text-[0.95rem] leading-relaxed" style={{color: 'var(--color-alan-text-light)'}}>{f.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
