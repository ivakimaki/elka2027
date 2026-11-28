/* ============================================================
КОНФИГИ И ОСНОВНОЙ КОД КЛИЕНТА v14.4
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
const TREE_CONFIG={model:"skirt_pyramid",growthCm:45,tiersSmall:2,tiersLarge:11,gapSmall:10,gapLarge:35,sides:6,widthSmall:19,widthLarge:41,trunkHSmall:24,trunkHLarge:16,trunkRadius:30,droopSmall:-25,droopLarge:35,hue:135,lightness:12,contrast:28,frost:45};
const LIGHT_CONFIG={shape:"icicle",palette:"champagne",layout:"spiral",count:4,turns:9,bottomStart:-0.06,size:0.5,glowR:21,glowA:0.3,offset:1.03,twinkle:1.3,treeLit:0.3};
const PALETTES={champagne:{name:"Шампань",cost:0,colors:[{core:"#fffdf8",mid:"#f9e3b4",glow:"247, 217, 156"}]}};
const STAR_COLORS={ruby:{name:"Рубин",cost:0,light:"#ff9aa8",mid:"#e6243c",dark:"#7a0918",core:"#fff2f4",glow:"255, 68, 92"}};
const STAR_STAGES=[{level:1,points:5,shadeMode:"facet",waveSpeed:0.5,size:15,innerRatio:0.44,facetDepth:0.45,liftY:11,glowR:30,glowA:0.35,ray0Len:18,ray45Len:0,twinkleSpeed:1.0,swayAngle:12,swaySpeed:1.0,floatAmp:1.5,floatSpeed:1.2}];
const STAR_LEVELS=[{lvl:1,title:"Первая искра",desc:"Классическая 5-лучевая звезда",costText:"100 🔥",type:"sparks",cost:100}];
const GIFT_ITEMS=[{kind:"coal",icon:"🧦",label:"Носок угля",price:10,scale:1.0}];

const state={ sparks:45, starLevel:0, starColor:"ruby", unlockedPalettes:{champagne:true}, unlockedStarColors:{ruby:true}, treeLevel:1, warmth:0, waterCdEnd:0, waterDay:"", waterCount:0, groundGifts:[] };

function showToast(msg){ const el=document.getElementById("toast"); if(!el) return; el.textContent=msg; el.classList.add("show"); setTimeout(()=>el.classList.remove("show"),4000); }
function syncUI(){
  const lblH=document.getElementById("lblHeight"); if(lblH) lblH.textContent=`🌲 Ур.${state.treeLevel} · ${TREE_CONFIG.growthCm} см`;
  const lblS=document.getElementById("lblSparks"); if(lblS) lblS.textContent=`🔥 ${state.sparks}`;
  const lblL=document.getElementById("lblLightsCount"); if(lblL) lblL.textContent=`${LIGHT_CONFIG.count} огн.`;
  const progFill=document.getElementById("progFill");
  const progLabel=document.getElementById("progLabel");
  const curLvlObj=TREE_LEVELS[Math.min(state.treeLevel-1, TREE_LEVELS.length-1)];
  const nextNeed=curLvlObj.need;
  if(progFill && progLabel && nextNeed!==Infinity){
    const pct=Math.min(100, (state.warmth/nextNeed)*100);
    progFill.style.width=pct+"%";
    progLabel.textContent=`${state.warmth}/${nextNeed} до ур.${state.treeLevel+1}`;
  } else if(progLabel) {
    progLabel.textContent="Макс уровень";
    if(progFill) progFill.style.width="100%";
  }
}

async function doWater(){
  const backendReady = !!(window.ElkaBackend && typeof window.ElkaBackend.water==='function');
  if(backendReady){
    try {
      const res = await window.ElkaBackend.water();
      if(res && res.user){
        state.treeLevel = res.user.tree_level;
        state.warmth = res.user.warmth;
        state.sparks = res.user.sparks;
        LIGHT_CONFIG.count = res.user.lights_count;
        TREE_CONFIG.growthCm = TREE_LEVELS[Math.min(state.treeLevel, TREE_LEVELS.length)-1].heightCm;
        syncUI();
        showToast("💧 Ёлка полита успешно!");
      }
    } catch(e) {
      showToast("Ошибка полива: " + (e.message || e));
    }
  } else {
    state.warmth += 1;
    state.sparks += 10;
    LIGHT_CONFIG.count = Math.min(MAX_LIGHTS, LIGHT_CONFIG.count + 1);
    syncUI();
    showToast("💧 Полито (локально)");
  }
}

const btnWaterEl = document.getElementById("btnWater");
if(btnWaterEl) btnWaterEl.addEventListener("click", () => doWater());

const canvas = document.getElementById("scene");
const ctx = canvas.getContext("2d");
function resize(){
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

function renderScene(){
  ctx.fillStyle = "#0b1528";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  const cx = canvas.width / 2;
  const cy = canvas.height * 0.42;
  const height = 300;
  const tiers = 6;
  
  // Тонкий ствол
  ctx.fillStyle = "#3d2817";
  ctx.fillRect(cx - 8, cy, 16, height * 0.55);
  
  // Ярусы ёлки
  for(let i = 0; i < tiers; i++){
    const tierY = cy - height * 0.3 + (i * (height / tiers));
    const tierW = 120 - (i * 15);
    const tierH = height / (tiers - 1);
    
    ctx.fillStyle = i % 2 === 0 ? "#15803d" : "#16a34a";
    ctx.beginPath();
    ctx.moveTo(cx, tierY - tierH * 0.5);
    ctx.lineTo(cx - tierW, tierY + tierH * 0.5);
    ctx.lineTo(cx + tierW, tierY + tierH * 0.5);
    ctx.closePath();
    ctx.fill();
  }
  
  // Звезда на макушке
  ctx.fillStyle = "#fde047";
  ctx.beginPath();
  const starX = cx, starY = cy - height * 0.35;
  for(let s = 0; s < 5; s++){
    const angle = (s * 4 * Math.PI) / 5 - Math.PI / 2;
    const r = s === 0 ? 16 : 16;
    const px = starX + Math.cos(angle) * r;
    const py = starY + Math.sin(angle) * r;
    if(s === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

function loop(){
  renderScene();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
syncUI();