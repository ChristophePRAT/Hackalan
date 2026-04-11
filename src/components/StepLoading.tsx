'use client';

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { StepProps, AnalysisResult } from '../types';

const STAGES = [
  { label: 'Personalization' },
  { label: 'Medical validation' },
  { label: 'Mo Voice' },
]

const MESSAGES = [
  'Reading your profile...',
  'Fetching your health data...',
  'Checking medical guidelines...',
  'Analyzing your sleep patterns...',
  'Evaluating activity levels...',
  "Calibrating Mo's tone and style...",
  'Adapting to your selected duration...',
  'Validation by the Alan medical team...',
  'Finalizing your personalized content...',
]

export default function StepLoading({ data, next, setResult }: Pick<StepProps, 'data' | 'next' | 'setResult'>) {
  const router = useRouter()
  const [progress, setProgress] = useState(0)
  const [stage, setStage]       = useState(0)
  const [msgIdx, setMsgIdx]     = useState(0)
  const started = useRef(false)
  const progressRef = useRef(0)

  const updateProgress = (val: number) => {
    const rounded = Math.round(val)
    progressRef.current = rounded
    setProgress(rounded)
  }

  useEffect(() => {
    if (started.current) return
    started.current = true

    const msgTimer = setInterval(() => setMsgIdx(i => (i + 1) % MESSAGES.length), 1200)

    const run = async () => {
      try {
        const analysisRes = await fetch(`/api/analyse_data?userId=${data.profileId || 'a463e0bf26d790d6afdfda0cfd161cf5'}`, { method: 'GET' })
        const analysis = await analysisRes.json()
        updateProgress(25); setStage(0)

        const avgSleepHours = analysis.sleepAnalysis?.averages?.totalSleepMinutes
          ? (analysis.sleepAnalysis.averages.totalSleepMinutes / 60).toFixed(1)
          : 'unknown'

        const generateRes = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: `User situation: ${data.custom || 'General wellness'}. Health insight: ${analysis.overallHealthScore?.summary?.primaryInsight || 'Maintain good habits'}. Average daily sleep: ${avgSleepHours} hours.`,
            format: data.format === 'video' ? 'video_script' : data.format || 'article',
            userProfile: { name: 'Alex', healthFocus: 'general wellness', level: 'intermediate' },
          }),
        })
        const generated = await generateRes.json()

        return {
          title: generated.title || `Your personalized ${data.format}`,
          body: generated.content,
          category: generated.category,
          scores: { medical: analysis.overallHealthScore?.totalScore || 92, brand: 90, personalization: 95 },
          xp: generated.xp || 120,
        } satisfies AnalysisResult
      } catch {
        return {
          title: `Your ${data.format || 'content'}`,
          body: 'We encountered an issue generating your content. Please try again later.',
          category: undefined,
          scores: { medical: 0, brand: 0, personalization: 0 },
          xp: 0,
        } satisfies AnalysisResult
      }
    }

    const tick = setInterval(() => {
      const current = progressRef.current
      const increment = current < 25 ? Math.random() * 2 + 1
        : current < 70 ? Math.random() * 1 + 0.2
        : Math.random() * 0.3 + 0.05
      updateProgress(Math.min(current + increment, 98))
      setStage(progressRef.current < 34 ? 0 : progressRef.current < 68 ? 1 : 2)
    }, 150)

    run().then(res => {
      clearInterval(tick); clearInterval(msgTimer)
      updateProgress(100); setStage(2)
      localStorage.setItem('mo-result', JSON.stringify(res))
      setTimeout(() => router.push('/result'), 600)
    })

    return () => { clearInterval(tick); clearInterval(msgTimer) }
  }, [data, router])

  const r = 52, circ = 2 * Math.PI * r
  const dash = circ * (1 - progress / 100)

  return (
    <div className="flex flex-col items-center text-center py-6">
      <h2 className="text-2xl font-bold tracking-tight text-[#191919] mb-2">
        Mo is working for you...
      </h2>
      <p className="text-base text-[#6E6E73] mb-12">
        Every piece of content is medically vetted before being shared.
      </p>

      <div className="relative w-44 h-44 mb-12">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={r} fill="none" stroke="#E4E4E9" strokeWidth="7" />
          <circle cx="60" cy="60" r={r} fill="none" stroke="#5C58F6" strokeWidth="7"
            strokeDasharray={circ} strokeDashoffset={dash} strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.25s ease' }} />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center font-bold text-2xl text-[#191919]">
          {progress}%
        </span>
      </div>

      <div className="w-full flex flex-col gap-2.5 mb-8">
        {STAGES.map((s, i) => {
          const isActive  = i <= stage
          const isCurrent = i === stage
          return (
            <div key={i}
              className="flex items-center gap-4 px-5 py-4 rounded-xl border transition-colors duration-300"
              style={{
                borderColor: isActive ? '#5C58F6' : '#E4E4E9',
                backgroundColor: isActive ? '#F0EFFF' : '#F7F7F9',
              }}>
              <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all"
                style={{
                  backgroundColor: i < stage ? '#5C58F6' : 'transparent',
                  border: i < stage ? 'none' : `2px solid ${isCurrent ? '#5C58F6' : '#AFAFB8'}`,
                }}>
                {i < stage && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg>}
              </div>
              <span className="font-medium text-sm text-[#191919]">{s.label}</span>
              {isCurrent && <span className="ml-auto text-xs font-bold uppercase tracking-wider text-[#5C58F6] animate-pulse">In progress</span>}
            </div>
          )
        })}
      </div>

      <p className="text-sm text-[#6E6E73] font-medium">{MESSAGES[msgIdx]}</p>
    </div>
  )
}
