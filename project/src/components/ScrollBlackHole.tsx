'use client';

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const particleCount = 80;
const BlackHoleModel = dynamic(() => import('./BlackHoleModel'), { ssr: false });

export default function ScrollBlackHole() {
  const rootRef = useRef<HTMLDivElement>(null);
  const vortexRef = useRef<HTMLDivElement>(null);
  const coreRef = useRef<HTMLDivElement>(null);
  const debrisRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const context = gsap.context(() => {
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: rootRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1.2,
        },
      });

      timeline
        .to(vortexRef.current, {
          scale: 2.65,
          rotate: 180,
          xPercent: -16,
          yPercent: 13,
          filter: 'blur(0px) contrast(1.25)',
          ease: 'none',
        })
        .to(
          coreRef.current,
          {
            scale: 1.95,
            boxShadow: '0 0 90px rgba(255,255,255,.72), inset 0 0 70px rgba(0,0,0,1)',
            ease: 'none',
          },
          0,
        )
        .to(
          debrisRef.current,
          {
            '--explode': 1,
            rotate: -95,
            scale: 1.45,
            ease: 'none',
          },
          0.15,
        );

      gsap.to('.orbit-particle', {
        '--spin': '360deg',
        duration: 18,
        repeat: -1,
        ease: 'none',
        stagger: {
          each: 0.045,
          from: 'random',
        },
      });

      gsap.to('.cosmic-dust', {
        yPercent: -38,
        opacity: 0.95,
        scrollTrigger: {
          trigger: rootRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
        },
      });
    }, rootRef);

    return () => context.revert();
  }, []);

  return (
    <div ref={rootRef} className="black-hole-scroll-field" aria-hidden="true">
      <div className="cosmic-dust cosmic-dust-one" />
      <div className="cosmic-dust cosmic-dust-two" />
      <div ref={vortexRef} className="scroll-black-hole">
        <div ref={coreRef} className="black-hole-core">
          <BlackHoleModel />
        </div>
        <div ref={debrisRef} className="exploded-view">
          {Array.from({ length: particleCount }).map((_, index) => {
            const angle = (360 / particleCount) * index;
            const radius = 118 + (index % 9) * 12;
            const drift = 62 + (index % 11) * 13;

            return (
              <span
                className="orbit-particle"
                key={index}
                style={
                  {
                    '--angle': `${angle}deg`,
                    '--radius': `${radius}px`,
                    '--drift': `${drift}px`,
                    '--size': `${1 + (index % 5)}px`,
                    '--delay': `${index * -0.12}s`,
                  } as React.CSSProperties
                }
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
