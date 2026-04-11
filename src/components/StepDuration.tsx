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
        className="flex items-center gap-1.5 text-[0.8rem] font-medium text-[#B0B0BB] hover:text-[#111117] transition-colors mb-8">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Back
      </button>
      <h2 className="text-[1.6rem] font-bold tracking-tight text-[#111117] mb-1.5">How much time?</h2>
      <p className="text-[0.9rem] text-[#8A8A95] leading-relaxed mb-7">
        Mo adapts to your schedule. Even 5 minutes makes a real difference.
      </p>

      <div className="flex flex-col gap-2.5">
        {DURATIONS.map(d => (
          <button key={d.id} onClick={() => next({ duration: d.id })}
            className="flex items-center justify-between px-5 py-4 rounded-xl border border-[#EBEBEF] bg-white hover:border-[#5C58F6] hover:bg-[#F5F4FF] transition-all duration-150 cursor-pointer group">
            <div className="flex items-center gap-4">
              <span className="font-bold text-xl text-[#5C58F6] w-16 shrink-0">{d.label}</span>
              <span className="text-[0.8rem] text-[#8A8A95]">{d.note}</span>
            </div>
            <svg className="shrink-0 text-[#CBCBD4] group-hover:text-[#5C58F6] transition-colors" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        ))}
      </div>
    </div>
  )
}
