import React, { useState, useEffect, useCallback, useRef } from "react";

// ─── SUPABASE CONFIG ──────────────────────────────────────────────────────────
const SUPABASE_URL = "https://tnbnilsyvwchdwceijwc.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuYm5pbHN5dndjaGR3Y2VpandjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2NDIzMjUsImV4cCI6MjA4ODIxODMyNX0.Z3YWAsYBARZT-3nZQi4Mf0M0o-V_KuFXzbjM6How51k";

const sb = {
  async from(table) {
    const base = `${SUPABASE_URL}/rest/v1/${table}`;
    const headers = {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    };
    return {
      async select(query = "*") {
        const res = await fetch(`${base}?select=${query}`, { headers });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      },
      async upsert(data) {
        const res = await fetch(base, {
          method: "POST",
          headers: { ...headers, Prefer: "resolution=merge-duplicates,return=representation" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      },
      async delete(match) {
        const params = Object.entries(match).map(([k,v]) => `${k}=eq.${encodeURIComponent(v)}`).join("&");
        const res = await fetch(`${base}?${params}`, { method: "DELETE", headers });
        if (!res.ok) throw new Error(await res.text());
        return true;
      },
    };
  }
};

// ─── 2026 F1 CALENDAR ─────────────────────────────────────────────────────────
const RACES = [
  { id:1,  round:1,  name:"Australian Grand Prix",         circuit:"Albert Park",                date:"2026-03-08", country:"🇦🇺" },
  { id:2,  round:2,  name:"Chinese Grand Prix",            circuit:"Shanghai International",     date:"2026-03-15", country:"🇨🇳", sprint:true },
  { id:3,  round:3,  name:"Japanese Grand Prix",           circuit:"Suzuka",                     date:"2026-03-29", country:"🇯🇵" },
  { id:4,  round:4,  name:"Bahrain Grand Prix",            circuit:"Bahrain International",      date:"2026-04-12", country:"🇧🇭" },
  { id:5,  round:5,  name:"Saudi Arabian Grand Prix",      circuit:"Jeddah Corniche",            date:"2026-04-19", country:"🇸🇦" },
  { id:6,  round:6,  name:"Miami Grand Prix",              circuit:"Miami International",        date:"2026-05-03", country:"🇺🇸", sprint:true },
  { id:7,  round:7,  name:"Canadian Grand Prix",           circuit:"Circuit Gilles Villeneuve",  date:"2026-05-24", country:"🇨🇦", sprint:true },
  { id:8,  round:8,  name:"Monaco Grand Prix",             circuit:"Circuit de Monaco",          date:"2026-06-07", country:"🇲🇨" },
  { id:9,  round:9,  name:"Spanish Grand Prix",            circuit:"Circuit de Barcelona",       date:"2026-06-14", country:"🇪🇸" },
  { id:10, round:10, name:"Austrian Grand Prix",           circuit:"Red Bull Ring",              date:"2026-06-28", country:"🇦🇹" },
  { id:11, round:11, name:"British Grand Prix",            circuit:"Silverstone",                date:"2026-07-05", country:"🇬🇧", sprint:true },
  { id:12, round:12, name:"Belgian Grand Prix",            circuit:"Spa-Francorchamps",          date:"2026-07-19", country:"🇧🇪" },
  { id:13, round:13, name:"Hungarian Grand Prix",          circuit:"Hungaroring",                date:"2026-07-26", country:"🇭🇺" },
  { id:14, round:14, name:"Dutch Grand Prix",              circuit:"Zandvoort",                  date:"2026-08-23", country:"🇳🇱", sprint:true },
  { id:15, round:15, name:"Italian Grand Prix",            circuit:"Monza",                      date:"2026-09-06", country:"🇮🇹" },
  { id:16, round:16, name:"Madrid Grand Prix",             circuit:"Madrid Street Circuit",      date:"2026-09-13", country:"🇪🇸" },
  { id:17, round:17, name:"Azerbaijan Grand Prix",         circuit:"Baku City Circuit",          date:"2026-09-26", country:"🇦🇿" },
  { id:18, round:18, name:"Singapore Grand Prix",          circuit:"Marina Bay Street",          date:"2026-10-11", country:"🇸🇬", sprint:true },
  { id:19, round:19, name:"United States Grand Prix",      circuit:"Circuit of the Americas",    date:"2026-10-25", country:"🇺🇸" },
  { id:20, round:20, name:"Mexico City Grand Prix",        circuit:"Autodromo Hermanos Rodriguez",date:"2026-11-01", country:"🇲🇽" },
  { id:21, round:21, name:"Sao Paulo Grand Prix",          circuit:"Interlagos",                 date:"2026-11-08", country:"🇧🇷" },
  { id:22, round:22, name:"Las Vegas Grand Prix",          circuit:"Las Vegas Strip",            date:"2026-11-21", country:"🇺🇸" },
  { id:23, round:23, name:"Qatar Grand Prix",              circuit:"Lusail",                     date:"2026-11-29", country:"🇶🇦" },
  { id:24, round:24, name:"Abu Dhabi Grand Prix",          circuit:"Yas Marina",                 date:"2026-12-06", country:"🇦🇪" },
];

const DRIVERS = [
  "Lando Norris","Oscar Piastri",
  "Charles Leclerc","Lewis Hamilton",
  "George Russell","Kimi Antonelli",
  "Max Verstappen","Isack Hadjar",
  "Fernando Alonso","Lance Stroll",
  "Alex Albon","Carlos Sainz",
  "Liam Lawson","Arvid Lindblad",
  "Pierre Gasly","Franco Colapinto",
  "Esteban Ocon","Oliver Bearman",
  "Nico Hulkenberg","Gabriel Bortoleto",
  "Valtteri Bottas","Sergio Perez",
];

const PLAYERS = [
  { name:"Kayleigh", color:"#FF1493" },
  { name:"Sarah",    color:"#1E90FF" },
  { name:"Nico",     color:"#00C851" },
];

const ADMIN_PASSWORD = "f1podium2026";

// ─── SCORING ──────────────────────────────────────────────────────────────────
function calcScore(picks, result) {
  if (!result || !picks) return 0;
  let score = 0;
  ["p1","p2","p3"].forEach(pos => {
    if (!picks[pos]) return;
    if (picks[pos] === result[pos]) score += 3;
    else if (Object.values(result).includes(picks[pos])) score += 1;
  });
  return score;
}

// ─── DEADLINE ─────────────────────────────────────────────────────────────────
function getDeadlineUTC(raceDateStr) {
  const [y,m,d] = raceDateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m-1, d-4+1, 5, 59, 0, 0));
}
function isLocked(raceDateStr) { return Date.now() > getDeadlineUTC(raceDateStr).getTime(); }
function formatDeadline(raceDateStr) {
  const [y,m,d] = raceDateStr.split("-").map(Number);
  const wed = new Date(Date.UTC(y, m-1, d-4));
  return wed.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",timeZone:"UTC"}) + " at 11:59 PM MDT";
}
function countdown(raceDateStr) {
  const diff = getDeadlineUTC(raceDateStr).getTime() - Date.now();
  if (diff <= 0) return null;
  const d = Math.floor(diff/86400000), h = Math.floor((diff%86400000)/3600000), min = Math.floor((diff%3600000)/60000);
  if (d > 0) return `${d}d ${h}h remaining`;
  if (h > 0) return `${h}h ${min}m remaining`;
  return `${min}m remaining`;
}

// ─── JOLPICA API ──────────────────────────────────────────────────────────────
async function fetchRaceResult(round) {
  const res = await fetch(`https://api.jolpi.ca/ergast/f1/2026/${round}/results.json?limit=3`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const races = data?.MRData?.RaceTable?.Races;
  if (!races || races.length === 0) return null;
  const top3 = races[0].Results?.slice(0,3);
  if (!top3 || top3.length < 3) return null;
  const map = top3.map(r => {
    const full = `${r.Driver.givenName} ${r.Driver.familyName}`;
    return DRIVERS.find(d => d.toLowerCase()===full.toLowerCase())
      || DRIVERS.find(d => d.split(" ").pop().toLowerCase()===r.Driver.familyName.toLowerCase())
      || full;
  });
  return { p1:map[0], p2:map[1], p3:map[2] };
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  // picks shape: { [raceId]: { [playerName]: {p1,p2,p3} } }
  const [picks,    setPicks]    = useState({});
  const [results,  setResults]  = useState({});
  const [screen,   setScreen]   = useState("picks");
  const [selectedRace, setSelectedRace] = useState(() => {
    const today = new Date();
    const next = RACES.find(r => new Date(r.date+"T12:00:00Z") >= today);
    return (next || RACES[RACES.length-1]).id;
  });
  const [flash,        setFlash]        = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [fetchStatus,  setFetchStatus]  = useState({});
  const [lastRefresh,  setLastRefresh]  = useState(null);
  const [adminPass,    setAdminPass]    = useState("");
  const [adminUnlocked,setAdminUnlocked]= useState(false);
  const [adminResult,  setAdminResult]  = useState({p1:"",p2:"",p3:""});
  const pollRef = useRef(null);

  const showFlash = (msg, ms=3000) => { setFlash(msg); setTimeout(()=>setFlash(null), ms); };

  // ── LOAD ALL DATA FROM SUPABASE ───────────────────────────────────────────
  const loadAll = useCallback(async () => {
    try {
      const [picksRows, resultsRows] = await Promise.all([
        (await sb.from("picks")).select("*"),
        (await sb.from("results")).select("*"),
      ]);

      // Rebuild picks map
      const picksMap = {};
      for (const row of picksRows) {
        if (!picksMap[row.race_id]) picksMap[row.race_id] = {};
        picksMap[row.race_id][row.player] = { p1: row.p1||"", p2: row.p2||"", p3: row.p3||"" };
      }
      setPicks(picksMap);

      // Rebuild results map
      const resultsMap = {};
      for (const row of resultsRows) {
        resultsMap[row.race_id] = { p1: row.p1, p2: row.p2, p3: row.p3 };
      }
      setResults(resultsMap);
    } catch (e) {
      showFlash("⚠️ Could not connect to database. Check your connection.", 5000);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, []);

  // Poll for updates every 30 seconds (keeps all devices in sync)
  useEffect(() => {
    pollRef.current = setInterval(loadAll, 30000);
    return () => clearInterval(pollRef.current);
  }, [loadAll]);

  // ── SAVE A PICK TO SUPABASE ───────────────────────────────────────────────
  const savePick = async (raceId, player, pos, driver) => {
    const race = RACES.find(r => r.id === raceId);
    if (isLocked(race.date))  { showFlash("🔒 Picks are locked for this race!"); return; }
    if (results[raceId])      { showFlash("🔒 This race already has a result!"); return; }

    const cur = picks[raceId]?.[player] || { p1:"", p2:"", p3:"" };

    // Conflict: same driver at same position by another player
    if (driver) {
      const takenByOthers = PLAYERS.filter(p => p.name !== player)
        .map(p => picks[raceId]?.[p.name]?.[pos])
        .filter(Boolean);
      if (takenByOthers.includes(driver)) {
        showFlash(`❌ ${driver} is already picked for P${pos.slice(1)} by someone else!`); return;
      }
      if (["p1","p2","p3"].filter(p=>p!==pos).some(p => cur[p]===driver)) {
        showFlash(`❌ You already have ${driver} in another position!`); return;
      }
    }

    // Optimistic update
    const updated = { ...cur, [pos]: driver };
    setPicks(prev => ({ ...prev, [raceId]: { ...(prev[raceId]||{}), [player]: updated } }));

    // Persist to Supabase
    setSaving(true);
    try {
      await (await sb.from("picks")).upsert({
        player, race_id: raceId, p1: updated.p1, p2: updated.p2, p3: updated.p3,
        updated_at: new Date().toISOString(),
      });
    } catch (e) {
      showFlash("⚠️ Failed to save pick — check your connection");
      // Revert optimistic update
      setPicks(prev => ({ ...prev, [raceId]: { ...(prev[raceId]||{}), [player]: cur } }));
    } finally {
      setSaving(false);
    }
  };

  // ── AUTO-FETCH RESULTS FROM JOLPICA ──────────────────────────────────────
  const autoFetchResults = useCallback(async () => {
    const now = Date.now();
    const toFetch = RACES.filter(r => {
      const raceOver = now > new Date(r.date+"T15:00:00Z").getTime();
      return raceOver && !results[r.id] && fetchStatus[r.id] !== "loading";
    });
    if (toFetch.length === 0) return;

    setFetchStatus(prev => { const n={...prev}; toFetch.forEach(r=>{n[r.id]="loading";}); return n; });

    for (let i = 0; i < toFetch.length; i++) {
      const race = toFetch[i];
      await new Promise(r=>setTimeout(r, i*400));
      try {
        const result = await fetchRaceResult(race.round);
        if (result) {
          // Save to Supabase so all users get it
          await (await sb.from("results")).upsert({
            race_id: race.id, p1: result.p1, p2: result.p2, p3: result.p3,
            updated_at: new Date().toISOString(),
          });
          setResults(prev => ({ ...prev, [race.id]: result }));
          setFetchStatus(prev => ({ ...prev, [race.id]: "done" }));
        } else {
          setFetchStatus(prev => ({ ...prev, [race.id]: "pending" }));
        }
      } catch {
        setFetchStatus(prev => ({ ...prev, [race.id]: "error" }));
      }
    }
    setLastRefresh(new Date());
  }, [results, fetchStatus]);

  useEffect(() => { if (!loading) autoFetchResults(); }, [loading]);
  useEffect(() => {
    const t = setInterval(() => autoFetchResults(), 30*60*1000);
    return () => clearInterval(t);
  }, []);

  // ── SCORING ───────────────────────────────────────────────────────────────
  const playerPick = (raceId, name) => picks[raceId]?.[name] || { p1:"", p2:"", p3:"" };
  const totalScore = (name) =>
    Object.entries(results).reduce((sum,[id,res]) => sum + calcScore(playerPick(parseInt(id),name), res), 0);
  const leaderboard = () =>
    [...PLAYERS].map(p=>({...p, score:totalScore(p.name)})).sort((a,b)=>b.score-a.score);

  // ── ADMIN: SAVE MANUAL RESULT ─────────────────────────────────────────────
  const saveManualResult = async () => {
    const { p1, p2, p3 } = adminResult;
    if (!p1||!p2||!p3) { showFlash("Fill all 3 positions!"); return; }
    if (new Set([p1,p2,p3]).size < 3) { showFlash("Each position needs a different driver!"); return; }
    try {
      await (await sb.from("results")).upsert({
        race_id: selectedRace, p1, p2, p3, updated_at: new Date().toISOString(),
      });
      setResults(prev => ({ ...prev, [selectedRace]: { p1, p2, p3 } }));
      setAdminResult({ p1:"", p2:"", p3:"" });
      showFlash("✅ Result saved!");
    } catch { showFlash("⚠️ Failed to save result"); }
  };

  const clearResult = async () => {
    try {
      await (await sb.from("results")).delete({ race_id: selectedRace });
      setResults(prev => { const n={...prev}; delete n[selectedRace]; return n; });
      setFetchStatus(prev => { const n={...prev}; delete n[selectedRace]; return n; });
      showFlash("Result cleared.");
    } catch { showFlash("⚠️ Failed to clear result"); }
  };

  // ── RENDER ────────────────────────────────────────────────────────────────
  const race       = RACES.find(r => r.id === selectedRace);
  const locked     = isLocked(race.date);
  const raceResult = results[selectedRace];
  const cd         = countdown(race.date);

  const chipColor = (r) => {
    if (results[r.id]) return "#00C851";
    if (fetchStatus[r.id]==="loading") return "#FFD700";
    if (fetchStatus[r.id]==="pending" || isLocked(r.date)) return "#FF8C00";
    return "rgba(255,255,255,.65)";
  };

  if (loading) return (
    <div style={{ minHeight:"100vh", background:"#07070f", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", fontFamily:"'Barlow Condensed','Arial Narrow',Arial,sans-serif", color:"#fff" }}>
      <div style={{ fontSize:40, marginBottom:16 }}>🏎️</div>
      <div style={{ fontSize:18, fontWeight:700, letterSpacing:4, color:"#C8001E", textTransform:"uppercase" }}>Loading...</div>
      <div style={{ fontSize:12, color:"rgba(255,255,255,.3)", marginTop:8, letterSpacing:2 }}>Connecting to database</div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(155deg,#07070f 0%,#130008 55%,#07070f 100%)", fontFamily:"'Barlow Condensed','Arial Narrow',Arial,sans-serif", color:"#f0f0f0" }}>
      <div style={{ position:"fixed",inset:0,pointerEvents:"none",backgroundImage:"linear-gradient(rgba(200,0,40,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(200,0,40,.03) 1px,transparent 1px)",backgroundSize:"48px 48px",zIndex:0 }} />

      {/* Flash */}
      {flash && (
        <div style={{ position:"fixed",top:18,left:"50%",transform:"translateX(-50%)",background:"#C8001E",color:"#fff",padding:"10px 28px",borderRadius:3,fontWeight:700,fontSize:15,zIndex:9999,boxShadow:"0 4px 30px rgba(200,0,30,.5)",letterSpacing:1,whiteSpace:"nowrap" }}>
          {flash}
        </div>
      )}

      {/* Saving indicator */}
      {saving && (
        <div style={{ position:"fixed",bottom:18,right:18,background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.15)",color:"rgba(255,255,255,.5)",padding:"6px 14px",borderRadius:20,fontSize:12,zIndex:9999,letterSpacing:1 }}>
          💾 Saving...
        </div>
      )}

      <div style={{ position:"relative",zIndex:1,maxWidth:1040,margin:"0 auto",padding:"0 16px 80px" }}>

        {/* HEADER */}
        <div style={{ textAlign:"center",padding:"28px 0 14px" }}>
          <div style={{ fontSize:10,letterSpacing:8,color:"#C8001E",marginBottom:6,textTransform:"uppercase" }}>Formula 1 · 2026 Season</div>
          <h1 style={{ fontSize:"clamp(28px,7vw,58px)",fontWeight:900,margin:0,letterSpacing:-1,textTransform:"uppercase",background:"linear-gradient(90deg,#fff 0%,#C8001E 55%,#FF6B35 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",lineHeight:1.05 }}>
            Podium Predictor
          </h1>
          <div style={{ display:"flex",justifyContent:"center",gap:20,marginTop:10,flexWrap:"wrap" }}>
            {PLAYERS.map(p=>(
              <span key={p.name} style={{ fontSize:13,fontWeight:800,letterSpacing:3,textTransform:"uppercase",color:p.color,borderBottom:`2px solid ${p.color}`,paddingBottom:2 }}>{p.name}</span>
            ))}
          </div>
          <div style={{ marginTop:10,display:"flex",alignItems:"center",justifyContent:"center",gap:10,flexWrap:"wrap" }}>
            <div style={{ fontSize:11,color:"rgba(255,255,255,.25)",letterSpacing:1 }}>
              🔄 Live sync · Results auto-update via F1 API
              {lastRefresh && <span style={{ marginLeft:6,color:"rgba(255,255,255,.18)" }}>· {lastRefresh.toLocaleTimeString()}</span>}
            </div>
            <button onClick={()=>{ showFlash("🔄 Refreshing...",1500); loadAll(); autoFetchResults(); }} style={{ background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",color:"rgba(255,255,255,.4)",padding:"3px 12px",borderRadius:20,fontSize:11,cursor:"pointer",letterSpacing:1 }}>
              Refresh
            </button>
          </div>
        </div>

        {/* NAV */}
        <div style={{ display:"flex",gap:6,justifyContent:"center",marginBottom:22,flexWrap:"wrap" }}>
          {[["picks","📋 Picks"],["leaderboard","🏆 Standings"],["admin","⚙️ Admin"]].map(([id,label])=>(
            <button key={id} onClick={()=>setScreen(id)} style={{ padding:"9px 22px",border:"none",borderRadius:3,cursor:"pointer",fontSize:13,fontWeight:700,letterSpacing:1,background:screen===id?"#C8001E":"rgba(255,255,255,0.07)",color:screen===id?"#fff":"rgba(255,255,255,0.55)",textTransform:"uppercase" }}>
              {label}
            </button>
          ))}
        </div>

        {/* ══ PICKS ══ */}
        {screen==="picks" && (
          <div>
            {/* Race chips */}
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:10,letterSpacing:3,color:"rgba(255,255,255,.3)",marginBottom:8,textTransform:"uppercase" }}>Select Race</div>
              <div style={{ display:"flex",gap:5,flexWrap:"wrap" }}>
                {RACES.map(r=>(
                  <button key={r.id} onClick={()=>setSelectedRace(r.id)} style={{ padding:"5px 11px",border:selectedRace===r.id?"1px solid #C8001E":"1px solid transparent",borderRadius:3,cursor:"pointer",fontSize:12,fontWeight:700,background:selectedRace===r.id?"#C8001E":"rgba(255,255,255,.06)",color:selectedRace===r.id?"#fff":chipColor(r) }}>
                    {r.country} {r.id}
                  </button>
                ))}
              </div>
            </div>

            {/* Race header bar */}
            <div style={{ ...S.card,marginBottom:14,display:"flex",flexWrap:"wrap",justifyContent:"space-between",alignItems:"center",gap:12 }}>
              <div>
                <div style={{ fontSize:"clamp(16px,4vw,23px)",fontWeight:900 }}>
                  {race.country} {race.name}
                  {race.sprint && <span style={{ marginLeft:10,fontSize:11,background:"rgba(255,140,0,.18)",color:"#FF8C00",padding:"2px 8px",borderRadius:20,letterSpacing:1 }}>SPRINT WKD</span>}
                </div>
                <div style={{ fontSize:13,color:"rgba(255,255,255,.4)",marginTop:2 }}>
                  {race.circuit} · {new Date(race.date+"T12:00:00Z").toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"})}
                </div>
              </div>
              {raceResult ? (
                <div>
                  <div style={{ fontSize:10,color:"#00C851",letterSpacing:2,marginBottom:5,textAlign:"right" }}>✅ OFFICIAL RESULT</div>
                  <div style={{ display:"flex",gap:8 }}>
                    {["p1","p2","p3"].map((pos,i)=>(
                      <div key={pos} style={{ textAlign:"center",padding:"6px 12px",borderRadius:4,background:["rgba(255,215,0,.1)","rgba(192,192,192,.08)","rgba(205,127,50,.08)"][i],border:`1px solid ${["rgba(255,215,0,.25)","rgba(192,192,192,.18)","rgba(205,127,50,.18)"][i]}` }}>
                        <div style={{ fontSize:9,color:["#FFD700","#C0C0C0","#CD7F32"][i],letterSpacing:2,marginBottom:2 }}>P{i+1}</div>
                        <div style={{ fontSize:11,fontWeight:800 }}>{raceResult[pos]}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : fetchStatus[race.id]==="loading" ? (
                <div style={{ padding:"8px 16px",borderRadius:4,background:"rgba(255,215,0,.07)",border:"1px solid rgba(255,215,0,.2)" }}>
                  <div style={{ fontSize:13,fontWeight:700,color:"#FFD700" }}>⏳ FETCHING RESULT...</div>
                </div>
              ) : fetchStatus[race.id]==="pending" ? (
                <div style={{ padding:"8px 16px",borderRadius:4,background:"rgba(255,140,0,.07)",border:"1px solid rgba(255,140,0,.2)" }}>
                  <div style={{ fontSize:13,fontWeight:700,color:"#FF8C00" }}>⏳ RESULT PENDING</div>
                  <div style={{ fontSize:11,color:"rgba(255,255,255,.35)",marginTop:2 }}>API updating post-race</div>
                </div>
              ) : locked ? (
                <div style={{ padding:"8px 16px",borderRadius:4,background:"rgba(255,140,0,.07)",border:"1px solid rgba(255,140,0,.2)" }}>
                  <div style={{ fontSize:13,fontWeight:700,color:"#FF8C00" }}>🔒 PICKS LOCKED</div>
                  <div style={{ fontSize:11,color:"rgba(255,255,255,.35)",marginTop:2 }}>Awaiting race result</div>
                </div>
              ) : (
                <div style={{ padding:"8px 16px",borderRadius:4,background:"rgba(0,200,80,.07)",border:"1px solid rgba(0,200,80,.2)" }}>
                  <div style={{ fontSize:11,color:"#00C851",fontWeight:700,letterSpacing:1 }}>🟢 PICKS OPEN</div>
                  <div style={{ fontSize:11,color:"rgba(255,255,255,.4)",marginTop:2 }}>Deadline: {formatDeadline(race.date)}</div>
                  {cd && <div style={{ fontSize:12,color:"#FFD700",fontWeight:700,marginTop:2 }}>{cd}</div>}
                </div>
              )}
            </div>

            {/* Player pick cards */}
            <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(295px,1fr))",gap:14 }}>
              {PLAYERS.map(player=>{
                const myPick = playerPick(selectedRace, player.name);
                const raceScore = raceResult ? calcScore(myPick, raceResult) : null;
                const complete = myPick.p1 && myPick.p2 && myPick.p3;
                return (
                  <div key={player.name} style={{ ...S.card,borderTop:`3px solid ${player.color}`,borderColor:player.color+"33" }}>
                    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
                      <div style={{ fontWeight:900,fontSize:18 }}><span style={{ color:player.color,marginRight:6 }}>●</span>{player.name}</div>
                      <div style={{ display:"flex",gap:6,alignItems:"center" }}>
                        {!locked && !raceResult && complete && <span style={{ fontSize:11,color:"#00C851",letterSpacing:1 }}>✓ SET</span>}
                        {raceScore !== null && (
                          <div style={{ background:raceScore>0?"rgba(0,200,80,.15)":"rgba(255,255,255,.06)",color:raceScore>0?"#00C851":"rgba(255,255,255,.3)",padding:"3px 10px",borderRadius:20,fontSize:13,fontWeight:700,border:`1px solid ${raceScore>0?"rgba(0,200,80,.3)":"transparent"}` }}>
                            {raceScore>0?`+${raceScore} pts`:"0 pts"}
                          </div>
                        )}
                      </div>
                    </div>
                    {["p1","p2","p3"].map((pos,i)=>{
                      const takenByOthers = PLAYERS.filter(p=>p.name!==player.name).map(p=>picks[selectedRace]?.[p.name]?.[pos]).filter(Boolean);
                      const isExact  = raceResult && myPick[pos] && myPick[pos]===raceResult[pos];
                      const isPodium = raceResult && myPick[pos] && !isExact && Object.values(raceResult).includes(myPick[pos]);
                      const isMiss   = raceResult && myPick[pos] && !isExact && !isPodium;
                      const posCol = ["#FFD700","#C0C0C0","#CD7F32"][i];
                      return (
                        <div key={pos} style={{ marginBottom:10 }}>
                          <div style={{ fontSize:9,letterSpacing:3,color:posCol,marginBottom:4,textTransform:"uppercase",display:"flex",gap:8,alignItems:"center" }}>
                            P{i+1} — {["WINNER","SECOND","THIRD"][i]}
                            {isExact  && <span style={{ color:"#00C851",fontSize:11 }}>✅ +3 pts</span>}
                            {isPodium && <span style={{ color:"#FF8C00",fontSize:11 }}>🎯 +1 pt</span>}
                            {isMiss   && <span style={{ color:"#ff4444",fontSize:11 }}>❌ 0 pts</span>}
                          </div>
                          <select
                            value={myPick[pos]||""}
                            onChange={e=>savePick(selectedRace,player.name,pos,e.target.value)}
                            disabled={locked||!!raceResult}
                            style={{ ...S.select,borderColor:isExact?"#00C851":isPodium?"#FF8C00":"rgba(255,255,255,.12)",background:isExact?"rgba(0,200,80,.1)":isPodium?"rgba(255,140,0,.1)":"rgba(255,255,255,.05)",cursor:(locked||raceResult)?"not-allowed":"pointer",opacity:(locked||raceResult)?.8:1 }}
                          >
                            <option value="">— Pick a driver —</option>
                            {DRIVERS.map(d=>{
                              const taken = takenByOthers.includes(d) && myPick[pos]!==d;
                              return <option key={d} value={d} disabled={taken}>{taken?`✗ ${d} (taken)`:d}</option>;
                            })}
                          </select>
                        </div>
                      );
                    })}
                    {locked && !raceResult && <div style={{ fontSize:11,color:"rgba(255,140,0,.6)",marginTop:4 }}>🔒 Deadline passed</div>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══ LEADERBOARD ══ */}
        {screen==="leaderboard" && (
          <div style={{ maxWidth:660,margin:"0 auto" }}>
            <div style={S.card}>
              <h2 style={S.cardTitle}>🏆 Season Standings</h2>
              <div style={{ fontSize:12,color:"rgba(255,255,255,.3)",marginBottom:20,letterSpacing:1 }}>{Object.keys(results).length} / {RACES.length} races completed</div>
              {leaderboard().map((p,i)=>(
                <div key={p.name} style={{ display:"flex",alignItems:"center",gap:14,padding:"16px 20px",marginBottom:8,borderRadius:4,background:i===0?"rgba(255,215,0,.06)":"rgba(255,255,255,.04)",border:`1px solid ${i===0?"rgba(255,215,0,.18)":"rgba(255,255,255,.07)"}`,borderLeft:`4px solid ${p.color}` }}>
                  <div style={{ fontSize:26,minWidth:36,textAlign:"center" }}>{["🥇","🥈","🥉"][i]||`#${i+1}`}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:900,fontSize:20 }}>{p.name}</div>
                    <div style={{ fontSize:11,color:"rgba(255,255,255,.3)",letterSpacing:1 }}>
                      {Object.keys(results).filter(id=>calcScore(playerPick(parseInt(id),p.name),results[id])>0).length} scoring races
                    </div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontSize:36,fontWeight:900,color:p.color }}>{p.score}</div>
                    <div style={{ fontSize:10,color:"rgba(255,255,255,.3)",letterSpacing:3 }}>PTS</div>
                  </div>
                </div>
              ))}
            </div>

            {Object.keys(results).length > 0 && (
              <div style={{ marginTop:16,...S.card }}>
                <h3 style={{ ...S.cardTitle,fontSize:15 }}>Race-by-Race Breakdown</h3>
                <div style={{ overflowX:"auto" }}>
                  <table style={{ width:"100%",borderCollapse:"collapse",fontSize:13 }}>
                    <thead>
                      <tr>
                        <th style={S.th}>Race</th>
                        <th style={S.th}>Podium</th>
                        {PLAYERS.map(p=><th key={p.name} style={{ ...S.th,color:p.color }}>{p.name}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {RACES.filter(r=>results[r.id]).map(r=>(
                        <tr key={r.id} style={{ borderBottom:"1px solid rgba(255,255,255,.05)" }}>
                          <td style={{ ...S.td,color:"rgba(255,255,255,.5)",fontSize:12,whiteSpace:"nowrap" }}>{r.country} Rd {r.id}</td>
                          <td style={{ ...S.td,fontSize:11,color:"rgba(255,255,255,.4)",lineHeight:1.8 }}>
                            <div>🥇 {results[r.id].p1.split(" ").pop()}</div>
                            <div>🥈 {results[r.id].p2.split(" ").pop()}</div>
                            <div>🥉 {results[r.id].p3.split(" ").pop()}</div>
                          </td>
                          {PLAYERS.map(p=>{
                            const s = calcScore(playerPick(r.id,p.name),results[r.id]);
                            return <td key={p.name} style={{ ...S.td,color:s>=3?"#00C851":s>0?"#FF8C00":"rgba(255,255,255,.22)",fontWeight:s>0?700:400,fontSize:15,verticalAlign:"middle" }}>{s>0?`+${s}`:"—"}</td>;
                          })}
                        </tr>
                      ))}
                      <tr style={{ background:"rgba(200,0,30,.07)",borderTop:"1px solid rgba(200,0,30,.2)" }}>
                        <td style={{ ...S.td,fontWeight:800,color:"#C8001E",letterSpacing:1 }} colSpan={2}>TOTAL</td>
                        {PLAYERS.map(p=><td key={p.name} style={{ ...S.td,fontWeight:900,fontSize:16,color:p.color }}>{totalScore(p.name)}</td>)}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div style={{ marginTop:16,...S.card,background:"rgba(255,255,255,.02)" }}>
              <div style={{ fontSize:10,color:"#C8001E",letterSpacing:3,marginBottom:10,textTransform:"uppercase" }}>Rules</div>
              <div style={{ fontSize:13,color:"rgba(255,255,255,.55)",lineHeight:2.2 }}>
                <div>✅ <strong style={{ color:"#fff" }}>3 pts</strong> — Exact position correct</div>
                <div>🎯 <strong style={{ color:"#fff" }}>1 pt</strong> — Driver on podium, wrong position</div>
                <div>❌ <strong style={{ color:"#fff" }}>0 pts</strong> — Driver not on podium</div>
                <div style={{ marginTop:6,color:"rgba(255,255,255,.3)",fontSize:12,lineHeight:1.8 }}>
                  🔒 Picks lock <strong style={{ color:"rgba(255,255,255,.4)" }}>Wednesday 11:59 PM MDT</strong> before each race<br/>
                  🔄 Results auto-fetch from <strong style={{ color:"rgba(255,255,255,.4)" }}>Jolpica F1 API</strong> after each race<br/>
                  ☁️ All picks sync live via <strong style={{ color:"rgba(255,255,255,.4)" }}>Supabase</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══ ADMIN ══ */}
        {screen==="admin" && (
          <div style={{ maxWidth:520,margin:"0 auto" }}>
            <div style={{ ...S.card,marginBottom:14,background:"rgba(255,215,0,.04)",border:"1px solid rgba(255,215,0,.12)" }}>
              <div style={{ fontSize:11,color:"#FFD700",letterSpacing:2,marginBottom:6 }}>ℹ️ AUTO-RESULTS ACTIVE</div>
              <div style={{ fontSize:13,color:"rgba(255,255,255,.5)",lineHeight:1.7 }}>
                Results are automatically fetched from the Jolpica F1 API and saved to the shared database. Use the override below only if a result is wrong or missing after a few hours.
              </div>
            </div>

            {!adminUnlocked ? (
              <div style={S.card}>
                <h2 style={S.cardTitle}>⚙️ Admin Override</h2>
                <input type="password" value={adminPass} onChange={e=>setAdminPass(e.target.value)}
                  onKeyDown={e=>{if(e.key==="Enter"){adminPass===ADMIN_PASSWORD?setAdminUnlocked(true):showFlash("❌ Wrong password");}}}
                  placeholder="Password..." style={{ ...S.input,marginBottom:10,display:"block" }} />
                <button onClick={()=>adminPass===ADMIN_PASSWORD?setAdminUnlocked(true):showFlash("❌ Wrong password")} style={{ ...S.btn,width:"100%" }}>Unlock →</button>
                <div style={{ fontSize:11,color:"rgba(255,255,255,.18)",marginTop:12,textAlign:"center" }}>Hint: f1podium2026</div>
              </div>
            ) : (
              <div style={S.card}>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18 }}>
                  <h2 style={{ ...S.cardTitle,margin:0 }}>⚙️ Manual Override</h2>
                  <button onClick={()=>setAdminUnlocked(false)} style={{ background:"none",border:"1px solid rgba(255,255,255,.15)",color:"rgba(255,255,255,.4)",padding:"4px 10px",borderRadius:3,cursor:"pointer",fontSize:11 }}>Lock</button>
                </div>
                <div style={{ marginBottom:18 }}>
                  <div style={S.lbl}>Select Race</div>
                  <select value={selectedRace} onChange={e=>{setSelectedRace(parseInt(e.target.value));setAdminResult({p1:"",p2:"",p3:""});}} style={S.select}>
                    {RACES.map(r=><option key={r.id} value={r.id}>{r.country} Rd {r.id} — {r.name}{results[r.id]?" ✅":""}</option>)}
                  </select>
                </div>
                {results[selectedRace] ? (
                  <div>
                    <div style={{ fontSize:12,color:"rgba(255,255,255,.4)",marginBottom:12 }}>Current result:</div>
                    {["p1","p2","p3"].map((pos,i)=>(
                      <div key={pos} style={{ display:"flex",alignItems:"center",gap:12,padding:"10px 14px",marginBottom:6,borderRadius:4,background:"rgba(0,200,80,.07)",border:"1px solid rgba(0,200,80,.18)" }}>
                        <span style={{ color:["#FFD700","#C0C0C0","#CD7F32"][i],fontWeight:700 }}>P{i+1}</span>
                        <span style={{ fontWeight:800 }}>{results[selectedRace][pos]}</span>
                      </div>
                    ))}
                    <button onClick={clearResult} style={{ ...S.btn,width:"100%",marginTop:14,background:"transparent",border:"1px solid #ff4444",color:"#ff4444" }}>Clear Result</button>
                  </div>
                ) : (
                  <div>
                    {["p1","p2","p3"].map((pos,i)=>(
                      <div key={pos} style={{ marginBottom:14 }}>
                        <div style={{ ...S.lbl,color:["#FFD700","#C0C0C0","#CD7F32"][i] }}>P{i+1} — {["WINNER","SECOND PLACE","THIRD PLACE"][i]}</div>
                        <select value={adminResult[pos]} onChange={e=>setAdminResult(prev=>({...prev,[pos]:e.target.value}))} style={S.select}>
                          <option value="">— Select driver —</option>
                          {DRIVERS.filter(d=>d===adminResult[pos]||!["p1","p2","p3"].filter(p=>p!==pos).map(p=>adminResult[p]).includes(d)).map(d=><option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                    ))}
                    <button onClick={saveManualResult} style={{ ...S.btn,width:"100%",padding:"14px",marginTop:4 }}>💾 SAVE MANUAL RESULT</button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

const S = {
  card:{ background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.09)",borderRadius:6,padding:"20px" },
  cardTitle:{ margin:"0 0 14px",fontSize:18,fontWeight:900,textTransform:"uppercase",letterSpacing:1 },
  input:{ width:"100%",padding:"10px 14px",boxSizing:"border-box",background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.15)",borderRadius:4,color:"#fff",fontSize:15,outline:"none" },
  select:{ width:"100%",padding:"10px 14px",background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.12)",borderRadius:4,color:"#fff",fontSize:14,outline:"none" },
  btn:{ padding:"10px 22px",background:"#C8001E",border:"none",borderRadius:4,color:"#fff",fontSize:14,fontWeight:800,cursor:"pointer",letterSpacing:1,textTransform:"uppercase" },
  lbl:{ fontSize:10,letterSpacing:2,color:"rgba(255,255,255,.4)",marginBottom:6,textTransform:"uppercase",display:"block" },
  th:{ padding:"8px 12px",textAlign:"left",borderBottom:"1px solid rgba(255,255,255,.08)",fontSize:12,letterSpacing:1,color:"rgba(255,255,255,.4)",textTransform:"uppercase" },
  td:{ padding:"8px 12px",textAlign:"left",verticalAlign:"top" },
};