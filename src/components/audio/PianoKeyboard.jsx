import React from 'react';
import { cn } from "@/lib/utils";

const KEYS = [
  { note: 'C4', type: 'white', label: 'C' },
  { note: 'C#4', type: 'black', label: 'C#' },
  { note: 'D4', type: 'white', label: 'D' },
  { note: 'D#4', type: 'black', label: 'D#' },
  { note: 'E4', type: 'white', label: 'E' },
  { note: 'F4', type: 'white', label: 'F' },
  { note: 'F#4', type: 'black', label: 'F#' },
  { note: 'G4', type: 'white', label: 'G' },
  { note: 'G#4', type: 'black', label: 'G#' },
  { note: 'A4', type: 'white', label: 'A' },
  { note: 'A#4', type: 'black', label: 'A#' },
  { note: 'B4', type: 'white', label: 'B' },
  { note: 'C5', type: 'white', label: 'C' },
  { note: 'C#5', type: 'black', label: 'C#' },
  { note: 'D5', type: 'white', label: 'D' },
  { note: 'D#5', type: 'black', label: 'D#' },
  { note: 'E5', type: 'white', label: 'E' },
  { note: 'F5', type: 'white', label: 'F' },
];

// Map base note + semitones to actual note
const getNoteFromInterval = (baseNote, semitones) => {
  const allNotes = ['C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4', 
                    'C5', 'C#5', 'D5', 'D#5', 'E5', 'F5', 'F#5', 'G5', 'G#5', 'A5', 'A#5', 'B5'];
  const baseIndex = allNotes.indexOf(baseNote);
  if (baseIndex === -1) return null;
  return allNotes[baseIndex + semitones] || null;
};

export default function PianoKeyboard({ baseNote, semitones, showSecondNote = false }) {
  const secondNote = baseNote && semitones !== undefined ? getNoteFromInterval(baseNote, semitones) : null;
  
  const whiteKeys = KEYS.filter(k => k.type === 'white');
  const blackKeyPositions = {
    'C#4': 0, 'D#4': 1, 'F#4': 3, 'G#4': 4, 'A#4': 5,
    'C#5': 7, 'D#5': 8, 'F#5': 10, 'G#5': 11, 'A#5': 12
  };

  return (
    <div className="relative flex justify-center my-4">
      <div className="relative flex">
        {/* White keys */}
        {whiteKeys.map((key, index) => {
          const isFirstNote = key.note === baseNote;
          const isSecondNote = showSecondNote && key.note === secondNote;
          
          return (
            <div
              key={key.note}
              className={cn(
                "relative w-8 sm:w-10 h-28 sm:h-36 border border-gray-300 rounded-b-md transition-all duration-300",
                isFirstNote 
                  ? "bg-[#3E82FC] border-[#243B73] shadow-lg z-10 scale-[1.02]" 
                  : isSecondNote 
                    ? "bg-[#2A9D8F] border-[#1a6b61] shadow-lg z-10 scale-[1.02]"
                    : "bg-white hover:bg-gray-50"
              )}
            >
              {(isFirstNote || isSecondNote) && (
                <div className={cn(
                  "absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] sm:text-xs font-bold text-white",
                  "animate-pulse"
                )}>
                  {key.label}
                </div>
              )}
            </div>
          );
        })}
        
        {/* Black keys */}
        {KEYS.filter(k => k.type === 'black').map((key) => {
          const position = blackKeyPositions[key.note];
          if (position === undefined) return null;
          
          const isFirstNote = key.note === baseNote;
          const isSecondNote = showSecondNote && key.note === secondNote;
          
          // Calculate left position based on white key index
          const leftOffset = (position * 32) + 22; // 32px = w-8, offset for centering
          const leftOffsetSm = (position * 40) + 28; // 40px = w-10 for sm screens
          
          return (
            <div
              key={key.note}
              style={{ 
                left: `calc(${position} * 2rem + 1.375rem)`,
              }}
              className={cn(
                "absolute top-0 w-5 sm:w-6 h-16 sm:h-20 rounded-b-md z-20 transition-all duration-300",
                "sm:left-[calc(var(--pos)*2.5rem+1.75rem)]",
                isFirstNote 
                  ? "bg-[#243B73] shadow-lg scale-[1.05]" 
                  : isSecondNote 
                    ? "bg-[#1a6b61] shadow-lg scale-[1.05]"
                    : "bg-gray-900 hover:bg-gray-800"
              )}
              data-pos={position}
            >
              {(isFirstNote || isSecondNote) && (
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-bold text-white animate-pulse">
                  {key.label}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Legend */}
      {baseNote && (
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-[#3E82FC]"></div>
            <span className="text-muted-foreground">1st Note</span>
          </div>
          {showSecondNote && secondNote && (
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-[#2A9D8F]"></div>
              <span className="text-muted-foreground">2nd Note</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}