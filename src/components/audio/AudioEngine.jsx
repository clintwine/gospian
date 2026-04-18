/**
 * AudioEngine.jsx — DEPRECATED SHIM
 * All audio now goes through lib/audio/audioEngine.js (Tone.js singleton).
 * This file re-exports everything callers need so existing imports don't break.
 *
 * NO createOscillator or new AudioContext anywhere in this file.
 */
export {
  CHORD_TYPES,
  INTERVALS,
  SCALES,
  GOSPEL_PROGRESSIONS,
  buildGospelVoicing,
  midiToNoteName,
  noteNameToMidi,
  ALL_KEYS_MIDI,
  FLAT_KEYS_MIDI,
  sm2Weight,
  weightedPick,
  delay,
} from '@/lib/audio/audioEngine';

import {
  playNote,
  playChordMidi,
  playInterval as _playInterval,
  playCadence,
  midiToNoteName,
  noteNameToMidi,
  CHORD_TYPES,
  SCALES,
} from '@/lib/audio/audioEngine';

// ─── Legacy API shims ─────────────────────────────────────────────────────────

/** initAudioContext shim — no-op; engine inits via AudioProvider on first gesture */
export function initAudioContext() {}

/** getNoteFrequency shim — returns MIDI number as a proxy "frequency" */
export function getNoteFrequency(baseNote, semitones = 0) {
  return noteNameToMidi(baseNote) + semitones;
}

/** playTone shim — delegates to Tone.js sampler */
export function playTone(midiOrFreq, duration = 0.8, _type = 'piano') {
  let midi = Math.round(midiOrFreq);
  // Detect if it's a Hz frequency (values < 20 are clearly MIDI, 20–108 ambiguous, >108 is Hz)
  if (midiOrFreq > 108) {
    midi = Math.round(12 * Math.log2(midiOrFreq / 440) + 69);
  }
  midi = Math.max(21, Math.min(108, midi));
  playNote(midi, { duration: `${duration}s`, velocity: 0.75 });
}

/** playInterval shim */
export async function playInterval(semitones, _audioType = 'piano', playMode = 'melodic', baseNote = null) {
  const rootMidi = baseNote ? noteNameToMidi(baseNote) : 60;
  const mode = playMode === 'harmonic' ? 'harmonic' : 'melodic-asc';
  await _playInterval(rootMidi, semitones, { mode });
  return baseNote || 'C4';
}

/** playChord shim */
export async function playChord(chordType, _audioType = 'piano', baseNote = null) {
  const rootMidi = baseNote ? noteNameToMidi(baseNote) : 60;
  const chord = CHORD_TYPES.find(c => c.name === chordType);
  if (!chord) return baseNote || 'C4';
  const midiArr = chord.intervals.map(s => rootMidi + s);
  playChordMidi(midiArr, { duration: '2n', velocity: 0.75, arpeggiate: true });
  return baseNote || 'C4';
}

/** playScale shim */
export async function playScale(scaleType, _audioType = 'piano', baseNote = null) {
  const rootMidi = baseNote ? noteNameToMidi(baseNote) : 60;
  const scale = SCALES.find(s => s.name === scaleType);
  if (!scale) return { playedNotes: [], baseNote: baseNote || 'C4' };
  for (const s of scale.intervals) {
    playNote(rootMidi + s, { duration: '8n', velocity: 0.7 });
    await new Promise(r => setTimeout(r, 350));
  }
  return {
    playedNotes: scale.intervals.map(s => midiToNoteName(rootMidi + s)),
    baseNote: baseNote || 'C4',
  };
}

// These are no longer needed but exported to avoid import errors in old files
export function getIntervalsByDifficulty() { return []; }
export function generateIntervalQuestion() { return null; }
export function generateChordQuestion() { return null; }
export function generateScaleQuestion() { return null; }