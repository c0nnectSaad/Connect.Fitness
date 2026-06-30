'use client';

import React, { useMemo } from 'react';
import { UserStats } from './Onboarding';
import { WorkoutPreset, allExercises, Exercise, WorkoutPresetItem } from '../data/exercises';
import { getTrackingDateString, getTrackingDayOfWeek, getTrackingDate } from '../utils/fitnessCalc';

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

interface DashboardTabProps {
  userStats: UserStats;
  dailyLogs: { [dateStr: string]: DayLog };
  activePreset: WorkoutPreset;
  onStartWorkout: () => void;
  onNavigateToDiet: () => void;
}

export default function DashboardTab({
  userStats,
  dailyLogs,
  activePreset,
  onStartWorkout,
  onNavigateToDiet,
}: DashboardTabProps) {
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

  const todayStr = useMemo(() => getTrackingDateString(), []);
  const todayDayName = useMemo(() => getTrackingDayOfWeek(), []);
  const todayFormattedDate = useMemo(() => {
    const d = getTrackingDate();
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
  }, []);

  const todayLog = useMemo(() => {
    const defaultLog: DayLog = {
      eaten: [],
      workoutCompleted: false,
      workoutDifficulty: 'intermediate',
      workoutDayName: todayDayName,
      weightAtDate: userStats.weightKg,
      calorieTarget: userStats.targetGoal ? userStats.targetGoal.calorieTarget : userStats.caloriesBulk,
    };
    return dailyLogs[todayStr] || defaultLog;
  }, [dailyLogs, todayStr, todayDayName, userStats]);

  // Derived Goal Targets
  const calorieTarget = useMemo(() => {
    if (userStats.targetGoal) {
      return userStats.targetGoal.calorieTarget;
    }
    return userStats.caloriesBulk; // Default to bulk if no target goal
  }, [userStats.targetGoal, userStats.caloriesBulk]);

  const proteinTarget = useMemo(() => {
    if (userStats.targetGoal) {
      return userStats.targetGoal.proteinTarget;
    }
    return userStats.proteinGrams;
  }, [userStats.targetGoal, userStats.proteinGrams]);

  const fatTarget = useMemo(() => {
    if (userStats.targetGoal) {
      return userStats.targetGoal.fatTarget;
    }
    return Math.round(userStats.fatsGrams);
  }, [userStats.targetGoal, userStats.fatsGrams]);

  const carbTarget = useMemo(() => {
    if (userStats.targetGoal) {
      return userStats.targetGoal.carbTarget;
    }
    const remainingCalories = calorieTarget - (userStats.proteinGrams * 4) - (userStats.fatsGrams * 9);
    return Math.max(50, Math.round(remainingCalories / 4));
  }, [userStats.targetGoal, calorieTarget, userStats.proteinGrams, userStats.fatsGrams]);

  // Totals Eaten
  const dailyTotals = useMemo(() => {
    return todayLog.eaten.reduce(
      (acc, item) => {
         acc.calories += item.calories;
         acc.protein += item.protein;
         acc.carbs += item.carbs;
         acc.fat += item.fat;
         return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [todayLog.eaten]);

  const caloriesRemaining = calorieTarget - dailyTotals.calories;
  const isOverCalorieLimit = caloriesRemaining < 0;

  // Normalized exercises for today
  const todayExercises = useMemo(() => {
    const rawItems = activePreset.schedule[todayDayName] || [];
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
  }, [activePreset, todayDayName]);

  const targetMuscles = dayMuscleTargets[todayDayName] || 'REST';
  const isRestDay = todayDayName === 'Sunday' || targetMuscles === 'REST';

  // Scaled weight helper
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

  return (
    <div className="fade-in" style={{ paddingBottom: '60px', width: '100%' }}>
      {/* HEADER GREETING */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#ffffff', marginBottom: '6px' }}>
            Assalam-o-Alaikum, Champ! 👋
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '15px' }}>
            Today is <strong style={{ color: '#ffffff' }}>{todayFormattedDate}</strong> • Plan: <strong style={{ color: 'var(--primary)' }}>{activePreset.name}</strong>
          </p>
        </div>
        
        {/* Quick Stats Pill */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255,255,255,0.06)', padding: '10px 18px', borderRadius: '12px', textAlign: 'center' }}>
            <span style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', display: 'block' }}>Weight</span>
            <strong style={{ fontSize: '16px', color: 'var(--primary)' }}>{userStats.weightKg} kg</strong>
          </div>
          {userStats.targetGoal && (
            <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '10px 18px', borderRadius: '12px', textAlign: 'center' }}>
              <span style={{ fontSize: '10px', color: 'var(--success)', textTransform: 'uppercase', display: 'block' }}>Target</span>
              <strong style={{ fontSize: '16px', color: '#ffffff' }}>{userStats.targetGoal.targetWeightKg} kg</strong>
            </div>
          )}
        </div>
      </div>

      {/* DASHBOARD WIDGETS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', marginBottom: '32px' }}>
        
        {/* NUTRITION & CALORIES LEFT WIDGET */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderLeft: '4px solid var(--primary)', minWidth: 0 }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '20px', color: '#ffffff' }}>Daily Nutrition</h3>
              <button 
                onClick={onNavigateToDiet}
                className="btn-secondary" 
                style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '6px' }}
              >
                Diet Plan ➡️
              </button>
            </div>

            {/* Circular / Large Gauge styled panel */}
            <div style={{ 
              background: isOverCalorieLimit ? 'rgba(239, 68, 68, 0.05)' : 'rgba(212, 175, 55, 0.03)', 
              border: '1px solid',
              borderColor: isOverCalorieLimit ? 'var(--error)' : 'rgba(212, 175, 55, 0.15)',
              borderRadius: '16px',
              padding: '20px',
              textAlign: 'center',
              marginBottom: '20px'
            }}>
              <span style={{ fontSize: '11px', color: isOverCalorieLimit ? 'var(--error)' : 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {isOverCalorieLimit ? 'Calories Limit Exceeded' : 'Calories Remaining Today'}
              </span>
              <h4 style={{ fontSize: '42px', fontWeight: 800, color: isOverCalorieLimit ? 'var(--error)' : '#ffffff', margin: '8px 0' }}>
                {isOverCalorieLimit ? `+${Math.abs(caloriesRemaining)}` : `${caloriesRemaining}`}
              </h4>
              <p style={{ fontSize: '12px', color: 'var(--muted)' }}>
                {dailyTotals.calories} kcal consumed / {calorieTarget} kcal budget
              </p>
            </div>

            {/* Progress bar */}
            <div style={{ width: '100%', height: '8px', background: '#222', borderRadius: '4px', overflow: 'hidden', marginBottom: '24px' }}>
              <div style={{
                height: '100%',
                background: isOverCalorieLimit ? 'var(--error)' : 'var(--primary)',
                width: `${Math.min(100, (dailyTotals.calories / calorieTarget) * 100)}%`,
                transition: 'width 0.4s ease'
              }} />
            </div>

            {/* Macros Remaining Breakdown */}
            <h4 style={{ fontSize: '13px', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.05em' }}>
              Nutrients Left
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              {/* Protein Left */}
              <div style={{ background: 'rgba(255,255,255,0.01)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.03)', textAlign: 'center' }}>
                <span style={{ fontSize: '10px', color: '#10b981', fontWeight: 600 }}>PROTEIN LEFT</span>
                <p style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>
                  {Math.round(Math.max(0, proteinTarget - dailyTotals.protein))}g
                </p>
                <span style={{ fontSize: '9px', color: 'var(--muted)' }}>of {proteinTarget}g</span>
              </div>
              
              {/* Carbs Left */}
              <div style={{ background: 'rgba(255,255,255,0.01)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.03)', textAlign: 'center' }}>
                <span style={{ fontSize: '10px', color: '#f59e0b', fontWeight: 600 }}>CARBS LEFT</span>
                <p style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>
                  {Math.round(Math.max(0, carbTarget - dailyTotals.carbs))}g
                </p>
                <span style={{ fontSize: '9px', color: 'var(--muted)' }}>of {carbTarget}g</span>
              </div>

              {/* Fats Left */}
              <div style={{ background: 'rgba(255,255,255,0.01)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.03)', textAlign: 'center' }}>
                <span style={{ fontSize: '10px', color: '#60a5fa', fontWeight: 600 }}>FATS LEFT</span>
                <p style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>
                  {Math.round(Math.max(0, fatTarget - dailyTotals.fat))}g
                </p>
                <span style={{ fontSize: '9px', color: 'var(--muted)' }}>of {fatTarget}g</span>
              </div>
            </div>
          </div>
        </div>

        {/* WORKOUT OF TODAY WIDGET */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderLeft: '4px solid var(--success)', minWidth: 0 }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '20px', color: '#ffffff' }}>Today's Workout</h3>
                <span style={{ fontSize: '12px', color: 'var(--muted)', display: 'block', textTransform: 'capitalize' }}>
                  {todayDayName}'s Schedule
                </span>
              </div>
              
              <span style={{ 
                background: isRestDay ? 'rgba(255,255,255,0.05)' : todayLog.workoutCompleted ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', 
                color: isRestDay ? 'var(--muted)' : todayLog.workoutCompleted ? 'var(--success)' : 'var(--accent)', 
                fontSize: '11px', 
                fontWeight: 600, 
                padding: '4px 10px', 
                borderRadius: '12px',
                textTransform: 'uppercase'
              }}>
                {isRestDay ? 'Rest' : todayLog.workoutCompleted ? 'Completed' : 'Pending'}
              </span>
            </div>

            {/* Target Muscles display */}
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)', marginBottom: '20px' }}>
              <span style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', display: 'block' }}>Target Muscles</span>
              <strong style={{ fontSize: '20px', color: '#ffffff', display: 'block', marginTop: '4px' }}>
                {targetMuscles}
              </strong>
              {!isRestDay && (
                <span style={{ fontSize: '12px', color: 'var(--muted)', display: 'block', marginTop: '6px' }}>
                  📋 {todayExercises.length} exercises scheduled for today
                </span>
              )}
            </div>

            {/* Exercises List (Short summary) */}
            {!isRestDay ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px', marginBottom: '20px' }}>
                {todayExercises.map((exItem, i) => {
                  const ex = exItem.exercise;
                  const sets = exItem.customSets !== undefined ? exItem.customSets : ex.defaultSets;
                  const reps = exItem.customReps !== undefined ? exItem.customReps : ex.defaultReps;
                  return (
                    <div key={ex.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(255,255,255,0.01)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.02)' }}>
                      <div style={{ minWidth: 0, flex: 1, marginRight: '12px' }}>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {i + 1}. {ex.name}
                        </p>
                        <span style={{ fontSize: '10.5px', color: 'var(--muted)' }}>
                          {sets} sets × {reps} {exItem.timerSeconds ? 's' : ''}
                        </span>
                      </div>
                      <div style={{ flexShrink: 0, textAlign: 'right' }}>
                        <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 555 }}>
                          {getScaledWeightRange(ex)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--muted)', fontSize: '13.5px' }}>
                🧘 Take time to rest and recover. Stretch, hydrate, and maintain your caloric budget. Muscles grow when you rest!
              </div>
            )}
          </div>

          {/* Start workout button */}
          {!isRestDay && !todayLog.workoutCompleted && (
            <button 
              onClick={onStartWorkout}
              className="btn-primary" 
              style={{ width: '100%', padding: '14px', marginTop: '10px' }}
            >
              🔥 Start Workout Session
            </button>
          )}

          {todayLog.workoutCompleted && (
            <div style={{ 
              background: 'rgba(16, 185, 129, 0.05)', 
              border: '1px solid rgba(16, 185, 129, 0.2)', 
              color: 'var(--success)', 
              padding: '12px', 
              borderRadius: '8px', 
              textAlign: 'center',
              fontWeight: 600,
              fontSize: '14px',
              marginTop: '10px'
            }}>
              ✅ Today's workout completed! Great job.
            </div>
          )}

          {isRestDay && (
            <button 
              onClick={onStartWorkout}
              className="btn-secondary" 
              style={{ width: '100%', padding: '12px', marginTop: '10px' }}
            >
              📅 View Full Week Schedule
            </button>
          )}
        </div>

      </div>

      {/* TODAY'S FOOD LOG SHORT VIEW */}
      <div className="glass-card" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '16px', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '20px', color: '#ffffff' }}>Today's Food Log</h3>
          <button 
            onClick={onNavigateToDiet}
            className="btn-primary" 
            style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '6px' }}
          >
            + Add Food
          </button>
        </div>

        {todayLog.eaten.length === 0 ? (
          <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--muted)', fontSize: '14px' }}>
            No foods logged for today yet. Fuel your body with nutritious food!
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
            {todayLog.eaten.map((item) => (
              <div 
                key={item.id} 
                style={{ 
                  padding: '12px', 
                  background: 'rgba(255,255,255,0.01)', 
                  borderRadius: '10px', 
                  border: '1px solid rgba(255,255,255,0.03)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div style={{ minWidth: 0, flex: 1, marginRight: '12px' }}>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.name}
                  </p>
                  <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                    {item.quantity ? `${item.quantity} ${item.quantity > 1 ? 'portions' : 'portion'}` : `${item.grams}g`} • {item.calories} kcal
                  </span>
                </div>
                
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 600, display: 'block' }}>
                    P: {item.protein}g
                  </span>
                  <span style={{ fontSize: '9px', color: 'var(--muted)', display: 'block' }}>
                    C: {item.carbs}g • F: {item.fat}g
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
