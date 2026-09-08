import { useState } from 'react';
import { ArrowUpRight, Flame, Mic2, Radio, Youtube } from 'lucide-react';
import { podcastUrl } from './content';
import { playSound } from './sound';
import RecordingBooth from './RecordingBooth';

export default function PodcastRadio({ sound }: { sound: boolean }) {
  const [frequency, setFrequency] = useState(88);
  const tuned = Math.abs(frequency - 98.4) <= 0.7;
  function tune(value: number) {
    const wasTuned = tuned;
    setFrequency(value);
    if (!wasTuned && Math.abs(value - 98.4) <= 0.7) playSound('discover', sound);
  }
  return <>
    <div className="panel-eyebrow"><span/> THE RADIO / BYTESBURN PODCAST</div>
    <h2>A different kind<br/><span>of output.</span></h2>
    <p className="panel-lead">Sometimes I close the editor and open a conversation. I’m the host of BytesBurn Podcast.</p>
    <div className={`podcast-receiver ${tuned ? 'is-tuned' : ''}`}>
      <div className="receiver-brand"><span><Flame size={19}/> BytesBurn<span className="receiver-edition">PODCAST</span></span><span>THE CONVERSATION CONTINUES</span></div>
      <div className="receiver-face"><div className="speaker-grille" aria-hidden="true"><span/></div><div className="receiver-screen"><div className="receiver-status"><span/>{tuned ? 'SIGNAL FOUND' : 'TUNING IN…'}</div><strong>{frequency.toFixed(1)}<small>FM</small></strong><div className="radio-waveform" aria-hidden="true">{Array.from({length:24},(_,i)=><i key={i} style={{height:`${8 + ((i * 17 + 9) % 37)}px`,animationDelay:`${i * -0.09}s`}}/>)}</div><span className="receiver-station">{tuned ? 'BYTESBURN / IDRIS LAWAL' : 'FIND THE SPARK AT 98.4'}</span></div></div>
      <label className="tuner-label" htmlFor="radio-tuner"><span>TURN THE DIAL</span><span>88 <span>···························</span> 108</span></label>
      <input id="radio-tuner" className="radio-tuner" type="range" min="88" max="108" step="0.1" value={frequency} onChange={e=>tune(Number(e.target.value))} aria-label="Tune the BytesBurn radio" aria-valuetext={`${frequency.toFixed(1)}. ${tuned ? 'BytesBurn signal found' : 'Tune to 98.4 for BytesBurn'}`}/>
      <div className="receiver-bottom"><span><Radio size={12}/> A LITTLE FREQUENCY OF MY OWN</span><button onClick={()=>tune(98.4)}>Find BytesBurn <ArrowUpRight size={13}/></button></div>
    </div>
    <p className="radio-feedback" role="status" aria-live="polite">{tuned ? 'You found it. Pull up a chair—there’s a conversation waiting.' : 'Slide the dial to 98.4 to find BytesBurn.'}</p>
    <div className="podcast-host"><span className="host-icon"><Mic2 size={25}/></span><span><small>BEHIND THE MIC</small><strong>Idris Lawal</strong><p>Software developer. Curious human. Podcast host.</p></span></div>
    <a className="primary-button podcast-watch" href={podcastUrl} target="_blank" rel="noreferrer"><Youtube size={21}/> Watch BytesBurn on YouTube <ArrowUpRight size={18}/></a>
    <p className="podcast-note">The dial is a playful introduction. The real conversations live on YouTube.</p>
    <RecordingBooth/>
  </>;
}
