let context: AudioContext | undefined;
export function playSound(kind: 'click' | 'collect' | 'jump' | 'discover', enabled: boolean) {
  if (!enabled) return;
  try {
    context ??= new AudioContext();
    void context.resume();
    const notes = kind === 'discover' ? [392, 494, 587, 784] : kind === 'collect' ? [660, 880] : kind === 'jump' ? [260, 420] : [480];
    notes.forEach((note, i) => {
      const oscillator = context!.createOscillator();
      const gain = context!.createGain();
      const start = context!.currentTime + i * 0.075;
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(note, start);
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.09, start + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.23);
      oscillator.connect(gain); gain.connect(context!.destination);
      oscillator.start(start); oscillator.stop(start + 0.25);
    });
  } catch { /* Audio is an optional enhancement. */ }
}
