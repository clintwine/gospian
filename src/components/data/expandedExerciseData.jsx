// Expanded exercise data with 100+ exercises across all categories

export const expandedIntervals = {
  beginner: [
    // Perfect intervals
    { name: 'Unison', semitones: 0, category: 'perfect' },
    { name: 'Perfect 4th', semitones: 5, category: 'perfect' },
    { name: 'Perfect 5th', semitones: 7, category: 'perfect' },
    { name: 'Octave', semitones: 12, category: 'perfect' },
    // Major intervals
    { name: 'Major 2nd', semitones: 2, category: 'major' },
    { name: 'Major 3rd', semitones: 4, category: 'major' },
    { name: 'Major 6th', semitones: 9, category: 'major' },
    { name: 'Major 7th', semitones: 11, category: 'major' },
  ],
  intermediate: [
    // Minor intervals
    { name: 'Minor 2nd', semitones: 1, category: 'minor' },
    { name: 'Minor 3rd', semitones: 3, category: 'minor' },
    { name: 'Minor 6th', semitones: 8, category: 'minor' },
    { name: 'Minor 7th', semitones: 10, category: 'minor' },
    // Augmented/Diminished
    { name: 'Tritone', semitones: 6, category: 'augmented' },
    { name: 'Augmented 4th', semitones: 6, category: 'augmented' },
    { name: 'Diminished 5th', semitones: 6, category: 'diminished' },
  ],
  advanced: [
    // Compound intervals
    { name: 'Minor 9th', semitones: 13, category: 'compound' },
    { name: 'Major 9th', semitones: 14, category: 'compound' },
    { name: 'Minor 10th', semitones: 15, category: 'compound' },
    { name: 'Major 10th', semitones: 16, category: 'compound' },
    { name: 'Perfect 11th', semitones: 17, category: 'compound' },
    { name: 'Augmented 11th', semitones: 18, category: 'compound' },
    { name: 'Perfect 12th', semitones: 19, category: 'compound' },
    { name: 'Minor 13th', semitones: 20, category: 'compound' },
    { name: 'Major 13th', semitones: 21, category: 'compound' },
  ]
};

export const expandedChords = {
  beginner: [
    { name: 'Major', intervals: [0, 4, 7], symbol: 'maj' },
    { name: 'Minor', intervals: [0, 3, 7], symbol: 'm' },
    { name: 'Diminished', intervals: [0, 3, 6], symbol: 'dim' },
    { name: 'Augmented', intervals: [0, 4, 8], symbol: 'aug' },
  ],
  intermediate: [
    { name: 'Major 7th', intervals: [0, 4, 7, 11], symbol: 'maj7' },
    { name: 'Minor 7th', intervals: [0, 3, 7, 10], symbol: 'm7' },
    { name: 'Dominant 7th', intervals: [0, 4, 7, 10], symbol: '7' },
    { name: 'Half Diminished 7th', intervals: [0, 3, 6, 10], symbol: 'm7♭5' },
    { name: 'Diminished 7th', intervals: [0, 3, 6, 9], symbol: 'dim7' },
    { name: 'Sus2', intervals: [0, 2, 7], symbol: 'sus2' },
    { name: 'Sus4', intervals: [0, 5, 7], symbol: 'sus4' },
  ],
  advanced: [
    { name: 'Major 9th', intervals: [0, 4, 7, 11, 14], symbol: 'maj9' },
    { name: 'Minor 9th', intervals: [0, 3, 7, 10, 14], symbol: 'm9' },
    { name: 'Dominant 9th', intervals: [0, 4, 7, 10, 14], symbol: '9' },
    { name: 'Major 11th', intervals: [0, 4, 7, 11, 14, 17], symbol: 'maj11' },
    { name: 'Minor 11th', intervals: [0, 3, 7, 10, 14, 17], symbol: 'm11' },
    { name: 'Dominant 13th', intervals: [0, 4, 7, 10, 14, 21], symbol: '13' },
    { name: 'Altered Dominant', intervals: [0, 4, 8, 10, 13], symbol: '7alt' },
    { name: 'Minor Major 7th', intervals: [0, 3, 7, 11], symbol: 'mMaj7' },
  ]
};

export const expandedScales = {
  beginner: [
    { name: 'Major', pattern: [0, 2, 4, 5, 7, 9, 11], mode: 'ionian' },
    { name: 'Natural Minor', pattern: [0, 2, 3, 5, 7, 8, 10], mode: 'aeolian' },
    { name: 'Pentatonic Major', pattern: [0, 2, 4, 7, 9], mode: 'pentatonic' },
    { name: 'Pentatonic Minor', pattern: [0, 3, 5, 7, 10], mode: 'pentatonic' },
  ],
  intermediate: [
    { name: 'Harmonic Minor', pattern: [0, 2, 3, 5, 7, 8, 11], mode: 'harmonic' },
    { name: 'Melodic Minor', pattern: [0, 2, 3, 5, 7, 9, 11], mode: 'melodic' },
    { name: 'Dorian', pattern: [0, 2, 3, 5, 7, 9, 10], mode: 'dorian' },
    { name: 'Phrygian', pattern: [0, 1, 3, 5, 7, 8, 10], mode: 'phrygian' },
    { name: 'Lydian', pattern: [0, 2, 4, 6, 7, 9, 11], mode: 'lydian' },
    { name: 'Mixolydian', pattern: [0, 2, 4, 5, 7, 9, 10], mode: 'mixolydian' },
    { name: 'Locrian', pattern: [0, 1, 3, 5, 6, 8, 10], mode: 'locrian' },
  ],
  advanced: [
    { name: 'Whole Tone', pattern: [0, 2, 4, 6, 8, 10], mode: 'symmetrical' },
    { name: 'Diminished (Half-Whole)', pattern: [0, 1, 3, 4, 6, 7, 9, 10], mode: 'symmetrical' },
    { name: 'Diminished (Whole-Half)', pattern: [0, 2, 3, 5, 6, 8, 9, 11], mode: 'symmetrical' },
    { name: 'Blues Scale', pattern: [0, 3, 5, 6, 7, 10], mode: 'blues' },
    { name: 'Lydian Dominant', pattern: [0, 2, 4, 6, 7, 9, 10], mode: 'melodic_minor_mode' },
    { name: 'Super Locrian', pattern: [0, 1, 3, 4, 6, 8, 10], mode: 'melodic_minor_mode' },
    { name: 'Hungarian Minor', pattern: [0, 2, 3, 6, 7, 8, 11], mode: 'exotic' },
    { name: 'Phrygian Dominant', pattern: [0, 1, 4, 5, 7, 8, 10], mode: 'exotic' },
  ]
};

export const rhythmPatterns = {
  beginner: [
    { name: 'Whole Note', pattern: [1], duration: 4 },
    { name: 'Half Notes', pattern: [1, 1], duration: 2 },
    { name: 'Quarter Notes', pattern: [1, 1, 1, 1], duration: 1 },
    { name: 'Eighth Notes', pattern: [1, 1, 1, 1, 1, 1, 1, 1], duration: 0.5 },
  ],
  intermediate: [
    { name: 'Dotted Quarter', pattern: [1.5, 0.5, 1, 1], duration: 1 },
    { name: 'Syncopation', pattern: [0.5, 1, 0.5, 1, 1], duration: 1 },
    { name: 'Triplets', pattern: [0.33, 0.33, 0.33], duration: 1 },
    { name: 'Mixed Rhythm', pattern: [1, 0.5, 0.5, 1, 1], duration: 1 },
  ],
  advanced: [
    { name: 'Complex Syncopation', pattern: [0.5, 0.25, 0.75, 1, 0.5], duration: 1 },
    { name: 'Polyrhythm 3:2', pattern: [0.66, 0.66, 0.66], duration: 1 },
    { name: 'Quintuplets', pattern: [0.2, 0.2, 0.2, 0.2, 0.2], duration: 1 },
    { name: 'Jazz Swing', pattern: [0.66, 0.33, 0.66, 0.33], duration: 1 },
  ]
};

export const melodyPatterns = {
  beginner: [
    { name: 'Ascending Scale', notes: [0, 2, 4, 5, 7], direction: 'ascending' },
    { name: 'Descending Scale', notes: [7, 5, 4, 2, 0], direction: 'descending' },
    { name: 'Arpeggio Up', notes: [0, 4, 7, 12], direction: 'ascending' },
    { name: 'Simple Skip', notes: [0, 4, 2, 5, 0], direction: 'mixed' },
  ],
  intermediate: [
    { name: 'Chromatic Run', notes: [0, 1, 2, 3, 4, 5], direction: 'ascending' },
    { name: 'Leap and Step', notes: [0, 7, 5, 4, 7], direction: 'mixed' },
    { name: 'Sequence Pattern', notes: [0, 2, 4, 2, 4, 6, 4], direction: 'ascending' },
    { name: 'Modal Melody', notes: [0, 2, 3, 5, 7, 8], direction: 'ascending' },
  ],
  advanced: [
    { name: 'Jazz Line', notes: [0, 4, 7, 11, 9, 7, 5], direction: 'mixed' },
    { name: 'Chromatic Approach', notes: [0, 3, 4, 7, 6, 5, 4], direction: 'mixed' },
    { name: 'Wide Interval Leaps', notes: [0, 12, 5, 9, 2], direction: 'mixed' },
    { name: 'Complex Phrase', notes: [0, 2, 4, 3, 7, 5, 9, 7, 4], direction: 'mixed' },
  ]
};

// Achievement definitions
export const achievementDefinitions = [
  // Milestone achievements
  { id: 'first_exercise', title: 'First Steps', description: 'Complete your first exercise', icon: 'Target', category: 'milestone', rarity: 'common' },
  { id: 'exercise_10', title: 'Getting Started', description: 'Complete 10 exercises', icon: 'TrendingUp', category: 'milestone', rarity: 'common' },
  { id: 'exercise_50', title: 'Dedicated Learner', description: 'Complete 50 exercises', icon: 'Award', category: 'milestone', rarity: 'rare' },
  { id: 'exercise_100', title: 'Century Club', description: 'Complete 100 exercises', icon: 'Trophy', category: 'milestone', rarity: 'epic' },
  { id: 'exercise_500', title: 'Master Trainee', description: 'Complete 500 exercises', icon: 'Crown', category: 'milestone', rarity: 'legendary' },
  
  // Streak achievements
  { id: 'streak_3', title: 'Consistent', description: '3 day streak', icon: 'Flame', category: 'streak', rarity: 'common' },
  { id: 'streak_7', title: 'Week Warrior', description: '7 day streak', icon: 'Flame', category: 'streak', rarity: 'rare' },
  { id: 'streak_30', title: 'Monthly Master', description: '30 day streak', icon: 'Flame', category: 'streak', rarity: 'epic' },
  { id: 'streak_100', title: 'Unstoppable', description: '100 day streak', icon: 'Flame', category: 'streak', rarity: 'legendary' },
  
  // Accuracy achievements
  { id: 'perfect_1', title: 'Perfectionist', description: 'Get 100% accuracy once', icon: 'CheckCircle', category: 'accuracy', rarity: 'common' },
  { id: 'perfect_10', title: 'Precision Expert', description: 'Get 100% accuracy 10 times', icon: 'Target', category: 'accuracy', rarity: 'rare' },
  { id: 'perfect_50', title: 'Perfect Form', description: 'Get 100% accuracy 50 times', icon: 'Award', category: 'accuracy', rarity: 'epic' },
  
  // Speed achievements
  { id: 'speed_demon', title: 'Speed Demon', description: 'Complete exercise in under 30 seconds', icon: 'Zap', category: 'speed', rarity: 'rare' },
  { id: 'lightning_fast', title: 'Lightning Fast', description: 'Average response time under 2 seconds', icon: 'Zap', category: 'speed', rarity: 'epic' },
  
  // Mastery achievements
  { id: 'interval_master', title: 'Interval Master', description: 'Complete 50 interval exercises with 90%+ accuracy', icon: 'Music2', category: 'mastery', rarity: 'epic' },
  { id: 'chord_master', title: 'Chord Master', description: 'Complete 50 chord exercises with 90%+ accuracy', icon: 'Music', category: 'mastery', rarity: 'epic' },
  { id: 'scale_master', title: 'Scale Master', description: 'Complete 50 scale exercises with 90%+ accuracy', icon: 'Music4', category: 'mastery', rarity: 'epic' },
  
  // Social achievements
  { id: 'social_butterfly', title: 'Social Butterfly', description: 'Add 5 friends', icon: 'Users', category: 'social', rarity: 'common' },
  { id: 'challenge_winner', title: 'Challenge Champion', description: 'Win 10 friend challenges', icon: 'Trophy', category: 'social', rarity: 'rare' },
  
  // Special achievements
  { id: 'early_bird', title: 'Early Bird', description: 'Practice before 7am', icon: 'Sunrise', category: 'special', rarity: 'rare' },
  { id: 'night_owl', title: 'Night Owl', description: 'Practice after 11pm', icon: 'Moon', category: 'special', rarity: 'rare' },
  { id: 'level_10', title: 'Double Digits', description: 'Reach level 10', icon: 'Star', category: 'special', rarity: 'rare' },
  { id: 'level_25', title: 'Quarter Century', description: 'Reach level 25', icon: 'Star', category: 'special', rarity: 'epic' },
  { id: 'level_50', title: 'Legendary Status', description: 'Reach level 50', icon: 'Crown', category: 'special', rarity: 'legendary' },
];