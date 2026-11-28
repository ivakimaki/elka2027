/* ============================================================
SUPABASE BACKEND ADAPTER — v15.1
============================================================ */
(function(){
'use strict';

if (typeof USE_BACKEND === 'undefined' || !USE_BACKEND) return;
if (typeof SUPABASE_URL === 'undefined' || typeof SUPABASE_ANON_KEY === 'undefined') {
  console.warn('[ElkaBackend] SUPABASE_URL или SUPABASE_ANON_KEY не заданы');
  return;
}

const supabaseLib = window.supabase;
if (!supabaseLib) {
  console.warn('[ElkaBackend] Supabase SDK не загружен');
  return;
}

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
function toast(t){ if(typeof hooks.showToast==='function') hooks.showToast(t); else log('TOAST:',t); }
function getTg(){ return window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null; }
function nowIso(){ return new Date().toISOString(); }
function todayYmd(){ return new Date().toISOString().slice(0,10); }
function cloneJson(v){ return JSON.parse(JSON.stringify(v)); }
function isSame(a,b){ return JSON.stringify(a)===JSON.stringify(b); }
function dispatch(name,detail){ window.dispatchEvent(new CustomEvent(name,{detail})); }

function createSupabaseClient(token){
  const options = { auth:{ persistSession:false, autoRefreshToken:false, detectSessionInUrl:false }, global:{ headers:{} } };
  if(token){
    options.global.headers.Authorization = 'Bearer '+token;
    options.global.headers.apikey = CONFIG.SUPABASE_ANON_KEY;
    options.accessToken = async function(){ return token; };
  } else {
    options.global.headers.apikey = CONFIG.SUPABASE_ANON_KEY;
    options.global.headers.Authorization = 'Bearer '+CONFIG.SUPABASE_ANON_KEY;
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

const GIFT_META = {
  coal:{icon:'🧦',label:'Носок угля',scale:1.0},
  orange:{icon:'🍊',label:'Мандарин',scale:1.2},
  candy:{icon:'🍬',label:'Конфеты',scale:1.4},
  shoe:{icon:'👠',label:'Туфелька',scale:1.6},
  champagne:{icon:'🍾',label:'Шампанское',scale:2.0},
  bear:{icon:'🧸',label:'Мишка',scale:2.5},
  horse:{icon:'🐎',label:'Символ года',scale:3.0},
  car:{icon:'🚗',label:'Машинка',scale:4.0},
};

function giftRowToGroundGift(row){
  const meta = GIFT_META[row.kind] || {icon:'🎁',label:'Подарок',scale:1.0};
  return { kind:row.kind, icon:meta.icon, label:meta.label, from:row.donor_name||row.donor_id||'Таинственный друг', scale:meta.scale, message:row.message||'' };
}

function rowToSnapshot(row, gifts){
  const lo = readLocalOnlyFields();
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
    waterDay: row.water_day || null,
    waterCount: row.water_count ?? 0,
    liveWaterDay: row.live_water_day || null,
    liveWaterCount: row.live_water_count ?? 0,
    visitDay: lo.visitDay || null,
    visitCount: lo.visitCount || 0,
    totalVisits: lo.totalVisits || 0,
    dailyLastDate: row.daily_last_date || null,
    streakCount: row.streak_count ?? 0,
    discountEnd: row.discount_end || null,
    groundGifts: (gifts||[]).map(giftRowToGroundGift),
  };
}

function rowToPatch(row){
  const p={};
  if(row.sparks!==undefined) p.sparks=row.sparks;
  if(row.star_level!==undefined) p.starLevel=row.star_level;
  if(row.star_color!==undefined) p.starColor=row.star_color;
  if(row.unlocked_star_colors!==undefined) p.unlockedStarColors=row.unlocked_star_colors;
  if(row.palette!==undefined) p.palette=row.palette;
  if(row.unlocked_palettes!==undefined) p.unlockedPalettes=row.unlocked_palettes;
  if(row.tree_level!==undefined) p.treeLevel=row.tree_level;
  if(row.warmth!==undefined) p.warmth=row.warmth;
  if(row.lights_count!==undefined) p.lightsCount=row.lights_count;
  if(row.water_day!==undefined) p.waterDay=row.water_day;
  if(row.water_count!==undefined) p.waterCount=row.water_count;
  if(row.live_water_day!==undefined) p.liveWaterDay=row.live_water_day;
  if(row.live_water_count!==undefined) p.liveWaterCount=row.live_water_count;
  if(row.daily_last_date!==undefined) p.dailyLastDate=row.daily_last_date;
  if(row.streak_count!==undefined) p.streakCount=row.streak_count;
  if(row.discount_end!==undefined) p.discountEnd=row.discount_end;
  return p;
}

function snapshotDiffToDbUpdate(diff){
  const u={};
  if(diff.sparks!==undefined) u.sparks=diff.sparks;
  if(diff.palette!==undefined) u.palette=diff.palette;
  if(diff.unlockedPalettes!==undefined) u.unlocked_palettes=diff.unlockedPalettes;
  if(diff.starColor!==undefined) u.star_color=diff.starColor;
  if(diff.unlockedStarColors!==undefined) u.unlocked_star_colors=diff.unlockedStarColors;
  if(diff.treeLevel!==undefined) u.tree_level=diff.treeLevel;
  if(diff.warmth!==undefined) u.warmth=diff.warmth;
  if(diff.lightsCount!==undefined) u.lights_count=diff.lightsCount;
  if(diff.starLevel!==undefined && Number(diff.starLevel)<=2) u.star_level=diff.starLevel;
  if(diff.dailyLastDate!==undefined) u.daily_last_date=diff.dailyLastDate;
  if(diff.streakCount!==undefined) u.streak_count=diff.streakCount;
  return u;
}

function diffSnapshots(prev, next){
  if(!prev) return cloneJson(next||{});
  if(!next) return {};
  const d={};
  Object.keys(next).forEach(k => { if(!isSame(prev[k],next[k])) d[k]=next[k]; });
  return d;
}

const LOCAL_ONLY_KEY='elka_2027_local_only_fields_v1';
function readLocalOnlyFields(){ try{ return JSON.parse(localStorage.getItem(LOCAL_ONLY_KEY)||'{}'); }catch(_){ return {}; } }
function writeLocalOnlyFieldsFromSnapshot(snap){
  if(!snap) return;
  const prev=readLocalOnlyFields();
  const next={ visitDay:snap.visitDay??prev.visitDay??null, visitCount:snap.visitCount??prev.visitCount??0, totalVisits:snap.totalVisits??prev.totalVisits??0 };
  localStorage.setItem(LOCAL_ONLY_KEY, JSON.stringify(next));
}

function applySnapshot(snap, meta){
  if(!snap) return;
  lastServerSnapshot = cloneJson(snap);
  writeLocalOnlyFieldsFromSnapshot(snap);
  if(typeof hooks.applySnapshot==='function') hooks.applySnapshot(snap, meta||{});
  dispatch('elka:backend-snapshot',{snapshot:snap,meta:meta||{}});
}

function applyPatch(patch, meta){
  if(!patch) return;
  if(typeof hooks.patchSnapshot==='function') hooks.patchSnapshot(patch,meta||{});
  else if(typeof hooks.applySnapshot==='function'){
    const cur = typeof hooks.getSnapshot==='function' ? hooks.getSnapshot() : lastServerSnapshot;
    if(cur) hooks.applySnapshot(Object.assign({},cur,patch),meta||{});
  }
  dispatch('elka:backend-patch',{patch,meta:meta||{}});
}

const SupabaseAdapter = {
  async load(){
    if(!currentUserId) return null;
    const { data:row, error:ue } = await sb.from('users').select('*').eq('tg_id', String(currentUserId)).maybeSingle();
    if(ue) throw ue;
    if(!row){
      warn('User row not found for tg_id:', currentUserId);
      return null;
    }
    const { data:gifts, error:ge } = await sb.from('gifts').select('id,kind,message,donor_id,created_at,price_paid').eq('owner_id', String(currentUserId)).order('created_at',{ascending:true});
    if(ge) throw ge;
    currentUserRow = row;
    const snap = rowToSnapshot(row, gifts||[]);
    lastServerSnapshot = cloneJson(snap);
    return snap;
  },
  async save(diff){
    if(!currentUserId) return;
    if(!diff || Object.keys(diff).length===0) return;
    writeLocalOnlyFieldsFromSnapshot(typeof hooks.getSnapshot==='function' ? hooks.getSnapshot() : null);
    const update = snapshotDiffToDbUpdate(diff);
    if(Object.keys(update).length===0){ log('save: no server-writable fields'); return; }
    update.last_seen = nowIso();
    const { error } = await sb.from('users').update(update).eq('tg_id', String(currentUserId));
    if(error) throw error;
    log('save ok',update);
  },
};

async function init(){
  if(initialized) return { ok:true, userId:currentUserId, user:currentUserRow };
  sb = createSupabaseClient(null);
  const tg = getTg();
  if(!tg){ warn('Telegram.WebApp not found'); dispatch('elka:backend-offline',{reason:'no_telegram'}); return { ok:false, reason:'no_telegram' }; }
  try{ tg.ready(); tg.expand(); }catch(_){}
  const initData = tg.initData;
  if(!initData){ warn('initData empty'); dispatch('elka:backend-offline',{reason:'empty_init_data'}); return { ok:false, reason:'empty_init_data' }; }
  try{
    log('tg-auth start');
    const auth = await invokeFn('tg-auth',{initData});
    if(!auth || !auth.access_token || !auth.user) throw new Error('Invalid tg-auth response');
    accessToken = auth.access_token;
    currentUserId = String(auth.user.tg_id || auth.user.id);
    if(auth.refresh_token){
      const { error } = await sb.auth.setSession({ access_token:auth.access_token, refresh_token:auth.refresh_token });
      if(error) throw error;
    } else {
      sb = createSupabaseClient(accessToken);
    }
    log('tg-auth ok',{ userId:currentUserId, isNew:auth.isNew });
    const snap = await SupabaseAdapter.load();
    applySnapshot(snap,{ source:'backend:init', isNew:!!auth.isNew });
    installFlushHooks();
    initialized = true;
    dispatch('elka:backend-ready',{ userId:currentUserId, user:currentUserRow, isNew:!!auth.isNew });
    if(CONFIG.AUTO_VISIT_FROM_START_PARAM) autoVisitFromStartParam().catch(e=>warn('auto visit failed',e));
    return { ok:true, userId:currentUserId, user:currentUserRow, isNew:!!auth.isNew };
  }catch(err){
    errorLog('init failed, fallback to localStorage',err);
    dispatch('elka:backend-offline',{ reason:'init_failed', error:String(err.message||err) });
    return { ok:false, reason:'init_failed', error:err };
  }
}

function queueSave(){
  if(!initialized) return;
  if(saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(()=>{ flushSave().catch(e=>warn('flush failed',e)); }, CONFIG.SAVE_DEBOUNCE_MS);
}

async function flushSave(){
  if(!initialized) return;
  if(saveTimer){ clearTimeout(saveTimer); saveTimer=null; }
  const cur = typeof hooks.getSnapshot==='function' ? hooks.getSnapshot() : null;
  if(!cur) return;
  writeLocalOnlyFieldsFromSnapshot(cur);
  const diff = diffSnapshots(lastServerSnapshot, cur);
  if(!diff || Object.keys(diff).length===0) return;
  await SupabaseAdapter.save(diff);
  lastServerSnapshot = cloneJson(cur);
}

function installFlushHooks(){
  if(flushHooksInstalled) return;
  flushHooksInstalled = true;
  window.addEventListener('beforeunload',()=>flushSave());
  document.addEventListener('visibilitychange',()=>{ if(document.hidden) flushSave().catch(e=>warn('vis flush',e)); });
}

function getStartParam(){
  const tg=getTg();
  const fromTg = tg && tg.initDataUnsafe && tg.initDataUnsafe.start_param ? tg.initDataUnsafe.start_param : null;
  if(fromTg) return fromTg;
  try{ const u=new URL(window.location.href); return u.searchParams.get('startapp')||null; }catch(_){ return null; }
}

async function parseOwnerIdFromStartParam(sp){
  if(!sp) return null;
  if(/^\d+$/.test(sp)) return sp;
  if(/^[a-zA-Z0-9]{4,10}$/.test(sp)){
    const { data, error } = await sb.from('users').select('tg_id').eq('invite_code', sp).maybeSingle();
    if(error || !data){ warn('Invite code not found:', sp); return null; }
    return data.tg_id;
  }
  return null;
}

async function autoVisitFromStartParam(){
  const sp = getStartParam();
  const ownerId = await parseOwnerIdFromStartParam(sp);
  if(!ownerId) return null;
  if(!currentUserId) return null;
  if(String(ownerId)===String(currentUserId)) return null;
  const lockKey='elka_2027_auto_visit_'+currentUserId+'_'+ownerId+'_'+todayYmd();
  if(sessionStorage.getItem(lockKey)==='1'){ log('auto visit already attempted'); return null; }
  sessionStorage.setItem(lockKey,'1');
  return visit(ownerId,{ source:'start_param', startParam:sp });
}

async function visit(ownerId, meta){
  if(!initialized) throw new Error('Backend not init');
  if(!ownerId) throw new Error('ownerId required');
  ownerId=String(ownerId);
  if(ownerId===String(currentUserId)) return { skipped:true, reason:'self_visit' };
  log('do-visit',ownerId);
  const data = await invokeFn('do-visit',{ owner_id:ownerId });
  if(data && data.visitor) applyPatch(rowToPatch(data.visitor),{ source:'do-visit:visitor' });
  if(typeof hooks.onVisitResult==='function') hooks.onVisitResult(data,meta||{});
  dispatch('elka:visit-result',{result:data,meta:meta||{}});
  if(data.lit) toast('Огонёк зажжён ✨'); else toast('Тёплый визит +2 🔥');
  return data;
}

async function water(){
  if(!initialized) throw new Error('Backend not init');
  log('do-water');
  try{
    const data = await invokeFn('do-water',{});
    if(data && data.user) applyPatch(rowToPatch(data.user),{ source:'do-water' });
    if(typeof hooks.playWaterAnimation==='function') hooks.playWaterAnimation(data);
    dispatch('elka:water-result',{data});
    return data;
  }catch(err){
    const msg=String(err.message||err);
    if(msg.toLowerCase().includes('cooldown')) toast('Полив пока на кулдауне');
    else if(msg.toLowerCase().includes('limit')) toast('Лимит полива исчерпан');
    else toast('Не удалось полить ёлку');
    throw err;
  }
}

async function createInvoice(params){
  if(!initialized) throw new Error('Backend not init');
  const body = Object.assign({},params||{});
  if(body.message) body.message = String(body.message).slice(0,40);
  log('create-invoice',body);
  const data = await invokeFn('create-invoice',body);
  if(!data || !data.invoice_link) throw new Error('No invoice_link');
  return data;
}

function openInvoice(link, payload){
  const tg=getTg();
  if(!tg || typeof tg.openInvoice!=='function') throw new Error('openInvoice unavailable');
  return new Promise(resolve=>{
    tg.openInvoice(link, async status=>{
      log('invoice status',status);
      if(typeof hooks.onPaymentStatus==='function') hooks.onPaymentStatus(status,payload||{});
      dispatch('elka:payment-status',{status,payload:payload||{}});
      if(status==='paid'){
        toast('Оплата прошла ⭐');
        setTimeout(async()=>{ try{ const snap=await SupabaseAdapter.load(); applySnapshot(snap,{source:'payment:paid',payload:payload||{}}); }catch(e){ warn('reload after payment',e); } },1000);
      } else if(status==='cancelled') toast('Оплата отменена');
      else if(status==='failed') toast('Оплата не прошла');
      resolve(status);
    });
  });
}

async function buyGift(ownerId, kind, message){
  const inv = await createInvoice({ item_type:'gift', owner_id:String(ownerId), kind, message:message||'' });
  return openInvoice(inv.invoice_link,{ item_type:'gift', owner_id:String(ownerId), kind, amount:inv.amount, token:inv.token });
}

async function buyStarLevel(level){
  const inv = await createInvoice({ item_type:'star_level', level:Number(level) });
  return openInvoice(inv.invoice_link,{ item_type:'star_level', level:Number(level), amount:inv.amount, token:inv.token });
}

async function buyStarGift(ownerId){
  const inv = await createInvoice({ item_type:'star_gift', owner_id:String(ownerId) });
  return openInvoice(inv.invoice_link,{ item_type:'star_gift', owner_id:String(ownerId), amount:inv.amount, token:inv.token });
}

async function buyLiveWater(){
  const inv = await createInvoice({ item_type:'live_water' });
  return openInvoice(inv.invoice_link,{ item_type:'live_water', amount:inv.amount, token:inv.token });
}

async function getDonorIds(){
  if(!initialized || !currentUserId) return [];
  const { data,error } = await sb.from('gifts').select('donor_id').eq('owner_id', String(currentUserId));
  if(error) throw error;
  return Array.from(new Set((data||[]).map(x=>x.donor_id).filter(Boolean)));
}

async function getTreesPreview(ids){
  if(!initialized) return [];
  const uniq = Array.from(new Set((ids||[]).map(String).filter(Boolean)));
  if(uniq.length===0) return [];
  const { data,error } = await sb.rpc('get_trees_preview',{ ids:uniq });
  if(error) throw error;
  return data||[];
}

async function getFriendsCarousel(localVisitedIds){
  const donorIds = await getDonorIds();
  const ids = Array.from(new Set([].concat(localVisitedIds||[]).concat(donorIds||[]).map(String).filter(Boolean).filter(id=>id!==String(currentUserId))));
  return getTreesPreview(ids);
}

function getMyShareLink(){
  if (currentUserRow && currentUserRow.invite_code) return currentUserRow.invite_code;
  return currentUserId ? 'u'+currentUserId : null;
}

async function copyText(text){
  if(navigator.clipboard && navigator.clipboard.writeText){
    try{ await navigator.clipboard.writeText(text); return true; }catch(_){}
  }
  const ta=document.createElement('textarea');
  ta.value=text; ta.style.position='fixed'; ta.style.left='-9999px';
  document.body.appendChild(ta); ta.focus(); ta.select();
  const ok=document.execCommand('copy');
  document.body.removeChild(ta);
  return ok;
}

window.ElkaBackend = {
  CONFIG, adapter:SupabaseAdapter,
  init, load:SupabaseAdapter.load, save:SupabaseAdapter.save,
  queueSave, flushSave,
  water, visit,
  buyGift, buyStarLevel, buyStarGift, buyLiveWater,
  createInvoice, openInvoice,
  getDonorIds, getTreesPreview, getFriendsCarousel,
  getMyShareLink, copyText,
  getState(){ return { initialized, currentUserId, currentUserRow, accessTokenPresent:!!accessToken, lastServerSnapshot }; },
  async reload(){ const snap=await SupabaseAdapter.load(); applySnapshot(snap,{source:'manual:reload'}); return snap; },
};

function tryInit() { init().catch(e=>warn('auto init failed',e)); }
if(document.readyState === 'complete'){
  setTimeout(tryInit, 100);
} else {
  window.addEventListener('load', tryInit);
}

})();