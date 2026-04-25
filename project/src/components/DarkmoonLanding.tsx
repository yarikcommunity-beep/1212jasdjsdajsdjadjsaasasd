'use client';

import dynamic from 'next/dynamic';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ScrollBlackHole from './ScrollBlackHole';

const RiftGlassCube = dynamic(() => import('./RiftGlassCube'), {
  ssr: false,
  loading: () => <div className="cube-loader">loading rift glass</div>,
});

const revealLines = [
  'no profile',
  'no face',
  'no signal',
  'only gravity',
];

const featureCards = [
  {
    value: '01',
    title: 'Anonymous shell',
    text: 'Монохромная оболочка без лишних цветов: только глубокий черный, холодный белый свет и тишина.',
  },
  {
    value: '02',
    title: 'Frame by frame',
    text: 'Каждый блок проявляется плавно: параллакс, гравитационное линзирование, зерно и мягкий cinematic blur.',
  },
  {
    value: '03',
    title: 'Exploded black hole',
    text: 'При прокрутке черная дыра масштабируется, раскрывает частицы и будто распадается на отдельные орбиты.',
  },
];

export default function DarkmoonLanding() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const context = gsap.context(() => {
      gsap.fromTo(
        '.gsap-reveal',
        { autoAlpha: 0, y: 64, filter: 'blur(18px)' },
        {
          autoAlpha: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 1.25,
          ease: 'power4.out',
          stagger: 0.14,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 72%',
          },
        },
      );

      gsap.utils.toArray<HTMLElement>('.scroll-copy').forEach((element) => {
        gsap.fromTo(
          element,
          { autoAlpha: 0.18, y: 120, letterSpacing: '0.2em' },
          {
            autoAlpha: 1,
            y: 0,
            letterSpacing: '0.04em',
            ease: 'power3.out',
            scrollTrigger: {
              trigger: element,
              start: 'top 84%',
              end: 'top 42%',
              scrub: 1,
            },
          },
        );
      });
    }, sectionRef);

    return () => context.revert();
  }, []);

  return (
    <main className="darkmoon-page">
      <ScrollBlackHole />

      <motion.div className="deep-space-grid" style={{ y: backgroundY }} />
      <div className="noise-layer" />

      <section className="hero-section">
        <motion.div
          className="hero-kicker"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          d@rkmoon / anonymous gravity interface
        </motion.div>

        <motion.h1
          className="hero-title"
          initial={{ opacity: 0, y: 44, filter: 'blur(18px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        >
          Black silence.
          <span>White gravity.</span>
          Hidden identity.
        </motion.h1>

        <motion.p
          className="hero-copy"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.9, ease: 'easeOut' }}
        >
          Реалистичный черно-белый космический сайт с живой черной дырой,
          рифленым стеклянным 3D-кубом и scroll-анимациями GSAP.
        </motion.p>

        <motion.div
          className="hero-actions"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32, duration: 0.9 }}
        >
          <a href="#rift" className="primary-link">
            enter the void
          </a>
          <a href="#exploded" className="secondary-link">
            exploded view
          </a>
        </motion.div>

        <div className="hero-orbit-note">
          <span>scroll down</span>
          <i />
        </div>
      </section>

      <section ref={sectionRef} id="rift" className="rift-section">
        <div className="section-copy">
          <p className="section-label gsap-reveal">transparent rift cube</p>
          <h2 className="section-title gsap-reveal">
            3D-модель куба из рифленого стекла на React Three Fiber.
          </h2>
          <p className="section-text gsap-reveal">
            Куб вращается в глубокoм черном пространстве: прозрачная поверхность,
            белые преломления, wireframe-ребра и живой glassmorphism.
          </p>
        </div>
        <RiftGlassCube />
      </section>

      <section id="exploded" className="exploded-section">
        <div className="exploded-copy">
          {revealLines.map((line) => (
            <p className="scroll-copy" key={line}>
              {line}
            </p>
          ))}
        </div>
      </section>

      <section className="feature-section">
        {featureCards.map((card, index) => (
          <motion.article
            className="feature-card"
            key={card.value}
            initial={{ opacity: 0, y: 54 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.45 }}
            transition={{ delay: index * 0.1, duration: 0.85, ease: 'easeOut' }}
          >
            <span>{card.value}</span>
            <h3>{card.title}</h3>
            <p>{card.text}</p>
          </motion.article>
        ))}
      </section>

      <section className="final-section">
        <motion.h2
          initial={{ opacity: 0, scale: 0.92 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          d@rkmoon
        </motion.h2>
        <p>анонимность выглядит как тень, движущаяся быстрее света</p>
      </section>
    </main>
  );
}
