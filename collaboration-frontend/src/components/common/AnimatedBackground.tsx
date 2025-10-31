import React from 'react';
import { cn } from '@/utils';

type AnimatedBackgroundVariant = 'particles' | 'gradient' | 'waves';

interface AnimatedBackgroundProps {
  variant?: AnimatedBackgroundVariant;
  className?: string;
}

export function AnimatedBackground({ 
  variant = 'gradient',
  className 
}: AnimatedBackgroundProps) {
  return (
    <div
      className={cn(
        'fixed inset-0 -z-10',
        variant === 'gradient' && 'bg-gradient-to-br from-dark-light via-dark to-darker',
        variant === 'particles' && 'bg-dark',
        variant === 'waves' && 'bg-dark',
        className
      )}
    >
      {variant === 'particles' && <ParticlesEffect />}
      {variant === 'waves' && <WavesEffect />}
    </div>
  );
}

function ParticlesEffect() {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-60">
      {/* This is a placeholder for an actual particles animation */}
      {/* In a real implementation, you might use a library like particles.js or tsparticles */}
      <div className="absolute h-2 w-2 rounded-full bg-theme-primary animate-pulse" style={{ top: '10%', left: '20%' }} />
      <div className="absolute h-2 w-2 rounded-full bg-theme-secondary animate-pulse" style={{ top: '25%', left: '60%' }} />
      <div className="absolute h-3 w-3 rounded-full bg-theme-emerald animate-pulse" style={{ top: '50%', left: '30%' }} />
      <div className="absolute h-2 w-2 rounded-full bg-theme-primary animate-pulse" style={{ top: '70%', left: '80%' }} />
      <div className="absolute h-2 w-2 rounded-full bg-theme-secondary animate-pulse" style={{ top: '80%', left: '10%' }} />
    </div>
  );
}

function WavesEffect() {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-30">
      {/* This is a placeholder for actual wave animations */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-theme-primary/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-theme-secondary/10 to-transparent" />
    </div>
  );
} 