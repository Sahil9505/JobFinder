import { useEffect, useState } from 'react';

const StarryBackground = () => {
  const [stars, setStars] = useState([]);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check for prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    // Generate random stars
    const generateStars = () => {
      const starArray = [];
      const starCount = window.innerWidth < 768 ? 50 : 100; // Fewer stars on mobile

      for (let i = 0; i < starCount; i++) {
        starArray.push({
          id: i,
          x: Math.random() * 100, // Percentage
          y: Math.random() * 100,
          size: Math.random() * 2 + 1.5, // 1.5-3.5px
          opacity: Math.random() * 0.5 + 0.5, // 0.5-1.0
          duration: Math.random() * 100 + 100, // 100-200s
          delay: Math.random() * -200, // Stagger start times
          layer: Math.floor(Math.random() * 3) // 3 layers for depth
        });
      }
      return starArray;
    };

    setStars(generateStars());

    // Regenerate on window resize
    const handleResize = () => {
      setStars(generateStars());
    };

    window.addEventListener('resize', handleResize);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  if (prefersReducedMotion) {
    // Static stars for accessibility
    return (
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full bg-white"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity * 0.7,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <style>{`
        @keyframes drift {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(-100vw, 100vh);
          }
        }

        @keyframes twinkle {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
        }

        .star-layer-0 {
          animation: drift var(--duration) linear infinite;
        }

        .star-layer-1 {
          animation: drift var(--duration) linear infinite, twinkle 3s ease-in-out infinite;
        }

        .star-layer-2 {
          animation: drift var(--duration) linear infinite, twinkle 5s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .star-layer-0,
          .star-layer-1,
          .star-layer-2 {
            animation: none !important;
          }
        }
      `}</style>

      {stars.map((star) => (
        <div
          key={star.id}
          className={`absolute rounded-full bg-white star-layer-${star.layer}`}
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            '--duration': `${star.duration}s`,
            animationDelay: `${star.delay}s`,
            willChange: 'transform, opacity',
          }}
        />
      ))}

      {/* Ambient gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-violet-950/5 via-transparent to-fuchsia-950/5 pointer-events-none" />
    </div>
  );
};

export default StarryBackground;
