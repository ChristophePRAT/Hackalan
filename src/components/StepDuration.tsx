'use client';

import { StepProps } from '../types';

const DURATIONS = [
  { id: '5',  label: '5 min',  note: 'A quick break between meetings.' },
  { id: '10', label: '10 min', note: 'Enough time to truly disconnect.' },
  { id: '20', label: '20 min', note: 'The full experience. Block your calendar.' },
] as const;

export default function StepDuration({ next, back }: Pick<StepProps, 'next' | 'back'>) {
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
        How much time do you have?
      </h2>
      <p className="text-base mb-10" style={{color: 'var(--color-alan-text-light)'}}>
        Mo adapts to your schedule. Even 5 minutes makes a real difference.
      </p>

      <div className="flex flex-col gap-4">
        {DURATIONS.map(d => (
          <button
            key={d.id}
            onClick={() => next({ duration: d.id })}
            className="flex items-center justify-between p-6 md:px-8 rounded-[24px] border transition-all duration-150 cursor-pointer"
            style={{borderColor: 'var(--color-alan-border)', backgroundColor: '#FFFFFF'}}
            onMouseEnter={e => { e.currentTarget.style.borderColor='var(--color-alan-blue)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(92, 88, 246, 0.08)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='var(--color-alan-border)'; e.currentTarget.style.boxShadow = 'none' }}
          >
            <div className="text-left flex items-center gap-4">
              <span className="font-bold text-2xl" style={{color: 'var(--color-alan-blue)'}}>{d.label}</span>
              <span className="text-base border-l pl-5" style={{borderColor: 'var(--color-alan-border)', color: 'var(--color-alan-text-light)'}}>{d.note}</span>
            </div>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-alan-text-light)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        ))}
      </div>
    </div>
  )
}
