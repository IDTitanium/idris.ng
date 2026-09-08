import { useEffect, useRef, useState } from 'react';
import { Mic2, Pause, Play } from 'lucide-react';
import { welcomeRecording } from './experienceContent';

export default function RecordingBooth() {
  const [lit, setLit] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState('');
  const audio = useRef<HTMLAudioElement>(null);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    const player = audio.current;
    const pause = () => { if (document.hidden) player?.pause(); };
    document.addEventListener('visibilitychange', pause);
    return () => { mounted.current = false; player?.pause(); document.removeEventListener('visibilitychange', pause); };
  }, []);
  async function togglePlayback() {
    if (!audio.current) return;
    if (!audio.current.paused) { audio.current.pause(); return; }
    setError('');
    try { await audio.current.play(); } catch { if (mounted.current) setError('The recording could not play. Please try again.'); }
  }
  return <section className={`recording-booth ${lit || playing ? 'booth-lit' : ''} ${playing ? 'booth-playing' : ''}`} aria-label="BytesBurn recording booth">
    <div className="booth-heading"><span>THE RECORDING BOOTH</span><span className="on-air-sign"><i/>{playing ? 'ON AIR' : lit ? 'MIC CHECK' : 'OFF AIR'}</span></div>
    <div className="booth-stage" aria-hidden="true"><div className="booth-panels"/><Mic2 size={70} strokeWidth={1.2}/><div className="booth-wave">{Array.from({ length: 25 }, (_, i) => <i key={i} style={{ height: `${8 + i * 19 % 35}px`, animationDelay: `${-i * .13}s` }}/>)}</div></div>
    <h3>A voice behind the pixels.</h3>
    <p>{welcomeRecording.src ? 'A personal welcome from Idris. Press play to step into the booth.' : 'The booth is ready. Idris’s personal welcome recording is coming soon. For now, try the studio lights.'}</p>
    {welcomeRecording.src ? <>
      <audio ref={audio} src={welcomeRecording.src} preload="none" onPlay={() => { setPlaying(true); setLit(true); }} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} onError={() => { setPlaying(false); setError('The recording is unavailable right now.'); }}/>
      <button className="experience-button" onClick={() => void togglePlayback()}>{playing ? <Pause size={17}/> : <Play size={17}/>} {playing ? 'Pause welcome' : 'Play Idris’s welcome'}</button>
      {welcomeRecording.transcript && <details className="booth-transcript"><summary>Read the transcript</summary><p>{welcomeRecording.transcript}</p></details>}
    </> : <button className="experience-button" aria-pressed={lit} onClick={() => setLit(!lit)}><Mic2 size={17}/> {lit ? 'Switch off studio lights' : 'Switch on studio lights'}</button>}
    <p className="experience-fineprint">{welcomeRecording.src ? 'Pre-recorded welcome. Playback is always your choice.' : 'Interactive booth preview · no audio or live broadcast.'}</p>
    {error && <p role="status">{error}</p>}
  </section>;
}
