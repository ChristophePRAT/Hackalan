'use client';

import { useEffect, useRef, useState } from 'react'
import { StepProps, AnalysisResult } from '../types';

const STAGES = [
  { label: 'Personalization' },
  { label: 'Medical validation' },
  { label: 'Mo Voice' },
]

const MESSAGES = [
  'Reading your profile...',
  'Checking medical guidelines...',
  'Calibrating tone and style...',
  'Adapting to your selected duration...',
  'Validation by the Alan medical team...',
  'Finalizing content...',
]

const MOCK: AnalysisResult = {
  title: 'Your 10-minute sleep meditation',
  body: `Make yourself comfortable — lying down, or in a place where you won't be disturbed. Let your eyes close naturally.

Observe your breathing without trying to change it. The air coming in, the air going out. That's all that is asked of you right now.

One by one, let the thoughts of the day lose their grip. No need to chase them away — just don't follow them. Like clouds drifting across a clear sky.

Feel the weight of your body growing heavier. Your shoulders drop. Your jaw relaxes. You have nothing to do. You are exactly where you need to be.`,
  scores: { medical: 94, brand: 88, personalization: 91 },
  xp: 120
}

export default function StepLoading({ data, next, setResult }: Pick<StepProps, 'data' | 'next' | 'setResult'>) {
  const [progress, setProgress] = useState(0)
  const [stage, setStage]       = useState(0)
  const [msgIdx, setMsgIdx]     = useState(0)
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true

    const msgTimer = setInterval(() => setMsgIdx(i => (i + 1) % MESSAGES.length), 1500)

    const run = async () => {
      try {
        const res = await fetch('/api/analyse_data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        if (res.ok) return res.json()
      } catch (_) {}
      // Fallback to mock if API fails or doesn't support POST yet
      await new Promise(r => setTimeout(r, 4400))
      return MOCK
    }

    let p = 0
    const tick = setInterval(() => {
      p = Math.min(p + Math.random() * 1.6 + 0.5, 95)
      setProgress(Math.round(p))
      setStage(p < 34 ? 0 : p < 68 ? 1 : 2)
    }, 110)

    run().then(res => {
      clearInterval(tick); clearInterval(msgTimer)
      setProgress(100); setStage(2)
      setTimeout(() => { setResult(res); next() }, 600)
    })

    return () => { clearInterval(tick); clearInterval(msgTimer) }
  }, [data, next, setResult])

  const r = 56, circ = 2 * Math.PI * r
  const dash = circ * (1 - progress / 100)

  return (
    <div className="flex flex-col items-center text-center py-4">
      <div className="mb-14">
        <h2 className="font-semibold leading-tight text-3xl mb-3" style={{color: 'var(--color-alan-text)'}}>
          Mo is working for you...
        </h2>
        <p className="text-base" style={{color: 'var(--color-alan-text-light)'}}>
          Every piece of content is medically vetted before being shared.
        </p>
      </div>

      {/* Circle */}
      <div className="relative w-48 h-48 mb-14">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
          <circle cx="64" cy="64" r={r} fill="none" stroke="var(--color-alan-border)" strokeWidth="8" />
          <circle
            cx="64" cy="64" r={r} fill="none"
            stroke="var(--color-alan-blue)" strokeWidth="8"
            strokeDasharray={circ} strokeDashoffset={dash}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.25s ease' }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center font-bold text-2xl" style={{color: 'var(--color-alan-text)'}}>
          {progress}%
        </span>
      </div>

      {/* Stages */}
      <div className="w-full flex flex-col gap-4 mb-10">
        {STAGES.map((s, i) => {
          const isActive = i <= stage
          const isCurrent = i === stage
          return (
            <div
              key={i}
              className="flex items-center gap-4 px-6 py-4 rounded-[24px] transition-colors duration-300 text-left border"
              style={{
                borderColor: isActive ? 'var(--color-alan-blue)' : 'var(--color-alan-border)',
                backgroundColor: isActive ? 'rgba(92, 88, 246, 0.04)' : '#FFFFFF',
                color: isActive ? 'var(--color-alan-text)' : 'var(--color-alan-text-light)'
              }}
            >
              <div 
                className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" 
                style={{
                  backgroundColor: i < stage ? 'var(--color-alan-blue)' : 'transparent',
                  border: i < stage ? 'none' : `2px solid ${isCurrent ? 'var(--color-alan-blue)' : 'var(--color-alan-border)'}`
                }}
              >
                {i < stage && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg>}
              </div>
              <span className="font-medium text-base">{s.label}</span>
              {isCurrent && <span className="ml-auto text-sm font-semibold uppercase tracking-wider animate-pulse" style={{color: 'var(--color-alan-blue)'}}>In progress</span>}
            </div>
          )
        })}
      </div>

      <p className="text-base font-medium" style={{color: 'var(--color-alan-text-light)'}}>{MESSAGES[msgIdx]}</p>
    </div>
  )
}
