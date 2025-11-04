import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

const glassCardVariants = cva(
  'relative rounded-2xl backdrop-blur-xl border shadow-lg',
  {
    variants: {
      variant: {
        default: 'glass-card ring-1 ring-auric-gold/20',
        elevated: 'glass-card ring-1 ring-auric-gold/30 shadow-2xl auric-ring',
        subtle: 'glass-panel border-white/10',
        cosmic: 'glass-card ring-1 ring-auric-gold/30 shadow-2xl auric-ring cosmic-glow',
      },
      size: {
        default: 'p-6 md:p-8',
        sm: 'p-4 md:p-6',
        lg: 'p-8 md:p-10',
        xl: 'p-10 md:p-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface GlassCardProps
  extends Omit<HTMLMotionProps<'div'>, 'children'>,
    VariantProps<typeof glassCardVariants> {
  children: React.ReactNode;
  hover?: boolean;
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant, size, hover = true, children, ...props }, ref) => {
    const motionProps = hover
      ? {
          initial: { scale: 0.98, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          whileHover: { 
            scale: 1.01, 
            boxShadow: '0 20px 40px rgba(248, 210, 106, 0.3)' 
          },
          transition: { duration: 0.3, ease: 'easeOut' as const },
        }
      : {
          initial: { scale: 0.98, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          transition: { duration: 0.4, ease: 'easeOut' as const },
        };

    return (
      <motion.div
        className={cn(glassCardVariants({ variant, size }), className)}
        ref={ref}
        {...motionProps}
        {...props}
      >
        {/* Sri Yantra sacred geometry background */}
        <div className="absolute inset-0 sri-yantra pointer-events-none rounded-2xl">
          <svg
            className="w-full h-full opacity-20"
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <defs>
              <radialGradient id="yantraGrad" cx="50%" cy="50%">
                <stop offset="0%" stopColor="rgba(248, 210, 106, 0.1)" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
            </defs>
            <g fill="url(#yantraGrad)" stroke="rgba(248, 210, 106, 0.05)" strokeWidth="0.5">
              {/* Sacred geometric patterns */}
              <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(248, 210, 106, 0.03)" />
              <circle cx="100" cy="100" r="60" fill="none" stroke="rgba(248, 210, 106, 0.04)" />
              <circle cx="100" cy="100" r="40" fill="none" stroke="rgba(248, 210, 106, 0.05)" />
              <polygon points="100,40 130,70 150,70 130,100 140,140 100,120 60,140 70,100 50,70 80,70" opacity="0.02" />
            </g>
          </svg>
        </div>
        
        {/* Content */}
        <div className="relative z-10">{children}</div>
      </motion.div>
    );
  }
);

GlassCard.displayName = 'GlassCard';

export { GlassCard, glassCardVariants };