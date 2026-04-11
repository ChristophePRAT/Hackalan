const LABELS = {
  goal:     { sleep:'Sommeil', stress:'Stress', detox:'Détox digitale', nutrition:'Nutrition', tobacco:'Tabac', breathing:'Respiration' },
  format:   { meditation:'Méditation guidée', article:'Article', video:'Script vidéo' },
  duration: { '5':'5 min', '10':'10 min', '20':'20 min' },
}
const XP_MAP = { sleep:120, stress:100, detox:90, nutrition:110, tobacco:150, breathing:80 }

export default function StepConfirm({ data, next, back }) {
  const xp = XP_MAP[data.goal] ?? 100

  const rows = [
    ['Objectif',  LABELS.goal[data.goal]],
    ['Format',    LABELS.format[data.format]],
    ['Durée',     LABELS.duration[data.duration]],
    ...(data.custom ? [['Situation', data.custom]] : []),
  ]

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
        Tout est prêt.
      </h2>
      <p className="text-base mb-8" style={{color:'#4e6e54'}}>
        Mo va générer un contenu validé médicalement, pensé pour vous.
      </p>

      {/* Recap */}
      <div className="rounded-2xl border-2 overflow-hidden mb-4" style={{borderColor:'#e2d5bf', backgroundColor:'#ffffff'}}>
        {rows.map(([k, v], i) => (
          <div key={k} className="flex items-start justify-between px-5 py-4" style={{borderBottom: i < rows.length - 1 ? '1px solid #e2d5bf' : 'none'}}>
            <span className="text-xs uppercase tracking-widest mt-0.5 shrink-0 mr-4" style={{color:'#7a6147'}}>{k}</span>
            <span className="text-sm font-medium text-right" style={{color:'#1a3a2a'}}>{v}</span>
          </div>
        ))}
      </div>

      {/* XP + streak */}
      <div className="rounded-2xl px-5 py-5 mb-6 flex items-center justify-between" style={{backgroundColor:'#1a3a2a',color:'#f4efe6'}}>
        <div>
          <p className="text-xs opacity-60 uppercase tracking-widest mb-1">Récompense XP</p>
          <p className="font-[--font-serif] font-light" style={{fontSize:'1.8rem'}}>+{xp} XP</p>
        </div>
        <div className="text-right">
          <p className="text-xs opacity-60 uppercase tracking-widest mb-1">Série en cours</p>
          <p className="text-2xl">🔥 5 jours</p>
        </div>
      </div>

      <button
        onClick={() => next()}
        className="w-full py-4 rounded-2xl font-semibold text-base hover:opacity-90 transition-opacity cursor-pointer"
        style={{backgroundColor:'#1a3a2a', color:'#f4efe6'}}
      >
        Générer mon contenu
      </button>
    </div>
  )
}
