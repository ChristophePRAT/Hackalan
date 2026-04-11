'use client';

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { StepProps, AnalysisResult } from '../types';

const STAGES = ['Personalization', 'Medical validation', 'Mo Voice']

const MESSAGES = [
  'Reading your profile...',
  'Fetching health data...',
  'Checking medical guidelines...',
  'Analyzing patterns...',
  'Calibrating tone and style...',
  'Finalizing your content...',
]

export default function StepLoading({ data, next, setResult }: Pick<StepProps, 'data' | 'next' | 'setResult'>) {
  const router      = useRouter()
  const [progress, setProgress] = useState(0)
  const [stage, setStage]       = useState(0)
  const [msgIdx, setMsgIdx]     = useState(0)
  const started     = useRef(false)
  const progressRef = useRef(0)

  const updateProgress = (val: number) => {
    const r = Math.round(val); progressRef.current = r; setProgress(r)
  }

  useEffect(() => {
    if (started.current) return
    started.current = true
    const msgTimer = setInterval(() => setMsgIdx(i => (i + 1) % MESSAGES.length), 1400)

    const run = async () => {
      try {
        const analysisRes = await fetch(`/api/analyse_data?userId=${data.profileId || 'a463e0bf26d790d6afdfda0cfd161cf5'}`, { method: 'GET' })
        const analysis = await analysisRes.json()
        updateProgress(25); setStage(0)
        const avgH = analysis.sleepAnalysis?.averages?.totalSleepMinutes
          ? (analysis.sleepAnalysis.averages.totalSleepMinutes / 60).toFixed(1) : 'unknown'
        const generateRes = await fetch('/api/generate', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: `User situation: ${data.custom || 'General wellness'}. Insight: ${analysis.overallHealthScore?.summary?.primaryInsight || 'Maintain good habits'}. Sleep: ${avgH}h/day.`,
            format: data.format === 'video' ? 'video_script' : data.format || 'article',
            userProfile: { name: 'Alex', healthFocus: 'general wellness', level: 'intermediate' },
          }),
        })
        const generated = await generateRes.json()
        return { title: generated.title || `Your ${data.format}`, body: generated.content, category: generated.category, scores: { medical: analysis.overallHealthScore?.totalScore || 92, brand: 90, personalization: 95 }, xp: generated.xp || 120 } satisfies AnalysisResult
      } catch {
        return { title: `Your ${data.format || 'content'}`, body: 'We encountered an issue. Please try again.', category: undefined, scores: { medical: 0, brand: 0, personalization: 0 }, xp: 0 } satisfies AnalysisResult
      }
    }

    const tick = setInterval(() => {
      const c = progressRef.current
      const inc = c < 25 ? Math.random() * 2 + 1 : c < 70 ? Math.random() + 0.2 : Math.random() * 0.3 + 0.05
      updateProgress(Math.min(c + inc, 98))
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

  const r = 48, circ = 2 * Math.PI * r

  return (
    <div className="flex flex-col items-center text-center py-8">
      <h2 className="text-[1.6rem] font-bold tracking-tight text-[#111117] mb-1.5">Mo is on it...</h2>
      <p className="text-[0.9rem] text-[#8A8A95] mb-12">Every piece of content is medically vetted before delivery.</p>

      {/* Circle progress */}
      <div className="relative w-36 h-36 mb-12">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 112 112">
          <circle cx="56" cy="56" r={r} fill="none" stroke="#EBEBEF" strokeWidth="6" />
          <circle cx="56" cy="56" r={r} fill="none" stroke="#5C58F6" strokeWidth="6"
            strokeDasharray={circ} strokeDashoffset={circ * (1 - progress / 100)}
            strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.25s ease' }} />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center font-bold text-xl text-[#111117]">
          {progress}%
        </span>
      </div>

      {/* Stages */}
      <div className="w-full flex flex-col gap-2 mb-8">
        {STAGES.map((s, i) => {
          const done    = i < stage
          const current = i === stage
          return (
            <div key={i} className="flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-colors duration-200"
              style={{ borderColor: done || current ? '#5C58F6' : '#EBEBEF', backgroundColor: done || current ? '#F5F4FF' : '#FAFAFA' }}>
              <div className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center transition-all"
                style={{ backgroundColor: done ? '#5C58F6' : 'transparent', border: done ? 'none' : `2px solid ${current ? '#5C58F6' : '#CBCBD4'}` }}>
                {done && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg>}
              </div>
              <span className="text-[0.875rem] font-medium text-[#111117]">{s}</span>
              {current && <span className="ml-auto text-[0.7rem] font-bold uppercase tracking-wider text-[#5C58F6] animate-pulse">In progress</span>}
            </div>
          )
        })}
      </div>

      <p className="text-[0.8rem] text-[#B0B0BB] font-medium">{MESSAGES[msgIdx]}</p>
    </div>
  )
}
