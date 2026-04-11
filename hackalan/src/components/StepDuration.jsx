const DURATIONS = [
  { id: '5',  label: '5 min',  dots: 1, note: 'Une pause entre deux rendez-vous.' },
  { id: '10', label: '10 min', dots: 2, note: 'Suffisant pour vraiment décrocher.' },
  { id: '20', label: '20 min', dots: 3, note: 'L\'expérience complète. Bloquez le créneau.' },
]

function Dots({ count }) {
  return (
    <div className="flex gap-2 items-center">
      {[1,2,3].map(i => (
        <span key={i} className="w-2.5 h-2.5 rounded-full transition-colors" style={{backgroundColor: i <= count ? '#1a3a2a' : '#e2d5bf'}} />
      ))}
    </div>
  )
}

export default function StepDuration({ next, back }) {
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
        Combien de temps avez-vous ?
      </h2>
      <p className="text-base mb-8" style={{color:'#4e6e54'}}>
        Mo s'adapte à votre disponibilité. Même 5 minutes font une différence réelle.
      </p>

      <div className="flex flex-col gap-3">
        {DURATIONS.map(d => (
          <button
            key={d.id}
            onClick={() => next({ duration: d.id })}
            className="flex items-center justify-between p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer"
            style={{borderColor:'#e2d5bf', backgroundColor:'#ffffff'}}
            onMouseEnter={e => { e.currentTarget.style.borderColor='#1a3a2a'; e.currentTarget.style.backgroundColor='#dce8dc' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='#e2d5bf'; e.currentTarget.style.backgroundColor='#ffffff' }}
          >
            <div className="text-left">
              <p className="font-[--font-serif] font-light text-2xl leading-none mb-1" style={{color:'#1a3a2a'}}>{d.label}</p>
              <p className="text-sm" style={{color:'#4e6e54'}}>{d.note}</p>
            </div>
            <Dots count={d.dots} />
          </button>
        ))}
      </div>
    </div>
  )
}
