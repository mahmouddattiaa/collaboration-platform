import React from 'react';
import { cn } from '@/utils';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}

// Memoized to prevent re-renders when parent re-renders
export const SidebarItem = React.memo(function SidebarItem({ icon, label, isActive = false, onClick }: SidebarItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 w-full px-3 py-2 rounded-md transition-colors',
        isActive 
          ? 'bg-theme-primary/20 text-white'
          : 'text-white/60 hover:text-white hover:bg-white/10'
      )}
    >
      <span className={cn(
        'flex-shrink-0',
        isActive ? 'text-theme-primary' : 'text-white/60'
      )}>
        {icon}
      </span>
      <span className="truncate">{label}</span>
    </button>
  );
}); 