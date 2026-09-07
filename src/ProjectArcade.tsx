import { useState } from 'react';
import { ArrowRight, ArrowUpRight, Check, Clipboard, Laptop, RefreshCw, Send, Smartphone, Sparkles } from 'lucide-react';
import { projects } from './content';
import { playSound } from './sound';

export default function ProjectArcade({ sound }: { sound: boolean }) {
  const [selected, setSelected] = useState<'subsync' | 'clippy'>('subsync');
  const [draft, setDraft] = useState('Good ideas travel.');
  const [delivered, setDelivered] = useState('');
  const [syncing, setSyncing] = useState(false);
  const project = projects[selected];

  return <>
    <div className="panel-eyebrow purple"><span/> THE ARCADE / CURRENTLY BUILDING</div>
    <h2>Small frictions.<br/><span>Big possibilities.</span></h2>
    <p className="panel-lead">Two products on my workbench. Pick a cartridge and take a closer look.</p>
    <div className="cartridge-selector" role="tablist" aria-label="Select a project">
      {(['subsync', 'clippy'] as const).map((id, i) => <button key={id} id={`tab-${id}`} role="tab" aria-selected={selected === id} aria-controls={`project-${id}`} tabIndex={selected === id ? 0 : -1} onKeyDown={e => {
        if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
          e.preventDefault();
          const next = e.key === 'Home' ? 'subsync' : e.key === 'End' ? 'clippy' : selected === 'subsync' ? 'clippy' : 'subsync';
          setSelected(next); document.getElementById(`tab-${next}`)?.focus();
        }
      }} onClick={() => { setSelected(id); playSound('click', sound); }} className={`cartridge cartridge-${id}`}>
        <span className="cartridge-ridges" aria-hidden="true"/><span className="cartridge-number">0{i + 1}</span>
        {id === 'subsync' ? <RefreshCw size={24}/> : <Clipboard size={24}/>}
        <strong>{projects[id].name}</strong><small>{selected === id ? 'NOW EXPLORING' : 'PRESS TO EXPLORE'}</small>
      </button>)}
    </div>
    <div key={selected} className={`project-stage stage-${selected}`} role="tabpanel" id={`project-${selected}`} aria-labelledby={`tab-${selected}`}>
      <div className="stage-status"><span className="status-dot"/> ON THE WORKBENCH <span>0{selected === 'subsync' ? '1' : '2'} / 02</span></div>
      {selected === 'subsync' ? <>
        <button className={`sync-universe ${syncing ? 'in-sync' : ''}`} aria-label="Organize sample subscriptions" aria-pressed={syncing} onClick={() => { setSyncing(!syncing); playSound('collect', sound); }}>
          <span className="sync-ring ring-one"/><span className="sync-ring ring-two"/><span className="sync-core">{syncing ? <><strong>$30</strong><small>/ month</small></> : <RefreshCw size={36}/>}</span>
          <span className="sync-satellite satellite-one"><span>♫</span> Music <b>$8</b></span><span className="sync-satellite satellite-two"><Sparkles size={15}/> Cloud <b>$12</b></span><span className="sync-satellite satellite-three"><span>↗</span> Learning <b>$10</b></span>
          <span className="sync-caption">{syncing ? 'ONE VIEW. A LITTLE MORE CLARITY. ↺' : 'TAP TO BRING IT ALL TOGETHER.'}</span>
        </button>
        <div className="demo-caption">An interactive sketch with sample subscriptions.</div>
        <div className="stage-copy"><h3>SubSync<span>↗</span></h3><p>Less subscription sprawl. More clarity. Capture subscriptions, see your digital spend in one place, and stay ahead of renewals.</p><div className="project-features"><span>Automatic capture</span><span>Renewal reminders</span><span>One dashboard</span></div><span className="project-domain">web.mysubsync.com</span></div>
      </> : <>
        <div className="clippy-demo">
          <div className="demo-room"><span>ROOM</span><strong>IDRIS·NG</strong><i/> shared space</div>
          <div className="device-pair"><div className="demo-laptop"><div className="device-label"><Laptop size={12}/> LAPTOP</div><label htmlFor="clip-note">A little note to send</label><input id="clip-note" maxLength={80} value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => { if(e.key === 'Enter' && draft.trim()){setDelivered(draft.trim());playSound('collect',sound);} }} autoComplete="off"/><button disabled={!draft.trim()} onClick={() => { setDelivered(draft.trim()); playSound('collect', sound); }}><Send size={13}/> Send to phone</button></div><span className={`transfer-arrow ${delivered ? 'sent' : ''}`} aria-hidden="true">{delivered ? <Check size={20}/> : <ArrowRight size={20}/>}</span><div className="demo-phone"><div className="device-label"><Smartphone size={12}/> PHONE</div><div className={`phone-message ${delivered ? 'has-message' : ''}`} role="status" aria-live="polite" key={delivered}>{delivered || <span>Your room<br/>is waiting…</span>}</div>{delivered && <span className="delivery-status"><Check size={10}/> received</span>}</div></div>
          <div className="demo-caption">A tiny local demo. Try sending your own note.</div>
        </div>
        <div className="stage-copy"><h3>Clippy<span><Clipboard size={26}/></span></h3><p>One room. Your devices. A shared clipboard that gets a thought from here to there.</p><span className="project-domain">useclippy.cc</span></div>
      </>}
      <a className="project-launch" href={project.url} target="_blank" rel="noreferrer">Explore {project.name}<ArrowUpRight size={19}/></a>
      {selected === 'subsync' && <a className="project-app-link" href="https://mysubsync.com" target="_blank" rel="noreferrer">Already using SubSync? Open the app <ArrowUpRight size={13}/></a>}
    </div>
    <div className="workbench-note"><span className="status-dot"/><p>Actively building both. There’s something lovely about making an everyday thing a little better.</p></div>
  </>;
}
