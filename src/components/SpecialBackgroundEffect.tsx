import React, { useMemo, useState, useEffect } from 'react';

interface SpecialBackgroundEffectProps {
  theme: string;
  effect: string;
}

// Fetch cinematic, high-contrast colors matching the main user theme choice
const getThemeColors = (themeName: string) => {
  switch (themeName) {
    case 'forest':
      return { primary: '#10b981', secondary: '#047857', Glow: 'rgba(16, 185, 129, 0.45)', core: '#6ee7b7' };
    case 'sunset':
      return { primary: '#f97316', secondary: '#c2410c', Glow: 'rgba(249, 115, 22, 0.45)', core: '#fdba74' };
    case 'lavender':
      return { primary: '#a78bfa', secondary: '#6d28d9', Glow: 'rgba(167, 139, 250, 0.45)', core: '#c4b5fd' };
    case 'crimson':
      return { primary: '#f43f5e', secondary: '#be123c', Glow: 'rgba(244, 63, 94, 0.45)', core: '#fda4af' };
    case 'gold':
      return { primary: '#fbbf24', secondary: '#b45309', Glow: 'rgba(251, 191, 36, 0.45)', core: '#fde047' };
    case 'royal':
      return { primary: '#3b82f6', secondary: '#1d4ed8', Glow: 'rgba(59, 130, 246, 0.45)', core: '#93c5fd' };
    case 'mono':
      return { primary: '#71717a', secondary: '#27272a', Glow: 'rgba(39, 39, 42, 0.25)', core: '#ffffff' };
    case 'default':
    default:
      return { primary: '#ec4899', secondary: '#be185d', Glow: 'rgba(236, 72, 153, 0.45)', core: '#fbcfe8' };
  }
};

const getThemeLeafColors = (themeName: string) => {
  switch (themeName) {
    case 'forest':
      return ['#34d399', '#10b981', '#059669', '#047857', '#065f46'];
    case 'sunset':
      return ['#fde047', '#f97316', '#ea580c', '#ca8a04', '#b45309'];
    case 'lavender':
      return ['#ddd6fe', '#c084fc', '#a78bfa', '#8b5cf6', '#6d28d9'];
    case 'crimson':
      return ['#fca5a5', '#f87171', '#ef4444', '#dc2626', '#b91c1c'];
    case 'gold':
      return ['#fef08a', '#fde047', '#facc15', '#eab308', '#ca8a04'];
    case 'royal':
      return ['#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8'];
    case 'mono':
      return ['#e4e4e7', '#d4d4d8', '#a1a1aa', '#71717a', '#52525b'];
    case 'default':
    default:
      return ['#fbcfe8', '#f472b6', '#ec4899', '#db2777', '#be185d'];
  }
};

// --- DYNAMIC THEMING FOR SINISTER CAT EYES ---
const getThemeEyesConfig = (themeName: string) => {
  switch (themeName) {
    case 'forest':
      return {
        glowClass: 'drop-shadow-[0_0_35px_rgba(16,185,129,0.55)]',
        glowColor: 'rgba(16,185,129,0.15)',
        glowBorder: 'rgba(16,185,129,0.3)',
        glowShadow: '0 0 12px rgba(16,185,129,0.4)',
        irisBg: 'radial-gradient(circle at 50% 50%, #fef08a 0%, #10b981 15%, #059669 45%, #064e3b 80%, #022c22 100%)',
        scleraClass: 'bg-emerald-950',
      };
    case 'sunset':
      return {
        glowClass: 'drop-shadow-[0_0_35px_rgba(249,115,22,0.55)]',
        glowColor: 'rgba(249,115,22,0.15)',
        glowBorder: 'rgba(249,115,22,0.35)',
        glowShadow: '0 0 12px rgba(249,115,22,0.45)',
        irisBg: 'radial-gradient(circle at 50% 50%, #fef08a 0%, #f97316 20%, #ea580c 45%, #7c2d12 80%, #1c0a02 100%)',
        scleraClass: 'bg-orange-950',
      };
    case 'lavender':
      return {
        glowClass: 'drop-shadow-[0_0_35px_rgba(167,139,250,0.55)]',
        glowColor: 'rgba(167,139,250,0.15)',
        glowBorder: 'rgba(167,139,250,0.35)',
        glowShadow: '0 0 12px rgba(167,139,250,0.45)',
        irisBg: 'radial-gradient(circle at 50% 50%, #ffffff 0%, #c084fc 20%, #8b5cf6 45%, #4c1d95 80%, #2e1065 100%)',
        scleraClass: 'bg-purple-950',
      };
    case 'crimson':
      return {
        glowClass: 'drop-shadow-[0_0_35px_rgba(244,63,94,0.55)]',
        glowColor: 'rgba(244,63,94,0.15)',
        glowBorder: 'rgba(244,63,94,0.35)',
        glowShadow: '0 0 12px rgba(244,63,94,0.45)',
        irisBg: 'radial-gradient(circle at 50% 50%, #fef08a 0%, #ef4444 20%, #dc2626 45%, #7f1d1d 80%, #450a0a 100%)',
        scleraClass: 'bg-rose-950',
      };
    case 'gold':
      return {
        glowClass: 'drop-shadow-[0_0_35px_rgba(251,191,36,0.55)]',
        glowColor: 'rgba(251,191,36,0.15)',
        glowBorder: 'rgba(251,191,36,0.35)',
        glowShadow: '0 0 12px rgba(251,191,36,0.45)',
        irisBg: 'radial-gradient(circle at 50% 50%, #ffffff 0%, #fde047 20%, #ca8a04 45%, #78350f 80%, #451a03 100%)',
        scleraClass: 'bg-amber-950',
      };
    case 'royal':
      return {
        glowClass: 'drop-shadow-[0_0_35px_rgba(59,130,246,0.55)]',
        glowColor: 'rgba(59,130,246,0.15)',
        glowBorder: 'rgba(59,130,246,0.35)',
        glowShadow: '0 0 12px rgba(59,130,246,0.45)',
        irisBg: 'radial-gradient(circle at 50% 50%, #ffffff 0%, #60a5fa 20%, #2563eb 45%, #1e3a8a 80%, #172554 100%)',
        scleraClass: 'bg-blue-950',
      };
    case 'mono':
      return {
        glowClass: 'drop-shadow-[0_0_35px_rgba(244,244,245,0.35)]',
        glowColor: 'rgba(244,244,245,0.08)',
        glowBorder: 'rgba(244,244,245,0.2)',
        glowShadow: '0 0 10px rgba(244,244,245,0.2)',
        irisBg: 'radial-gradient(circle at 50% 50%, #ffffff 0%, #d4d4d8 20%, #71717a 45%, #27272a 80%, #09090b 100%)',
        scleraClass: 'bg-zinc-900',
      };
    case 'default':
    default:
      return {
        glowClass: 'drop-shadow-[0_0_35px_rgba(236,72,153,0.55)]',
        glowColor: 'rgba(236,72,153,0.15)',
        glowBorder: 'rgba(236,72,153,0.35)',
        glowShadow: '0 0 12px rgba(236,72,153,0.45)',
        irisBg: 'radial-gradient(circle at 50% 50%, #ffffff 0%, #f472b6 20%, #db2777 45%, #831843 80%, #500724 100%)',
        scleraClass: 'bg-pink-950',
      };
  }
};

// --- MYSTERIOUS NOT CUTE CAT EYES ANIMATION COMPONENT ---
// Perfectly shaped using pure CSS clip-path ovals, scale-independent, responsive, and color-themed.
const MysteriousCatEyes: React.FC<{ theme: string }> = ({ theme }) => {
  const eyeConfig = getThemeEyesConfig(theme);

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none bg-black/75 z-10">
      
      {/* Container for both eyes to handle conjugate spacing */}
      <div className="flex gap-12 sm:gap-20 md:gap-32 px-8" aria-hidden="true">
        
        {/* ================= LEFT EYE ================= */}
        {/* Angled down towards the center for a sinister brow ridge look */}
        <div className={`relative rotate-[6deg] ${eyeConfig.glowClass}`}>
          {/* Outer Blinking Wrapper: Handles the eyelid clips flawlessly */}
          <div className="w-[120px] h-[60px] sm:w-[240px] sm:h-[120px] animate-eye-blink will-change-[clip-path,opacity]">
            {/* The Almond Base (Sclera window) */}
            <div 
              className={`w-[90px] h-[90px] sm:w-[180px] sm:h-[180px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[100%_0_100%_0] ${eyeConfig.scleraClass} overflow-hidden transition-all duration-300`}
              style={{
                border: `2px solid ${eyeConfig.glowBorder}`,
                boxShadow: `inset 0 0 25px 12px rgba(0,0,0,0.95), ${eyeConfig.glowShadow}`,
              }}
            >
              {/* Counter-rotation to keep the iris and pupil perfectly upright */}
              <div className="absolute inset-0 -rotate-45 flex justify-center items-center">
                
                {/* The Colored Iris */}
                <div 
                  className="relative w-[75px] h-[75px] sm:w-[150px] sm:h-[150px] rounded-full flex justify-center items-center animate-iris-scan will-change-transform shadow-[inset_0_0_10px_rgba(0,0,0,0.8)] sm:shadow-[inset_0_0_15px_rgba(0,0,0,0.8)]"
                  style={{
                    background: eyeConfig.irisBg
                  }}
                >
                  {/* The Slit Pupil */}
                  <div className="w-[8px] h-[50px] sm:w-[16px] sm:h-[100px] bg-black rounded-[50%] shadow-[0_0_10px_rgba(0,0,0,0.9)] animate-pupil-dilate will-change-transform"></div>
                </div>

                {/* Wet Glint Highlights: Placed on the globe wrapper so they stay locked as the iris scans behind them */}
                <div className="absolute top-[18px] sm:top-[35px] left-[20px] sm:left-[40px] w-[12px] sm:w-[25px] h-[12px] sm:h-[25px] bg-white/50 rounded-full blur-[1.5px] sm:blur-[2px] pointer-events-none"></div>
                <div className="absolute bottom-[18px] sm:bottom-[35px] right-[20px] sm:right-[40px] w-[18px] sm:w-[35px] h-[8px] sm:h-[15px] bg-white/20 rounded-full blur-[2px] sm:blur-[3px] -rotate-[15deg] pointer-events-none"></div>
              
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT EYE ================= */}
        {/* Symmetrically mirrored inward angle */}
        <div className={`relative -rotate-[6deg] ${eyeConfig.glowClass}`}>
          <div className="w-[120px] h-[60px] sm:w-[240px] sm:h-[120px] animate-eye-blink will-change-[clip-path,opacity]">
            <div 
              className={`w-[90px] h-[90px] sm:w-[180px] sm:h-[180px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[100%_0_100%_0] ${eyeConfig.scleraClass} overflow-hidden transition-all duration-300`}
              style={{
                border: `2px solid ${eyeConfig.glowBorder}`,
                boxShadow: `inset 0 0 25px 12px rgba(0,0,0,0.95), ${eyeConfig.glowShadow}`,
              }}
            >
              <div className="absolute inset-0 -rotate-45 flex justify-center items-center">
                
                <div 
                  className="relative w-[75px] h-[75px] sm:w-[150px] sm:h-[150px] rounded-full flex justify-center items-center animate-iris-scan will-change-transform shadow-[inset_0_0_10px_rgba(0,0,0,0.8)] sm:shadow-[inset_0_0_15px_rgba(0,0,0,0.8)]"
                  style={{
                    background: eyeConfig.irisBg
                  }}
                >
                  <div className="w-[8px] h-[50px] sm:w-[16px] sm:h-[100px] bg-black rounded-[50%] shadow-[0_0_10px_rgba(0,0,0,0.9)] animate-pupil-dilate will-change-transform"></div>
                </div>

                <div className="absolute top-[18px] sm:top-[35px] left-[20px] sm:left-[40px] w-[12px] sm:w-[25px] h-[12px] sm:h-[25px] bg-white/50 rounded-full blur-[1.5px] sm:blur-[2px] pointer-events-none"></div>
                <div className="absolute bottom-[18px] sm:bottom-[35px] right-[20px] sm:right-[40px] w-[18px] sm:w-[35px] h-[8px] sm:h-[15px] bg-white/20 rounded-full blur-[2px] sm:blur-[3px] -rotate-[15deg] pointer-events-none"></div>
              
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

// --- CORE SPECIAL BACKGROUND EFFECT CONTAINER ---
export const SpecialBackgroundEffect: React.FC<SpecialBackgroundEffectProps> = ({ theme, effect }) => {
  const colors = getThemeColors(theme);
  const themeLeafColors = getThemeLeafColors(theme);

  // Generate a premium dense, double-depth shower field
  // Increased density to 142 total screen nodes for true Japanese Sakura forest density
  const elements = useMemo(() => {
    const list = [];
    for (let i = 0; i < 142; i++) {
      const ranType = i % 3; // Leaf path types
      const colorIndex = i % themeLeafColors.length;
      list.push({
        id: i,
        // Densely layered screen placements
        left: `${(i * 0.7 + Math.random() * 1.5) % 100}%`,
        delay: `${Math.random() * 28 - 28}s`,
        duration: `${12 + Math.random() * 14}s`,
        scale: 0.3 + Math.random() * 0.9,
        // Depth mapping: lower scale implies background blur and dimness
        opacity: 0.15 + Math.random() * 0.32,
        swayRange: `${50 + Math.random() * 90}px`,
        pathType: ranType,

        // Beautiful curated dynamic themed palette matching choices
        leafColor: themeLeafColors[colorIndex],

        // Spark direction/speed variations
        sparkSpeed: `${6 + Math.random() * 8}s`,
        sparkDelay: `${Math.random() * -10}s`,
        sparkSway: `${30 + Math.random() * 60}px`,
      });
    }
    return list;
  }, [theme, themeLeafColors]);

  if (!effect || effect === 'none') {
    return null;
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Global CSS Injecting premium Keyframe physics */}
      <style>{`
        /* Slow realistic drift with wide organic sway, falling down from left/top */
        @keyframes customDriftDown {
          0% {
            transform: translateY(-10vh) translateX(0) rotate(0deg);
          }
          30% {
            transform: translateY(35vh) translateX(var(--sway-x, 50px)) rotate(120deg);
          }
          65% {
            transform: translateY(80vh) translateX(calc(var(--sway-x, 50px) * -0.6)) rotate(240deg);
          }
          100% {
            transform: translateY(115vh) translateX(calc(var(--sway-x, 50px) * 1.2)) rotate(360deg);
          }
        }

        /* Floating upwards golden embers physics with glowing twinkle */
        @keyframes floatUpAndSparkle {
          0% {
            transform: translateY(105vh) translateX(0) scale(0) rotate(0deg);
            opacity: 0;
          }
          15% {
            opacity: var(--max-opacity, 0.82);
            transform: translateY(85vh) translateX(calc(var(--spark-sway, 40px) * 0.35)) scale(1.1) rotate(45deg);
          }
          50% {
            transform: translateY(50vh) translateX(calc(var(--spark-sway, 40px) * -0.6)) scale(0.7) rotate(180deg);
            opacity: calc(var(--max-opacity, 0.82) * 0.45);
          }
          80% {
            transform: translateY(18vh) translateX(calc(var(--spark-sway, 40px) * 0.45)) scale(1.2) rotate(270deg);
            opacity: var(--max-opacity, 0.82);
          }
          100% {
            transform: translateY(-8vh) translateX(0) scale(0) rotate(360deg);
            opacity: 0;
          }
        }

        /* Master Eye Timeline (16 seconds looping) */
        @keyframes eye-blink {
          /* SLEEP */
          0%, 5% { clip-path: ellipse(65% 0% at 50% 50%); opacity: 0; }
          /* FADE IN & OPEN LIDS SLOWLY */
          8% { opacity: 1; clip-path: ellipse(65% 2% at 50% 50%); }
          15%, 50% { clip-path: ellipse(65% 45% at 50% 50%); opacity: 1; }
          /* BRIEF MENACING DOUBLE BLINK */
          52% { clip-path: ellipse(65% 45% at 50% 50%); }
          53% { clip-path: ellipse(65% 0% at 50% 50%); }
          55% { clip-path: ellipse(65% 45% at 50% 50%); }
          56% { clip-path: ellipse(65% 0% at 50% 50%); }
          58%, 85% { clip-path: ellipse(65% 45% at 50% 50%); }
          /* DRIFT TO SLEEP */
          95%, 100% { clip-path: ellipse(65% 0% at 50% 50%); opacity: 0; }
        }

        /* Fluid Iris Scanning (Left to Right) */
        @keyframes iris-scan {
          0%, 25% { transform: translate(0, 0); }
          /* Look Left */
          30%, 35% { transform: translate(-16%, 1%); }
          /* Look Right */
          40%, 45% { transform: translate(16%, 1%); }
          /* Return to Center */
          50%, 100% { transform: translate(0, 0); }
        }

        /* Predatory Pupil Dilation */
        @keyframes pupil-dilate {
          /* Huge and round in the dark / waking up */
          0%, 15% { transform: scaleX(3) scaleY(1.05); }
          /* Snap into tight predatory slits */
          20%, 65% { transform: scaleX(0.15) scaleY(1); }
          /* Relax slightly */
          75%, 85% { transform: scaleX(1.1) scaleY(1.02); }
          95%, 100% { transform: scaleX(3) scaleY(1.05); }
        }

        /* Utility classes to bind animations */
        .animate-eye-blink {
          animation: eye-blink 16s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        .animate-iris-scan {
          animation: iris-scan 16s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        .animate-pupil-dilate {
          animation: pupil-dilate 16s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>

      {/* 1. MYSTERIOUS PIERCING CAT EYES */}
      {effect === 'cateyes' && <MysteriousCatEyes theme={theme} />}

      {/* 2. COLOR-THEMED FLOATING LEAVES CASCADE (142 Dynamic Leaves cascade) */}
      {effect === 'leaves' && (
        <div className="absolute inset-0">
          {elements.map((el) => {
            // Curate 3 distinct high-fidelity Sakura leaf vectors
            let leafletPath = "M12,2.5 C14.5,2.5 19,6 19,12 C19,17.5 15.5,21.5 12,21.5 C8.5,21.5 5,17.5 5,12 C5,6 9.5,2.5 12,2.5 Z M12,2.5 C11.5,4.5 10.5,5 12,6.5 C13.5,5 12.5,4.5 12,2.5 Z"; // Classic notched
            if (el.pathType === 1) {
              leafletPath = "M12,1.5 C15.5,4.5 17.5,9.5 16,14.5 C14.5,19.5 9.5,22.5 8,17.5 C6.5,12.5 8.5,4.5 12,1.5 Z"; // Flutter leaf
            } else if (el.pathType === 2) {
              leafletPath = "M12,3 C15,5 18,9 16,14 C14,19 10,21 8,18 C6,15 9,7 12,3 Z"; // Folded single blossom
            }

            return (
              <svg
                key={el.id}
                className="absolute fill-current select-none"
                style={{
                  left: el.left,
                  top: '-5%', // Starts fully offscreen
                  width: `${11 + el.scale * 17}px`,
                  height: `${11 + el.scale * 17}px`,
                  color: el.leafColor,
                  filter: el.scale < 0.65 ? 'blur(1px) opacity(0.55)' : `drop-shadow(0 1px 3px ${colors.Glow})`,
                  animation: `customDriftDown ${el.duration} linear ${el.delay} infinite`,
                  '--sway-x': el.swayRange,
                  opacity: el.opacity * 1.9,
                } as any}
                viewBox="0 0 24 24"
                referrerPolicy="no-referrer"
              >
                <path d={leafletPath} />
              </svg>
            );
          })}
        </div>
      )}

      {/* 3. COLOR-THEMED SPARKS & SHIMMERING EMBERS */}
      {effect === 'sparks' && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {elements.map((el) => {
            // Elegant 4-point magic sparkle vector path
            const sparklePath = "M12,2 L15,9 L22,12 L15,15 L12,22 L9,15 L2,12 L9,9 Z";

            return (
              <svg
                key={el.id}
                className="absolute select-none fill-current"
                style={{
                  left: el.left,
                  width: `${6 + el.scale * 12}px`,
                  height: `${6 + el.scale * 12}px`,
                  color: el.leafColor, // Sparkling matches the active design palette perfectly!
                  filter: el.scale > 0.65 
                    ? `drop-shadow(0 0 ${4 + el.scale * 6}px ${colors.Glow})` 
                    : `blur(0.5px)`,
                  animation: `floatUpAndSparkle ${el.sparkSpeed} ease-in-out ${el.sparkDelay} infinite`,
                  '--spark-sway': el.sparkSway,
                  '--max-opacity': el.opacity * 2.2,
                  opacity: el.opacity * 1.8,
                } as any}
                viewBox="0 0 24 24"
                referrerPolicy="no-referrer"
              >
                <path d={sparklePath} />
              </svg>
            );
          })}
        </div>
      )}
    </div>
  );
};

