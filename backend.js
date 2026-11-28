/* ============================================================
SUPABASE BACKEND ADAPTER — v15.5
============================================================ */
(function(){
'use strict';

if (typeof USE_BACKEND === 'undefined' || !USE_BACKEND) return;
if (typeof SUPABASE_URL === 'undefined' || typeof SUPABASE_ANON_KEY === 'undefined') return;

const supabaseLib = window.supabase;
if (!supabaseLib) return;

const CONFIG = {
  USE_BACKEND: USE_BACKEND,
  SUPABASE_URL: SUPABASE_URL,
  SUPABASE_ANON_KEY: SUPABASE_ANON_KEY,
  DEBUG: true,
  SAVE_DEBOUNCE_MS: 30000,
  AUTO_VISIT_FROM_START_PARAM: true,
};

let sb = null, accessToken = null, currentUserId = null, currentUserRow = null, lastServerSnapshot = null;
let saveTimer = null, initialized = false, flushHooksInstalled = false;
const hooks = window.ElkaClientHooks = window.ElkaClientHooks || {};

function log(...a){ if(CONFIG.DEBUG) console.log('[ElkaBackend]',...a); }
function warn(...a){ if(CONFIG.DEBUG) console.warn('[ElkaBackend]',...a); }
function errorLog(...a){ console.error('[ElkaBackend]',...a); }
function toast(t){ if(typeof hooks.showToast==='function') hooks.showToast(t); }
function getTg(){ return window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null; }
function nowIso(){ return new Date().toISOString(); }
function cloneJson(v){ return JSON.parse(JSON.stringify(v)); }
function parseTsMs(v){ if(!v) return 0; if(typeof v==='number') return v; const t=Date.parse(v); return isNaN(t)?0:t; }

function createSupabaseClient(token){
  const options = { auth:{ persistSession:false, autoRefreshToken:false, detectSessionInUrl:false } };
  if(token){
    options.global = { headers: { Authorization: 'Bearer '+token, apikey: CONFIG.SUPABASE_ANON_KEY } };
    options.accessToken = async function(){ return token; };
  }
  return supabaseLib.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY, options);
}

async function invokeFn(name, body){
  if(!sb) throw new Error('Supabase client is not initialized');
  const options = { body: body||{} };
  if(accessToken) options.headers = { Authorization: 'Bearer '+accessToken, apikey: CONFIG.SUPABASE_ANON_KEY };
  const { data, error } = await sb.functions.invoke(name, options);
  if(error){
    let details=null; try{ if(error.context && typeof error.context.json==='function') details=await error.context.json(); }catch(_){}
    const message = details?.error || details?.message || error.message || 'Edge Function error';
    const err = new Error(message); err.details=details; err.original=error; throw err;
  }
  return data;
}

function rowToSnapshot(row, gifts){
  return {
    sparks: row.sparks ?? 45,
    starLevel: row.star_level ?? 0,
    starColor: row.star_color || 'ruby',
    unlockedStarColors: row.unlocked_star_colors || {ruby:true},
    unlockedPalettes: row.unlocked_palettes || {champagne:true},
    palette: row.palette || 'champagne',
    treeLevel: row.tree_level ?? 1,
    warmth: row.warmth ?? 0,
    lightsCount: row.lights_count ?? 4,
    waterDay: row.water_day || '',
    waterCount: row.water_count ?? 0,
    waterCdEnd: parseTsMs(row.water_cd_end),
    liveWaterDay: row.live_water_day || '',
    liveWaterCount: row.live_water_count ?? 0,
    dailyLastDate: row.daily_last_date || '',
    streakCount: row.streak_count ?? 0,
    discountEnd: parseTsMs(row.discount_end),
    groundGifts: (gifts||[]).map(g => ({ kind: g.kind, icon: '🎁', label: g.kind, from: g.donor_name || 'Друг', scale: 1.5, message: g.message || '' })),
  };
}

function rowToPatch(row){
  const p={};
  if(row.sparks!==undefined) p.sparks=row.sparks;
  if(row.star_level!==undefined) p.starLevel=row.star_level;
  if(row.star_color!==undefined) p.starColor=row.star_color;
  if(row.tree_level!==undefined) p.treeLevel=row.tree_level;
  if(row.warmth!==undefined) p.warmth=row.warmth;
  if(row.lights_count!==undefined) p.lightsCount=row.lights_count;
  if(row.water_day!==undefined) p.waterDay=row.water_day||'';
  if(row.water_count!==undefined) p.waterCount=row.water_count;
  if(row.water_cd_end!==undefined) p.waterCdEnd=parseTsMs(row.water_cd_end);
  return p;
}

function applySnapshot(snap, meta){
  if(!snap) return;
  lastServerSnapshot = cloneJson(snap);
  if(typeof hooks.applySnapshot==='function') hooks.applySnapshot(snap, meta||{});
}

function applyPatch(patch, meta){
  if(!patch) return;
  if(typeof hooks.patchSnapshot==='function') hooks.patchSnapshot(patch,meta||{});
}

const SupabaseAdapter = {
  async load(){
    if(!currentUserId) return null;
    const { data:row, error:ue } = await sb.from('users').select('*').eq('tg_id', String(currentUserId)).maybeSingle();
    if(ue) throw ue;
    if(!row) return null;
    const { data:gifts } = await sb.from('gifts').select('*').eq('owner_id', String(currentUserId));
    currentUserRow = row;
    const snap = rowToSnapshot(row, gifts||[]);
    lastServerSnapshot = cloneJson(snap);
    return snap;
  },
  async save(diff){
    if(!currentUserId || !diff || Object.keys(diff).length===0) return;
    const update = {};
    if(diff.sparks!==undefined) update.sparks = diff.sparks;
    if(diff.treeLevel!==undefined) update.tree_level = diff.treeLevel;
    if(diff.warmth!==undefined) update.warmth = diff.warmth;
    if(diff.lightsCount!==undefined) update.lights_count = diff.lightsCount;
    update.last_seen = nowIso();
    await sb.from('users').update(update).eq('tg_id', String(currentUserId));
  }
};

async function init(){
  if(initialized) return { ok:true, userId:currentUserId };
  sb = createSupabaseClient(null);
  const tg = getTg();
  if(!tg){ dispatchEvent(new CustomEvent('elka:backend-offline',{detail:{reason:'no_telegram'}})); return { ok:false }; }
  try{ tg.ready(); tg.expand(); }catch(_){}
  const initData = tg.initData;
  if(!initData){ dispatchEvent(new CustomEvent('elka:backend-offline',{detail:{reason:'empty_init_data'}})); return { ok:false }; }
  try{
    log('tg-auth start');
    const auth = await invokeFn('tg-auth',{initData});
    if(!auth || !auth.access_token || !auth.user) throw new Error('Invalid tg-auth response');
    accessToken = auth.access_token;
    currentUserId = String(auth.user.tg_id || auth.user.id);
    currentUserRow = auth.user;
    sb = createSupabaseClient(accessToken);
    log('tg-auth ok',{ userId:currentUserId });
    const snap = await SupabaseAdapter.load();
    applySnapshot(snap,{ source:'backend:init' });
    initialized = true;
    window.dispatchEvent(new CustomEvent('elka:backend-ready',{detail:{userId:currentUserId}}));
    return { ok:true, userId:currentUserId };
  }catch(err){
    errorLog('init failed',err);
    dispatchEvent(new CustomEvent('elka:backend-offline',{detail:{reason:'init_failed',error:String(err)}}));
    return { ok:false, error:err };
  }
}

async function water(){
  if(!initialized) throw new Error('Backend not init');
  const data = await invokeFn('do-water',{});
  if(data && data.user) applyPatch(rowToPatch(data.user),{ source:'do-water' });
  return data;
}

async function logEvent(event, payload){
  if(!initialized || !currentUserId || !sb) return;
  try{
    await sb.from('events').insert({ tg_id: String(currentUserId), event: String(event), payload: payload || {} });
  }catch(e){}
}

window.ElkaBackend = {
  CONFIG, init, load:SupabaseAdapter.load, save:SupabaseAdapter.save,
  water, logEvent,
  getState(){ return { initialized, currentUserId, accessTokenPresent:!!accessToken }; },
  async reload(){ const snap = await SupabaseAdapter.load(); applySnapshot(snap); return snap; }
};

if(document.readyState === 'complete'){ setTimeout(()=>init().catch(e=>warn(e)), 100); }
else { window.addEventListener('load', ()=>init().catch(e=>warn(e))); }

})();
