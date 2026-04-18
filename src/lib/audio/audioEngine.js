/**
 * Gospian Audio Engine - Singleton
 * Sample-based audio using Tone.js.
 * All audio in the app MUST go through this module.
 */
import * as Tone from 'tone';

// ─── Sample sources ───────────────────────────────────────────────────────────
// Using alternative soundfont CDN (gleitz CDN is down, using backup)
const SF_CDN = 'https://cdn.jsdelivr.net/npm/@ledfx/soundfonts@1.0.0/samples/';

// Notes we load for each instrument (sparse set — Tone.Sampler interpolates between them)
const PIANO_NOTES = {
  'A0': `${SF_CDN}piano/A0.mp3`,
  'C2': `${SF_CDN}piano/C2.mp3`,
  'Ds2': `${SF_CDN}piano/Ds2.mp3`,
  'Fs2': `${SF_CDN}piano/Fs2.mp3`,
  'A2': `${SF_CDN}piano/A2.mp3`,
  'C3': `${SF_CDN}piano/C3.mp3`,
  'Ds3': `${SF_CDN}piano/Ds3.mp3`,
  'Fs3': `${SF_CDN}piano/Fs3.mp3`,
  'A3': `${SF_CDN}piano/A3.mp3`,
  'C4': `${SF_CDN}piano/C4.mp3`,
  'Ds4': `${SF_CDN}piano/Ds4.mp3`,
  'Fs4': `${SF_CDN}piano/Fs4.mp3`,
  'A4': `${SF_CDN}piano/A4.mp3`,
  'C5': `${SF_CDN}piano/C5.mp3`,
  'Ds5': `${SF_CDN}piano/Ds5.mp3`,
  'Fs5': `${SF_CDN}piano/Fs5.mp3`,
  'A5': `${SF_CDN}piano/A5.mp3`,
  'C6': `${SF_CDN}piano/C6.mp3`,
  'Ds6': `${SF_CDN}piano/Ds6.mp3`,
  'Fs6': `${SF_CDN}piano/Fs6.mp3`,
  'A6': `${SF_CDN}piano/A6.mp3`,
  'C7': `${SF_CDN}piano/C7.mp3`,
  'C8': `${SF_CDN}piano/C8.mp3`,
};

const RHODES_NOTES = {
  'A1': `${SF_CDN}electric_piano_1-mp3/A1.mp3`,
  'C2': `${SF_CDN}electric_piano_1-mp3/C2.mp3`,
  'Ds2': `${SF_CDN}electric_piano_1-mp3/Ds2.mp3`,
  'Fs2': `${SF_CDN}electric_piano_1-mp3/Fs2.mp3`,
  'A2': `${SF_CDN}electric_piano_1-mp3/A2.mp3`,
  'C3': `${SF_CDN}electric_piano_1-mp3/C3.mp3`,
  'Ds3': `${SF_CDN}electric_piano_1-mp3/Ds3.mp3`,
  'Fs3': `${SF_CDN}electric_piano_1-mp3/Fs3.mp3`,
  'A3': `${SF_CDN}electric_piano_1-mp3/A3.mp3`,
  'C4': `${SF_CDN}electric_piano_1-mp3/C4.mp3`,
  'Ds4': `${SF_CDN}electric_piano_1-mp3/Ds4.mp3`,
  'Fs4': `${SF_CDN}electric_piano_1-mp3/Fs4.mp3`,
  'A4': `${SF_CDN}electric_piano_1-mp3/A4.mp3`,
  'C5': `${SF_CDN}electric_piano_1-mp3/C5.mp3`,
  'Ds5': `${SF_CDN}electric_piano_1-mp3/Ds5.mp3`,
  'A5': `${SF_CDN}electric_piano_1-mp3/A5.mp3`,
  'C6': `${SF_CDN}electric_piano_1-mp3/C6.mp3`,
};

const ORGAN_NOTES = {
  'C2': `${SF_CDN}drawbar_organ-mp3/C2.mp3`,
  'Ds2': `${SF_CDN}drawbar_organ-mp3/Ds2.mp3`,
  'Fs2': `${SF_CDN}drawbar_organ-mp3/Fs2.mp3`,
  'A2': `${SF_CDN}drawbar_organ-mp3/A2.mp3`,
  'C3': `${SF_CDN}drawbar_organ-mp3/C3.mp3`,
  'Ds3': `${SF_CDN}drawbar_organ-mp3/Ds3.mp3`,
  'Fs3': `${SF_CDN}drawbar_organ-mp3/Fs3.mp3`,
  'A3': `${SF_CDN}drawbar_organ-mp3/A3.mp3`,
  'C4': `${SF_CDN}drawbar_organ-mp3/C4.mp3`,
  'Ds4': `${SF_CDN}drawbar_organ-mp3/Ds4.mp3`,
  'Fs4': `${SF_CDN}drawbar_organ-mp3/Fs4.mp3`,
  'A4': `${SF_CDN}drawbar_organ-mp3/A4.mp3`,
  'C5': `${SF_CDN}drawbar_organ-mp3/C5.mp3`,
  'Fs5': `${SF_CDN}drawbar_organ-mp3/Fs5.mp3`,
  'C6': `${SF_CDN}drawbar_organ-mp3/C6.mp3`,
};

const UPRIGHT_NOTES = {
  'A0': `${SF_CDN}acoustic_bass-mp3/A0.mp3`,
  'C2': `${SF_CDN}bright_acoustic_piano-mp3/C2.mp3`,
  'Ds2': `${SF_CDN}bright_acoustic_piano-mp3/Ds2.mp3`,
  'Fs2': `${SF_CDN}bright_acoustic_piano-mp3/Fs2.mp3`,
  'A2': `${SF_CDN}bright_acoustic_piano-mp3/A2.mp3`,
  'C3': `${SF_CDN}bright_acoustic_piano-mp3/C3.mp3`,
  'Ds3': `${SF_CDN}bright_acoustic_piano-mp3/Ds3.mp3`,
  'Fs3': `${SF_CDN}bright_acoustic_piano-mp3/Fs3.mp3`,
  'A3': `${SF_CDN}bright_acoustic_piano-mp3/A3.mp3`,
  'C4': `${SF_CDN}bright_acoustic_piano-mp3/C4.mp3`,
  'Ds4': `${SF_CDN}bright_acoustic_piano-mp3/Ds4.mp3`,
  'Fs4': `${SF_CDN}bright_acoustic_piano-mp3/Fs4.mp3`,
  'A4': `${SF_CDN}bright_acoustic_piano-mp3/A4.mp3`,
  'C5': `${SF_CDN}bright_acoustic_piano-mp3/C5.mp3`,
  'A5': `${SF_CDN}bright_acoustic_piano-mp3/A5.mp3`,
  'C6': `${SF_CDN}bright_acoustic_piano-mp3/C6.mp3`,
};

// ─── Instrument definitions ───────────────────────────────────────────────────
const INSTRUMENT_DEFS = {
  piano:   { label: 'Grand Piano',       urls: PIANO_NOTES,   release: 1.2,  curve: 'exponential', postFx: null },
  rhodes:  { label: 'Rhodes Electric',   urls: RHODES_NOTES,  release: 2.5,  curve: 'exponential', postFx: 'chorus' },
  organ:   { label: 'Hammond B3 Organ',  urls: ORGAN_NOTES,   release: 0.05, curve: 'linear',      postFx: 'organ' },
  upright: { label: 'Upright Piano',     urls: UPRIGHT_NOTES, release: 0.4,  curve: 'exponential', postFx: null },
};

// ─── MIDI utilities ───────────────────────────────────────────────────────────
export const midiToNoteName = (midi) => {
  const names = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  const octave = Math.floor(midi / 12) - 1;
  return `${names[midi % 12]}${octave}`;
};

export const noteNameToMidi = (name) => {
  const notes = { C:0,'C#':1,Db:1,D:2,'D#':3,Eb:3,E:4,F:5,'F#':6,Gb:6,G:7,'G#':8,Ab:8,A:9,'A#':10,Bb:10,B:11 };
  const match = name.match(/^([A-G][b#]?)(\d+)$/);
  if (!match) return 60;
  return notes[match[1]] + (parseInt(match[2]) + 1) * 12;
};

export const FLAT_KEYS_MIDI  = [65, 70, 63, 68, 61, 66]; // F Bb Eb Ab Db Gb
export const SHARP_KEYS_MIDI = [67, 62, 69, 64, 71, 66]; // G D A E B F#
export const ALL_KEYS_MIDI   = [60,61,62,63,64,65,66,67,68,69,70,71]; // C..B in oct4

// ─── Signal chain ─────────────────────────────────────────────────────────────
let compressor = null;
let reverb     = null;
let limiter    = null;
let sampler    = null;
let synth      = null;
let chorus     = null;
let organDist  = null;

// Sustained drone — using oscillators so it's truly continuous
let droneOsc   = null;
let droneGain  = null;
let droneFilter= null;

let currentInstrument = 'piano';
let isInitialized     = false;
let audioUnlocked     = false;

function buildChain() {
  compressor = new Tone.Compressor({ threshold: -18, ratio: 4, attack: 0.003, release: 0.25 });
  reverb     = new Tone.Reverb({ decay: 1.8, wet: 0.15, preDelay: 0.02 });
  limiter    = new Tone.Limiter(-1);
  chorus     = new Tone.Chorus(3, 2.5, 0.4).start();
  organDist  = new Tone.Distortion(0.12);

  compressor.connect(reverb);
  reverb.connect(limiter);
  limiter.toDestination();

  // Rhodes: sampler → chorus → compressor
  chorus.connect(compressor);
  // Organ: sampler → organDist → compressor
  organDist.connect(compressor);
}

async function buildSampler(instrumentKey) {
  const def = INSTRUMENT_DEFS[instrumentKey] || INSTRUMENT_DEFS.piano;

  // Convert note names to what Tone.Sampler expects (e.g. Ds4 → D#4)
  const toneUrls = {};
  Object.entries(def.urls).forEach(([k, v]) => {
    const key = k.replace('s', '#'); // Ds4 → D#4
    toneUrls[key] = v;
  });

  return new Promise((resolve, reject) => {
    const s = new Tone.Sampler({
      urls:    toneUrls,
      release: def.release,
      curve:   def.curve,
      onload:  () => {
        // Ensure buffers are truly loaded
        setTimeout(() => resolve(s), 100);
      },
      onerror: (e) => {
        console.warn('Sampler load error (some samples may be missing):', e);
        // Don't resolve here — create fallback synth instead
        reject(e);
      },
    });

    if (instrumentKey === 'rhodes') {
      s.connect(chorus);
    } else if (instrumentKey === 'organ') {
      s.connect(organDist);
    } else {
      s.connect(compressor);
    }
  });
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function init(progressCallback) {
  if (isInitialized) return;
  await Tone.start();
  audioUnlocked = true;
  
  // Ensure transport is started
  if (Tone.Transport.state !== 'running') {
    Tone.Transport.start();
  }

  buildChain();
  await reverb.ready;

  progressCallback?.(10);
  
  // Try to load sampler, fall back to synth if it fails
  try {
    sampler = await buildSampler(currentInstrument);
  } catch (e) {
    console.log('Sampler failed, using fallback synth');
    synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 1 },
    });
    synth.connect(compressor);
  }
  
  progressCallback?.(100);

  isInitialized = true;
}

export function isReady()        { return isInitialized && !!sampler; }
export function isAudioUnlocked() { return audioUnlocked; }

export async function loadInstrument(name) {
  if (!INSTRUMENT_DEFS[name]) return;
  if (name === currentInstrument && sampler) return;
  const old = sampler;
  currentInstrument = name;
  sampler = await buildSampler(name);
  if (old) { try { old.dispose(); } catch {} }
}

export function getCurrentInstrument() { return currentInstrument; }

function hv(base = 0.75) {
  return Math.min(1, Math.max(0.05, base + (Math.random() - 0.5) * 0.16));
}

export function playNote(midi, { duration = '2n', velocity = 0.75, time } = {}) {
  if (!isInitialized) return;
  try {
    // Ensure audio context is running
    if (Tone.Transport.state !== 'running') {
      Tone.Transport.start();
    }
    const note = midiToNoteName(Math.max(21, Math.min(108, midi)));
    const t = time ?? Tone.now();
    
    // Use sampler if available, otherwise use synth
    if (sampler) {
      sampler.triggerAttackRelease(note, duration, t, hv(velocity));
    } else if (synth) {
      synth.triggerAttackRelease(note, duration, t, hv(velocity));
    }
  } catch (e) {
    console.warn('Playback error:', e.message);
  }
}

export function playChordMidi(midiArray, { duration = '2n', velocity = 0.75, arpeggiate = false } = {}) {
  if (!isInitialized) return;
  try {
    const now = Tone.now();
    midiArray.forEach((midi, i) => {
      const t = arpeggiate ? now + i * (0.002 + Math.random() * 0.006) : now;
      playNote(midi, { duration, velocity, time: t });
    });
  } catch (e) {
    console.warn('Chord playback error:', e.message);
  }
}

export async function playInterval(rootMidi, semitones, { mode = 'melodic-asc' } = {}) {
  if (!sampler) return;
  const top = rootMidi + semitones;
  if (mode === 'harmonic') {
    playChordMidi([rootMidi, top], { duration: '2n', velocity: 0.75 });
  } else if (mode === 'melodic-desc') {
    playNote(top,      { duration: '4n', velocity: 0.75 });
    await delay(650);
    playNote(rootMidi, { duration: '4n', velocity: 0.75 });
  } else {
    playNote(rootMidi, { duration: '4n', velocity: 0.75 });
    await delay(650);
    playNote(top,      { duration: '4n', velocity: 0.75 });
  }
}

export async function playProgression(chords, { bpm = 72, velocity = 0.75 } = {}) {
  if (!sampler) return;
  const secPerBeat = 60 / bpm;
  for (const chord of chords) {
    playChordMidi(chord, { duration: '2n', velocity, arpeggiate: true });
    await delay(secPerBeat * 2 * 1000);
  }
}

export async function playCadence(rootMidi, velocity = 0.5) {
  if (!sampler) return;
  const I  = [rootMidi,   rootMidi+4,  rootMidi+7];
  const IV = [rootMidi+5, rootMidi+9,  rootMidi+12];
  const V  = [rootMidi+7, rootMidi+11, rootMidi+14];
  await playProgression([I, IV, V, I], { bpm: 80, velocity });
}

// ─── Gospel voicings ──────────────────────────────────────────────────────────
/**
 * True gospel shell+UST voicing.
 * LH: [root(oct2), 3rd(oct3), 7th(oct3)] — shell voicing
 * RH: upper structure triad [9th(oct4), 11th(oct4), 13th(oct5)] when available
 */
export function buildGospelVoicing(rootMidi, chordIntervals) {
  // Anchor root in octave 3 range (MIDI ~48-60)
  let root = rootMidi;
  // Normalize root to octave 3 area
  while (root > 60) root -= 12;
  while (root < 48) root += 12;

  // LH shell: root (one octave below), third, seventh
  const hasThird   = chordIntervals.includes(4) || chordIntervals.includes(3);
  const hasSeventh = chordIntervals.includes(10) || chordIntervals.includes(11);

  const lhRoot  = root - 12; // octave below
  const lhThird = hasThird   ? root + (chordIntervals.includes(4) ? 4 : 3) : null;
  const lhSev   = hasSeventh ? root + (chordIntervals.includes(11) ? 11 : 10) : null;

  const lh = [lhRoot, lhThird, lhSev].filter(n => n !== null);

  // RH upper structure: 9th, 11th/4th, 13th/6th in octave above root
  const rhBase = root + 12;
  const rh = [];
  if (chordIntervals.includes(14)) rh.push(rhBase + 2);   // 9th
  else rh.push(rhBase + 2);                               // add 9 anyway for colour

  if (chordIntervals.includes(17) || chordIntervals.includes(5)) rh.push(rhBase + 5); // 11th
  if (chordIntervals.includes(21) || chordIntervals.includes(9)) rh.push(rhBase + 9); // 13th
  else if (chordIntervals.includes(7)) rh.push(rhBase + 7); // 5th as fallback

  return [...lh, ...rh];
}

// ─── Drone — truly continuous via oscillator (no pulsing) ─────────────────────
export function playDrone(midi, { gain = 0.18 } = {}) {
  stopDrone();
  if (!limiter) return;

  const freq = Tone.Frequency(midiToNoteName(midi)).toFrequency();

  droneFilter = new Tone.Filter(800, 'lowpass');
  droneGain   = new Tone.Gain(gain);

  // Fundamental + soft octave above for warmth
  droneOsc = new Tone.OmniOscillator({ type: 'sine', frequency: freq }).start();
  const osc2 = new Tone.OmniOscillator({ type: 'sine', frequency: freq * 2 }).start();
  const g2   = new Tone.Gain(0.3);

  osc2.connect(g2);
  g2.connect(droneFilter);
  droneOsc.connect(droneFilter);
  droneFilter.connect(droneGain);
  droneGain.connect(limiter);

  // Store osc2 for cleanup
  droneOsc._osc2 = osc2;
  droneOsc._g2   = g2;
}

export function stopDrone() {
  try {
    if (droneOsc) {
      droneOsc._osc2?.stop();
      droneOsc._osc2?.dispose();
      droneOsc._g2?.dispose();
      droneOsc.stop();
      droneOsc.dispose();
    }
    droneFilter?.dispose();
    droneGain?.dispose();
  } catch {}
  droneOsc = droneGain = droneFilter = null;
}

export function stopAll() {
  stopDrone();
  try { sampler?.releaseAll(); } catch {}
}

// ─── Chord / scale / interval vocabulary ─────────────────────────────────────
export const CHORD_TYPES = [
  { name: 'Major',           intervals: [0,4,7] },
  { name: 'Minor',           intervals: [0,3,7] },
  { name: 'Diminished',      intervals: [0,3,6] },
  { name: 'Augmented',       intervals: [0,4,8] },
  { name: 'Dominant7',       intervals: [0,4,7,10] },
  { name: 'Major7',          intervals: [0,4,7,11] },
  { name: 'Minor7',          intervals: [0,3,7,10] },
  { name: 'HalfDiminished7', intervals: [0,3,6,10] },
  { name: 'Diminished7',     intervals: [0,3,6,9] },
  { name: 'maj9',            intervals: [0,4,7,11,14] },
  { name: 'maj13',           intervals: [0,4,7,11,14,21] },
  { name: 'min9',            intervals: [0,3,7,10,14] },
  { name: 'min11',           intervals: [0,3,7,10,14,17] },
  { name: 'dom7b9',          intervals: [0,4,7,10,13] },
  { name: 'dom7#9',          intervals: [0,4,7,10,15] },
  { name: 'dom7#11',         intervals: [0,4,7,10,18] },
  // dom7alt: root, M3, b7, b9, #9 — NO perfect 5th
  { name: 'dom7alt',         intervals: [0,4,10,13,15] },
  { name: 'dom13',           intervals: [0,4,7,10,14,21] },
  { name: 'sus2',            intervals: [0,2,7] },
  { name: 'sus4',            intervals: [0,5,7] },
  { name: '7sus4',           intervals: [0,5,7,10] },
  { name: 'm7b5',            intervals: [0,3,6,10] },
  { name: 'dim7',            intervals: [0,3,6,9] },
  { name: 'add9',            intervals: [0,4,7,14] },
  { name: '6',               intervals: [0,4,7,9] },
  { name: 'm6',              intervals: [0,3,7,9] },
];

export const GOSPEL_PROGRESSIONS = [
  { name: '2-5-1',            degrees: [2,5,1] },
  { name: '1-6-2-5',          degrees: [1,6,2,5] },
  { name: '3-6-2-5',          degrees: [3,6,2,5] },
  { name: 'Backdoor 2-5',     degrees: [7,1],   desc: 'bVII7→I' },
  { name: 'Tritone Sub 2-5',  degrees: [6,5,1], desc: 'bII7→I' },
  { name: '1-4-1-5',          degrees: [1,4,1,5] },
  { name: '6-2-5-1',          degrees: [6,2,5,1] },
  { name: 'Chromatic Walk-up',degrees: [1,2,3,4], desc: 'I-#Idim-IIm-IV' },
];

export const INTERVALS = [
  { name: 'Unison',     semitones: 0  },
  { name: 'Minor 2nd',  semitones: 1  },
  { name: 'Major 2nd',  semitones: 2  },
  { name: 'Minor 3rd',  semitones: 3  },
  { name: 'Major 3rd',  semitones: 4  },
  { name: 'Perfect 4th',semitones: 5  },
  { name: 'Tritone',    semitones: 6  },
  { name: 'Perfect 5th',semitones: 7  },
  { name: 'Minor 6th',  semitones: 8  },
  { name: 'Major 6th',  semitones: 9  },
  { name: 'Minor 7th',  semitones: 10 },
  { name: 'Major 7th',  semitones: 11 },
  { name: 'Octave',     semitones: 12 },
];

export const SCALES = [
  { name: 'Major',            intervals: [0,2,4,5,7,9,11,12] },
  { name: 'Natural Minor',    intervals: [0,2,3,5,7,8,10,12] },
  { name: 'Harmonic Minor',   intervals: [0,2,3,5,7,8,11,12] },
  { name: 'Melodic Minor',    intervals: [0,2,3,5,7,9,11,12] },
  { name: 'Dorian',           intervals: [0,2,3,5,7,9,10,12] },
  { name: 'Mixolydian',       intervals: [0,2,4,5,7,9,10,12] },
  { name: 'Pentatonic Major', intervals: [0,2,4,7,9,12] },
  { name: 'Pentatonic Minor', intervals: [0,3,5,7,10,12] },
];

// ─── SM-2 adaptive weights ────────────────────────────────────────────────────
export function sm2Weight(accuracyHistory = []) {
  if (accuracyHistory.length === 0) return 1;
  const recent = accuracyHistory.slice(-10);
  const avg = recent.reduce((a,b) => a+b, 0) / recent.length;
  if (avg >= 90) return 0.1;
  if (avg >= 70) return 0.5;
  return 1.0;
}

export function weightedPick(items, weightFn) {
  const weights = items.map(weightFn);
  const total   = weights.reduce((a,b) => a+b, 0);
  let rand = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    rand -= weights[i];
    if (rand <= 0) return items[i];
  }
  return items[items.length - 1];
}

export function delay(ms) { return new Promise(r => setTimeout(r, ms)); }