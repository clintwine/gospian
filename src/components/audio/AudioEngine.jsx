// Audio Engine for generating musical tones using Web Audio API

const NOTE_FREQUENCIES = {
  'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'E3': 164.81,
  'F3': 174.61, 'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00,
  'A#3': 233.08, 'B3': 246.94,
  'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63,
  'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00,
  'A#4': 466.16, 'B4': 493.88,
  'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.25,
  'F5': 698.46, 'F#5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'A5': 880.00,
};

const INTERVALS = [
  { name: 'Unison', semitones: 0 },
  { name: 'Minor 2nd', semitones: 1 },
  { name: 'Major 2nd', semitones: 2 },
  { name: 'Minor 3rd', semitones: 3 },
  { name: 'Major 3rd', semitones: 4 },
  { name: 'Perfect 4th', semitones: 5 },
  { name: 'Tritone', semitones: 6 },
  { name: 'Perfect 5th', semitones: 7 },
  { name: 'Minor 6th', semitones: 8 },
  { name: 'Major 6th', semitones: 9 },
  { name: 'Minor 7th', semitones: 10 },
  { name: 'Major 7th', semitones: 11 },
  { name: 'Octave', semitones: 12 },
];

const BEGINNER_INTERVALS = [0, 2, 4, 5, 7, 12]; // Unison, M2, M3, P4, P5, Octave
const INTERMEDIATE_INTERVALS = [0, 1, 2, 3, 4, 5, 7, 12]; // Add m2, m3
const ADVANCED_INTERVALS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]; // All

let audioContext = null;

export const initAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  return audioContext;
};

export const playTone = (frequency, duration = 0.8, type = 'sine') => {
  const ctx = initAudioContext();
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  // Set oscillator type based on instrument
  if (type === 'piano') {
    oscillator.type = 'triangle';
  } else if (type === 'synth') {
    oscillator.type = 'sawtooth';
  } else if (type === 'guitar') {
    oscillator.type = 'sawtooth';
  } else {
    oscillator.type = 'sine';
  }
  
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
  
  // Envelope varies by instrument type
  gainNode.gain.setValueAtTime(0, ctx.currentTime);
  
  if (type === 'guitar') {
    // Guitar-like pluck: fast attack, medium decay
    gainNode.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
  } else {
    gainNode.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
  }
  
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + duration);
};

export const getNoteFrequency = (baseNote, semitones) => {
  const notes = Object.keys(NOTE_FREQUENCIES);
  const baseIndex = notes.indexOf(baseNote);
  if (baseIndex === -1) return NOTE_FREQUENCIES['C4'];
  
  const targetIndex = baseIndex + semitones;
  if (targetIndex >= 0 && targetIndex < notes.length) {
    return NOTE_FREQUENCIES[notes[targetIndex]];
  }
  // Calculate frequency mathematically if out of range
  return NOTE_FREQUENCIES[baseNote] * Math.pow(2, semitones / 12);
};

export const playInterval = async (semitones, audioType = 'sine', playMode = 'melodic', baseNote = null) => {
  const baseNotes = ['C4', 'D4', 'E4', 'F4', 'G4'];
  const selectedBase = baseNote || baseNotes[Math.floor(Math.random() * baseNotes.length)];
  const baseFreq = NOTE_FREQUENCIES[selectedBase];
  const secondFreq = getNoteFrequency(selectedBase, semitones);
  
  if (playMode === 'harmonic') {
    // Play both notes at the same time
    playTone(baseFreq, 1.2, audioType);
    playTone(secondFreq, 1.2, audioType);
  } else {
    // Play notes sequentially (melodic) - first note, wait, then second note
    playTone(baseFreq, 0.6, audioType);
    await new Promise(resolve => setTimeout(resolve, 900));
    playTone(secondFreq, 0.6, audioType);
  }
  
  return selectedBase;
};

export const getIntervalsByDifficulty = (difficulty) => {
  switch (difficulty) {
    case 'beginner':
      return INTERVALS.filter(i => BEGINNER_INTERVALS.includes(i.semitones));
    case 'intermediate':
      return INTERVALS.filter(i => INTERMEDIATE_INTERVALS.includes(i.semitones));
    case 'advanced':
    default:
      return INTERVALS.filter(i => ADVANCED_INTERVALS.includes(i.semitones));
  }
};

export const generateIntervalQuestion = (difficulty) => {
  const intervals = getIntervalsByDifficulty(difficulty);
  const correctInterval = intervals[Math.floor(Math.random() * intervals.length)];
  
  // Generate 4 options including the correct one
  const options = [correctInterval];
  const otherIntervals = intervals.filter(i => i.semitones !== correctInterval.semitones);
  
  while (options.length < Math.min(4, intervals.length)) {
    const randomInterval = otherIntervals[Math.floor(Math.random() * otherIntervals.length)];
    if (!options.find(o => o.semitones === randomInterval.semitones)) {
      options.push(randomInterval);
    }
  }
  
  // Shuffle options
  options.sort(() => Math.random() - 0.5);
  
  return {
    correctAnswer: correctInterval,
    options,
    semitones: correctInterval.semitones,
  };
};

export const CHORD_TYPES = [
  { name: 'Major', intervals: [0, 4, 7] },
  { name: 'Minor', intervals: [0, 3, 7] },
  { name: 'Diminished', intervals: [0, 3, 6] },
  { name: 'Augmented', intervals: [0, 4, 8] },
  { name: 'Dominant7', intervals: [0, 4, 7, 10] },
  { name: 'Major7', intervals: [0, 4, 7, 11] },
  { name: 'Minor7', intervals: [0, 3, 7, 10] },
  { name: 'HalfDiminished7', intervals: [0, 3, 6, 10] },
  { name: 'Diminished7', intervals: [0, 3, 6, 9] },
];

export const SCALES = [
  { name: 'Major', intervals: [0, 2, 4, 5, 7, 9, 11, 12] },
  { name: 'Natural Minor', intervals: [0, 2, 3, 5, 7, 8, 10, 12] },
  { name: 'Harmonic Minor', intervals: [0, 2, 3, 5, 7, 8, 11, 12] },
  { name: 'Melodic Minor', intervals: [0, 2, 3, 5, 7, 9, 11, 12] },
  { name: 'Dorian', intervals: [0, 2, 3, 5, 7, 9, 10, 12] },
  { name: 'Mixolydian', intervals: [0, 2, 4, 5, 7, 9, 10, 12] },
  { name: 'Pentatonic Major', intervals: [0, 2, 4, 7, 9, 12] },
  { name: 'Pentatonic Minor', intervals: [0, 3, 5, 7, 10, 12] },
];

const getNoteNameFromInterval = (baseNote, semitones) => {
  const allNotes = Object.keys(NOTE_FREQUENCIES);
  const baseIndex = allNotes.indexOf(baseNote);
  if (baseIndex === -1) return null;
  return allNotes[baseIndex + semitones] || null;
};

export const playChord = async (chordType, audioType = 'sine', baseNote = null) => {
  const baseNotes = ['C4', 'D4', 'E4', 'F4', 'G4'];
  const selectedBase = baseNote || baseNotes[Math.floor(Math.random() * baseNotes.length)];
  
  const chord = CHORD_TYPES.find(c => c.name === chordType);
  if (!chord) return selectedBase;
  
  chord.intervals.forEach(semitones => {
    const freq = getNoteFrequency(selectedBase, semitones);
    playTone(freq, 1.5, audioType);
  });
  
  return selectedBase;
};

export const generateChordQuestion = () => {
  const correctChord = CHORD_TYPES[Math.floor(Math.random() * CHORD_TYPES.length)];
  
  return {
    correctAnswer: correctChord,
    options: [...CHORD_TYPES].sort(() => Math.random() - 0.5),
    chordType: correctChord.name,
  };
};

export const playScale = async (scaleType, audioType = 'sine', baseNote = null) => {
  const baseNotes = ['C4', 'D4', 'E4', 'F4', 'G4'];
  const selectedBase = baseNote || baseNotes[Math.floor(Math.random() * baseNotes.length)];
  
  const scale = SCALES.find(s => s.name === scaleType);
  if (!scale) return { playedNotes: [], baseNote: selectedBase };
  
  const playedNotes = [];
  for (const semitones of scale.intervals) {
    const freq = getNoteFrequency(selectedBase, semitones);
    playTone(freq, 0.3, audioType);
    const noteName = getNoteNameFromInterval(selectedBase, semitones);
    if (noteName) playedNotes.push(noteName);
    await new Promise(resolve => setTimeout(resolve, 350));
  }
  
  return { playedNotes, baseNote: selectedBase };
};

export const generateScaleQuestion = (difficulty) => {
  let scalesForDifficulty = SCALES;
  if (difficulty === 'beginner') {
    scalesForDifficulty = SCALES.filter(s => ['Major', 'Natural Minor'].includes(s.name));
  } else if (difficulty === 'intermediate') {
    scalesForDifficulty = SCALES.filter(s => ['Major', 'Natural Minor', 'Harmonic Minor', 'Pentatonic Major', 'Pentatonic Minor'].includes(s.name));
  }
  
  const correctScale = scalesForDifficulty[Math.floor(Math.random() * scalesForDifficulty.length)];
  
  const options = [correctScale];
  const otherScales = scalesForDifficulty.filter(s => s.name !== correctScale.name);
  
  while (options.length < Math.min(4, scalesForDifficulty.length)) {
    const randomScale = otherScales[Math.floor(Math.random() * otherScales.length)];
    if (!options.find(o => o.name === randomScale.name)) {
      options.push(randomScale);
    }
  }
  
  options.sort(() => Math.random() - 0.5);
  
  return {
    correctAnswer: correctScale,
    options,
    scaleType: correctScale.name,
    scaleIntervals: correctScale.intervals,
  };
};

export { INTERVALS };