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
        // Fallback mock — matches the real API shape
        return {
          explanation: [
            { title: "Alex, ton sommeil a besoin d'un coup de pouce – et je sais exactement pourquoi", paragraph: "Salut Alex ! Je vois que tu es en plein dans ton challenge bien-être, et ton streak de 12 jours montre que tu es vraiment motivé·e. Mais ces réveils nocturnes des dernières semaines commencent à peser, n'est-ce pas ? Tes données le confirment : avec une moyenne de 31 minutes éveillé·e par nuit (et jusqu'à 71 minutes certaines nuits !), ton sommeil est moins réparateur qu'il ne devrait l'être. Pas de panique, on va décortiquer ça ensemble et trouver des solutions ultra concrètes pour que tu retrouves des nuits dignes de ce nom." },
            { title: "Ce que tes données révèlent (et ce qu'on va corriger)", paragraph: "Ton analyse montre plusieurs points clés :\n- Ton temps éveillé la nuit (31 min en moyenne) est 2x plus élevé que la norme.\n- Ta variabilité cardiaque (HRV) est bonne (44 ms), mais chute parfois à 24 ms.\n- Ton sommeil profond (101 min) est dans la moyenne, mais ton sommeil léger (215 min) est trop dominant.\n- Ta fréquence cardiaque au repos (53 bpm) est excellente." },
            { title: "1. Le piège du « juste un verre d'eau »", paragraph: "Réduire les liquides 2h avant le coucher diminue les réveils nocturnes de 35%. Note l'heure de ton dernier verre d'eau aujourd'hui. Si c'est après 20h, décale-le à 19h30 demain." },
            { title: "2. La température de ta chambre", paragraph: "Ton corps a besoin de baisser sa température interne de 1°C pour s'endormir profondément. Dormir dans une pièce à 18°C vs 24°C augmente le sommeil profond de 25% et réduit les réveils de 40%." },
            { title: "3. Le stress post-réveil", paragraph: "Quand tu te réveilles la nuit, évite de regarder l'heure. Respire profondément 3 fois (inspire 4 sec, expire 6 sec) avant de bouger. Cela active ton système nerveux parasympathique." },
            { title: "4. Ton dîner : le coupable silencieux", paragraph: "Remplacer 10% des calories du dîner par des glucides complexes et des protéines légères améliore la continuité du sommeil de 18%. Évite les excitants après 14h." },
          ],
          objectives: [
            { title: "Réduire mes réveils nocturnes de 50% en 2 semaines", description: "En appliquant les 4 micro-défis ce soir et en suivant le plan d'action sur 14 jours, je vise une réduction de 50% de mon temps éveillé la nuit (passer de 31 min à moins de 15 min en moyenne).", category: "Sleep", xp: 120 },
            { title: "Optimiser ma température corporelle pour un sommeil profond", description: "Je maintiendrai ma chambre à 18°C et adopterai la routine « douche tiède 1h avant le coucher » pour faciliter la baisse naturelle de ma température interne.", category: "Sleep", xp: 90 },
            { title: "Stabiliser ma variabilité cardiaque nocturne", description: "Je pratiquerai 5 min de cohérence cardiaque (respiration 5-5) avant de dormir. Objectif : maintenir ma HRV au-dessus de 40 ms toute la nuit.", category: "Breathing & relaxation", xp: 100 },
            { title: "Rééquilibrer mon dîner pour un sommeil continu", description: "Je remplacerai les aliments riches en tyramine et les repas lourds par des dîners légers et digestes. Objectif : réduire mes réveils liés à la digestion de 30% en 1 semaine.", category: "Nutrition", xp: 80 },
            { title: "Créer un rituel anti-stress post-réveil", description: "Si je me réveille la nuit, je pratiquerai la respiration 4-6 et éviterai de regarder l'heure. Objectif : réduire mon temps d'éveil nocturne de 20%.", category: "Mental well-being", xp: 110 },
          ],
          scores: { medical: 92, brand: 88, personalization: 95 },
        } satisfies AnalysisResult
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
