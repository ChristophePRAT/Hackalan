import { useEffect, useRef, useState } from 'react'

const STAGES = [
  { label: 'Personnalisation',      icon: '✦' },
  { label: 'Validation médicale',   icon: '⚕' },
  { label: 'Voix Mo',               icon: '◎' },
]

const MESSAGES = [
  'Lecture de votre profil…',
  'Vérification des recommandations médicales…',
  'Calibrage du ton et du style…',
  'Adaptation à votre durée…',
  'Validation par l\'équipe médicale Alan…',
  'Finalisation du contenu…',
]

const MOCK = {
  title: 'Votre méditation sommeil de 10 minutes',
  body: `Installez-vous confortablement — allongé·e, ou dans un endroit où vous ne serez pas dérangé·e. Laissez vos yeux se fermer naturellement.

Observez votre respiration sans chercher à la modifier. L'air qui entre, l'air qui sort. C'est tout ce qu'on vous demande pour l'instant.

Une à une, laissez les pensées de la journée perdre leur emprise. Pas besoin de les chasser — juste ne pas les suivre. Comme des nuages qui traversent un ciel dégagé.

Sentez le poids de votre corps s'alourdir. Les épaules s'abaissent. La mâchoire se relâche. Vous n'avez rien à faire. Vous êtes exactement là où il faut être.`,
  scores: { medical: 94, brand: 88, personalization: 91 },
  xp: 120,
}

export default function StepLoading({ data, next, setResult }) {
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
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        if (res.ok) return res.json()
      } catch (_) {}
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
  }, [])

  const r = 56, circ = 2 * Math.PI * r
  const dash = circ * (1 - progress / 100)

  return (
    <div className="flex flex-col items-center text-center gap-8 py-4">
      <div>
        <h2 className="font-[--font-serif] font-light leading-tight" style={{fontSize:'1.75rem',color:'#1a3a2a'}}>
          Mo travaille pour vous…
        </h2>
        <p className="mt-2 text-base" style={{color:'#4e6e54'}}>
          Chaque contenu est validé médicalement avant d'être partagé.
        </p>
      </div>

      {/* Circle */}
      <div className="relative w-44 h-44">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
          <circle cx="64" cy="64" r={r} fill="none" stroke="#e2d5bf" strokeWidth="6" />
          <circle
            cx="64" cy="64" r={r} fill="none"
            stroke="#1a3a2a" strokeWidth="6"
            strokeDasharray={circ} strokeDashoffset={dash}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.25s ease' }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center font-[--font-serif] font-light" style={{fontSize:'1.8rem',color:'#1a3a2a'}}>
          {progress}%
        </span>
      </div>

      {/* Stages */}
      <div className="w-full flex flex-col gap-2">
        {STAGES.map((s, i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-5 py-3.5 rounded-xl transition-colors duration-300 text-left"
            style={i <= stage ? {backgroundColor:'#1a3a2a',color:'#f4efe6'} : {backgroundColor:'#e2d5bf',color:'#4e6e54'}}
          >
            <span className="text-base">{s.icon}</span>
            <span className="font-medium">{s.label}</span>
            {i < stage  && <span className="ml-auto text-xs opacity-60">✓</span>}
            {i === stage && <span className="ml-auto text-xs opacity-70 animate-pulse">en cours</span>}
          </div>
        ))}
      </div>

      <p className="text-sm italic" style={{color:'#4e6e54'}}>{MESSAGES[msgIdx]}</p>
    </div>
  )
}
