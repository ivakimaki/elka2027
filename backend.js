/* ============================================================
SUPABASE BACKEND ADAPTER — v15.0
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
let saveTimer = null, initialized = false, initPromise = null, flushHooksInstalled = false;

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

function decodeJwtPayload(token){
  try{
    const parts = String(token||'').split('.');
    if(parts.length < 2) return null;
    const b64 = parts[1].replace(/-/g,'+').replace(/_/g,'/');
    const json = decodeURIComponent(atob(b64).split('').map(c=>'%'+('00'+c.charCodeAt(0).toString(16)).slice(-2)).join(''));
    return JSON.parse(json);
  }catch(_){ return null; }
}

function createSupabaseClient(token){
  const options = { auth:{ persistSession:false, autoRefreshToken:false, detectSessionInUrl:false }, global:{ headers:{ apikey: CONFIG.SUPABASE_ANON_KEY } } };
  if(token){
    options.global.headers.Authorization = 'Bearer '+token;
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
    waterCdEnd: row.water_cd_end || null,
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
  if(row.water_cd_end!==undefined) p.waterCdEnd=row.water_cd_end;
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

const ALLOWED_EVENTS = new Set([
  'water','live_water','visit','daily_claim','santa_caught',
  'gift_placed','gift_tapped','share_copied','invoice_paid',
  'star_upgraded','palette_bought','star_color_bought','star_gift_sent'
]);
const pendingEvents = [];

function trackEvent(eventName, payload){
  if(eventName === 'app_open'){
    return false;
  }
  if(!ALLOWED_EVENTS.has(eventName)){
    warn('Unknown event ignored:', eventName);
    return false;
  }
  if(pendingEvents.length >= 100) pendingEvents.shift();
  pendingEvents.push({
    event: eventName,
    payload: payload && typeof payload === 'object' ? payload : {},
  });
  if(initialized && pendingEvents.length >= 10){
    flushEvents().catch(e=>warn('auto flushEvents failed', e));
  }
  return true;
}

async function flushEvents(){
  if(!initialized || !sb || !currentUserId || pendingEvents.length === 0) return;
  const batch = pendingEvents.splice(0, pendingEvents.length).map(ev=>({
    tg_id: currentUserId,
    event: ev.event,
    payload: ev.payload,
  }));
  try{
    const { error } = await sb.from('events').insert(batch);
    if(error) warn('events insert failed:', error);
    else log('events flushed:', batch.length);
  }catch(e){
    warn('events insert exception:', e);
  }
}

function collectEventsFromDiff(prev, cur, diff){
  if(!prev || !cur || !diff) return;
  if(diff.dailyLastDate && cur.dailyLastDate && cur.dailyLastDate !== prev.dailyLastDate){
    trackEvent('daily_claim', { streak_count: cur.streakCount || 0 });
  }
  if(diff.unlockedPalettes && cur.unlockedPalettes){
    const prevPal = prev.unlockedPalettes || {};
    Object.keys(cur.unlockedPalettes).forEach(k=>{
      if(cur.unlockedPalettes[k] && !prevPal[k]) trackEvent('palette_bought', { palette: k });
    });
  }
  if(diff.unlockedStarColors && cur.unlockedStarColors){
    const prevCol = prev.unlockedStarColors || {};
    Object.keys(cur.unlockedStarColors).forEach(k=>{
      if(cur.unlockedStarColors[k] && !prevCol[k]) trackEvent('star_color_bought', { color: k });
    });
  }
  if(diff.starLevel !== undefined && Number(cur.starLevel) > Number(prev.starLevel || 0) && Number(cur.starLevel) <= 2){
    trackEvent('star_upgraded', { level: Number(cur.starLevel), currency: 'sparks' });
  }
  if(diff.discountEnd && Number(cur.discountEnd) > Number(prev.discountEnd || 0)){
    trackEvent('santa_caught', { discount_end: cur.discountEnd });
  }
}

async function attachDonorNames(giftRows){
  if(!Array.isArray(giftRows) || giftRows.length === 0) return [];
  const donorIds = Array.from(new Set(giftRows.map(g=>g.donor_id).filter(Boolean).map(String)));
  const nameMap = new Map();
  if(donorIds.length > 0){
    try{
      const previews = await getTreesPreview(donorIds);
      (previews || []).forEach(p=>{
        if(p && p.tg_id) nameMap.set(String(p.tg_id), p.first_name || 'Друг');
      });
    }catch(e){
      warn('attachDonorNames failed:', e);
    }
  }
  return giftRows.map(g=>{
    const name = g.donor_id ? nameMap.get(String(g.donor_id)) : null;
    return Object.assign({}, g, { donor_name: name || g.donor_name || 'Друг' });
  });
}

const SupabaseAdapter = {
  async load(){
    if(!currentUserId) return null;
    const { data:row, error:ue } = await sb.from('users').select('*').eq('tg_id',currentUserId).maybeSingle();
    if(ue){
      const reason = 'users select error: code='+(ue.code||'none')+' msg='+(ue.message||'')+' details='+(ue.details||'')+' hint='+(ue.hint||'');
      errorLog(reason, { tg_id: currentUserId, hasToken: !!accessToken });
      throw new Error(reason);
    }
    if(!row){
      const jwt = decodeJwtPayload(accessToken);
      const jwtTgId = jwt && jwt.user_metadata ? jwt.user_metadata.tg_id : null;
      const jwtRole = jwt ? jwt.role : null;
      const reason = 'User row not found (tg_id='+currentUserId+', jwt_tg_id='+String(jwtTgId||'MISSING')+', role='+String(jwtRole||'none')+', token='+(accessToken?'present':'missing')+' — проверьте RLS/user_metadata)';
      errorLog(reason);
      throw new Error(reason);
    }
    const { data:gifts, error:ge } = await sb.from('gifts').select('id,kind,message,donor_id,created_at,price_paid').eq('owner_id',currentUserId).order('created_at',{ascending:true});
    if(ge){
      errorLog('gifts select error:', ge);
      throw ge;
    }
    const enrichedGifts = await attachDonorNames(gifts || []);
    currentUserRow = row;
    const snap = rowToSnapshot(row, enrichedGifts);
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
    const { error } = await sb.from('users').update(update).eq('tg_id',currentUserId);
    if(error) throw error;
    log('save ok',update);
  },
};

async function init(){
  if(initialized) return { ok:true, userId:currentUserId, user:currentUserRow };
  if(initPromise) return initPromise;
  initPromise = (async()=>{
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
      sb = createSupabaseClient(accessToken);
      if(auth.refresh_token){
        const { error: sessErr } = await sb.auth.setSession({ access_token:auth.access_token, refresh_token:auth.refresh_token });
        if(sessErr) warn('setSession warning (using Bearer header):', sessErr.message || sessErr);
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
    }finally{
      initPromise = null;
    }
  })();
  return initPromise;
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
  if(cur){
    writeLocalOnlyFieldsFromSnapshot(cur);
    const diff = diffSnapshots(lastServerSnapshot, cur);
    if(diff && Object.keys(diff).length>0){
      collectEventsFromDiff(lastServerSnapshot, cur, diff);
      await SupabaseAdapter.save(diff);
      lastServerSnapshot = cloneJson(cur);
    }
  }
  await flushEvents();
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
  sp = String(sp).trim();
  if(/^\d+$/.test(sp)) return sp;
  if(/^[a-zA-Z0-9]{4,10}$/.test(sp)){
    const { data, error } = await sb.rpc('resolve_invite_code', { code: sp });
    if(!error && data) return String(data);
    if(/^u\d+$/.test(sp)) return sp.slice(1);
    warn('Invite code not found:', sp, error);
    return null;
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
  if(sessionStorage.getItem(lockKey)==='1'){
    log('auto visit already attempted');
    try{
      const publicTree = await getPublicTree(ownerId);
      if(publicTree) dispatch('elka:guest-tree', { publicTree, source:'start_param', startParam:sp });
    }catch(e){ warn('guest tree load failed', e); }
    return null;
  }
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
  let publicTree = null;
  try{
    publicTree = await getPublicTree(ownerId);
  }catch(e){
    warn('getPublicTree after visit failed:', e);
  }
  const visitMeta = Object.assign({}, meta||{}, { publicTree });
  if(typeof hooks.onVisitResult==='function') hooks.onVisitResult(data, visitMeta);
  dispatch('elka:visit-result',{ result:data, publicTree, meta:visitMeta });
  if(publicTree) dispatch('elka:guest-tree', { publicTree, source:visitMeta.source||'visit' });
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
  if(!sb || !currentUserId) return [];
  const { data,error } = await sb.from('gifts').select('donor_id').eq('owner_id',currentUserId);
  if(error) throw error;
  return Array.from(new Set((data||[]).map(x=>x.donor_id).filter(Boolean)));
}

async function getTreesPreview(ids){
  if(!sb) return [];
  const uniq = Array.from(new Set((ids||[]).map(String).filter(Boolean)));
  if(uniq.length===0) return [];
  const { data,error } = await sb.rpc('get_trees_preview',{ ids:uniq });
  if(error) throw error;
  return data||[];
}

async function getPublicTree(ownerId){
  if(!sb || !ownerId) return null;
  const id = String(ownerId).trim();
  if(!id) return null;
  const previews = await getTreesPreview([id]);
  const preview = (previews && previews[0]) || null;
  if(!preview) return null;
  let groundGifts = [];
  try{
    const { data:giftRows, error:ge } = await sb
      .from('gifts')
      .select('id,kind,message,donor_id,created_at,price_paid')
      .eq('owner_id', id)
      .order('created_at', { ascending: true });
    if(!ge && Array.isArray(giftRows) && giftRows.length > 0){
      const isOwnTree = currentUserId && String(id) === String(currentUserId);
      const enriched = isOwnTree ? await attachDonorNames(giftRows) : giftRows;
      groundGifts = enriched.map(r => giftRowToGroundGift(Object.assign({}, r, {
        donor_name: isOwnTree ? r.donor_name : 'Друг'
      })));
    }
  }catch(e){
    warn('getPublicTree gifts load failed:', e);
  }
  return {
    tg_id: String(preview.tg_id),
    first_name: preview.first_name || 'Друг',
    tree_level: preview.tree_level ?? 1,
    lights_count: preview.lights_count ?? 4,
    star_level: preview.star_level ?? 0,
    palette: preview.palette || 'champagne',
    gift_count: Number(preview.gift_count || 0),
    groundGifts,
  };
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
  getDonorIds, getTreesPreview, getFriendsCarousel, getPublicTree,
  resolveStartParam: parseOwnerIdFromStartParam,
  trackEvent, flushEvents,
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
