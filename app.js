/* ============================================================
КОНФИГИ
============================================================ */
const CAM_TILT=0.18, MAX_LIGHTS=170;
const TREE_LEVELS=[
{level:1,name:"Росток",heightCm:45,need:6},
{level:2,name:"Саженец",heightCm:58,need:10},
{level:3,name:"Молодое дерево",heightCm:74,need:16},
{level:4,name:"Дерево",heightCm:95,need:22},
{level:5,name:"Развилка",heightCm:120,need:30},
{level:6,name:"Пышная",heightCm:148,need:38},
{level:7,name:"Высокая",heightCm:176,need:46},
{level:8,name:"Лесная красавица",heightCm:202,need:54},
{level:9,name:"Исполин",heightCm:226,need:62},
{level:10,name:"Гордость леса",heightCm:242,need:70},
{level:11,name:"Ёлка-2027",heightCm:250,need:Infinity}
];
const MILESTONE_LEVELS=[4,7,9,11];
const TREE_CONFIG={model:"skirt_pyramid",growthCm:45,tiersSmall:2,tiersLarge:11,gapSmall:10,gapLarge:35,sides:6,widthSmall:19,widthLarge:41,trunkHSmall:24,trunkHLarge:16,trunkRadius:30,droopSmall:-25,droopLarge:35,hue:135,lightness:12,contrast:28,frost:45};
const LIGHT_CONFIG={shape:"icicle",palette:"champagne",layout:"spiral",count:4,turns:9,bottomStart:-0.06,size:0.5,glowR:21,glowA:0.3,offset:1.03,twinkle:1.3,treeLit:0.3};
const PALETTES={
champagne:{name:"Шампань",cost:0,colors:[{core:"#fffdf8",mid:"#f9e3b4",glow:"247, 217, 156"},{core:"#fffaf0",mid:"#f2d08f",glow:"242, 208, 143"}]},
warm_gold:{name:"Золото",cost:60,colors:[{core:"#fff9e6",mid:"#ffd166",glow:"255, 200, 80"},{core:"#fff5d6",mid:"#f4b942",glow:"244, 185, 66"}]},
ice_white:{name:"Холодный лёд",cost:120,colors:[{core:"#ffffff",mid:"#d8eeff",glow:"190, 228, 255"},{core:"#f4faff",mid:"#b9e0ff",glow:"165, 215, 255"}]},
multi:{name:"Мульти",cost:200,colors:[{core:"#fff8f8",mid:"#ff5c6c",glow:"255, 80, 96"},{core:"#fffdf2",mid:"#ffd166",glow:"255, 205, 85"},{core:"#f2fff8",mid:"#4cd98b",glow:"68, 217, 134"},{core:"#f2f9ff",mid:"#5cb8ff",glow:"82, 178, 255"}]}
};
const STAR_COLORS={
ruby:{name:"Рубин",cost:0,light:"#ff9aa8",mid:"#e6243c",dark:"#7a0918",core:"#fff2f4",glow:"255, 68, 92"},
gold:{name:"Золото",cost:250,light:"#fff1a8",mid:"#f5b82e",dark:"#8c5808",core:"#fffff2",glow:"255, 205, 78"},
champagne:{name:"Шампань",cost:250,light:"#fff9eb",mid:"#f2d399",dark:"#8f713d",core:"#ffffff",glow:"249, 224, 170"},
ice:{name:"Лёд",cost:350,light:"#e8f7ff",mid:"#7cc8ff",dark:"#1d5b8c",core:"#ffffff",glow:"155, 218, 255"},
emerald:{name:"Изумруд",cost:350,light:"#a8ffd0",mid:"#22c56e",dark:"#0a5c30",core:"#f2fff8",glow:"58, 222, 132"},
amethyst:{name:"Аметист",cost:400,light:"#ecc7ff",mid:"#a84ef5",dark:"#4b1482",core:"#fcf5ff",glow:"190, 112, 255"},
frost:{name:"Морозный иней",cost:-1,exclusive:true,light:"#f0fbff",mid:"#a5e4ff",dark:"#2c6f9e",core:"#ffffff",glow:"180, 235, 255"}
};
const STAR_STAGES=[
{level:1,points:5,shadeMode:"facet",waveSpeed:0.5,size:15,innerRatio:0.44,facetDepth:0.45,liftY:11,glowR:30,glowA:0.35,ray0Len:18,ray45Len:0,twinkleSpeed:1.0,swayAngle:12,swaySpeed:1.0,floatAmp:1.5,floatSpeed:1.2},
{level:2,points:5,shadeMode:"facet",waveSpeed:0.6,size:19,innerRatio:0.43,facetDepth:0.50,liftY:13,glowR:44,glowA:0.45,ray0Len:34,ray45Len:18,twinkleSpeed:1.2,swayAngle:15,swaySpeed:1.1,floatAmp:2.0,floatSpeed:1.4},
{level:3,points:5,shadeMode:"facet",waveSpeed:0.6,size:26,innerRatio:0.42,facetDepth:0.55,liftY:16,glowR:62,glowA:0.58,ray0Len:55,ray45Len:35,twinkleSpeed:1.4,swayAngle:18,swaySpeed:1.2,floatAmp:3.0,floatSpeed:1.5},
{level:4,points:5,shadeMode:"wave",waveSpeed:0.5,size:34,innerRatio:0.40,facetDepth:0.62,liftY:19,glowR:85,glowA:0.72,ray0Len:85,ray45Len:60,twinkleSpeed:1.7,swayAngle:20,swaySpeed:1.3,floatAmp:4.0,floatSpeed:1.7},
{level:5,points:5,shadeMode:"wave",waveSpeed:0.7,size:42,innerRatio:0.38,facetDepth:0.70,liftY:22,glowR:130,glowA:0.90,ray0Len:120,ray45Len:90,twinkleSpeed:2.0,swayAngle:22,swaySpeed:1.4,floatAmp:5.0,floatSpeed:1.9}
];
const STAR_LEVELS=[
{lvl:1,title:"Первая искра",desc:"Классическая 5-лучевая звезда",costText:"100 🔥",type:"sparks",cost:100},
{lvl:2,title:"Ясная звезда",desc:"Фасетное сияние и лучи",costText:"250 🔥",type:"sparks",cost:250},
{lvl:3,title:"Сияние",desc:"Яркий ореол и верхний свет",costText:"50 ⭐",type:"stars",cost:50},
{lvl:4,title:"Полярная звезда",desc:"Двойные лучи и мерцание",costText:"100 ⭐",type:"stars",cost:100},
{lvl:5,title:"Корона 2027",desc:"Максимальное сияние на весь лес",costText:"150 ⭐",type:"stars",cost:150}
];
const GIFT_ITEMS=[
{kind:"coal",icon:"🧦",label:"Носок угля",price:10,scale:1.0},
{kind:"orange",icon:"🍊",label:"Мандарин",price:15,scale:1.2},
{kind:"candy",icon:"🍫",label:"Конфеты",price:15,scale:1.4},
{kind:"shoe",icon:"👠",label:"Туфелька",price:25,scale:1.6},
{kind:"champagne",icon:"🍾",label:"Шампанское",price:35,scale:2.0},
{kind:"bear",icon:"🧸",label:"Мишка",price:50,scale:3.0},
{kind:"horse",icon:"🐎",label:"Символ года",price:75,scale:3.6},
{kind:"car",icon:"🚗",label:"Машинка",price:100,scale:4.0}
];
const HIT_KINDS=new Set(["orange"]);
const GIFT_SVGS={
bear:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="20" height="20"><circle cx="6.2" cy="4.2" r="2.1" fill="#B45309"/><circle cx="13.8" cy="4.2" r="2.1" fill="#B45309"/><circle cx="6.2" cy="4.2" r="1" fill="#FDE68A"/><circle cx="13.8" cy="4.2" r="1" fill="#FDE68A"/><ellipse cx="10" cy="12.5" rx="4.6" ry="4.5" fill="#B45309"/><ellipse cx="10" cy="12.8" rx="2.7" ry="2.8" fill="#FDE68A"/><circle cx="5.2" cy="11.2" r="1.7" fill="#92400E"/><circle cx="14.8" cy="11.2" r="1.7" fill="#92400E"/><ellipse cx="6.6" cy="16" rx="2" ry="1.4" fill="#78350F"/><ellipse cx="13.4" cy="16" rx="2" ry="1.4" fill="#78350F"/><circle cx="10" cy="6.6" r="3.9" fill="#D97706"/><ellipse cx="10" cy="7.5" rx="2" ry="1.5" fill="#FEF3C7"/><circle cx="8.6" cy="5.8" r="0.65" fill="#1E293B"/><circle cx="11.4" cy="5.8" r="0.65" fill="#1E293B"/><circle cx="10" cy="7" r="0.75" fill="#1E293B"/><path d="M7.3 9.7Q10 10.7 12.7 9.7" stroke="#DC2626" stroke-width="1.5" stroke-linecap="round" fill="none"/><path d="M11.5 9.8L12.6 12.4" stroke="#DC2626" stroke-width="1.3" stroke-linecap="round"/></svg>`,
champagne:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="20" height="20"><path d="M8.8 2h2.4v2.2H8.8z" fill="#F59E0B"/><path d="M8.6 4.2h2.8l.4 3.2c1.1.7 1.7 1.8 1.7 3.2V16c0 .6-.5 1-1.1 1H7.6c-.6 0-1.1-.4-1.1-1v-5.4c0-1.4.6-2.5 1.7-3.2l.4-3.2z" fill="#15803D"/><path d="M8.9 4.5h2.2l.3 2.8c.9.6 1.3 1.5 1.3 2.8v5.5H7.3v-5.5c0-1.3.4-2.2 1.3-2.8l.3-2.8z" fill="#16A34A"/><rect x="7.5" y="10.4" width="5" height="3.4" rx="0.4" fill="#FEF3C7"/><rect x="8.2" y="11.2" width="3.6" height="0.8" fill="#DC2626"/><rect x="8.6" y="4.2" width="2.8" height="1.2" fill="#FBBF24"/><path d="M8 9.2v5.2" stroke="#86EFAC" stroke-width="0.9" stroke-linecap="round"/></svg>`,
candy:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="20" height="20"><path d="M2.2 6.5L5.8 8.3 4 11.8 1.8 9.5z" fill="#EF4444"/><path d="M17.8 12.5L14.2 10.7 16 7.2 18.2 9.5z" fill="#EF4444"/><ellipse cx="10" cy="9.5" rx="5.3" ry="4.2" transform="rotate(-18 10 9.5)" fill="#DC2626"/><path d="M7.2 6.3c1.2 1.8 1.6 4 .8 6.3M10.1 5.4c1.3 2 1.7 4.4.8 6.9M12.9 6.2c1.1 1.7 1.4 3.7.7 5.7" stroke="#FEF08A" stroke-width="1.4" stroke-linecap="round" fill="none"/><ellipse cx="8.5" cy="7.4" rx="2.1" ry="0.8" transform="rotate(-22 8.5 7.4)" fill="#FCA5A5" opacity="0.8"/></svg>`,
horse:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="20" height="20"><path d="M3.2 15.2Q10 18.3 16.8 15.2" stroke="#B91C1C" stroke-width="1.8" stroke-linecap="round" fill="none"/><path d="M6.4 15.8L7.2 12h5.2l1.1 3.8" stroke="#D97706" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M6.3 9.5h6.2l1.6-4.2 2.5 1.3-.9 2.3-2 .4-.9 3.2H6.5z" fill="#F59E0B"/><path d="M12.4 5.3c-.9.3-1.6 1.4-1.6 2.8" stroke="#92400E" stroke-width="1.5" stroke-linecap="round" fill="none"/><path d="M6.2 9.6c-1.4.2-2.2 1.3-2 2.6" stroke="#92400E" stroke-width="1.5" stroke-linecap="round" fill="none"/><path d="M8.2 9.3h3v2.3h-3z" fill="#DC2626"/><circle cx="14.4" cy="6.6" r="0.55" fill="#1E293B"/></svg>`,
shoe:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="20" height="20"><path d="M4.2 12.2v4.6h1.3v-3.5z" fill="#0284C7"/><path d="M3.3 8.8c.6 2.2 2.4 3.4 4.8 3.6 2.5.2 4.3 2.4 8.6 3.5.7.2.9.9.2 1.1-3.3.3-6.5-.3-8.8-2.3-1.5-1.3-3.1-1.3-4.6-.9-.6.1-.9-.4-.8-1l.6-4z" fill="#38BDF8"/><path d="M4.1 9.8c.8 1.8 2.4 2.7 4.5 2.9 2.2.2 4.1 2.1 7.6 3.1" stroke="#E0F2FE" stroke-width="1.1" stroke-linecap="round" fill="none"/><circle cx="15.2" cy="14.7" r="1.2" fill="#FDE047"/><circle cx="15.2" cy="14.7" r="0.5" fill="#FFFFFF"/></svg>`,
car:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="20" height="20"><path d="M5.4 9.5L7.3 6.2h5.4l1.9 3.3z" fill="#EF4444"/><path d="M6.4 9.3L7.8 7h4.4l1.4 2.3z" fill="#BAE6FD"/><rect x="2.2" y="9.3" width="15.6" height="5" rx="2" fill="#DC2626"/><rect x="3" y="9.8" width="14" height="1.3" rx="0.6" fill="#F87171"/><circle cx="16.8" cy="11.5" r="0.9" fill="#FEF08A"/><rect x="1.8" y="13.2" width="16.4" height="1.2" rx="0.6" fill="#E2E8F0"/><circle cx="5.8" cy="15.1" r="2.1" fill="#1E293B"/><circle cx="5.8" cy="15.1" r="0.9" fill="#CBD5E1"/><circle cx="14.2" cy="15.1" r="2.1" fill="#1E293B"/><circle cx="14.2" cy="15.1" r="0.9" fill="#CBD5E1"/></svg>`,
orange:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="20" height="20"><circle cx="10" cy="11.3" r="5.7" fill="#EA580C"/><circle cx="9.6" cy="10.9" r="5.1" fill="#F97316"/><ellipse cx="7.6" cy="8.7" rx="1.7" ry="1" transform="rotate(-30 7.6 8.7)" fill="#FDBA74"/><path d="M10 6V3.5" stroke="#15803D" stroke-width="1.3" stroke-linecap="round"/><path d="M10 4.6c1.6-2 4.3-1.8 4.8-.3-.7 1.6-3.2 1.8-4.8.3z" fill="#22C55E"/><path d="M10 4.8C8.6 3.3 6.5 3.5 6 4.7c.6 1.2 2.6 1.3 4 .1z" fill="#16A34A"/></svg>`,
coal:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="20" height="20"><path d="M7.5 4.2l1.8-1.9 2.2 1.1 1.7-1.2 1.5 2v1.6H7.5z" fill="#334155"/><path d="M8.7 3.8l1.2-1 1.4 1" stroke="#64748B" stroke-width="0.9" stroke-linecap="round" fill="none"/><path d="M7.4 6.2h6.8v5.5c0 2.7-1.6 4.7-4.5 5.1l-3.3.3c-1.5.1-2.6-.9-2.6-2.3 0-1.3 1-2.2 2.4-2.3l1.2-.1V6.2z" fill="#DC2626"/><path d="M14.2 11.4c-1.4.2-2.3 1.2-2.3 2.6 0 .8.4 1.5 1 2 .8-.9 1.3-2.4 1.3-4.6z" fill="#FACC15"/><path d="M3.8 14.8c0 1.3 1 2.3 2.4 2.3l.7-.1c-.3-1.5-1.2-2.6-2.6-3-.3.2-.5.5-.5.8z" fill="#FACC15"/><rect x="6.5" y="5.2" width="8.5" height="2.6" rx="1.3" fill="#F8FAFC"/></svg>`
};
const giftSvgCache=new Map();
(function(){ for(const k in GIFT_SVGS){ const img=new Image(); img.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(GIFT_SVGS[k]); giftSvgCache.set(k,img); }})();
const GIFT_BOTTOM_Y={bear:7.4,champagne:7.0,candy:3.8,horse:6.8,shoe:6.8,car:7.2,orange:7.0,coal:7.1};
function drawGiftIcon(g,kind,size){
const img=giftSvgCache.get(kind);
if(!img||!img.complete||img.naturalWidth===0) return;
const s=size/20;
g.drawImage(img,-10*s,-10*s,20*s,20*s);
}
const SANTA_CONFIG={delayMinSec:5,delayMaxSec:10,flightDurationMs:13000,flyAboveApexCm:50,rewardSparks:10,rewardLights:3,discountPercent:30,discountDurationMs:60*60*1000};
const WATER_CONFIG={sparks:10,warmth:1,lights:1,cooldownMs:60000,dailyLimit:12,liveWaterCost:20,liveWarmth:4,liveLights:2,liveSparks:20,liveDailyLimit:5};
const VISIT_CONFIG={warmth:3,lights:3,sparks:10};

function topStarSvg(size,mid){
const pts=[]; const R=10,r=4.4,cxp=12,cyp=12;
for(let i=0;i<10;i++){ const rad=(i%2===0)?R:r; const a=-Math.PI/2+(i*Math.PI)/5; pts.push((cxp+Math.cos(a)*rad).toFixed(2)+","+(cyp+Math.sin(a)*rad).toFixed(2)); }
return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" style="display:inline-block;vertical-align:-3px;"><path d="M${pts.join(" L")} Z" fill="${mid}" stroke="rgba(255,255,255,.55)" stroke-width="0.9" stroke-linejoin="round"/></svg>`;
}

const state={
sparks:45, starLevel:0, starColor:"ruby",
unlockedPalettes:{champagne:true}, unlockedStarColors:{ruby:true},
treeLevel:1, warmth:0,
waterCdEnd:0, waterDay:"", waterCount:0,
liveWaterDay:"", liveWaterCount:0,
visitDay:"", visitCount:0, totalVisits:0,
dailyLastDate:"", streakCount:0,
maxGrowthToast:false, maxLightsToast:false,
discountEnd:0,
isGuest:false, ownerBackup:null,
groundGifts:[
{kind:"bear",icon:"🧸",label:"Мишка",from:"Аня",scale:3.0,message:""},
{kind:"orange",icon:"🍊",label:"Мандарин",from:"Макс",scale:1.2,message:"С Новым годом!"}
]
};
let currentFriend=null;
function getDiscount(){ return Date.now()<state.discountEnd ? (1-SANTA_CONFIG.discountPercent/100) : 1; }
function discountedStars(cost){ return Math.max(1,Math.ceil(cost*getDiscount())); }
function fmtNum(n){ if(n>=1e6) return (n/1e6).toFixed(1)+"М"; if(n>=1000) return (n/1000).toFixed(1)+"к"; return String(n); }

function dateStrOffset(d){ const x=new Date(Date.now()-d*86400000); return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,"0")}-${String(x.getDate()).padStart(2,"0")}`; }
function todayStr(){ return dateStrOffset(0); }
function dailyKey(){ return todayStr(); }
function hashStr(s){ let h=0; for(let i=0;i<s.length;i++) h=(h*31+s.charCodeAt(i))|0; return Math.abs(h); }
function waterRemaining(){ return Math.max(0,WATER_CONFIG.dailyLimit-((state.waterDay===todayStr())?state.waterCount:0)); }
function liveWaterRemaining(){ return Math.max(0,WATER_CONFIG.liveDailyLimit-((state.liveWaterDay===todayStr())?state.liveWaterCount:0)); }
function msUntilMidnight(){ const n=new Date(); const m=new Date(n.getFullYear(),n.getMonth(),n.getDate()+1,0,0,0); return m-n; }
function fmtHMS(ms){ const s=Math.max(0,Math.floor(ms/1000)); const h=Math.floor(s/3600); const m=Math.floor((s%3600)/60); const sec=s%60; return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`; }
function getDailyGiftKind(){ return GIFT_ITEMS[hashStr(dailyKey())%GIFT_ITEMS.length].kind; }
function giftEffectivePrice(g){ const ps=discountedStars(g.price); if(g.kind!==getDailyGiftKind()) return ps; const pd=Math.max(1,Math.round(g.price*0.75)); return Math.min(ps,pd); }
let lastDailyKey=dailyKey();

const SAVE_KEY="elka_save_v141", SAVE_DELAY_MS=30000;
let saveTimer=null, lastSaved=null, dirty=false;
function snapshot(){
return {
sparks:state.sparks, starLevel:state.starLevel, starColor:state.starColor,
unlockedPalettes:{...state.unlockedPalettes}, unlockedStarColors:{...state.unlockedStarColors},
palette:LIGHT_CONFIG.palette, treeLevel:state.treeLevel, warmth:state.warmth, lightsCount:LIGHT_CONFIG.count,
waterDay:state.waterDay, waterCount:state.waterCount,
liveWaterDay:state.liveWaterDay, liveWaterCount:state.liveWaterCount,
visitDay:state.visitDay, visitCount:state.visitCount, totalVisits:state.totalVisits,
dailyLastDate:state.dailyLastDate, streakCount:state.streakCount,
maxGrowthToast:state.maxGrowthToast, maxLightsToast:state.maxLightsToast,
discountEnd:state.discountEnd,
groundGifts:state.groundGifts.map(g=>({kind:g.kind,icon:g.icon,label:g.label,from:g.from,scale:g.scale,message:g.message||""}))
};
}
function diffSnapshots(a,b){ if(!a) return b; const o={}; for(const k of Object.keys(b)) if(JSON.stringify(a[k])!==JSON.stringify(b[k])) o[k]=b[k]; return o; }
function markDirty(){
dirty=true;
if(saveTimer) clearTimeout(saveTimer);
saveTimer=setTimeout(()=>flushSave(), SAVE_DELAY_MS);
}
function flushSave(immediate=false){
if(!dirty) return;
const cur=snapshot();
const diff=diffSnapshots(lastSaved,cur);
if(Object.keys(diff).length===0){ dirty=false; return; }
lastSaved=cur; dirty=false;
if(immediate && saveTimer){ clearTimeout(saveTimer); saveTimer=null; }
try{ localStorage.setItem(SAVE_KEY, JSON.stringify(cur)); }catch(e){}
}
function loadSave(){ try{ const r=localStorage.getItem(SAVE_KEY); return r?JSON.parse(r):null; }catch(e){ return null; } }
(function(){
const s=loadSave(); if(!s) return;
if(typeof s.sparks==='number') state.sparks=s.sparks;
if(typeof s.starLevel==='number') state.starLevel=Math.max(0,Math.min(5,s.starLevel));
if(s.starColor && STAR_COLORS[s.starColor]) state.starColor=s.starColor;
if(s.unlockedPalettes) for(const k in s.unlockedPalettes) if(PALETTES[k]) state.unlockedPalettes[k]=true;
if(s.unlockedStarColors) for(const k in s.unlockedStarColors) if(STAR_COLORS[k]) state.unlockedStarColors[k]=true;
if(s.palette && PALETTES[s.palette]) LIGHT_CONFIG.palette=s.palette;
if(typeof s.treeLevel==='number') state.treeLevel=Math.max(1,Math.min(TREE_LEVELS.length,s.treeLevel));
if(typeof s.warmth==='number') state.warmth=Math.max(0,s.warmth);
TREE_CONFIG.growthCm=TREE_LEVELS[state.treeLevel-1].heightCm;
if(typeof s.lightsCount==='number') LIGHT_CONFIG.count=Math.max(1,Math.min(MAX_LIGHTS,s.lightsCount));
if(typeof s.waterDay==='string') state.waterDay=s.waterDay;
if(typeof s.waterCount==='number') state.waterCount=s.waterCount;
if(typeof s.liveWaterDay==='string') state.liveWaterDay=s.liveWaterDay;
if(typeof s.liveWaterCount==='number') state.liveWaterCount=s.liveWaterCount;
if(typeof s.visitDay==='string') state.visitDay=s.visitDay;
if(typeof s.visitCount==='number') state.visitCount=s.visitCount;
if(typeof s.totalVisits==='number') state.totalVisits=s.totalVisits;
if(typeof s.dailyLastDate==='string') state.dailyLastDate=s.dailyLastDate;
if(typeof s.streakCount==='number') state.streakCount=s.streakCount;
if(s.maxGrowthToast) state.maxGrowthToast=true;
if(s.maxLightsToast) state.maxLightsToast=true;
if(typeof s.discountEnd==='number') state.discountEnd=s.discountEnd;
if(Array.isArray(s.groundGifts)) state.groundGifts=s.groundGifts;
})();
window.addEventListener("beforeunload",()=>flushSave(true));
document.addEventListener("visibilitychange",()=>{ if(document.visibilityState==="hidden") flushSave(true); });

const app=document.getElementById("app");
const canvas=document.getElementById("scene");
const ctx=canvas.getContext("2d",{alpha:false});
let W=360,H=640,DPR=1;
const starsBg=[], snow=[];
function resize(){
const rect=app.getBoundingClientRect();
DPR=Math.min(window.devicePixelRatio||1,1.5);
W=Math.max(280,Math.floor(rect.width));
H=Math.max(400,Math.floor(rect.height));
canvas.width=Math.floor(W*DPR);
canvas.height=Math.floor(H*DPR);
ctx.setTransform(DPR,0,0,DPR,0,0);
starsBg.length=0;
for(let i=0;i<50;i++) starsBg.push({x:Math.random()*W, y:Math.random()*H*0.72, r:0.6+Math.random()*1.2, p:Math.random()*6.28});
if(snow.length===0) for(let i=0;i<38;i++) snow.push({x:Math.random()*500, y:Math.random()*900, r:1+Math.random()*2, vy:14+Math.random()*20, vx:(Math.random()-0.5)*10, phase:Math.random()*6.28});
}
window.addEventListener("resize",resize);
resize();
const glowSpriteCache=new Map();
function getGlowSprite(rgbStr){
if(glowSpriteCache.has(rgbStr)) return glowSpriteCache.get(rgbStr);
const size=128; const off=document.createElement("canvas"); off.width=size; off.height=size;
const octx=off.getContext("2d"); const half=size/2;
const grad=octx.createRadialGradient(half,half,0,half,half,half);
grad.addColorStop(0.0,`rgba(${rgbStr}, 0.95)`);
grad.addColorStop(0.25,`rgba(${rgbStr}, 0.45)`);
grad.addColorStop(0.6,`rgba(${rgbStr}, 0.14)`);
grad.addColorStop(1.0,`rgba(${rgbStr}, 0)`);
octx.fillStyle=grad; octx.fillRect(0,0,size,size);
glowSpriteCache.set(rgbStr,off);
return off;
}

let toastTimer=null;
function showToast(msg, closeSheetsFirst=false){
if(closeSheetsFirst) closeAllSheets();
const el=document.getElementById("toast");
el.textContent=msg; el.classList.add("show");
clearTimeout(toastTimer);
toastTimer=setTimeout(()=>el.classList.remove("show"),4500);
}
function closeAllSheets(){
document.querySelectorAll(".sheet").forEach(s=>s.classList.remove("open"));
document.querySelectorAll(".tab-btn").forEach(b=>b.classList.remove("active"));
}
function toggleSheet(id){
const el=document.getElementById(id);
const wasOpen=el.classList.contains("open");
closeAllSheets();
if(!wasOpen){
el.classList.add("open");
const map={sheetStar:"btnTabStar",sheetGarland:"btnTabGarland",sheetGifts:"btnOpenGiftShop",sheetShare:"btnOpenShare",sheetFriends:"btnTabFriends"};
const btn=document.getElementById(map[id]);
if(btn) btn.classList.add("active");
if(id==="sheetShare") updateShareMotivation();
}
}
document.querySelectorAll("[data-close]").forEach(btn=>{ btn.addEventListener("click",()=>closeAllSheets()); });

let lastBaseScreen={x:0,y:0};
let confirmOkCb=null, confirmCancelCb=null;
function showConfirm(opts){
document.getElementById("confirmTitle").innerHTML=opts.title||"";
document.getElementById("confirmDesc").textContent=opts.desc||"";
document.getElementById("confirmOk").textContent=opts.okText||"Купить";
const giftBox=document.getElementById("confirmGift");
if(opts.gift){ const img=giftSvgCache.get(opts.gift.kind); if(img){ giftBox.innerHTML=`<img src="${img.src}" style="width:${opts.gift.size}px;height:${opts.gift.size}px;">`; giftBox.style.display="flex"; } else { giftBox.style.display="none"; giftBox.innerHTML=""; } } else { giftBox.style.display="none"; giftBox.innerHTML=""; }
const input=document.getElementById("confirmInput");
if(opts.showInput){ input.style.display="block"; input.value=""; } else { input.style.display="none"; input.value=""; }
confirmOkCb=opts.onOk||null; confirmCancelCb=opts.onCancel||null;
if(opts.price!==undefined) document.getElementById("confirmPrice").innerHTML=opts.price;
document.getElementById("confirmOverlay").classList.remove("hidden");
}
function hideConfirm(){ document.getElementById("confirmOverlay").classList.add("hidden"); confirmOkCb=null; confirmCancelCb=null; }
document.getElementById("confirmOk").addEventListener("click",()=>{ const cb=confirmOkCb; hideConfirm(); if(cb) cb(); });
document.getElementById("confirmCancel").addEventListener("click",()=>{ const cb=confirmCancelCb; hideConfirm(); if(cb) cb(); });

let rotY=0.35, autoSpin=0.25, camZoom=1.0, camPanY=0;
const activePointers=new Map();
let prevPinchDist=null, prevSingleX=null, prevSingleY=null, downPos=null;
let screenGiftHitboxes=[];
let dragMode=null, dragAccumX=0, dragAccumY=0;
let lastApexScreen={x:0,y:0};
function getPanYLimits(){ const totalH=TREE_CONFIG.growthCm; const scale=(H*0.56/250)*camZoom; const treeScreenH=totalH*scale; return { minY:-H*0.75, maxY:treeScreenH*0.9+H*0.15 }; }
function clampPanY(){ const lim=getPanYLimits(); camPanY=Math.max(lim.minY,Math.min(lim.maxY,camPanY)); }
function applyZoomAtPoint(k,midX,midY){
const newZoom=Math.max(0.65,Math.min(3.4,camZoom*k));
const realK=newZoom/camZoom;
if(realK===1) return;
const cy0=H*0.72;
const dy=midY-(cy0+camPanY);
camPanY=midY-cy0-dy*realK;
clampPanY();
camZoom=newZoom;
}
canvas.addEventListener("pointerdown",(e)=>{
canvas.setPointerCapture(e.pointerId);
activePointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
downPos={x:e.clientX,y:e.clientY,time:performance.now()};
if(activePointers.size===1){ prevSingleX=e.clientX; prevSingleY=e.clientY; prevPinchDist=null; dragMode=null; dragAccumX=0; dragAccumY=0; }
else if(activePointers.size===2){ const pts=Array.from(activePointers.values()); prevPinchDist=Math.hypot(pts[1].x-pts[0].x,pts[1].y-pts[0].y); prevSingleX=null; prevSingleY=null; dragMode=null; }
});
canvas.addEventListener("pointermove",(e)=>{
if(!activePointers.has(e.pointerId)) return;
activePointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
if(activePointers.size===1 && prevSingleX!==null){
const dx=e.clientX-prevSingleX, dy=e.clientY-prevSingleY;
prevSingleX=e.clientX; prevSingleY=e.clientY;
if(dragMode===null){ dragAccumX+=Math.abs(dx); dragAccumY+=Math.abs(dy); if(dragAccumX+dragAccumY>6) dragMode=dragAccumX>dragAccumY?'rotate':'pan'; }
if(dragMode==='rotate'){ rotY+=dx*0.0095; autoSpin=0.1; }
else if(dragMode==='pan'){ camPanY+=dy; clampPanY(); }
} else if(activePointers.size===2){
const pts=Array.from(activePointers.values());
const dist=Math.hypot(pts[1].x-pts[0].x,pts[1].y-pts[0].y);
const midX=(pts[0].x+pts[1].x)*0.5, midY=(pts[0].y+pts[1].y)*0.5;
if(prevPinchDist && prevPinchDist>10){ const rect=canvas.getBoundingClientRect(); applyZoomAtPoint(dist/prevPinchDist,midX-rect.left,midY-rect.top); }
prevPinchDist=dist;
}
});
function handlePointerEnd(e){
if(downPos && activePointers.size===1){
const moveDist=Math.hypot(e.clientX-downPos.x,e.clientY-downPos.y);
if(moveDist<10){
const rect=canvas.getBoundingClientRect();
const cx=e.clientX-rect.left, cy=e.clientY-rect.top;
if(santaActive && Math.hypot(cx-santaX,cy-santaY)<Math.max(44,52*camZoom)){ catchSanta(); activePointers.delete(e.pointerId); if(activePointers.size===0){ prevSingleX=null; prevSingleY=null; downPos=null; prevPinchDist=null; dragMode=null; } return; }
for(let i=screenGiftHitboxes.length-1;i>=0;i--){
const hb=screenGiftHitboxes[i];
if(Math.hypot(cx-hb.x,cy-hb.y)<=Math.max(26,hb.size)){
if(state.isGuest) showToast(`🎁 Подарок «${hb.label}» под ёлкой (имя дарителя видит только хозяин)`,true);
else { const msgLine=hb.message?`\n«${hb.message}»`:""; showToast(`🎁 Подарок «${hb.label}» от друга: ${hb.from}!${msgLine}`,true); }
break;
}
}
}
}
activePointers.delete(e.pointerId);
if(activePointers.size===1){ const rem=Array.from(activePointers.values())[0]; prevSingleX=rem.x; prevSingleY=rem.y; prevPinchDist=null; dragMode=null; dragAccumX=0; dragAccumY=0; }
else if(activePointers.size===0){ prevSingleX=null; prevSingleY=null; prevPinchDist=null; downPos=null; dragMode=null; }
}
canvas.addEventListener("pointerup",handlePointerEnd);
canvas.addEventListener("pointercancel",handlePointerEnd);
canvas.addEventListener("wheel",(e)=>{ e.preventDefault(); const rect=canvas.getBoundingClientRect(); applyZoomAtPoint(e.deltaY<0?1.08:0.92,e.clientX-rect.left,e.clientY-rect.top); },{passive:false});
function lerp(a,b,t){ return a+(b-a)*t; }
function clamp(v,mn,mx){ return v<mn?mn:(v>mx?mx:v); }
function projectExact(x,y,z,cx,baseY,cosA,sinA,scale){
const rx=x*cosA-z*sinA, rz=x*sinA+z*cosA;
const fov=680; const persp=fov/(fov+rz*scale);
return { sx:cx+rx*scale*persp, sy:baseY-(y+rz*CAM_TILT)*scale*persp, z:rz, persp:persp*scale };
}

let fxParticles=[];
function spawnBurst(cx,cy,baseHue){
const n=36;
for(let i=0;i<n;i++){
const a=(i/n)*Math.PI*2+Math.random()*0.3;
const speed=60+Math.random()*140;
fxParticles.push({ x:cx, y:cy, vx:Math.cos(a)*speed, vy:Math.sin(a)*speed, life:1.6+Math.random()*0.8, age:0, hue:baseHue+Math.random()*40-20 });
}
}
function updateFx(dt){
for(let i=fxParticles.length-1;i>=0;i--){
const p=fxParticles[i]; p.age+=dt;
if(p.age>p.life){ fxParticles.splice(i,1); continue; }
p.x+=p.vx*dt; p.y+=p.vy*dt; p.vy+=60*dt; p.vx*=0.99; p.vy*=0.99;
const t=p.age/p.life, alpha=Math.max(0,1-t);
ctx.save(); ctx.globalCompositeOperation="lighter";
ctx.fillStyle=`hsla(${p.hue},100%,70%,${alpha.toFixed(2)})`;
ctx.beginPath(); ctx.arc(p.x,p.y,1.6+(1-t)*1.2,0,6.3); ctx.fill();
ctx.restore();
}
}

function addLights(n){
const before=LIGHT_CONFIG.count;
LIGHT_CONFIG.count=Math.min(MAX_LIGHTS,LIGHT_CONFIG.count+n);
if(LIGHT_CONFIG.count>=MAX_LIGHTS && before<MAX_LIGHTS && !state.maxLightsToast){
state.maxLightsToast=true;
setTimeout(()=>showToast("🔆 Максимум огней (170)! Ёлка сияет в полную силу.",true),1700);
}
}
function gainWarmth(amount){
if(state.treeLevel>=TREE_LEVELS.length) return 0;
state.warmth+=amount;
let gained=0;
while(state.treeLevel<TREE_LEVELS.length){
const idx=state.treeLevel-1;
const need=TREE_LEVELS[idx].need;
if(state.warmth>=need){ state.warmth-=need; state.treeLevel++; gained++; TREE_CONFIG.growthCm=TREE_LEVELS[state.treeLevel-1].heightCm; }
else break;
}
if(gained>0){
const lvl=TREE_LEVELS[state.treeLevel-1];
showToast(`🎉 Уровень ${state.treeLevel}: «${lvl.name}»! Ёлка выросла до ${lvl.heightCm} см`,true);
spawnBurst(lastApexScreen.x,lastApexScreen.y,48);
spawnBurst(lastApexScreen.x+24,lastApexScreen.y+26,200);
if(MILESTONE_LEVELS.includes(state.treeLevel)){
setTimeout(()=>{ showToast("📣 Ёлка подросла — покажи её друзьям, пусть зажгут огонёк!"); toggleSheet("sheetShare"); },1800);
}
if(state.treeLevel>=TREE_LEVELS.length && !state.maxGrowthToast){
state.maxGrowthToast=true;
setTimeout(()=>showToast("🌲 Ёлка полностью выросла! Дальше — огни, звезда и подарки.",true),1700);
}
}
markDirty();
return gained;
}
function revealStar(newLvl,newColor){
setTimeout(()=>{
if(newLvl!=null) state.starLevel=newLvl;
if(newColor!=null) state.starColor=newColor;
markDirty(); syncUI();
spawnBurst(lastApexScreen.x,lastApexScreen.y,280);
spawnBurst(lastApexScreen.x,lastApexScreen.y+12,48);
},400);
}

function drawFlareRay(g,cx,cy,len,width,angleRad,rgbStr,alpha){
if(len<=1||alpha<=0.01) return;
g.save(); g.translate(cx,cy); g.rotate(angleRad); g.globalCompositeOperation="lighter";
const grad=g.createLinearGradient(-len,0,len,0);
grad.addColorStop(0.0,`rgba(${rgbStr}, 0)`);
grad.addColorStop(0.35,`rgba(${rgbStr}, ${(alpha*0.35).toFixed(3)})`);
grad.addColorStop(0.5,`rgba(255,255,255,${Math.min(1,alpha*0.95).toFixed(3)})`);
grad.addColorStop(0.65,`rgba(${rgbStr}, ${(alpha*0.35).toFixed(3)})`);
grad.addColorStop(1.0,`rgba(${rgbStr}, 0)`);
g.fillStyle=grad; g.beginPath(); g.moveTo(-len,0); g.quadraticCurveTo(0,-width,len,0); g.quadraticCurveTo(0,width,-len,0); g.fill();
g.restore();
}
function drawStarTopper(apexScreen,timeSec){
const st=STAR_STAGES[Math.max(0,Math.min(4,state.starLevel-1))];
const col=STAR_COLORS[state.starColor]||STAR_COLORS.ruby;
const floatOffset=Math.sin(timeSec*st.floatSpeed*2.0)*st.floatAmp*camZoom;
const sx=apexScreen.sx, sy=apexScreen.sy-st.liftY*camZoom+floatOffset;
const maxRad=(st.swayAngle*Math.PI)/180;
const yawAngle=Math.sin(timeSec*st.swaySpeed*1.6)*maxRad;
const scaleX=Math.cos(yawAngle), skewY=Math.sin(yawAngle)*0.14;
const tw0=st.twinkleSpeed>0?0.72+0.28*Math.sin(timeSec*st.twinkleSpeed*2.5):1.0;
const tw45=st.twinkleSpeed>0?0.68+0.32*Math.sin(timeSec*st.twinkleSpeed*2.1+1.85):1.0;
const pulse=0.82+0.28*tw0;
const glowR=st.glowR*camZoom*pulse;
if(st.glowA>0.01 && glowR>2){ const sprite=getGlowSprite(col.glow); ctx.save(); ctx.globalAlpha=clamp(st.glowA*pulse,0,1); ctx.globalCompositeOperation="lighter"; ctx.drawImage(sprite,sx-glowR,sy-glowR,glowR*2,glowR*2); ctx.restore(); }
const r0=st.ray0Len*camZoom*tw0;
if(r0>2){ const w0=Math.max(1.4,st.size*0.09*camZoom); drawFlareRay(ctx,sx,sy,r0,w0,0,col.glow,0.80*tw0); drawFlareRay(ctx,sx,sy,r0,w0,Math.PI*0.5,col.glow,0.80*tw0); }
const r45=st.ray45Len*camZoom*tw45;
if(r45>2){ const w45=Math.max(1.1,st.size*0.07*camZoom); drawFlareRay(ctx,sx,sy,r45,w45,Math.PI*0.25,col.glow,0.72*tw45); drawFlareRay(ctx,sx,sy,r45,w45,-Math.PI*0.25,col.glow,0.72*tw45); }
const R=st.size*camZoom, rIn=R*st.innerRatio, ptsCount=st.points, depth=st.facetDepth;
ctx.save(); ctx.translate(sx,sy); ctx.transform(scaleX,skewY,0,1,0,0);
const outerPts=[], innerPts=[];
for(let i=0;i<ptsCount;i++){ const aOut=-Math.PI*0.5+(i/ptsCount)*Math.PI*2; const aIn=aOut+Math.PI/ptsCount; outerPts.push({x:Math.cos(aOut)*R,y:Math.sin(aOut)*R}); innerPts.push({x:Math.cos(aIn)*rIn,y:Math.sin(aIn)*rIn}); }
for(let i=0;i<ptsCount;i++){
const prevIn=innerPts[(i-1+ptsCount)%ptsCount], tip=outerPts[i], nextIn=innerPts[i];
let leftFill=col.light, rightFill=col.mid;
if(st.shadeMode==="gloss"){ leftFill=col.mid; rightFill=col.mid; }
else if(st.shadeMode==="top"){ const isUpper=tip.y<0; leftFill=isUpper?col.light:col.mid; rightFill=isUpper?col.mid:col.dark; }
else if(st.shadeMode==="wave"){ const wavePhase=Math.sin(timeSec*st.waveSpeed*3.0-i*1.15); leftFill=wavePhase>0.25?col.core:(wavePhase>-0.3?col.light:col.mid); rightFill=wavePhase>0.55?col.light:col.mid; }
else { leftFill=depth>0.05?col.light:col.mid; rightFill=depth>0.45?col.dark:col.mid; }
ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(prevIn.x,prevIn.y); ctx.lineTo(tip.x,tip.y); ctx.closePath(); ctx.fillStyle=leftFill; ctx.fill();
ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(tip.x,tip.y); ctx.lineTo(nextIn.x,nextIn.y); ctx.closePath(); ctx.fillStyle=rightFill; ctx.fill();
if(depth>0.08){ ctx.strokeStyle=`rgba(255,255,255,${(depth*0.35).toFixed(2)})`; ctx.lineWidth=0.75; ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(tip.x,tip.y); ctx.stroke(); }
}
ctx.fillStyle=col.core; ctx.beginPath(); ctx.arc(0,0,Math.max(1.5,R*0.14),0,Math.PI*2); ctx.fill();
ctx.restore();
}

let santaActive=false, santaX=-100, santaY=-1000, santaVX=0, santaStartTime=0, santaCaughtThisRun=false;
function initSanta(){
const today=new Date().toISOString().slice(0,10);
const lastDate=localStorage.getItem("santa_last_date");
if(lastDate===today) return;
const delay=(SANTA_CONFIG.delayMinSec+Math.random()*(SANTA_CONFIG.delayMaxSec-SANTA_CONFIG.delayMinSec))*1000;
setTimeout(()=>spawnSanta(),delay);
}
function spawnSanta(){
if(santaActive) return;
santaActive=true; santaCaughtThisRun=false; santaStartTime=performance.now();
santaX=-90; santaY=-1000;
santaVX=(W+200)/(SANTA_CONFIG.flightDurationMs/1000);
}
function santaScreenY(timeSec){
const worldH=TREE_CONFIG.growthCm+SANTA_CONFIG.flyAboveApexCm;
const sc=(H*0.56/250)*camZoom;
const gy=H*0.72+camPanY;
const wobble=Math.sin(timeSec*2.5)*6*camZoom;
return gy-worldH*sc+wobble;
}
function updateSanta(now,timeSec){
if(!santaActive) return;
const elapsed=(now-santaStartTime)/1000;
santaX=-90+santaVX*elapsed;
santaY=santaScreenY(timeSec);
drawSanta(santaX,santaY,timeSec);
if(santaX>W+130) santaActive=false;
}
function drawSanta(x,y,timeSec){
ctx.save(); ctx.translate(x,y);
const zs=clamp(camZoom,0.65,3.4); ctx.scale(zs,zs);
ctx.fillStyle="#7c2d12"; ctx.strokeStyle="#451a03"; ctx.lineWidth=1.4;
ctx.beginPath(); ctx.moveTo(-28,8); ctx.lineTo(28,8); ctx.quadraticCurveTo(34,8,34,2); ctx.quadraticCurveTo(30,-4,22,-4); ctx.lineTo(-22,-4); ctx.quadraticCurveTo(-32,-4,-28,8); ctx.closePath(); ctx.fill(); ctx.stroke();
ctx.strokeStyle="#fbbf24"; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(-32,10); ctx.lineTo(34,10); ctx.stroke();
ctx.fillStyle="#92400e"; ctx.beginPath(); ctx.ellipse(38,-2,7,4,0,0,6.3); ctx.fill();
ctx.strokeStyle="#451a03"; ctx.lineWidth=1; ctx.beginPath(); ctx.arc(44,-6,3,0,6.3); ctx.fill();
ctx.fillStyle="#a16207"; ctx.beginPath(); ctx.ellipse(-10,-8,9,7,0,0,6.3); ctx.fill(); ctx.stroke();
ctx.fillStyle="#dc2626"; ctx.beginPath(); ctx.ellipse(0,-14,8,10,0,0,6.3); ctx.fill(); ctx.stroke();
ctx.fillStyle="#fecaca"; ctx.beginPath(); ctx.arc(0,-24,5,0,6.3); ctx.fill();
ctx.fillStyle="#f8fafc"; ctx.beginPath(); ctx.moveTo(-5,-20); ctx.quadraticCurveTo(0,-12,5,-20); ctx.quadraticCurveTo(0,-16,-5,-20); ctx.closePath(); ctx.fill();
ctx.fillStyle="#dc2626"; ctx.beginPath(); ctx.moveTo(-5,-26); ctx.lineTo(5,-26); ctx.lineTo(3,-31); ctx.lineTo(-3,-31); ctx.closePath(); ctx.fill();
const shine=0.4+0.3*Math.sin(timeSec*5);
ctx.fillStyle=`rgba(255,215,130,${shine.toFixed(2)})`;
ctx.beginPath(); ctx.ellipse(0,2,20,3,0,0,6.3); ctx.fill();
ctx.globalAlpha=0.75+0.25*Math.sin(timeSec*4);
ctx.fillStyle="#fde68a"; ctx.font="bold 12px sans-serif"; ctx.textAlign="center";
ctx.fillText("👆",0,-42);
ctx.globalAlpha=1;
ctx.restore();
}
function catchSanta(){
if(!santaActive || santaCaughtThisRun) return;
santaCaughtThisRun=true; santaActive=false;
state.sparks+=SANTA_CONFIG.rewardSparks;
addLights(SANTA_CONFIG.rewardLights);
state.discountEnd=Date.now()+SANTA_CONFIG.discountDurationMs;
localStorage.setItem("santa_last_date",new Date().toISOString().slice(0,10));
const total=parseInt(localStorage.getItem("santa_total")||"0",10)+1;
localStorage.setItem("santa_total",String(total));
if(total>=5 && !state.unlockedStarColors.frost){ state.unlockedStarColors.frost=true; showToast(`🎅 Поймано 5 Дедов Морозов! Открыт эксклюзивный цвет звезды «Морозный иней»!`); }
else showToast(`🎅 Дед Мороз пойман! +${SANTA_CONFIG.rewardSparks} 🔥, +${SANTA_CONFIG.rewardLights} огня и −30% на покупки за ⭐ на час!`);
markDirty(); refreshGiftPrices(); syncUI();
}

let fireworksActive=false, fireworksStartTime=0, fireworksNextBurst=0;
function isNewYearWindow(){ const now=new Date(); const y=now.getFullYear(); return now.getTime()>=new Date(y,0,1).getTime() && now.getTime()<new Date(y,0,4).getTime(); }
function maybeStartFireworks(){
if(!isNewYearWindow()) return;
const key="elka_fireworks_seen_"+new Date().getFullYear();
if(localStorage.getItem(key)) return;
fireworksActive=true; fireworksStartTime=performance.now(); fireworksNextBurst=0;
localStorage.setItem(key,"1");
}
function updateFireworks(now){
if(!fireworksActive) return;
if(now-fireworksStartTime>22000){ fireworksActive=false; return; }
if(now>=fireworksNextBurst){ spawnBurst(W*0.2+Math.random()*W*0.6,H*0.15+Math.random()*H*0.3,Math.random()*360); fireworksNextBurst=now+700+Math.random()*700; }
}

function renderScene(timeSec,dt){
const skyGrad=ctx.createLinearGradient(0,0,0,H);
skyGrad.addColorStop(0,"#050914"); skyGrad.addColorStop(0.65,"#0b1528"); skyGrad.addColorStop(1,"#101e36");
ctx.fillStyle=skyGrad; ctx.fillRect(0,0,W,H);
for(let i=0;i<starsBg.length;i++){ const s=starsBg[i]; const a=0.25+0.45*Math.sin(timeSec*1.4+s.p); ctx.fillStyle=`rgba(225,238,255,${a.toFixed(2)})`; ctx.fillRect(s.x,s.y,s.r,s.r); }
const tGrowth=clamp((TREE_CONFIG.growthCm-45)/(250-45),0,1);
const cx=W*0.5; const groundY=H*0.72+camPanY;
const scale=(H*0.56/250)*camZoom;
const totalH=TREE_CONFIG.growthCm;
const trunkRatio=lerp(TREE_CONFIG.trunkHSmall,TREE_CONFIG.trunkHLarge,tGrowth)/100;
const trunkH=totalH*trunkRatio;
const crownH=totalH-trunkH;
const widthRatio=lerp(TREE_CONFIG.widthSmall,TREE_CONFIG.widthLarge,tGrowth)/100;
const baseRadius=totalH*widthRatio;
const trunkR=(TREE_CONFIG.trunkRadius/1000)*Math.max(totalH,90);
const tiersCount=Math.round(lerp(TREE_CONFIG.tiersSmall,TREE_CONFIG.tiersLarge,tGrowth));
const gapPct=lerp(TREE_CONFIG.gapSmall,TREE_CONFIG.gapLarge,tGrowth)/100;
const droopVal=lerp(TREE_CONFIG.droopSmall,TREE_CONFIG.droopLarge,tGrowth)/100;
const sides=TREE_CONFIG.sides;
const cosA=Math.cos(rotY), sinA=Math.sin(rotY);
ctx.fillStyle="#0e1a2e";
ctx.beginPath(); ctx.ellipse(cx,groundY+34*camZoom,W*0.9*camZoom,52*camZoom,0,0,Math.PI*2); ctx.fill();
const palObj=PALETTES[LIGHT_CONFIG.palette]||PALETTES.champagne;
const pal=palObj.colors;
const groundGlowR=Math.max(65,baseRadius*1.95*scale);
const gGrad=ctx.createRadialGradient(cx,groundY+4,4,cx,groundY+4,groundGlowR);
const litStrength=(0.06+LIGHT_CONFIG.treeLit*0.28)*Math.min(1,LIGHT_CONFIG.count/24);
gGrad.addColorStop(0,`rgba(${pal[0].glow}, ${litStrength.toFixed(3)})`);
gGrad.addColorStop(1,"rgba(14, 26, 46, 0)");
ctx.fillStyle=gGrad;
ctx.beginPath(); ctx.ellipse(cx,groundY+4,groundGlowR,groundGlowR*0.28,0,0,Math.PI*2); ctx.fill();
const drawList=[];
const hue=TREE_CONFIG.hue, baseL=TREE_CONFIG.lightness, contr=TREE_CONFIG.contrast;
const frostAlpha=(TREE_CONFIG.frost/100)*0.45;
const litBoost=LIGHT_CONFIG.treeLit*Math.min(1,LIGHT_CONFIG.count/45)*4.5;
function addTri(p1,p2,p3,shade,allowFrost){
const avgZ=(p1.z+p2.z+p3.z)/3;
const l=clamp(baseL+shade*contr+(shade>-0.3?litBoost:0),6,58);
drawList.push({ type:"poly", z:avgZ, pts:[p1,p2,p3], fill:`hsl(${hue},48%,${l.toFixed(1)}%)`, stroke:(allowFrost && frostAlpha>0.02)?`rgba(210,240,255,${(frostAlpha*(shade>0?0.9:0.3)).toFixed(2)})`:null });
}
const trunkTopY=trunkH+crownH*0.78;
const pBotL=projectExact(-trunkR,0,0,cx,groundY,1,0,scale);
const pBotR=projectExact(trunkR,0,0,cx,groundY,1,0,scale);
const pTopL=projectExact(-trunkR*0.45,trunkTopY,0,cx,groundY,1,0,scale);
const pTopR=projectExact(trunkR*0.45,trunkTopY,0,cx,groundY,1,0,scale);
drawList.push({type:"trunk",z:0,pts:[pBotL,pBotR,pTopR,pTopL]});
const stepH=crownH/tiersCount;
const tierMeta=[];
for(let t=0;t<tiersCount;t++){
const frac=t/tiersCount;
const yBot=trunkH+t*stepH;
const coneHeight=clamp(stepH*(1.18-gapPct),stepH*0.45,stepH*1.45);
const yTop=yBot+coneHeight;
const rBot=baseRadius*(1-frac*0.86);
const rTop=(t===tiersCount-1)?0:(rBot*0.38);
const twist=t*0.35;
const edgeDrop=rBot*droopVal*(1-frac*0.65);
tierMeta.push({yBot,yTop,yRim:yBot-edgeDrop,rBot,twist});
for(let s=0;s<sides;s++){
const a1=(s/sides)*Math.PI*2+twist;
const a2=((s+1)/sides)*Math.PI*2+twist;
const aMid=(a1+a2)*0.5;
const pB1=projectExact(Math.cos(a1)*rBot,yBot-edgeDrop,Math.sin(a1)*rBot,cx,groundY,cosA,sinA,scale);
const pB2=projectExact(Math.cos(a2)*rBot,yBot-edgeDrop,Math.sin(a2)*rBot,cx,groundY,cosA,sinA,scale);
const light=Math.sin(aMid+rotY+0.55);
if(rTop<=0.1){ const pApex=projectExact(0,yTop,0,cx,groundY,cosA,sinA,scale); addTri(pB1,pB2,pApex,light,true); }
else {
const pT1=projectExact(Math.cos(a1)*rTop,yTop,Math.sin(a1)*rTop,cx,groundY,cosA,sinA,scale);
const pT2=projectExact(Math.cos(a2)*rTop,yTop,Math.sin(a2)*rTop,cx,groundY,cosA,sinA,scale);
addTri(pB1,pB2,pT2,light+0.1,true);
addTri(pB1,pT2,pT1,light-0.12,true);
}
if(gapPct>0.05){ const pCenterBot=projectExact(0,yBot,0,cx,groundY,cosA,sinA,scale); addTri(pB2,pB1,pCenterBot,-0.75,false); }
}
}
const count=LIGHT_CONFIG.count;
const lowestRimY=tierMeta.length>0?tierMeta[0].yRim:trunkH;
const apexY=tierMeta.length>0?tierMeta[tierMeta.length-1].yTop:totalH;
const bottomMargin=crownH*LIGHT_CONFIG.bottomStart;
const spiralTurns=clamp(count/6,2.5,14);
for(let i=0;i<count;i++){
const u=count===1?0.35:(i/(count-1));
const startY=lowestRimY+bottomMargin;
const endY=apexY-crownH*0.05;
const yPos=lerp(startY,endY,Math.pow(u,0.94));
const hNorm=clamp((yPos-lowestRimY)/Math.max(1,apexY-lowestRimY),0,1);
const coneR=baseRadius*(1-hNorm*0.86);
const rAtY=Math.max(3,coneR)*LIGHT_CONFIG.offset;
const angle=u*spiralTurns*Math.PI*2;
const p=projectExact(Math.cos(angle)*rAtY,yPos,Math.sin(angle)*rAtY,cx,groundY,cosA,sinA,scale);
const col=pal[i%pal.length];
const twinkleWave=0.72+0.28*Math.sin(timeSec*LIGHT_CONFIG.twinkle*2.4+i*1.9);
drawList.push({type:"light",z:p.z-1.5,sx:p.sx,sy:p.sy,persp:p.persp,col,twinkle:twinkleWave});
}
screenGiftHitboxes=[];
const N=state.groundGifts.length;
state.groundGifts.forEach((g,i)=>{
const angle=(i/N)*Math.PI*2;
const dist=1.0+(i%2)*0.15;
const r=Math.max(22,baseRadius*1.275*dist)+(g.scale||1)*4;
const gx=Math.cos(angle)*r, gz=Math.sin(angle)*r;
const pBase=projectExact(gx,0,gz,cx,groundY,cosA,sinA,scale);
drawList.push({type:"gift",z:pBase.z,sx:pBase.sx,syBottom:pBase.sy,persp:pBase.persp,gift:g});
});
drawList.sort((a,b)=>b.z-a.z);
for(let i=0;i<drawList.length;i++){
const item=drawList[i];
if(item.type==="poly"){
const pts=item.pts;
ctx.beginPath(); ctx.moveTo(pts[0].sx,pts[0].sy); ctx.lineTo(pts[1].sx,pts[1].sy); ctx.lineTo(pts[2].sx,pts[2].sy); ctx.closePath();
ctx.fillStyle=item.fill; ctx.fill();
if(item.stroke){ ctx.strokeStyle=item.stroke; ctx.lineWidth=0.8; ctx.stroke(); }
} else if(item.type==="trunk"){
const pts=item.pts;
ctx.beginPath(); ctx.moveTo(pts[0].sx,pts[0].sy);
for(let k=1;k<pts.length;k++) ctx.lineTo(pts[k].sx,pts[k].sy);
ctx.closePath(); ctx.fillStyle="#3b2416"; ctx.fill();
} else if(item.type==="light"){
const depthNorm=item.z/Math.max(20,baseRadius);
const depthFade=depthNorm>0.15?Math.max(0.28,1-(depthNorm-0.15)*0.75):1.0;
const alpha=depthFade*item.twinkle;
const sz=LIGHT_CONFIG.size*(0.72+item.persp*0.42);
const glowRadius=LIGHT_CONFIG.glowR*(0.72+item.persp*0.45)*(0.85+0.25*item.twinkle);
if(glowRadius>2){ const sprite=getGlowSprite(item.col.glow); ctx.save(); ctx.globalAlpha=Math.min(1,LIGHT_CONFIG.glowA*alpha); ctx.globalCompositeOperation="lighter"; ctx.drawImage(sprite,item.sx-glowRadius,item.sy-glowRadius,glowRadius*2,glowRadius*2); ctx.restore(); }
ctx.save(); ctx.globalAlpha=Math.min(1,alpha); ctx.translate(item.sx,item.sy);
ctx.fillStyle=item.col.mid;
ctx.beginPath(); ctx.moveTo(0,-4.5*sz); ctx.quadraticCurveTo(3.4*sz,0,0,6.5*sz); ctx.quadraticCurveTo(-3.4*sz,0,0,-4.5*sz); ctx.fill();
ctx.fillStyle=item.col.core;
ctx.beginPath(); ctx.arc(0,-0.5*sz,1.3*sz,0,Math.PI*2); ctx.fill();
ctx.restore();
} else if(item.type==="gift"){
const gScale=item.gift.scale||1;
const gSize=clamp(16*gScale*item.persp,15,400);
const bottomEt=GIFT_BOTTOM_Y[item.gift.kind]!=null?GIFT_BOTTOM_Y[item.gift.kind]:7.0;
const iconOffset=bottomEt*(gSize/20);
const cxIcon=item.sx, cyIcon=item.syBottom-iconOffset;
const hitRadius=Math.max(20,gSize*0.55);
ctx.save(); ctx.translate(cxIcon,cyIcon);
drawGiftIcon(ctx,item.gift.kind,gSize);
ctx.restore();
screenGiftHitboxes.push({ x:cxIcon, y:cyIcon, size:hitRadius, label:item.gift.label, from:item.gift.from, message:item.gift.message||"" });
}
}
const apexProj=projectExact(0,apexY+6,0,cx,groundY,cosA,sinA,scale);
lastApexScreen.x=apexProj.sx; lastApexScreen.y=apexProj.sy;
lastBaseScreen.x=cx; lastBaseScreen.y=groundY;
if(state.starLevel>=1) drawStarTopper(apexProj,timeSec);
else {
ctx.save(); ctx.strokeStyle="rgba(253,224,71,0.35)"; ctx.setLineDash([3,3]); ctx.lineWidth=1.2;
ctx.beginPath();
for(let i=0;i<10;i++){ const r=(i%2===0)?10:4.4; const a=-Math.PI/2+(i*Math.PI)/5; const x=apexProj.sx+Math.cos(a)*r, y=apexProj.sy+Math.sin(a)*r; if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y); }
ctx.closePath(); ctx.stroke();
ctx.restore();
}
ctx.fillStyle="rgba(235,245,255,0.72)";
for(let i=0;i<snow.length;i++){
const fl=snow[i]; fl.y+=fl.vy*dt; fl.x+=(fl.vx+Math.sin(timeSec+fl.phase)*8)*dt;
if(fl.y>H){ fl.y=-6; fl.x=Math.random()*W; }
if(fl.x>W) fl.x=0; if(fl.x<0) fl.x=W;
ctx.beginPath(); ctx.arc(fl.x,fl.y,fl.r,0,Math.PI*2); ctx.fill();
}
updateSanta(performance.now(),timeSec);
updateFireworks(performance.now());
updateFx(dt);
}

function syncUI(){
const isMaxTree=state.treeLevel>=TREE_LEVELS.length;
document.getElementById("lblHeight").textContent=isMaxTree?`🌲 ${TREE_CONFIG.growthCm} см · МАКС ✓`:`🌲 Ур.${state.treeLevel} · ${TREE_CONFIG.growthCm} см`;
document.getElementById("lblLightsCount").textContent=LIGHT_CONFIG.count>=MAX_LIGHTS?"МАКС ✓":`${LIGHT_CONFIG.count} огн.`;
document.getElementById("lblSparks").textContent=`🔥 ${fmtNum(state.sparks)}`;
document.getElementById("btnTabStar").innerHTML=topStarSvg(14,"#f5b82e")+` <span id="starLvlBadge">ур.${state.starLevel}</span>`;
const progRow=document.getElementById("progRow");
if(isMaxTree){ progRow.style.display="none"; }
else {
progRow.style.display="flex";
const need=TREE_LEVELS[state.treeLevel-1].need;
const pct=Math.min(100,(state.warmth/need)*100);
document.getElementById("progFill").style.width=pct+"%";
document.getElementById("progLabel").textContent=`${state.warmth}/${need} до ур.${state.treeLevel+1}`;
}
const discount=getDiscount();
const starList=document.getElementById("starList");
starList.innerHTML="";
let toShow;
if(state.starLevel>=5) toShow={...STAR_LEVELS[4],isMax:true};
else toShow=STAR_LEVELS[state.starLevel];
{
const row=document.createElement("button");
row.className="star-item"+(toShow.isMax?" owned":"");
let priceHTML;
if(toShow.isMax) priceHTML=`<div class="star-price">МАКСИМУМ ✓</div>`;
else if(toShow.type==="stars"){ const dc=discountedStars(toShow.cost); priceHTML=discount<1?`<div class="star-price">${dc} ⭐ <s style="opacity:0.55">${toShow.cost}</s></div>`:`<div class="star-price">${toShow.cost} ⭐</div>`; }
else priceHTML=`<div class="star-price">${toShow.costText}</div>`;
row.innerHTML=`<div class="star-info"><div class="star-title">Ур. ${toShow.lvl}: ${toShow.title}</div><div class="star-desc">${toShow.desc}</div></div>${priceHTML}`;
row.addEventListener("click",()=>{
if(toShow.isMax){ showToast(`⭐ Максимальный уровень уже установлен!`,true); return; }
if(toShow.type==="sparks"){
if(state.sparks<toShow.cost){ showToast(`Не хватает Искр: нужно ${toShow.cost} 🔥`,true); return; }
state.sparks-=toShow.cost; markDirty();
showToast(`⭐ Установлена звезда: «${toShow.title}»!`,true);
revealStar(toShow.lvl,null);
} else {
const cost=discountedStars(toShow.cost);
const dNow=getDiscount();
const confPrice=dNow<1?`${cost} ⭐ <s style="opacity:0.55">${toShow.cost}</s>`:`${cost} ⭐`;
showConfirm({
title:`${topStarSvg(18,"#f5b82e")} ${toShow.title}`,
desc:`${toShow.desc}\nУровень звезды останется навсегда.`,
price:confPrice, okText:"Купить",
onOk:()=>{ showToast(`⭐ Установлена звезда: «${toShow.title}» (демо, ${cost} ⭐)!`,true); revealStar(toShow.lvl,null); },
onCancel:()=>{}
});
}
});
starList.appendChild(row);
}
const colorGrid=document.getElementById("colorGrid");
colorGrid.innerHTML="";
const santaTotal=parseInt(localStorage.getItem("santa_total")||"0",10);
Object.keys(STAR_COLORS).forEach(key=>{
const c=STAR_COLORS[key];
const unlocked=!!state.unlockedStarColors[key];
const active=state.starColor===key;
const btn=document.createElement("button");
btn.className="color-btn"+(active?" active":"")+(unlocked?"":" locked")+(c.exclusive?" frost-special":"");
let priceHTML;
if(c.exclusive) priceHTML=unlocked?`<span class="color-price">${active?"✓":"открыт"}</span>`:`<span class="color-price">🎅 ${Math.min(santaTotal,5)}/5</span>`;
else if(unlocked) priceHTML=`<span class="color-price">${active?"✓":"—"}</span>`;
else priceHTML=`<span class="color-price">${c.cost} 🔥</span>`;
btn.innerHTML=`<span class="color-dot" style="background:${c.mid}; color:${c.mid}"></span><span>${c.name}</span>${priceHTML}`;
btn.addEventListener("click",()=>{
if(!unlocked){
if(c.exclusive){ const left=Math.max(0,5-santaTotal); showToast(`🎅 Цвет «${c.name}» откроется за 5 Дедов Морозов. Поймайте ещё ${left}!`,true); return; }
if(state.sparks<c.cost){ showToast(`Не хватает Искр: нужно ${c.cost} 🔥`,true); return; }
state.sparks-=c.cost; state.unlockedStarColors[key]=true;
}
const changed=state.starColor!==key;
showToast(`⭐ Цвет звезды: «${c.name}»`,true);
if(changed) revealStar(null,key);
else { markDirty(); syncUI(); }
});
colorGrid.appendChild(btn);
});
const palGrid=document.getElementById("palGrid");
palGrid.innerHTML="";
Object.keys(PALETTES).forEach(key=>{
const p=PALETTES[key];
const unlocked=!!state.unlockedPalettes[key];
const btn=document.createElement("button");
btn.className="pal-btn"+(LIGHT_CONFIG.palette===key?" active":"");
btn.innerHTML=`<span>${p.name}</span><span>${unlocked?"✓":p.cost+" 🔥"}</span>`;
btn.addEventListener("click",()=>{
if(!unlocked){
if(state.sparks<p.cost){ showToast(`Не хватает Искр: нужно ${p.cost} 🔥`,true); return; }
state.sparks-=p.cost; state.unlockedPalettes[key]=true; markDirty();
}
LIGHT_CONFIG.palette=key; markDirty(); syncUI();
showToast(`💡 Включена гирлянда «${p.name}»`,true);
});
palGrid.appendChild(btn);
});
const badge=document.getElementById("discountBadge");
if(Date.now()<state.discountEnd){
badge.classList.remove("hidden");
const left=state.discountEnd-Date.now();
const mins=Math.floor(left/60000);
const secs=Math.floor((left%60000)/1000);
document.getElementById("discountTimer").textContent=`${String(mins).padStart(2,"0")}:${String(secs).padStart(2,"0")}`;
} else badge.classList.add("hidden");
refreshGiftPrices();
updateShareMotivation();
}

function updateShareMotivation(){
const el=document.getElementById("shareMotivate");
if(!el) return;
const n=state.totalVisits||0;
if(n===0) el.textContent="Твоя ёлка ждёт первого гостя — позови друга! ✨";
else if(n===1) el.textContent="Уже 1 друг зажёг огонёк на твоей ёлке. Так держать!";
else if(n<=3) el.textContent=`Уже ${n} огонька от друзей! Чем больше гостей — тем пышнее ёлка.`;
else el.textContent=`Целых ${n} огоньков от друзей! Ёлка сияет благодаря тебе 🎄`;
}

const giftGrid=document.getElementById("giftGrid");
(function(){
const sorted=[...GIFT_ITEMS].sort((a,b)=>b.price-a.price);
sorted.forEach(g=>{
const card=document.createElement("button");
card.className="gift-card";
card.innerHTML=`<span class="gift-daily-badge" id="giftDaily_${g.kind}" style="display:none;">−25%</span><span class="gift-ico">${GIFT_SVGS[g.kind]||g.icon}</span><span class="gift-lbl">${g.label}</span><span class="gift-price" id="giftPrice_${g.kind}">${g.price} ⭐</span>`;
if(HIT_KINDS.has(g.kind)){ const hit=document.createElement("span"); hit.className="gift-hit-badge"; hit.textContent="хит"; card.appendChild(hit); }
card.addEventListener("click",()=>{
closeAllSheets();
const sc=(H*0.56/250)*camZoom;
const giftSize=clamp(Math.round(16*g.scale*sc),20,160);
const eff0=giftEffectivePrice(g);
showConfirm({
title:`🎁 ${g.label}`,
desc:"Подарок встанет под ёлку друга и простоит весь сезон. Имя дарителя увидит только хозяин.",
price:"", okText:"Подарить",
gift:{kind:g.kind,size:giftSize}, showInput:true,
onOk:()=>{
const msg=document.getElementById("confirmInput").value.trim().slice(0,40);
state.groundGifts.push({kind:g.kind,icon:g.icon,label:g.label,from:"Вы (Гость)",scale:g.scale,message:msg});
markDirty();
spawnBurst(lastBaseScreen.x,lastBaseScreen.y-30,330);
spawnBurst(lastBaseScreen.x,lastBaseScreen.y-10,48);
showToast(`🎁 Подарок «${g.label}» (${eff0} ⭐) поставлен (демо)!`,true);
},
onCancel:()=>{}
});
document.getElementById("confirmPrice").innerHTML = eff0<g.price ? `${eff0} ⭐ <s style="opacity:0.55">${g.price}</s>` : `${eff0} ⭐`;
});
giftGrid.appendChild(card);
});
})();
function refreshGiftPrices(){
const dailyKind=getDailyGiftKind();
GIFT_ITEMS.forEach(g=>{
const el=document.getElementById("giftPrice_"+g.kind);
if(!el) return;
const eff=giftEffectivePrice(g);
if(eff<g.price) el.innerHTML=`${eff} ⭐ <s style="opacity:0.55">${g.price}</s>`;
else el.textContent=`${eff} ⭐`;
const dEl=document.getElementById("giftDaily_"+g.kind);
if(dEl) dEl.style.display=(g.kind===dailyKind)?"inline-block":"none";
});
}

const DEMO_FRIENDS=[
{owner:"u101",name:"Аня",emoji:"🌲",heightCm:215,lights:68,starLevel:5,newGift:true},
{owner:"u202",name:"Макс",emoji:"🎄",heightCm:150,lights:41,starLevel:3,newGift:false},
{owner:"u303",name:"Даша",emoji:"✨",heightCm:95,lights:22,starLevel:2,newGift:true}
];
function loadVisitedTrees(){ try{ const r=localStorage.getItem("visited_trees"); return r?JSON.parse(r):null; }catch(e){ return null; } }
function saveVisitedTrees(trees){ try{ localStorage.setItem("visited_trees",JSON.stringify(trees.slice(0,12))); }catch(e){} }
function getFriendsTrees(){
const visited=loadVisitedTrees()||[];
const byOwner=new Map();
DEMO_FRIENDS.forEach(t=>byOwner.set(t.owner,{...t}));
visited.forEach(v=>{ const base=byOwner.get(v.owner)||{}; byOwner.set(v.owner,{...base,...v}); });
const arr=Array.from(byOwner.values());
arr.sort((a,b)=>(b.lastVisit||0)-(a.lastVisit||0));
return arr;
}
function recordVisit(t){
let trees=loadVisitedTrees()||[];
const entry={owner:t.owner,name:t.name,emoji:t.emoji,heightCm:t.heightCm,lights:t.lights,starLevel:t.starLevel,newGift:false,lastVisit:Date.now()};
const idx=trees.findIndex(x=>x.owner===t.owner);
if(idx>=0) trees[idx]=entry; else trees.unshift(entry);
saveVisitedTrees(trees);
}
function levelForHeight(h){ let lvl=1; for(let i=0;i<TREE_LEVELS.length;i++) if(TREE_LEVELS[i].heightCm<=h) lvl=TREE_LEVELS[i].level; return lvl; }
function applyStarGiftToFriend(owner,lvl){
let trees=loadVisitedTrees()||[];
const idx=trees.findIndex(x=>x.owner===owner);
if(idx>=0) trees[idx].starLevel=Math.max(trees[idx].starLevel||0,lvl);
else { const demo=DEMO_FRIENDS.find(d=>d.owner===owner); if(demo) trees.unshift({...demo,starLevel:lvl,newGift:false,lastVisit:Date.now()}); }
saveVisitedTrees(trees);
}
function renderFriendsCarousel(){
const box=document.getElementById("friendsCarousel");
box.innerHTML="";
const trees=getFriendsTrees();
trees.forEach(t=>{
const card=document.createElement("div");
card.className="friend-card";
card.innerHTML=`<div class="friend-name">${t.emoji} ${t.name}</div><div class="friend-stats">${t.heightCm} см · ${t.lights} огн.<br>${topStarSvg(11,"#f5b82e")} ур.${t.starLevel}</div><div class="friend-badge">${t.newGift?'🎁 новый подарок!':''}</div><div class="friend-actions"><button class="friend-btn visit">Зайти</button><button class="friend-btn gift">🎁</button><button class="friend-btn stargift">${topStarSvg(12,"#e9d5ff")}</button></div>`;
card.querySelector(".visit").addEventListener("click",()=>{
recordVisit(t); currentFriend=t; closeAllSheets(); setGuestMode(true);
showToast(`✨ Вы в гостях у ${t.name} — ваш огонёк зажёгся!`,true);
});
card.querySelector(".gift").addEventListener("click",()=>{
recordVisit(t); currentFriend=t; closeAllSheets(); setGuestMode(true); toggleSheet("sheetGifts");
});
card.querySelector(".stargift").addEventListener("click",()=>{
const cur=t.starLevel||0;
if(cur>=5){ showToast(`⭐ У ${t.name} уже максимальная звезда!`,true); return; }
const targetLvl=Math.max(3,cur+1);
const starDef=STAR_LEVELS[targetLvl-1];
const cost=discountedStars(starDef.cost);
const dNow=getDiscount();
const confPrice=dNow<1?`${cost} ⭐ <s style="opacity:0.55">${starDef.cost}</s>`:`${cost} ⭐`;
const jumpNote=cur<3?"\nЗвезда друга сразу поднимется до 3-го уровня.":"";
showConfirm({
title:`${topStarSvg(18,"#f5b82e")} Подарить «${starDef.title}»`,
desc:`Друг ${t.name} получит уровень ${targetLvl} звезды навсегда.${jumpNote}`,
price:confPrice, okText:"Подарить",
onOk:()=>{
applyStarGiftToFriend(t.owner,targetLvl);
renderFriendsCarousel();
spawnBurst(W*0.5,H*0.4,280);
spawnBurst(W*0.5,H*0.45,48);
showToast(`⭐ Вы подарили «${starDef.title}» — ${t.name}! (демо, ${cost} ⭐)`,true);
},
onCancel:()=>{}
});
});
box.appendChild(card);
});
}

function doWater(){
const now=Date.now();
const wRem=waterRemaining();
if(now<state.waterCdEnd || wRem<=0){
const lRem=liveWaterRemaining();
if(lRem<=0){ showToast("⚡ Лимит живой воды исчерпан (5). Возвращайтесь завтра!",true); return; }
const cost=discountedStars(WATER_CONFIG.liveWaterCost);
const dNow=getDiscount();
const lwPrice=dNow<1?`${cost} ⭐ <s style="opacity:0.55">${WATER_CONFIG.liveWaterCost}</s>`:`${cost} ⭐`;
showConfirm({
title:"⚡ Живая вода",
desc:`Мгновенно, без ожидания отката:\n+${WATER_CONFIG.liveWarmth} к прогрессу роста, +${WATER_CONFIG.liveLights} огонька, +${WATER_CONFIG.liveSparks} 🔥.`,
price:lwPrice, okText:"Купить",
onOk:()=>{
if(state.liveWaterDay!==todayStr()){ state.liveWaterDay=todayStr(); state.liveWaterCount=0; }
state.liveWaterCount++;
gainWarmth(WATER_CONFIG.liveWarmth);
addLights(WATER_CONFIG.liveLights);
state.sparks+=WATER_CONFIG.liveSparks;
markDirty(); syncUI();
spawnBurst(lastBaseScreen.x,lastBaseScreen.y-50,200);
showToast(`⚡ Живая вода (демо): +${WATER_CONFIG.liveWarmth} к прогрессу, +${WATER_CONFIG.liveLights} огонька, +${WATER_CONFIG.liveSparks} 🔥`);
},
onCancel:()=>{}
});
return;
}
if(state.waterDay!==todayStr()){ state.waterDay=todayStr(); state.waterCount=0; }
state.waterCount++;
state.waterCdEnd=now+WATER_CONFIG.cooldownMs;
gainWarmth(WATER_CONFIG.warmth);
addLights(WATER_CONFIG.lights);
state.sparks+=WATER_CONFIG.sparks;
markDirty(); syncUI();
spawnBurst(lastBaseScreen.x,lastBaseScreen.y-50,200);
showToast(`💧 +${WATER_CONFIG.lights} огонь, +${WATER_CONFIG.sparks} 🔥, прогресс +${WATER_CONFIG.warmth}`);
}

document.getElementById("btnWater").addEventListener("click",doWater);
document.getElementById("btnDailyGift").addEventListener("click",()=>{
const today=todayStr();
if(state.dailyLastDate===today){ showToast("🎁 Бонус уже получен сегодня — приходите завтра!",true); return; }
const yesterday=dateStrOffset(1);
state.streakCount=(state.dailyLastDate===yesterday)?state.streakCount+1:1;
let bonus=50; let msg="🎁 Ежедневный бонус: +50 🔥!";
if(state.streakCount===3){ bonus+=100; msg="🔥 Стрик 3 дня подряд! +50 🔥 и бонус +100 🔥!"; }
if(state.streakCount===7){ bonus+=250; msg="🔥 Стрик 7 дней подряд! +50 🔥 и бонус +250 🔥!"; }
state.sparks+=bonus;
state.dailyLastDate=today;
markDirty(); syncUI();
showToast(msg,true);
});
document.getElementById("btnTabStar").addEventListener("click",()=>toggleSheet("sheetStar"));
document.getElementById("btnTabGarland").addEventListener("click",()=>toggleSheet("sheetGarland"));
document.getElementById("btnTabFriends").addEventListener("click",()=>{ renderFriendsCarousel(); toggleSheet("sheetFriends"); });
document.getElementById("btnOpenShare").addEventListener("click",()=>toggleSheet("sheetShare"));
document.getElementById("btnOpenGiftShop").addEventListener("click",()=>toggleSheet("sheetGifts"));
document.getElementById("btnCopyBio").addEventListener("click",()=>{
const txt=document.getElementById("bioText").textContent.trim();
if(navigator.clipboard) navigator.clipboard.writeText(txt).catch(()=>{});
showToast("📋 Скопировано! Вставьте в Bio.",true);
});
document.getElementById("btnSimVisit").addEventListener("click",()=>{
if(state.visitDay!==todayStr()){ state.visitDay=todayStr(); state.visitCount=0; }
state.visitCount++;
state.totalVisits++;
gainWarmth(VISIT_CONFIG.warmth);
addLights(VISIT_CONFIG.lights);
state.sparks+=VISIT_CONFIG.sparks;
markDirty(); syncUI();
spawnBurst(lastApexScreen.x,lastApexScreen.y+26,48);
showToast(`✨ Друг зажёг огонёк: +${VISIT_CONFIG.lights} огня, прогресс +${VISIT_CONFIG.warmth} · визитов сегодня: ${state.visitCount}`,true);
});
function setGuestMode(enable){
closeAllSheets(); flushSave();
state.isGuest=enable;
const btn=document.getElementById("btnToggleGuest");
const banner=document.getElementById("guestBanner");
if(enable){
state.ownerBackup={
treeLevel:state.treeLevel, warmth:state.warmth,
lights:LIGHT_CONFIG.count, star:state.starLevel, starColor:state.starColor,
palette:LIGHT_CONFIG.palette, gifts:[...state.groundGifts]
};
if(currentFriend){
state.treeLevel=levelForHeight(currentFriend.heightCm);
TREE_CONFIG.growthCm=TREE_LEVELS[state.treeLevel-1].heightCm;
LIGHT_CONFIG.count=Math.min(MAX_LIGHTS,currentFriend.lights||4);
state.starLevel=Math.min(5,currentFriend.starLevel||0);
state.starColor="gold";
LIGHT_CONFIG.palette="champagne";
banner.textContent=`✨ Вы в гостях у ${currentFriend.name} — ваш тёплый огонёк уже зажёгся!`;
} else {
state.treeLevel=9; TREE_CONFIG.growthCm=TREE_LEVELS[8].heightCm;
LIGHT_CONFIG.count=68; state.starLevel=5; state.starColor="gold"; LIGHT_CONFIG.palette="champagne";
banner.textContent="✨ Вы зашли на ёлку друга — ваш тёплый огонёк уже зажёгся на ветке!";
}
state.warmth=0;
state.groundGifts=[
{kind:"champagne",icon:"🍾",label:"Шампанское",from:"Друг",scale:2.0,message:""},
{kind:"horse",icon:"🐎",label:"Символ года",from:"Друг",scale:3.6,message:""}
];
btn.classList.add("active"); btn.textContent="🏠 К себе";
document.getElementById("ownerHud").style.display="none";
document.getElementById("guestHud").style.display="flex";
} else {
if(state.ownerBackup){
state.treeLevel=state.ownerBackup.treeLevel;
state.warmth=state.ownerBackup.warmth;
TREE_CONFIG.growthCm=TREE_LEVELS[state.treeLevel-1].heightCm;
LIGHT_CONFIG.count=state.ownerBackup.lights;
state.starLevel=state.ownerBackup.star;
state.starColor=state.ownerBackup.starColor;
LIGHT_CONFIG.palette=state.ownerBackup.palette;
state.groundGifts=state.ownerBackup.gifts;
}
currentFriend=null;
banner.textContent="✨ Вы зашли на ёлку друга — ваш тёплый огонёк уже зажёгся на ветке!";
btn.classList.remove("active"); btn.textContent="👁 Вид гостя";
document.getElementById("ownerHud").style.display="flex";
document.getElementById("guestHud").style.display="none";
showToast("🌲 Добро пожаловать к вашей ёлке 2027!");
}
syncUI();
}
document.getElementById("btnToggleGuest").addEventListener("click",()=>setGuestMode(!state.isGuest));
document.getElementById("btnMyTree").addEventListener("click",()=>setGuestMode(false));

setInterval(()=>{
const now=Date.now();
const btnWater=document.getElementById("btnWater");
const wRem=waterRemaining();
const lRem=liveWaterRemaining();
const liveCost=discountedStars(WATER_CONFIG.liveWaterCost);
if(now<state.waterCdEnd){
btnWater.classList.add("cd");
const secsLeft=Math.ceil((state.waterCdEnd-now)/1000);
btnWater.textContent=lRem>0?`⏳ ${secsLeft}с · ⚡ ускорить (${liveCost} ⭐)`:`⏳ ${secsLeft}с`;
} else if(wRem<=0){
btnWater.classList.add("cd");
btnWater.textContent=lRem>0?`💧 лимит · ⚡ ускорить (${liveCost} ⭐)`:`💧 лимит · завтра`;
} else {
btnWater.classList.remove("cd");
btnWater.textContent=`💧 Полить`;
}
const giftBadge=document.getElementById("giftCdBadge");
giftBadge.textContent=(state.dailyLastDate===todayStr())?fmtHMS(msUntilMidnight()):"Готов!";
const dgi=document.getElementById("dailyGiftInfo");
if(dgi){ const dk=getDailyGiftKind(); const dItem=GIFT_ITEMS.find(x=>x.kind===dk); dgi.textContent=`Скидка дня: ${dItem.label} · −25% · ${fmtHMS(msUntilMidnight())}`; }
const dkNow=dailyKey();
if(dkNow!==lastDailyKey){
lastDailyKey=dkNow;
refreshGiftPrices();
if(!document.getElementById("confirmOverlay").classList.contains("hidden")){
hideConfirm();
showToast("🎁 Скидка дня обновилась!",true);
}
}
const badge=document.getElementById("discountBadge");
if(now<state.discountEnd){
badge.classList.remove("hidden");
const left=state.discountEnd-now;
const mins=Math.floor(left/60000);
const secs=Math.floor((left%60000)/1000);
document.getElementById("discountTimer").textContent=`${String(mins).padStart(2,"0")}:${String(secs).padStart(2,"0")}`;
} else if(!badge.classList.contains("hidden")){
badge.classList.add("hidden");
refreshGiftPrices();
syncUI();
}
},250);

const FINAL_TS=new Date(2026,11,31,23,59,59).getTime();
function updateCountdown(){
const left=Math.max(0,FINAL_TS-Date.now());
const d=Math.floor(left/86400000);
const h=Math.floor(left/3600000)%24;
const m=Math.floor(left/60000)%60;
document.getElementById("lblCountdown").textContent=`До 2027: ${d}д ${String(h).padStart(2,"0")}ч ${String(m).padStart(2,"0")}м`;
}
updateCountdown();
setInterval(updateCountdown,30000);

(function applyStarIcons(){
const headSpan=document.getElementById("sheetStarTitle");
if(headSpan) headSpan.innerHTML=topStarSvg(16,"#f5b82e")+" 5-лучевая Звезда на макушку";
})();

lastSaved=snapshot();
syncUI();
refreshGiftPrices();
maybeStartFireworks();
initSanta();

let lastTime=performance.now();
function loop(now){
const dt=Math.min(0.05,(now-lastTime)/1000);
lastTime=now;
if(activePointers.size===0) rotY+=autoSpin*dt;
renderScene(now/1000,dt);
requestAnimationFrame(loop);
}
requestAnimationFrame(loop);