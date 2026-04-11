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
        className="flex items-center gap-2 text-sm mb-8 font-medium transition-colors"
        style={{color: 'var(--color-alan-text-light)'}}
        onMouseEnter={e => e.currentTarget.style.color='var(--color-alan-text)'}
        onMouseLeave={e => e.currentTarget.style.color='var(--color-alan-text-light)'}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Back
      </button>

      <h2 className="font-bold leading-tight mb-4 text-[2rem] tracking-tight" style={{color: 'var(--color-alan-text)'}}>
        Do you have a specific situation?
      </h2>
      <p className="text-[1.05rem] mb-10 leading-relaxed" style={{color: 'var(--color-alan-text-light)'}}>
        Describe it in a few words — Mo will personalize your content accordingly. This step is optional.
      </p>

      {/* Textarea */}
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        rows={5}
        placeholder="Ex: I often wake up around 3 AM..."
        className="w-full rounded-2xl border-2 px-7 py-6 text-[1rem] leading-relaxed resize-none outline-none transition-all duration-200 mb-10"
        style={{
          borderColor: text ? 'var(--color-alan-blue)' : 'var(--color-alan-border)',
          backgroundColor: '#FAFAFA',
          color: 'var(--color-alan-text)',
        }}
        onFocus={e => { e.currentTarget.style.borderColor = 'var(--color-alan-blue)'; e.currentTarget.style.boxShadow = '0 0 0 4px rgba(92, 88, 246, 0.08)'; e.currentTarget.style.backgroundColor = '#FFFFFF' }}
        onBlur={e => { e.currentTarget.style.borderColor = text ? 'var(--color-alan-blue)' : 'var(--color-alan-border)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.backgroundColor = '#FAFAFA' }}
      />

      {/* Suggestion chips */}
      <p className="text-xs font-bold uppercase tracking-widest mb-5" style={{color: 'var(--color-alan-text-light)'}}>
        Example situations
      </p>
      <div className="flex flex-col gap-3 mb-14">
        {SUGGESTIONS.map((s, i) => (
          <button
            key={i}
            onClick={() => setText(s)}
            className="text-left text-[0.95rem] px-8 py-5 rounded-2xl border-2 transition-all duration-150 cursor-pointer w-full whitespace-normal break-words"
            style={{
              borderColor: text === s ? 'var(--color-alan-blue)' : 'var(--color-alan-border)',
              color: text === s ? 'var(--color-alan-blue)' : 'var(--color-alan-text-light)',
              backgroundColor: text === s ? 'rgba(92,88,246,0.06)' : '#FFFFFF',
            }}
            onMouseEnter={e => {
              if (text !== s) {
                e.currentTarget.style.borderColor = 'var(--color-alan-blue)';
                e.currentTarget.style.color = 'var(--color-alan-text)';
                e.currentTarget.style.backgroundColor = '#FAFAFA';
              }
            }}
            onMouseLeave={e => {
              if (text !== s) {
                e.currentTarget.style.borderColor = 'var(--color-alan-border)';
                e.currentTarget.style.color = 'var(--color-alan-text-light)';
                e.currentTarget.style.backgroundColor = '#FFFFFF';
              }
            }}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="flex gap-6 mt-4">
        <button
          onClick={() => next({ custom: '' })}
          className="py-5 px-10 rounded-2xl border-2 text-[1rem] font-semibold transition-all duration-150 cursor-pointer whitespace-nowrap"
          style={{borderColor: 'var(--color-alan-border)', color: 'var(--color-alan-text-light)', backgroundColor: 'transparent'}}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-alan-text)'; e.currentTarget.style.color = 'var(--color-alan-text)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-alan-border)'; e.currentTarget.style.color = 'var(--color-alan-text-light)' }}
        >
          Skip this step
        </button>
        <button
          onClick={() => next({ custom: text })}
          className="flex-1 py-5 rounded-2xl font-semibold text-[1rem] transition-all duration-150 cursor-pointer"
          style={{backgroundColor: 'var(--color-alan-blue)', color: '#FFFFFF'}}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-alan-blue-hover)'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--color-alan-blue)'}
        >
          Continue →
        </button>
      </div>
    </div>
  )
}
