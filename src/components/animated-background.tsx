
"use client";

import React, { useEffect, useState } from 'react';

const icons = ['😂', '🔥', '💀', '💯', '🚀', '🤔', '🤯', '💅', '✨', '🤡', '🐸', '👀'];
const totalIcons = 20;

interface IconState {
  id: number;
  icon: string;
  style: React.CSSProperties;
}

export function AnimatedBackground() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  const generatedIcons = Array.from({ length: totalIcons }).map((_, index) => {
    const duration = 20 + Math.random() * 20; // 20s to 40s
    const delay = Math.random() * -40; // Start at different times
    const left = Math.random() * 100; // Random horizontal start position
    const size = 1 + Math.random() * 2; // Random size from 1rem to 3rem
    const icon = icons[Math.floor(Math.random() * icons.length)];

    return {
      id: index,
      icon,
      style: {
        left: `${left}vw`,
        fontSize: `${size}rem`,
        animationName: 'float',
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`,
        animationTimingFunction: 'linear',
        animationIterationCount: 'infinite',
      } as React.CSSProperties,
    };
  });

  return (
    <div className="fixed inset-0 w-full h-full z-[-1] overflow-hidden pointer-events-none">
      <div className="relative w-full h-full">
        {generatedIcons.map(({ id, icon, style }) => (
          <span key={id} className="absolute bottom-[-10rem] opacity-0 text-primary/30 dark:text-primary/20" style={style}>
            {icon}
          </span>
        ))}
      </div>
    </div>
  );
}
