/**
 * Web MIDI input manager with pub-sub pattern.
 * Multiple components can subscribe to note-on events independently.
 */

let access = null;
const noteOnSubscribers = new Set();
const deviceChangeSubscribers = new Set();

function attachListeners() {
  if (!access) return;
  for (const input of access.inputs.values()) {
    input.onmidimessage = (evt) => {
      const [status, note, velocity] = evt.data;
      const type = status & 0xf0;
      if (type === 0x90 && velocity > 0) {
        noteOnSubscribers.forEach(cb => cb({ midi: note, velocity }));
      }
    };
  }
  const devices = getDevices();
  deviceChangeSubscribers.forEach(cb => cb(devices));
}

export function getDevices() {
  if (!access) return [];
  return [...access.inputs.values()].map(i => ({ id: i.id, name: i.name }));
}

export async function init() {
  if (!navigator.requestMIDIAccess) return false;
  try {
    access = await navigator.requestMIDIAccess();
    access.onstatechange = () => attachListeners();
    attachListeners();
    return true;
  } catch {
    return false;
  }
}

/** Subscribe to note-on events. Returns an unsubscribe function. */
export function subscribeNoteOn(callback) {
  noteOnSubscribers.add(callback);
  return () => noteOnSubscribers.delete(callback);
}

/** Subscribe to device changes. Returns an unsubscribe function. */
export function subscribeDeviceChange(callback) {
  deviceChangeSubscribers.add(callback);
  return () => deviceChangeSubscribers.delete(callback);
}

export function dispose() {
  noteOnSubscribers.clear();
  deviceChangeSubscribers.clear();
  access = null;
}