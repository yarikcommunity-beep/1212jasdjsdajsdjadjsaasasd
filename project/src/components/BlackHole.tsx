import React from 'react';

const BlackHole: React.FC = () => {
  return (
    <div className="fixed top-0 right-0 w-96 h-96 overflow-hidden pointer-events-none z-0">
      <div className="black-hole">
        {/* Аккреционный диск */}
        <div className="accretion-disk">
          {[...Array(8)].map((_, i) => (
            <div key={i} className={`disk-ring ring-${i}`} />
          ))}
        </div>
        
        {/* Горизонт событий */}
        <div className="event-horizon" />
        
        {/* Сингулярность */}
        <div className="singularity" />
        
        {/* Световые эффекты */}
        <div className="light-ring" />
        <div className="gravitational-lensing" />
      </div>
    </div>
  );
};

export default BlackHole;