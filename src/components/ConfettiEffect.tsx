import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  delay: number;
  rotate: number;
  scale: number;
}

interface ConfettiEffectProps {
  trigger: boolean;
}

export const ConfettiEffect: React.FC<ConfettiEffectProps> = ({ trigger }) => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (trigger) {
      const colors = ["#2563EB", "#22C55E", "#F59E0B", "#EF4444", "#EC4899", "#8B5CF6", "#06B6D4"];
      const newPieces = Array.from({ length: 80 }).map((_, i) => ({
        id: i + Date.now(),
        x: Math.random() * 100 - 50, // Percentage offset from center
        y: Math.random() * 100 - 50,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 12 + 6,
        delay: Math.random() * 0.4,
        rotate: Math.random() * 360,
        scale: Math.random() * 0.6 + 0.6
      }));
      setPieces(newPieces);

      const timer = setTimeout(() => {
        setPieces([]);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [trigger]);

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      <AnimatePresence>
        {pieces.map((p) => (
          <motion.div
            key={p.id}
            initial={{
              x: "50vw",
              y: "110vh",
              rotation: 0,
              scale: 0,
              opacity: 1
            }}
            animate={{
              x: `calc(50vw + ${p.x}vw)`,
              y: `calc(30vh + ${p.y}vh)`,
              rotation: p.rotate + 720,
              scale: p.scale,
              opacity: [1, 1, 0.8, 0]
            }}
            transition={{
              duration: 2.5 + Math.random() * 1.5,
              delay: p.delay,
              ease: "easeOut"
            }}
            style={{
              position: "absolute",
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              borderRadius: Math.random() > 0.5 ? "50%" : "3px",
              transform: `rotate(${p.rotate}deg)`
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
