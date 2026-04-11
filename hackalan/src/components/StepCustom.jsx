import { useState } from 'react'

const SUGGESTIONS = [
  'Je me réveille plusieurs fois par nuit depuis quelques semaines.',
  'Je ressens une fatigue chronique malgré un sommeil correct.',
  'Mon médecin m\'a conseillé de réduire mon stress, mais je ne sais pas par où commencer.',
  'Je veux arrêter de fumer mais j\'ai déjà essayé sans succès.',
]

export default function StepCustom({ data, next, back }) {
  const [text, setText] = useState(data.custom ?? '')

  return (
    <div>
      <button
        onClick={back}
        className="flex items-center gap-1.5 text-sm mb-7 transition-colors"
        style={{color:'#4e6e54'}}
        onMouseEnter={e => e.currentTarget.style.color='#1a3a2a'}
        onMouseLeave={e => e.currentTarget.style.color='#4e6e54'}
      >
        ← Retour
      </button>

      <h2 className="font-[--font-serif] font-light leading-tight mb-2" style={{fontSize:'1.75rem',color:'#1a3a2a'}}>
        Vous avez une situation particulière ?
      </h2>
      <p className="text-base mb-2" style={{color:'#4e6e54'}}>
        Décrivez-la en quelques mots — Mo en tiendra compte pour personnaliser votre contenu. Cette étape est optionnelle.
      </p>

      {/* Textarea */}
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        rows={4}
        placeholder="Ex : je me réveille souvent à 3h du matin, j'ai du mal à me rendormir depuis que j'ai changé de poste…"
        className="w-full rounded-2xl border-2 p-4 text-base leading-relaxed resize-none outline-none transition-colors duration-200 mb-4"
        style={{
          borderColor: text ? '#1a3a2a' : '#e2d5bf',
          backgroundColor: '#ffffff',
          color: '#1a3a2a',
          fontFamily: 'var(--font-sans)',
        }}
        onFocus={e => e.target.style.borderColor = '#1a3a2a'}
        onBlur={e => e.target.style.borderColor = text ? '#1a3a2a' : '#e2d5bf'}
      />

      {/* Suggestion chips */}
      <p className="text-xs uppercase tracking-widest mb-3" style={{color:'#7a6147'}}>Exemples de situations</p>
      <div className="flex flex-col gap-2 mb-8">
        {SUGGESTIONS.map((s, i) => (
          <button
            key={i}
            onClick={() => setText(s)}
            className="text-left text-sm px-4 py-3 rounded-xl border-2 transition-all duration-150 cursor-pointer"
            style={{borderColor:'#e2d5bf', color:'#4e6e54', backgroundColor:'transparent'}}
            onMouseEnter={e => { e.currentTarget.style.borderColor='#1a3a2a'; e.currentTarget.style.color='#1a3a2a' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='#e2d5bf'; e.currentTarget.style.color='#4e6e54' }}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => next({ custom: '' })}
          className="flex-1 py-3.5 rounded-2xl border-2 text-sm font-medium transition-all duration-200 cursor-pointer"
          style={{borderColor:'#e2d5bf', color:'#4e6e54', backgroundColor:'transparent'}}
          onMouseEnter={e => { e.currentTarget.style.borderColor='#1a3a2a'; e.currentTarget.style.color='#1a3a2a' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor='#e2d5bf'; e.currentTarget.style.color='#4e6e54' }}
        >
          Passer cette étape
        </button>
        <button
          onClick={() => next({ custom: text })}
          className="flex-[2] py-3.5 rounded-2xl font-semibold text-base transition-opacity hover:opacity-90 cursor-pointer"
          style={{backgroundColor:'#1a3a2a', color:'#f4efe6'}}
        >
          Continuer
        </button>
      </div>
    </div>
  )
}
