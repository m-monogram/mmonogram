import { useMemo, forwardRef } from "react";

interface Particle {
  id: number;
  x: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

const ParticleBackground = forwardRef<HTMLDivElement>((_, ref) => {
  const particles = useMemo(() => {
    const newParticles: Particle[] = [];
    const count = 8; // Minimal for performance

    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        size: Math.random() * 1.5 + 0.5,
        duration: Math.random() * 40 + 30,
        delay: Math.random() * 15,
        opacity: Math.random() * 0.2 + 0.05,
      });
    }

    return newParticles;
  }, []);

  return (
    <div ref={ref} className="fixed inset-0 pointer-events-none overflow-hidden z-0 will-change-auto">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="particle absolute rounded-none will-change-transform"
          style={{
            left: `${particle.x}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            background: `radial-gradient(circle, rgba(255, 255, 255, ${particle.opacity}) 0%, transparent 70%)`,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}
    </div>
  );
});

ParticleBackground.displayName = "ParticleBackground";

export default ParticleBackground;
