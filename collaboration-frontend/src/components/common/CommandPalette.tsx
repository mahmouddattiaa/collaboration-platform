import React from 'react';
import { Search } from 'lucide-react';

export function CommandPalette() {
  // Placeholder for a real command palette implementation
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button className="flex items-center gap-2 px-4 py-2 bg-dark/80 text-white rounded-lg shadow-lg border border-white/10 hover:bg-dark">
        <Search className="h-4 w-4" />
        <span className="text-sm">Command Palette (⌘K)</span>
      </button>
    </div>
  );
} 