'use client';

import React, { useState, useMemo } from 'react';
import { foodsData, FoodItem } from '../data/foods';
import { UserStats } from './Onboarding';
import CustomDropdown from './CustomDropdown';
import { calculateBMR, calculateTDEE, recalculateUserStats, getTrackingDateString } from '../utils/fitnessCalc';

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

interface DayLog {
  eaten: EatenFood[];
  workoutCompleted: boolean;
  workoutDifficulty: 'easy' | 'intermediate' | 'hard';
  workoutDayName: string;
  weightAtDate: number;
  calorieTarget: number;
}

interface DietTabProps {
  userStats: UserStats;
  dailyLogs: { [dateStr: string]: DayLog };
  onLogsUpdate: (updatedLogs: { [dateStr: string]: DayLog }) => void;
  onStatsUpdate: (stats: UserStats) => void;
}

export default function DietTab({ userStats, dailyLogs, onLogsUpdate, onStatsUpdate }: DietTabProps) {
  const [goalType, setGoalType] = useState<'bulk' | 'cut'>('bulk');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [macroFilter, setMacroFilter] = useState<'all' | 'high_protein' | 'high_carbs' | 'low_fat'>('all');

  // Portion calculator state
  const [selectedFoodId, setSelectedFoodId] = useState<string | null>(null);
  const [customGrams, setCustomGrams] = useState<number>(100);
  const [customQuantity, setCustomQuantity] = useState<number>(1);
  const [cookingMethod, setCookingMethod] = useState<'normal' | 'grilled' | 'fried'>('normal');

  // Goal Planner States
  const [plannerGoal, setPlannerGoal] = useState<'lose' | 'maintain' | 'gain'>(userStats.targetGoal?.type || 'lose');
  const [targetWeight, setTargetWeight] = useState<string>(userStats.targetGoal?.targetWeightKg.toString() || userStats.weightKg.toString());
  const [weeksTimeframe, setWeeksTimeframe] = useState<string>(userStats.targetGoal?.weeks.toString() || '8');
  const [showPlannerForm, setShowPlannerForm] = useState<boolean>(!userStats.targetGoal);
  const [plannerError, setPlannerError] = useState<string>('');

  // Get Today's Date String (adjusted for 3 AM rollover)
  const todayStr = useMemo(() => {
    return getTrackingDateString();
  }, []);

  // Base details needed for BMR & TDEE
  const userAge = userStats.age || 25;
  const userGender = userStats.gender || 'male';
  const userActivity = userStats.activityLevel || 'moderate';

  const bmr = useMemo(() => {
    return calculateBMR(userStats.weightKg, userStats.heightCm, userAge, userGender);
  }, [userStats.weightKg, userStats.heightCm, userAge, userGender]);

  const tdee = useMemo(() => {
    return calculateTDEE(bmr, userActivity);
  }, [bmr, userActivity]);

  // Derived goal preview calculations (live in planner UI)
  const goalPreview = useMemo(() => {
    const tw = parseFloat(targetWeight) || userStats.weightKg;
    const wks = parseFloat(weeksTimeframe) || 8;
    const weightDiff = userStats.weightKg - tw;
    
    const totalDays = Math.max(1, wks * 7);
    const dailyCalDiff = (weightDiff * 7700) / totalDays;
    let calTarget = Math.round(tdee - dailyCalDiff);
    
    // Safety caps
    const minSafeCalories = userGender === 'female' ? 1200 : userGender === 'male' ? 1500 : 1200;
    let isCapped = false;
    if (calTarget < minSafeCalories) {
      calTarget = minSafeCalories;
      isCapped = true;
    }

    const weeklyRate = Math.abs(weightDiff) / wks;
    const isRateWarning = plannerGoal === 'lose' && weeklyRate > 1.0;

    const protTarget = Math.round(2 * userStats.weightKg);
    const ftTarget = Math.round(0.8 * userStats.weightKg);
    const remainingCals = calTarget - (protTarget * 4) - (ftTarget * 9);
    const crbTarget = Math.max(50, Math.round(remainingCals / 4));

    return {
      calorieTarget: calTarget,
      proteinTarget: protTarget,
      fatTarget: ftTarget,
      carbTarget: crbTarget,
      deficit: Math.round(tdee - calTarget),
      weeklyRate,
      isCapped,
      isRateWarning,
      weightDiff
    };
  }, [targetWeight, weeksTimeframe, tdee, userStats.weightKg, userGender, plannerGoal]);

  // Apply Plan Handler
  const handleApplyPlan = (e: React.FormEvent) => {
    e.preventDefault();
    setPlannerError('');

    const tw = parseFloat(targetWeight);
    const wks = parseFloat(weeksTimeframe);

    if (isNaN(tw) || tw <= 20 || tw >= 300) {
      setPlannerError('Please enter a valid target weight.');
      return;
    }
    if (plannerGoal !== 'maintain' && (isNaN(wks) || wks <= 1 || wks >= 52)) {
      setPlannerError('Please enter a valid timeframe (2 to 52 weeks).');
      return;
    }

    const updatedStats = recalculateUserStats(
      userStats.weightKg,
      userStats.heightCm,
      userStats.age || 25,
      userStats.gender || 'male',
      userStats.activityLevel || 'moderate',
      userStats.trainingAge,
      {
        type: plannerGoal,
        targetWeightKg: plannerGoal === 'maintain' ? userStats.weightKg : tw,
        weeks: plannerGoal === 'maintain' ? 1 : wks
      }
    );

    onStatsUpdate(updatedStats);
    setShowPlannerForm(false);
  };

  // Clear Plan Handler
  const handleClearPlan = () => {
    const updatedStats = recalculateUserStats(
      userStats.weightKg,
      userStats.heightCm,
      userStats.age || 25,
      userStats.gender || 'male',
      userStats.activityLevel || 'moderate',
      userStats.trainingAge,
      null
    );
    onStatsUpdate(updatedStats);
    setPlannerGoal('lose');
    setTargetWeight(userStats.weightKg.toString());
    setWeeksTimeframe('8');
    setShowPlannerForm(true);
  };

  // Dynamically calculate calorie and macro targets based on active goal or Bulk/Cut toggle
  const calorieTarget = useMemo(() => {
    if (userStats.targetGoal) {
      return userStats.targetGoal.calorieTarget;
    }
    return goalType === 'bulk' ? userStats.caloriesBulk : userStats.caloriesCut;
  }, [userStats.targetGoal, userStats.caloriesBulk, userStats.caloriesCut, goalType]);

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

  // Retrieve today's log from shared dailyLogs state
  const todayLog = useMemo(() => {
    const defaultLog: DayLog = {
      eaten: [],
      workoutCompleted: false,
      workoutDifficulty: 'intermediate',
      workoutDayName: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
      weightAtDate: userStats.weightKg,
      calorieTarget: calorieTarget
    };
    return dailyLogs[todayStr] || defaultLog;
  }, [dailyLogs, todayStr, userStats, calorieTarget]);

  // Update today's log helper
  const updateTodayLog = (updatedFields: Partial<DayLog>) => {
    const updated = {
      ...todayLog,
      ...updatedFields,
      calorieTarget
    };
    onLogsUpdate({
      ...dailyLogs,
      [todayStr]: updated
    });
  };

  // Filter food list
  const filteredFoods = useMemo(() => {
    return foodsData.filter((food) => {
      // 1. Text Search
      const matchesSearch = food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            food.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      // 2. Category Filter
      const matchesCategory = selectedCategory === 'All' || food.category === selectedCategory;

      // 3. Macro filters (per 100g equivalent)
      const multiplier = 100 / food.servingSizeGrams;
      const normalizedProtein = food.protein * multiplier;
      const normalizedCarbs = food.carbs * multiplier;
      const normalizedFat = food.fat * multiplier;

      let matchesMacro = true;
      if (macroFilter === 'high_protein') {
        matchesMacro = normalizedProtein >= 15;
      } else if (macroFilter === 'high_carbs') {
        matchesMacro = normalizedCarbs >= 20;
      } else if (macroFilter === 'low_fat') {
        matchesMacro = normalizedFat <= 3;
      }

      return matchesSearch && matchesCategory && matchesMacro;
    });
  }, [searchTerm, selectedCategory, macroFilter]);

  // Handle expanding food item and resetting calculator grams/quantities
  const handleFoodSelect = (food: FoodItem) => {
    if (selectedFoodId === food.id) {
      setSelectedFoodId(null);
    } else {
      setSelectedFoodId(food.id);
      setCustomGrams(food.servingSizeGrams);
      setCustomQuantity(1);
      setCookingMethod('normal');
    }
  };

  // Calculations for expanded food portion calculator
  const calculatedMacros = useMemo(() => {
    const food = foodsData.find(f => f.id === selectedFoodId);
    if (!food) return { calories: 0, protein: 0, carbs: 0, fat: 0 };

    let ratio = 1;
    if (food.isQuantity) {
      ratio = customQuantity;
    } else {
      ratio = customGrams / food.servingSizeGrams;
    }

    let baseCalories = food.calories * ratio;
    let baseProtein = food.protein * ratio;
    let baseCarbs = food.carbs * ratio;
    let baseFat = food.fat * ratio;

    // Apply cooking method adjustments
    if (cookingMethod === 'grilled') {
      baseCalories += 30 * ratio;
      baseFat += 3 * ratio;
    } else if (cookingMethod === 'fried') {
      baseCalories += 120 * ratio;
      baseFat += 12 * ratio;
    }

    return {
      calories: Math.round(baseCalories),
      protein: parseFloat(baseProtein.toFixed(1)),
      carbs: parseFloat(baseCarbs.toFixed(1)),
      fat: parseFloat(baseFat.toFixed(1))
    };
  }, [selectedFoodId, customGrams, customQuantity, cookingMethod]);

  // Add to daily log
  const handleAddToLog = (food: FoodItem) => {
    const displayName = cookingMethod !== 'normal'
      ? `${food.name} (${cookingMethod === 'grilled' ? 'Grilled' : 'Fried'})`
      : food.name;

    const eaten: EatenFood = {
      id: Math.random().toString(36).substring(2, 9),
      name: displayName,
      grams: food.isQuantity ? (customQuantity * food.servingSizeGrams) : customGrams,
      calories: calculatedMacros.calories,
      protein: calculatedMacros.protein,
      carbs: calculatedMacros.carbs,
      fat: calculatedMacros.fat,
      quantity: food.isQuantity ? customQuantity : undefined,
      cookingMethod: cookingMethod !== 'normal' ? cookingMethod : undefined
    };
    
    const updatedEaten = [...todayLog.eaten, eaten];
    updateTodayLog({ eaten: updatedEaten });
  };

  // Remove from daily log
  const handleRemoveFromLog = (id: string) => {
    const updatedEaten = todayLog.eaten.filter(item => item.id !== id);
    updateTodayLog({ eaten: updatedEaten });
  };

  // Sum daily totals
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

  // Calories remaining calculations
  const caloriesRemaining = calorieTarget - dailyTotals.calories;
  const isOverCalorieLimit = caloriesRemaining < 0;

  return (
    <div className="fade-in" style={{ paddingBottom: '60px', minWidth: 0, width: '100%' }}>
      {/* Title */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '28px', color: '#ffffff', marginBottom: '8px' }}>Dieting & Nutrition</h2>
        <p style={{ color: 'var(--muted)' }}>
          Calculate custom portions, search through fitness food presets, and track your daily macro intake.
        </p>
      </div>

      {/* Goal Planner Form */}
      {showPlannerForm && (
        <div className="glass-card" style={{ marginBottom: '32px', borderLeft: '4px solid var(--accent)', background: 'rgba(245,158,11,0.01)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '20px', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🎯</span> Configure Diet & Weight Goal
            </h3>
            {userStats.targetGoal && (
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: '6px 12px', fontSize: '12px' }}
                onClick={() => setShowPlannerForm(false)}
              >
                Cancel
              </button>
            )}
          </div>

          {plannerError && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid var(--error)',
              color: 'var(--error)',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '14px'
            }}>
              {plannerError}
            </div>
          )}

          <form onSubmit={handleApplyPlan}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', alignItems: 'end', marginBottom: '24px' }}>
              <div className="input-group" style={{ margin: 0 }}>
                <label className="input-label">Your Goal</label>
                <CustomDropdown
                  options={[
                    { value: 'lose', label: 'Lose Weight (Deficit)' },
                    { value: 'maintain', label: 'Maintain Weight (TDEE)' },
                    { value: 'gain', label: 'Gain Weight (Surplus)' }
                  ]}
                  value={plannerGoal}
                  onChange={(val) => {
                    setPlannerGoal(val);
                    if (val === 'maintain') {
                      setTargetWeight(userStats.weightKg.toString());
                    }
                  }}
                />
              </div>

              <div className="input-group" style={{ margin: 0 }}>
                <label className="input-label">Target Weight (kg)</label>
                <input
                  type="number"
                  className="input-field"
                  value={targetWeight}
                  onChange={(e) => setTargetWeight(e.target.value)}
                  placeholder="e.g. 70"
                  required
                  disabled={plannerGoal === 'maintain'}
                  min="20"
                  max="300"
                  step="0.1"
                />
              </div>

              <div className="input-group" style={{ margin: 0 }}>
                <label className="input-label">Timeframe (weeks)</label>
                <input
                  type="number"
                  className="input-field"
                  value={weeksTimeframe}
                  onChange={(e) => setWeeksTimeframe(e.target.value)}
                  placeholder="e.g. 8"
                  required={plannerGoal !== 'maintain'}
                  disabled={plannerGoal === 'maintain'}
                  min="1"
                  max="52"
                  step="1"
                />
              </div>
            </div>

            {/* Live Calculation Preview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '20px' }}>
              <div>
                <h4 style={{ fontSize: '13px', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.05em' }}>
                  Live Diet Estimation
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--muted)' }}>Maintenance (TDEE):</span>
                    <strong>{tdee} kcal/day</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--muted)' }}>Calculated Target:</span>
                    <strong style={{ color: 'var(--accent)' }}>{goalPreview.calorieTarget} kcal/day</strong>
                  </div>
                  {plannerGoal !== 'maintain' && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--muted)' }}>Daily {goalPreview.weightDiff > 0 ? 'Deficit' : 'Surplus'}:</span>
                      <strong style={{ color: goalPreview.weightDiff > 0 ? 'var(--error)' : 'var(--success)' }}>
                        {goalPreview.weightDiff > 0 ? '-' : '+'}{Math.abs(goalPreview.deficit)} kcal
                      </strong>
                    </div>
                  )}
                  {plannerGoal !== 'maintain' && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--muted)' }}>Weekly Rate:</span>
                      <strong style={{ color: goalPreview.isRateWarning ? 'var(--accent)' : '#ffffff' }}>
                        {goalPreview.weeklyRate.toFixed(2)} kg/week
                      </strong>
                    </div>
                  )}
                </div>

                {/* Warnings */}
                {goalPreview.isRateWarning && (
                  <div style={{ marginTop: '14px', color: 'var(--accent)', fontSize: '12.5px', background: 'rgba(245,158,11,0.05)', padding: '10px', borderRadius: '6px', border: '1px solid rgba(245,158,11,0.15)' }}>
                    ⚠️ <strong>Aggressive loss rate!</strong> Losing over 1 kg/week may lead to muscle loss. Consider choosing a longer timeframe.
                  </div>
                )}
                {goalPreview.isCapped && (
                  <div style={{ marginTop: '14px', color: 'var(--error)', fontSize: '12.5px', background: 'rgba(239,68,68,0.05)', padding: '10px', borderRadius: '6px', border: '1px solid rgba(239,68,68,0.15)' }}>
                    ⚠️ <strong>Safety limit active!</strong> Deficit is capped to keep daily calories safe ({userGender === 'female' ? '1200' : '1500'} kcal min).
                  </div>
                )}
              </div>

              <div>
                <h4 style={{ fontSize: '13px', color: '#ffffff', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.05em' }}>
                  Target Macro Splits
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ fontSize: '10px', color: 'var(--muted)' }}>PROTEIN</span>
                    <p style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>{goalPreview.proteinTarget}g</p>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ fontSize: '10px', color: 'var(--muted)' }}>CARBS</span>
                    <p style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>{goalPreview.carbTarget}g</p>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ fontSize: '10px', color: 'var(--muted)' }}>FAT</span>
                    <p style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>{goalPreview.fatTarget}g</p>
                  </div>
                </div>

                <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px' }}>
                  🎯 Apply Diet & Deficit Plan
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Active Goal Summary Display */}
      {!showPlannerForm && userStats.targetGoal && (
        <div className="glass-card" style={{ marginBottom: '32px', borderLeft: '4px solid var(--success)', background: 'rgba(16,185,129,0.01)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <span style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--success)', fontSize: '11px', fontWeight: 600, padding: '4px 8px', borderRadius: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Active Plan: {userStats.targetGoal.type === 'lose' ? 'Calorie Deficit' : userStats.targetGoal.type === 'gain' ? 'Lean Bulking' : 'Weight Maintenance'}
              </span>
              <h3 style={{ fontSize: '22px', color: '#ffffff', marginTop: '8px' }}>
                {userStats.targetGoal.type === 'maintain' ? 'Maintain Weight' : `Target: ${userStats.targetGoal.targetWeightKg} kg in ${userStats.targetGoal.weeks} weeks`}
              </h3>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn-secondary" style={{ padding: '8px 14px', fontSize: '13px' }} onClick={() => setShowPlannerForm(true)}>
                ✏️ Edit Goal
              </button>
              <button
                className="btn-secondary"
                style={{ padding: '8px 14px', fontSize: '13px', borderColor: 'rgba(239,68,68,0.3)', color: 'var(--error)' }}
                onClick={handleClearPlan}
              >
                Clear Goal
              </button>
            </div>
          </div>

          {/* Progress bar */}
          {userStats.targetGoal.type !== 'maintain' && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--muted)', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                <span>Starting/Current: <strong>{userStats.weightKg} kg</strong></span>
                <span>Remaining: <strong>{Math.abs(userStats.weightKg - userStats.targetGoal.targetWeightKg).toFixed(1)} kg</strong></span>
                <span>Target: <strong>{userStats.targetGoal.targetWeightKg} kg</strong></span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                {(() => {
                  const current = userStats.weightKg;
                  const target = userStats.targetGoal.targetWeightKg;
                  const delta = Math.abs(current - target);
                  const pct = Math.max(5, Math.min(95, 100 - (delta / current) * 100));
                  return (
                    <div style={{
                      height: '100%',
                      background: 'var(--success)',
                      width: `${pct}%`,
                      transition: 'width 0.3s ease'
                    }} />
                  );
                })()}
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', fontSize: '13.5px', color: 'var(--muted)' }}>
            <div>
              Daily Calorie Budget: <strong style={{ color: '#ffffff' }}>{userStats.targetGoal.calorieTarget} kcal/day</strong>
            </div>
            {userStats.targetGoal.type !== 'maintain' && (
              <div>
                Calorie {userStats.targetGoal.type === 'lose' ? 'Deficit' : 'Surplus'}:{' '}
                <strong style={{ color: userStats.targetGoal.type === 'lose' ? 'var(--error)' : 'var(--success)' }}>
                  {userStats.targetGoal.type === 'lose' ? '-' : '+'}{Math.abs(tdee - userStats.targetGoal.calorieTarget)} kcal
                </strong>
              </div>
            )}
            {userStats.targetGoal.type !== 'maintain' && (
              <div>
                Weekly Target Weight Loss/Gain Rate:{' '}
                <strong style={{ color: '#ffffff' }}>
                  {(Math.abs(userStats.weightKg - userStats.targetGoal.targetWeightKg) / userStats.targetGoal.weeks).toFixed(2)} kg/week
                </strong>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Target Macros Stats Panel */}
      <div className="glass-card" style={{ marginBottom: '32px', borderLeft: '4px solid var(--primary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '20px', color: '#ffffff' }}>Your Personalized Targets</h3>
            <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Based on weight: {userStats.weightKg} kg</span>
          </div>

          {/* Goal Selector or Custom Indicator */}
          {userStats.targetGoal ? (
            <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', padding: '6px 14px', borderRadius: '8px', color: 'var(--success)', fontSize: '13px', fontWeight: 600 }}>
              🟢 Custom Goal Active
            </div>
          ) : (
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '4px' }}>
              <button
                onClick={() => setGoalType('bulk')}
                className={`btn-secondary`}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  background: goalType === 'bulk' ? 'var(--primary)' : 'transparent',
                  color: goalType === 'bulk' ? 'var(--background)' : '#ffffff',
                  fontSize: '13px',
                  fontWeight: 600
                }}
              >
                Lean Bulk
              </button>
              <button
                onClick={() => setGoalType('cut')}
                className={`btn-secondary`}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  background: goalType === 'cut' ? 'var(--primary)' : 'transparent',
                  color: goalType === 'cut' ? 'var(--background)' : '#ffffff',
                  fontSize: '13px',
                  fontWeight: 600
                }}
              >
                Cut (Deficit)
              </button>
            </div>
          )}
        </div>

        {/* Macro Badges */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(105px, 1fr))', gap: '16px' }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.04)' }}>
            <span style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase' }}>Calories Target</span>
            <p style={{ fontSize: '24px', fontWeight: 700, color: 'var(--primary)', margin: '4px 0' }}>{calorieTarget}</p>
            <span style={{ fontSize: '11px', color: 'var(--muted)' }}>kcal / day</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.04)' }}>
            <span style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase' }}>Protein</span>
            <p style={{ fontSize: '24px', fontWeight: 700, color: '#ffffff', margin: '4px 0' }}>{proteinTarget}g</p>
            <span style={{ fontSize: '11px', color: 'var(--muted)' }}>2g per kg</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.04)' }}>
            <span style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase' }}>Carbs</span>
            <p style={{ fontSize: '24px', fontWeight: 700, color: '#ffffff', margin: '4px 0' }}>{carbTarget}g</p>
            <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Target energy</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.04)' }}>
            <span style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase' }}>Fats</span>
            <p style={{ fontSize: '24px', fontWeight: 700, color: '#ffffff', margin: '4px 0' }}>{fatTarget}g</p>
            <span style={{ fontSize: '11px', color: 'var(--muted)' }}>0.8g per kg</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.04)' }}>
            <span style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase' }}>Water</span>
            <p style={{ fontSize: '24px', fontWeight: 700, color: '#60a5fa', margin: '4px 0' }}>{(userStats.waterMl / 1000).toFixed(1)}L</p>
            <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Base hydration</span>
          </div>
        </div>
      </div>

      {/* TODAY'S INTAKE LOG & BALANCES (ABOVE) */}
      <div className="responsive-two-column-grid" style={{ marginBottom: '32px' }}>
        
        {/* Left Column: Daily Food Log list */}
        <div className="glass-card" style={{ border: '1px solid rgba(255,255,255,0.06)', minWidth: 0, width: '100%' }}>
          <h3 style={{ fontSize: '18px', color: '#ffffff', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '12px' }}>
            Daily Food Log
          </h3>

          {todayLog.eaten.length === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--muted)', fontSize: '14px' }}>
              Your log is empty. Search the database below, calculate your portion, and add it to start tracking!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '350px', overflowY: 'auto' }}>
              {todayLog.eaten.map((item) => (
                <div key={item.id} style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1, marginRight: '10px', minWidth: 0 }}>
                    <p style={{ fontSize: '13.5px', fontWeight: 600, color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.name}
                    </p>
                    <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                      {item.quantity ? `${item.quantity} ${item.quantity === 1 ? (foodsData.find(f => f.name === item.name || item.name.startsWith(f.name))?.servingUnit || 'portion') : (foodsData.find(f => f.name === item.name || item.name.startsWith(f.name))?.servingUnit ? `${foodsData.find(f => f.name === item.name || item.name.startsWith(f.name))?.servingUnit}s` : 'portions')}` : `${item.grams}g`} • {item.calories} kcal • P: {item.protein}g
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveFromLog(item.id)}
                    style={{ border: 'none', background: 'transparent', color: 'var(--error)', cursor: 'pointer', fontSize: '18px', padding: '4px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                    title="Remove"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Remaining Calories & Macro Balance */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', minWidth: 0, width: '100%' }}>
          
          {/* Calories Remaining Gauge */}
          <div className="glass-card" style={{
            textAlign: 'center',
            border: '1px solid',
            borderColor: isOverCalorieLimit ? 'var(--error)' : 'rgba(212, 175, 55, 0.3)',
            background: isOverCalorieLimit ? 'rgba(239, 68, 68, 0.04)' : 'rgba(212, 175, 55, 0.02)'
          }}>
            <span style={{ fontSize: '11px', color: isOverCalorieLimit ? 'var(--error)' : 'var(--primary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {isOverCalorieLimit ? 'Calories Limit Exceeded' : 'Calories Remaining Today'}
            </span>
            <p style={{ fontSize: '36px', fontWeight: 800, color: isOverCalorieLimit ? 'var(--error)' : '#ffffff', margin: '8px 0' }}>
              {isOverCalorieLimit ? `Over limit by ${Math.abs(caloriesRemaining)}` : `${caloriesRemaining}`}
            </p>
            <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
              kcal remaining (Target: {calorieTarget} kcal)
            </span>
          </div>

          {/* Daily Totals / Macro Remaining Balance */}
          <div className="glass-card" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
            <h4 style={{ fontSize: '14px', color: 'var(--primary)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Macros Left / Remaining
            </h4>

            {/* Calories Left Progress bar */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '6px' }}>
                <span style={{ color: 'var(--muted)' }}>Calories Left</span>
                <strong style={{ color: caloriesRemaining < 0 ? 'var(--error)' : '#ffffff' }}>
                  {caloriesRemaining < 0 ? `Over limit by ${Math.abs(caloriesRemaining)} kcal` : `${caloriesRemaining} / ${calorieTarget} kcal`}
                </strong>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#222', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  background: isOverCalorieLimit ? 'var(--error)' : 'var(--primary)',
                  width: `${Math.min(100, (dailyTotals.calories / calorieTarget) * 100)}%`,
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>

            {/* Protein Left Progress bar */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '6px' }}>
                <span style={{ color: 'var(--muted)' }}>Protein Left</span>
                <strong style={{ color: proteinTarget - dailyTotals.protein <= 0 ? 'var(--success)' : '#ffffff' }}>
                  {proteinTarget - dailyTotals.protein <= 0 ? 'Goal Met!' : `${Math.round(proteinTarget - dailyTotals.protein)}g / ${proteinTarget}g`}
                </strong>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#222', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  background: '#10b981',
                  width: `${Math.min(100, (dailyTotals.protein / proteinTarget) * 100)}%`,
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>

            {/* Carbs Left Progress bar */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '6px' }}>
                <span style={{ color: 'var(--muted)' }}>Carbs Left</span>
                <strong style={{ color: carbTarget - dailyTotals.carbs <= 0 ? 'var(--error)' : '#ffffff' }}>
                  {carbTarget - dailyTotals.carbs <= 0 ? `Over by ${Math.round(dailyTotals.carbs - carbTarget)}g` : `${Math.round(carbTarget - dailyTotals.carbs)}g / ${carbTarget}g`}
                </strong>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#222', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  background: '#f59e0b',
                  width: `${Math.min(100, (dailyTotals.carbs / carbTarget) * 100)}%`,
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>

            {/* Fats Left Progress bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '6px' }}>
                <span style={{ color: 'var(--muted)' }}>Fats Left</span>
                <strong style={{ color: fatTarget - dailyTotals.fat <= 0 ? 'var(--error)' : '#ffffff' }}>
                  {fatTarget - dailyTotals.fat <= 0 ? `Over by ${Math.round(dailyTotals.fat - fatTarget)}g` : `${Math.round(fatTarget - dailyTotals.fat)}g / ${fatTarget}g`}
                </strong>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#222', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  background: '#60a5fa',
                  width: `${Math.min(100, (dailyTotals.fat / fatTarget) * 100)}%`,
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* FOOD DATABASE SECTION (BELOW) */}
      <div>
        <h3 style={{ fontSize: '20px', color: '#ffffff', marginBottom: '16px' }}>Food Database Library</h3>

        {/* Filters Bar */}
        <div className="glass-card" style={{ padding: '16px', marginBottom: '24px', minWidth: 0 }}>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              type="text"
              className="input-field"
              placeholder="Search foods, samosas, momos, tea, daal..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ flex: 1, minWidth: '200px', padding: '11px 14px', fontSize: '14.5px' }}
            />

            <CustomDropdown
              options={[
                { value: 'all', label: 'Any Macros' },
                { value: 'high_protein', label: 'High Protein (15g+)' },
                { value: 'high_carbs', label: 'High Carbs (20g+)' },
                { value: 'low_fat', label: 'Low Fat (≤3g)' }
              ]}
              value={macroFilter}
              onChange={(val) => setMacroFilter(val)}
              style={{ width: '180px' }}
            />
          </div>

          {/* Category horizontal scrolling bar */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            {['All', 'Proteins', 'Carbohydrates', 'Fats', 'Dairy', 'Fruits & Veg', 'Snacks & Extras'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '6px 12px',
                  fontSize: '12px',
                  borderRadius: '20px',
                  border: '1px solid',
                  borderColor: selectedCategory === cat ? 'var(--primary)' : 'rgba(255,255,255,0.06)',
                  background: selectedCategory === cat ? 'rgba(212,175,55,0.1)' : 'rgba(255,255,255,0.02)',
                  color: selectedCategory === cat ? 'var(--primary)' : 'var(--muted)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'var(--transition)'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Foods list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '600px', overflowY: 'auto', paddingRight: '8px' }}>
          {filteredFoods.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
              No foods matched your filters. Try search details like "Chai" or "Lays".
            </div>
          ) : (
            filteredFoods.map((food) => {
              const isExpanded = selectedFoodId === food.id;
              return (
                <div
                  key={food.id}
                  className="glass-card"
                  style={{
                    padding: '16px',
                    cursor: 'pointer',
                    background: isExpanded ? 'rgba(212,175,55,0.03)' : 'var(--card-bg)',
                    borderColor: isExpanded ? 'var(--primary)' : 'var(--card-border)',
                  }}
                  onClick={() => handleFoodSelect(food)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ flex: '1 1 200px', minWidth: 0, marginRight: '12px' }}>
                      <h4 style={{ color: '#ffffff', fontSize: '16px', fontWeight: 600, wordBreak: 'break-word' }}>{food.name}</h4>
                      <span style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {food.category} • Base Portion: {food.servingText}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexShrink: 0, marginLeft: 'auto' }}>
                      <div style={{ display: 'flex', gap: '12px', fontSize: '13px', textAlign: 'right' }}>
                        <div>
                          <span style={{ display: 'block', fontSize: '10px', color: 'var(--muted)' }}>PRO</span>
                          <span style={{ fontWeight: 600, color: '#ffffff' }}>{food.protein}g</span>
                        </div>
                        <div>
                          <span style={{ display: 'block', fontSize: '10px', color: 'var(--muted)' }}>CARB</span>
                          <span style={{ fontWeight: 600, color: '#ffffff' }}>{food.carbs}g</span>
                        </div>
                        <div>
                          <span style={{ display: 'block', fontSize: '10px', color: 'var(--muted)' }}>CAL</span>
                          <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{food.calories}</span>
                        </div>
                      </div>

                      <span style={{ color: isExpanded ? 'var(--primary)' : 'var(--muted)', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(90deg)' : 'rotate(0)' }}>
                        ▶
                      </span>
                    </div>
                  </div>

                  {/* Extended Portion Calculator */}
                  {isExpanded && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        marginTop: '16px',
                        paddingTop: '16px',
                        borderTop: '1px solid rgba(255,255,255,0.06)',
                        cursor: 'default'
                      }}
                    >
                      <h5 style={{ fontSize: '13px', color: 'var(--primary)', marginBottom: '12px', textTransform: 'uppercase' }}>
                        Portion & Macro Calculator
                      </h5>

                      {food.isQuantity ? (
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '16px' }}>
                          <div className="input-group" style={{ margin: 0, flex: '1 1 180px' }}>
                            <label className="input-label" style={{ fontSize: '11px' }}>Quantity ({food.servingUnit || 'portions'})</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <input
                                type="number"
                                className="input-field"
                                value={customQuantity}
                                onChange={(e) => setCustomQuantity(Math.max(0.1, parseFloat(e.target.value) || 0))}
                                step="0.5"
                                style={{ padding: '8px 12px', fontSize: '14px', width: '120px' }}
                              />
                              <span style={{ fontSize: '14px', color: '#ffffff' }}>{food.servingUnit || 'pcs'}</span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '18px' }}>
                            {[0.5, 1, 1.5, 2, 3, 4].map((quickVal) => (
                              <button
                                key={quickVal}
                                className="btn-secondary"
                                onClick={() => setCustomQuantity(quickVal)}
                                style={{ padding: '4px 8px', fontSize: '11px', borderRadius: '4px' }}
                              >
                                {quickVal} {quickVal === 1 ? (food.servingUnit || 'pc') : (food.servingUnit ? `${food.servingUnit}s` : 'pcs')}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '16px' }}>
                          <div className="input-group" style={{ margin: 0, flex: '1 1 180px' }}>
                            <label className="input-label" style={{ fontSize: '11px' }}>Custom Weight (Grams)</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <input
                                type="number"
                                className="input-field"
                                value={customGrams}
                                onChange={(e) => setCustomGrams(Math.max(1, parseInt(e.target.value) || 0))}
                                style={{ padding: '8px 12px', fontSize: '14px', width: '120px' }}
                              />
                              <span style={{ fontSize: '14px', color: '#ffffff' }}>g</span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '18px' }}>
                            {[50, 100, 150, 200, 250, 500].map((quickVal) => (
                              <button
                                key={quickVal}
                                className="btn-secondary"
                                onClick={() => setCustomGrams(quickVal)}
                                style={{ padding: '4px 8px', fontSize: '11px', borderRadius: '4px' }}
                              >
                                {quickVal}g
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Cooking Method Modifier */}
                      <div style={{ marginBottom: '16px' }}>
                        <label className="input-label" style={{ fontSize: '11px', display: 'block', marginBottom: '8px' }}>Cooking Modifier</label>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {[
                            { value: 'normal', label: 'Normal / Raw' },
                            { value: 'grilled', label: 'Grilled (+30 kcal, +3g Fat)' },
                            { value: 'fried', label: 'Fried (+120 kcal, +12g Fat)' }
                          ].map((method) => (
                            <button
                              key={method.value}
                              type="button"
                              className="btn-secondary"
                              onClick={() => setCookingMethod(method.value as any)}
                              style={{
                                flex: '1 1 auto',
                                padding: '8px 12px',
                                fontSize: '11.5px',
                                borderRadius: '6px',
                                borderColor: cookingMethod === method.value ? 'var(--primary)' : 'rgba(255,255,255,0.06)',
                                background: cookingMethod === method.value ? 'rgba(212,175,55,0.1)' : 'rgba(255,255,255,0.02)',
                                color: cookingMethod === method.value ? 'var(--primary)' : '#ffffff',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'var(--transition)'
                              }}
                            >
                              {method.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <div style={{ textAlign: 'center', flex: 1 }}>
                          <span style={{ fontSize: '10px', color: 'var(--muted)' }}>CALORIES</span>
                          <p style={{ fontSize: '18px', fontWeight: 700, color: 'var(--primary)' }}>{calculatedMacros.calories}</p>
                        </div>
                        <div style={{ textAlign: 'center', flex: 1, borderLeft: '1px solid rgba(255,255,255,0.06)' }}>
                          <span style={{ fontSize: '10px', color: 'var(--muted)' }}>PROTEIN</span>
                          <p style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>{calculatedMacros.protein}g</p>
                        </div>
                        <div style={{ textAlign: 'center', flex: 1, borderLeft: '1px solid rgba(255,255,255,0.06)' }}>
                          <span style={{ fontSize: '10px', color: 'var(--muted)' }}>CARBS</span>
                          <p style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>{calculatedMacros.carbs}g</p>
                        </div>
                        <div style={{ textAlign: 'center', flex: 1, borderLeft: '1px solid rgba(255,255,255,0.06)' }}>
                          <span style={{ fontSize: '10px', color: 'var(--muted)' }}>FAT</span>
                          <p style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>{calculatedMacros.fat}g</p>
                        </div>
                      </div>

                      <button
                        className="btn-primary"
                        onClick={() => handleAddToLog(food)}
                        style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '6px', width: '100%' }}
                      >
                        Add to Daily Log {food.isQuantity ? `(${customQuantity} ${customQuantity === 1 ? (food.servingUnit || 'pc') : (food.servingUnit ? `${food.servingUnit}s` : 'pcs')})` : `(${customGrams}g)`}
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
