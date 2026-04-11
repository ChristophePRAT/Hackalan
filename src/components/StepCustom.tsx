'use client';

import { useState } from 'react'
import { StepProps } from '../types';

const SUGGESTIONS = [
  'I wake up several times a night over the past few weeks.',
  'I feel chronically tired despite getting enough sleep.',
  "My doctor advised me to reduce stress, but I don't know where to start.",
  'I want to quit smoking but have tried and failed before.',
]

export default function StepCustom({ data, next, back }: Pick<StepProps, 'data' | 'next' | 'back'>) {
  const [text, setText] = useState(data.custom ?? '')

  return (
    <div>
      {/* Back */}
      <button onClick={back}
        className="flex items-center gap-1.5 text-[0.8rem] font-medium text-[#B0B0BB] hover:text-[#111117] transition-colors mb-8">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Back
      </button>

      {/* Heading */}
      <h2 className="text-[1.6rem] font-bold tracking-tight text-[#111117] mb-1.5">
        Do you have a specific situation?
      </h2>
      <p className="text-[0.9rem] text-[#8A8A95] leading-relaxed mb-7">
        Describe it in a few words — Mo will personalize your content accordingly.
        <span className="ml-1 text-[#B0B0BB]">Optional.</span>
      </p>

      {/* Textarea */}
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        rows={4}
        placeholder="e.g. I often wake up around 3 AM and can't fall back to sleep..."
        className="w-full rounded-xl border border-[#EBEBEF] bg-[#FAFAFA] px-4 py-3.5 text-[0.925rem] leading-relaxed resize-none outline-none transition-all duration-200 mb-6 placeholder:text-[#C0C0C8] text-[#111117] focus:border-[#5C58F6] focus:bg-white focus:shadow-[0_0_0_3px_rgba(92,88,246,0.12)]"
        style={{ borderColor: text ? '#5C58F6' : undefined }}
      />

      {/* Suggestions */}
      <p className="text-[0.7rem] font-bold uppercase tracking-[0.1em] text-[#C0C0C8] mb-3">
        Suggestions
      </p>
      <div className="flex flex-col gap-2 mb-8">
        {SUGGESTIONS.map((s, i) => (
          <button key={i} onClick={() => setText(s)}
            className="text-left text-[0.875rem] px-6 py-4 rounded-xl border transition-colors duration-100 cursor-pointer flex items-center justify-between group min-h-[52px]"
            style={{
              borderColor: text === s ? '#5C58F6' : '#EBEBEF',
              backgroundColor: text === s ? '#F5F4FF' : '#FAFAFA',
              color: text === s ? '#5C58F6' : '#6E6E78',
            }}>
            <span className="leading-snug">{s}</span>
            <svg className="shrink-0 ml-3 opacity-0 group-hover:opacity-100 transition-opacity" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button onClick={() => next({ custom: '' })}
          className="py-3.5 px-6 rounded-xl border border-[#EBEBEF] text-[0.875rem] font-semibold text-[#8A8A95] hover:border-[#CBCBD4] hover:text-[#111117] transition-all duration-150 cursor-pointer whitespace-nowrap bg-white">
          Skip
        </button>
        <button onClick={() => next({ custom: text })}
          className="flex-1 py-3.5 rounded-xl bg-[#5C58F6] hover:bg-[#4844D4] text-white font-semibold text-[0.875rem] transition-all duration-150 cursor-pointer shadow-[0_1px_3px_rgba(92,88,246,0.3)]">
          Continue →
        </button>
      </div>
    </div>
  )
}
