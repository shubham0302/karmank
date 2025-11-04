import React, { useEffect, useRef, useMemo } from 'react';

interface Star {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  twinkleSpeed: number;
  color: string;
}

interface StarfieldBackgroundProps {
  density?: number;
  className?: string;
}

export const StarfieldBackground = ({ density = 100, className = '' }: StarfieldBackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  
  const stars = useMemo(() => {
    const starArray: Star[] = [];
    const colors = ['#F8D26A', '#38BDF8', '#C6C6D3', '#F5F3FF'];
    const viewportArea = window.innerWidth * window.innerHeight;
    const adaptiveDensity = Math.min(density, Math.floor(viewportArea / 10000));
    
    for (let i = 0; i < adaptiveDensity; i++) {
      starArray.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        radius: Math.random() * 2.5 + 0.3,
        opacity: Math.random() * 0.9 + 0.1,
        twinkleSpeed: Math.random() * 0.015 + 0.003,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
    
    return starArray;
  }, [density]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Create layered nebula background
      const nebula1 = ctx.createRadialGradient(
        canvas.width * 0.3, canvas.height * 0.2, 0,
        canvas.width * 0.3, canvas.height * 0.2, canvas.width * 0.4
      );
      nebula1.addColorStop(0, 'rgba(91, 53, 172, 0.2)');
      nebula1.addColorStop(1, 'transparent');
      
      const nebula2 = ctx.createRadialGradient(
        canvas.width * 0.7, canvas.height * 0.8, 0,
        canvas.width * 0.7, canvas.height * 0.8, canvas.width * 0.3
      );
      nebula2.addColorStop(0, 'rgba(56, 189, 248, 0.15)');
      nebula2.addColorStop(1, 'transparent');
      
      const baseGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      baseGradient.addColorStop(0, 'rgba(10, 22, 64, 0.95)');
      baseGradient.addColorStop(0.5, 'rgba(10, 22, 64, 0.98)');
      baseGradient.addColorStop(1, 'rgba(5, 16, 40, 1)');
      
      ctx.fillStyle = baseGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = nebula1;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = nebula2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw twinkling stars
      stars.forEach(star => {
        const twinkle = Math.sin(Date.now() * star.twinkleSpeed) * 0.3 + 0.7;
        
        ctx.save();
        ctx.globalAlpha = star.opacity * twinkle;
        ctx.fillStyle = star.color;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Add subtle glow for brighter stars
        if (star.radius > 1.5) {
          ctx.globalAlpha = (star.opacity * twinkle) * 0.3;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius * 2, 0, Math.PI * 2);
          ctx.fill();
        }
        
        ctx.restore();
      });
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    animate();

    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [stars]);

  // Respect prefers-reduced-motion
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion && animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      style={{ background: 'linear-gradient(135deg, #0A1640, #051028)' }}
      aria-hidden="true"
    />
  );
};