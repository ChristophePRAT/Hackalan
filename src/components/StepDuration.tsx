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
      <button onClick={back}
        className="flex items-center gap-2 text-sm font-medium text-[#6E6E73] hover:text-[#191919] transition-colors mb-7">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Back
      </button>
      <h2 className="text-2xl font-bold tracking-tight text-[#191919] mb-2">
        How much time do you have?
      </h2>
      <p className="text-base text-[#6E6E73] leading-relaxed mb-8">
        Mo adapts to your schedule. Even 5 minutes makes a real difference.
      </p>

      <div className="flex flex-col gap-3">
        {DURATIONS.map(d => (
          <button key={d.id} onClick={() => next({ duration: d.id })}
            className="flex items-center justify-between p-6 rounded-2xl border border-[#E4E4E9] bg-[#F7F7F9] hover:border-[#5C58F6] hover:bg-[#F0EFFF] transition-all duration-150 cursor-pointer">
            <div className="flex items-center gap-5">
              <span className="font-bold text-2xl text-[#5C58F6] w-20 shrink-0">{d.label}</span>
              <span className="text-sm text-[#6E6E73] border-l border-[#E4E4E9] pl-5">{d.note}</span>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#AFAFB8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        ))}
      </div>
    </div>
  )
}
