const FORMATS = [
  {
    id:    'meditation',
    emoji: '🧘',
    label: 'Méditation guidée',
    desc:  'Un audio narré avec des ambiances naturelles. À écouter les yeux fermés.',
  },
  {
    id:    'article',
    emoji: '📄',
    label: 'Article',
    desc:  'Structuré, lisible, avec des sources médicales vérifiées par l\'équipe Alan.',
  },
  {
    id:    'video',
    emoji: '🎬',
    label: 'Script vidéo',
    desc:  'Narration + découpage scène par scène, prêt à tourner.',
  },
]

export default function StepFormat({ next, back }) {
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
        Quel format vous convient ?
      </h2>
      <p className="text-base mb-8" style={{color:'#4e6e54'}}>
        Choisissez selon la façon dont vos membres consomment du contenu au quotidien.
      </p>

      <div className="flex flex-col gap-3">
        {FORMATS.map(f => (
          <button
            key={f.id}
            onClick={() => next({ format: f.id })}
            className="text-left flex items-start gap-5 p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer"
            style={{borderColor:'#e2d5bf', backgroundColor:'#ffffff'}}
            onMouseEnter={e => { e.currentTarget.style.borderColor='#1a3a2a'; e.currentTarget.style.backgroundColor='#dce8dc' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='#e2d5bf'; e.currentTarget.style.backgroundColor='#ffffff' }}
          >
            <span className="text-4xl mt-0.5 shrink-0">{f.emoji}</span>
            <div>
              <p className="font-semibold mb-1" style={{color:'#1a3a2a'}}>{f.label}</p>
              <p className="text-sm leading-relaxed" style={{color:'#4e6e54'}}>{f.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
