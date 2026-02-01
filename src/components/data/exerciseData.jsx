// Predefined exercise data for intervals, chords, and scales
import { expandedIntervals, expandedChords, expandedScales } from './expandedExerciseData';

export const intervalExercises = [
  // A1 (Beginner) - Basic intervals
  {
    id: "int_001",
    type: "intervals",
    level: "beginner",
    question: "Identify the interval between C and D (melodic).",
    options: ["Minor 2nd", "Major 2nd", "Minor 3rd", "Major 3rd"],
    answer: "Major 2nd",
    semitones: 2,
    playMode: "melodic",
    baseNote: "C4",
    notesInfo: "Melodic ascending"
  },
  {
    id: "int_002",
    type: "intervals",
    level: "beginner",
    question: "Identify the harmonic interval between G and B.",
    options: ["Major 3rd", "Perfect 4th", "Minor 3rd", "Perfect 5th"],
    answer: "Major 3rd",
    semitones: 4,
    playMode: "harmonic",
    baseNote: "G4",
    notesInfo: "Harmonic (played together)"
  },
  {
    id: "int_003",
    type: "intervals",
    level: "beginner",
    question: "Identify the interval between E and F (melodic).",
    options: ["Minor 2nd", "Major 2nd", "Perfect 4th", "Perfect 5th"],
    answer: "Minor 2nd",
    semitones: 1,
    playMode: "melodic",
    baseNote: "E4",
    notesInfo: "Melodic ascending"
  },
  {
    id: "int_004",
    type: "intervals",
    level: "beginner",
    question: "Identify the interval between C and E (melodic).",
    options: ["Minor 3rd", "Major 3rd", "Perfect 4th", "Major 2nd"],
    answer: "Major 3rd",
    semitones: 4,
    playMode: "melodic",
    baseNote: "C4",
    notesInfo: "Melodic ascending"
  },
  {
    id: "int_005",
    type: "intervals",
    level: "beginner",
    question: "Identify the interval between C and F (harmonic).",
    options: ["Major 3rd", "Perfect 4th", "Perfect 5th", "Minor 3rd"],
    answer: "Perfect 4th",
    semitones: 5,
    playMode: "harmonic",
    baseNote: "C4",
    notesInfo: "Harmonic"
  },
  {
    id: "int_006",
    type: "intervals",
    level: "beginner",
    question: "Identify the interval between C and G (melodic).",
    options: ["Perfect 4th", "Perfect 5th", "Major 6th", "Octave"],
    answer: "Perfect 5th",
    semitones: 7,
    playMode: "melodic",
    baseNote: "C4",
    notesInfo: "Melodic ascending"
  },
  {
    id: "int_007",
    type: "intervals",
    level: "beginner",
    question: "Identify the interval between C and C (octave, melodic).",
    options: ["Perfect 5th", "Major 6th", "Major 7th", "Octave"],
    answer: "Octave",
    semitones: 12,
    playMode: "melodic",
    baseNote: "C4",
    notesInfo: "Melodic ascending"
  },
  // A2 (Intermediate) - More complex intervals
  {
    id: "int_008",
    type: "intervals",
    level: "intermediate",
    question: "Identify the interval between C and G (harmonic).",
    options: ["Perfect 4th", "Perfect 5th", "Major 6th", "Octave"],
    answer: "Perfect 5th",
    semitones: 7,
    playMode: "harmonic",
    baseNote: "C4",
    notesInfo: "Harmonic"
  },
  {
    id: "int_009",
    type: "intervals",
    level: "intermediate",
    question: "Identify the interval between A and F (melodic).",
    options: ["Minor 6th", "Major 6th", "Perfect 5th", "Minor 7th"],
    answer: "Minor 6th",
    semitones: 8,
    playMode: "melodic",
    baseNote: "A3",
    notesInfo: "Melodic ascending"
  },
  {
    id: "int_010",
    type: "intervals",
    level: "intermediate",
    question: "Identify the interval between D and B (melodic).",
    options: ["Perfect 5th", "Major 6th", "Minor 6th", "Major 7th"],
    answer: "Major 6th",
    semitones: 9,
    playMode: "melodic",
    baseNote: "D4",
    notesInfo: "Melodic ascending"
  },
  {
    id: "int_011",
    type: "intervals",
    level: "intermediate",
    question: "Identify the harmonic interval between E and D.",
    options: ["Major 6th", "Minor 7th", "Major 7th", "Octave"],
    answer: "Minor 7th",
    semitones: 10,
    playMode: "harmonic",
    baseNote: "E4",
    notesInfo: "Harmonic"
  },
  {
    id: "int_012",
    type: "intervals",
    level: "intermediate",
    question: "Identify the interval between C and A (melodic).",
    options: ["Perfect 5th", "Minor 6th", "Major 6th", "Minor 7th"],
    answer: "Major 6th",
    semitones: 9,
    playMode: "melodic",
    baseNote: "C4",
    notesInfo: "Melodic ascending"
  },
  // A3 (Advanced) - All intervals including tritone
  {
    id: "int_013",
    type: "intervals",
    level: "advanced",
    question: "Identify the interval between F and B (melodic).",
    options: ["Perfect 4th", "Tritone", "Perfect 5th", "Major 3rd"],
    answer: "Tritone",
    semitones: 6,
    playMode: "melodic",
    baseNote: "F4",
    notesInfo: "Melodic ascending (augmented 4th/diminished 5th)"
  },
  {
    id: "int_014",
    type: "intervals",
    level: "advanced",
    question: "Identify the harmonic interval between C and B.",
    options: ["Minor 7th", "Major 7th", "Octave", "Major 6th"],
    answer: "Major 7th",
    semitones: 11,
    playMode: "harmonic",
    baseNote: "C4",
    notesInfo: "Harmonic"
  },
  {
    id: "int_015",
    type: "intervals",
    level: "advanced",
    question: "Identify the interval between G and F (melodic).",
    options: ["Major 6th", "Minor 7th", "Major 7th", "Minor 6th"],
    answer: "Minor 7th",
    semitones: 10,
    playMode: "melodic",
    baseNote: "G4",
    notesInfo: "Melodic ascending"
  },
  {
    id: "int_016",
    type: "intervals",
    level: "advanced",
    question: "Identify the harmonic interval between A and G#.",
    options: ["Minor 7th", "Major 7th", "Octave", "Major 6th"],
    answer: "Major 7th",
    semitones: 11,
    playMode: "harmonic",
    baseNote: "A3",
    notesInfo: "Harmonic"
  },
];

export const chordExercises = [
  // A1 (Beginner) - Basic triads
  {
    id: "chord_001",
    type: "chords",
    level: "beginner",
    question: "Identify the chord: C - E - G",
    options: ["C Major", "C Minor", "C Diminished", "C Augmented"],
    answer: "C Major",
    chordType: "Major",
    baseNote: "C4",
    notesInfo: "Triad, root position"
  },
  {
    id: "chord_002",
    type: "chords",
    level: "beginner",
    question: "Identify the chord: A - C - E",
    options: ["A Major", "A Minor", "A Diminished", "A Augmented"],
    answer: "A Minor",
    chordType: "Minor",
    baseNote: "A3",
    notesInfo: "Triad, root position"
  },
  {
    id: "chord_003",
    type: "chords",
    level: "beginner",
    question: "Identify the chord: G - B - D",
    options: ["G Major", "G Minor", "G Diminished", "G Augmented"],
    answer: "G Major",
    chordType: "Major",
    baseNote: "G4",
    notesInfo: "Triad, root position"
  },
  {
    id: "chord_004",
    type: "chords",
    level: "beginner",
    question: "Identify the chord: D - F - A",
    options: ["D Major", "D Minor", "D Diminished", "D Augmented"],
    answer: "D Minor",
    chordType: "Minor",
    baseNote: "D4",
    notesInfo: "Triad, root position"
  },
  {
    id: "chord_005",
    type: "chords",
    level: "beginner",
    question: "Identify the chord: E - G - B",
    options: ["E Major", "E Minor", "E Diminished", "E Augmented"],
    answer: "E Minor",
    chordType: "Minor",
    baseNote: "E4",
    notesInfo: "Triad, root position"
  },
  {
    id: "chord_006",
    type: "chords",
    level: "beginner",
    question: "Identify the chord: F - A - C",
    options: ["F Major", "F Minor", "F Diminished", "F Augmented"],
    answer: "F Major",
    chordType: "Major",
    baseNote: "F4",
    notesInfo: "Triad, root position"
  },
  // A2 (Intermediate) - Diminished, Augmented, and 7th chords
  {
    id: "chord_007",
    type: "chords",
    level: "intermediate",
    question: "Identify the chord: B - D - F",
    options: ["B Major", "B Minor", "B Diminished", "B Augmented"],
    answer: "B Diminished",
    chordType: "Diminished",
    baseNote: "B3",
    notesInfo: "Diminished triad"
  },
  {
    id: "chord_008",
    type: "chords",
    level: "intermediate",
    question: "Identify the chord: C - E - G#",
    options: ["C Major", "C Minor", "C Diminished", "C Augmented"],
    answer: "C Augmented",
    chordType: "Augmented",
    baseNote: "C4",
    notesInfo: "Augmented triad"
  },
  {
    id: "chord_009",
    type: "chords",
    level: "intermediate",
    question: "Identify the chord: G - B - D - F",
    options: ["G7", "Gmaj7", "Gm7", "Gdim7"],
    answer: "G7",
    chordType: "Dominant7",
    baseNote: "G4",
    notesInfo: "Dominant 7th"
  },
  {
    id: "chord_010",
    type: "chords",
    level: "intermediate",
    question: "Identify the chord: F - A - C - E",
    options: ["Fmaj7", "F7", "Fm7", "Fdim7"],
    answer: "Fmaj7",
    chordType: "Major7",
    baseNote: "F4",
    notesInfo: "Major 7th"
  },
  // A3 (Advanced) - All 7th chord types
  {
    id: "chord_011",
    type: "chords",
    level: "advanced",
    question: "Identify the chord: D - F - A - C",
    options: ["D7", "Dmaj7", "Dm7", "Ddim7"],
    answer: "Dm7",
    chordType: "Minor7",
    baseNote: "D4",
    notesInfo: "Minor 7th"
  },
  {
    id: "chord_012",
    type: "chords",
    level: "advanced",
    question: "Identify the chord: C - E - G - B",
    options: ["C7", "Cmaj7", "Cm7", "Cdim7"],
    answer: "Cmaj7",
    chordType: "Major7",
    baseNote: "C4",
    notesInfo: "Major 7th"
  },
  {
    id: "chord_013",
    type: "chords",
    level: "advanced",
    question: "Identify the chord: A - C - E - G",
    options: ["A7", "Amaj7", "Am7", "Adim7"],
    answer: "Am7",
    chordType: "Minor7",
    baseNote: "A3",
    notesInfo: "Minor 7th"
  },
  {
    id: "chord_014",
    type: "chords",
    level: "advanced",
    question: "Identify the chord: B - D - F - A",
    options: ["Bm7", "B7", "Bm7b5", "Bdim7"],
    answer: "Bm7b5",
    chordType: "HalfDiminished7",
    baseNote: "B3",
    notesInfo: "Half-diminished 7th (m7b5)"
  },
];

export const scaleExercises = [
  // A1 (Beginner) - Major and Natural Minor
  {
    id: "scale_001",
    type: "scales",
    level: "beginner",
    question: "Identify the scale: C - D - E - F - G - A - B - C",
    options: ["C Major", "C Natural Minor", "C Harmonic Minor", "C Melodic Minor"],
    answer: "C Major",
    scaleType: "Major",
    baseNote: "C4",
    notesInfo: "Ascending"
  },
  {
    id: "scale_002",
    type: "scales",
    level: "beginner",
    question: "Identify the scale: A - B - C - D - E - F - G - A",
    options: ["A Major", "A Natural Minor", "A Harmonic Minor", "A Dorian"],
    answer: "A Natural Minor",
    scaleType: "Natural Minor",
    baseNote: "A3",
    notesInfo: "Ascending"
  },
  {
    id: "scale_003",
    type: "scales",
    level: "beginner",
    question: "Identify the scale: G - A - B - C - D - E - F# - G",
    options: ["G Major", "G Natural Minor", "G Dorian", "G Mixolydian"],
    answer: "G Major",
    scaleType: "Major",
    baseNote: "G4",
    notesInfo: "Ascending"
  },
  {
    id: "scale_004",
    type: "scales",
    level: "beginner",
    question: "Identify the scale: D - E - F - G - A - Bb - C - D",
    options: ["D Major", "D Natural Minor", "D Harmonic Minor", "D Dorian"],
    answer: "D Natural Minor",
    scaleType: "Natural Minor",
    baseNote: "D4",
    notesInfo: "Ascending"
  },
  // A2 (Intermediate) - Harmonic Minor, Pentatonics
  {
    id: "scale_005",
    type: "scales",
    level: "intermediate",
    question: "Identify the scale: A - B - C - D - E - F - G# - A",
    options: ["A Major", "A Natural Minor", "A Harmonic Minor", "A Melodic Minor"],
    answer: "A Harmonic Minor",
    scaleType: "Harmonic Minor",
    baseNote: "A3",
    notesInfo: "Ascending"
  },
  {
    id: "scale_006",
    type: "scales",
    level: "intermediate",
    question: "Identify the scale: C - D - E - G - A - C",
    options: ["C Major", "C Pentatonic Major", "C Pentatonic Minor", "C Dorian"],
    answer: "C Pentatonic Major",
    scaleType: "Pentatonic Major",
    baseNote: "C4",
    notesInfo: "Ascending (5 notes)"
  },
  {
    id: "scale_007",
    type: "scales",
    level: "intermediate",
    question: "Identify the scale: A - C - D - E - G - A",
    options: ["A Natural Minor", "A Pentatonic Major", "A Pentatonic Minor", "A Dorian"],
    answer: "A Pentatonic Minor",
    scaleType: "Pentatonic Minor",
    baseNote: "A3",
    notesInfo: "Ascending (5 notes)"
  },
  {
    id: "scale_008",
    type: "scales",
    level: "intermediate",
    question: "Identify the scale: E - F# - G - A - B - C - D# - E",
    options: ["E Major", "E Natural Minor", "E Harmonic Minor", "E Melodic Minor"],
    answer: "E Harmonic Minor",
    scaleType: "Harmonic Minor",
    baseNote: "E4",
    notesInfo: "Ascending"
  },
  // A3 (Advanced) - Modes and Melodic Minor
  {
    id: "scale_009",
    type: "scales",
    level: "advanced",
    question: "Identify the scale: D - E - F - G - A - B - C - D",
    options: ["D Natural Minor", "D Dorian", "D Phrygian", "D Mixolydian"],
    answer: "D Dorian",
    scaleType: "Dorian",
    baseNote: "D4",
    notesInfo: "Ascending (mode of C Major)"
  },
  {
    id: "scale_010",
    type: "scales",
    level: "advanced",
    question: "Identify the scale: G - A - B - C - D - E - F - G",
    options: ["G Major", "G Dorian", "G Mixolydian", "G Natural Minor"],
    answer: "G Mixolydian",
    scaleType: "Mixolydian",
    baseNote: "G4",
    notesInfo: "Ascending (mode of C Major)"
  },
  {
    id: "scale_011",
    type: "scales",
    level: "advanced",
    question: "Identify the scale: A - B - C - D - E - F# - G# - A",
    options: ["A Major", "A Natural Minor", "A Harmonic Minor", "A Melodic Minor"],
    answer: "A Melodic Minor",
    scaleType: "Melodic Minor",
    baseNote: "A3",
    notesInfo: "Ascending"
  },
  {
    id: "scale_012",
    type: "scales",
    level: "advanced",
    question: "Identify the scale: E - F# - G - A - B - C# - D - E",
    options: ["E Major", "E Dorian", "E Mixolydian", "E Natural Minor"],
    answer: "E Dorian",
    scaleType: "Dorian",
    baseNote: "E4",
    notesInfo: "Ascending"
  },
];

// Helper function to get exercises by type and level
export const getExercises = (type, level) => {
  let exercises = [];
  
  if (type === 'intervals') {
    exercises = intervalExercises;
  } else if (type === 'chords') {
    exercises = chordExercises;
  } else if (type === 'scales') {
    exercises = scaleExercises;
  }
  
  if (level && level !== 'all') {
    exercises = exercises.filter(e => e.level === level);
  }
  
  return exercises;
};

// Get a random exercise from a set (enhanced with expanded data)
export const getRandomExercise = (type, level) => {
  let exercises = getExercises(type, level);
  
  // Add expanded exercises for better variety
  if (type === 'intervals' && expandedIntervals[level]) {
    const expandedExs = expandedIntervals[level].map(interval => ({
      type: 'intervals',
      level,
      answer: interval.name,
      semitones: interval.semitones,
      options: generateIntervalOptions(interval.name, level),
      playMode: Math.random() > 0.5 ? 'melodic' : 'harmonic',
      baseNote: 'C4'
    }));
    exercises = [...exercises, ...expandedExs];
  }
  
  if (type === 'chords' && expandedChords[level]) {
    const expandedExs = expandedChords[level].map(chord => ({
      type: 'chords',
      level,
      answer: chord.name,
      chordType: chord.name,
      options: generateChordOptions(chord.name, level),
      baseNote: 'C4'
    }));
    exercises = [...exercises, ...expandedExs];
  }
  
  if (type === 'scales' && expandedScales[level]) {
    const expandedExs = expandedScales[level].map(scale => ({
      type: 'scales',
      level,
      answer: scale.name,
      scaleType: scale.name,
      options: generateScaleOptions(scale.name, level),
      baseNote: 'C4'
    }));
    exercises = [...exercises, ...expandedExs];
  }
  
  if (exercises.length === 0) return null;
  return exercises[Math.floor(Math.random() * exercises.length)];
};

// Helper functions for generating options
function generateIntervalOptions(correctAnswer, level) {
  const allIntervals = {
    beginner: ['Unison', 'Major 2nd', 'Major 3rd', 'Perfect 4th', 'Perfect 5th', 'Octave'],
    intermediate: ['Minor 2nd', 'Major 2nd', 'Minor 3rd', 'Major 3rd', 'Perfect 4th', 'Tritone', 'Perfect 5th', 'Minor 6th', 'Major 6th'],
    advanced: ['Minor 7th', 'Major 7th', 'Minor 9th', 'Major 9th', 'Perfect 11th', 'Minor 13th', 'Major 13th']
  };
  
  const pool = allIntervals[level] || allIntervals.beginner;
  const wrong = pool.filter(i => i !== correctAnswer).sort(() => 0.5 - Math.random()).slice(0, 3);
  return [correctAnswer, ...wrong].sort(() => 0.5 - Math.random());
}

function generateChordOptions(correctAnswer, level) {
  const allChords = {
    beginner: ['Major', 'Minor', 'Diminished', 'Augmented'],
    intermediate: ['Major 7th', 'Minor 7th', 'Dominant 7th', 'Sus2', 'Sus4'],
    advanced: ['Major 9th', 'Minor 9th', 'Dominant 13th', 'Altered Dominant', 'Half Diminished 7th']
  };
  
  const pool = allChords[level] || allChords.beginner;
  const wrong = pool.filter(c => c !== correctAnswer).sort(() => 0.5 - Math.random()).slice(0, 3);
  return [correctAnswer, ...wrong].sort(() => 0.5 - Math.random());
}

function generateScaleOptions(correctAnswer, level) {
  const allScales = {
    beginner: ['Major', 'Natural Minor', 'Pentatonic Major', 'Pentatonic Minor'],
    intermediate: ['Harmonic Minor', 'Melodic Minor', 'Dorian', 'Mixolydian'],
    advanced: ['Whole Tone', 'Diminished', 'Blues Scale', 'Lydian Dominant', 'Super Locrian']
  };
  
  const pool = allScales[level] || allScales.beginner;
  const wrong = pool.filter(s => s !== correctAnswer).sort(() => 0.5 - Math.random()).slice(0, 3);
  return [correctAnswer, ...wrong].sort(() => 0.5 - Math.random());
}