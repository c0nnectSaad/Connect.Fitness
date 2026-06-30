'use client';

import React, { useState, useMemo } from 'react';
import { allExercises, Exercise, WorkoutPreset, WorkoutPresetItem } from '../data/exercises';
import WorkoutVisual from './WorkoutVisual';
import { UserStats } from './Onboarding';
import CustomDropdown from './CustomDropdown';

interface CustomizerTabProps {
  userStats: UserStats;
  presets: WorkoutPreset[];
  activePreset: WorkoutPreset;
  onPresetsUpdate: (newPresets: WorkoutPreset[], selectedPresetName: string) => void;
}

export default function CustomizerTab({ userStats, presets, activePreset, onPresetsUpdate }: CustomizerTabProps) {
  const [selectedDay, setSelectedDay] = useState<string>('Monday');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Custom Preset creation states
  const [newPresetName, setNewPresetName] = useState('');
  const [isCreatingPreset, setIsCreatingPreset] = useState(false);

  // Expanded library card state
  const [expandedLibExerciseId, setExpandedLibExerciseId] = useState<string | null>(null);

  // Exercise replacing states
  const [replacingIndex, setReplacingIndex] = useState<number | null>(null);

  // Drag and Drop states
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Left list filter
  const filteredExercises = useMemo(() => {
    return allExercises.filter(ex => {
      const matchesSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            ex.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (ex.targetMuscleDetail && ex.targetMuscleDetail.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === 'All' || ex.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  // Normalize current day's schedule items for rendering
  const dayScheduleItems = useMemo(() => {
    const rawList = activePreset.schedule[selectedDay] || [];
    return rawList.map((item, index) => {
      const normalized: WorkoutPresetItem = typeof item === 'string' ? { id: item } : item;
      const ex = allExercises.find(e => e.id === normalized.id);
      return {
        index,
        id: normalized.id,
        exercise: ex,
        customSets: normalized.customSets !== undefined ? normalized.customSets : ex?.defaultSets || 3,
        customReps: normalized.customReps !== undefined ? normalized.customReps : ex?.defaultReps || '10',
        timerSeconds: normalized.timerSeconds !== undefined ? normalized.timerSeconds : (ex?.timerRequired ? ex?.defaultTimerSeconds || 60 : undefined)
      };
    }).filter((item): item is typeof item & { exercise: Exercise } => !!item.exercise);
  }, [activePreset, selectedDay]);

  // Handle preset switching
  const handlePresetSelect = (name: string) => {
    onPresetsUpdate(presets, name);
    setReplacingIndex(null);
  };

  // Create a new empty preset or copy active
  const handleCreatePreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPresetName.trim()) return;

    if (presets.some(p => p.name.toLowerCase() === newPresetName.trim().toLowerCase())) {
      alert('A preset with this name already exists.');
      return;
    }

    const newPreset: WorkoutPreset = {
      name: newPresetName.trim(),
      creator: 'User',
      description: 'Custom bodybuilding preset created in the editor.',
      schedule: {
        Monday: [...activePreset.schedule.Monday],
        Tuesday: [...activePreset.schedule.Tuesday],
        Wednesday: [...activePreset.schedule.Wednesday],
        Thursday: [...activePreset.schedule.Thursday],
        Friday: [...activePreset.schedule.Friday],
        Saturday: [...activePreset.schedule.Saturday],
        Sunday: []
      }
    };

    const updatedPresets = [...presets, newPreset];
    onPresetsUpdate(updatedPresets, newPreset.name);
    setNewPresetName('');
    setIsCreatingPreset(false);
    setReplacingIndex(null);
  };

  // Delete current preset
  const handleDeletePreset = () => {
    if (activePreset.name === 'Xivi Aesthetic Blueprint') {
      alert('The default blueprint preset cannot be deleted.');
      return;
    }

    if (confirm(`Are you sure you want to delete the preset "${activePreset.name}"?`)) {
      const updatedPresets = presets.filter(p => p.name !== activePreset.name);
      onPresetsUpdate(updatedPresets, 'Xivi Aesthetic Blueprint');
      setReplacingIndex(null);
    }
  };

  // Add or Replace exercise
  const handleAddExercise = (exerciseId: string) => {
    const updatedPreset = { ...activePreset };
    const daySchedule = [...(updatedPreset.schedule[selectedDay] || [])];
    const ex = allExercises.find(e => e.id === exerciseId);
    if (!ex) return;

    const newItem: WorkoutPresetItem = {
      id: exerciseId,
      customSets: ex.defaultSets,
      customReps: ex.defaultReps,
      timerSeconds: ex.timerRequired ? ex.defaultTimerSeconds || 60 : undefined
    };

    if (replacingIndex !== null) {
      daySchedule[replacingIndex] = newItem;
      setReplacingIndex(null);
    } else {
      daySchedule.push(newItem);
    }

    updatedPreset.schedule[selectedDay] = daySchedule;

    const updatedPresets = presets.map(p => p.name === activePreset.name ? updatedPreset : p);
    onPresetsUpdate(updatedPresets, activePreset.name);
  };

  // Remove exercise from selected day
  const handleRemoveExercise = (index: number) => {
    const updatedPreset = { ...activePreset };
    const daySchedule = [...(updatedPreset.schedule[selectedDay] || [])];
    
    daySchedule.splice(index, 1);
    updatedPreset.schedule[selectedDay] = daySchedule;

    if (replacingIndex === index) {
      setReplacingIndex(null);
    } else if (replacingIndex !== null && replacingIndex > index) {
      setReplacingIndex(replacingIndex - 1);
    }

    const updatedPresets = presets.map(p => p.name === activePreset.name ? updatedPreset : p);
    onPresetsUpdate(updatedPresets, activePreset.name);
  };

  // Update a specific schedule item property
  const handleUpdateExerciseProp = (index: number, key: 'customSets' | 'customReps' | 'timerSeconds', value: any) => {
    const updatedPreset = { ...activePreset };
    const daySchedule = [...(updatedPreset.schedule[selectedDay] || [])];
    
    const item = daySchedule[index];
    const normalized: WorkoutPresetItem = typeof item === 'string' ? { id: item } : { ...item };
    
    if (key === 'customSets') {
      normalized.customSets = Math.max(1, parseInt(value) || 1);
    } else if (key === 'customReps') {
      normalized.customReps = value;
    } else if (key === 'timerSeconds') {
      normalized.timerSeconds = value === '' ? undefined : Math.max(0, parseInt(value) || 0);
    }

    daySchedule[index] = normalized;
    updatedPreset.schedule[selectedDay] = daySchedule;

    const updatedPresets = presets.map(p => p.name === activePreset.name ? updatedPreset : p);
    onPresetsUpdate(updatedPresets, activePreset.name);
  };

  // Drag and drop reordering
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const updatedPreset = { ...activePreset };
    const daySchedule = [...(updatedPreset.schedule[selectedDay] || [])];
    
    // Perform reorder
    const [draggedItem] = daySchedule.splice(draggedIndex, 1);
    daySchedule.splice(index, 0, draggedItem);
    
    updatedPreset.schedule[selectedDay] = daySchedule;

    // Maintain replacing pointer
    if (replacingIndex === draggedIndex) {
      setReplacingIndex(index);
    } else if (replacingIndex !== null) {
      if (draggedIndex < replacingIndex && index >= replacingIndex) {
        setReplacingIndex(replacingIndex - 1);
      } else if (draggedIndex > replacingIndex && index <= replacingIndex) {
        setReplacingIndex(replacingIndex + 1);
      }
    }

    const updatedPresets = presets.map(p => p.name === activePreset.name ? updatedPreset : p);
    onPresetsUpdate(updatedPresets, activePreset.name);

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const getExerciseDifficultyTip = (ex: Exercise): { label: string; color: string } => {
    if (ex.visualCategory === 'squats' || ex.visualCategory === 'deadlifts' || ex.id === 'e_bench_press') {
      return { label: 'Heavy Compound • Hard', color: 'var(--error)' };
    }
    if (ex.category === 'Abs' || ex.category === 'Neck' || ex.visualCategory === 'cardio') {
      return { label: 'Core/Neck/Cardio • Easy', color: 'var(--success)' };
    }
    return { label: 'Isolation • Moderate', color: 'var(--accent)' };
  };

  // Dropdown mappings
  const presetDropdownOptions = presets.map(p => ({ value: p.name, label: p.name }));
  
  const muscleDropdownOptions = [
    { value: 'All', label: 'All Muscles' },
    { value: 'Chest', label: 'Chest' },
    { value: 'Back', label: 'Back' },
    { value: 'Shoulders', label: 'Shoulders' },
    { value: 'Triceps', label: 'Triceps' },
    { value: 'Biceps', label: 'Biceps' },
    { value: 'Abs', label: 'Abs' },
    { value: 'Neck', label: 'Neck' },
    { value: 'Legs', label: 'Legs' }
  ];

  const dayDropdownOptions = daysOfWeek.map(d => ({ value: d, label: d }));

  return (
    <div className="fade-in" style={{ paddingBottom: '60px' }}>
      {/* Title */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '28px', color: '#ffffff', marginBottom: '8px' }}>Custom Preset Editor</h2>
        <p style={{ color: 'var(--muted)' }}>
          Configure custom routines. Adjust sets, reps, and exercise execution timers. Drag and drop to reorder.
        </p>
      </div>

      {/* Preset Swapper Control */}
      <div className="glass-card" style={{ marginBottom: '32px', borderLeft: '4px solid var(--accent)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Active Workout Preset
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px', flexWrap: 'wrap' }}>
              {isCreatingPreset ? (
                <form onSubmit={handleCreatePreset} style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Preset Name (e.g. Arnold Split)"
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    style={{ padding: '8px 12px', fontSize: '14px', flex: 1, minWidth: '120px' }}
                    required
                    autoFocus
                  />
                  <button type="submit" className="btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                    Save
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => { setIsCreatingPreset(false); setReplacingIndex(null); }}
                    style={{ padding: '8px 16px', fontSize: '13px' }}
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <>
                  <CustomDropdown
                    options={presetDropdownOptions}
                    value={activePreset.name}
                    onChange={handlePresetSelect}
                    style={{ width: '250px' }}
                  />

                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => { setIsCreatingPreset(true); setReplacingIndex(null); }}
                    style={{ padding: '8px 16px', fontSize: '13px' }}
                  >
                    + New Preset
                  </button>

                  {activePreset.name !== 'Xivi Aesthetic Blueprint' && (
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={handleDeletePreset}
                      style={{ padding: '8px 16px', fontSize: '13px', color: 'var(--error)', borderColor: 'rgba(239,68,68,0.2)' }}
                    >
                      Delete
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
              Presets are saved to your browser automatically.
            </span>
          </div>
        </div>
      </div>

      <div className="responsive-split-grid">
        
        {/* Left Side: Exercise Library */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Replace Exercise Prompt */}
          {replacingIndex !== null && (
            <div 
              style={{ 
                background: 'rgba(245, 158, 11, 0.08)', 
                border: '1px solid rgba(245, 158, 11, 0.25)', 
                borderRadius: '8px', 
                padding: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <span style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: 700 }}>
                  ⚠️ Replacing Exercise {replacingIndex + 1}
                </span>
                <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>
                  Select any exercise from the library below to swap it in.
                </p>
              </div>
              <button 
                type="button"
                className="btn-secondary" 
                onClick={() => setReplacingIndex(null)}
                style={{ padding: '4px 10px', fontSize: '11.5px', color: 'var(--muted)', borderColor: 'rgba(255,255,255,0.1)' }}
              >
                Cancel
              </button>
            </div>
          )}

          <div>
            <h3 style={{ fontSize: '18px', color: '#ffffff', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '12px' }}>
              Exercise Library
            </h3>
          </div>

          {/* Library Filters */}
          <div className="responsive-filters" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', width: '100%', minWidth: 0 }}>
            <input
              type="text"
              className="input-field"
              placeholder="Search by name or targeted muscle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ flex: 1, minWidth: 0, padding: '9px 12px', fontSize: '13px' }}
            />
            
            <CustomDropdown
              options={muscleDropdownOptions}
              value={selectedCategory}
              onChange={(val) => setSelectedCategory(val)}
              style={{ width: '150px' }}
            />
          </div>

          {/* Exercise Items list */}
          <div className="customizer-list" style={{ gap: '10px', maxHeight: '600px', paddingRight: '6px' }}>
            {filteredExercises.map((ex) => {
              const diff = getExerciseDifficultyTip(ex);
              const isExpanded = expandedLibExerciseId === ex.id;
              
              return (
                <div
                  key={ex.id}
                  onClick={() => setExpandedLibExerciseId(isExpanded ? null : ex.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '12px',
                    background: isExpanded ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.01)',
                    borderRadius: '8px',
                    border: isExpanded ? '1px solid rgba(212, 175, 55, 0.25)' : '1px solid rgba(255,255,255,0.03)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    gap: isExpanded ? '12px' : '0px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
                    <div style={{ width: '40px', height: '40px', background: '#000', borderRadius: '4px', overflow: 'hidden', flexShrink: 0 }}>
                      <WorkoutVisual exercise={ex} isActive={false} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ fontSize: '14px', color: '#ffffff', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ex.name}
                      </h4>
                      <p style={{ fontSize: '11px', color: 'var(--primary)', marginTop: '2px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        🎯 {ex.targetMuscleDetail || ex.category}
                      </p>
                    </div>

                    <button
                      type="button"
                      className={replacingIndex !== null ? "btn-primary" : "btn-secondary"}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddExercise(ex.id);
                      }}
                      style={{ 
                        padding: '6px 10px', 
                        fontSize: '12px', 
                        borderRadius: '6px', 
                        flexShrink: 0,
                        background: replacingIndex !== null ? 'var(--primary)' : 'transparent',
                        color: replacingIndex !== null ? 'var(--background)' : '#ffffff'
                      }}
                    >
                      {replacingIndex !== null ? 'Swap' : '+ Add'}
                    </button>
                  </div>

                  {/* Expanded Detail (Targets exact muscles and cues) */}
                  {isExpanded && (
                    <div 
                      style={{ 
                        borderTop: '1px solid rgba(255,255,255,0.06)', 
                        paddingTop: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--muted)', display: 'block', textTransform: 'uppercase' }}>
                          Targeted Muscle Detail:
                        </span>
                        <strong style={{ fontSize: '13px', color: 'var(--primary)', marginTop: '2px', display: 'block' }}>
                          🎯 {ex.targetMuscleDetail || ex.category}
                        </strong>
                      </div>

                      <div style={{ background: 'rgba(0, 0, 0, 0.2)', padding: '10px', borderRadius: '6px', fontSize: '12px' }}>
                        <span style={{ fontWeight: 600, color: '#ffffff', display: 'block', marginBottom: '4px' }}>Cues:</span>
                        <ul style={{ paddingLeft: '16px', margin: 0, color: 'var(--muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {ex.cues.map((cue, i) => (
                            <li key={i}>{cue}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Small visual preview */}
                      <div style={{ height: '100px', width: '100%', background: '#000', borderRadius: '6px', overflow: 'hidden' }}>
                        <WorkoutVisual exercise={ex} isActive={false} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Preset Track editor */}
        <div className="glass-card" style={{ border: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Day Selector */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '12px' }}>
            <CustomDropdown
              options={dayDropdownOptions}
              value={selectedDay}
              onChange={(val) => { setSelectedDay(val); setReplacingIndex(null); }}
              style={{ width: '140px' }}
            />

            <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
              {dayScheduleItems.length} Exercises
            </span>
          </div>

          <div style={{ fontSize: '12px', color: 'var(--muted)', borderLeft: '3px solid var(--primary)', paddingLeft: '8px', lineHeight: '1.4' }}>
            💡 <strong>Drag and drop</strong> exercise cards to rearrange sequence. Set values save automatically.
          </div>

          {/* Active Preset Schedule List */}
          <div className="customizer-list" style={{ gap: '12px', minHeight: '350px', maxHeight: '600px', paddingRight: '4px' }}>
            {selectedDay === 'Sunday' ? (
              <div style={{ textAlign: 'center', padding: '60px 10px', color: 'var(--muted)', fontSize: '13.5px' }}>
                Sunday is set as a REST day by default. Select Monday - Saturday to customize.
              </div>
            ) : dayScheduleItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 10px', color: 'var(--muted)', fontSize: '13.5px' }}>
                No exercises added for {selectedDay}. Tap "+ Add" from the library on the left.
              </div>
            ) : (
              dayScheduleItems.map((item, index) => {
                const ex = item.exercise;
                const isItemReplacing = replacingIndex === index;
                const isDragged = draggedIndex === index;
                const isOver = dragOverIndex === index;
                
                return (
                  <div
                    key={`${item.id}-${index}`}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={() => { setDraggedIndex(null); setDragOverIndex(null); }}
                    onDrop={() => handleDrop(index)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      padding: '12px',
                      background: isItemReplacing 
                        ? 'rgba(245, 158, 11, 0.05)' 
                        : (isOver ? 'rgba(212,175,55,0.08)' : 'rgba(255,255,255,0.02)'),
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: isItemReplacing 
                        ? 'var(--accent)' 
                        : (isOver ? 'var(--primary)' : 'rgba(212,175,55,0.08)'),
                      opacity: isDragged ? 0.4 : 1,
                      cursor: 'grab',
                      transition: 'border-color 0.2s, background-color 0.2s',
                      gap: '10px'
                    }}
                  >
                    {/* Header info row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                      <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--muted)', width: '18px', cursor: 'grab' }}>
                        {index + 1}
                      </span>
                      
                      {/* Drag Handle icon */}
                      <span style={{ color: 'var(--muted)', marginRight: '4px', cursor: 'grab', userSelect: 'none' }}>
                        ☰
                      </span>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ fontSize: '13.5px', color: '#ffffff', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {ex.name}
                        </h4>
                        <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                          {ex.category} • <span style={{ color: 'var(--primary)' }}>{ex.targetMuscleDetail || ex.category}</span>
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => setReplacingIndex(isItemReplacing ? null : index)}
                          style={{ 
                            padding: '4px 8px', 
                            fontSize: '11px', 
                            borderRadius: '4px',
                            borderColor: isItemReplacing ? 'var(--accent)' : 'rgba(255,255,255,0.1)',
                            background: isItemReplacing ? 'rgba(245,158,11,0.1)' : 'transparent',
                            color: isItemReplacing ? 'var(--accent)' : '#fff'
                          }}
                        >
                          {isItemReplacing ? 'Swapping...' : 'Replace'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveExercise(index)}
                          style={{
                            border: 'none',
                            background: 'transparent',
                            color: 'var(--error)',
                            cursor: 'pointer',
                            fontSize: '18px',
                            padding: '2px 6px',
                          }}
                          title="Remove"
                        >
                          ×
                        </button>
                      </div>
                    </div>

                    {/* Editors row (Sets, Reps, Timer) */}
                    <div 
                      style={{ 
                        display: 'flex', 
                        gap: '12px', 
                        alignItems: 'center', 
                        flexWrap: 'wrap',
                        borderTop: '1px solid rgba(255,255,255,0.04)',
                        paddingTop: '8px'
                      }}
                      onClick={(e) => e.stopPropagation()} // Prevent dragging when clicking inputs
                      onDragStart={(e) => { e.preventDefault(); e.stopPropagation(); }} // Disable drag on input fields
                    >
                      {/* Sets Input */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Sets:</span>
                        <input
                          type="number"
                          value={item.customSets}
                          min="1"
                          max="20"
                          onChange={(e) => handleUpdateExerciseProp(index, 'customSets', e.target.value)}
                          style={{
                            width: '45px',
                            background: 'rgba(0,0,0,0.3)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '4px',
                            color: '#fff',
                            fontSize: '12px',
                            padding: '2px 4px',
                            textAlign: 'center',
                            outline: 'none'
                          }}
                        />
                      </div>

                      {/* Reps Input */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Reps:</span>
                        <input
                          type="text"
                          value={item.customReps}
                          onChange={(e) => handleUpdateExerciseProp(index, 'customReps', e.target.value)}
                          style={{
                            width: '80px',
                            background: 'rgba(0,0,0,0.3)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '4px',
                            color: '#fff',
                            fontSize: '12px',
                            padding: '2px 6px',
                            outline: 'none'
                          }}
                        />
                      </div>

                      {/* Timer Input (For Plank, timed exercises) */}
                      {(ex.timerRequired || item.timerSeconds !== undefined) && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '11px', color: 'var(--primary)' }}>Timer (s):</span>
                          <input
                            type="number"
                            value={item.timerSeconds !== undefined ? item.timerSeconds : ''}
                            placeholder={ex.defaultTimerSeconds ? ex.defaultTimerSeconds.toString() : '60'}
                            min="5"
                            onChange={(e) => handleUpdateExerciseProp(index, 'timerSeconds', e.target.value)}
                            style={{
                              width: '55px',
                              background: 'rgba(0,0,0,0.3)',
                              border: '1px solid rgba(212,175,55,0.2)',
                              borderRadius: '4px',
                              color: 'var(--primary)',
                              fontSize: '12px',
                              padding: '2px 4px',
                              textAlign: 'center',
                              outline: 'none',
                              fontWeight: '600'
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
