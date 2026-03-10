import React from 'react';

export default function CoffeeBeanIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M17 8.5c-1.5-2.5-4.5-3.5-7-2-2.5 1-4 4-2.5 6.5s4.5 3.5 7 2 4-4 2.5-6.5z" />
      <path d="M8.5 17c1.5 2.5 4.5 3.5 7 2s4-4 2.5-6.5-4.5-3.5-7-2-4 4-2.5 6.5z" />
      <path d="M8.5 7.5A13.5 13.5 0 0 0 15 17.5" />
    </svg>
  );
}
