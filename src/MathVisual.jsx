import React, { useMemo, useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ==========================================
// CONSTANTS & UTILS
// ==========================================
const SHAPES_LIST = ["circle", "square", "strawberry", "apple", "dragon", "orange", "cloud", "fraction_circle", "fish", "cat", "bat", "candy", "car","cake","pizza"];

const PALETTE = [
  { main: "#3b82f6", light: "#60a5fa", dark: "#1d4ed8" }, 
  { main: "#ef4444", light: "#f87171", dark: "#b91c1c" }, 
  { main: "#10b981", light: "#34d399", dark: "#047857" }, 
  { main: "#8b5cf6", light: "#a78bfa", dark: "#5b21b6" }, 
  { main: "#f59e0b", light: "#fbbf24", dark: "#b45309" }, 
  { main: "#ffee00ff", light: "#fde047", dark: "#ffea00ff" }
];

const getRandomColor = () => PALETTE[Math.floor(Math.random() * PALETTE.length)];



// ANIMATED DRIVING CAR
const CarIcon = ({ color }) => {
  const size = "150px";
  const clipId = `car-clip-${color?.main?.replace('#', '') || 'default'}`;
  const roadClipId = `road-clip-${color?.main?.replace('#', '') || 'default'}`;

  return (
    <motion.div
      style={{ width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <svg width="100%" height="100%" viewBox="0 0 160 120" style={{ overflow: "visible", filter: `drop-shadow(0px 8px 10px rgba(0,0,0,0.25))` }}>

       
        {/* ---  THE ROAD --- */}
        <rect x="-10" y="99" width="180" height="8" rx="2" fill="#334155" />
        <rect x="-10" y="107" width="180" height="4" rx="2" fill="#1e293b" opacity="0.5" />

        <clipPath id={roadClipId}>
          <rect x="-10" y="99" width="180" height="8" rx="2" />
        </clipPath>
        <motion.g clipPath={`url(#${roadClipId})`} animate={{ x: [0, -40] }} transition={{ duration: 0.35, repeat: Infinity, ease: "linear" }}>
          <rect x="0" y="102" width="15" height="2" fill="#cbd5e1" />
          <rect x="40" y="102" width="15" height="2" fill="#cbd5e1" />
          <rect x="80" y="102" width="15" height="2" fill="#cbd5e1" />
          <rect x="120" y="102" width="15" height="2" fill="#cbd5e1" />
          <rect x="160" y="102" width="15" height="2" fill="#cbd5e1" />
          <rect x="200" y="102" width="15" height="2" fill="#cbd5e1" />
        </motion.g>

        {/* --- REALISTIC CAR BODY (Balanced & Natural) --- */}
        <motion.g animate={{ y: [-1, 1, -1] }} transition={{ duration: 0.4, repeat: Infinity, ease: "easeInOut" }}>
          
          <clipPath id={clipId}>
            
            <path
              d="M 20 85
                 L 20 60
                 C 20 52, 23 50, 30 50
                 L 43 32
                 C 46 27, 52 25, 60 25
                 L 85 25
                 C 95 25, 100 28, 105 35
                 L 120 50
                 L 132 50
                 C 138 50, 140 54, 140 60
                 L 140 85
                 L 126 85
                 A 16 16 0 0 0 94 85
                 L 66 85
                 A 16 16 0 0 0 34 85
                 Z"
            />
          </clipPath>

          {/* Main Body Color */}
          <path
              d="M 20 85 L 20 60 C 20 52, 23 50, 30 50 L 43 32 C 46 27, 52 25, 60 25 L 85 25 C 95 25, 100 28, 105 35 L 120 50 L 132 50 C 138 50, 140 54, 140 60 L 140 85 L 126 85 A 16 16 0 0 0 94 85 L 66 85 A 16 16 0 0 0 34 85 Z"
              fill={color.main || "#ef4444"}
          />

          {/* Bottom Dark Shadow Overlay */}
          <rect x="0" y="65" width="160" height="25" fill={color.dark || "#b91c1c"} clipPath={`url(#${clipId})`} />

          {/* Windows (Angled perfectly with the body) */}
          <path d="M 50 30 L 73 30 L 73 49 L 36 49 Z" fill="#7dd3fc" stroke="#7dd3fc" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M 76 30 L 92 30 L 109 49 L 76 49 Z" fill="#7dd3fc" stroke="#7dd3fc" strokeWidth="1.5" strokeLinejoin="round" />

          {/* Door Handles */}
          <rect x="39" y="56" width="10" height="3" rx="1.5" fill="#1e293b" />
          <rect x="76" y="56" width="10" height="3" rx="1.5" fill="#1e293b" />

          {/* Bumpers */}
          <rect x="18" y="70" width="4" height="10" rx="1.5" fill="#cbd5e1" />
          <rect x="138" y="70" width="4" height="10" rx="1.5" fill="#cbd5e1" />

          {/* Taillight & Headlight */}
          <rect x="19" y="58" width="3" height="8" rx="1" fill="#ef4444" />
          <ellipse cx="138" cy="62" rx="3.5" ry="5.5" fill="#fffb00ff" />

        </motion.g>

        {/* ---  SPINNING WHEELS (Perfectly centered in arches) --- */}
        
        
        <g transform="translate(50, 85)">
          <motion.g animate={{ rotate: 360 }} transition={{ duration: 0.4, repeat: Infinity, ease: "linear" }}>
            <circle cx="0" cy="0" r="14" fill="#334155" /> 
            <circle cx="0" cy="0" r="9" fill="#e2e8f0" />   
            <circle cx="0" cy="0" r="7" fill="#cbd5e1" />   
            
            <g fill="#64748b">
              <circle cx="0" cy="-4.5" r="1.2" />
              <circle cx="3.9" cy="-2.25" r="1.2" />
              <circle cx="3.9" cy="2.25" r="1.2" />
              <circle cx="0" cy="4.5" r="1.2" />
              <circle cx="-3.9" cy="2.25" r="1.2" />
              <circle cx="-3.9" cy="-2.25" r="1.2" />
            </g>
          </motion.g>
        </g>

        
        <g transform="translate(110, 85)">
          <motion.g animate={{ rotate: 360 }} transition={{ duration: 0.4, repeat: Infinity, ease: "linear" }}>
            <circle cx="0" cy="0" r="14" fill="#334155" /> 
            <circle cx="0" cy="0" r="9" fill="#e2e8f0" />   
            <circle cx="0" cy="0" r="7" fill="#cbd5e1" />   
            
            <g fill="#64748b">
              <circle cx="0" cy="-4.5" r="1.2" />
              <circle cx="3.9" cy="-2.25" r="1.2" />
              <circle cx="3.9" cy="2.25" r="1.2" />
              <circle cx="0" cy="4.5" r="1.2" />
              <circle cx="-3.9" cy="2.25" r="1.2" />
              <circle cx="-3.9" cy="-2.25" r="1.2" />
            </g>
          </motion.g>
        </g>

      </svg>
    </motion.div>
  );
};










// PREMIUM GLOSSY CANDY 
const CandyIcon = ({ color }) => {
  const size = "150px";
  const clipId = `candy-clip-${color.main.replace('#', '')}`;

  return (
    <motion.div
      animate={{ y: [-3, 3, -3], rotate: [-2, 2, -2] }} 
      transition={{ duration: 3 + Math.random(), repeat: Infinity, ease: "easeInOut" }}
      style={{ width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center", willChange: "transform" }}
    >
      <svg width="100%" height="100%" viewBox="0 0 120 120" style={{ overflow: "visible", filter: `drop-shadow(0px 8px 12px rgba(0,0,0,0.25))` }}>

        {/* ---  LEFT WRAPPER (Wavy / Scalloped Edges, No Outlines) --- */}
        <motion.path
          d="M 32 60 Q 20 38 6 42 Q 16 51 6 60 Q 16 69 6 78 Q 20 82 32 60 Z"
          fill={color.main}
          animate={{ rotate: [0, -3, 0], scale: [1, 1.02, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "32px 60px" }}
        />
        
        <path d="M 28 60 Q 18 45 10 47" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.3" />
        <path d="M 28 60 Q 18 75 10 73" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.2" />
        <path d="M 26 60 Q 16 60 8 60" stroke="#000000" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.15" />

       
        <motion.path
          d="M 88 60 Q 100 38 114 42 Q 104 51 114 60 Q 104 69 114 78 Q 100 82 88 60 Z"
          fill={color.main}
          animate={{ rotate: [0, 3, 0], scale: [1, 1.02, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
          style={{ transformOrigin: "88px 60px" }}
        />
        
        <path d="M 92 60 Q 102 45 110 47" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.3" />
        <path d="M 92 60 Q 102 75 110 73" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.2" />
        <path d="M 94 60 Q 104 60 112 60" stroke="#000000" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.15" />

        {/* --- CANDY SHADOW BENEATH BODY --- */}
        
        <ellipse cx="32" cy="60" rx="4" ry="12" fill="#000000" opacity="0.3" />
        <ellipse cx="88" cy="60" rx="4" ry="12" fill="#000000" opacity="0.3" />


        {/* --- MAIN CANDY BODY (Pill Shape) --- */}
        <clipPath id={clipId}>
          <rect x="25" y="38" width="70" height="44" rx="22" />
        </clipPath>

        {/* Base Candy Color */}
        <rect x="25" y="38" width="70" height="44" rx="22" fill={color.main} />

        <g clipPath={`url(#${clipId})`}>
          
          
          <polygon points="15,38 28,38 18,82 5,82" fill="white" opacity="0.95" />
          <polygon points="35,38 48,38 38,82 25,82" fill="white" opacity="0.95" />
          <polygon points="55,38 68,38 58,82 45,82" fill="white" opacity="0.95" />
          <polygon points="75,38 88,38 78,82 65,82" fill="white" opacity="0.95" />
          <polygon points="95,38 108,38 98,82 85,82" fill="white" opacity="0.95" />

          {/* ---  GLOSSY SHADING (3D Magic without any black outlines!) --- */}
          
          {/* Bottom Dark Shadow (Gives it a round 3D feel) */}
          <rect x="25" y="60" width="70" height="22" fill="#1e293b" opacity="0.3" />

          {/* 🌟 HUGE GLASSY HIGHLIGHT (The most important part for the jelly look!) */}
          <rect x="32" y="42" width="56" height="10" rx="5" fill="white" opacity="0.75" />

          {/* Small Bounce Light at the bottom edge */}
          <path d="M 35 77 Q 60 82 85 77" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.4" />
        </g>

      </svg>
    </motion.div>
  );
};





// ANIMATED BAT & BALL 

const BatBallIcon = ({ color }) => {
  const size = "150px";

  return (
    <motion.div
      style={{ width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <svg width="100%" height="100%" viewBox="0 0 120 120" style={{ overflow: "visible", filter: `drop-shadow(0px 8px 10px rgba(0,0,0,0.2))` }}>

        {/* --- THE BALL (Perfectly aligned with Bat swing!) --- */}
        <motion.g
          animate={{ 
              x: [0, 0, -80, -80], 
              y: [0, 0, -90, -90], 
              opacity: [1, 1, 0, 0], 
              scale: [1, 1, 0.4, 0.4], 
              rotate: [0, 0, -360, -360] 
          }}
          transition={{ duration: 2.5, repeat: Infinity, times: [0, 0.24, 0.6, 1], ease: "easeOut" }}
          style={{ transformOrigin: "32px 95px" }}
        >
          {/* Main Ball Body */}
          <circle cx="32" cy="95" r="7" fill="#ef4444" />
          {/* Ball Seam (Stitching line) */}
          <path d="M 27 91 Q 32 95 27 99 M 37 91 Q 32 95 37 99" stroke="white" strokeWidth="1.2" fill="none" />
        </motion.g>

       
        <motion.g
          animate={{ rotate: [0, -35, 60, 0] }} 
          transition={{ duration: 2.5, repeat: Infinity, times: [0, 0.15, 0.3, 1], ease: "easeInOut" }}
          style={{ transformOrigin: "60px 15px" }} // Handle top pivot
        >
          {/*  Main Bat Blade */}
          <path 
            d="M 55 35 
               C 49 35, 47 42, 47 48 
               L 47 112 
               C 47 115, 48 116, 50 116 
               L 70 116 
               C 72 116, 73 115, 73 112 
               L 73 48 
               C 73 42, 71 35, 65 35 
               Z" 
            fill="#fde0b2" 
            stroke="#1e293b" 
            strokeWidth="2.5" 
            strokeLinejoin="round" 
          />

          {/* Wood Splice */}
          <path d="M 55 35 Q 60 48 65 35 Z" fill="#1e293b" />

          {/* V-Stickers */}
          <path d="M 47.5 48 L 60 58 L 72.5 48 L 72.5 56 L 60 66 L 47.5 56 Z" fill={color.main || "#3b82f6"} stroke="#1e293b" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M 47.5 60 L 60 70 L 72.5 60 L 72.5 68 L 60 78 L 47.5 68 Z" fill={color.dark || "#1d4ed8"} stroke="#1e293b" strokeWidth="1.5" strokeLinejoin="round" />

          {/* Glossy White Highlights */}
          <line x1="51.5" y1="73" x2="51.5" y2="102" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
          <line x1="51.5" y1="108" x2="51.5" y2="111" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.8" />

          {/* Handle Grip */}
          <rect x="55" y="10" width="10" height="26" fill={color.light || "#ef4444"} stroke="#1e293b" strokeWidth="2" />
          
          {/* Grip Texture */}
          <g stroke="#1e293b" strokeWidth="1.5" opacity="0.6">
            <line x1="55" y1="14" x2="65" y2="18" />
            <line x1="55" y1="19" x2="65" y2="23" />
            <line x1="55" y1="24" x2="65" y2="28" />
            <line x1="55" y1="29" x2="65" y2="33" />
          </g>

          {/* Handle Knob / Top */}
          <rect x="53" y="6" width="14" height="4" rx="1.5" fill="#1e293b" />
          <rect x="54" y="3" width="12" height="3" fill={color.light || "#ef4444"} stroke="#1e293b" strokeWidth="1.5" />
        </motion.g>

      </svg>
    </motion.div>
  );
};


// Cake 
const CakeSliceVisual = ({ numerator, denominator, compact = false }) => {
  const cx = 50;
  const cy = 50;
  const r = 45;
  const boxSize = compact ? "200px" : "250px";

  const WARM_CAKE = "#FFD4B8";
  const WARM_CAKE_LIGHT = "#FFE8D6";
  const EMPTY_SLICE = "#f8fafc";
  const FROSTING = "#FFF5EE";

  const SPRINKLE_COLORS = ["#FF6B9D", "#FFD93D", "#6BCB77", "#4D96FF", "#C77DFF", "#FF8FAB"];

  const createSlicePath = (index, total) => {
    if (total <= 1) return null;

    const startAngle = (index * 360) / total - 90;
    const endAngle = ((index + 1) * 360) / total - 90;
    const startRad = (Math.PI / 180) * startAngle;
    const endRad = (Math.PI / 180) * endAngle;

    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);

    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  const getSprinkles = (sliceIndex, total) => {
    const midAngle = (((sliceIndex + 0.5) * 360) / total - 90) * (Math.PI / 180);
    const sprinkles = [];
    const count = 4 + (sliceIndex % 3);

    for (let s = 0; s < count; s++) {
      const dist = 12 + ((sliceIndex * 7 + s * 11) % 25);
      const angleOffset = ((s * 17 + sliceIndex * 13) % 40 - 20) * (Math.PI / 180);
      const angle = midAngle + angleOffset;
      const sx = cx + dist * Math.cos(angle);
      const sy = cy + dist * Math.sin(angle);
      const color = SPRINKLE_COLORS[(sliceIndex + s) % SPRINKLE_COLORS.length];
      const rotation = (sliceIndex * 37 + s * 53) % 360;
      const isDot = s % 2 === 0;

      sprinkles.push(
        isDot ? (
          <circle key={`sp-${sliceIndex}-${s}`} cx={sx} cy={sy} r="1.4" fill={color} opacity="0.95" />
        ) : (
          <rect
            key={`sp-${sliceIndex}-${s}`}
            x={sx - 1.8}
            y={sy - 0.6}
            width="3.6"
            height="1.2"
            rx="0.4"
            fill={color}
            opacity="0.95"
            transform={`rotate(${rotation} ${sx} ${sy})`}
          />
        )
      );
    }
    return sprinkles;
  };

  const renderSlices = () => {
    if (denominator <= 0) return null;

    if (denominator === 1) {
      const isFilled = numerator >= 1;
      return (
        <g>
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill={isFilled ? WARM_CAKE : EMPTY_SLICE}
            stroke="#e2e8f0"
            strokeWidth="1"
          />
          {isFilled && getSprinkles(0, 1)}
        </g>
      );
    }

    return Array.from({ length: denominator }).map((_, i) => {
      const isFilled = i < numerator;
      const pathData = createSlicePath(i, denominator);
      return (
        <g key={`cake-slice-${i}`}>
          <path
            d={pathData}
            fill={isFilled ? (i % 2 === 0 ? WARM_CAKE : WARM_CAKE_LIGHT) : EMPTY_SLICE}
            stroke="#cbd5e1"
            strokeWidth="1.2"
          />
          {isFilled && getSprinkles(i, denominator)}
        </g>
      );
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ width: boxSize, height: boxSize }}>
        <svg
          viewBox="0 0 100 100"
          style={{
            width: "100%",
            height: "100%",
            filter: "drop-shadow(0px 6px 14px rgba(255, 182, 193, 0.45))",
          }}
        >
          {/* Frosting ring around the cake edge */}
          <circle
            cx={cx}
            cy={cy}
            r={r + 1.5}
            fill="none"
            stroke={FROSTING}
            strokeWidth="4"
            opacity="0.9"
          />
          <circle
            cx={cx}
            cy={cy}
            r={r + 3}
            fill="none"
            stroke="#FECDD3"
            strokeWidth="1.5"
            strokeDasharray="3 4"
            opacity="0.7"
          />

          {renderSlices()}

          {/* Center cherry decoration */}
          <circle cx={cx} cy={cy} r="4.5" fill="#EF4444" stroke="#B91C1C" strokeWidth="0.8" />
          <circle cx={cx - 1.2} cy={cy - 1.2} r="1.2" fill="rgba(255,255,255,0.55)" />

          {/* Tiny frosting dollops around the edge */}
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i * 45 - 90) * (Math.PI / 180);
            const fx = cx + (r - 2) * Math.cos(angle);
            const fy = cy + (r - 2) * Math.sin(angle);
            return (
              <circle
                key={`frost-${i}`}
                cx={fx}
                cy={fy}
                r="2.2"
                fill="#FFF0F5"
                stroke="#FECDD3"
                strokeWidth="0.6"
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
};

// Pizza 
const PizzaSliceVisual = ({ numerator, denominator, compact = false }) => {
  const cx = 50;
  const cy = 50;
  const r = 45;
  const boxSize = compact ? "200px" : "250px";

  const PIZZA_TOP = "#F59E0B";
  const PIZZA_TOP_LIGHT = "#FBBF24";
  const PIZZA_SAUCE = "#EA580C";
  const DOUGH = "#F5E6C8";
  const DOUGH_EDGE = "#E8D5A8";
  const CRUST = "#D97706";

  const createSlicePath = (index, total) => {
    if (total <= 1) return null;

    const startAngle = (index * 360) / total - 90;
    const endAngle = ((index + 1) * 360) / total - 90;
    const startRad = (Math.PI / 180) * startAngle;
    const endRad = (Math.PI / 180) * endAngle;

    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);

    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  const getPepperoni = (sliceIndex, total) => {
    const midAngle = (((sliceIndex + 0.5) * 360) / total - 90) * (Math.PI / 180);
    const toppings = [];
    const count = 3 + (sliceIndex % 3);

    for (let p = 0; p < count; p++) {
      const dist = 14 + ((sliceIndex * 5 + p * 9) % 22);
      const angleOffset = ((p * 19 + sliceIndex * 11) % 36 - 18) * (Math.PI / 180);
      const angle = midAngle + angleOffset;
      const px = cx + dist * Math.cos(angle);
      const py = cy + dist * Math.sin(angle);
      const pr = 2.2 + (p % 2) * 0.6;

      toppings.push(
        <g key={`pep-${sliceIndex}-${p}`}>
          <circle cx={px} cy={py} r={pr} fill="#DC2626" stroke="#991B1B" strokeWidth="0.5" />
          <circle cx={px - 0.5} cy={py - 0.5} r={pr * 0.25} fill="rgba(255,255,255,0.35)" />
        </g>
      );
    }

    const cheeseAngle = midAngle + 0.15;
    const cheeseDist = 8 + (sliceIndex % 4) * 3;
    toppings.push(
      <circle
        key={`cheese-${sliceIndex}`}
        cx={cx + cheeseDist * Math.cos(cheeseAngle)}
        cy={cy + cheeseDist * Math.sin(cheeseAngle)}
        r="1.5"
        fill="#FDE68A"
        opacity="0.85"
      />
    );

    return toppings;
  };

  const renderSlices = () => {
    if (denominator <= 0) return null;

    if (denominator === 1) {
      const isFilled = numerator >= 1;
      return (
        <g>
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill={isFilled ? PIZZA_TOP : DOUGH}
            stroke={DOUGH_EDGE}
            strokeWidth="1"
          />
          {isFilled && getPepperoni(0, 1)}
        </g>
      );
    }

    return Array.from({ length: denominator }).map((_, i) => {
      const isFilled = i < numerator;
      const pathData = createSlicePath(i, denominator);
      return (
        <g key={`pizza-slice-${i}`}>
          <path
            d={pathData}
            fill={
              isFilled
                ? i % 2 === 0
                  ? PIZZA_TOP
                  : PIZZA_TOP_LIGHT
                : DOUGH
            }
            stroke="#D4C4A0"
            strokeWidth="1.2"
          />
          {isFilled && (
            <>
              <path
                d={pathData}
                fill={PIZZA_SAUCE}
                opacity="0.25"
                style={{ pointerEvents: "none" }}
              />
              {getPepperoni(i, denominator)}
            </>
          )}
        </g>
      );
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ width: boxSize, height: boxSize }}>
        <svg
          viewBox="0 0 100 100"
          style={{
            width: "100%",
            height: "100%",
            filter: "drop-shadow(0px 6px 14px rgba(245, 158, 11, 0.4))",
          }}
        >
          {/* Golden crust ring */}
          <circle
            cx={cx}
            cy={cy}
            r={r + 2}
            fill="none"
            stroke={CRUST}
            strokeWidth="5"
            opacity="0.95"
          />
          <circle
            cx={cx}
            cy={cy}
            r={r + 4.5}
            fill="none"
            stroke="#B45309"
            strokeWidth="1.5"
            opacity="0.6"
          />

          {renderSlices()}

          {/* Slice divider lines */}
          {denominator > 1 &&
            Array.from({ length: denominator }).map((_, i) => {
              const angle = ((i * 360) / denominator - 90) * (Math.PI / 180);
              const x2 = cx + r * Math.cos(angle);
              const y2 = cy + r * Math.sin(angle);
              return (
                <line
                  key={`cut-${i}`}
                  x1={cx}
                  y1={cy}
                  x2={x2}
                  y2={y2}
                  stroke="#92400E"
                  strokeWidth="1"
                  opacity="0.35"
                />
              );
            })}
        </svg>
      </div>
    </div>
  );
};





// Cat 

const CatIcon = ({ color }) => {
  const size = "150px"; 

  // ---  Realistic Cat Coat Colors ---
  const CAT_PALETTES = [
    { body: "#d9772b", dark: "#b45309", chest: "#fef3c7", eye: "#fcd34d" }, 
    { body: "#334155", dark: "#0f172a", chest: "#475569", eye: "#fde047" }, 
    { body: "#94a3b8", dark: "#64748b", chest: "#f1f5f9", eye: "#bef264" }, 
    { body: "#e7e5e4", dark: "#57534e", chest: "#fafaf9", eye: "#60a5fa" }  
  ];

  
  const P = ["#3b82f6", "#ef4444", "#10b981", "#8b5cf6", "#f59e0b", "#ffee00ff"];
  let cIndex = P.findIndex(p => p === color?.main);
  if (cIndex === -1) cIndex = 0;
  const pal = CAT_PALETTES[cIndex % CAT_PALETTES.length];

  return (
    <motion.div
      animate={{ y: [-3, 3, -3] }} 
      transition={{ duration: 3 + Math.random(), repeat: Infinity, ease: "easeInOut" }}
      style={{ width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center", willChange: "transform" }}
    >
      <svg width="100%" height="100%" viewBox="0 0 120 120" style={{ filter: `drop-shadow(0px 8px 12px rgba(0,0,0,0.25))`, overflow: "visible" }}>
        
        {/* --- CURLED TAIL  --- */}
        <motion.path 
          d="M 80 85 C 115 90, 120 45, 95 40 C 85 38, 80 50, 88 58" 
          stroke={pal.dark} strokeWidth="9" fill="none" strokeLinecap="round"
          animate={{ rotate: [-2, 4, -2] }} 
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "80px 85px" }}
        />

        {/* --- BACK LEG & PAW  --- */}
        {/* Haunch  */}
        <ellipse cx="70" cy="76" rx="14" ry="22" fill={pal.dark} />
        {/* Paw */}
        <rect x="73" y="96" width="16" height="8" rx="4" fill={pal.chest} />
        {/* Toes  */}
        <line x1="84" y1="103" x2="84" y2="98" stroke="rgba(0,0,0,0.2)" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="78" y1="103" x2="78" y2="98" stroke="rgba(0,0,0,0.2)" strokeWidth="1.5" strokeLinecap="round"/>

        {/* --- BACK FRONT-LEG  --- */}
        <rect x="52" y="65" width="11" height="35" rx="5" fill={pal.dark} />
        <rect x="52" y="96" width="15" height="8" rx="4" fill={pal.chest} />
        <line x1="56" y1="103" x2="56" y2="98" stroke="rgba(0,0,0,0.2)" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="62" y1="103" x2="62" y2="98" stroke="rgba(0,0,0,0.2)" strokeWidth="1.5" strokeLinecap="round"/>

        {/* --- MAIN BODY (Geometric curve) --- */}
        <path d="M 45 40 C 75 40, 88 65, 88 98 L 35 98 C 35 70, 30 55, 45 40 Z" fill={pal.body} />

        {/* --- LIGHT CHEST / BELLY PATCH  --- */}
        <path d="M 40 40 C 35 55, 30 75, 35 98 L 55 98 C 55 75, 52 55, 45 40 Z" fill={pal.chest} />

        {/* --- FOREGROUND FRONT-LEG  --- */}
        <rect x="33" y="65" width="11" height="35" rx="5" fill={pal.body} />
        <rect x="31.5" y="96" width="15" height="8" rx="4" fill={pal.chest} />
        <line x1="35.70" y1="103" x2="35.70" y2="97.8" stroke="rgba(0,0,0,0.2)" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="41" y1="103" x2="41" y2="97.8" stroke="rgba(0,0,0,0.2)" strokeWidth="1.5" strokeLinecap="round"/>

        {/* --- HEAD --- */}
        <circle cx="45" cy="38" r="20" fill={pal.body} />

        {/* --- EARS  --- */}
        {/* Left Ear (Back) */}
        <polygon points="28,30 32,10 44,22" fill={pal.dark} />
        {/* Right Ear (Front) */}
        <polygon points="48,22 58,10 63,30" fill={pal.body} />
        <polygon points="51,23 57,15 60,28" fill="#fbcfe8" /> {/* Inner Pink Ear */}

        
        <circle cx="37" cy="36" r="4.5" fill={pal.eye} /> 
        <circle cx="37" cy="36" r="2" fill="#1e293b" />   
        <circle cx="53" cy="36" r="4.5" fill={pal.eye} /> 
        <circle cx="53" cy="36" r="2" fill="#1e293b" />   

        {/* --- NOSE --- */}
        <polygon points="43,43 47,43 45,46" fill="#fbcfe8" />

        {/* --- CUTE MOUTH  --- */}
        <path d="M 40 47 Q 42.5 50 45 47 Q 47.5 50 50 47" stroke="#1e293b" strokeWidth="1.5" fill="none" strokeLinecap="round" />

        {/* --- WHISKERS --- */}
        {/* Left Side */}
        <line x1="18" y1="41" x2="30" y2="43" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="16" y1="45" x2="30" y2="45" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="18" y1="49" x2="30" y2="47" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
        
        {/* Right Side */}
        <line x1="60" y1="43" x2="72" y2="41" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="60" y1="45" x2="74" y2="45" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="60" y1="47" x2="72" y2="49" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>

      </svg>
    </motion.div>
  );
};





// Fish
const FishIcon = ({ color}) => {
  const size = "150px"; 
  const bodyGradId = `fish-body-${color.main.replace('#', '')}`;
  const finGradId = `fish-fin-${color.main.replace('#', '')}`;

  return (
    <motion.div
      animate={{ y: [-6, 6, -6], rotate: [-2, 2, -2] }} 
      transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, ease: "easeInOut" }}
      style={{ width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center", willChange: "transform" }}
    >
      <svg width="100%" height="100%" viewBox="0 0 120 100" style={{ filter: `drop-shadow(0px 10px 15px rgba(0,0,0,0.3))`, overflow: "visible" }}>
        <defs>
          <radialGradient id={bodyGradId} cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor={color.light} />
            <stop offset="60%" stopColor={color.main} />
            <stop offset="100%" stopColor={color.dark} />
          </radialGradient>

          <linearGradient id={finGradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color.main} />
            <stop offset="100%" stopColor={color.dark} />
          </linearGradient>
        </defs>

        {/* Tail */}
        <motion.path 
          d="M 28 50 C 10 30, -5 20, 0 35 C 10 48, 10 52, 0 65 C -5 80, 10 70, 28 50 Z" 
          fill={`url(#${finGradId})`} 
          animate={{ scaleX: [1, 0.85, 1], rotate: [-6, 6, -6] }} 
          transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }} 
          style={{ transformOrigin: "28px 50px" }} 
        />

        {/* Top & Bottom Fins */}
        <path d="M 40 30 C 50 10, 70 12, 80 40 Z" fill={`url(#${finGradId})`} />
        <path d="M 45 70 C 55 90, 70 88, 75 60 Z" fill={`url(#${finGradId})`} />

        {/* Main Body */}
        <path d="M 20 50 C 35 20, 80 25, 95 50 C 80 75, 35 80, 20 50 Z" fill={`url(#${bodyGradId})`} />
        
        {/* Belly Shadow */}
        <path d="M 28 62 C 45 78, 75 75, 85 60 C 70 70, 45 70, 28 62 Z" fill="black" opacity="0.15" />
        
        {/* Glossy Highlight */}
        <path d="M 28 38 C 45 22, 75 25, 85 40 C 70 30, 45 30, 28 38 Z" fill="white" opacity="0.3" />

        {/* Eye */}
        <circle cx="80" cy="42" r="5.5" fill="white" />
        <circle cx="82" cy="42" r="3" fill="#1e293b" />
        <circle cx="83.5" cy="41" r="1.2" fill="white" />

        
        <path d="M 84 53 Q 90 55 94 51" stroke="rgba(0, 0, 0, 0.63)" strokeWidth="1.5" strokeLinecap="round" fill="none" />

        {/* Flapping Side Fin */}
        <motion.path 
          d="M 50 55 C 35 48, 40 75, 60 65 C 55 60, 52 58, 50 55 Z" 
          fill={`url(#${finGradId})`} 
          animate={{ scaleY: [1, 0.6, 1], rotate: [-10, 15, -10] }} 
          transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }} 
          style={{ transformOrigin: "50px 55px" }} 
        />
      </svg>
    </motion.div>
  );
};

const WaterBackground = () => (
  <motion.div 
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }}
    style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, overflow: "hidden", zIndex: 0, pointerEvents: "none", borderRadius: "20px" }}
  >
    {/*  SOLID VIBRANT TROPICAL OCEAN */}
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #00b4db 0%, #0083B0 50%, #0369a1 100%)" }} />
    
    {/*  ANIMATED OCEAN CURRENTS  */}
    <motion.div
      animate={{ x: ["-5%", "5%", "-5%"], y: ["0%", "-3%", "0%"] }}
      transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      style={{
        position: "absolute", inset: "-10%",
        background: "radial-gradient(circle at 30% 60%, rgba(255,255,255,0.06) 0%, transparent 40%), radial-gradient(circle at 70% 40%, rgba(2,132,199,0.3) 0%, transparent 50%)"
      }}
    />

    {/*  ANIMATED SUNLIGHT RAYS  */}
    <motion.div
      animate={{ rotate: [-2, 2, -2], opacity: [0.5, 0.8, 0.5] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      style={{
        position: "absolute", top: "-10%", left: "-20%", right: "-20%", height: "150%",
        background: "repeating-linear-gradient(15deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.05) 4%, transparent 4%, transparent 8%)",
        transformOrigin: "top center"
      }}
    />

    {/* FULL-SCREEN BUBBLES  */}
    {Array.from({ length: 25 }).map((_, i) => {
        const startLeft = Math.random() * 100; 
        const size = 10 + Math.random() * 20;  
        return (
          <motion.div key={`bub-${i}`}
            style={{ 
                position: "absolute", 
                left: `${startLeft}%`, 
                bottom: "-50px", 
                width: size, height: size, 
                borderRadius: "50%", 
                border: "2px solid rgba(255,255,255,0.4)", 
                background: "linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.05) 100%)", 
                boxShadow: "0 0 8px rgba(255,255,255,0.2)" 
            }}
            initial={{ y: 0, opacity: 0 }}
            animate={{ 
                y: -800, 
                x: [-15, 15, -15], 
                opacity: [0, 0.7, 0.7, 0] 
            }}
            transition={{ 
                y: { duration: 4 + Math.random() * 5, repeat: Infinity, ease: "linear", delay: Math.random() * 5 }, 
                x: { duration: 2 + Math.random() * 2, repeat: Infinity, ease: "easeInOut" }, 
                opacity: { duration: 4 + Math.random() * 5, repeat: Infinity, ease: "linear" } 
            }}
          />
        );
    })}
  </motion.div>
);






// FRACTION CIRCLE COMPONENT 

const FractionCircle = ({ numerator, denominator, color }) => {
  const cx = 50;
  const cy = 50;
  const r = 45; 

  
  const hammerImagePath = "/hammer.png"; 

  //  AUTOMATIC TIMELINE SETTINGS (Slow & Step-by-Step)
  const circleAppearTime = 2.5; 
  const hammerStartTime = 8.0;  
  const swingDuration = 0.9;    
  const hammerEndTime = hammerStartTime + ((denominator - 1) * swingDuration);
  const fillStartTime = hammerEndTime + 0.6; 

  const createSlice = (index, total) => {
    if (total <= 1) return <circle key={index} cx={cx} cy={cy} r={r} fill={index < numerator ? color.main : "transparent"} />;

    const startAngle = (index * 360) / total - 90; 
    const endAngle = ((index + 1) * 360) / total - 90;

    const startRad = (Math.PI / 180) * startAngle;
    const endRad = (Math.PI / 180) * endAngle;

    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);

    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    const pathData = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
    
    const isFilled = index < numerator;
    
    
    const lineDrawTime = hammerStartTime + (index * swingDuration) + (swingDuration / 2);

    return (
      <g key={`slice-${index}`}>
        {/*  Color Fill Animation  */}
        <motion.path
          d={pathData}
          fill={color.main}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: isFilled ? 1 : 0, scale: isFilled ? 1 : 0.8 }}
          transition={{ duration: 0.3, delay: fillStartTime + (index * 0.3) }} 
          style={{ transformOrigin: "50px 50px" }}
        />
        {/* Partition Lines synced with Hammer Strike */}
        <motion.path
          d={pathData}
          fill="none"
          stroke="#1e293b"
          strokeWidth="1.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.2, delay: lineDrawTime }} 
        />
      </g>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      
      {/*  250x250 WRAPPER TO KEEP EVERYTHING CENTERED */}
      <div style={{ position: "relative", width: "250px", height: "250px" }}>
        
       
        {denominator > 0 && (
            <motion.div
              initial={{ opacity: 0, rotate: 100 }} 
              animate={{ 
                  opacity: [0, 1, 1, 0], 
                  rotate: [60, 0, 60] 
              }}
              transition={{ 
                  opacity: { delay: hammerStartTime - 0.2, duration: (denominator * swingDuration) + 0.5, times: [0, 0.05, 0.95, 1] },
                  rotate: { 
                           delay: hammerStartTime, 
                           duration: swingDuration, 
                           repeat: denominator > 1 ? denominator - 2 : 0, 
                           ease: "easeInOut" 
                          }
              }}
              style={{ 
                  position: "absolute", 
                  top: "33px",  
                  left: "110px", 
                  width: "140px", 
                  height: "180px", 
                  zIndex: 10, 
                  transformOrigin: "bottom center", 
                  pointerEvents: "none" 
              }}
            >
            
              <img 
                src={hammerImagePath} 
                alt="Hammer tool"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  filter: "drop-shadow(2px 6px 8px rgba(0,0,0,0.5))"
                }}
              />
            </motion.div>
        )}

        {/*  CIRCLE LAYER */}
        <motion.div style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0, zIndex: 1 }}>
          <svg viewBox="0 0 100 100" style={{ filter: `drop-shadow(0px 8px 15px ${color.main}60)` }}>
            {/* Base Empty Circle */}
            <motion.circle
              cx={cx}
              cy={cy}
              r={r}
              fill="#ffffff"
              stroke="#1e293b"
              strokeWidth="2.5"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 100, delay: circleAppearTime }} 
            />
            {/* Slices Loop */}
            {denominator > 0 && Array.from({ length: denominator }).map((_, i) => createSlice(i, denominator))}
          </svg>
        </motion.div>
      </div>

      {/* VERTICAL FRACTION TEXT (Appears exactly when coloring begins) */}
      {denominator > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: fillStartTime + 2.0 }}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "15px", fontSize: "45px", fontWeight: "900", fontFamily: '"Fredoka One", "Nunito", sans-serif' }}
        >
          {/* Numerator */}
          <span style={{ color: color.light, lineHeight: "1" }}>{numerator}</span>
          {/* Middle Line */}
          <div style={{ width: "50px", height: "6px", backgroundColor: "#94a3b8", margin: "6px 0", borderRadius: "3px" }}></div>
          {/* Denominator */}
          <span style={{ color: "white", lineHeight: "1" }}>{denominator}</span>
        </motion.div>
      )}
    </div>
  );
};

//  SHINY NUMBER COMPONENT

const ShinyNumber = ({ value, color, delay = 0 }) => (
  <motion.div
    initial={{ scale: 0.5, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ type: "spring", stiffness: 200, damping: 10, delay: delay }}
    style={{
      display: "inline-block",
      filter: `drop-shadow(0px 8px 10px rgba(0,0,0,0.6)) drop-shadow(0px 0px 12px ${color.main}) drop-shadow(0px 0px 40px ${color.main})`,
      willChange: "filter, transform"
    }}
  >
    <div style={{
      fontSize: "clamp(60px, 8vw, 76px)", 
      fontWeight: 900,
      fontFamily: '"Fredoka One", "Fredoka", "Nunito", "Varela Round", "Baloo 2", "Comic Sans MS", cursive, sans-serif',
      margin: "0 5px",
      padding: "20px", 
      lineHeight: "1",
      background: `linear-gradient(180deg, #ffffff 0%, ${color.light} 40%, ${color.main} 70%, ${color.dark} 100%)`,
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      WebkitTextStroke: `2px ${color.dark}`, 
    }}>
      {value}
    </div>
  </motion.div>
);


//  DRAGON COMPONENT

const DragonIcon = ({ playAudio, iconSize, isHeavy }) => {
  const randomHoverDelay = useMemo(() => Math.random() * 2, []);
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && playAudio) {
      videoRef.current.volume = 0.06;
    }
  }, [playAudio]);

  return (
    <motion.div
      animate={{}} 
      transition={{ delay: randomHoverDelay }}
      style={{ display: "inline-block", willChange: "transform" }}
    >
      <video 
        ref={videoRef}
        src="/dragon.mp4" 
        autoPlay loop playsInline       
        muted={!playAudio} 
        style={{ 
            width: iconSize || "250px", 
            height: "auto", 
            objectFit: "cover", 
            backgroundColor: "transparent", 
            mixBlendMode: "screen", 
            borderRadius: "10px",
            pointerEvents: "none" 
        }} 
      />
    </motion.div>
  );
};


// CUTE 2D CARTOON ORANGE AVATAR 
const DancingOrangeIcon = ({ id, iconSize, isHeavy }) => {
    const size = iconSize || "120px"; 
    const gradId = `cute-orange-grad-${id}`;
    // Bouncing Dance Sequence
    const danceSequence = {
        
        animate: {
            y: [0, -12, 0], 
            rotate: [0, 5, -5, 0], 
        },
        transition: {
            duration: 0.8 + Math.random() * 0.4, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 0.5
        }
    };

    return (
        <motion.div
            {...danceSequence}
            style={{ 
                width: size, 
                height: size, 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                willChange: "transform"
            }}
        >
            
            <svg width="100%" height="100%" viewBox="0 0 120 120" style={{ display: "block", overflow: "visible" }}>
                <defs>
                    <radialGradient id={gradId} cx="40%" cy="30%" r="60%">
                        <stop offset="0%" stopColor="#ffda75" /> 
                        <stop offset="40%" stopColor="#ff9800" /> 
                        <stop offset="90%" stopColor="#e65100" /> 
                    </radialGradient>
                </defs>

                

               
                {/* Left Arm Throwing Up */}
                <path d="M 28 65 Q 12 60 16 48" stroke="#fffdfdff" strokeWidth="6" strokeLinecap="round" fill="none" />
                {/* Right Arm Throwing Up */}
                <path d="M 92 65 Q 108 60 104 48" stroke="#fffdfdff" strokeWidth="6" strokeLinecap="round" fill="none" />
                
                {/* Left Leg (Bending back running pose) */}
                <path d="M 45 95 Q 30 105 25 95" stroke="#fffdfdff" strokeWidth="6" strokeLinecap="round" fill="none" />
                {/* Right Leg (Stepping down) */}
                <path d="M 72 95 Q 78 108 86 108" stroke="#fffdfdff" strokeWidth="6" strokeLinecap="round" fill="none" />

                {/* --- MAIN ORANGE BODY --- */}
                <circle cx="60" cy="65" r="38" fill={`url(#${gradId})`} stroke="#d84315" strokeWidth="1.5" />

                {/* --- ORANGE PORES / TEXTURE DOTS --- */}
                <g fill="#d84315" opacity="0.6">
                    <circle cx="35" cy="50" r="1.5"/>
                    <circle cx="85" cy="55" r="1"/>
                    <circle cx="28" cy="70" r="1.5"/>
                    <circle cx="35" cy="85" r="2"/>
                    <circle cx="50" cy="95" r="1.5"/>
                    <circle cx="65" cy="98" r="1.2"/>
                    <circle cx="80" cy="88" r="1.8"/>
                    <circle cx="88" cy="75" r="1"/>
                    <circle cx="75" cy="45" r="1.5"/>
                    <circle cx="45" cy="90" r="1"/>
                </g>

                {/* --- CUTE FACE --- */}
                {/* Eyebrows */}
                <path d="M 43 51 Q 46 49 49 51" stroke="#1c2331" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                <path d="M 71 51 Q 74 49 77 51" stroke="#1c2331" strokeWidth="2.5" strokeLinecap="round" fill="none" />

                {/* Big Anime Eyes */}
                <circle cx="46" cy="62" r="8" fill="#1c2331" />
                <circle cx="74" cy="62" r="8" fill="#1c2331" />
                
                {/* White Catchlights (Shine in eyes) */}
                <circle cx="44" cy="59" r="3" fill="white" /> {/* Left big shine */}
                <circle cx="48" cy="64" r="1.2" fill="white" /> {/* Left small shine */}
                <circle cx="72" cy="59" r="3" fill="white" /> {/* Right big shine */}
                <circle cx="76" cy="64" r="1.2" fill="white" /> {/* Right small shine */}

                {/* Pink Blushing Cheeks */}
                <ellipse cx="36" cy="70" rx="6" ry="3.5" fill="#ff5252" opacity="0.8" />
                <ellipse cx="84" cy="70" rx="6" ry="3.5" fill="#ff5252" opacity="0.8" />

                {/* Happy Open Mouth with Tongue */}
                <path d="M 54 70 Q 60 82 66 70 Z" fill="#1c2331" stroke="#1c2331" strokeWidth="1" strokeLinejoin="round" />
                {/* Red Tongue */}
                <path d="M 57 74 Q 60 72 63 74 Q 60 79 57 74 Z" fill="#ff5252" />

                {/* --- STEM & LEAF --- */}
                {/* Stem */}
                <path d="M 58 32 C 58 16 62 10 65 10" stroke="#1b5e20" strokeWidth="4" strokeLinecap="round" fill="none" />
                {/* Leaf Shape */}
                <path d="M 60 28 C 30 10 15 25 25 45 C 40 50 60 40 60 28 Z" fill="#4caf50" stroke="#1b5e20" strokeWidth="2" strokeLinejoin="round" />
              
                {/* Central Leaf Vein */}
                <path d="M 26 43 Q 40 33 58 29" stroke="#1c2331" strokeWidth="2" fill="none" strokeLinecap="round" />
                
                {/* Top/Left Side Veins */}
                <path d="M 33 37 L 36 25" stroke="#1c2331" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                <path d="M 42 34 L 46 24" stroke="#1c2331" strokeWidth="1.5" fill="none" strokeLinecap="round" />

                {/* Bottom/Right Side Veins  */}
                <path d="M 33 37 L 44 42" stroke="#1c2331" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                <path d="M 43 33 L 53 37" stroke="#1c2331" strokeWidth="1.5" fill="none" strokeLinecap="round" />

            </svg>
        </motion.div>
    );
};



//  CLOUD & Rain 

const CloudImageWithRain = ({ id, iconSize, isHeavy }) => {
    const cloudImagePath = "/cloud.png"; 

    const numSize = parseInt(iconSize) || 160; 
    const size = `${numSize}px`;
    const rainGradId = `rain-grad-${id}`;
    
    const numDrops = isHeavy ? 20 : 60; 
    const rainDrops = useMemo(() => {
      return Array.from({ length: numDrops }).map((_, i) => ({
        id: i,
        x: 12 + Math.random() * 75, 
        length: 12 + Math.random() * 20, 
       
        duration: 0.9 + Math.random() * 0.8, 
        delay: Math.random() * 2.0, 
        width: 1.2 + Math.random() * 1.2
      }));
    }, [numDrops]);
  
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ 
          width: size, 
          height: size, 
          position: "relative", 
          display: "flex", 
          alignItems: "flex-start", 
          justifyContent: "center",
          willChange: "transform, opacity"
        }}
      >
        {/* --- RAIN LAYER --- */}
        <svg 
          viewBox="0 0 100 140" 
          style={{ 
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "140%", 
            overflow: "visible",
            zIndex: 1 
          }}
        >
          <defs>
            
            <linearGradient id={rainGradId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0" />   
              <stop offset="30%" stopColor="#38bdf8" stopOpacity="0.9" />  
              <stop offset="90%" stopColor="#0284c7" stopOpacity="1" />
            </linearGradient>
          </defs>
          <g>
            {rainDrops.map(drop => (
              <motion.line
                key={drop.id}
                x1={drop.x}
                x2={drop.x - 2} 
                stroke={`url(#${rainGradId})`}
                strokeWidth={drop.width}
                strokeLinecap="round"
                initial={{ y1: 40, y2: 40 + drop.length, opacity: 0 }}
                animate={{ 
                  y1: 140, 
                  y2: 140 + drop.length, 
                  opacity: [0, 1, 1, 0] 
                }}
                transition={{ duration: drop.duration, repeat: Infinity, delay: drop.delay, ease: "linear" }}
              />
            ))}
          </g>
        </svg>
  
       
        <img 
          src={cloudImagePath} 
          alt="Cloud" 
          style={{ 
              width: "100%", 
              height: "auto", 
              objectFit: "contain",
              position: "relative",
              zIndex: 2, 
              pointerEvents: "none",
              filter: "drop-shadow(0px 4px 5px rgba(0,0,0,0.2))" 
          }} 
        />
      </motion.div>
    );
};


//  SCENE THUNDER/LIGHTNING FLASH

const LightningFlash = () => {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: [0, 0.85, 0, 0.6, 0], 
          scale: [1, 1.02, 1], 
          backgroundColor: ["#ffffff", "#bfdbfe", "#ffffff"] 
        }}
        transition={{ duration: 0.4, times: [0, 0.1, 0.2, 0.3, 1], ease: "linear" }}
        style={{ 
          position: "fixed",     
          top: 0, left: 0, right: 0, bottom: 0, 
          zIndex: 9999,          
          pointerEvents: "none", 
          willChange: "opacity, transform"
         
        }}
      />
    );
};


// GLOSSY SHAPE COMPONENT

export const GlossyShape = ({ type, color, id, playAudio, iconSize, isHeavy }) => {
  if (type === 'dragon') return <DragonIcon playAudio={playAudio} iconSize={iconSize} isHeavy={isHeavy} />;
  if (type === 'orange') return <DancingOrangeIcon id={id} iconSize={iconSize} isHeavy={isHeavy} />;
  
  if (type === 'cloud') return <CloudImageWithRain id={id} iconSize={iconSize} isHeavy={isHeavy} />;
  if (type === 'fish') return <FishIcon color={color} iconSize={iconSize} />;
  if (type === 'cat') return <CatIcon color={color} />;
  if (type === 'bat') return <BatBallIcon color={color} />;
  if (type === 'candy') return <CandyIcon color={color} />;
  if (type === 'car') return <CarIcon color={color} />;
  if (type === 'pizza') return <PizzaSliceVisual numerator={1} denominator={1} compact={true} />;
  if (type === 'cake') return <CakeSliceVisual numerator={1} denominator={1} compact={true} />;

  const gradId = `grad-${id}`;
  const isFruit = type === "strawberry" || type === "apple";
  const startColor = isFruit ? "#ff4d4d" : color.light;
  const endColor = isFruit ? "#990000" : color.dark;
  
  const size = iconSize || "100px";

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: "block" }}>
      <defs>
        <radialGradient id={gradId} cx="30%" cy="30%" r="80%">
          <stop offset="0%" stopColor={startColor} />
          <stop offset="100%" stopColor={endColor} />
        </radialGradient>
        <linearGradient id={`leaf-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4ade80" />
            <stop offset="100%" stopColor="#15803d" />
        </linearGradient>
      </defs>
      {type === "circle" && (
        <><circle cx="50" cy="50" r="45" fill={`url(#${gradId})`} stroke="white" strokeWidth="2" /><circle cx="35" cy="35" r="15" fill="white" fillOpacity="0.4" /></>
      )}
      {type === "square" && (
        <><rect x="10" y="10" width="80" height="80" rx="15" fill={`url(#${gradId})`} stroke="white" strokeWidth="2" /><rect x="20" y="20" width="30" height="30" rx="5" fill="white" fillOpacity="0.3" /></>
      )}
      {type === "strawberry" && (
        <g transform="translate(5, 5) scale(0.9)">
          <path d="M50 95 C 15 65 5 35 5 25 Q 5 5 30 5 Q 50 15 50 15 Q 50 15 70 5 Q 95 5 95 25 C 95 35 85 65 50 95 Z" fill={`url(#${gradId})`} stroke="#7f1d1d" strokeWidth="1"/>
          <g fill="rgba(250, 200, 150, 0.7)">
             <circle cx="30" cy="30" r="1.5" /><circle cx="70" cy="30" r="1.5" /><circle cx="20" cy="45" r="1.5" /><circle cx="50" cy="45" r="1.5" /><circle cx="80" cy="45" r="1.5" /><circle cx="35" cy="60" r="1.5" /><circle cx="65" cy="60" r="1.5" /><circle cx="50" cy="75" r="1.5" />
          </g>
          <path d="M20 25 Q 35 10 50 25 Q 65 10 80 25 L 65 15 L 50 5 L 35 15 Z" fill={`url(#leaf-${id})`} stroke="#14532d" strokeWidth="1" strokeLinejoin="round"/>
          <path d="M50 10 L 50 0" stroke="#1b5e20" strokeWidth="3" strokeLinecap="round" />
        </g>
      )}
      {type === "apple" && (
        <g transform="translate(5, 5) scale(0.9)">
            <path d="M50 20 C 25 10 5 35 5 60 C 5 85 25 95 50 90 C 75 95 95 85 95 60 C 95 35 75 10 50 20 Z" fill={`url(#${gradId})`} stroke="#7f1d1d" strokeWidth="1" />
            <path d="M50 20 Q 50 10 55 5" stroke="#3a2721ff" strokeWidth="4" strokeLinecap="round" fill="none" />
            <path d="M50 20 Q 30 5 25 25 Q 40 40 50 20" fill={`url(#leaf-${id})`} stroke="#14532d" strokeWidth="1" />
            <path d="M75 35 Q 85 35 85 55" stroke="white" strokeWidth="3" strokeOpacity="0.3" fill="none" strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
};


//  MATH SYMBOL COMPONENT

export const MathSymbol = ({ operator, delay = 0 }) => (
  <motion.div 
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ type: "spring", stiffness: 200, damping: 10, delay: delay }}
    className="shape-symbol" 
    style={{ margin: "0 5px", display: "flex", alignItems: "center", transform: "scale(0.7)" }}
  >
    <svg width="70" height="70" viewBox="0 0 100 100" style={{ filter: "drop-shadow(0px 5px 10px rgba(0,0,0,0.5))" }}>
      {operator === "addition" && <path d="M42 10h16v80h-16z M10 42h80v16h-80z" fill="#ffffffff" />}
      {operator === "subtraction" && <path d="M10 42h80v16h-80z" fill="#ffffffff" />}
      {operator === "multiplication" && <path d="M20 10 L50 40 L80 10 L90 20 L60 50 L90 80 L80 90 L50 60 L20 90 L10 80 L40 50 L10 20 Z" fill="#ffffffff" />}
      {operator === "division" && (
          <g fill="#ffffffff">
              <circle cx="50" cy="20" r="10" />
              <rect x="10" y="42" width="80" height="16" />
              <circle cx="50" cy="80" r="10" />
          </g>
      )}
      {operator === "equals" && (
          <g fill="#ffffffff">
              <rect x="15" y="35" width="70" height="12" rx="6" />
              <rect x="15" y="55" width="70" height="12" rx="6" />
          </g>
      )}
    </svg>
  </motion.div>
);

// MAIN VISUAL COMPONENT

export default function MathVisual({ visual, isActive = true }) {
  const [showLightning, setShowLightning] = useState(false);
  const thunderAudioRef = useRef(null);
  const rainAudioRef = useRef(null); 

  if (!visual) return null;

  const { config, parts } = useMemo(() => {
    const p = visual.split(" ");
    const reqShape = p[3]?.toLowerCase(); 
    
    let finalShape;
    if (reqShape === "number" || reqShape === "numbers") finalShape = "number";
    else if (reqShape === "circle" || reqShape === "circles") finalShape = "circle";
    else if (reqShape === "square" || reqShape === "squares") finalShape = "square";
    else if (reqShape === "strawberry" || reqShape === "strawberries") finalShape = "strawberry"; 
    else if (reqShape === "apple" || reqShape === "apples") finalShape = "apple"; 
    else if (reqShape === "dragon" || reqShape === "dragons") finalShape = "dragon"; 
    else if (reqShape === "orange" || reqShape === "oranges") finalShape = "orange"; 
    else if (reqShape === "cloud" || reqShape === "clouds") finalShape = "cloud"; 
    else if (reqShape === "fraction_circle") finalShape = "fraction_circle"; 
    else if (reqShape === "fish" || reqShape === "fishes") finalShape = "fish"; 
    else if (reqShape === "cat" || reqShape === "cats") finalShape = "cat"; 
    else if (reqShape === "bat" || reqShape === "bats") finalShape = "bat"; 
    else if (reqShape === "candy" || reqShape === "candies") finalShape = "candy"; 
    else if (reqShape === "car" || reqShape === "cars") finalShape = "car";
    else if (reqShape === "cake" || reqShape === "cakes") finalShape = "cake";
    else if (reqShape === "pizza" || reqShape === "pizzas") finalShape = "pizza";
    else finalShape = SHAPES_LIST[Math.floor(Math.random() * SHAPES_LIST.length)];

    let c1 = getRandomColor();
    let c2 = getRandomColor();
    while (c1 === c2) c2 = getRandomColor();

    return { 
        parts: p, 
        config: { shape: finalShape, colorA: c1, colorB: c2 } 
    };
  }, [visual]);

  const operator = parts[0]; 
  const countA = parseInt(parts[1]) || 0;
  const countB = parseInt(parts[2]) || 0;

  
  let isFinalAnswer = false;
  let memA = parseInt(sessionStorage.getItem('mentora_lastA'));
  let memB = parseInt(sessionStorage.getItem('mentora_lastB'));
  let memOp = sessionStorage.getItem('mentora_lastOp');

  if (countB === 0 && !isNaN(memA) && !isNaN(memB) && memB >= 0) {
      let expectedAns = 0;
      if (memOp === "addition") expectedAns = memA + memB;
      if (memOp === "subtraction") expectedAns = memA - memB;
      if (memOp === "multiplication") expectedAns = memA * memB;
      if (memOp === "division" && memB !== 0) expectedAns = memA / memB;

      if (countA === expectedAns) {
          isFinalAnswer = true;
      }
  }


  
  useEffect(() => {
    const audioEl = rainAudioRef.current;
    if (config.shape === 'cloud' && isActive) {
      if (audioEl) {
        audioEl.volume = 0.2; 
        const playPromise = audioEl.play();
        if (playPromise !== undefined) playPromise.catch(e => console.log("Rain audio play blocked", e));
      }
    } else {
      if (audioEl) {
        audioEl.pause(); 
        audioEl.currentTime = 0;
      }
    }
    return () => {
      if (audioEl) audioEl.pause();
    };
  }, [config.shape, countA, isActive]);

  
  useEffect(() => {
    let timerId;
    let flashTimerId;
    if (config.shape !== 'cloud' || !isActive) {
        setShowLightning(false);
        if (thunderAudioRef.current) {
            thunderAudioRef.current.pause();
        }
        return; 
    }

    const playThunderAndFlash = () => {
        if (!thunderAudioRef.current) return;
        thunderAudioRef.current.volume = 0.05 + Math.random() * 0.05; 
        setShowLightning(true); 
        thunderAudioRef.current.currentTime = 0;
        const playPromise = thunderAudioRef.current.play();
        if (playPromise !== undefined) {
            playPromise.catch(e => console.log("Audio play blocked", e));
        }
        flashTimerId = setTimeout(() => setShowLightning(false), 400); 
    };

    const intervalTrigger = () => {
        playThunderAndFlash();
        const nextTime = 4000 + Math.random() * 5000; 
        timerId = setTimeout(intervalTrigger, nextTime);
    };

    timerId = setTimeout(intervalTrigger, 800); 

    return () => {
        clearTimeout(timerId);
        clearTimeout(flashTimerId);
        setShowLightning(false); 
    };
  }, [config.shape, countA, isActive]);

  useEffect(() => {
      if (countB > 0 && operator !== "fraction") { 
          sessionStorage.setItem('mentora_lastA', countA);
          sessionStorage.setItem('mentora_lastB', countB);
          sessionStorage.setItem('mentora_lastOp', operator);
      }
  }, [countA, countB, operator]);


  
  const [jumpIndex, setJumpIndex] = useState(-1);
  const startTimeRef = useRef(null); 

  useEffect(() => {
      startTimeRef.current = null; 
      setJumpIndex(-1);
  }, [visual]);

  
  useEffect(() => {
    
    if (operator === 'addition' && isActive && isFinalAnswer) {
        
        if (!startTimeRef.current) {
            startTimeRef.current = Date.now();
        }

        
        const INTRO_WAIT = 2.91; 
        const JUMP_GAP = 1.0;   
        
        const totalItems = countA; 
        
        const checker = setInterval(() => {
            if (!startTimeRef.current) return;

            const elapsedSeconds = (Date.now() - startTimeRef.current) / 1000; 
            
            if (elapsedSeconds >= INTRO_WAIT) {
                const timeInCounting = elapsedSeconds - INTRO_WAIT;
                const currentIndex = Math.floor(timeInCounting / JUMP_GAP); 
                
                if (currentIndex < totalItems) {
                    setJumpIndex(currentIndex); 
                } else {
                    setJumpIndex(-1); 
                    clearInterval(checker);
                }
            }
        }, 50);

        return () => clearInterval(checker);
    } else {
        setJumpIndex(-1);
    }
  }, [visual, operator, isActive, isFinalAnswer, countA]);

 
  if (operator === "fraction" || operator === "pizza" || operator === "cake") {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: "100%", padding: "40px" }}>
            {operator === "pizza" && <PizzaSliceVisual numerator={countA} denominator={countB} />}
            {operator === "cake" && <CakeSliceVisual numerator={countA} denominator={countB} />}
            {operator === "fraction" && <FractionCircle numerator={countA} denominator={countB} color={config.colorA} />}
        </div>
    );
  }

  if (config.shape === "number") {
    if (countB === 0) {
       
        if (isFinalAnswer) {
            return (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'nowrap', gap: '5px', width: "100%" }}>
                   <ShinyNumber value={memA} color={config.colorA} delay={0} />
                   <MathSymbol operator={memOp} delay={0.4} />
                   <ShinyNumber value={memB} color={config.colorB} delay={0.8} />
                   <MathSymbol operator="equals" delay={1.2} />
                   <ShinyNumber value={countA} color={{ main: "#10b981", light: "#34d399", dark: "#047857" }} delay={1.6} /> 
                </div>
            );
        }

        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'nowrap', gap: '5px', width: "100%" }}>
               <ShinyNumber value={countA} color={config.colorA} delay={0} />
            </div>
        );
    }

    if (countB > 0) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'nowrap', gap: '5px', width: "100%" }}>
               <ShinyNumber value={countA} color={config.colorA} delay={0} />
               <MathSymbol operator={operator} delay={0.4} />
               <ShinyNumber value={countB} color={config.colorB} delay={0.8} />
            </div>
        );
    }
  }

  const totalCount = countA + countB;
  const isHeavy = totalCount > 15; 

  let dragonSize = "300px"; 
  const FIXED_SHAPE_SIZE = "80px";
  const FIXED_ORANGE_SIZE = "140px"; 
  const FIXED_CLOUD_SIZE = "142px"; 
  
  let flexGap = "10px";
  let appearDelay = 0.04; 

  if (totalCount > 20) {
      dragonSize = "120px"; 
      flexGap = "10px";
      appearDelay = 0.01; 
  } else if (totalCount > 25) {
      dragonSize = "100px"; 
      flexGap = "15px";
      appearDelay = 0.02; 
  } else if (totalCount > 12) {
      dragonSize = "160px"; 
      flexGap = "18px";
      appearDelay = 0.03;
  }

  let finalIconSize;
  if (config.shape === 'dragon') {
      finalIconSize = dragonSize; 
  } else if (config.shape === 'orange') {
      finalIconSize = FIXED_ORANGE_SIZE; 
  } else if (config.shape === 'cloud') {
      finalIconSize = FIXED_CLOUD_SIZE; 
  } else {
      finalIconSize = FIXED_SHAPE_SIZE; 
  }



  return (
    <div key={visual} className="visual-container" style={{ position: 'relative', overflow: 'hidden', minHeight: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', width: '100%', padding: '20px', borderRadius: '20px' }}>
      
      <style>
        {`
          .jumping-shape {
            animation: popUp 0.6s ease-out forwards;
            z-index: 10;
          }
          .static-shape {
            z-index: 1;
          }
          @keyframes popUp {
            0% { transform: scale(1) translateY(0); filter: drop-shadow(0px 0px 0px rgba(0,0,0,0)); }
            50% { transform: scale(1.3) translateY(-20px); filter: drop-shadow(0px 15px 20px rgba(0,0,0,0.3)); }
            100% { transform: scale(1) translateY(0); filter: drop-shadow(0px 0px 0px rgba(0,0,0,0)); }
          }
        `}
      </style>

      <AnimatePresence>
        {config.shape === 'fish' && <WaterBackground />}
      </AnimatePresence>

      <AnimatePresence>
        {showLightning && <LightningFlash />}
      </AnimatePresence>
      
      <audio ref={thunderAudioRef} src="https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3" preload="auto" muted={false} />
      <audio ref={rainAudioRef} src="https://assets.mixkit.co/active_storage/sfx/2391/2391-preview.mp3" preload="auto" muted={false} loop={true} />

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: flexGap, width: "100%" }}>
        <AnimatePresence>
          {Array(countA).fill(0).map((_, i) => {
            const isJumping = jumpIndex === i; 
            
            return (
              <motion.div key={`a-${i}`} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * appearDelay }} >
                <div className={isJumping ? 'jumping-shape' : 'static-shape'} style={{ position: 'relative' }}>
                  <GlossyShape type={config.shape} color={config.colorA} id={`a-${i}`} playAudio={isActive && i === 0} iconSize={finalIconSize} isHeavy={isHeavy} />
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {countB > 0 && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: countA * appearDelay }}>
            <MathSymbol operator={operator} />
        </motion.div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: flexGap, width: "100%" }}>
        <AnimatePresence>
          {Array(countB).fill(0).map((_, i) => {
            const isJumping = jumpIndex === (countA + i); 
            
            return (
              <motion.div key={`b-${i}`} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: (countA + i) * appearDelay }}>
                <div className={isJumping ? 'jumping-shape' : 'static-shape'} style={{ position: 'relative' }}>
                  <GlossyShape type={config.shape} color={config.colorB} id={`b-${i}`} playAudio={isActive && countA === 0 && i === 0} iconSize={finalIconSize} isHeavy={isHeavy} />
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div> 
  );
}