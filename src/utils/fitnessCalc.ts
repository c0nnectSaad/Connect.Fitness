import { UserStats } from '../components/Onboarding';

export interface TargetGoalInfo {
  type: 'lose' | 'maintain' | 'gain';
  targetWeightKg: number;
  weeks: number;
  calorieTarget: number;
  proteinTarget: number;
  fatTarget: number;
  carbTarget: number;
}

/**
 * Calculates Basal Metabolic Rate (BMR) using the Mifflin-St Jeor formula.
 */
export function calculateBMR(weightKg: number, heightCm: number, age: number, gender: 'male' | 'female' | 'other'): number {
  if (gender === 'male') {
    return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + 5);
  } else if (gender === 'female') {
    return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age - 161);
  } else {
    // Other / average
    return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age - 78);
  }
}

/**
 * Calculates Total Daily Energy Expenditure (TDEE) based on BMR and Activity Level.
 */
export function calculateTDEE(bmr: number, activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'): number {
  const multipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9
  };
  return Math.round(bmr * multipliers[activityLevel]);
}

/**
 * Recalculates all derived user statistics when their baseline attributes change.
 */
export function recalculateUserStats(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: 'male' | 'female' | 'other',
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active',
  trainingAge: 'beginner' | 'intermediate' | 'advanced',
  targetGoal?: Omit<TargetGoalInfo, 'calorieTarget' | 'proteinTarget' | 'fatTarget' | 'carbTarget'> | null
): UserStats {
  const bwr = parseFloat((weightKg / 66).toFixed(2));
  const proteinGrams = Math.round(2 * weightKg);
  const fatsGrams = parseFloat((0.8 * weightKg).toFixed(1));
  const waterMl = Math.round(weightKg * 37.5);
  
  // Standard bulk/cut estimations
  const caloriesBulk = Math.round(weightKg * 34);
  const caloriesCut = Math.round(weightKg * 27);

  const stats: UserStats = {
    weightKg,
    heightCm,
    age,
    gender,
    activityLevel,
    trainingAge,
    bwr,
    proteinGrams,
    fatsGrams,
    waterMl,
    caloriesBulk,
    caloriesCut
  };

  // If there's an active target goal, compute the target calories & macros
  if (targetGoal) {
    const bmr = calculateBMR(weightKg, heightCm, age, gender);
    const tdee = calculateTDEE(bmr, activityLevel);
    
    // Weight diff
    const weightDiff = weightKg - targetGoal.targetWeightKg;
    
    // 7700 kcal per kg of body fat. Daily deficit/surplus is weightDiff * 7700 / (weeks * 7)
    // Positive weightDiff means we want to lose weight (need a deficit)
    // Negative weightDiff means we want to gain weight (need a surplus)
    const totalDays = Math.max(1, targetGoal.weeks * 7);
    const dailyCalorieDiff = (weightDiff * 7700) / totalDays;
    
    let calorieTarget = Math.round(tdee - dailyCalorieDiff);
    
    // Safety caps
    const minSafeCalories = gender === 'female' ? 1200 : gender === 'male' ? 1500 : 1200;
    if (calorieTarget < minSafeCalories) {
      calorieTarget = minSafeCalories;
    }

    // Recalculate macro targets for the goal
    // Protein: 2.0g per kg of body weight (4 kcal/g)
    // Fat: 0.8g per kg of body weight (9 kcal/g)
    // Carbs: remaining calories (4 kcal/g)
    const proteinTarget = Math.round(2 * weightKg);
    const fatTarget = Math.round(0.8 * weightKg);
    const remainingCalories = calorieTarget - (proteinTarget * 4) - (fatTarget * 9);
    const carbTarget = Math.max(50, Math.round(remainingCalories / 4)); // minimum 50g carbs

    stats.targetGoal = {
      type: targetGoal.type,
      targetWeightKg: targetGoal.targetWeightKg,
      weeks: targetGoal.weeks,
      calorieTarget,
      proteinTarget,
      fatTarget,
      carbTarget
    };
  }

  return stats;
}

/**
 * Gets the date object adjusted for the 3am day roll-over.
 * If the current local time is before 3am, it returns the date object for yesterday.
 */
export function getTrackingDate(): Date {
  const now = new Date();
  if (now.getHours() < 3) {
    now.setDate(now.getDate() - 1);
  }
  return now;
}

/**
 * Gets the YYYY-MM-DD date string for tracking, adjusted for 3am.
 */
export function getTrackingDateString(): string {
  const date = getTrackingDate();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Gets the day of the week name, adjusted for 3am.
 */
export function getTrackingDayOfWeek(): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[getTrackingDate().getDay()];
}

