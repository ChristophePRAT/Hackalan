'use client';

import { StepProps } from '../types';

const LABELS = {
  format:   { meditation: 'Guided meditation', article: 'Article', video: 'Video script' },
  duration: { '5': '5 min', '10': '10 min', '20': '20 min' },
} as const;

export default function StepConfirm({ data, next, back }: Pick<StepProps, 'data' | 'next' | 'back'>) {
  const rows = [
    ['Format',    data.format   ? LABELS.format[data.format as keyof typeof LABELS.format]     : '—'],
    ['Duration',  data.duration ? LABELS.duration[data.duration as keyof typeof LABELS.duration] : '—'],
    ...(data.custom ? [['Situation', data.custom]] : []),
  ]

  return (
    <div>
      <button onClick={back}
        className="flex items-center gap-2 text-sm font-medium text-[#6E6E73] hover:text-[#191919] transition-colors mb-7">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Back
      </button>

      <h2 className="text-2xl font-bold tracking-tight text-[#191919] mb-2">
        Everything is ready.
      </h2>
      <p className="text-base text-[#6E6E73] leading-relaxed mb-8">
        Mo will generate medically vetted content, designed specifically for you.
      </p>

      <div className="rounded-2xl border border-[#E4E4E9] overflow-hidden mb-7">
        {rows.map(([k, v], i) => (
          <div key={k}
            className="flex items-start justify-between px-6 py-4 bg-[#F7F7F9]"
            style={{ borderBottom: i < rows.length - 1 ? '1px solid #E4E4E9' : 'none' }}>
            <span className="text-xs font-bold uppercase tracking-widest text-[#AFAFB8] shrink-0 mr-6 mt-0.5">{k}</span>
            <span className="text-sm font-semibold text-[#191919] text-right">{v}</span>
          </div>
        ))}
      </div>

      <button onClick={() => next()}
        className="w-full py-4 rounded-xl bg-[#5C58F6] hover:bg-[#4844D4] text-white font-semibold text-base transition-all duration-150 cursor-pointer">
        Generate my content →
      </button>
    </div>
  )
}
