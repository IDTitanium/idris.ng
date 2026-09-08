import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowDownLeft, ArrowRight, ArrowUpRight, BookOpen, Check, ChevronRight, Code2, Compass, Gamepad2, Linkedin, Map, Moon, Radio, RotateCcw, Sparkles, Sun, Volume2, VolumeX, X } from 'lucide-react';
import { linkedin, places, type PlaceId } from './content';
import { playSound } from './sound';
import ProjectArcade from './ProjectArcade';
import PodcastRadio from './PodcastRadio';
import AdventurePanel, { AdventureDock, adventureNames, type Adventure } from './Adventures';
import { type BugId } from './experienceContent';
const World = lazy(() => import('./World'));

function useStored<T,>(key: string, initial: T): [T, (value: T | ((previous: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => { try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : initial; } catch { return initial; } });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* The experience also works without storage. */ } }, [key, value]);
  return [value, setValue];
}

function PlaceContent({ id, sound }: { id: PlaceId; sound: boolean }) {
  if (id === 'about') return <>
    <div className="panel-eyebrow"><span/> THE STUDIO / ABOUT ME</div>
    <h2>Good software.<br/><span>A human touch.</span></h2>
    <p className="panel-lead">I’m Idris, a software developer with 8 years of turning interesting problems into things people can use.</p>
    <p>My work spans the full stack, with a foundation in computer networking and security. I care about clear thinking, maintainable code, and the small details that make an experience feel right.</p>
    <div className="stat-row"><div><strong>08</strong><span>years of building</span></div><div><strong>∞</strong><span>things to explore</span></div><div><strong>01</strong><span>curious human</span></div></div>
    <h3>Inside my toolkit</h3><div className="tags">{['PHP & Laravel', 'Vue.js & Nuxt', 'Node.js & Express', 'Go', 'Network security'].map(tag=><span key={tag}>{tag}</span>)}</div>
    <div className="personal-note"><Sparkles size={20}/><p>Growing is better together. I also volunteer as a mentor for people finding their feet in software development.</p></div>
    <a className="text-link" href="https://www.mentoring-club.com/profiles/idris-lawal" target="_blank" rel="noreferrer">Meet me at The Mentoring Club <ArrowUpRight size={16}/></a>
  </>;
  if (id === 'work') return <ProjectArcade sound={sound}/>;
  if (id === 'podcast') return <PodcastRadio sound={sound}/>;
  if (id === 'writing') return <>
    <div className="panel-eyebrow green"><span/> THE GARDEN / WORDS & IDEAS</div>
    <h2>Learn something.<br/><span>Pass it on.</span></h2>
    <p className="panel-lead">Writing helps me think. Sharing helps the next person get a little further.</p>
    <div className="article-list">
      <a href="https://blog.logrocket.com/building-a-selectable-header-data-table-with-vue-js-and-vuetify/" target="_blank" rel="noreferrer"><span className="small-label">LOGROCKET · 5 MIN READ</span><h3>Building a selectable header data table with Vue.js and Vuetify</h3><span className="article-bottom">January 2021 <ArrowUpRight size={19}/></span></a>
      <a href="https://blog.logrocket.com/vue-js-simplified-components-props-and-slots/" target="_blank" rel="noreferrer"><span className="small-label">LOGROCKET · 8 MIN READ</span><h3>Vue.js simplified: Components, props, and slots</h3><span className="article-bottom">December 2020 <ArrowUpRight size={19}/></span></a>
      <a href="https://blog.logrocket.com/author/idrislawal/" target="_blank" rel="noreferrer"><span className="small-label">LOGROCKET · 7 MIN READ</span><h3>The most important features of all major browsers</h3><span className="article-bottom">October 2020 <ArrowUpRight size={19}/></span></a>
    </div>
    <div className="personal-note"><BookOpen size={22}/><p>Starting your developer journey? Let’s make the next step a little less daunting.</p></div>
    <a className="text-link" href="https://www.mentoring-club.com/profiles/idris-lawal" target="_blank" rel="noreferrer">Find me on The Mentoring Club <ArrowUpRight size={16}/></a>
  </>;
  return <>
    <div className="panel-eyebrow orange"><span/> THE PORTAL / SAY HELLO</div>
    <div className="contact-art"><span>hello<span className="contact-star">✳</span></span><div className="contact-orbit"/></div>
    <h2>Great things start<br/><span>with a hello.</span></h2>
    <p className="panel-lead">An interesting problem, a new collaboration, or a good conversation. I’d love to hear what’s on your mind.</p>
    <a className="primary-button contact-button" href={linkedin} target="_blank" rel="noreferrer"><Linkedin size={18}/> Let’s connect on LinkedIn <ArrowUpRight size={18}/></a>
    <a className="contact-secondary" href="https://www.mentoring-club.com/profiles/idris-lawal" target="_blank" rel="noreferrer"><span><strong>Looking for a mentor?</strong><small>Find me at The Mentoring Club</small></span><ArrowUpRight size={21}/></a>
    <p className="contact-footnote">From Nigeria, with curiosity. <span>↗</span> Open to a world of possibilities.</p>
  </>;
}

export default function App() {
  const [night,setNight]=useStored('idris-night',false);
  const [sound,setSound]=useStored('idris-sound',false);
  const [visited,setVisited]=useStored<PlaceId[]>('idris-visited',[]);
  const [active,setActive]=useState<PlaceId|null>(null);
  const [adventure,setAdventure]=useState<Adventure|null>(null);
  const [duck,setDuck]=useStored('idris-duck',true);
  const [solved,setSolved]=useStored<BugId[]>('idris-bugs',[]);
  const [shipped,setShipped]=useStored('idris-shipped',false);
  const [hunt,setHunt]=useState(false);
  const [selectedBug,setSelectedBug]=useState<BugId|null>(null);
  const [snapshot,setSnapshot]=useState<string|null>(null);
  const capture=useRef<(()=>string)|null>(null);
  const [mode,setMode]=useState<'play'|'read'>('play');
  const [help,setHelp]=useState(false);
  const [sparksFound,setSparksFound]=useState<number[]>([]);
  const sparks=sparksFound.length;
  const [toast,setToast]=useState('');
  const [command,setCommand]=useState<{type:'start'|'jump'|'reset'|'launch';nonce:number}|null>(null);
  const [reducedMotion,setReducedMotion]=useState(()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [localTime,setLocalTime]=useState('');
  const panelRef=useRef<HTMLDivElement>(null);
  const returnFocus=useRef<HTMLElement|null>(null);
  const firstRender=useRef(true);

  useEffect(()=>{ const query=window.matchMedia('(prefers-reduced-motion: reduce)'); const listener=()=>setReducedMotion(query.matches);query.addEventListener('change',listener);return()=>query.removeEventListener('change',listener); },[]);
  useEffect(()=>{ document.documentElement.dataset.theme=night?'night':'day'; },[night]);
  useEffect(()=>{const tick=()=>setLocalTime(new Intl.DateTimeFormat('en-GB',{timeZone:'Africa/Lagos',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date()));tick();const interval=setInterval(tick,30000);return()=>clearInterval(interval);},[]);
  useEffect(()=>{if(!toast)return;const timeout=setTimeout(()=>setToast(''),4200);return()=>clearTimeout(timeout);},[toast]);
  useEffect(()=>{
    if(!active&&!help&&!adventure)return;
    returnFocus.current=document.activeElement as HTMLElement;
    const previous=document.body.style.overflow;document.body.style.overflow='hidden';
    const timer=setTimeout(()=>panelRef.current?.querySelector<HTMLElement>(adventure==='terminal'?'input':'button')?.focus(),30);
    const keydown=(e:KeyboardEvent)=>{
      if(e.key==='Escape'){setActive(null);setHelp(false);setAdventure(null);}
      if(e.key==='Tab'){
        const nodes=panelRef.current?.querySelectorAll<HTMLElement>('button:not([tabindex="-1"]):not(:disabled), a[href], input, textarea, select, [tabindex="0"]');if(!nodes?.length)return;
        const first=nodes[0],last=nodes[nodes.length-1];
        if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
      }
    };
    window.addEventListener('keydown',keydown);
    return()=>{clearTimeout(timer);document.body.style.overflow=previous;window.removeEventListener('keydown',keydown);returnFocus.current?.focus({preventScroll:true});};
  },[active,help,adventure]);
  useEffect(()=>{
    const keydown=(e:KeyboardEvent)=>{
      if(e.key!=='`'||e.repeat||e.ctrlKey||e.metaKey||e.altKey)return;
      const target=e.target as HTMLElement;
      if(target.closest('input,textarea,select,[contenteditable="true"]'))return;
      e.preventDefault();setActive(null);setHelp(false);setAdventure(previous=>previous==='terminal'?null:'terminal');
    };
    window.addEventListener('keydown',keydown);return()=>window.removeEventListener('keydown',keydown);
  },[]);
  useEffect(()=>{if(firstRender.current){firstRender.current=false;return;}if(sparks===8){setToast('All 8 sparks collected. Curiosity looks good on you!');playSound('discover',sound);}},[sparks,sound]);
  function visit(id:PlaceId){
    setHelp(false);setAdventure(null);setActive(id);
    if(!visited.includes(id)){
      const next=[...visited,id];setVisited(next);
      setToast(next.length===places.length?'World explorer! You discovered every corner.':`${places.find(p=>p.id===id)!.name} discovered. +25 XP`);
      playSound('discover',sound);
    }else playSound('click',sound);
  }
  const sendCommand=(type:'start'|'jump'|'reset'|'launch')=>setCommand({type,nonce:Date.now()});
  function openAdventure(id:Adventure){
    if(id==='postcard'){try{setSnapshot(mode==='play'?capture.current?.()??null:null);}catch{setSnapshot(null);}}
    setActive(null);setHelp(false);setAdventure(id);playSound('click',sound);
  }
  function inspectBug(id:BugId){setSelectedBug(id);openAdventure('bugs');}
  function startHunt(){
    setHunt(true);setAdventure(null);setMode('play');
    setToast('Bug hunt started. Look for three coral bugs along the paths.');
    requestAnimationFrame(()=>document.querySelector('.world-area')?.scrollIntoView({behavior:reducedMotion?'instant':'smooth',block:'center'}));
  }
  const icons={about:Code2,work:Gamepad2,writing:BookOpen,podcast:Radio,contact:ArrowUpRight};

  return <div className="app-shell">
    <a href="#destinations" className="skip-link">Skip to portfolio content</a>
    <header className="site-header">
      <button className="wordmark" aria-label="idris.ng home" onClick={()=>{setMode('play');setActive(null);window.scrollTo({top:0,behavior:reducedMotion?'instant':'smooth'});}}><span className="brand-symbol">il<span>✳</span></span><span>idris<span className="wordmark-dot">.</span>ng</span></button>
      <nav aria-label="Main navigation"><button onClick={()=>visit('about')}>About</button><button onClick={()=>visit('work')}>Work</button><button onClick={()=>visit('writing')}>Writing</button><button className="podcast-nav" onClick={()=>visit('podcast')}><Radio size={13}/> BytesBurn</button></nav>
      <button className="hello-button" onClick={()=>visit('contact')}>Say hello <ArrowUpRight size={17}/></button>
    </header>

    <main>
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <div className="eyebrow"><span className="status-dot"/> SOFTWARE DEVELOPER. CURIOUS HUMAN.</div>
          <h1 id="hero-title">Serious about <br/>code.<br/><span>Playful by<br className="desktop-break"/> nature<span className="orange-dot">.</span></span></h1>
          <p>I’m Idris Lawal. For 8 years, I’ve been<br className="desktop-break"/> turning complex problems into thoughtful<br className="desktop-break"/> digital experiences.</p>
          <p className="hero-invitation">Building SubSync & Clippy. Behind the mic at BytesBurn.</p>
          <div className="hero-actions"><button className="primary-button" onClick={()=>{if(mode==='read')setMode('play');sendCommand('start');playSound('click',sound);if(window.innerWidth<=800){document.querySelector('.world-area')?.scrollIntoView({behavior:reducedMotion?'instant':'smooth',block:'center'});setToast('You’re in! Tap open ground to wander. Tap a label to explore.');}else setToast('You’re in! Walk with WASD or arrow keys. Space to jump.');}}><Gamepad2 size={20}/> Let’s explore <ArrowRight size={18}/></button><button className="browse-link" onClick={()=>{setMode(mode==='play'?'read':'play');playSound('click',sound);}}>{mode==='play'?'Just browsing?':'Back to the world'} <ArrowUpRight size={15}/></button></div>
          <div className="hero-meta"><span className="tiny-globe">◎</span> BASED IN NIGERIA <span className="meta-divider">/</span> BUILDING FOR EVERYWHERE</div>
        </div>

        <div className={`world-area ${mode==='read'?'reading-mode':''}`}>
          <div className="world-topline"><span><i/> IDRIS.NG <span className="world-version">/ V.02</span></span><div className="mode-switch" aria-label="Portfolio view"><button className={mode==='play'?'selected':''} onClick={()=>setMode('play')} aria-pressed={mode==='play'}><Gamepad2 size={14}/> Play</button><button className={mode==='read'?'selected':''} onClick={()=>setMode('read')} aria-pressed={mode==='read'}><BookOpen size={13}/> Read</button></div></div>
          {mode==='play'?<>
            <div className="world-annotation">a few things that make me, me.<svg viewBox="0 0 65 42" aria-hidden="true"><path d="M3 6C33 0 18 40 55 28m-7-5 8 5-8 7"/></svg></div>
            <Suspense fallback={<div className="world"><div className="world-loading">Growing a little world…</div></div>}><World night={night} sound={sound} paused={!!active||help||!!adventure} reducedMotion={reducedMotion} onVisit={visit} onCollect={index=>setSparksFound(previous=>previous.includes(index)?previous:[...previous,index])} collected={sparksFound} visited={visited} command={command} duck={duck} onDuck={()=>openAdventure('duck')} hunt={hunt} solved={solved} onBug={inspectBug} onCapture={fn=>{capture.current=fn;}}/></Suspense>
            <div className="world-underlay"><span className="coordinate">6°27′ N &nbsp; 3°23′ E</span><button className="player-note" aria-label="Make your character jump" title="A little jump of joy" onClick={()=>sendCommand('jump')}><span/> THAT LITTLE HUMAN? TAP TO JUMP. <ArrowDownLeft size={15}/></button></div>
          </>:<div className="reading-overview"><span className="reading-intro">A little less wandering.<br/><em>The same curiosity.</em></span><p>All the corners of my world, one click away.</p>{places.map(place=>{const Icon=icons[place.id];return <button key={place.id} onClick={()=>visit(place.id)}><span className="reading-icon" style={{color:place.color}}><Icon size={25}/></span><span><strong>{place.name}</strong><small>{place.subtitle}</small></span><ArrowUpRight size={19}/></button>;})}</div>}
          <div className="world-toolbar"><div className="exploration-progress"><Compass size={17}/><span><strong>{visited.length}/{places.length}</strong> places discovered</span><span className="progress-segments">{places.map(p=><i key={p.id} className={visited.includes(p.id)?'filled':''}/>)}</span></div><div className="world-controls"><span className="spark-count" title="Collect the golden sparks around the island"><Sparkles size={14}/>{sparks}/8</span><button aria-label={sound?'Mute sound':'Enable sound'} title={sound?'Mute sound':'Enable sound'} aria-pressed={sound} onClick={()=>{setSound(!sound);playSound('collect',!sound);}}>{sound?<Volume2 size={17}/>:<VolumeX size={17}/>}</button><button aria-label={night?'Switch to daytime':'Switch to nighttime'} title={night?'Switch to daytime':'Switch to nighttime'} onClick={()=>setNight(!night)}>{night?<Sun size={17}/>:<Moon size={17}/>}</button><button aria-label="Return to starting point" title="Return to starting point" onClick={()=>{sendCommand('reset');setToast('Back at the crossroads. Where to next?');}}><RotateCcw size={15}/></button></div></div>
        </div>
      </section>

      <section className="destination-section" id="destinations" aria-label="Explore the portfolio">
        <div className="section-heading"><span>FIVE LITTLE PLACES. ONE BIG PICTURE.</span><span>Pick a place. Follow your curiosity. <ArrowDown size={13}/></span></div>
        <div className="destination-grid">{places.map(place=>{const Icon=icons[place.id];return <button className={`destination-card destination-${place.id}`} key={place.id} onClick={()=>visit(place.id)}><span className="destination-icon"><Icon size={23} strokeWidth={1.6}/></span><span className="destination-text"><strong>{place.name}</strong><small>{place.subtitle}</small></span><span className="destination-number">{visited.includes(place.id)?<Check size={15}/>:place.number}</span><ArrowUpRight size={17} className="destination-arrow"/></button>;})}</div>
      </section>
      <AdventureDock open={openAdventure} visited={visited} solved={solved} shipped={shipped}/>
      <section className="controls-strip" aria-label="Game controls"><div><span className="key-cluster"><kbd>W</kbd><span><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd></span></span><span>Move around</span><span className="controls-or">or click to wander</span></div><span className="control-separator"/><div><kbd className="wide-key">SPACE</kbd><span>A little jump of joy</span></div><span className="control-separator"/><div><span className="orange-spark">✧</span><span>Collect sparks. Discover things.</span></div><button onClick={()=>{setActive(null);setHelp(true);}}>How to play <span>?</span></button></section>
    </main>

    <footer className="site-footer"><span>Made with intention. And a little imagination.</span><span className="footer-center">© {new Date().getFullYear()} Idris Lawal</span><a href={linkedin} target="_blank" rel="noreferrer">LET’S CONNECT <ArrowUpRight size={14}/></a><span className="local-time"><span className="status-dot"/>{localTime} WAT</span></footer>
    <div className={`toast ${toast?'visible':''}`} role="status" aria-live="polite"><span className="toast-icon"><Sparkles size={17}/></span>{toast}</div>
    {adventure&&<div className="modal-backdrop" onClick={()=>setAdventure(null)}><div className={`detail-panel adventure-panel adventure-${adventure}`} ref={panelRef} role="dialog" aria-modal="true" aria-label={adventureNames[adventure]} onClick={e=>e.stopPropagation()}><button className="panel-close" aria-label="Close panel" onClick={()=>setAdventure(null)}><X size={21}/></button><AdventurePanel key={adventure} id={adventure} visited={visited} solved={solved} onSolve={id=>setSolved(previous=>previous.includes(id)?previous:[...previous,id])} selectedBug={selectedBug} onSelectBug={setSelectedBug} onHunt={startHunt} duck={duck} onDuck={()=>setDuck(previous=>!previous)} night={night} onNight={setNight} sound={sound} onSound={setSound} onVisit={visit} reducedMotion={reducedMotion} onLaunch={()=>sendCommand('launch')} onShipped={()=>setShipped(true)} onPostcard={()=>openAdventure('postcard')} snapshot={snapshot} sparks={sparks} shipped={shipped}/></div></div>}
    {(active||help)&&<div className="modal-backdrop" onClick={()=>{setActive(null);setHelp(false);}}><div className={`detail-panel ${help?'help-panel':''}`} ref={panelRef} role="dialog" aria-modal="true" aria-label={help?'How to play':places.find(p=>p.id===active)?.name} onClick={e=>e.stopPropagation()}><button className="panel-close" aria-label="Close panel" onClick={()=>{setActive(null);setHelp(false);}}><X size={21}/></button>{help?<><div className="panel-eyebrow"><span/> A FIELD GUIDE TO THIS LITTLE WORLD</div><h2>Follow your<br/><span>curiosity.</span></h2><p className="panel-lead">There’s no wrong way to explore. Take your time. Enjoy the detours.</p><div className="help-instructions"><div><Gamepad2/><span><strong>Make your move</strong><p>Use WASD or arrow keys. You can also click or tap any open ground to walk there.</p></span></div><div><Map/><span><strong>Discover all five places</strong><p>Click a floating label, or walk up to a place and press E. Each new discovery earns 25 XP. Try the cartridges in the arcade and tune in at the radio.</p></span></div><div><Sparkles/><span><strong>Find your spark</strong><p>Walk through all 8 golden sparks scattered along the paths. Press Space for a happy little jump.</p></span></div><div><Volume2/><span><strong>Set the mood</strong><p>Turn on sound for tiny musical rewards. Try the moon button to see the world after dark.</p></span></div></div><button className="primary-button" onClick={()=>{setHelp(false);sendCommand('start');}}>I’m ready to explore <ArrowRight size={17}/></button><p className="help-footer">Prefer to read? Every place is also available in Read mode.</p></>:active&&<PlaceContent id={active} sound={sound}/>} {!help&&active&&<div className="panel-navigation">{places.map(p=><button key={p.id} className={active===p.id?'current':''} onClick={()=>visit(p.id)} aria-label={`Go to ${p.name}`}>{p.number}<span>{p.name}</span><ChevronRight size={13}/></button>)}</div>}</div></div>}
  </div>;
}
