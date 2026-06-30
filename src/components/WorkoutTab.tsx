'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { allExercises, Exercise, defaultPreset, WorkoutPreset, WorkoutPresetItem } from '../data/exercises';
import { UserStats } from './Onboarding';
import WorkoutVisual from './WorkoutVisual';
import CustomDropdown from './CustomDropdown';
import { getTrackingDateString, getTrackingDayOfWeek } from '../utils/fitnessCalc';

// Animated circular countdown timer component for timed exercises
interface WorkoutTimerProps {
  durationSeconds: number;
  onCompleted?: () => void;
}

function WorkoutTimer({ durationSeconds, onCompleted }: WorkoutTimerProps) {
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    setTimeLeft(durationSeconds);
    setIsRunning(false);
  }, [durationSeconds]);

  useEffect(() => {
    let timer: any = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            if (onCompleted) onCompleted();
            playBeep();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, timeLeft, onCompleted]);

  const playBeep = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + 0.2); // Beep for 200ms
    } catch (e) {
      console.error('AudioContext beep error:', e);
    }
  };

  const handleToggle = () => setIsRunning(!isRunning);
  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(durationSeconds);
  };
  const handleAdjust = (amount: number) => {
    setTimeLeft(prev => Math.max(5, prev + amount));
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = durationSeconds > 0 ? timeLeft / durationSeconds : 0;
  // Circumference is 2 * Math.PI * 40 = 251.3
  const strokeDashoffset = 251.3 - 251.3 * progress;

  return (
    <div 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        margin: '16px 0', 
        gap: '12px',
        padding: '16px',
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255,255,255,0.04)',
        borderRadius: '12px',
        position: 'relative'
      }}
    >
      <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
        Exercise Timer
      </span>

      <div style={{ position: 'relative', width: '110px', height: '110px' }}>
        {/* Pulsing background glow when running */}
        {isRunning && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: '50%',
            background: 'var(--primary-glow)',
            filter: 'blur(16px)',
            opacity: 0.3,
            animation: 'timerPulse 1.5s ease-in-out infinite',
            zIndex: 0
          }} />
        )}
        
        {/* SVG Circular Progress */}
        <svg width="110" height="110" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)', zIndex: 1, position: 'relative' }}>
          <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.06)" strokeWidth="6" fill="transparent" />
          <circle 
            cx="50" 
            cy="50" 
            r="40" 
            stroke="var(--primary)" 
            strokeWidth="6" 
            fill="transparent" 
            strokeDasharray="251.3"
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.3s ease-out' }}
          />
        </svg>
        
        {/* Time Text in Center */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-title)',
          fontSize: '22px',
          fontWeight: 800,
          color: '#ffffff',
          zIndex: 2
        }}>
          {minutes}:{seconds.toString().padStart(2, '0')}
          <span style={{ fontSize: '9px', color: isRunning ? 'var(--primary)' : 'var(--muted)', marginTop: '2px', fontWeight: 600, letterSpacing: '0.05em' }}>
            {isRunning ? 'RUNNING' : 'PAUSED'}
          </span>
        </div>
      </div>

      {/* Timer Controls */}
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
        <button 
          type="button"
          className="btn-secondary" 
          onClick={() => handleAdjust(-10)} 
          style={{ padding: '4px 8px', fontSize: '11px', minWidth: '40px' }}
        >
          -10s
        </button>
        <button 
          type="button"
          className="btn-primary" 
          onClick={handleToggle}
          style={{ 
            padding: '6px 14px', 
            fontSize: '12px', 
            minWidth: '70px',
            background: isRunning ? '#ef4444' : 'var(--primary)',
            color: isRunning ? '#ffffff' : 'var(--background)',
            borderColor: isRunning ? '#ef4444' : 'var(--primary)'
          }}
        >
          {isRunning ? 'Pause' : 'Start'}
        </button>
        <button 
          type="button"
          className="btn-secondary" 
          onClick={handleReset} 
          style={{ padding: '6px 10px', fontSize: '12px' }}
        >
          Reset
        </button>
        <button 
          type="button"
          className="btn-secondary" 
          onClick={() => handleAdjust(10)} 
          style={{ padding: '4px 8px', fontSize: '11px', minWidth: '40px' }}
        >
          +10s
        </button>
      </div>

      <style jsx global>{`
        @keyframes timerPulse {
          0% { transform: scale(0.96); opacity: 0.25; }
          50% { transform: scale(1.04); opacity: 0.5; }
          100% { transform: scale(0.96); opacity: 0.25; }
        }
      `}</style>
    </div>
  );
}

interface EatenFood {
  id: string;
  name: string;
  grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  quantity?: number;
  cookingMethod?: 'normal' | 'grilled' | 'fried';
}

interface CompletedExerciseLog {
  id: string;
  name: string;
  completedSets: number;
  totalSets: number;
}

interface DayLog {
  eaten: EatenFood[];
  workoutCompleted: boolean;
  workoutDifficulty: 'easy' | 'intermediate' | 'hard';
  workoutDayName: string;
  weightAtDate: number;
  calorieTarget: number;
  completedExercises?: CompletedExerciseLog[];
}

interface WorkoutTabProps {
  userStats: UserStats;
  activePreset: WorkoutPreset;
  dailyLogs: { [dateStr: string]: DayLog };
  onLogsUpdate: (updatedLogs: { [dateStr: string]: DayLog }) => void;
  startWorkoutImmediately?: boolean;
  onClearStartWorkoutImmediately?: () => void;
}

export default function WorkoutTab({
  userStats,
  activePreset,
  dailyLogs,
  onLogsUpdate,
  startWorkoutImmediately,
  onClearStartWorkoutImmediately,
}: WorkoutTabProps) {
  // Muscle targets mapping for each day
  const dayMuscleTargets: { [day: string]: string } = {
    Monday: 'Chest, Triceps, Abs',
    Tuesday: 'Back, Biceps, Abs, Neck',
    Wednesday: 'Shoulders, Abs',
    Thursday: 'Chest, Triceps, Abs, Neck (Vol)',
    Friday: 'Back, Biceps, Abs, Neck (Vol)',
    Saturday: 'Legs, Abs',
    Sunday: 'REST'
  };

  const [selectedDay, setSelectedDay] = useState<string>(getTrackingDayOfWeek());
  const [workoutDifficulty, setWorkoutDifficulty] = useState<'easy' | 'intermediate' | 'hard'>('intermediate');
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);
  
  // Runner States
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState<number>(0);
  const [sessionCompletedSets, setSessionCompletedSets] = useState<{ [exerciseIndex: number]: boolean[] }>({});
  const [workoutLog, setWorkoutLog] = useState<{ [exerciseId: string]: string }>({});

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const todayStr = useMemo(() => getTrackingDateString(), []);

  // Retrieve and normalize exercises for selected day
  const dayExercises = useMemo(() => {
    const rawItems = activePreset.schedule[selectedDay] || [];
    return rawItems
      .map(item => {
        const normalized: WorkoutPresetItem = typeof item === 'string' ? { id: item } : item;
        const ex = allExercises.find(e => e.id === normalized.id);
        if (!ex) return null;
        return {
          exercise: ex,
          customSets: normalized.customSets,
          customReps: normalized.customReps,
          timerSeconds: normalized.timerSeconds
        };
      })
      .filter((item): item is NonNullable<typeof item> => !!item);
  }, [activePreset, selectedDay]);

  // Preload all exercise images for the active day to avoid loading delays during workouts
  useEffect(() => {
    if (typeof window !== 'undefined' && dayExercises.length > 0) {
      dayExercises.forEach(item => {
        const img = new Image();
        img.src = `/images/${item.exercise.id}.png`;
      });
    }
  }, [dayExercises]);

  // Check if there is a saved workout session that can be resumed
  const savedWorkoutInfo = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const saved = localStorage.getItem('connect_fit_saved_workout');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.dateStr === todayStr && parsed.presetName === activePreset.name) {
          return parsed;
        }
      } catch (e) {}
    }
    return null;
  }, [todayStr, activePreset.name, sessionCompletedSets, isSessionActive]);

  // Auto-start workout session if requested from Dashboard
  useEffect(() => {
    if (startWorkoutImmediately && dayExercises.length > 0) {
      setIsSessionActive(true);
      setCurrentExerciseIndex(0);
      setSessionCompletedSets({});
      onClearStartWorkoutImmediately?.();
    }
  }, [startWorkoutImmediately, dayExercises, onClearStartWorkoutImmediately]);

  // Reset when day/difficulty changes (only if no active session running)
  useEffect(() => {
    if (!isSessionActive) {
      setCurrentExerciseIndex(0);
      setExpandedExerciseId(null);
    }
  }, [selectedDay, workoutDifficulty, isSessionActive]);

  // Auto-save session progress to local storage when changes happen
  useEffect(() => {
    if (isSessionActive && dayExercises.length > 0) {
      const savedState = {
        dateStr: todayStr,
        selectedDay: selectedDay,
        currentExerciseIndex,
        workoutDifficulty,
        presetName: activePreset.name,
        completedSetsRecord: sessionCompletedSets
      };
      localStorage.setItem('connect_fit_saved_workout', JSON.stringify(savedState));
    }
  }, [isSessionActive, currentExerciseIndex, sessionCompletedSets, workoutDifficulty, selectedDay, todayStr, activePreset.name, dayExercises]);

  // Sets count for the current exercise
  const currentExerciseSetsCount = useMemo(() => {
    const activeItem = dayExercises[currentExerciseIndex];
    if (!activeItem) return 0;
    if (activeItem.customSets !== undefined) return activeItem.customSets;
    if (workoutDifficulty === 'easy') return 3;
    if (workoutDifficulty === 'intermediate') return 5;
    return 7;
  }, [dayExercises, currentExerciseIndex, workoutDifficulty]);

  // Derived completed sets state for current exercise
  const completedSets = useMemo(() => {
    const sets = sessionCompletedSets[currentExerciseIndex];
    if (sets && sets.length === currentExerciseSetsCount) return sets;
    return new Array(currentExerciseSetsCount).fill(false);
  }, [sessionCompletedSets, currentExerciseIndex, currentExerciseSetsCount]);

  // Progress stats calculation: 3 sets minimum per exercise for 100% completion
  const progressStats = useMemo(() => {
    if (dayExercises.length === 0) return { percent: 0, standardTarget: 0, standardDone: 0, bonusDone: 0 };
    
    let totalStandardTarget = 0;
    let totalStandardDone = 0;
    let totalBonusDone = 0;

    dayExercises.forEach((item, idx) => {
      const setsCount = item.customSets ?? (workoutDifficulty === 'easy' ? 3 : workoutDifficulty === 'intermediate' ? 5 : 7);
      
      const standardTargetForEx = Math.min(setsCount, 3);
      totalStandardTarget += standardTargetForEx;

      const setsState = sessionCompletedSets[idx] || [];
      const completedCount = setsState.filter(Boolean).length;
      
      totalStandardDone += Math.min(completedCount, standardTargetForEx);
      totalBonusDone += Math.max(0, completedCount - standardTargetForEx);
    });

    const percent = totalStandardTarget > 0 ? Math.round((totalStandardDone / totalStandardTarget) * 100) : 0;
    return { percent: Math.min(100, percent), standardTarget: totalStandardTarget, standardDone: totalStandardDone, bonusDone: totalBonusDone };
  }, [dayExercises, sessionCompletedSets, workoutDifficulty]);

  // Weight scale formula based on BWR and Level
  const getScaledWeightRange = (exercise: Exercise): string => {
    if (exercise.refWeightKg === 0) return 'Bodyweight';

    let levelMod = 1.00;
    if (userStats.trainingAge === 'beginner') levelMod = 0.65;
    else if (userStats.trainingAge === 'intermediate') levelMod = 0.90;

    const bwr = userStats.bwr;
    const match = exercise.refWeightText.match(/(\d+)(?:–(\d+))?/);
    if (!match) return exercise.refWeightText;

    const minRef = parseFloat(match[1]);
    const maxRef = match[2] ? parseFloat(match[2]) : minRef;

    const scale = (val: number) => {
      const scaled = val * bwr * levelMod;
      return Math.round(scaled / 2.5) * 2.5; // nearest 2.5kg
    };

    const minScaled = scale(minRef);
    const maxScaled = scale(maxRef);

    let weightLabel = '';
    if (exercise.isBodyweightPlus) {
      weightLabel = `BW + ${minScaled} kg`;
    } else if (minScaled === maxScaled) {
      weightLabel = `${minScaled} kg`;
    } else {
      weightLabel = `${minScaled}–${maxScaled} kg`;
    }

    if (exercise.isDumbbellEach) {
      weightLabel += ' each';
    } else if (exercise.refWeightText.includes('stack')) {
      weightLabel += ' stack';
    } else if (exercise.refWeightText.includes('plate')) {
      weightLabel += ' plate';
    }

    return weightLabel;
  };

  const handleStartWorkout = () => {
    if (dayExercises.length === 0) return;
    setSessionCompletedSets({});
    setIsSessionActive(true);
    setCurrentExerciseIndex(0);
  };

  const handleResumeWorkout = () => {
    const savedStateStr = localStorage.getItem('connect_fit_saved_workout');
    if (savedStateStr) {
      try {
        const savedState = JSON.parse(savedStateStr);
        setSelectedDay(savedState.selectedDay);
        setWorkoutDifficulty(savedState.workoutDifficulty);
        setCurrentExerciseIndex(savedState.currentExerciseIndex);
        setSessionCompletedSets(savedState.completedSetsRecord || {});
        setIsSessionActive(true);
      } catch (e) {
        console.error('Failed to resume saved workout:', e);
      }
    }
  };

  const handleSetCheck = (index: number) => {
    const currentSets = [...completedSets];
    const isChecking = !currentSets[index];

    // Enforce sequence-wise completion
    if (isChecking) {
      // Must check preceding sets first
      for (let i = 0; i < index; i++) {
        if (!currentSets[i]) {
          alert(`Please complete Set ${i + 1} before logging Set ${index + 1}.`);
          return;
        }
      }
    } else {
      // Must uncheck succeeding sets first
      for (let i = index + 1; i < currentSets.length; i++) {
        if (currentSets[i]) {
          alert(`Please uncheck Set ${i + 1} before removing Set ${index + 1}.`);
          return;
        }
      }
    }

    currentSets[index] = isChecking;
    setSessionCompletedSets(prev => ({
      ...prev,
      [currentExerciseIndex]: currentSets
    }));
  };

  const handleFinishWorkout = () => {
    // Collect all exercises details and completed sets
    const completedExercisesList = dayExercises.map((item, idx) => {
      const setsState = sessionCompletedSets[idx] || [];
      const completedCount = setsState.filter(Boolean).length;
      const totalExSets = item.customSets ?? (workoutDifficulty === 'easy' ? 3 : workoutDifficulty === 'intermediate' ? 5 : 7);
      
      return {
        id: item.exercise.id,
        name: item.exercise.name,
        completedSets: completedCount,
        totalSets: totalExSets
      };
    }).filter(item => item.completedSets > 0);

    const todayLog = dailyLogs[todayStr] || {
      eaten: [],
      workoutCompleted: false,
      workoutDifficulty: 'intermediate',
      workoutDayName: selectedDay,
      weightAtDate: userStats.weightKg,
      calorieTarget: userStats.caloriesBulk
    };

    const updatedLog: DayLog = {
      ...todayLog,
      workoutCompleted: true,
      workoutDifficulty: workoutDifficulty,
      workoutDayName: selectedDay,
      completedExercises: completedExercisesList
    };

    onLogsUpdate({
      ...dailyLogs,
      [todayStr]: updatedLog
    });

    // Clear active session and local storage saved session
    localStorage.removeItem('connect_fit_saved_workout');
    setIsSessionActive(false);
    setSessionCompletedSets({});
    setCurrentExerciseIndex(0);

    alert('Workout Session Logged successfully in Connect.Fitness! Keep up the dedication.');
  };

  const handleStopWorkout = () => {
    // Keep saved state in localStorage, exit the active runner
    setIsSessionActive(false);
    alert('Workout paused. You can resume this session anytime today before 3 AM.');
  };

  const handleNextExercise = () => {
    // Skip logic: find the next incomplete exercise (where standard target is not reached)
    let nextIndex = currentExerciseIndex + 1;
    while (nextIndex < dayExercises.length) {
      const setsState = sessionCompletedSets[nextIndex] || [];
      const completedCount = setsState.filter(Boolean).length;
      const nextSetsCount = dayExercises[nextIndex].customSets ?? (workoutDifficulty === 'easy' ? 3 : workoutDifficulty === 'intermediate' ? 5 : 7);
      
      const required = Math.min(nextSetsCount, 3);
      if (completedCount >= required) {
        // Skip this exercise since it is already completed
        nextIndex++;
      } else {
        break;
      }
    }

    if (nextIndex < dayExercises.length) {
      setCurrentExerciseIndex(nextIndex);
    } else {
      // Check if there are any incomplete exercises earlier in the list
      let firstIncompleteIndex = -1;
      for (let i = 0; i < dayExercises.length; i++) {
        const setsState = sessionCompletedSets[i] || [];
        const completedCount = setsState.filter(Boolean).length;
        const setsCount = dayExercises[i].customSets ?? (workoutDifficulty === 'easy' ? 3 : workoutDifficulty === 'intermediate' ? 5 : 7);
        const required = Math.min(setsCount, 3);
        if (completedCount < required) {
          firstIncompleteIndex = i;
          break;
        }
      }

      if (firstIncompleteIndex !== -1) {
        setCurrentExerciseIndex(firstIncompleteIndex);
      } else {
        // Everything completed
        handleFinishWorkout();
      }
    }
  };

  const handlePrevExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(prev => prev - 1);
    }
  };

  const handleFeedback = (exerciseId: string, feedback: string) => {
    setWorkoutLog(prev => ({
      ...prev,
      [exerciseId]: feedback
    }));
  };

  const difficultyOptions = [
    { value: 'easy', label: 'Easy (3 Sets)' },
    { value: 'intermediate', label: 'Intermediate (5 Sets)' },
    { value: 'hard', label: 'Hard (7 Sets)' }
  ];

  return (
    <div className="fade-in" style={{ paddingBottom: '60px', minWidth: 0, width: '100%' }}>
      {/* Top Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '28px', color: '#ffffff', marginBottom: '8px' }}>
          Workout Tracker
        </h2>
        <p style={{ color: 'var(--muted)' }}>
          Preset: <strong style={{ color: 'var(--primary)' }}>{activePreset.name}</strong> • Level: {userStats.trainingAge.toUpperCase()}
        </p>
      </div>

      {/* Start Session Setup Hero Card at the very top! */}
      {!isSessionActive && dayExercises.length > 0 && (
        <div 
          className="glass-card fade-in" 
          style={{ 
            border: '1px solid rgba(212, 175, 55, 0.35)', 
            background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.04) 0%, rgba(0, 0, 0, 0.4) 100%)',
            marginBottom: '24px',
            padding: '24px',
            boxShadow: '0 8px 32px 0 rgba(212, 175, 55, 0.08)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ flex: '1 1 300px' }}>
              <h3 style={{ fontSize: '20px', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800 }}>
                <span>⚡</span> Ready for {selectedDay}'s Workout?
              </h3>
              <p style={{ color: 'var(--muted)', fontSize: '13.5px', marginTop: '6px', lineHeight: '1.4' }}>
                Active Routine: <strong style={{ color: 'var(--primary)' }}>{dayMuscleTargets[selectedDay]}</strong> ({dayExercises.length} movements). Select your intensity level below.
              </p>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '16px', maxWidth: '320px' }}>
                <span style={{ fontSize: '12.5px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                  Intensity:
                </span>
                <CustomDropdown
                  options={difficultyOptions}
                  value={workoutDifficulty}
                  onChange={(val) => setWorkoutDifficulty(val as any)}
                />
              </div>
            </div>
            
            <div style={{ flex: '0 0 auto', width: '100%', maxWidth: '280px' }}>
              <button 
                type="button"
                className="btn-primary" 
                onClick={handleStartWorkout}
                style={{ 
                  width: '100%', 
                  padding: '16px 24px', 
                  fontSize: '16px', 
                  fontWeight: 800,
                  boxShadow: '0 0 20px rgba(212, 175, 55, 0.35)',
                  animation: 'startPulse 2s infinite'
                }}
              >
                🏋️ START WORKOUT SESSION
              </button>
            </div>
          </div>
          
          <style jsx global>{`
            @keyframes startPulse {
              0% { transform: scale(1); box-shadow: 0 0 20px rgba(212, 175, 55, 0.35); }
              50% { transform: scale(1.02); box-shadow: 0 0 30px rgba(212, 175, 55, 0.55); }
              100% { transform: scale(1); box-shadow: 0 0 20px rgba(212, 175, 55, 0.35); }
            }
          `}</style>
        </div>
      )}

      {/* Resume Card Overlay */}
      {savedWorkoutInfo && !isSessionActive && (
        <div 
          className="glass-card fade-in" 
          style={{ 
            border: '1px solid rgba(212, 175, 55, 0.3)', 
            background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.08) 0%, rgba(0,0,0,0.2) 100%)',
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            boxShadow: '0 8px 32px 0 rgba(212, 175, 55, 0.05)'
          }}
        >
          <div>
            <h3 style={{ color: 'var(--primary)', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
              <span>⚡</span> Active Workout Paused
            </h3>
            <p style={{ color: 'var(--muted)', fontSize: '13px', marginTop: '6px' }}>
              You have an incomplete session saved from earlier today for <strong>{savedWorkoutInfo.selectedDay}</strong>.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              type="button"
              className="btn-primary" 
              onClick={handleResumeWorkout}
              style={{ padding: '8px 16px', fontSize: '13.5px' }}
            >
              Resume Workout
            </button>
            <button 
              type="button"
              className="btn-secondary" 
              onClick={() => {
                if (confirm('Are you sure you want to discard your paused workout progress? This cannot be undone.')) {
                  localStorage.removeItem('connect_fit_saved_workout');
                  setSessionCompletedSets({});
                }
              }}
              style={{ padding: '8px 16px', fontSize: '13.5px', color: 'var(--error)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
            >
              Discard
            </button>
          </div>
        </div>
      )}

      {/* Day Selectors - Dedicated Full Width Scrollable Container */}
      {!isSessionActive && (
        <div style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          width: '100%',
          paddingBottom: '12px',
          marginBottom: '32px',
          WebkitOverflowScrolling: 'touch',
        }}>
          {daysOfWeek.map((day) => {
            const isSelected = selectedDay === day;
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid',
                  borderColor: isSelected ? 'var(--primary)' : 'rgba(255,255,255,0.06)',
                  background: isSelected ? 'var(--primary)' : 'var(--secondary)',
                  color: isSelected ? 'var(--background)' : '#ffffff',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'var(--transition)',
                  textAlign: 'left',
                  minWidth: '150px',
                  flexShrink: 0
                }}
              >
                <div style={{ fontSize: '13px' }}>{day}</div>
                <div style={{ fontSize: '10px', color: isSelected ? 'rgba(0, 0, 0, 0.7)' : 'var(--muted)', fontWeight: 500, marginTop: '2px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {dayMuscleTargets[day]}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Routine Detail Panel */}
      {!isSessionActive ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Exercises List for Selected Day */}
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '16px', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '20px', color: '#ffffff' }}>
                  {selectedDay}'s Routine
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 500 }}>
                  Target: {dayMuscleTargets[selectedDay]}
                </span>
              </div>
              {dayExercises.length > 0 && (
                <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
                  {dayExercises.length} Exercises
                </span>
              )}
            </div>

            {selectedDay === 'Sunday' || dayExercises.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)' }}>
                <p style={{ fontSize: '18px', color: '#ffffff', marginBottom: '12px' }}>REST / Active Recovery Day</p>
                <p style={{ fontSize: '14px' }}>
                  No weights today. Focus on mobility, light walking, and hit your hydration targets ({(userStats.waterMl / 1000).toFixed(1)}L).
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {dayExercises.map((exItem, idx) => {
                  const ex = exItem.exercise;
                  const isExpanded = expandedExerciseId === `${ex.id}-${idx}`;
                  const setsCount = exItem.customSets !== undefined ? exItem.customSets : ex.defaultSets;
                  const repsCount = exItem.customReps !== undefined ? exItem.customReps : ex.defaultReps;
                  return (
                    <div
                      key={`${ex.id}-${idx}`}
                      onClick={() => setExpandedExerciseId(isExpanded ? null : `${ex.id}-${idx}`)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        padding: '16px',
                        background: isExpanded ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
                        borderRadius: '12px',
                        border: isExpanded ? '1px solid rgba(212, 175, 55, 0.3)' : '1px solid rgba(255,255,255,0.04)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease-in-out',
                        gap: isExpanded ? '16px' : '0px'
                      }}
                    >
                      {/* Top Header Row (always visible) */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '100%' }}>
                        <div style={{ width: '50px', height: '50px', borderRadius: '6px', background: '#000', overflow: 'hidden', flexShrink: 0 }}>
                          <WorkoutVisual exercise={ex} isActive={false} />
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4 style={{ fontSize: '15px', color: '#ffffff', fontWeight: 600, marginBottom: '6px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{ex.name}</h4>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                            <span style={{ display: 'inline-block', padding: '3px 8px', fontSize: '11px', fontWeight: 600, background: 'rgba(255, 255, 255, 0.05)', color: '#e5e7eb', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.03)' }}>
                              {setsCount} Sets
                            </span>
                            <span style={{ display: 'inline-block', padding: '3px 8px', fontSize: '11px', fontWeight: 600, background: 'rgba(255, 255, 255, 0.05)', color: '#e5e7eb', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.03)' }}>
                              {repsCount} {exItem.timerSeconds ? 's (Timer)' : 'Reps'}
                            </span>
                            <span style={{ display: 'inline-block', padding: '3px 8px', fontSize: '11px', fontWeight: 600, background: 'rgba(212, 175, 55, 0.1)', color: 'var(--primary)', borderRadius: '6px', border: '1px solid rgba(212, 175, 55, 0.15)' }}>
                              {getScaledWeightRange(ex)}
                            </span>
                          </div>
                        </div>

                        {/* Chevron Indicator */}
                        <div style={{
                          color: isExpanded ? 'var(--primary)' : 'var(--muted)',
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '24px',
                          height: '24px',
                          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s ease',
                          flexShrink: 0
                        }}>
                          ▼
                        </div>
                      </div>

                      {/* Detail section (only when expanded) */}
                      {isExpanded && (
                        <div 
                          style={{
                            borderTop: '1px solid rgba(255,255,255,0.06)',
                            paddingTop: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                            cursor: 'default'
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Target Muscle badge & rest time */}
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                            <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Target Muscle:</span>
                            <span style={{
                              display: 'inline-block',
                              padding: '4px 10px',
                              fontSize: '11px',
                              fontWeight: 700,
                              background: 'rgba(194, 248, 66, 0.1)',
                              color: '#c2f842',
                              borderRadius: '6px',
                              border: '1px solid rgba(194, 248, 66, 0.25)',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em'
                            }}>
                              {ex.targetMuscleDetail || ex.category}
                            </span>
                            
                            <span style={{ fontSize: '12px', color: 'var(--muted)', marginLeft: 'auto' }}>
                              Rest: <strong style={{ color: '#ffffff' }}>{ex.restSeconds}s</strong>
                            </span>
                          </div>

                          {/* How to do cues */}
                          <div style={{ background: 'rgba(0, 0, 0, 0.2)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.02)' }}>
                            <h5 style={{ fontSize: '13px', color: '#ffffff', fontWeight: 600, marginBottom: '8px' }}>How to Perform:</h5>
                            <ul style={{ paddingLeft: '16px', margin: 0, fontSize: '12px', color: 'var(--muted)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              {ex.cues.map((cue, cIdx) => (
                                <li key={cIdx} style={{ lineHeight: '1.4' }}>{cue}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* WORKOUT RUNNER ACTIVE STATE */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Progress Bar & Session Controls */}
          <div 
            className="glass-card" 
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '12px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '16px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Workout Progress
                </span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '2px' }}>
                  <span style={{ fontSize: '24px', fontWeight: 800, color: '#ffffff' }}>
                    {progressStats.percent}%
                  </span>
                  <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
                    Done ({progressStats.standardDone}/{progressStats.standardTarget} req. sets)
                  </span>
                  {progressStats.bonusDone > 0 && (
                    <span 
                      style={{ 
                        fontSize: '11px', 
                        fontWeight: 700, 
                        background: 'rgba(212,175,55,0.15)', 
                        color: 'var(--primary)', 
                        padding: '2px 8px', 
                        borderRadius: '10px',
                        marginLeft: '8px',
                        border: '1px solid rgba(212,175,55,0.25)',
                        boxShadow: '0 0 10px rgba(212,175,55,0.1)'
                      }}
                    >
                      +{progressStats.bonusDone} Bonus Sets Done! 🔥
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleStopWorkout}
                  className="btn-secondary"
                  style={{ padding: '8px 14px', fontSize: '13px', color: 'var(--primary)', borderColor: 'rgba(212,175,55,0.2)' }}
                  title="Pause and resume later"
                >
                  ⏸️ Save & Stop
                </button>
                <button
                  type="button"
                  onClick={handleFinishWorkout}
                  className="btn-primary"
                  style={{ padding: '8px 16px', fontSize: '13px' }}
                  title="Log workout to history"
                >
                  ✓ Finish Workout
                </button>
              </div>
            </div>

            {/* Premium progress bar track */}
            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
              <div 
                style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, var(--primary) 0%, #c2f842 100%)',
                  width: `${progressStats.percent}%`,
                  transition: 'width 0.4s cubic-bezier(0.1, 0.8, 0.25, 1)',
                  boxShadow: '0 0 10px rgba(212, 175, 55, 0.4)'
                }} 
              />
            </div>
          </div>

          <div className="responsive-split-grid">
            
            {/* Active Exercise Panel */}
            <div className="glass-card" style={{ position: 'relative' }}>
              <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Exercise {currentExerciseIndex + 1} of {dayExercises.length}
              </span>
              <h3 style={{ fontSize: '24px', color: '#ffffff', marginTop: '6px', marginBottom: '16px' }}>
                {dayExercises[currentExerciseIndex].exercise.name}
              </h3>

              {/* Upgraded Anatomical Visual */}
              <div style={{ background: '#070707', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <div style={{ width: '100%', maxWidth: '280px' }}>
                  <WorkoutVisual exercise={dayExercises[currentExerciseIndex].exercise} isActive={true} />
                </div>
              </div>

              {/* Target Weights and Reps */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                  <span style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase' }}>Target Weight</span>
                  <p style={{ fontSize: '18px', fontWeight: 700, color: 'var(--primary)', marginTop: '4px' }}>
                    {getScaledWeightRange(dayExercises[currentExerciseIndex].exercise)}
                  </p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                  <span style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase' }}>Reps & Sets Target</span>
                  <p style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', marginTop: '4px' }}>
                    {currentExerciseSetsCount} sets × {dayExercises[currentExerciseIndex].customReps || dayExercises[currentExerciseIndex].exercise.defaultReps}
                  </p>
                </div>
              </div>

              {/* Form Cues */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '14px', color: '#ffffff', marginBottom: '10px' }}>Form Cues:</h4>
                <ul style={{ paddingLeft: '20px', color: 'var(--muted)', fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {dayExercises[currentExerciseIndex].exercise.cues.map((cue, cIdx) => (
                    <li key={cIdx}>{cue}</li>
                  ))}
                </ul>
              </div>

              {/* Navigation buttons */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between', flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '20px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handlePrevExercise}
                  disabled={currentExerciseIndex === 0}
                  style={{ flex: '1 1 auto', minWidth: '100px' }}
                >
                  ◀ Previous
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleNextExercise}
                  style={{ flex: '1 1 auto', minWidth: '150px' }}
                >
                  {currentExerciseIndex === dayExercises.length - 1 ? 'Finish Workout' : 'Next Exercise ▶'}
                </button>
              </div>
            </div>

            {/* Sets Checklist Tracker Panel & Timer */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Conditional Countdown Timer */}
              {(dayExercises[currentExerciseIndex].timerSeconds !== undefined || dayExercises[currentExerciseIndex].exercise.timerRequired) && (
                <WorkoutTimer 
                  durationSeconds={
                    dayExercises[currentExerciseIndex].timerSeconds !== undefined 
                      ? dayExercises[currentExerciseIndex].timerSeconds! 
                      : dayExercises[currentExerciseIndex].exercise.defaultTimerSeconds || 60
                  } 
                />
              )}

              <div className="glass-card">
                <h3 style={{ fontSize: '18px', color: '#ffffff', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '12px' }}>
                  Sets Checklist
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '16px' }}>
                  Mark sets sequentially. Complete at least 3 sets for 100% progress. Sets 4+ are counted as bonus effort.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {completedSets.map((checked, sIdx) => {
                    const isBonus = sIdx >= 3;
                    return (
                      <div
                        key={sIdx}
                        onClick={() => handleSetCheck(sIdx)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 16px',
                          background: checked 
                            ? (isBonus ? 'rgba(212,175,55,0.08)' : 'rgba(16,185,129,0.06)') 
                            : 'rgba(255,255,255,0.02)',
                          borderRadius: '8px',
                          border: '1px solid',
                          borderColor: checked 
                            ? (isBonus ? 'var(--primary)' : 'var(--success)') 
                            : 'rgba(255,255,255,0.04)',
                          cursor: 'pointer',
                          transition: 'var(--transition)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '14px', fontWeight: 600, color: checked ? '#ffffff' : 'var(--muted)' }}>
                            Set {sIdx + 1}
                          </span>
                          {isBonus && (
                            <span 
                              style={{ 
                                fontSize: '9px', 
                                fontWeight: 700, 
                                background: checked ? 'var(--primary)' : 'rgba(255,255,255,0.05)', 
                                color: checked ? 'var(--background)' : 'var(--muted)', 
                                padding: '1px 6px', 
                                borderRadius: '4px',
                                textTransform: 'uppercase'
                              }}
                            >
                              Bonus Set
                            </span>
                          )}
                        </div>
                        <div style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          border: '2px solid',
                          borderColor: checked 
                            ? (isBonus ? 'var(--primary)' : 'var(--success)') 
                            : 'var(--muted)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: isBonus ? 'var(--primary)' : 'var(--success)',
                          fontSize: '12px',
                          fontWeight: 700
                        }}>
                          {checked && '✓'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Progressive Overload Assistant */}
              <div className="glass-card" style={{ border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <h3 style={{ fontSize: '16px', color: '#ffffff', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                  The 2-Rep Rule
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: '1.5', marginBottom: '14px' }}>
                  Audit load by feel:
                  <br />• <strong>Too light</strong>: Could do 4+ reps easily → add weight.
                  <br />• <strong>Too heavy</strong>: Form breaks before target → drop 10%.
                  <br />• <strong>Overload</strong>: Hit top reps 2 sessions in a row → add 2.5kg.
                </p>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => handleFeedback(dayExercises[currentExerciseIndex].exercise.id, 'too_light')}
                    style={{
                      flex: 1,
                      padding: '8px 4px',
                      fontSize: '11px',
                      borderRadius: '6px',
                      border: '1px solid',
                      borderColor: workoutLog[dayExercises[currentExerciseIndex].exercise.id] === 'too_light' ? 'var(--primary)' : 'rgba(255,255,255,0.06)',
                      background: workoutLog[dayExercises[currentExerciseIndex].exercise.id] === 'too_light' ? 'rgba(212,175,55,0.1)' : 'rgba(255,255,255,0.02)',
                      color: workoutLog[dayExercises[currentExerciseIndex].exercise.id] === 'too_light' ? 'var(--primary)' : 'var(--muted)',
                      cursor: 'pointer'
                    }}
                  >
                    Too Light (+2.5kg)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFeedback(dayExercises[currentExerciseIndex].exercise.id, 'perfect')}
                    style={{
                      flex: 1,
                      padding: '8px 4px',
                      fontSize: '11px',
                      borderRadius: '6px',
                      border: '1px solid',
                      borderColor: workoutLog[dayExercises[currentExerciseIndex].exercise.id] === 'perfect' ? 'var(--success)' : 'rgba(255,255,255,0.06)',
                      background: workoutLog[dayExercises[currentExerciseIndex].exercise.id] === 'perfect' ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.02)',
                      color: workoutLog[dayExercises[currentExerciseIndex].exercise.id] === 'perfect' ? 'var(--success)' : 'var(--muted)',
                      cursor: 'pointer'
                    }}
                  >
                    Just Right
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFeedback(dayExercises[currentExerciseIndex].exercise.id, 'too_heavy')}
                    style={{
                      flex: 1,
                      padding: '8px 4px',
                      fontSize: '11px',
                      borderRadius: '6px',
                      border: '1px solid',
                      borderColor: workoutLog[dayExercises[currentExerciseIndex].exercise.id] === 'too_heavy' ? 'var(--error)' : 'rgba(255,255,255,0.06)',
                      background: workoutLog[dayExercises[currentExerciseIndex].exercise.id] === 'too_heavy' ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.02)',
                      color: workoutLog[dayExercises[currentExerciseIndex].exercise.id] === 'too_heavy' ? 'var(--error)' : 'var(--muted)',
                      cursor: 'pointer'
                    }}
                  >
                    Too Heavy (-10%)
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}
    </div>
  );
}
