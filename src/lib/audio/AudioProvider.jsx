/**
 * AudioProvider — wraps the entire app.
 * - On first user gesture: calls init() on the singleton audio engine.
 * - Shows "Tap to enable audio" overlay if context is suspended.
 * - Exposes useAudio() hook for child components.
 */
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import * as audioEngine from './audioEngine';

const AudioCtx = createContext(null);

export function AudioProvider({ children }) {
  const [ready, setReady]           = useState(false);
  const [loading, setLoading]       = useState(false);
  const [progress, setProgress]     = useState(0);
  const [needsTap, setNeedsTap]     = useState(false);
  const [instrument, setInstrumentState] = useState('piano');
  const initStarted = useRef(false);

  const startAudio = useCallback(async () => {
    if (initStarted.current) return;
    initStarted.current = true;
    setLoading(true);
    setNeedsTap(false);

    await audioEngine.init((pct) => setProgress(pct));

    setLoading(false);
    setReady(true);
    setProgress(100);
  }, []);

  // Listen for ANY first interaction
  useEffect(() => {
    const onGesture = () => {
      startAudio();
      window.removeEventListener('click',   onGesture);
      window.removeEventListener('keydown', onGesture);
      window.removeEventListener('touchstart', onGesture);
    };
    window.addEventListener('click',      onGesture, { once: true });
    window.addEventListener('keydown',    onGesture, { once: true });
    window.addEventListener('touchstart', onGesture, { once: true, passive: true });
    // After 2s, if still not started, show overlay
    const t = setTimeout(() => { if (!initStarted.current) setNeedsTap(true); }, 2000);
    return () => {
      window.removeEventListener('click',   onGesture);
      window.removeEventListener('keydown', onGesture);
      window.removeEventListener('touchstart', onGesture);
      clearTimeout(t);
    };
  }, [startAudio]);

  const switchInstrument = useCallback(async (name) => {
    setInstrumentState(name);
    await audioEngine.loadInstrument(name);
  }, []);

  const value = { ready, loading, progress, instrument, switchInstrument, startAudio };

  return (
    <AudioCtx.Provider value={value}>
      {/* Loading progress bar */}
      {loading && (
        <div className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-slate-200">
          <div
            className="h-full bg-[#3E82FC] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* iOS tap-to-enable overlay */}
      {needsTap && !ready && !loading && (
        <div
          className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={startAudio}
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center shadow-2xl max-w-xs mx-4">
            <div className="text-4xl mb-4">🎹</div>
            <h2 className="text-xl font-bold mb-2">Tap to enable audio</h2>
            <p className="text-sm text-muted-foreground">Gospel ear training requires audio permission</p>
          </div>
        </div>
      )}

      {children}
    </AudioCtx.Provider>
  );
}

export function useAudio() {
  const ctx = useContext(AudioCtx);
  if (!ctx) throw new Error('useAudio must be used within AudioProvider');
  return ctx;
}