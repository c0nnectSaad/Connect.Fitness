'use client';

import React, { useState } from 'react';
import { UserStats } from './Onboarding';
import CustomDropdown from './CustomDropdown';
import { recalculateUserStats, calculateBMR, calculateTDEE } from '../utils/fitnessCalc';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

interface SettingsTabProps {
  userStats: UserStats;
  onStatsUpdate: (stats: UserStats) => void;
}

export default function SettingsTab({ userStats, onStatsUpdate }: SettingsTabProps) {
  const [weight, setWeight] = useState<string>(userStats.weightKg.toString());
  const [height, setHeight] = useState<string>(userStats.heightCm.toString());
  const [age, setAge] = useState<string>((userStats.age || 25).toString());
  const [gender, setGender] = useState<'male' | 'female' | 'other'>(userStats.gender || 'male');
  const [activityLevel, setActivityLevel] = useState<'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'>(
    userStats.activityLevel || 'moderate'
  );
  const [trainingAge, setTrainingAge] = useState<'beginner' | 'intermediate' | 'advanced'>(
    userStats.trainingAge || 'intermediate'
  );

  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [backupText, setBackupText] = useState<string | null>(null);

  // Live preview metrics
  const parsedWeight = parseFloat(weight) || userStats.weightKg;
  const parsedHeight = parseFloat(height) || userStats.heightCm;
  const parsedAge = parseInt(age) || (userStats.age || 25);
  
  const bmrPreview = calculateBMR(parsedWeight, parsedHeight, parsedAge, gender);
  const tdeePreview = calculateTDEE(bmrPreview, activityLevel);

  const handleExportData = async () => {
    try {
      const data = {
        userStats: JSON.parse(localStorage.getItem('connect_fit_user_stats') || localStorage.getItem('xivi_user_stats') || '{}'),
        customPresets: JSON.parse(localStorage.getItem('connect_fit_custom_presets') || localStorage.getItem('xivi_custom_presets') || '[]'),
        activePresetName: localStorage.getItem('connect_fit_active_preset_name') || localStorage.getItem('xivi_active_preset_name') || '',
        dailyLogs: JSON.parse(localStorage.getItem('connect_fit_daily_logs') || '{}'),
        savedWorkout: JSON.parse(localStorage.getItem('connect_fit_saved_workout') || 'null')
      };

      const jsonString = JSON.stringify(data, null, 2);
      setBackupText(jsonString);

      const fileName = `saad_workout_backup_${new Date().toISOString().split('T')[0]}.json`;

      // 1. Try native save using @capacitor/filesystem (saves directly to local device storage documents!)
      try {
        await Filesystem.writeFile({
          path: fileName,
          data: jsonString,
          directory: Directory.Documents,
          encoding: Encoding.UTF8
        });
        alert(`Data saved successfully to your local Documents folder as "${fileName}"!`);
        setMessage({ text: `Backup file saved locally to Documents as "${fileName}"`, type: 'success' });
        return;
      } catch (nativeErr) {
        console.warn('Native Filesystem save failed, trying Web Share API:', nativeErr);
      }

      // 2. Try Web Share API (native sheet) - ideal for Android WebView / APK
      if (typeof navigator !== 'undefined' && navigator.share) {
        try {
          const file = new File([jsonString], fileName, { type: 'application/json' });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: 'Saad Workout Backup',
              text: 'Here is your Saad Workout app data backup.'
            });
            alert('Backup shared successfully!');
            return;
          }
        } catch (shareErr) {
          console.error('File sharing not supported or cancelled, falling back to text sharing:', shareErr);
          try {
            await navigator.share({
              title: 'Saad Workout Backup Code',
              text: jsonString
            });
            alert('Backup code shared successfully!');
            return;
          } catch (textShareErr) {
            console.error('Text sharing failed, falling back to browser download:', textShareErr);
          }
        }
      }

      // 3. Fallback for standard browsers (desktop)
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setMessage({ text: 'Data exported successfully! Save the downloaded JSON file to restore it later.', type: 'success' });
      alert('Data exported successfully! If the download did not start automatically, please copy the backup code from the popup window.');
    } catch (e) {
      console.error(e);
      setMessage({ text: 'Failed to export data. Please try again.', type: 'error' });
      alert('Failed to export data. Please try again.');
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = JSON.parse(text);

        if (!data || typeof data !== 'object') {
          throw new Error('Invalid backup file structure.');
        }

        if (data.userStats && typeof data.userStats === 'object' && Object.keys(data.userStats).length > 0) {
          localStorage.setItem('connect_fit_user_stats', JSON.stringify(data.userStats));
          localStorage.setItem('xivi_user_stats', JSON.stringify(data.userStats));
        }

        if (Array.isArray(data.customPresets)) {
          localStorage.setItem('connect_fit_custom_presets', JSON.stringify(data.customPresets));
          localStorage.setItem('xivi_custom_presets', JSON.stringify(data.customPresets));
        }

        if (typeof data.activePresetName === 'string' && data.activePresetName) {
          localStorage.setItem('connect_fit_active_preset_name', data.activePresetName);
          localStorage.setItem('xivi_active_preset_name', data.activePresetName);
        }

        if (data.dailyLogs && typeof data.dailyLogs === 'object') {
          localStorage.setItem('connect_fit_daily_logs', JSON.stringify(data.dailyLogs));
        }

        if (data.savedWorkout) {
          localStorage.setItem('connect_fit_saved_workout', JSON.stringify(data.savedWorkout));
        } else {
          localStorage.removeItem('connect_fit_saved_workout');
        }

        setMessage({ text: 'Data imported successfully! Reloading application to apply changes...', type: 'success' });
        
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } catch (err) {
        console.error(err);
        setMessage({ text: 'Failed to import data. Please ensure the file is a valid JSON backup.', type: 'error' });
      }
    };
    reader.readAsText(file);
  };

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other / Non-binary' }
  ];

  const activityOptions = [
    { value: 'sedentary', label: 'Sedentary (Little/no exercise, desk job)' },
    { value: 'light', label: 'Lightly Active (Light exercise 1-3 days/wk)' },
    { value: 'moderate', label: 'Moderately Active (Moderate exercise 3-5 days/wk)' },
    { value: 'active', label: 'Very Active (Hard exercise 6-7 days/wk)' },
    { value: 'very_active', label: 'Extra Active (Physical job or 2x daily training)' }
  ];

  const trainingOptions = [
    { value: 'beginner', label: 'Beginner (<3 months) — Scale load by 0.65x' },
    { value: 'intermediate', label: 'Intermediate (3-12 months) — Scale load by 0.90x' },
    { value: 'advanced', label: 'Advanced (1+ years) — Scale load by 1.00x' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseInt(age);

    if (isNaN(w) || w <= 20 || w >= 300) {
      setMessage({ text: 'Please enter a valid weight (20kg - 300kg).', type: 'error' });
      return;
    }
    if (isNaN(h) || h <= 100 || h >= 250) {
      setMessage({ text: 'Please enter a valid height (100cm - 250cm).', type: 'error' });
      return;
    }
    if (isNaN(a) || a <= 12 || a >= 100) {
      setMessage({ text: 'Please enter a valid age (12 - 100 years).', type: 'error' });
      return;
    }

    // Recalculate stats while maintaining targetGoal if it exists
    const updatedStats = recalculateUserStats(
      w,
      h,
      a,
      gender,
      activityLevel,
      trainingAge,
      userStats.targetGoal ? {
        type: userStats.targetGoal.type,
        targetWeightKg: userStats.targetGoal.targetWeightKg,
        weeks: userStats.targetGoal.weeks
      } : null
    );

    onStatsUpdate(updatedStats);
    setMessage({ text: 'Settings updated successfully! Targets and calculations updated across all tabs.', type: 'success' });
    
    // Clear success message after 4 seconds
    setTimeout(() => {
      setMessage(null);
    }, 4000);
  };

  return (
    <div className="fade-in" style={{ paddingBottom: '60px' }}>
      {/* Title */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '28px', color: '#ffffff', marginBottom: '8px' }}>Profile Settings</h2>
        <p style={{ color: 'var(--muted)' }}>
          Update your physical attributes, training experience, and activity level to dynamically scale your fitness targets.
        </p>
      </div>

      <div className="responsive-two-column-grid">
        {/* Form panel */}
        <form onSubmit={handleSubmit} className="glass-card">
          <h3 style={{ fontSize: '20px', color: '#ffffff', marginBottom: '24px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: '12px' }}>
            Update Profile Information
          </h3>

          {message && (
            <div style={{
              background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: `1px solid ${message.type === 'success' ? 'var(--success)' : 'var(--error)'}`,
              color: message.type === 'success' ? 'var(--success)' : 'var(--error)',
              padding: '12px 16px',
              borderRadius: '8px',
              fontSize: '14.5px',
              marginBottom: '24px'
            }}>
              {message.text}
            </div>
          )}

          <div className="responsive-half-grid" style={{ marginBottom: '20px' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Weight (kg)</label>
              <input
                type="number"
                className="input-field"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="e.g. 75"
                required
                min="20"
                max="300"
                step="0.1"
              />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Height (cm)</label>
              <input
                type="number"
                className="input-field"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="e.g. 180"
                required
                min="100"
                max="250"
                step="0.1"
              />
            </div>
          </div>

          <div className="responsive-half-grid" style={{ marginBottom: '20px' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Age (years)</label>
              <input
                type="number"
                className="input-field"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g. 25"
                required
                min="12"
                max="100"
                step="1"
              />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Gender</label>
              <CustomDropdown
                options={genderOptions}
                value={gender}
                onChange={(val) => setGender(val)}
              />
            </div>
          </div>

          <div className="input-group" style={{ marginBottom: '20px' }}>
            <label className="input-label">Daily Activity Level</label>
            <CustomDropdown
              options={activityOptions}
              value={activityLevel}
              onChange={(val) => setActivityLevel(val)}
            />
          </div>

          <div className="input-group" style={{ marginBottom: '28px' }}>
            <label className="input-label">Training Age / Level</label>
            <CustomDropdown
              options={trainingOptions}
              value={trainingAge}
              onChange={(val) => setTrainingAge(val)}
            />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', padding: '14px' }}>
            💾 Save Changes
          </button>
        </form>

        {/* Live Preview Side Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-card" style={{ borderLeft: '4px solid var(--primary)' }}>
            <h4 style={{ fontSize: '16px', color: '#ffffff', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Calculated Baselines
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase' }}>Basal Metabolic Rate (BMR)</span>
                <p style={{ fontSize: '22px', fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>
                  {bmrPreview} <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--muted)' }}>kcal</span>
                </p>
                <span style={{ fontSize: '10px', color: 'var(--muted)' }}>Calories burned resting</span>
              </div>

              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '12px' }}>
                <span style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase' }}>Active Energy (TDEE)</span>
                <p style={{ fontSize: '22px', fontWeight: 700, color: 'var(--primary)', marginTop: '2px' }}>
                  {tdeePreview} <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--muted)' }}>kcal</span>
                </p>
                <span style={{ fontSize: '10px', color: 'var(--muted)' }}>Base maintenance calories</span>
              </div>

              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '12px' }}>
                <span style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase' }}>Daily Water Baseline</span>
                <p style={{ fontSize: '18px', fontWeight: 700, color: '#60a5fa', marginTop: '2px' }}>
                  {(parsedWeight * 0.0375).toFixed(2)} L
                </p>
              </div>
            </div>
          </div>

          {/* Backup & Restore Panel */}
          <div className="glass-card" style={{ borderLeft: '4px solid #3b82f6', background: 'linear-gradient(135deg, rgba(59,130,246,0.02) 0%, rgba(0,0,0,0.2) 100%)' }}>
            <h4 style={{ fontSize: '16px', color: '#ffffff', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Backup & Restore
            </h4>
            <p style={{ fontSize: '12.5px', color: 'var(--muted)', marginBottom: '18px', lineHeight: '1.45' }}>
              Export all your profile stats, custom workout presets, active schedules, and training logs to a single JSON backup. Import it later to restore your progress.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                type="button"
                className="btn-primary"
                onClick={handleExportData}
                style={{ width: '100%', padding: '12px', background: 'var(--primary)', borderColor: 'var(--primary)' }}
              >
                📤 Export App Data (.json)
              </button>
              
              <div style={{ position: 'relative', width: '100%' }}>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  style={{ display: 'none' }}
                  id="import-backup-file"
                />
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => document.getElementById('import-backup-file')?.click()}
                  style={{ width: '100%', padding: '12px', borderColor: 'rgba(255,255,255,0.1)' }}
                >
                  📥 Import App Data (.json)
                </button>
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '20px', background: 'rgba(255,255,255,0.01)' }}>
            <h4 style={{ fontSize: '14px', color: '#ffffff', marginBottom: '8px' }}>💡 How it works</h4>
            <p style={{ fontSize: '12.5px', color: 'var(--muted)', lineHeight: '1.6' }}>
              Your BMR is calculated using the scientific **Mifflin-St Jeor Formula**. This baseline is then multiplied by your activity factor to yield your **TDEE** (Total Daily Energy Expenditure). 
            </p>
            <p style={{ fontSize: '12.5px', color: 'var(--muted)', lineHeight: '1.6', marginTop: '8px' }}>
              These metrics form the baseline for your custom diet goals and workout load scaling.
            </p>
          </div>
        </div>
      </div>

      {/* Backup Completed Modal Overlay */}
      {backupText && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
          backdropFilter: 'blur(8px)'
        }}>
          <div className="glass-card" style={{ maxWidth: '500px', width: '100%', border: '1px solid var(--primary)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '20px', color: 'var(--primary)', fontWeight: 800 }}>
              Backup Completed! 💾
            </h3>
            <p style={{ fontSize: '13.5px', color: '#ffffff', lineHeight: '1.45' }}>
              Your personal data has been exported successfully. If the file download did not trigger automatically on your device, copy the backup code below:
            </p>
            <textarea
              readOnly
              value={backupText}
              style={{
                width: '100%',
                height: '140px',
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'var(--primary)',
                borderRadius: '8px',
                padding: '10px',
                fontSize: '11px',
                fontFamily: 'monospace',
                resize: 'none',
                outline: 'none'
              }}
              onClick={(e) => (e.target as HTMLTextAreaElement).select()}
            />
            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  navigator.clipboard.writeText(backupText);
                  alert('Backup code copied to clipboard! You can save it in any text editor.');
                }}
                style={{ flex: 1, padding: '12px' }}
              >
                📋 Copy Code
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setBackupText(null)}
                style={{ padding: '12px 20px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
