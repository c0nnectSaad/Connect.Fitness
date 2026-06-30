'use client';

import React, { useState, useMemo } from 'react';
import { foodsData, FoodItem } from '../data/foods';
import { UserStats } from './Onboarding';
import CustomDropdown from './CustomDropdown';
import { getTrackingDate } from '../utils/fitnessCalc';

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

interface StatsTabProps {
  userStats: UserStats;
  dailyLogs: { [dateStr: string]: DayLog };
  onLogsUpdate: (updatedLogs: { [dateStr: string]: DayLog }) => void;
}

export default function StatsTab({ userStats, dailyLogs, onLogsUpdate }: StatsTabProps) {
  // Helper to format Date to YYYY-MM-DD local format
  const formatDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getRecentDates = () => {
    const list = [];
    const baseDate = getTrackingDate();
    for (let i = 0; i < 7; i++) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() - i);
      list.push({
        dateStr: formatDateString(d),
        label: i === 0 ? 'Today' : i === 1 ? 'Yesterday' : i === 2 ? '2 Days Ago' : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      });
    }
    return list;
  };

  const recentDates = useMemo(() => getRecentDates(), []);
  const [selectedDate, setSelectedDate] = useState<string>(recentDates[0].dateStr);

  // Search/Add food states
  const [isAddingFood, setIsAddingFood] = useState(false);
  const [foodSearch, setFoodSearch] = useState('');
  const [selectedFoodId, setSelectedFoodId] = useState('');
  const [addGrams, setAddGrams] = useState<number>(100);
  const [addQuantity, setAddQuantity] = useState<number>(1);
  const [addCookingMethod, setAddCookingMethod] = useState<'normal' | 'grilled' | 'fried'>('normal');

  // Edit item state
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editGrams, setEditGrams] = useState<number>(100);

  // Retrieve log for selected date
  const activeLog = useMemo(() => {
    const defaultLog: DayLog = {
      eaten: [],
      workoutCompleted: false,
      workoutDifficulty: 'intermediate',
      workoutDayName: new Date(selectedDate.replace(/-/g, '/')).toLocaleDateString('en-US', { weekday: 'long' }),
      weightAtDate: userStats.weightKg,
      calorieTarget: userStats.caloriesBulk // default to bulk target
    };
    return dailyLogs[selectedDate] || defaultLog;
  }, [dailyLogs, selectedDate, userStats]);

  // Update specific day log helper
  const updateActiveLog = (updatedFields: Partial<DayLog>) => {
    const updated = {
      ...activeLog,
      ...updatedFields
    };
    onLogsUpdate({
      ...dailyLogs,
      [selectedDate]: updated
    });
  };

  // Add food to selected date
  const handleAddFood = (e: React.FormEvent) => {
    e.preventDefault();
    const food = foodsData.find(f => f.id === selectedFoodId);
    if (!food) return;

    let ratio = 1;
    if (food.isQuantity) {
      ratio = addQuantity;
    } else {
      ratio = addGrams / food.servingSizeGrams;
    }

    let baseCalories = food.calories * ratio;
    let baseProtein = food.protein * ratio;
    let baseCarbs = food.carbs * ratio;
    let baseFat = food.fat * ratio;

    if (addCookingMethod === 'grilled') {
      baseCalories += 30 * ratio;
      baseFat += 3 * ratio;
    } else if (addCookingMethod === 'fried') {
      baseCalories += 120 * ratio;
      baseFat += 12 * ratio;
    }

    const displayName = addCookingMethod !== 'normal'
      ? `${food.name} (${addCookingMethod === 'grilled' ? 'Grilled' : 'Fried'})`
      : food.name;

    const newEaten: EatenFood = {
      id: Math.random().toString(36).substring(2, 9),
      name: displayName,
      grams: food.isQuantity ? (addQuantity * food.servingSizeGrams) : addGrams,
      calories: Math.round(baseCalories),
      protein: parseFloat(baseProtein.toFixed(1)),
      carbs: parseFloat(baseCarbs.toFixed(1)),
      fat: parseFloat(baseFat.toFixed(1)),
      quantity: food.isQuantity ? addQuantity : undefined,
      cookingMethod: addCookingMethod !== 'normal' ? addCookingMethod : undefined
    };

    const updatedEaten = [...activeLog.eaten, newEaten];
    updateActiveLog({ eaten: updatedEaten });

    // Reset states
    setIsAddingFood(false);
    setSelectedFoodId('');
    setFoodSearch('');
    setAddGrams(100);
    setAddQuantity(1);
    setAddCookingMethod('normal');
  };

  // Delete eaten food
  const handleDeleteFood = (itemId: string) => {
    const updatedEaten = activeLog.eaten.filter(item => item.id !== itemId);
    updateActiveLog({ eaten: updatedEaten });
  };

  // Edit gram/quantity amount
  const handleStartEdit = (item: EatenFood) => {
    setEditingItemId(item.id);
    setEditGrams(item.quantity ? item.quantity : item.grams);
  };

  const handleSaveEdit = (itemId: string) => {
    const originalItem = activeLog.eaten.find(i => i.id === itemId);
    if (!originalItem) return;

    // Strip any "(Grilled)" or "(Fried)" suffix from name to look up in database
    const cleanName = originalItem.name.replace(/\s*\((Grilled|Fried)\)$/, '');
    const food = foodsData.find(f => f.name === cleanName) || foodsData[0];
    
    let ratio = 1;
    let quantityVal = undefined;
    let gramsVal = editGrams;

    if (food.isQuantity) {
      ratio = editGrams;
      quantityVal = editGrams;
      gramsVal = editGrams * food.servingSizeGrams;
    } else {
      ratio = editGrams / food.servingSizeGrams;
    }

    let baseCalories = food.calories * ratio;
    let baseProtein = food.protein * ratio;
    let baseCarbs = food.carbs * ratio;
    let baseFat = food.fat * ratio;

    const cookingMethodVal = originalItem.cookingMethod;
    if (cookingMethodVal === 'grilled') {
      baseCalories += 30 * ratio;
      baseFat += 3 * ratio;
    } else if (cookingMethodVal === 'fried') {
      baseCalories += 120 * ratio;
      baseFat += 12 * ratio;
    }

    const updatedEaten = activeLog.eaten.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          grams: gramsVal,
          quantity: quantityVal,
          calories: Math.round(baseCalories),
          protein: parseFloat(baseProtein.toFixed(1)),
          carbs: parseFloat(baseCarbs.toFixed(1)),
          fat: parseFloat(baseFat.toFixed(1))
        };
      }
      return item;
    });

    updateActiveLog({ eaten: updatedEaten });
    setEditingItemId(null);
  };

  // Calculate totals
  const totals = useMemo(() => {
    return activeLog.eaten.reduce((acc, item) => {
      acc.calories += item.calories;
      acc.protein += item.protein;
      acc.carbs += item.carbs;
      acc.fat += item.fat;
      return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  }, [activeLog]);

  // Determine calorie offset status
  const calorieTarget = activeLog.calorieTarget || userStats.caloriesBulk;
  const calorieOffset = totals.calories - calorieTarget;
  
  const statusSummary = useMemo(() => {
    if (totals.calories === 0) return { label: 'No data logged', color: 'var(--muted)' };
    if (Math.abs(calorieOffset) <= 100) return { label: 'Optimal Intake', color: 'var(--success)' };
    if (calorieOffset > 100) return { label: `Overeating by +${Math.round(calorieOffset)} kcal`, color: 'var(--error)' };
    return { label: `Deficit of -${Math.round(Math.abs(calorieOffset))} kcal`, color: 'var(--accent)' };
  }, [totals.calories, calorieOffset]);

  // List of matching foods for search in picker
  const filteredFoodsForSearch = useMemo(() => {
    if (!foodSearch.trim()) return [];
    return foodsData.filter(f => f.name.toLowerCase().includes(foodSearch.toLowerCase())).slice(0, 5);
  }, [foodSearch]);

  const dropdownOptions = recentDates.map(d => ({ value: d.dateStr, label: d.label }));

  return (
    <div className="fade-in" style={{ paddingBottom: '60px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '28px', color: '#ffffff', marginBottom: '8px' }}>Stats & History</h2>
        <p style={{ color: 'var(--muted)' }}>
          Select a date to audit, edit, or adjust your historical dieting and training entries.
        </p>
      </div>

      {/* Date Select Panel */}
      <div className="glass-card" style={{ marginBottom: '32px', borderLeft: '4px solid var(--primary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <label className="input-label" style={{ fontSize: '11px', marginBottom: '6px' }}>Audited Date</label>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <CustomDropdown
                options={dropdownOptions}
                value={selectedDate}
                onChange={(val) => {
                  setSelectedDate(val);
                  setIsAddingFood(false);
                  setEditingItemId(null);
                }}
                style={{ width: '220px' }}
              />
              
              {/* Manual Date Input Picker (Styled premium) */}
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  if (e.target.value) {
                    setSelectedDate(e.target.value);
                    setIsAddingFood(false);
                    setEditingItemId(null);
                  }
                }}
                style={{
                  background: 'rgba(20, 20, 20, 0.8)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#ffffff',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontFamily: 'var(--font-body)',
                  fontSize: '14.5px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              />
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Log Status:</span>
            <p style={{ fontSize: '18px', fontWeight: 700, color: statusSummary.color, marginTop: '4px' }}>
              {statusSummary.label}
            </p>
          </div>
        </div>
      </div>

      <div className="responsive-split-grid">
        
        {/* Left Side: Diet log list and edit overlay */}
        <div className="glass-card" style={{ minWidth: 0, width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '16px', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', color: '#ffffff' }}>Foods Eaten on {selectedDate}</h3>
            {!isAddingFood && (
              <button
                className="btn-primary"
                onClick={() => setIsAddingFood(true)}
                style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '6px' }}
              >
                + Log Food
              </button>
            )}
          </div>

          {/* Adding Food Form */}
          {isAddingFood && (
            <form onSubmit={handleAddFood} style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '10px', border: '1px solid var(--glass-border)', marginBottom: '20px' }}>
              <h4 style={{ fontSize: '14px', color: 'var(--primary)', marginBottom: '12px', textTransform: 'uppercase' }}>Log Food to {selectedDate}</h4>
              
              <div className="input-group">
                <label className="input-label" style={{ fontSize: '11px' }}>Search Food Database</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Type to search (e.g. Chai, Lays)..."
                  value={foodSearch}
                  onChange={(e) => setFoodSearch(e.target.value)}
                  style={{ padding: '8px 12px', fontSize: '13px' }}
                />
                
                {/* Search Matches Overlay */}
                {filteredFoodsForSearch.length > 0 && (
                  <div style={{ background: '#111', border: '1px solid #333', borderRadius: '6px', marginTop: '4px', overflow: 'hidden' }}>
                    {filteredFoodsForSearch.map(f => (
                      <div
                        key={f.id}
                        onClick={() => {
                          setSelectedFoodId(f.id);
                          setFoodSearch(f.name);
                          setAddGrams(f.servingSizeGrams);
                          setAddQuantity(1);
                          setAddCookingMethod('normal');
                        }}
                        style={{
                          padding: '8px 12px',
                          fontSize: '13px',
                          cursor: 'pointer',
                          color: selectedFoodId === f.id ? 'var(--primary)' : '#fff',
                          background: selectedFoodId === f.id ? 'rgba(212,175,55,0.1)' : 'transparent'
                        }}
                      >
                        {f.name} ({f.servingText})
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedFoodId && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {foodsData.find(food => food.id === selectedFoodId)?.isQuantity ? (
                      <div className="input-group" style={{ margin: 0 }}>
                        <label className="input-label" style={{ fontSize: '11px' }}>
                          Quantity ({foodsData.find(food => food.id === selectedFoodId)?.servingUnit || 'pcs'})
                        </label>
                        <input
                          type="number"
                          className="input-field"
                          value={addQuantity}
                          onChange={(e) => setAddQuantity(Math.max(0.1, parseFloat(e.target.value) || 0))}
                          step="0.5"
                          style={{ padding: '8px 12px', fontSize: '13px', width: '100px' }}
                        />
                      </div>
                    ) : (
                      <div className="input-group" style={{ margin: 0 }}>
                        <label className="input-label" style={{ fontSize: '11px' }}>Grams</label>
                        <input
                          type="number"
                          className="input-field"
                          value={addGrams}
                          onChange={(e) => setAddGrams(Math.max(1, parseInt(e.target.value) || 0))}
                          style={{ padding: '8px 12px', fontSize: '13px', width: '100px' }}
                        />
                      </div>
                    )}
                    
                    <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
                      <button type="submit" className="btn-primary" style={{ padding: '8px 16px', fontSize: '12px' }}>
                        Add
                      </button>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => setIsAddingFood(false)}
                        style={{ padding: '8px 16px', fontSize: '12px' }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>

                  {/* Cooking Method Modifier */}
                  <div className="input-group" style={{ margin: 0 }}>
                    <label className="input-label" style={{ fontSize: '11px' }}>Cooking Modifier</label>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                      {[
                        { value: 'normal', label: 'Normal' },
                        { value: 'grilled', label: 'Grilled' },
                        { value: 'fried', label: 'Fried' }
                      ].map((method) => (
                        <button
                          key={method.value}
                          type="button"
                          onClick={() => setAddCookingMethod(method.value as any)}
                          style={{
                            flex: 1,
                            padding: '6px',
                            fontSize: '11px',
                            borderRadius: '6px',
                            border: '1px solid',
                            borderColor: addCookingMethod === method.value ? 'var(--primary)' : 'rgba(255,255,255,0.06)',
                            background: addCookingMethod === method.value ? 'rgba(212,175,55,0.1)' : 'transparent',
                            color: addCookingMethod === method.value ? 'var(--primary)' : 'var(--muted)',
                            cursor: 'pointer',
                            textTransform: 'capitalize'
                          }}
                        >
                          {method.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </form>
          )}

          {/* List of logged foods */}
          {activeLog.eaten.length === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--muted)', fontSize: '14px' }}>
              No food logs found for this date.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {activeLog.eaten.map((item) => {
                const isEditing = editingItemId === item.id;
                return (
                  <div key={item.id} style={{ padding: '14px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1, minWidth: 0, marginRight: '16px' }}>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.name}
                      </p>
                      {isEditing ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                          <input
                            type="number"
                            className="input-field"
                            value={editGrams}
                            onChange={(e) => setEditGrams(Math.max(0.1, parseFloat(e.target.value) || 0))}
                            step={item.quantity ? "0.5" : "1"}
                            style={{ padding: '4px 8px', fontSize: '12px', width: '80px' }}
                          />
                          <button
                            onClick={() => handleSaveEdit(item.id)}
                            className="btn-primary"
                            style={{ padding: '4px 8px', fontSize: '11px', borderRadius: '4px' }}
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingItemId(null)}
                            className="btn-secondary"
                            style={{ padding: '4px 8px', fontSize: '11px', borderRadius: '4px' }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                          {item.quantity ? `${item.quantity} ${item.quantity === 1 ? (foodsData.find(f => f.name === item.name || item.name.startsWith(f.name))?.servingUnit || 'portion') : (foodsData.find(f => f.name === item.name || item.name.startsWith(f.name))?.servingUnit ? `${foodsData.find(f => f.name === item.name || item.name.startsWith(f.name))?.servingUnit}s` : 'portions')} (${item.grams}g)` : `${item.grams}g`} • {item.calories} kcal • P: {item.protein}g • C: {item.carbs}g • F: {item.fat}g
                        </span>
                      )}
                    </div>

                    {!isEditing && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleStartEdit(item)}
                          className="btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '11px', borderRadius: '4px' }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteFood(item.id)}
                          style={{ background: 'transparent', border: 'none', color: 'var(--error)', cursor: 'pointer', fontSize: '18px', padding: '4px' }}
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Workout log / summary for date */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', minWidth: 0, width: '100%' }}>
          
          {/* Day Targets Summary & Calories balance */}
          <div className="glass-card" style={{ border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <h3 style={{ fontSize: '16px', color: '#ffffff', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px' }}>
              Caloric Audit
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--muted)' }}>Target Calories:</span>
                <span style={{ color: '#fff', fontWeight: 600 }}>{calorieTarget} kcal</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--muted)' }}>Eaten Calories:</span>
                <span style={{ color: '#fff', fontWeight: 600 }}>{totals.calories} kcal</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px' }}>
                <span style={{ color: 'var(--muted)' }}>Net Balance:</span>
                <span style={{ color: calorieOffset > 0 ? 'var(--error)' : calorieOffset < 0 ? 'var(--accent)' : 'var(--success)', fontWeight: 700 }}>
                  {calorieOffset > 0 ? `+${Math.round(calorieOffset)} (Surplus)` : calorieOffset < 0 ? `${Math.round(calorieOffset)} (Deficit)` : '0 (Balanced)'}
                </span>
              </div>
            </div>
          </div>

          {/* Workout Tracker for past date */}
          <div className="glass-card">
            <h3 style={{ fontSize: '16px', color: '#ffffff', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px' }}>
              Training Audit
            </h3>

            <div className="input-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={activeLog.workoutCompleted}
                  onChange={(e) => updateActiveLog({ workoutCompleted: e.target.checked })}
                  style={{ accentColor: 'var(--primary)', width: '16px', height: '16px' }}
                />
                <span>Workout Completed on this Date</span>
              </label>
            </div>

            {activeLog.workoutCompleted && (
              <div className="input-group" style={{ marginTop: '16px' }}>
                <label className="input-label" style={{ fontSize: '11px' }}>Difficulty Level</label>
                <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                  {['easy', 'intermediate', 'hard'].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => updateActiveLog({ workoutDifficulty: level as any })}
                      style={{
                        flex: 1,
                        padding: '6px',
                        fontSize: '11px',
                        borderRadius: '6px',
                        border: '1px solid',
                        borderColor: activeLog.workoutDifficulty === level ? 'var(--primary)' : 'rgba(255,255,255,0.06)',
                        background: activeLog.workoutDifficulty === level ? 'rgba(212,175,55,0.1)' : 'transparent',
                        color: activeLog.workoutDifficulty === level ? 'var(--primary)' : 'var(--muted)',
                        cursor: 'pointer',
                        textTransform: 'capitalize'
                      }}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Display logged exercises done on audited date */}
            {activeLog.workoutCompleted && activeLog.completedExercises && activeLog.completedExercises.length > 0 && (
              <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
                <span style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                  Exercises Completed:
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {activeLog.completedExercises.map((exItem, index) => {
                    const isFullyDone = exItem.completedSets >= 3;
                    const bonusSets = Math.max(0, exItem.completedSets - 3);
                    return (
                      <div 
                        key={`${exItem.id}-${index}`} 
                        style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center', 
                          padding: '8px 12px', 
                          background: 'rgba(255,255,255,0.01)', 
                          borderRadius: '6px', 
                          border: '1px solid rgba(255,255,255,0.02)' 
                        }}
                      >
                        <span style={{ fontSize: '13px', color: '#ffffff', fontWeight: 600 }}>
                          {exItem.name}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ 
                            fontSize: '12px', 
                            color: isFullyDone ? 'var(--success)' : 'var(--accent)', 
                            fontWeight: 700 
                          }}>
                            {exItem.completedSets} / {exItem.totalSets} sets
                          </span>
                          {bonusSets > 0 && (
                            <span style={{ 
                              fontSize: '9px', 
                              background: 'rgba(212,175,55,0.15)', 
                              color: 'var(--primary)', 
                              padding: '1px 5px', 
                              borderRadius: '4px',
                              fontWeight: 700
                            }}>
                              +{bonusSets} bonus
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
