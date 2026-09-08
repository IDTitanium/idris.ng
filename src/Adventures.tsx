import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowRight, Bug, Check, Coffee, Download, LockKeyhole, Rocket, Terminal } from 'lucide-react';
import { places, type PlaceId } from './content';
import { bugs, duckJokes, duckStories, type BugId } from './experienceContent';
import { playSound } from './sound';
import Postcard from './Postcard';

export type Adventure = 'duck' | 'terminal' | 'bugs' | 'postcard' | 'launch';
export const adventureNames: Record<Adventure, string> = { duck: 'Meet your rubber duck', terminal: 'Secret terminal', bugs: 'The debugging quest', postcard: 'Your explorer postcard', launch: 'The Ship It launchpad' };
export function DuckArt() {
  return <svg viewBox="0 0 180 160" className="duck-art" aria-hidden="true"><ellipse cx="91" cy="140" rx="56" ry="9" fill="#313b3012"/><path d="M39 104 23 87Q17 129 67 132H109Q146 129 149 108Q150 92 129 89H74Z" fill="#e9ad35"/><ellipse cx="88" cy="104" rx="51" ry="31" fill="#f4c94f"/><circle cx="109" cy="63" r="34" fill="#f7d365"/><path d="M133 66Q168 66 160 78Q149 83 130 78" fill="#e77b42"/><circle cx="117" cy="57" r="4.5" fill="#303a32"/><circle cx="118" cy="55.5" r="1.3" fill="white"/><path d="M62 98Q78 116 103 99" stroke="#dca837" strokeWidth="4" fill="none" strokeLinecap="round"/><path d="M84 33Q108 15 131 36L135 43 83 43Z" fill="#749b81"/><path d="M107 34 138 38" stroke="#506e5a" strokeWidth="7" strokeLinecap="round"/></svg>;
}

export function AdventureDock({ open, visited, solved, shipped }: { open: (id: Adventure) => void; visited: PlaceId[]; solved: BugId[]; shipped: boolean }) {
  const unlocked = places.every(p => visited.includes(p.id));
  return <section className="adventure-dock" aria-label="Optional island adventures">
    <div className="adventure-heading"><div><span className="small-label">THE SCENIC ROUTE</span><h2>A few happy detours.</h2></div><p>No deadlines. Just side quests.</p></div>
    <div className="adventure-grid">
      <button className="adventure-card duck-card" onClick={() => open('duck')}><DuckArt/><span><small>YOUR PLUS ONE</small><strong>Talk to the duck</strong><span>A very good listener.</span></span><ArrowRight size={17}/></button>
      <button className="adventure-card" onClick={() => open('bugs')}><Bug className="adventure-icon"/><span><small>{solved.length}/3 BUGS RESOLVED</small><strong>A little bug hunt</strong><span>Find it. Think it through. Fix it.</span></span><ArrowRight size={17}/></button>
      <button className="adventure-card terminal-card" onClick={() => open('terminal')}><Terminal className="adventure-icon"/><span><small>FOR THE CURIOUS</small><strong>Open the terminal</strong><span>There’s a shortcut: <kbd>`</kbd></span></span><ArrowRight size={17}/></button>
      <button className="adventure-card" onClick={() => open('postcard')}><Download className="adventure-icon"/><span><small>A SOUVENIR, NOT A COOKIE</small><strong>Make a postcard</strong><span>Your visit. Signed and stamped.</span></span><ArrowRight size={17}/></button>
    </div>
    <button className={`launch-invitation ${unlocked ? 'is-unlocked' : ''}`} onClick={() => open('launch')}><Rocket size={27}/><span><strong>{shipped ? 'You came. You explored. You shipped.' : unlocked ? 'All five places. One big send-off.' : 'There’s a launchpad with your name on it.'}</strong><small>{unlocked ? 'The Ship It finale is ready. Shall we?' : `Discover all five places to unlock the finale. ${visited.length}/5 explored.`}</small></span>{unlocked ? <ArrowRight size={22}/> : <LockKeyhole size={20}/>}</button>
  </section>;
}

type PanelProps = {
  id: Adventure; visited: PlaceId[]; solved: BugId[]; onSolve: (id: BugId) => void;
  selectedBug: BugId | null; onSelectBug: (id: BugId | null) => void; onHunt: () => void;
  duck: boolean; onDuck: () => void; night: boolean; onNight: (value: boolean) => void;
  sound: boolean; onSound: (value: boolean) => void; onVisit: (id: PlaceId) => void;
  reducedMotion: boolean; onLaunch: () => void; onShipped: () => void; onPostcard: () => void;
  snapshot: string | null; sparks: number; shipped: boolean;
};
export default function AdventurePanel(props: PanelProps) {
  if (props.id === 'duck') return <DuckPanel {...props}/>;
  if (props.id === 'terminal') return <SecretTerminal {...props}/>;
  if (props.id === 'bugs') return <BugQuest {...props}/>;
  if (props.id === 'postcard') return <Postcard snapshot={props.snapshot} visited={props.visited} sparks={props.sparks} solved={props.solved.length} night={props.night} shipped={props.shipped}/>;
  return <Launchpad {...props}/>;
}

function DuckPanel({ duck, onDuck, visited, sound }: PanelProps) {
  const [line, setLine] = useState('Quack. I’m your emotional support debugger. Tell me everything.');
  const counters = useRef({ joke: 0, story: 0 });
  const next = places.find(p => !visited.includes(p.id));
  function talk(kind: 'joke' | 'story' | 'hint') {
    playSound('click', sound);
    if (kind === 'hint') setLine(next ? `Try ${next.name.toLowerCase()}. ${next.subtitle}. Every new place brings you closer to the launchpad.` : 'All five places! The launchpad is ready. Or hunt the three bugs if you fancy a little debugging.');
    else { const lines = kind === 'joke' ? duckJokes : duckStories; setLine(lines[counters.current[kind]++ % lines.length]); }
  }
  return <><div className="panel-eyebrow">YOUR COMPANION / RUBBER DUCK DEBUGGER</div><h2>Small duck.<br/><span>Big listener.</span></h2><div className="duck-portrait"><DuckArt/><span className="duck-name-tag">HELLO, I’M QUACK</span></div><p className="duck-speech" role="status">{line}</p><div className="experience-actions"><button className="experience-button" onClick={() => talk('joke')}>Tell me a joke</button><button className="experience-button" onClick={() => talk('hint')}>Give me a hint</button><button className="experience-button" onClick={() => talk('story')}>About Idris</button></div><button className="duck-follow-toggle" aria-pressed={duck} onClick={onDuck}>{duck ? <Check size={17}/> : <ArrowRight size={17}/>} {duck ? 'Following you · let the duck rest' : 'Bring the duck along'}</button><p className="experience-fineprint">A tiny companion, not an AI chat. Tap the duck on the island to say hello.</p></>;
}

function BugQuest({ solved, onSolve, selectedBug, onSelectBug, onHunt, sound }: PanelProps) {
  const bug = bugs.find(b => b.id === selectedBug);
  const [wrong, setWrong] = useState<number | null>(null);
  useEffect(() => setWrong(null), [selectedBug]);
  const fixed = bug && solved.includes(bug.id);
  return <><div className="panel-eyebrow">SIDE QUEST / DEBUG THIS LITTLE WORLD</div><h2>Three bugs.<br/><span>One curious mind.</span></h2><p className="panel-lead">These are real implementation challenges from this portfolio—not invented career case studies.</p><div className="bug-progress"><span>{solved.length}/3 resolved</span><div>{bugs.map(b => <i key={b.id} className={solved.includes(b.id) ? 'fixed' : ''}/>)}</div></div>
    {!bug ? <><p className="quest-intro">Three little bugs are hiding on the island. Walk close or tap one to inspect it. You can also open every case here, with no wandering required.</p><button className="experience-button" onClick={onHunt}><Bug size={17}/> Hunt on the island <ArrowRight size={16}/></button><div className="bug-case-list">{bugs.map((b, i) => <button key={b.id} onClick={() => onSelectBug(b.id)}><span className={solved.includes(b.id) ? 'bug-fixed-icon' : ''}>{solved.includes(b.id) ? <Check size={22}/> : <Bug size={22}/>}</span><span><small>CASE 0{i + 1} · {b.location}</small><strong>{b.name}</strong></span><ArrowRight size={18}/></button>)}</div>{solved.length === 3 && <p className="quest-complete" role="status">Zero bugs left. You earned your rubber-duck debugging badge.</p>}</> : <div className="bug-case"><button className="experience-text-button" onClick={() => onSelectBug(null)}>← All three cases</button><span className="case-file">FIELD NOTE / {bug.file}</span><h3>{bug.name}</h3><p>{bug.problem}</p><div className="bug-options">{bug.options.map((option, i) => <button key={option} disabled={!!fixed} className={fixed && i === bug.answer ? 'correct' : wrong === i ? 'incorrect' : ''} onClick={() => { if (i === bug.answer) { onSolve(bug.id); setWrong(null); playSound('discover', sound); } else { setWrong(i); playSound('click', sound); } }}><span>{fixed && i === bug.answer ? <Check size={18}/> : `0${i + 1}`}</span>{option}</button>)}</div>{wrong !== null && !fixed && <p role="status" className="bug-feedback">Not quite. Think about what the visitor needs to keep working. Try another approach.</p>}{fixed && <div className="bug-resolution" role="status"><span><Check size={18}/> PATCH ACCEPTED</span><h4>The decision</h4><p>{bug.decision}</p><h4>The result</h4><p>{bug.outcome}</p></div>}</div>}
  </>;
}

function SecretTerminal({ onVisit, onNight, night, onSound, sound, duck, onDuck, onPostcard }: PanelProps) {
  const [input, setInput] = useState('');
  const [lines, setLines] = useState(['idris.ng / visitor shell v1.0', 'A toy terminal. No commands leave your browser.', 'Type help to find your way around.']);
  const [history, setHistory] = useState<string[]>([]);
  const cursor = useRef(0);
  const log = useRef<HTMLDivElement>(null);
  useEffect(() => { if (log.current) log.current.scrollTop = log.current.scrollHeight; }, [lines]);
  function run(raw: string) {
    const text = raw.trim(); if (!text) return;
    const command = text.toLowerCase().replace(/\s+/g, ' ');
    setInput(''); setHistory(h => { const next = [...h, text].slice(-40); cursor.current = next.length; return next; });
    if (command === 'clear') { setLines([]); return; }
    let response = '';
    const destinations: Record<string, PlaceId> = { about: 'about', work: 'work', projects: 'work', writing: 'writing', bytesburn: 'podcast', podcast: 'podcast', contact: 'contact' };
    const destination = destinations[command.replace(/^open /, '')];
    if (destination) { onVisit(destination); return; }
    if (command === 'help') response = 'whoami · projects · bytesburn\nopen about|work|writing|podcast|contact\ntheme day|night · sound on|off · duck\npostcard · sudo make-coffee · clear';
    else if (command === 'whoami') response = 'Idris Lawal · software developer, 8 years.\nBuilding SubSync & Clippy. Hosting BytesBurn.\nBased in Nigeria. Building for everywhere.';
    else if (command === 'theme day' || command === 'theme night') { onNight(command.endsWith('night')); response = `Lighting set to ${command.endsWith('night') ? 'night' : 'day'}.`; }
    else if (command === 'theme') response = `Current lighting: ${night ? 'night' : 'day'}. Try theme day or theme night.`;
    else if (command === 'sound on' || command === 'sound off') { const enabled = command.endsWith('on'); onSound(enabled); playSound('collect', enabled); response = `Sound ${enabled ? 'on' : 'off'}.`; }
    else if (command === 'sound') response = `Sound is ${sound ? 'on' : 'off'}.`;
    else if (command === 'duck') { onDuck(); response = duck ? 'Duck is taking a well-earned pond break.' : 'Companion process started. Quack PID: 001.'; }
    else if (command === 'postcard') { onPostcard(); return; }
    else if (command === 'sudo make-coffee') response = 'Permission granted.\n[██████████] 100%\n☕ One imaginary coffee. Zero production incidents.';
    else if (command === 'ls') response = 'studio/  arcade/  garden/  radio/  portal/  duck.txt';
    else if (command === 'cat duck.txt') response = 'If you can explain it to a duck, you are already making progress.';
    else response = `Command not found: ${text.slice(0, 120)}\nTry help. This shell only runs the little commands listed there.`;
    setLines(previous => [...previous, `visitor@idris.ng ~ $ ${text}`, response].slice(-80));
  }
  return <><div className="panel-eyebrow">YOU FOUND A BACK DOOR / COME ON IN</div><h2>Hello,<br/><span>terminal person.</span></h2><div className="visitor-terminal"><div className="terminal-title"><span><i/><i/><i/></span><span>visitor@idris.ng — local</span><Terminal size={14}/></div><div className="terminal-log" ref={log} role="log" aria-label="Terminal output" aria-live="polite" aria-relevant="additions">{lines.map((line, i) => <pre key={i}>{line}</pre>)}</div><form onSubmit={event => { event.preventDefault(); run(input); }}><label htmlFor="visitor-command">$</label><input id="visitor-command" aria-label="Terminal command" value={input} maxLength={160} autoCapitalize="none" autoCorrect="off" spellCheck={false} autoComplete="off" placeholder="help" onChange={e => setInput(e.target.value)} onKeyDown={event => { if (event.key === 'ArrowUp' || event.key === 'ArrowDown') { event.preventDefault(); cursor.current = Math.max(0, Math.min(history.length, cursor.current + (event.key === 'ArrowUp' ? -1 : 1))); setInput(history[cursor.current] ?? ''); } }}/><button type="submit" aria-label="Run command"><ArrowRight size={20}/></button></form></div><div className="terminal-shortcuts"><button onClick={() => run('help')}>help</button><button onClick={() => run('whoami')}>whoami</button><button onClick={() => run('sudo make-coffee')}><Coffee size={15}/> make-coffee</button></div><p className="experience-fineprint">↑ ↓ recall commands. Escape closes. No shell access, tracking, or external execution.</p></>;
}

function Launchpad({ visited, onVisit, reducedMotion, sound, onLaunch, onShipped, onPostcard }: PanelProps) {
  const missing = places.filter(p => !visited.includes(p.id));
  const [stage, setStage] = useState<'ready' | 'countdown' | 'flight' | 'done'>('ready');
  const [count, setCount] = useState(3);
  const callbacks = useRef({ onLaunch, onShipped, sound }); callbacks.current = { onLaunch, onShipped, sound };
  useEffect(() => {
    if (stage !== 'countdown') return;
    const timer = setTimeout(() => { if (count > 1) { setCount(count - 1); playSound('click', callbacks.current.sound); } else { callbacks.current.onLaunch(); setStage('flight'); playSound('discover', callbacks.current.sound); } }, 800);
    return () => clearTimeout(timer);
  }, [stage, count]);
  useEffect(() => {
    if (stage !== 'flight') return;
    const timer = setTimeout(() => { setStage('done'); callbacks.current.onShipped(); }, 2400);
    return () => clearTimeout(timer);
  }, [stage]);
  function launch() {
    if (missing.length || stage === 'countdown' || stage === 'flight') return;
    if (reducedMotion) { onLaunch(); onShipped(); setStage('done'); playSound('discover', sound); }
    else { setCount(3); setStage('countdown'); playSound('click', sound); }
  }
  return <><div className="panel-eyebrow">MISSION CONTROL / A LITTLE SEND-OFF</div><h2>{stage === 'done' ? 'Consider it' : 'Ready when'}<br/><span>{stage === 'done' ? 'shipped.' : 'you are.'}</span></h2><div className={`launch-scene launch-${stage}`} aria-hidden="true"><div className="launch-orbits"/><div className="launch-rocket"><Rocket size={96} strokeWidth={1.1}/><span className="rocket-exhaust"/></div><div className="launch-ground"/><span className="launch-coordinate">IL–01 / NIGERIA → EVERYWHERE</span>{stage === 'done' && <div className="confetti-word">{'idris.ng'.split('').map((letter, i) => <span key={i} style={{ '--scatter-x': `${(i % 2 ? 1 : -1) * (50 + i * 8)}px`, '--scatter-y': `${-80 - i * 13}px`, '--scatter-r': `${i * 37}deg`, animationDelay: `${i * .04}s` } as CSSProperties}>{letter}</span>)}</div>}</div><p className="launch-status" role="status">{missing.length ? `${visited.length}/5 places discovered. Every great launch starts with a little exploring.` : stage === 'countdown' ? `Launch in ${count}…` : stage === 'flight' ? 'Liftoff! A little curiosity goes a long way.' : stage === 'done' ? 'Mission complete. Thanks for taking the scenic route through my world.' : 'All five places discovered. All systems feeling good.'}</p>
    {missing.length ? <div className="launch-checklist">{places.map(p => <button key={p.id} onClick={() => onVisit(p.id)}>{visited.includes(p.id) ? <Check size={17}/> : <span>{p.number}</span>}{p.name}<ArrowRight size={16}/></button>)}</div> : <div className="experience-actions"><button className="primary-button ship-button" disabled={stage === 'countdown' || stage === 'flight'} onClick={launch}><Rocket size={19}/>{stage === 'done' ? 'Launch again' : stage === 'ready' ? 'Ship it!' : 'Launch in progress'}</button>{stage === 'done' && <button className="experience-button" onClick={onPostcard}><Download size={17}/> Keep a postcard</button>}</div>}<p className="experience-fineprint">Just a celebration. This button does not deploy software or send any data.</p></>;
}
