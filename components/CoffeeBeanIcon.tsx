import React from 'react';

export default function CoffeeBeanIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-4.42 3.58-8 8-8 .34 0 .67.02 1 .07V12c0 3.31-2.69 6-6 6-.34 0-.67-.02-1-.07z" />
      <path d="M13 4.07c3.95.49 7 3.85 7 7.93 0 4.42-3.58 8-8 8-.34 0-.67-.02-1-.07V12c0-3.31 2.69-6 6-6 .34 0 .67.02 1 .07z" />
    </svg>
  );
}
