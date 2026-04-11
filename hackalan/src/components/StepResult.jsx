import { useState } from 'react'

const SCORE_META = {
  medical:         { label: 'Précision médicale', color: '#4e6e54' },
  brand:           { label: 'Voix Mo · Alan',     color: '#1a3a2a' },
  personalization: { label: 'Personnalisation',   color: '#7a6147' },
}

export default function StepResult({ result, restart }) {
  const [copied, setCopied] = useState(false)
  const [showXP, setShowXP] = useState(true)

  const copy = () => {
    navigator.clipboard.writeText(result?.body ?? '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2200)
  }

  return (
    <div>
      {/* XP banner */}
      {showXP && (
        <div className="xp-pop flex items-center justify-between rounded-2xl px-5 py-4 mb-5" style={{backgroundColor:'#1a3a2a',color:'#f4efe6'}}>
          <div>
            <p className="text-xs opacity-60 uppercase tracking-widest mb-1">Contenu prêt 🎉</p>
            <p className="font-[--font-serif] font-light" style={{fontSize:'1.8rem'}}>+{result?.xp ?? 120} XP</p>
          </div>
          <button onClick={() => setShowXP(false)} className="text-2xl opacity-40 hover:opacity-80 transition-opacity leading-none cursor-pointer">×</button>
        </div>
      )}

      {/* Content card */}
      <div className="rounded-2xl border-2 overflow-hidden mb-4" style={{borderColor:'#e2d5bf', backgroundColor:'#ffffff'}}>
        <div className="px-5 pt-5 pb-4" style={{borderBottom:'1px solid #e2d5bf'}}>
          <h2 className="font-[--font-serif] font-light leading-snug" style={{fontSize:'1.2rem',color:'#1a3a2a'}}>{result?.title}</h2>
        </div>
        <div className="px-5 py-5 whitespace-pre-line text-base leading-[1.8]" style={{color:'#1a3a2a'}}>
          {result?.body}
        </div>
        <div className="px-5 pb-5">
          <button
            onClick={copy}
            className="w-full py-3 rounded-xl border-2 font-semibold transition-all duration-200 cursor-pointer"
            style={{
              borderColor: '#1a3a2a',
              color: copied ? '#f4efe6' : '#1a3a2a',
              backgroundColor: copied ? '#1a3a2a' : 'transparent',
            }}
          >
            {copied ? '✓ Copié dans le presse-papiers' : 'Copier le contenu'}
          </button>
        </div>
      </div>

      {/* Quality scores */}
      <div className="rounded-2xl border-2 px-5 py-4 mb-5" style={{borderColor:'#e2d5bf', backgroundColor:'#ffffff'}}>
        <p className="text-xs uppercase tracking-widest mb-4" style={{color:'#7a6147'}}>Scores de qualité</p>
        <div className="flex flex-col gap-4">
          {Object.entries(SCORE_META).map(([key, m]) => (
            <div key={key}>
              <div className="flex justify-between mb-1.5">
                <span className="text-sm" style={{color:'#1a3a2a'}}>{m.label}</span>
                <span className="text-sm font-semibold" style={{color: m.color}}>{result?.scores?.[key] ?? 0}%</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{backgroundColor:'#e2d5bf'}}>
                <div className="h-full rounded-full transition-all duration-700" style={{width:`${result?.scores?.[key] ?? 0}%`, backgroundColor: m.color}} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer Alan style */}
      <p className="text-xs text-center mb-5 leading-relaxed" style={{color:'#7a6147'}}>
        Ce contenu a été généré par Mo et vérifié par l'équipe médicale Alan.<br/>Il ne remplace pas un avis médical personnalisé.
      </p>

      <button
        onClick={restart}
        className="w-full py-3.5 rounded-2xl border-2 font-medium transition-all duration-200 cursor-pointer"
        style={{borderColor:'#e2d5bf', color:'#4e6e54', backgroundColor:'transparent'}}
        onMouseEnter={e => { e.currentTarget.style.borderColor='#1a3a2a'; e.currentTarget.style.color='#1a3a2a' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor='#e2d5bf'; e.currentTarget.style.color='#4e6e54' }}
      >
        Générer un nouveau contenu
      </button>
    </div>
  )
}
