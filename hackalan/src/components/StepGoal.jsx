const GOALS = [
  { id: 'sleep',     emoji: '🌙', label: 'Sommeil',        sub: 'Mieux dormir, se réveiller reposé·e',       xp: 120 },
  { id: 'stress',    emoji: '🌿', label: 'Stress',          sub: 'Retrouver un état de calme durable',        xp: 100 },
  { id: 'detox',     emoji: '📵', label: 'Détox digitale',  sub: 'Reprendre le contrôle de son attention',    xp: 90  },
  { id: 'nutrition', emoji: '🥦', label: 'Nutrition',       sub: 'Manger mieux, sans se priver',              xp: 110 },
  { id: 'tobacco',   emoji: '🚭', label: 'Tabac',           sub: 'Avancer à son rythme, vraiment',            xp: 150 },
  { id: 'breathing', emoji: '💨', label: 'Respiration',     sub: 'Une technique, une habitude, un souffle',   xp: 80  },
]

export default function StepGoal({ next }) {
  return (
    <div>
      <h2 className="font-[--font-serif] font-light leading-tight mb-2" style={{fontSize:'1.75rem',color:'#1a3a2a'}}>
        Sur quoi travaillez-vous ?
      </h2>
      <p className="text-base mb-8" style={{color:'#4e6e54'}}>
        Mo adapte chaque contenu à votre situation et à votre parcours de santé.
      </p>

      <div className="grid grid-cols-2 gap-3">
        {GOALS.map(g => (
          <button
            key={g.id}
            onClick={() => next({ goal: g.id })}
            className="group relative text-left p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer"
            style={{borderColor:'#e2d5bf', backgroundColor:'#ffffff'}}
            onMouseEnter={e => { e.currentTarget.style.borderColor='#1a3a2a'; e.currentTarget.style.backgroundColor='#dce8dc' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='#e2d5bf'; e.currentTarget.style.backgroundColor='#ffffff' }}
          >
            <span className="text-3xl mb-3 block">{g.emoji}</span>
            <p className="font-semibold mb-1" style={{color:'#1a3a2a'}}>{g.label}</p>
            <p className="text-xs leading-snug" style={{color:'#4e6e54'}}>{g.sub}</p>
            <span className="absolute top-3 right-3 text-[10px] font-semibold px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={{backgroundColor:'#1a3a2a',color:'#f4efe6'}}>
              +{g.xp} XP
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
