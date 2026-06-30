'use client';

import React, { useState, useEffect } from 'react';
import { Exercise } from '../data/exercises';

interface WorkoutVisualProps {
  exercise: Exercise;
  isActive?: boolean;
}

const visualCategoryMuscles: Record<string, string> = {
  bench_press: 'Chest, Triceps, Anterior Deltoids',
  incline_press: 'Upper Chest, Triceps, Anterior Deltoids',
  flyes: 'Pectoralis Major, Inner Chest',
  pullups: 'Lats, Rhomboids, Biceps, Upper Back',
  rows: 'Lats, Mid-Back, Traps, Rear Deltoids',
  shoulder_press: 'Anterior & Lateral Deltoids, Triceps',
  lateral_raise: 'Lateral Deltoids (Side Shoulders)',
  bicep_curl: 'Biceps Brachii, Brachialis',
  tricep_extension: 'Triceps Brachii (All Heads)',
  squats: 'Quadriceps, Glutes, Hamstrings, Core',
  deadlifts: 'Hamstrings, Glutes, Lower Back, Traps',
  crunches: 'Rectus Abdominis, Obliques',
  plank: 'Transverse Abdominis, Core, Lower Back',
  neck: 'Sternocleidomastoid, Splenius, Neck Muscles',
};

export default function WorkoutVisual({ exercise, isActive = true }: WorkoutVisualProps) {
  const [loading, setLoading] = useState(true);
  const [imgSrc, setImgSrc] = useState(`/images/${exercise.id}.png`);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    let active = true;
    const targetUrl = `/images/${exercise.id}.png`;
    const tempImg = new Image();
    tempImg.src = targetUrl;
    
    if (tempImg.complete) {
      setImgSrc(targetUrl);
      setLoading(false);
    } else {
      setLoading(true);
      setImgSrc(targetUrl);
      
      tempImg.onload = () => {
        if (active) {
          setImgSrc(targetUrl);
          setLoading(false);
        }
      };
      
      tempImg.onerror = () => {
        if (active) {
          setImgSrc('/images/placeholder.png');
          setLoading(false);
        }
      };
    }
    
    return () => {
      active = false;
    };
  }, [exercise.id]);

  const exerciseName = exercise.name;
  const muscleGroups = visualCategoryMuscles[exercise.visualCategory] || exercise.category;

  if (!isActive) {
    return (
      <div 
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          background: 'transparent',
          overflow: 'hidden',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgSrc}
          alt={exerciseName}
          onError={() => {
            setImgSrc('/images/placeholder.png');
          }}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
        />
      </div>
    );
  }

  return (
    <div 
      className="workout-visual-container"
      style={{
        width: '100%',
        height: '100%',
        minHeight: '260px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        background: 'rgba(15, 15, 15, 0.65)',
        border: '1px solid rgba(230, 194, 128, 0.15)',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
        padding: '16px',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Background glow when active */}
      {isActive && (
        <div 
          style={{
            position: 'absolute',
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            background: 'var(--primary-glow)',
            filter: 'blur(50px)',
            opacity: 0.6,
            zIndex: 0,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Image Container */}
      <div 
        style={{
          width: '100%',
          height: '180px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {loading && (
          <div 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(20, 20, 20, 0.8)',
              borderRadius: '12px',
            }}
          >
            <div 
              style={{
                width: '32px',
                height: '32px',
                border: '2px solid rgba(212, 175, 55, 0.1)',
                borderTopColor: 'var(--primary)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}
            />
          </div>
        )}
        
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgSrc}
          alt={exerciseName}
          onError={() => {
            setImgSrc('/images/placeholder.png');
          }}
          onLoad={() => {
            setLoading(false);
          }}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            borderRadius: '12px',
            transition: 'transform 0.4s ease-out, opacity 0.3s ease-out',
            opacity: loading ? 0 : 1,
            transform: loading ? 'scale(0.95)' : 'scale(1)',
          }}
        />
      </div>

      {/* Labels / Info Overlay */}
      <div 
        style={{
          width: '100%',
          marginTop: '12px',
          textAlign: 'center',
          zIndex: 1,
        }}
      >
        <div 
          style={{
            fontFamily: 'var(--font-title)',
            fontSize: '15px',
            fontWeight: '700',
            color: '#ffffff',
            letterSpacing: '0.02em',
            textShadow: '0 2px 4px rgba(0,0,0,0.5)',
          }}
        >
          {exerciseName}
        </div>
        <div 
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '11px',
            color: 'var(--muted)',
            marginTop: '2px',
            letterSpacing: '0.01em',
          }}
        >
          Targets: <span style={{ color: 'var(--primary)' }}>{muscleGroups}</span>
        </div>
      </div>
      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
