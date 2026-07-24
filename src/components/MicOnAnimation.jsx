import React, { useEffect, useState } from "react";

export default function MicLevelAnimation({
  barHeight = 8,
  barWidth = 2,
  barSpacing =2,
  barColor = "white",
  baseDuration = 1000,
  active = false,
  className = "",
}) {
  const [animations, setAnimations] = useState([]);

  useEffect(() => {
    const anims = Array(4)
      .fill(0)
      .map(() => ({
        duration: baseDuration + Math.random() * 600,
        delay: Math.random() * 600,
      }));
    setAnimations(anims);
  }, [baseDuration]);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={active ? "Microphone active" : "Microphone inactive"}
      className={`flex  items-center justify-center gap-${barSpacing} ${className} transform transition-transform duration-700 ${
        active ? "scale-110" : "scale-100"
      }`}
      style={{ gap: `${barSpacing * 4}px` }}
    >
      {animations.map((anim, idx) => (
        <div
          key={idx}
          className={`bg-${barColor} rounded-full w-2 h-6 origin-center animate-pulseAlt`}
          style={{
            animationDuration: `${anim.duration}ms`,
            animationDelay: `${anim.delay}ms`,
            animationDirection: "alternate",
            animationIterationCount: "infinite",
            animationTimingFunction: "ease-in-out",
            transformOrigin: "center center",
          }}
        />
      ))}

      <style>{`
        @keyframes pulseAlt {
          0%, 100% {
            transform: scaleY(0.4);
            opacity: 0.6;
          }
          50% {
            transform: scaleY(1);
            opacity: 1;
          }
        }
        .animate-pulseAlt {
          animation-name: pulseAlt;
        }
      `}</style>
    </div>
  );
}
