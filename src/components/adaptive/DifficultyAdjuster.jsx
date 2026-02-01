import { useEffect, useState } from 'react';

/**
 * Rule-based adaptive difficulty system
 * Analyzes last 3 exercise results and suggests difficulty adjustments
 */
export function useDifficultyAdjuster(exerciseResults, currentDifficulty, exerciseType) {
  const [suggestedDifficulty, setSuggestedDifficulty] = useState(currentDifficulty);
  const [adaptiveReason, setAdaptiveReason] = useState('');

  useEffect(() => {
    if (!exerciseResults || exerciseResults.length < 3) return;

    // Filter results for current exercise type
    const typeResults = exerciseResults
      .filter(r => r.exercise_type === exerciseType)
      .slice(0, 3); // Last 3 results

    if (typeResults.length < 3) return;

    const avgAccuracy = typeResults.reduce((sum, r) => sum + (r.accuracy || 0), 0) / typeResults.length;
    const avgTime = typeResults.reduce((sum, r) => sum + (r.time_taken_seconds || 0), 0) / typeResults.length;

    // Rule-based difficulty adjustment
    const difficulties = ['beginner', 'intermediate', 'advanced'];
    const currentIndex = difficulties.indexOf(currentDifficulty);

    // Suggest increase if:
    // - Accuracy > 90% consistently
    // - Average response time < 3 seconds
    // - Not already at max difficulty
    if (avgAccuracy > 90 && avgTime < 3 && currentIndex < 2) {
      setSuggestedDifficulty(difficulties[currentIndex + 1]);
      setAdaptiveReason('Your accuracy is excellent! Try a harder level.');
    }
    // Suggest decrease if:
    // - Accuracy < 70% consistently
    // - Not already at min difficulty
    else if (avgAccuracy < 70 && currentIndex > 0) {
      setSuggestedDifficulty(difficulties[currentIndex - 1]);
      setAdaptiveReason('Let\'s try an easier level to build confidence.');
    }
    // Stay at current level
    else {
      setSuggestedDifficulty(currentDifficulty);
      setAdaptiveReason('');
    }
  }, [exerciseResults, currentDifficulty, exerciseType]);

  return { suggestedDifficulty, adaptiveReason };
}

/**
 * Detects learning plateau
 * Returns true if no improvement in last 7 days
 */
export function detectPlateau(exerciseResults, exerciseType) {
  if (!exerciseResults || exerciseResults.length < 10) return false;

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentResults = exerciseResults
    .filter(r => r.exercise_type === exerciseType && new Date(r.created_date) > sevenDaysAgo);

  if (recentResults.length < 5) return false;

  // Split into first half and second half
  const mid = Math.floor(recentResults.length / 2);
  const firstHalf = recentResults.slice(0, mid);
  const secondHalf = recentResults.slice(mid);

  const firstAvg = firstHalf.reduce((sum, r) => sum + (r.accuracy || 0), 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, r) => sum + (r.accuracy || 0), 0) / secondHalf.length;

  // Plateau detected if no improvement (less than 2% increase)
  return secondAvg <= firstAvg + 2;
}

/**
 * Generates personalized recommendations
 */
export function generateRecommendations(exerciseResults, chordMastery) {
  const recommendations = [];

  if (!exerciseResults || exerciseResults.length === 0) {
    return ['Start with beginner interval exercises to build your foundation.'];
  }

  // Analyze weak areas
  const intervalResults = exerciseResults.filter(r => r.exercise_type === 'intervals');
  const chordResults = exerciseResults.filter(r => r.exercise_type === 'chords');
  const scaleResults = exerciseResults.filter(r => r.exercise_type === 'scales');

  const intervalAvg = intervalResults.length > 0 
    ? intervalResults.reduce((sum, r) => sum + (r.accuracy || 0), 0) / intervalResults.length 
    : 0;
  const chordAvg = chordResults.length > 0 
    ? chordResults.reduce((sum, r) => sum + (r.accuracy || 0), 0) / chordResults.length 
    : 0;
  const scaleAvg = scaleResults.length > 0 
    ? scaleResults.reduce((sum, r) => sum + (r.accuracy || 0), 0) / scaleResults.length 
    : 0;

  // Recommend weak areas
  if (intervalAvg > 0 && intervalAvg < 75) {
    recommendations.push('Focus on interval recognition - your accuracy is below 75%');
  }
  if (chordAvg > 0 && chordAvg < 75) {
    recommendations.push('Practice chord identification to improve your accuracy');
  }
  if (scaleAvg > 0 && scaleAvg < 75) {
    recommendations.push('Work on scale recognition exercises');
  }

  // Recommend variety
  if (intervalResults.length > chordResults.length + scaleResults.length) {
    recommendations.push('Try diversifying with chord and scale exercises');
  }

  // Chord mastery recommendations
  if (chordMastery) {
    const weakChords = chordMastery.filter(c => c.mastery_level < 70);
    if (weakChords.length > 0) {
      recommendations.push(`Focus on these chord types: ${weakChords.slice(0, 3).map(c => c.chord_type).join(', ')}`);
    }
  }

  // Time-based recommendation
  const recentResults = exerciseResults.slice(0, 5);
  const avgTime = recentResults.reduce((sum, r) => sum + (r.time_taken_seconds || 0), 0) / recentResults.length;
  if (avgTime > 5) {
    recommendations.push('Try to answer more quickly - speed comes with practice!');
  }

  return recommendations.length > 0 
    ? recommendations 
    : ['Great progress! Continue practicing consistently.'];
}