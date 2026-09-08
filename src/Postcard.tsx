import { useEffect, useRef, useState } from 'react';
import { Download } from 'lucide-react';
import { places, type PlaceId } from './content';

export default function Postcard({ snapshot, visited, sparks, solved, night, shipped }: { snapshot: string | null; visited: PlaceId[]; sparks: number; solved: number; night: boolean; shipped: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [name, setName] = useState('A curious visitor');
  const [status, setStatus] = useState('');
  const [ready, setReady] = useState(false);
  const alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  useEffect(() => {
    let cancelled = false;
    setReady(false);
    const ctx = canvas.current?.getContext('2d'); if (!ctx) { setStatus('Canvas is unavailable in this browser.'); return; }
    function draw(island?: HTMLImageElement) {
      if (cancelled || !ctx) return;
      ctx.fillStyle = '#f6f3e9'; ctx.fillRect(0, 0, 1200, 800);
      ctx.fillStyle = night ? '#25372f' : '#e3e9d8'; ctx.fillRect(26, 26, 1148, 450);
      if (island) {
        const scale = Math.min(1040 / island.width, 450 / island.height);
        const w = island.width * scale, h = island.height * scale;
        ctx.drawImage(island, (1200 - w) / 2, 28 + (450 - h) / 2, w, h);
      } else {
        // Code-drawn souvenir for Read mode and browsers without WebGL.
        ctx.fillStyle = '#b8caa2'; ctx.beginPath(); ctx.moveTo(210, 280); ctx.lineTo(600, 110); ctx.lineTo(990, 280); ctx.lineTo(600, 430); ctx.closePath(); ctx.fill();
        places.forEach((p, i) => { const x = 320 + i * 135, y = 210 + (i % 2) * 65; ctx.fillStyle = p.color; ctx.fillRect(x, y, 80, 68); ctx.fillStyle = '#fff9eb'; ctx.font = '24px sans-serif'; ctx.fillText(p.number, x + 23, y + 43); });
      }
      ctx.fillStyle = night ? '#f6f3e9' : '#303a32'; ctx.font = 'bold 22px monospace'; ctx.fillText('A LITTLE WORLD. A GOOD DETOUR.', 58, 65);
      ctx.font = '16px monospace'; ctx.fillText(island ? 'ISLAND SNAPSHOT' : 'ILLUSTRATED EDITION', 58, 448);
      ctx.strokeStyle = '#d6d7c9'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(780, 510); ctx.lineTo(780, 752); ctx.stroke();
      ctx.fillStyle = '#303a32'; ctx.font = 'bold 41px sans-serif'; ctx.fillText('I took the scenic route', 58, 542); ctx.fillText('through idris.ng.', 58, 592);
      ctx.fillStyle = '#e05e37'; ctx.font = '24px sans-serif'; ctx.fillText(`With curiosity, ${name.trim() || 'a curious visitor'}`, 58, 645, 690);
      ctx.fillStyle = '#687363'; ctx.font = '19px monospace'; ctx.fillText(`${visited.length}/5 places · ${sparks}/8 sparks · ${solved}/3 bugs`, 58, 697);
      ctx.font = '16px monospace'; ctx.fillText(shipped ? 'MISSION SHIPPED / IL–01' : 'NIGERIA → EVERYWHERE', 58, 737);
      ctx.save(); ctx.translate(989, 584); ctx.rotate(-.13); ctx.strokeStyle = '#e05e37'; ctx.lineWidth = 3; ctx.strokeRect(-125, -65, 250, 130); ctx.fillStyle = '#e05e37'; ctx.textAlign = 'center'; ctx.font = 'bold 39px monospace'; ctx.fillText('idris.ng', 0, 0); ctx.font = '16px monospace'; ctx.fillText(shipped ? 'FLIGHT APPROVED' : 'EXPLORER POST', 0, 34); ctx.restore();
      ctx.fillStyle = '#687363'; ctx.font = '17px monospace'; ctx.fillText('NO TRACKING. JUST A MEMORY.', 815, 713);
      setReady(true);
    }
    if (snapshot) { const img = new Image(); img.onload = () => draw(img); img.onerror = () => draw(); img.src = snapshot; }
    else draw();
    return () => { cancelled = true; };
  }, [snapshot, name, visited, sparks, solved, night, shipped]);
  function download() {
    if (!canvas.current || !ready) return;
    try {
      canvas.current.toBlob(blob => {
        if (!alive.current) return;
        if (!blob) { setStatus('Could not make the image. Please try again.'); return; }
        const url = URL.createObjectURL(blob); const anchor = document.createElement('a');
        anchor.href = url; anchor.download = 'my-idris-ng-postcard.png'; document.body.append(anchor); anchor.click(); anchor.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        setStatus('Your postcard is ready. Check your downloads.');
      }, 'image/png');
    } catch { setStatus('This browser could not export the postcard.'); }
  }
  return <><div className="panel-eyebrow">EXPLORER POST / SENT WITH CURIOSITY</div><h2>A little memory.<br/><span>Yours to keep.</span></h2><p className="panel-lead">Your island, your discoveries, your signature. A souvenir made entirely in your browser.</p><label className="postcard-label" htmlFor="postcard-name">Sign your postcard</label><input className="postcard-name" id="postcard-name" maxLength={28} value={name} onChange={e => setName(e.target.value)} autoComplete="off"/><div className="postcard-preview"><canvas ref={canvas} width={1200} height={800} role="img" aria-label={`Explorer postcard for ${name || 'a curious visitor'}: ${visited.length} places discovered, ${sparks} sparks, ${solved} bugs resolved${shipped ? ', mission shipped' : ''}.`}/></div><button className="primary-button" disabled={!ready} onClick={download}><Download size={18}/> Download postcard <span className="download-format">PNG</span></button><p className="experience-fineprint">No signup. Your name and image are never uploaded. {!snapshot && 'Read mode and non-WebGL browsers receive an illustrated island.'}</p><p role="status">{status}</p></>;
}
