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
      <button onClick={back}
        className="flex items-center gap-2 text-sm font-medium text-[#6E6E73] hover:text-[#191919] transition-colors mb-7">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Back
      </button>

      <h2 className="text-2xl font-bold tracking-tight text-[#191919] mb-2">
        Do you have a specific situation?
      </h2>
      <p className="text-base text-[#6E6E73] leading-relaxed mb-7">
        Describe it in a few words — Mo will personalize your content accordingly. This step is optional.
      </p>

      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        rows={4}
        placeholder="Ex: I often wake up around 3 AM..."
        className="w-full rounded-2xl border border-[#E4E4E9] bg-[#F7F7F9] px-5 py-4 text-base leading-relaxed resize-none outline-none transition-all duration-200 mb-7 focus:border-[#5C58F6] focus:bg-white focus:ring-4 focus:ring-[#5C58F6]/10 placeholder:text-[#AFAFB8] text-[#191919]"
        style={{ borderColor: text ? '#5C58F6' : undefined }}
      />

      <p className="text-xs font-bold uppercase tracking-widest text-[#6E6E73] mb-4">
        Example situations
      </p>
      <div className="flex flex-col gap-2.5 mb-8">
        {SUGGESTIONS.map((s, i) => (
          <button key={i} onClick={() => setText(s)}
            className="text-left text-sm px-5 py-4 rounded-xl border transition-all duration-150 cursor-pointer w-full"
            style={{
              borderColor: text === s ? '#5C58F6' : '#E4E4E9',
              backgroundColor: text === s ? '#F0EFFF' : '#F7F7F9',
              color: text === s ? '#5C58F6' : '#6E6E73',
            }}>
            {s}
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <button onClick={() => next({ custom: '' })}
          className="py-4 px-8 rounded-xl border border-[#E4E4E9] bg-transparent text-sm font-semibold text-[#6E6E73] hover:border-[#191919] hover:text-[#191919] transition-all duration-150 cursor-pointer whitespace-nowrap">
          Skip this step
        </button>
        <button onClick={() => next({ custom: text })}
          className="flex-1 py-4 rounded-xl bg-[#5C58F6] hover:bg-[#4844D4] text-white font-semibold text-sm transition-all duration-150 cursor-pointer">
          Continue →
        </button>
      </div>
    </div>
  )
}
