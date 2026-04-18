/**
 * MIDI Device Indicator — shows connected MIDI devices in the header.
 * Initializes Web MIDI on mount.
 */
import React, { useState, useEffect } from 'react';
import * as midiInput from '@/lib/audio/midiInput';

export default function MidiDeviceIndicator() {
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    midiInput.init(
      () => {},            // note-on handled per-exercise
      (devs) => setDevices(devs)
    );
    return () => midiInput.dispose();
  }, []);

  if (devices.length === 0) return null;

  return (
    <div className="flex items-center gap-1 text-xs text-[#2A9D8F] font-medium px-2 py-1 bg-[#2A9D8F]/10 rounded-full">
      🎹 {devices[0].name}{devices.length > 1 ? ` +${devices.length-1}` : ''} connected
    </div>
  );
}