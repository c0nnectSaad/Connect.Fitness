'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';

// Mock Data for the Pitch Presentation UIs
const initialWeightData = [
  { date: 'Mon', weight: 75.2 },
  { date: 'Tue', weight: 74.9 },
  { date: 'Wed', weight: 74.8 },
  { date: 'Thu', weight: 74.4 },
  { date: 'Fri', weight: 74.2 },
  { date: 'Sat', weight: 74.0 },
  { date: 'Sun', weight: 73.8 }
];

export default function PitchPage() {
  const [frame, setFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isInteractive, setIsInteractive] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [recordMode, setRecordMode] = useState(false);
  const [isRecordingReady, setIsRecordingReady] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number | null>(null);
  const prevTimeRef = useRef<number | null>(null);

  // Total frames in the motion graphic timeline: 30 seconds at 30 fps = 900 frames
  const TOTAL_FRAMES = 900;
  const FPS = 30;

  // Detect URL parameter for recording mode
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('record') === 'true') {
        setRecordMode(true);
        setIsPlaying(false); // Playwright will step manually
        
        // Expose control functions to window for Playwright to control
        (window as any).totalFrames = TOTAL_FRAMES;
        (window as any).setFrame = (f: number) => {
          setFrame(Math.max(0, Math.min(TOTAL_FRAMES - 1, f)));
          return true;
        };
        setIsRecordingReady(true);
      }
    }
  }, []);

  // Mouse move handler for interactive parallax/rotation
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isInteractive && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5; // -0.5 to 0.5
      setMousePos({ x, y });
    }
  };

  // Main animation play loop
  const animate = (time: number) => {
    if (prevTimeRef.current !== null) {
      const delta = time - prevTimeRef.current;
      const framesToAdvance = (delta / 1000) * FPS * speed;
      
      setFrame((prev) => {
        const next = prev + framesToAdvance;
        if (next >= TOTAL_FRAMES) {
          return 0; // Loop video
        }
        return next;
      });
    }
    prevTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (isPlaying && !recordMode) {
      prevTimeRef.current = performance.now();
      requestRef.current = requestAnimationFrame(animate);
    } else {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      prevTimeRef.current = null;
    }
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isPlaying, speed, recordMode]);

  // Handle Scrubbing
  const handleTimelineScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setFrame(value);
    if (isPlaying) {
      setIsPlaying(false);
    }
  };

  // Current Animation State calculations based on frame number (0 to 899)
  const currentPct = frame / TOTAL_FRAMES;

  // Slide timelines:
  // Slide 1 (Intro): 0 - 150 frames (0s - 5s)
  // Slide 2 (Dashboard): 150 - 330 frames (5s - 11s)
  // Slide 3 (Workout): 330 - 510 frames (11s - 17s)
  // Slide 4 (Diet): 510 - 690 frames (17s - 23s)
  // Slide 5 (Customizer/Stats): 690 - 810 frames (23s - 27s)
  // Slide 6 (CTA): 810 - 900 frames (27s - 30s)

  const activeSlide = useMemo(() => {
    if (frame < 150) return 1;
    if (frame < 330) return 2;
    if (frame < 510) return 3;
    if (frame < 690) return 4;
    if (frame < 810) return 5;
    return 6;
  }, [frame]);

  // Voiceover / Subtitle Copy
  const slideNarration = useMemo(() => {
    if (frame < 60) return "In a crowded fitness app market, users struggle to find clean, aesthetic plans...";
    if (frame < 150) return "Introducing Connect.Fitness: The Premium Aesthetic Planner and Tracker.";
    if (frame < 240) return "Our customizable Dashboard offers an elegant view of daily goals and body stats.";
    if (frame < 330) return "With our Body-Weight-Ratio (BWR) formula, users target specific aesthetic goals.";
    if (frame < 420) return "The Smart Workout Tracker logs progress, tracks difficulties, and shows dynamic body maps.";
    if (frame < 510) return "Users check off sets in real-time, helping them focus on optimal muscle hypertrophy.";
    if (frame < 600) return "Our Diet engine makes meal logging effortless, calculating exact macros.";
    if (frame < 690) return "Select cooking methods like grilled or fried to automatically adjust fat and calories.";
    if (frame < 750) return "Create and customize routine presets to fit your exact coaching blueprint.";
    if (frame < 810) return "Review complete progress logs, history charts, and profile adjustments.";
    if (frame < 860) return "For Brands: Integrate product links, sponsor workout routines, or feature food products.";
    return "Connect.Fitness: The ultimate lifestyle brand partnership platform. Let's build together.";
  }, [frame]);

  // 3D Phone Transform Calculation
  const phoneTransform = useMemo(() => {
    if (isInteractive && !recordMode) {
      // Free drag rotation
      const rx = mousePos.y * -45; // -22.5 to 22.5 deg
      const ry = mousePos.x * 45;  // -22.5 to 22.5 deg
      return `rotateX(${rx + 15}deg) rotateY(${ry - 20}deg) scale(1.05) translateZ(0px)`;
    }

    // Automated camera choreography based on frame
    if (frame < 150) {
      // Intro: Phone flies in and rotates
      const t = frame / 150; // 0 to 1
      const rotateX = 60 - t * 45; // 60 to 15
      const rotateY = -90 + t * 70; // -90 to -20
      const scale = 0.5 + t * 0.5; // 0.5 to 1
      const translateZ = -300 + t * 300; // -300 to 0
      return `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale}) translateZ(${translateZ}px)`;
    } 
    
    if (frame < 330) {
      // Dashboard: Stable front angle with slight tilt movement
      const t = (frame - 150) / 180; // 0 to 1
      const rotateX = 15 - Math.sin(t * Math.PI) * 5; 
      const rotateY = -20 + Math.sin(t * Math.PI) * 10;
      const scale = 1.0;
      return `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale}) translateZ(0px)`;
    } 
    
    if (frame < 510) {
      // Workout: Zoom in to active screen detail
      const t = (frame - 330) / 180; // 0 to 1
      const rotateX = 15 + t * 5; 
      const rotateY = -20 - t * 15; // rotate to side
      const scale = 1.0 + Math.sin(t * Math.PI) * 0.15; // zoom push
      const translateZ = t * 50; // push into screen
      return `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale}) translateZ(${translateZ}px)`;
    } 
    
    if (frame < 690) {
      // Diet: Close up on chart, rotated left
      const t = (frame - 510) / 180;
      const rotateX = 20 - t * 8;
      const rotateY = -35 + t * 40; // rotate to other side
      const scale = 1.08;
      const translateZ = 30;
      return `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale}) translateZ(${translateZ}px)`;
    } 
    
    if (frame < 810) {
      // Customizer / Stats: Landscape tilt
      const t = (frame - 690) / 120;
      const rotateX = 12 + t * 8;
      const rotateY = 5 - t * 25;
      const scale = 0.95;
      return `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale}) translateZ(0px)`;
    } 
    
    // Outro: Phone moves left and rotates flat
    const t = (frame - 810) / 90; // 0 to 1
    const rotateX = 20 - t * 15; // flat
    const rotateY = -20 - t * 40; // side profile
    const translateX = -t * 220; // slide left
    const scale = 0.95 - t * 0.1;
    return `translateX(${translateX}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale}) translateZ(0px)`;
  }, [frame, isInteractive, mousePos, recordMode]);

  // Floating Card Transform (makes UI layers look 3D)
  const floatCardStyle = (layerOffset: number) => {
    if (recordMode) return {}; // Disable during recording to prevent offset bugs
    return {
      transform: `translateZ(${layerOffset}px)`,
      transition: 'transform 0.1s ease-out'
    };
  };

  return (
    <div 
      className={`pitch-container ${isPortrait ? 'portrait-aspect' : 'landscape-aspect'} ${recordMode ? 'record-clean' : ''}`}
      onMouseMove={handleMouseMove}
      ref={containerRef}
    >
      {/* Dynamic inline styles for 3D graphics and particles */}
      <style>{`
        :root {
          --pitch-primary: #d4af37;
          --pitch-primary-glow: rgba(212, 175, 55, 0.4);
          --pitch-bg: #030303;
          --pitch-card-bg: rgba(12, 12, 12, 0.85);
          --pitch-border: rgba(212, 175, 55, 0.18);
        }

        .pitch-container {
          background-color: var(--pitch-bg);
          color: #ffffff;
          font-family: 'Outfit', sans-serif;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          box-shadow: 0 20px 50px rgba(0,0,0,0.8);
          background-image: 
            radial-gradient(circle at 50% 50%, rgba(212, 175, 55, 0.06) 0%, transparent 60%),
            linear-gradient(rgba(212, 175, 55, 0.01) 1px, transparent 1px),
            linear-gradient(90deg, rgba(212, 175, 55, 0.01) 1px, transparent 1px);
          background-size: 100% 100%, 40px 40px, 40px 40px;
          transition: all 0.5s ease;
        }

        /* 16:9 Landscape Video Aspect Ratio Frame */
        .landscape-aspect {
          width: 100%;
          max-width: 100vw;
          aspect-ratio: 16 / 9;
          height: auto;
        }

        /* 9:16 Portrait Video Aspect Ratio Frame */
        .portrait-aspect {
          width: 100%;
          max-width: 460px;
          aspect-ratio: 9 / 16;
          height: auto;
        }

        @media(max-height: 800px) and (min-width: 1024px) {
          .landscape-aspect {
            max-height: 85vh;
            width: auto;
          }
        }

        /* Ambient glowing circles */
        .ambient-glow {
          position: absolute;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, var(--pitch-primary-glow) 0%, transparent 70%);
          filter: blur(40px);
          pointer-events: none;
          z-index: 1;
          opacity: 0.6;
          transition: transform 1s ease;
        }

        .glow-1 { top: -100px; left: -100px; transform: translate(${Math.sin(currentPct * Math.PI * 2) * 50}px, ${Math.cos(currentPct * Math.PI * 2) * 50}px); }
        .glow-2 { bottom: -150px; right: -100px; transform: translate(${Math.cos(currentPct * Math.PI * 2) * -60}px, ${Math.sin(currentPct * Math.PI * 2) * -40}px); }

        /* Floating 3D Device Container */
        .device-perspective {
          perspective: 1500px;
          perspective-origin: 50% 50%;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: absolute;
          z-index: 5;
          pointer-events: none;
        }

        .device-wrapper {
          transform-style: preserve-3d;
          width: 290px;
          height: 580px;
          position: relative;
          will-change: transform;
        }

        /* Phone structure */
        .phone-3d {
          transform-style: preserve-3d;
          width: 100%;
          height: 100%;
          position: relative;
        }

        /* Phone Front Face */
        .phone-front-face {
          position: absolute;
          width: 100%;
          height: 100%;
          background: #090909;
          border: 4px solid #1c1c1c;
          border-radius: 40px;
          box-shadow: 
            inset 0 0 15px rgba(255,255,255,0.05),
            inset 0 0 2px 2px var(--pitch-primary);
          transform: translateZ(12px);
          overflow: hidden;
          z-index: 10;
        }

        /* Screen Bezel and Inner Container */
        .phone-screen-content {
          position: absolute;
          top: 8px;
          left: 8px;
          right: 8px;
          bottom: 8px;
          background: #050505;
          border-radius: 32px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          border: 1px solid rgba(255,255,255,0.02);
        }

        /* Phone Camera Notch */
        .phone-notch {
          position: absolute;
          top: 10px;
          left: 50%;
          transform: translateX(-50%);
          width: 110px;
          height: 25px;
          background: #000000;
          border-radius: 15px;
          z-index: 99;
          display: flex;
          align-items: center;
          justify-content: space-around;
          padding: 0 10px;
          border: 1px solid rgba(255,255,255,0.05);
        }
        
        .notch-camera {
          width: 8px;
          height: 8px;
          background: #090f1a;
          border-radius: 50%;
          box-shadow: inset 0 0 2px rgba(255,255,255,0.8);
        }

        .notch-speaker {
          width: 40px;
          height: 3px;
          background: #151515;
          border-radius: 2px;
        }

        /* Phone Sides to create depth */
        .phone-side-3d {
          position: absolute;
          background: linear-gradient(to bottom, #2c2920, #0a0907, #2c2920);
          border: 1px solid rgba(212, 175, 55, 0.3);
          transform-style: preserve-3d;
        }

        .side-left {
          width: 24px;
          height: 540px;
          top: 20px;
          left: -12px;
          transform: rotateY(-90deg) translateZ(0);
        }

        .side-right {
          width: 24px;
          height: 540px;
          top: 20px;
          right: -12px;
          transform: rotateY(90deg) translateZ(0);
        }

        .side-top {
          width: 250px;
          height: 24px;
          top: -12px;
          left: 20px;
          transform: rotateX(90deg) translateZ(0);
        }

        .side-bottom {
          width: 250px;
          height: 24px;
          bottom: -12px;
          left: 20px;
          transform: rotateX(-90deg) translateZ(0);
        }

        /* Phone Back Face */
        .phone-back-face {
          position: absolute;
          width: 100%;
          height: 100%;
          background: #080808;
          border-radius: 40px;
          border: 3px solid #151515;
          transform: rotateY(180deg) translateZ(12px);
          box-shadow: 0 30px 70px rgba(0,0,0,0.9);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .phone-back-logo {
          color: var(--pitch-primary);
          font-weight: 800;
          font-size: 20px;
          letter-spacing: 0.05em;
          text-shadow: 0 0 10px rgba(212,175,55,0.3);
        }

        /* Particle Dust background animation */
        .dust-particles {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          pointer-events: none;
          z-index: 2;
        }

        .particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: var(--pitch-primary);
          border-radius: 50%;
          opacity: 0.15;
          filter: blur(1px);
        }

        /* Video overlays (subtitles/narration/overlay texts) */
        .subtitles-overlay {
          position: absolute;
          bottom: 75px;
          left: 5%;
          right: 5%;
          text-align: center;
          z-index: 100;
          pointer-events: none;
        }

        .subtitle-box {
          background: rgba(5, 5, 5, 0.85);
          border: 1px solid var(--pitch-border);
          padding: 12px 24px;
          border-radius: 30px;
          display: inline-block;
          font-size: 15px;
          line-height: 1.4;
          font-weight: 500;
          color: #f3f4f6;
          backdrop-filter: blur(8px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          max-width: 80%;
          text-shadow: 0 1px 2px rgba(0,0,0,0.5);
          letter-spacing: 0.01em;
          border-left: 3px solid var(--pitch-primary);
          animation: textPulse 2s infinite ease-in-out;
        }

        .pitch-brand-details {
          position: absolute;
          right: 8%;
          top: 22%;
          width: 320px;
          z-index: 10;
          pointer-events: none;
          opacity: 0;
          transform: translateX(40px);
          transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .pitch-brand-details.active {
          opacity: 1;
          transform: translateX(0);
        }

        .pitch-card {
          background: rgba(12, 12, 12, 0.85);
          border: 1px solid var(--pitch-border);
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 16px;
          backdrop-filter: blur(12px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }

        .pitch-card h3 {
          color: var(--pitch-primary);
          font-size: 16px;
          margin-bottom: 8px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .pitch-card p {
          font-size: 13px;
          color: #9ca3af;
          line-height: 1.5;
        }

        /* Mockup screens inside the phone */
        .mock-screen-wrapper {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          position: relative;
          padding-top: 36px; /* below notch */
          padding-bottom: 16px;
        }

        .mock-app-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .mock-app-title {
          font-weight: 800;
          color: var(--pitch-primary);
          font-size: 15px;
          letter-spacing: 0.02em;
        }

        .mock-battery-status {
          font-size: 10px;
          color: #4b5563;
        }

        .mock-content {
          flex: 1;
          overflow: hidden;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        /* Progress ring */
        .circle-progress-container {
          position: relative;
          width: 110px;
          height: 110px;
          margin: 0 auto;
        }

        .circle-bg {
          fill: none;
          stroke: #121212;
          stroke-width: 10;
        }

        .circle-val {
          fill: none;
          stroke: url(#goldGrad);
          stroke-width: 10;
          stroke-linecap: round;
          transition: stroke-dashoffset 0.5s ease-out;
        }

        /* Controls Panel (not shown in recording mode) */
        .playback-controls {
          position: absolute;
          bottom: 16px;
          left: 0;
          right: 0;
          z-index: 200;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          background: linear-gradient(to top, rgba(0,0,0,0.9), transparent);
          pointer-events: auto;
        }

        .control-btn {
          background: rgba(20,20,20,0.8);
          border: 1px solid rgba(255,255,255,0.1);
          color: #ffffff;
          padding: 8px 14px;
          border-radius: 20px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .control-btn:hover {
          border-color: var(--pitch-primary);
          color: var(--pitch-primary);
          background: rgba(212,175,55,0.05);
        }

        .control-btn.active {
          background: var(--pitch-primary);
          color: #000000;
          border-color: var(--pitch-primary);
        }

        .scrub-bar {
          flex: 1;
          -webkit-appearance: none;
          background: rgba(255,255,255,0.15);
          height: 4px;
          border-radius: 2px;
          outline: none;
          cursor: pointer;
        }

        .scrub-bar::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: var(--pitch-primary);
          box-shadow: 0 0 10px var(--pitch-primary);
          cursor: pointer;
          transition: scale 0.15s;
        }

        .scrub-bar::-webkit-slider-thumb:hover {
          transform: scale(1.3);
        }

        .top-nav-bar {
          position: absolute;
          top: 16px;
          left: 24px;
          right: 24px;
          z-index: 100;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo-main {
          font-size: 18px;
          font-weight: 800;
          color: var(--pitch-primary);
          letter-spacing: 0.05em;
          text-decoration: none;
        }

        /* Hide elements completely when recording is triggered */
        .record-clean .playback-controls,
        .record-clean .top-nav-bar,
        .record-clean .pitch-back-btn {
          display: none !important;
        }

        /* Custom scroll mock for screens */
        .scroll-mock {
          overflow-y: hidden;
          max-height: 100%;
        }

        /* Animation utilities */
        .pulse-light {
          animation: pulse 2s infinite alternate;
        }

        @keyframes pulse {
          0% { opacity: 0.6; }
          100% { opacity: 1; }
        }

        .glow-text-slow {
          text-shadow: 0 0 8px rgba(212,175,55,0.4);
        }

        /* Recording status overlay */
        .recording-status {
          position: absolute;
          top: 16px;
          right: 16px;
          background: rgba(239, 68, 68, 0.9);
          color: white;
          font-size: 11px;
          font-weight: bold;
          padding: 4px 8px;
          border-radius: 4px;
          z-index: 999;
          display: flex;
          align-items: center;
          gap: 6px;
          animation: blink 1s infinite alternate;
        }

        @keyframes blink {
          0% { opacity: 0.4; }
          100% { opacity: 1; }
        }
      `}</style>

      {/* SVG Gradients for Screens */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffe494" />
            <stop offset="50%" stopColor="#d4af37" />
            <stop offset="100%" stopColor="#8a6f1d" />
          </linearGradient>
        </defs>
      </svg>

      {/* Background Particles (static representations during recording, animated otherwise) */}
      <div className="dust-particles">
        {[...Array(12)].map((_, i) => {
          // Semi-random deterministic placement
          const top = `${(i * 17 + 13) % 100}%`;
          const left = `${(i * 29 + 7) % 100}%`;
          const scale = 0.5 + ((i * 7) % 3) * 0.4;
          const frameOffset = i * 45;
          const bouncePct = ((frame + frameOffset) % 180) / 180;
          const opacity = 0.05 + Math.sin(bouncePct * Math.PI) * 0.2;
          
          return (
            <div 
              key={i} 
              className="particle" 
              style={{ 
                top, 
                left, 
                transform: `scale(${scale})`, 
                opacity: recordMode ? 0.12 : opacity 
              }} 
            />
          );
        })}
      </div>

      {/* Background Glows */}
      <div className="ambient-glow glow-1" />
      <div className="ambient-glow glow-2" />

      {/* Header controls (Hidden during record) */}
      <div className="top-nav-bar">
        <Link href="/" className="logo-main">
          CONNECT.FITNESS
        </Link>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className={`control-btn ${isPortrait ? 'active' : ''}`}
            onClick={() => setIsPortrait(!isPortrait)}
          >
            📱 {isPortrait ? 'Landscape View' : 'Portrait View'}
          </button>
          <Link href="/" className="control-btn" style={{ textDecoration: 'none' }}>
            Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Recording indicator */}
      {recordMode && (
        <div className="recording-status">
          <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />
          REC [{frame}/{TOTAL_FRAMES}]
        </div>
      )}

      {/* 3D Device Container */}
      <div className="device-perspective">
        <div className="device-wrapper" style={{ transform: phoneTransform }}>
          <div className="phone-3d">
            {/* Phone Front Face */}
            <div className="phone-front-face">
              <div className="phone-notch">
                <div className="notch-speaker" />
                <div className="notch-camera" />
              </div>
              
              <div className="phone-screen-content">
                {/* RENDER MOCKUP ACCORDING TO SLIDE */}
                <div className="mock-screen-wrapper">
                  <div className="mock-app-header">
                    <span className="mock-app-title">Connect.Fitness</span>
                    <span className="mock-battery-status">100% 🔋</span>
                  </div>

                  <div className="mock-content">
                    {/* SLIDE 1 & 6: Welcome Screen */}
                    {(activeSlide === 1 || activeSlide === 6) && (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '20px', textAlign: 'center' }}>
                        <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'rgba(212,175,55,0.08)', border: '1px solid var(--pitch-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px' }} className="pulse-light">
                          🏋️
                        </div>
                        <div>
                          <h2 className="glow-text-slow" style={{ fontSize: '18px', fontWeight: 800, color: 'var(--pitch-primary)', margin: 0 }}>CONNECT.FITNESS</h2>
                          <p style={{ fontSize: '10px', color: '#6b7280', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: '4px' }}>Aesthetic Tracker</p>
                        </div>
                        <div style={{ fontSize: '12px', color: '#9ca3af', maxWidth: '80%', lineHeight: '1.4' }}>
                          Elevating training, diet, and progress tracking with pure aesthetic focus.
                        </div>
                      </div>
                    )}

                    {/* SLIDE 2: Dashboard Mockup */}
                    {activeSlide === 2 && (
                      <div className="scroll-mock" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ background: 'rgba(20,20,20,0.5)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '12px', padding: '10px' }}>
                          <span style={{ fontSize: '10px', color: '#9ca3af', textTransform: 'uppercase' }}>Daily Calories</span>
                          
                          {/* Circular progress loader */}
                          {(() => {
                            const maxVal = 2400;
                            // Progress increments over the slide duration
                            const startFrame = 150;
                            const progressT = Math.min(1, Math.max(0, (frame - startFrame) / 100)); // 100 frames animation
                            const caloriesEaten = Math.round(progressT * 1850);
                            const percent = (caloriesEaten / maxVal) * 100;
                            
                            const radius = 45;
                            const circumference = 2 * Math.PI * radius;
                            const strokeDashoffset = circumference - (percent / 100) * circumference;

                            return (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                                <div className="circle-progress-container">
                                  <svg width="110" height="110" style={{ transform: 'rotate(-90deg)' }}>
                                    <circle className="circle-bg" cx="55" cy="55" r={radius} />
                                    <circle 
                                      className="circle-val" 
                                      cx="55" 
                                      cy="55" 
                                      r={radius} 
                                      strokeDasharray={circumference} 
                                      strokeDashoffset={strokeDashoffset} 
                                    />
                                  </svg>
                                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                                    <span style={{ fontSize: '14px', fontWeight: 800 }}>{caloriesEaten}</span>
                                    <div style={{ fontSize: '7px', color: '#4b5563', textTransform: 'uppercase' }}>kcal</div>
                                  </div>
                                </div>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                  <div style={{ fontSize: '11px', color: '#ffffff' }}>Target: <strong>2,400</strong></div>
                                  <div style={{ fontSize: '10px', color: '#10b981' }}>Remaining: {maxVal - caloriesEaten}</div>
                                  <div style={{ fontSize: '9px', color: '#ffe494' }}>Active Split: Push Day</div>
                                </div>
                              </div>
                            );
                          })()}
                        </div>

                        {/* BWR details floating overlay */}
                        <div style={{ background: 'rgba(212,175,55,0.04)', border: '1px solid var(--pitch-border)', borderRadius: '12px', padding: '10px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                            <span style={{ color: '#9ca3af' }}>Current BWR Metric</span>
                            <span style={{ color: 'var(--pitch-primary)', fontWeight: 'bold' }}>1.618 (Golden)</span>
                          </div>
                          <div style={{ height: '4px', background: '#121212', borderRadius: '2px', marginTop: '6px', overflow: 'hidden' }}>
                            <div style={{ width: '80%', height: '100%', background: 'var(--pitch-primary)' }} />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SLIDE 3: Workout Tab Mockup */}
                    {activeSlide === 3 && (
                      <div className="scroll-mock" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 'bold' }}>EXERCISE 1 OF 5</span>
                          <span style={{ fontSize: '10px', background: 'rgba(212,175,55,0.15)', color: 'var(--pitch-primary)', padding: '2px 6px', borderRadius: '4px' }}>Chest</span>
                        </div>

                        {/* Bench Press Card */}
                        <div style={{ background: 'rgba(20,20,20,0.8)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '12px' }}>
                          <div style={{ fontSize: '13px', fontWeight: 800, color: '#ffffff' }}>Barbell Bench Press</div>
                          <div style={{ fontSize: '9px', color: '#6b7280', marginTop: '2px' }}>Target: Chest Hypertrophy</div>
                          
                          {/* Sets logging ticks */}
                          {(() => {
                            const startFrame = 330;
                            // Check first box after 40 frames, second after 80, third after 120
                            const set1Done = frame > (startFrame + 30);
                            const set2Done = frame > (startFrame + 70);
                            const set3Done = frame > (startFrame + 110);

                            return (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', background: set1Done ? 'rgba(16,185,129,0.05)' : 'transparent', padding: '4px', borderRadius: '4px' }}>
                                  <span style={{ color: set1Done ? '#10b981' : '#9ca3af' }}>Set 1: 80kg x 8 reps</span>
                                  <span style={{ fontSize: '12px' }}>{set1Done ? '✅' : '⬜'}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', background: set2Done ? 'rgba(16,185,129,0.05)' : 'transparent', padding: '4px', borderRadius: '4px' }}>
                                  <span style={{ color: set2Done ? '#10b981' : '#9ca3af' }}>Set 2: 80kg x 8 reps</span>
                                  <span style={{ fontSize: '12px' }}>{set2Done ? '✅' : '⬜'}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', background: set3Done ? 'rgba(16,185,129,0.05)' : 'transparent', padding: '4px', borderRadius: '4px' }}>
                                  <span style={{ color: set3Done ? '#10b981' : '#9ca3af' }}>Set 3: 80kg x 7 reps</span>
                                  <span style={{ fontSize: '12px' }}>{set3Done ? '✅' : '⬜'}</span>
                                </div>
                              </div>
                            );
                          })()}
                        </div>

                        {/* Interactive Body Visual Highlight */}
                        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '12px', padding: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {/* Miniature visual highlight */}
                          <div style={{ width: '40px', height: '50px', background: 'rgba(212,175,55,0.05)', borderRadius: '6px', border: '1px solid var(--pitch-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                            🧍
                          </div>
                          <div>
                            <div style={{ fontSize: '10px', color: '#9ca3af', textTransform: 'uppercase' }}>Focus Muscles</div>
                            <div style={{ fontSize: '11px', color: 'var(--pitch-primary)', fontWeight: 'bold' }}>Pectoralis Major, Triceps</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SLIDE 4: Diet Tab Mockup */}
                    {activeSlide === 4 && (
                      <div className="scroll-mock" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 'bold' }}>DIET JOURNAL</span>
                          <span style={{ fontSize: '9px', background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '2px 6px', borderRadius: '4px' }}>Anabolic Phase</span>
                        </div>

                        {/* Food List Mock */}
                        <div style={{ background: 'rgba(20,20,20,0.8)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                            <span>🍳 Egg Whites (x6)</span>
                            <span style={{ color: 'var(--pitch-primary)' }}>102 kcal</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                            <span>🥣 Quick Oats (100g)</span>
                            <span style={{ color: 'var(--pitch-primary)' }}>389 kcal</span>
                          </div>
                          
                          {/* Animated Add Food effect */}
                          {(() => {
                            const startFrame = 510;
                            const foodAdded = frame > (startFrame + 50);
                            return (
                              <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                fontSize: '11px',
                                borderTop: '1px dashed rgba(255,255,255,0.05)',
                                paddingTop: '6px',
                                opacity: foodAdded ? 1 : 0,
                                transform: foodAdded ? 'translateY(0)' : 'translateY(-10px)',
                                transition: 'all 0.5s ease-out',
                                color: 'var(--pitch-primary)'
                              }}>
                                <span>🍗 Chicken Breast (Grilled, 200g)</span>
                                <span>330 kcal</span>
                              </div>
                            );
                          })()}
                        </div>

                        {/* Macros Chart Mockup */}
                        {(() => {
                          const startFrame = 510;
                          const progressT = Math.min(1, Math.max(0, (frame - startFrame) / 120)); // 120 frames animation
                          
                          // Animate macros widths
                          const proteinW = 40 + progressT * 20; // 40% -> 60%
                          const carbW = 35 - progressT * 10;    // 35% -> 25%
                          const fatW = 25 - progressT * 10;     // 25% -> 15%

                          return (
                            <div style={{ background: 'rgba(212,175,55,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '12px', padding: '10px' }}>
                              <span style={{ fontSize: '10px', color: '#9ca3af', textTransform: 'uppercase' }}>Macro Split Ratio</span>
                              <div style={{ display: 'flex', height: '16px', borderRadius: '8px', overflow: 'hidden', marginTop: '6px' }}>
                                <div style={{ width: `${proteinW}%`, background: 'var(--pitch-primary)', transition: 'width 0.1s' }} />
                                <div style={{ width: `${carbW}%`, background: '#3b82f6', transition: 'width 0.1s' }} />
                                <div style={{ width: `${fatW}%`, background: '#ef4444', transition: 'width 0.1s' }} />
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', marginTop: '6px', color: '#9ca3af' }}>
                                <span>P: {Math.round(proteinW)}%</span>
                                <span>C: {Math.round(carbW)}%</span>
                                <span>F: {Math.round(fatW)}%</span>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {/* SLIDE 5: Customizer & History Mockup */}
                    {activeSlide === 5 && (
                      <div className="scroll-mock" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 'bold' }}>PRESETS & STATS</span>
                        
                        {/* Preset List Selection */}
                        <div style={{ background: 'rgba(20,20,20,0.8)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div style={{ fontSize: '10px', color: '#6b7280' }}>Active Routine Split</div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', background: 'rgba(212,175,55,0.1)', border: '1px solid var(--pitch-border)', padding: '6px', borderRadius: '6px' }}>
                            <span style={{ fontWeight: 'bold', color: 'var(--pitch-primary)' }}>Xivi Aesthetic Blueprint</span>
                            <span>✓</span>
                          </div>
                        </div>

                        {/* Weight Tracker mini chart */}
                        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '12px', padding: '10px' }}>
                          <span style={{ fontSize: '9px', color: '#9ca3af', textTransform: 'uppercase' }}>7-Day Weight Log (kg)</span>
                          
                          {/* Mini Bar Chart */}
                          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '50px', marginTop: '8px', padding: '0 4px' }}>
                            {initialWeightData.map((d, idx) => {
                              // Calculate height percentage relative to weight
                              const heightPct = ((d.weight - 73) / (76 - 73)) * 100;
                              // Staggered animation
                              const animStart = 690 + idx * 8;
                              const currentHeight = frame > animStart 
                                ? heightPct 
                                : 0;
                              
                              return (
                                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', width: '10%' }}>
                                  <div style={{ 
                                    width: '100%', 
                                    height: `${currentHeight * 0.4}px`, 
                                    background: 'var(--pitch-primary)', 
                                    borderRadius: '2px 2px 0 0',
                                    transition: 'height 0.3s ease-out'
                                  }} />
                                  <span style={{ fontSize: '8px', color: '#4b5563' }}>{d.date}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Mock Tab bar navigation */}
                  <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '10px 0', borderTop: '1px solid rgba(255,255,255,0.05)', background: '#070707', borderBottomRightRadius: '32px', borderBottomLeftRadius: '32px' }}>
                    <span style={{ fontSize: '14px', filter: activeSlide === 2 ? 'grayscale(0)' : 'grayscale(1)', opacity: activeSlide === 2 ? 1 : 0.4 }}>🏠</span>
                    <span style={{ fontSize: '14px', filter: activeSlide === 3 ? 'grayscale(0)' : 'grayscale(1)', opacity: activeSlide === 3 ? 1 : 0.4 }}>🏋️</span>
                    <span style={{ fontSize: '14px', filter: activeSlide === 4 ? 'grayscale(0)' : 'grayscale(1)', opacity: activeSlide === 4 ? 1 : 0.4 }}>🥗</span>
                    <span style={{ fontSize: '14px', filter: activeSlide === 5 ? 'grayscale(0)' : 'grayscale(1)', opacity: activeSlide === 5 ? 1 : 0.4 }}>🛠️</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Side bezels to simulate 3D phone thickness */}
            <div className="phone-side-3d side-left" />
            <div className="phone-side-3d side-right" />
            <div className="phone-side-3d side-top" />
            <div className="phone-side-3d side-bottom" />

            {/* Phone Back Face */}
            <div className="phone-back-face">
              <div className="phone-back-logo">CONNECT.FITNESS</div>
              <span style={{ fontSize: '9px', color: '#4b5563', letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: '10px' }}>Aesthetic Tracker</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Pitch Cards (Slide in overlay during Slide 6 / CTA) */}
      <div className={`pitch-brand-details ${activeSlide === 6 ? 'active' : ''}`} style={floatCardStyle(30)}>
        <div className="pitch-card">
          <h3>🏆 Routine Sponsorship</h3>
          <p>Feature branded training routines directly in users' lists. Ideal for coaching platforms & fitness brands.</p>
        </div>
        <div className="pitch-card">
          <h3>🥗 Product Integrations</h3>
          <p>Incorporate health supplements or food products directly in the diet logs search results & suggestions.</p>
        </div>
        <div className="pitch-card" style={{ border: '1px solid var(--pitch-primary)', boxShadow: '0 0 15px rgba(212,175,55,0.1)' }}>
          <h3>🔗 Direct E-Commerce</h3>
          <p>Integrate links to supplement stores, activewear, and workout gear right at the points of action.</p>
        </div>
      </div>

      {/* Subtitles Overlay */}
      <div className="subtitles-overlay">
        <div className="subtitle-box">
          {slideNarration}
        </div>
      </div>

      {/* Playback Controls Footer (Hidden during recording) */}
      <div className="playback-controls">
        <button 
          className="control-btn"
          onClick={() => setIsPlaying(!isPlaying)}
        >
          {isPlaying ? '⏸️ Pause' : '▶️ Play Pitch'}
        </button>

        <input 
          type="range"
          min="0"
          max={TOTAL_FRAMES - 1}
          value={Math.round(frame)}
          onChange={handleTimelineScrub}
          className="scrub-bar"
        />

        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className={`control-btn ${speed === 1.5 ? 'active' : ''}`}
            onClick={() => setSpeed(speed === 1.5 ? 1 : 1.5)}
          >
            ⚡ {speed === 1.5 ? '1.5x Speed' : '1.0x Speed'}
          </button>
          
          <button 
            className={`control-btn ${isInteractive ? 'active' : ''}`}
            onClick={() => {
              setIsInteractive(!isInteractive);
              if (!isInteractive) setIsPlaying(false); // Pause when taking manual control
            }}
          >
            🎮 {isInteractive ? 'Auto-Play View' : 'Manual 3D Orbit'}
          </button>
        </div>
      </div>
    </div>
  );
}
