'use client';

import { StepProps } from '../types';

const LABELS = {
  format:   { meditation: 'Guided meditation', article: 'Article', video: 'Video script' },
  duration: { '5': '5 min', '10': '10 min', '20': '20 min' },
} as const;

export default function StepConfirm({ data, next, back }: Pick<StepProps, 'data' | 'next' | 'back'>) {
  const rows = [
    { key: 'Format',    val: data.format   ? LABELS.format[data.format as keyof typeof LABELS.format]     : '—' },
    { key: 'Duration',  val: data.duration ? LABELS.duration[data.duration as keyof typeof LABELS.duration] : '—' },
    ...(data.custom ? [{ key: 'Situation', val: data.custom }] : []),
  ]

  return (
    <div>
      <button onClick={back}
        className="flex items-center gap-1.5 text-[0.875rem] font-medium text-[#B0B0BB] hover:text-[#111117] transition-colors mb-8">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Back
      </button>

      <h2 className="text-[1.9rem] font-bold tracking-tight text-[#111117] mb-1.5">Ready to generate.</h2>
      <p className="text-[0.9rem] text-[#8A8A95] leading-relaxed mb-7">
        Mo will create medically vetted content, designed specifically for you.
      </p>

      <div className="rounded-xl border border-[#EBEBEF] overflow-hidden mb-6">
        {rows.map((r, i) => (
          <div key={r.key}
            className="flex items-start justify-between px-6 py-4 bg-[#FAFAFA]"
            style={{ borderBottom: i < rows.length - 1 ? '1px solid #EBEBEF' : 'none' }}>
            <span className="text-[0.7rem] font-bold uppercase tracking-[0.08em] text-[#C0C0C8] shrink-0 mr-6 mt-0.5 pt-px">{r.key}</span>
            <span className="text-[0.875rem] font-medium text-[#111117] text-right leading-snug">{r.val}</span>
          </div>
        ))}
      </div>

      <button onClick={() => next()}
        className="w-full py-4 rounded-xl bg-[#5C58F6] hover:bg-[#4844D4] text-white font-semibold text-[0.925rem] transition-all duration-150 cursor-pointer shadow-[0_1px_3px_rgba(92,88,246,0.3)]">
        Generate my content →
      </button>
    </div>
  )
}
