'use client';

import { StepProps } from '../types';

const FORMATS = [
  { id: 'meditation', label: 'Guided meditation', desc: 'A narrated audio with nature sounds. Listen with your eyes closed.' },
  { id: 'article',    label: 'Article',            desc: 'Structured, readable, with medical sources vetted by the Alan team.' },
  { id: 'video',      label: 'Video script',       desc: 'Narration + scene-by-scene breakdown, ready to shoot.' },
] as const;

export default function StepFormat({ next, back }: Pick<StepProps, 'next' | 'back'>) {
  return (
    <div>
      <button onClick={back}
        className="flex items-center gap-2 text-sm font-medium text-[#6E6E73] hover:text-[#191919] transition-colors mb-7">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Back
      </button>
      <h2 className="text-2xl font-bold tracking-tight text-[#191919] mb-2">
        Which format works for you?
      </h2>
      <p className="text-base text-[#6E6E73] leading-relaxed mb-8">
        Choose based on how you prefer to consume content.
      </p>

      <div className="flex flex-col gap-3">
        {FORMATS.map(f => (
          <button key={f.id} onClick={() => next({ format: f.id })}
            className="text-left flex items-center gap-5 p-6 rounded-2xl border border-[#E4E4E9] bg-[#F7F7F9] hover:border-[#5C58F6] hover:bg-[#F0EFFF] transition-all duration-150 cursor-pointer group">
            <div className="shrink-0 w-10 h-10 rounded-xl bg-white border border-[#E4E4E9] group-hover:border-[#5C58F6] group-hover:bg-[#5C58F6]/10 flex items-center justify-center transition-all duration-150">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5C58F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7v14"/></svg>
            </div>
            <div>
              <p className="font-semibold text-base text-[#191919] mb-0.5">{f.label}</p>
              <p className="text-sm text-[#6E6E73] leading-relaxed">{f.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
