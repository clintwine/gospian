/**
 * Web MIDI input manager.
 * Usage: midiInput.init(onNoteOn, onDeviceChange)
 */

let access = null;
let onNoteOnCb = null;
let onDeviceChangeCb = null;

function attachListeners() {
  if (!access) return;
  for (const input of access.inputs.values()) {
    input.onmidimessage = (evt) => {
      const [status, note, velocity] = evt.data;
      const type = status & 0xf0;
      if ((type === 0x90) && velocity > 0) {
        onNoteOnCb?.({ midi: note, velocity });
      }
    };
  }
  onDeviceChangeCb?.(getDevices());
}

export function getDevices() {
  if (!access) return [];
  return [...access.inputs.values()].map(i => ({ id: i.id, name: i.name }));
}

export async function init(noteOnCallback, deviceChangeCallback) {
  onNoteOnCb = noteOnCallback;
  onDeviceChangeCb = deviceChangeCallback;
  if (!navigator.requestMIDIAccess) return false;
  access = await navigator.requestMIDIAccess();
  access.onstatechange = () => {
    attachListeners();
    onDeviceChangeCb?.(getDevices());
  };
  attachListeners();
  return true;
}

export function dispose() {
  access = null;
  onNoteOnCb = null;
  onDeviceChangeCb = null;
}