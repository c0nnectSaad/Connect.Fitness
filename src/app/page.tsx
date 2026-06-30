'use client';

import React, { useState, useEffect } from 'react';
import Onboarding, { UserStats } from '../components/Onboarding';
import DashboardTab from '../components/DashboardTab';
import DietTab from '../components/DietTab';
import WorkoutTab from '../components/WorkoutTab';
import CustomizerTab from '../components/CustomizerTab';
import StatsTab from '../components/StatsTab';
import SettingsTab from '../components/SettingsTab';
import { defaultPreset, WorkoutPreset, allExercises } from '../data/exercises';
import { getTrackingDateString } from '../utils/fitnessCalc';

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

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'workout' | 'diet' | 'customizer' | 'stats' | 'settings'>('dashboard');
  const [startWorkoutImmediately, setStartWorkoutImmediately] = useState<boolean>(false);
  const [swipeAnimationClass, setSwipeAnimationClass] = useState<string>('');
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
  };

  const isInsideScrollable = (element: HTMLElement | null): boolean => {
    let curr = element;
    while (curr && curr !== document.body) {
      const style = window.getComputedStyle(curr);
      const overflowX = style.overflowX;
      if (overflowX === 'auto' || overflowX === 'scroll') {
        if (curr.scrollWidth > curr.clientWidth) {
          return true;
        }
      }
      curr = curr.parentElement;
    }
    return false;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null || touchStartY === null) return;
    
    // Ignore swiping if the gesture is inside a horizontally scrollable selector
    const target = e.target as HTMLElement;
    if (isInsideScrollable(target)) {
      setTouchStartX(null);
      setTouchStartY(null);
      return;
    }
    
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;
    
    if (Math.abs(diffX) > 60 && Math.abs(diffX) > Math.abs(diffY)) {
      const tabs: ('dashboard' | 'workout' | 'diet' | 'customizer' | 'stats' | 'settings')[] = [
        'dashboard', 'workout', 'diet', 'customizer', 'stats', 'settings'
      ];
      const currentIndex = tabs.indexOf(activeTab);
      
      if (diffX < 0) {
        const nextIndex = (currentIndex + 1) % tabs.length;
        setActiveTab(tabs[nextIndex]);
        setStartWorkoutImmediately(false);
        setSwipeAnimationClass('animate-slide-left');
      } else {
        const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        setActiveTab(tabs[prevIndex]);
        setStartWorkoutImmediately(false);
        setSwipeAnimationClass('animate-slide-right');
      }
    }
    
    setTouchStartX(null);
    setTouchStartY(null);
  };

  // Preset States
  const [presets, setPresets] = useState<WorkoutPreset[]>([defaultPreset]);
  const [activePresetName, setActivePresetName] = useState<string>('Xivi Aesthetic Blueprint');

  // Shared Date-Based Daily Logs State
  const [dailyLogs, setDailyLogs] = useState<{ [dateStr: string]: DayLog }>({});

  // Prevent server-side rendering hydration mismatch
  useEffect(() => {
    setIsMounted(true);

    // 1. Load User Stats
    const savedStats = localStorage.getItem('connect_fit_user_stats') || localStorage.getItem('xivi_user_stats');
    if (savedStats) {
      try {
        setUserStats(JSON.parse(savedStats));
      } catch (e) {
        console.error('Error parsing user stats:', e);
      }
    }

    // 2. Load Presets
    const savedPresets = localStorage.getItem('connect_fit_custom_presets') || localStorage.getItem('xivi_custom_presets');
    if (savedPresets) {
      try {
        const parsed = JSON.parse(savedPresets) as WorkoutPreset[];
        const merged = [defaultPreset, ...parsed.filter(p => p.name !== defaultPreset.name)];
        setPresets(merged);
      } catch (e) {
        console.error('Error parsing presets:', e);
      }
    }

    // 3. Load Active Preset Name
    const savedActivePreset = localStorage.getItem('connect_fit_active_preset_name') || localStorage.getItem('xivi_active_preset_name');
    if (savedActivePreset) {
      setActivePresetName(savedActivePreset);
    }

    // 4. Load Date-Based Daily Logs
    let loadedLogs: { [dateStr: string]: DayLog } = {};
    const savedLogs = localStorage.getItem('connect_fit_daily_logs');
    if (savedLogs) {
      try {
        loadedLogs = JSON.parse(savedLogs);
        setDailyLogs(loadedLogs);
      } catch (e) {
        console.error('Error parsing daily logs:', e);
      }
    }

    // 5. Check for orphaned saved workout (incomplete from previous day)
    const savedWorkoutStr = localStorage.getItem('connect_fit_saved_workout');
    if (savedWorkoutStr) {
      try {
        const savedWorkout = JSON.parse(savedWorkoutStr);
        const currentTodayStr = getTrackingDateString();
        if (savedWorkout.dateStr !== currentTodayStr) {
          // Orphaned workout from a previous day! Write it to dailyLogs!
          const savedPresetsList = localStorage.getItem('connect_fit_custom_presets') || localStorage.getItem('xivi_custom_presets');
          let presetsList = [defaultPreset];
          if (savedPresetsList) {
            try { presetsList = [defaultPreset, ...JSON.parse(savedPresetsList)]; } catch(e){}
          }
          const preset = presetsList.find(p => p.name === savedWorkout.presetName) || defaultPreset;
          const scheduleItems = preset.schedule[savedWorkout.selectedDay] || [];
          
          const dayExercises = scheduleItems
            .map(item => {
              const normalized = typeof item === 'string' ? { id: item } : item;
              const ex = allExercises.find(e => e.id === normalized.id);
              if (!ex) return null;
              return {
                exercise: ex,
                customSets: normalized.customSets
              };
            })
            .filter((e): e is NonNullable<typeof e> => !!e);

          const completedExercisesList: CompletedExerciseLog[] = [];
          Object.entries(savedWorkout.completedSetsRecord || {}).forEach(([idxStr, setsArr]: [string, any]) => {
            const idx = parseInt(idxStr);
            const exItem = dayExercises[idx];
            if (exItem && setsArr.some(Boolean)) {
              const completedCount = setsArr.filter(Boolean).length;
              const totalExSets = exItem.customSets !== undefined
                ? exItem.customSets
                : (savedWorkout.workoutDifficulty === 'easy' ? 3 : savedWorkout.workoutDifficulty === 'intermediate' ? 5 : 7);
              
              completedExercisesList.push({
                id: exItem.exercise.id,
                name: exItem.exercise.name,
                completedSets: completedCount,
                totalSets: totalExSets
              });
            }
          });

          if (completedExercisesList.length > 0) {
            const statsStorage = localStorage.getItem('connect_fit_user_stats') || localStorage.getItem('xivi_user_stats');
            let weight = 70;
            let calories = 2000;
            if (statsStorage) {
              try {
                const parsedStats = JSON.parse(statsStorage);
                weight = parsedStats.weightKg;
                calories = parsedStats.caloriesBulk;
              } catch(e){}
            }

            const targetDateLog = loadedLogs[savedWorkout.dateStr] || {
              eaten: [],
              workoutCompleted: false,
              workoutDifficulty: savedWorkout.workoutDifficulty || 'intermediate',
              workoutDayName: savedWorkout.selectedDay,
              weightAtDate: weight,
              calorieTarget: calories
            };

            const updatedLog: DayLog = {
              ...targetDateLog,
              workoutCompleted: true,
              workoutDifficulty: savedWorkout.workoutDifficulty || 'intermediate',
              workoutDayName: savedWorkout.selectedDay,
              completedExercises: completedExercisesList
            };

            loadedLogs[savedWorkout.dateStr] = updatedLog;
            setDailyLogs({ ...loadedLogs });
            localStorage.setItem('connect_fit_daily_logs', JSON.stringify(loadedLogs));
          }

          localStorage.removeItem('connect_fit_saved_workout');
        }
      } catch (e) {
        console.error('Error processing saved workout:', e);
      }
    }
  }, []);

  const handleOnboardingComplete = (stats: UserStats) => {
    setUserStats(stats);
    // Sync with the rebranded key
    localStorage.setItem('connect_fit_user_stats', JSON.stringify(stats));
  };

  const handleResetStats = () => {
    if (confirm('Are you sure you want to reset your height, weight, and training stats? This will clear your current settings.')) {
      localStorage.removeItem('connect_fit_user_stats');
      localStorage.removeItem('xivi_user_stats');
      setUserStats(null);
      setActiveTab('workout');
    }
  };

  const handleResetPresets = () => {
    if (confirm('Are you sure you want to restore the default workout routines? Any custom presets you created will be deleted.')) {
      localStorage.removeItem('connect_fit_custom_presets');
      localStorage.removeItem('xivi_custom_presets');
      localStorage.removeItem('connect_fit_active_preset_name');
      localStorage.removeItem('xivi_active_preset_name');
      setPresets([defaultPreset]);
      setActivePresetName('Xivi Aesthetic Blueprint');
      alert('Workout routines restored to verified PDF schedule!');
    }
  };

  // Presets update handler
  const handlePresetsUpdate = (newPresets: WorkoutPreset[], selectedPresetName: string) => {
    setPresets(newPresets);
    setActivePresetName(selectedPresetName);

    const customOnly = newPresets.filter(p => p.name !== defaultPreset.name);
    localStorage.setItem('connect_fit_custom_presets', JSON.stringify(customOnly));
    localStorage.setItem('connect_fit_active_preset_name', selectedPresetName);
  };

  // Logs update handler (called by DietTab, WorkoutTab, and StatsTab)
  const handleLogsUpdate = (updatedLogs: { [dateStr: string]: DayLog }) => {
    setDailyLogs(updatedLogs);
    localStorage.setItem('connect_fit_daily_logs', JSON.stringify(updatedLogs));
  };

  const activePreset = React.useMemo(() => {
    return presets.find(p => p.name === activePresetName) || defaultPreset;
  }, [presets, activePresetName]);

  // Loading state during initial mounting
  if (!isMounted) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0a0a0a', color: '#ffffff' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: 'var(--primary)', fontFamily: 'Outfit, sans-serif', letterSpacing: '0.1em' }}>Connect.Fitness</h2>
          <div style={{ marginTop: '16px', border: '3px solid rgba(212,175,55,0.1)', borderTop: '3px solid var(--primary)', borderRadius: '50%', width: '32px', height: '32px', animation: 'spin 1s linear infinite', margin: '16px auto' }} />
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (!userStats) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div 
      className="dashboard-grid fade-in"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* SIDEBAR NAVIGATION */}
      <aside className="app-sidebar">
        <div>
          {/* Logo Connect.Fitness */}
          <div className="sidebar-logo" style={{ marginBottom: '40px', textAlign: 'center' }}>
            <h1 className="text-glow" style={{ color: 'var(--primary)', fontSize: '26px', fontWeight: 800, fontFamily: 'var(--font-title)' }}>
              Connect.Fitness
            </h1>
            <span style={{ fontSize: '10px', color: 'var(--muted)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              Aesthetic Planner
            </span>
          </div>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              onClick={() => { setActiveTab('dashboard'); setStartWorkoutImmediately(false); }}
              className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
              style={{ width: '100%' }}
            >
              <span>🏠</span> <span className="tab-text">Dashboard</span>
            </button>
            <button
              onClick={() => { setActiveTab('workout'); setStartWorkoutImmediately(false); }}
              className={`tab-btn ${activeTab === 'workout' ? 'active' : ''}`}
              style={{ width: '100%' }}
            >
              <span>🏋️</span> <span className="tab-text">Workout</span>
            </button>
            <button
              onClick={() => setActiveTab('diet')}
              className={`tab-btn ${activeTab === 'diet' ? 'active' : ''}`}
              style={{ width: '100%' }}
            >
              <span>🥗</span> <span className="tab-text">Diet Plan</span>
            </button>
            <button
              onClick={() => setActiveTab('customizer')}
              className={`tab-btn ${activeTab === 'customizer' ? 'active' : ''}`}
              style={{ width: '100%' }}
            >
              <span>🛠️</span> <span className="tab-text">Customize</span>
            </button>
            <button
               onClick={() => setActiveTab('stats')}
               className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
               style={{ width: '100%' }}
             >
               <span>📊</span> <span className="tab-text">History</span>
             </button>
             <button
               onClick={() => setActiveTab('settings')}
               className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
               style={{ width: '100%' }}
             >
               <span>⚙️</span> <span className="tab-text">Settings</span>
             </button>
             <button
               onClick={() => window.open('/pitch', '_blank')}
               className="tab-btn"
               style={{ width: '100%', border: '1px dashed rgba(212, 175, 55, 0.3)', marginTop: '8px' }}
             >
               <span>🎥</span> <span className="tab-text" style={{ color: 'var(--primary)' }}>Brand Pitch Video</span>
             </button>
          </nav>
        </div>

        {/* User Stats Reset */}
        <div className="sidebar-profile-stats" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
            <span style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase' }}>Current Stats</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ color: '#ffffff' }}>Weight:</span>
              <strong style={{ color: 'var(--primary)' }}>{userStats.weightKg} kg</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ color: '#ffffff' }}>Height:</span>
              <span>{userStats.heightCm} cm</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ color: '#ffffff' }}>Ratio (BWR):</span>
              <span>{userStats.bwr}</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              onClick={handleResetStats}
              className="btn-secondary"
              style={{ width: '100%', padding: '8px 12px', fontSize: '12px', color: 'var(--muted)' }}
            >
              Reset Profile Stats
            </button>
            <button
              onClick={handleResetPresets}
              className="btn-secondary"
              style={{ width: '100%', padding: '8px 12px', fontSize: '12px', color: 'var(--muted)', borderColor: 'rgba(212, 175, 55, 0.15)' }}
            >
              Restore Default Workouts
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT CONTAINER */}
      <main key={activeTab + swipeAnimationClass} className={`app-main-content ${swipeAnimationClass}`}>
        {activeTab === 'dashboard' && (
          <DashboardTab
            userStats={userStats}
            dailyLogs={dailyLogs}
            activePreset={activePreset}
            onStartWorkout={() => {
              setActiveTab('workout');
              setStartWorkoutImmediately(true);
            }}
            onNavigateToDiet={() => {
              setActiveTab('diet');
            }}
          />
        )}
        {activeTab === 'workout' && (
          <WorkoutTab
            userStats={userStats}
            activePreset={activePreset}
            dailyLogs={dailyLogs}
            onLogsUpdate={handleLogsUpdate}
            startWorkoutImmediately={startWorkoutImmediately}
            onClearStartWorkoutImmediately={() => setStartWorkoutImmediately(false)}
          />
        )}
        {activeTab === 'diet' && (
          <DietTab
            userStats={userStats}
            dailyLogs={dailyLogs}
            onLogsUpdate={handleLogsUpdate}
            onStatsUpdate={handleOnboardingComplete}
          />
        )}
        {activeTab === 'customizer' && (
          <CustomizerTab
            userStats={userStats}
            presets={presets}
            activePreset={activePreset}
            onPresetsUpdate={handlePresetsUpdate}
          />
        )}
        {activeTab === 'stats' && (
          <StatsTab
            userStats={userStats}
            dailyLogs={dailyLogs}
            onLogsUpdate={handleLogsUpdate}
          />
        )}
        {activeTab === 'settings' && (
          <SettingsTab
            userStats={userStats}
            onStatsUpdate={handleOnboardingComplete}
          />
        )}
      </main>
    </div>
  );
}
