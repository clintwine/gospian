/**
 * Gospian Audio Engine - Singleton
 * Sample-based audio using Tone.js + Salamander Grand Piano
 * All audio in the app MUST go through this module.
 * No createOscillator or new AudioContext anywhere else.
 */
import * as Tone from 'tone';

// ─── Salamander sample URLs ───────────────────────────────────────────────────
const SALAMANDER_BASE = 'https://tonejs.github.io/audio/salamander/';
const SALAMANDER_NOTES = [
  'A0','C1','Ds1','Fs1','A1','C2','Ds2','Fs2','A2',
  'C3','Ds3','Fs3','A3','C4','Ds4','Fs4','A4',
  'C5','Ds5','Fs5','A5','C6','Ds6','Fs6','A6',
  'C7','Ds7','Fs7','A7','C8'
];

function buildSalamanderUrls() {
  const urls = {};
  SALAMANDER_NOTES.forEach(n => {
    // Tone.Sampler uses scientific notation: Ds4 → D#4
    const toneName = n.replace('s', '#');
    urls[toneName] = `${SALAMANDER_BASE}${n}v8.mp3`;
  });
  return urls;
}

// ─── Instrument definitions ───────────────────────────────────────────────────
const INSTRUMENT_DEFS = {
  piano: {
    label: 'Grand Piano',
    urls: buildSalamanderUrls(),
    baseUrl: '',
    release: 1,
    curve: 'exponential',
  },
  rhodes: {
    label: 'Rhodes Electric',
    // Fallback to a different octave mapping with Salamander (warm + slight chorus)
    urls: buildSalamanderUrls(),
    baseUrl: '',
    release: 0.8,
    curve: 'exponential',
    postFx: 'chorus',
  },
  organ: {
    label: 'Hammond B3 Organ',
    urls: buildSalamanderUrls(),
    baseUrl: '',
    release: 0.05,
    curve: 'linear',
    postFx: 'organ',
  },
  upright: {
    label: 'Upright Piano',
    urls: buildSalamanderUrls(),
    baseUrl: '',
    release: 0.5,
    curve: 'exponential',
  },
};

// ─── MIDI utilities ───────────────────────────────────────────────────────────
export const midiToNoteName = (midi) => {
  const names = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  const octave = Math.floor(midi / 12) - 1;
  const note = names[midi % 12];
  return `${note}${octave}`;
};

export const noteNameToMidi = (name) => {
  const notes = { C:0,'C#':1,Db:1,D:2,'D#':3,Eb:3,E:4,F:5,'F#':6,Gb:6,G:7,'G#':8,Ab:8,A:9,'A#':10,Bb:10,B:11 };
  const match = name.match(/^([A-G][b#]?)(\d+)$/);
  if (!match) return 60;
  return notes[match[1]] + (parseInt(match[2]) + 1) * 12;
};

// All 12 chromatic root names for exercises
export const ALL_ROOTS_MIDI = {
  'C':  60, 'C#': 61, 'Db': 61, 'D':  62, 'D#': 63, 'Eb': 63,
  'E':  64, 'F':  65, 'F#': 66, 'Gb': 66, 'G':  67, 'G#': 68,
  'Ab': 68, 'A':  69, 'A#': 70, 'Bb': 70, 'B':  71,
};

export const FLAT_KEYS_MIDI  = [65,70,63,68,61,66]; // F,Bb,Eb,Ab,Db,Gb
export const SHARP_KEYS_MIDI = [67,62,69,64,71,66]; // G,D,A,E,B,F#
export const ALL_KEYS_MIDI   = Object.values(ALL_ROOTS_MIDI).filter((v,i,a)=>a.indexOf(v)===i);

// ─── Signal chain ─────────────────────────────────────────────────────────────
let compressor  = null;
let reverb      = null;
let limiter     = null;
let sampler     = null;
let dronePlayer = null;
let chorus      = null;
let organDist   = null;

let currentInstrument = 'piano';
let isInitialized     = false;
let loadProgress      = 0;
let onProgressCb      = null;
let audioUnlocked     = false;

function buildChain() {
  compressor = new Tone.Compressor({ threshold: -18, ratio: 4, attack: 0.003, release: 0.25 });
  reverb     = new Tone.Reverb({ decay: 1.8, wet: 0.18, preDelay: 0.02 });
  limiter    = new Tone.Limiter(-1);
  chorus     = new Tone.Chorus(3, 2.5, 0.35).start();
  organDist  = new Tone.Distortion(0.15);
  compressor.connect(reverb);
  reverb.connect(limiter);
  limiter.toDestination();
}

function samplerInput(instrumentKey) {
  if (instrumentKey === 'rhodes') return chorus;
  if (instrumentKey === 'organ')  return organDist;
  return compressor;
}

async function buildSampler(instrumentKey) {
  const def = INSTRUMENT_DEFS[instrumentKey] || INSTRUMENT_DEFS.piano;

  return new Promise((resolve, reject) => {
    const s = new Tone.Sampler({
      urls:    def.urls,
      baseUrl: def.baseUrl,
      release: def.release,
      curve:   def.curve,
      onload:  () => resolve(s),
      onerror: reject,
    });
    // Route rhodes/organ through their FX first
    if (instrumentKey === 'rhodes') {
      s.connect(chorus);
      chorus.connect(compressor);
    } else if (instrumentKey === 'organ') {
      s.connect(organDist);
      organDist.connect(compressor);
    } else {
      s.connect(compressor);
    }
  });
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** Call once on first user gesture — resumes AudioContext for iOS */
export async function init(progressCallback) {
  if (isInitialized) return;
  onProgressCb = progressCallback || null;
  await Tone.start();
  audioUnlocked = true;

  buildChain();

  await reverb.ready; // pre-compute impulse

  loadProgress = 0;
  if (onProgressCb) onProgressCb(5);

  sampler = await buildSampler(currentInstrument);
  loadProgress = 100;
  if (onProgressCb) onProgressCb(100);

  isInitialized = true;
}

export function isReady() { return isInitialized && !!sampler; }
export function isAudioUnlocked() { return audioUnlocked; }

/** Switch instrument without reloading the page */
export async function loadInstrument(name) {
  if (!isInitialized) return;
  if (name === currentInstrument && sampler) return;
  const old = sampler;
  currentInstrument = name;
  sampler = await buildSampler(name);
  if (old) old.dispose();
}

export function getCurrentInstrument() { return currentInstrument; }

/** Humanize velocity */
function hv(base = 0.75) {
  return Math.min(1, Math.max(0.05, base + (Math.random() - 0.5) * 0.16));
}

/** Play a single note by MIDI number */
export function playNote(midi, { duration = '2n', velocity = 0.75, time = Tone.now() } = {}) {
  if (!sampler) return;
  const note = midiToNoteName(Math.max(21, Math.min(108, midi)));
  sampler.triggerAttackRelease(note, duration, time, hv(velocity));
}

/** Play a chord — array of MIDI numbers */
export function playChordMidi(midiArray, { duration = '2n', velocity = 0.75, arpeggiate = false } = {}) {
  if (!sampler) return;
  const now = Tone.now();
  midiArray.forEach((midi, i) => {
    const t = arpeggiate ? now + i * (0.002 + Math.random() * 0.006) : now;
    playNote(midi, { duration, velocity, time: t });
  });
}

/** Play an interval */
export async function playInterval(rootMidi, semitones, { mode = 'melodic-asc' } = {}) {
  if (!sampler) return;
  const top = rootMidi + semitones;
  if (mode === 'harmonic') {
    playChordMidi([rootMidi, top], { duration: '2n', velocity: 0.75, arpeggiate: false });
  } else if (mode === 'melodic-desc') {
    playNote(top,     { duration: '4n', velocity: 0.75 });
    await delay(650);
    playNote(rootMidi,{ duration: '4n', velocity: 0.75 });
  } else {
    playNote(rootMidi,{ duration: '4n', velocity: 0.75 });
    await delay(650);
    playNote(top,     { duration: '4n', velocity: 0.75 });
  }
}

/** Play a chord progression */
export async function playProgression(chords, { bpm = 72, velocity = 0.75 } = {}) {
  if (!sampler) return;
  const secPerBeat = 60 / bpm;
  for (const chord of chords) {
    playChordMidi(chord, { duration: '2n', velocity, arpeggiate: true });
    await delay(secPerBeat * 2 * 1000);
  }
}

/** Cadence: I–IV–V–I in given root (MIDI) at low velocity */
export async function playCadence(rootMidi, velocity = 0.5) {
  if (!sampler) return;
  const I   = [rootMidi, rootMidi+4, rootMidi+7];
  const IV  = [rootMidi+5, rootMidi+9, rootMidi+12];
  const V   = [rootMidi+7, rootMidi+11, rootMidi+14];
  await playProgression([I, IV, V, I], { bpm: 80, velocity });
}

/** Drone on a MIDI note */
let droneInterval = null;
export function playDrone(midi, { gain = 0.25 } = {}) {
  stopDrone();
  const note = midiToNoteName(midi);
  sampler.triggerAttack(note, Tone.now(), gain);
  // retrigger every 4s to sustain
  droneInterval = setInterval(() => {
    if (sampler) sampler.triggerAttack(note, Tone.now(), gain * 0.6);
  }, 4000);
}

export function stopDrone() {
  if (droneInterval) { clearInterval(droneInterval); droneInterval = null; }
  if (sampler) sampler.releaseAll();
}

export function stopAll() {
  stopDrone();
  if (sampler) sampler.releaseAll();
}

// ─── Gospel chord vocabulary ──────────────────────────────────────────────────
export const CHORD_TYPES = [
  { name: 'Major',          intervals: [0,4,7] },
  { name: 'Minor',          intervals: [0,3,7] },
  { name: 'Diminished',     intervals: [0,3,6] },
  { name: 'Augmented',      intervals: [0,4,8] },
  { name: 'Dominant7',      intervals: [0,4,7,10] },
  { name: 'Major7',         intervals: [0,4,7,11] },
  { name: 'Minor7',         intervals: [0,3,7,10] },
  { name: 'HalfDiminished7',intervals: [0,3,6,10] },
  { name: 'Diminished7',    intervals: [0,3,6,9] },
  // Extended gospel vocabulary
  { name: 'maj9',           intervals: [0,4,7,11,14] },
  { name: 'maj13',          intervals: [0,4,7,11,14,21] },
  { name: 'min9',           intervals: [0,3,7,10,14] },
  { name: 'min11',          intervals: [0,3,7,10,14,17] },
  { name: 'dom7b9',         intervals: [0,4,7,10,13] },
  { name: 'dom7#9',         intervals: [0,4,7,10,15] },
  { name: 'dom7#11',        intervals: [0,4,7,10,18] },
  { name: 'dom7alt',        intervals: [0,4,7,10,13,15] },
  { name: 'dom13',          intervals: [0,4,7,10,14,21] },
  { name: 'sus2',           intervals: [0,2,7] },
  { name: 'sus4',           intervals: [0,5,7] },
  { name: '7sus4',          intervals: [0,5,7,10] },
  { name: 'm7b5',           intervals: [0,3,6,10] },
  { name: 'dim7',           intervals: [0,3,6,9] },
  { name: 'add9',           intervals: [0,4,7,14] },
  { name: '6',              intervals: [0,4,7,9] },
  { name: 'm6',             intervals: [0,3,7,9] },
];

// ─── Gospel progression patterns ──────────────────────────────────────────────
export const GOSPEL_PROGRESSIONS = [
  { name: '2-5-1',            degrees: [2,5,1] },
  { name: '1-6-2-5',          degrees: [1,6,2,5] },
  { name: '3-6-2-5',          degrees: [3,6,2,5] },
  { name: 'Backdoor 2-5',     degrees: [7,1],  custom: true,  desc: 'bVII7→I' },
  { name: 'Tritone Sub 2-5',  degrees: [6,5,1],custom: true,  desc: 'bII7→I' },
  { name: '1-4-1-5',          degrees: [1,4,1,5] },
  { name: '6-2-5-1',          degrees: [6,2,5,1] },
  { name: 'Chromatic Walk-up',degrees: [1,2,3,4], custom: true, desc: 'I-#Idim-IIm-IV' },
];

// Build gospel voicing for a degree in a key (shell voicing: root+3+7)
export function buildGospelVoicing(rootMidi, chordIntervals) {
  return chordIntervals.map(s => rootMidi + s);
}

// ─── Interval data ────────────────────────────────────────────────────────────
export const INTERVALS = [
  { name: 'Unison',    semitones: 0  },
  { name: 'Minor 2nd', semitones: 1  },
  { name: 'Major 2nd', semitones: 2  },
  { name: 'Minor 3rd', semitones: 3  },
  { name: 'Major 3rd', semitones: 4  },
  { name: 'Perfect 4th',semitones: 5 },
  { name: 'Tritone',   semitones: 6  },
  { name: 'Perfect 5th',semitones: 7 },
  { name: 'Minor 6th', semitones: 8  },
  { name: 'Major 6th', semitones: 9  },
  { name: 'Minor 7th', semitones: 10 },
  { name: 'Major 7th', semitones: 11 },
  { name: 'Octave',    semitones: 12 },
];

export const SCALES = [
  { name: 'Major',           intervals: [0,2,4,5,7,9,11,12] },
  { name: 'Natural Minor',   intervals: [0,2,3,5,7,8,10,12] },
  { name: 'Harmonic Minor',  intervals: [0,2,3,5,7,8,11,12] },
  { name: 'Melodic Minor',   intervals: [0,2,3,5,7,9,11,12] },
  { name: 'Dorian',          intervals: [0,2,3,5,7,9,10,12] },
  { name: 'Mixolydian',      intervals: [0,2,4,5,7,9,10,12] },
  { name: 'Pentatonic Major',intervals: [0,2,4,7,9,12] },
  { name: 'Pentatonic Minor',intervals: [0,3,5,7,10,12] },
];

// ─── SM-2 lite spaced repetition ─────────────────────────────────────────────
/**
 * Returns a weight (0–1) for an item based on recent accuracy.
 * Lower accuracy → higher weight → more likely to be selected.
 */
export function sm2Weight(accuracyHistory = []) {
  if (accuracyHistory.length === 0) return 1;
  const recent = accuracyHistory.slice(-10);
  const avg = recent.reduce((a,b) => a+b, 0) / recent.length;
  if (avg >= 90) return 0.1; // mastered
  if (avg >= 70) return 0.5;
  return 1.0;               // weak
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

// ─── helpers ──────────────────────────────────────────────────────────────────
function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

export { delay };