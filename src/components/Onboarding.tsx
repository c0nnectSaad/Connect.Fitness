'use client';

import React, { useState } from 'react';
import CustomDropdown from './CustomDropdown';

export interface UserStats {
  weightKg: number;
  heightCm: number;
  trainingAge: 'beginner' | 'intermediate' | 'advanced';
  bwr: number;
  proteinGrams: number;
  caloriesBulk: number;
  caloriesCut: number;
  fatsGrams: number;
  waterMl: number;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  targetGoal?: {
    type: 'lose' | 'maintain' | 'gain';
    targetWeightKg: number;
    weeks: number;
    calorieTarget: number;
    proteinTarget: number;
    fatTarget: number;
    carbTarget: number;
  };
}

interface OnboardingProps {
  onComplete: (stats: UserStats) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [weight, setWeight] = useState<string>('70');
  const [height, setHeight] = useState<string>('175');
  const [trainingAge, setTrainingAge] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const w = parseFloat(weight);
    const h = parseFloat(height);

    if (isNaN(w) || w <= 20 || w >= 300) {
      setError('Please enter a valid weight (20kg - 300kg).');
      return;
    }
    if (isNaN(h) || h <= 100 || h >= 250) {
      setError('Please enter a valid height (100cm - 250cm).');
      return;
    }

    const bwr = parseFloat((w / 66).toFixed(2));
    const proteinGrams = Math.round(2 * w);
    const caloriesBulk = Math.round(w * 34); 
    const caloriesCut = Math.round(w * 27); 
    const fatsGrams = parseFloat((0.8 * w).toFixed(1));
    const waterMl = Math.round(w * 37.5); 

    const stats: UserStats = {
      weightKg: w,
      heightCm: h,
      trainingAge,
      bwr,
      proteinGrams,
      caloriesBulk,
      caloriesCut,
      fatsGrams,
      waterMl,
      age: 25, // default
      gender: 'male', // default
      activityLevel: 'moderate' // default
    };

    localStorage.setItem('xivi_user_stats', JSON.stringify(stats));
    onComplete(stats);
  };

  const trainingAgeOptions = [
    { value: 'beginner', label: 'Beginner (<3 months) — Scale load by 0.65x' },
    { value: 'intermediate', label: 'Intermediate (3-12 months) — Scale load by 0.90x' },
    { value: 'advanced', label: 'Advanced (1+ years) — Scale load by 1.00x' }
  ];

  return (
    <div className="onboarding-container fade-in" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '85vh',
      padding: '20px'
    }}>
      <div className="glass-card" style={{ maxWidth: '500px', width: '100%', border: '1px solid rgba(212, 175, 55, 0.25)' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h1 className="text-glow" style={{ color: 'var(--primary)', fontSize: '32px', marginBottom: '8px' }}>Connect.Fitness</h1>
          <p style={{ color: 'var(--muted)', fontSize: '14px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Aesthetic Blueprint Initializer
          </p>
        </div>

        <p style={{ color: '#ffffff', fontSize: '15px', lineHeight: '1.6', marginBottom: '24px', textAlign: 'center' }}>
          Welcome. To personalize your workout loads (weights, sets) and nutrition guidelines, please provide your starting statistics. We only ask this once.
        </p>

        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid var(--error)',
              color: 'var(--error)',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '14px',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          <div className="input-group">
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
            <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Used to calculate your Body Weight Ratio (BWR)</span>
          </div>

          <div className="input-group">
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

          <div className="input-group">
            <label className="input-label">Training Age / Level</label>
            {/* Custom Premium Dropdown replacing Select */}
            <CustomDropdown
              options={trainingAgeOptions}
              value={trainingAge}
              onChange={(val) => setTrainingAge(val)}
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', marginTop: '24px', padding: '14px' }}
          >
            Generate Blueprint
          </button>
        </form>

        <div style={{ marginTop: '24px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px', textAlign: 'center' }}>
          <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
            All calculations scaled dynamically based on formulas in the coaching booklet.
          </span>
        </div>
      </div>
    </div>
  );
}
