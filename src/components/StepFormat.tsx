'use client';

import { StepProps } from '../types';

const FORMATS = [
  { id: 'meditation', label: 'Guided meditation', desc: 'Narrated audio with nature sounds. Listen with your eyes closed.' },
  { id: 'article',    label: 'Article',            desc: 'Structured, readable, vetted by the Alan medical team.' },
  { id: 'video',      label: 'Video script',       desc: 'Scene-by-scene narration breakdown, ready to shoot.' },
] as const;

export default function StepFormat({ next, back }: Pick<StepProps, 'next' | 'back'>) {
  return (
    <div>
      <button onClick={back}
        className="flex items-center gap-1.5 text-[0.875rem] font-medium text-[#B0B0BB] hover:text-[#111117] transition-colors mb-8">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Back
      </button>
      <h2 className="text-[1.9rem] font-bold tracking-tight text-[#111117] mb-1.5">Which format?</h2>
      <p className="text-[0.9rem] text-[#8A8A95] leading-relaxed mb-7">
        Choose based on how you prefer to consume content.
      </p>

      <div className="flex flex-col gap-2.5">
        {FORMATS.map(f => (
          <button key={f.id} onClick={() => next({ format: f.id })}
            className="text-left flex items-center gap-4 px-5 py-4 rounded-xl border border-[#EBEBEF] bg-white hover:border-[#5C58F6] hover:bg-[#F5F4FF] transition-all duration-150 cursor-pointer group">
            <div className="shrink-0 w-9 h-9 rounded-lg bg-[#F5F4FF] flex items-center justify-center group-hover:bg-[#5C58F6] transition-colors duration-150">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                className="stroke-[#5C58F6] group-hover:stroke-white transition-colors duration-150">
                <path d="M5 12h14m-7-7v14"/>
              </svg>
            </div>
            <div>
              <p className="font-semibold text-[0.925rem] text-[#111117] mb-0.5">{f.label}</p>
              <p className="text-[0.875rem] text-[#8A8A95]">{f.desc}</p>
            </div>
            <svg className="ml-auto shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-[#5C58F6]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        ))}
      </div>
    </div>
  )
}
