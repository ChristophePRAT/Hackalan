'use client';

import { useState } from 'react'
import { StepProps } from '../types';

const SUGGESTIONS = [
  'I wake up several times a night over the past few weeks.',
  'I feel chronically tired despite getting enough sleep.',
  'My doctor advised me to reduce stress, but I don\'t know where to start.',
  'I want to quit smoking but have tried and failed before.',
]

export default function StepCustom({ data, next, back }: Pick<StepProps, 'data' | 'next' | 'back'>) {
  const [text, setText] = useState(data.custom ?? '')

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
        Do you have a specific situation?
      </h2>
      <p className="text-base mb-8" style={{color: 'var(--color-alan-text-light)'}}>
        Describe it in a few words — Mo will take it into account to personalize your content. This step is optional.
      </p>

      {/* Textarea */}
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        rows={4}
        placeholder="Ex: I often wake up around 3 AM..."
        className="w-full rounded-2xl border p-5 text-base leading-relaxed resize-none outline-none transition-all duration-200 mb-8"
        style={{
          borderColor: text ? 'var(--color-alan-blue)' : 'var(--color-alan-border)',
          backgroundColor: '#FFFFFF',
          color: 'var(--color-alan-text)',
        }}
        onFocus={e => { e.currentTarget.style.borderColor = 'var(--color-alan-blue)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(92, 88, 246, 0.1)' }}
        onBlur={e => { e.currentTarget.style.borderColor = text ? 'var(--color-alan-blue)' : 'var(--color-alan-border)'; e.currentTarget.style.boxShadow = 'none' }}
      />

      {/* Suggestion chips */}
      <p className="text-sm font-semibold uppercase tracking-wider mb-4" style={{color: 'var(--color-alan-text-light)'}}>Example situations</p>
      <div className="flex flex-col gap-3 mb-10">
        {SUGGESTIONS.map((s, i) => (
          <button
            key={i}
            onClick={() => setText(s)}
            className="text-left text-base px-5 py-4 rounded-xl border transition-all duration-150 cursor-pointer"
            style={{borderColor: 'var(--color-alan-border)', color: 'var(--color-alan-text-light)', backgroundColor:'#FFFFFF'}}
            onMouseEnter={e => { e.currentTarget.style.borderColor='var(--color-alan-blue)'; e.currentTarget.style.color='var(--color-alan-blue)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='var(--color-alan-border)'; e.currentTarget.style.color='var(--color-alan-text-light)' }}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => next({ custom: '' })}
          className="flex-1 py-4 rounded-2xl border text-base font-medium transition-all duration-150 cursor-pointer hover:bg-gray-50"
          style={{borderColor: 'var(--color-alan-border)', color: 'var(--color-alan-text)'}}
        >
          Skip this step
        </button>
        <button
          onClick={() => next({ custom: text })}
          className="flex-[2] py-4 rounded-2xl font-semibold text-base transition-opacity hover:opacity-90 cursor-pointer"
          style={{backgroundColor: 'var(--color-alan-blue)', color: '#FFFFFF'}}
        >
          Continue
        </button>
      </div>
    </div>
  )
}
