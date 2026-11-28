/* ============================================================
DEBUG PANEL + DIAG v4.2 (с подробным логированием бэкенда и состояния)
Опциональный файл: если не подключён в index.html — ничего не ломается.
============================================================ */
(function(){
  var logBuffer = [];
  var MAX_LOG_LINES = 40;
  function addLog(type, args){
    var line='['+type+'] '+Array.from(args).map(function(a){
      try{ return typeof a==='object'?JSON.stringify(a):String(a); }catch(e){ return String(a); }
    }).join(' ');
    logBuffer.push(line);
    if(logBuffer.length>MAX_LOG_LINES) logBuffer.shift();
  }
  var origLog=console.log, origWarn=console.warn, origError=console.error;
  console.log=function(){addLog('LOG',arguments);origLog.apply(console,arguments);};
  console.warn=function(){addLog('WARN',arguments);origWarn.apply(console,arguments);};
  console.error=function(){addLog('ERROR',arguments);origError.apply(console,arguments);};

  var DEBUG_ENABLED=new URLSearchParams(location.search).has("debug");
  var panelOpen=false, tapCount=0, tapTimer=null;
  var trigger=document.getElementById("lblLights");
  if(trigger){
    trigger.style.cursor="pointer";
    trigger.addEventListener("click",function(){
      tapCount++;
      clearTimeout(tapTimer);
      tapTimer=setTimeout(function(){tapCount=0;},600);
      if(tapCount>=3){ tapCount=0; togglePanel(); }
    });
  }
  function log2(msg){
    if(typeof showToast==="function") showToast("🐞 "+msg,false);
    else console.log("[debug]",msg);
  }
  function buildPanel(){
    if(document.getElementById("__debugPanel")) return;
    var p=document.createElement("div");
    p.id="__debugPanel";
    p.style.cssText='position:fixed;top:12px;right:12px;background:rgba(10,16,28,0.97);border:1px solid rgba(250,204,21,0.5);border-radius:14px;padding:10px;z-index:99999;display:none;flex-direction:column;gap:6px;max-width:220px;font-family:-apple-system,sans-serif;box-shadow:0 8px 30px rgba(0,0,0,0.7);';
    p.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;"><span style="font-size:12px;font-weight:700;color:#fde68a;">🐞 DEBUG</span><button id="__dbgClose" style="background:rgba(255,255,255,0.1);border:none;color:#cbd5e1;width:22px;height:22px;border-radius:50%;cursor:pointer;font-size:12px;">✕</button></div>'+
    '<button data-act="santa" style="padding:8px;border-radius:8px;border:none;background:linear-gradient(135deg,#dc2626,#991b1b);color:#fff;font-weight:600;font-size:12px;cursor:pointer;">🎅 Дед Мороз</button>'+
    '<button data-act="catch" style="padding:8px;border-radius:8px;border:none;background:linear-gradient(135deg,#16a34a,#15803d);color:#fff;font-weight:600;font-size:12px;cursor:pointer;">✋ Поймать сразу</button>'+
    '<button data-act="discount" style="padding:8px;border-radius:8px;border:none;background:linear-gradient(135deg,#d97706,#b45309);color:#fff;font-weight:600;font-size:12px;cursor:pointer;">🏷 Скидка −30%</button>'+
    '<button data-act="sparks" style="padding:8px;border-radius:8px;border:none;background:linear-gradient(135deg,#eab308,#a16207);color:#fff;font-weight:600;font-size:12px;cursor:pointer;">🔥 +1000 Искр</button>'+
    '<button data-act="grow" style="padding:8px;border-radius:8px;border:none;background:linear-gradient(135deg,#1d6fa5,#144d75);color:#fff;font-weight:600;font-size:12px;cursor:pointer;">🌲 +1 уровень</button>'+
    '<button data-act="reload_backend" style="padding:8px;border-radius:8px;border:none;background:linear-gradient(135deg,#7e22ce,#581c87);color:#fff;font-weight:600;font-size:12px;cursor:pointer;">🔄 Перезагрузить с БД</button>'+
    '<button data-act="reset" style="padding:8px;border-radius:8px;border:none;background:rgba(220,38,38,0.25);color:#fca5a5;font-weight:600;font-size:12px;cursor:pointer;">♻ Полный сброс</button>';
    document.body.appendChild(p);
    p.querySelector("#__dbgClose").onclick=function(){togglePanel(false);};
    p.querySelectorAll("[data-act]").forEach(function(btn){ btn.onclick=function(){runAction(btn.dataset.act);}; });
  }
  function togglePanel(force){
    buildPanel();
    var p=document.getElementById("__debugPanel");
    panelOpen=typeof force==="boolean"?force:!panelOpen;
    p.style.display=panelOpen?"flex":"none";
  }
  function runAction(act){
    try{
      if(act==="santa"){ if(typeof santaCaughtThisRun!=="undefined") santaCaughtThisRun=false; if(typeof santaActive!=="undefined") santaActive=false; spawnSanta(); log2("Дед Мороз запущен"); }
      else if(act==="catch"){ if(typeof santaActive!=="undefined" && !santaActive){ santaCaughtThisRun=false; spawnSanta(); setTimeout(function(){ try{ catchSanta(); }catch(e){ log2("catchSanta: "+e.message); } },300); log2("Дед запущен + пойман"); } else { catchSanta(); log2("Дед Мороз пойман"); } }
      else if(act==="discount"){ state.discountEnd=Date.now()+60*60*1000; refreshGiftPrices(); syncUI(); log2("Скидка активна"); }
      else if(act==="sparks"){ state.sparks+=1000; markDirty(); syncUI(); log2("+1000 🔥"); }
      else if(act==="grow"){ if(state.treeLevel<TREE_LEVELS.length){ var need=TREE_LEVELS[state.treeLevel-1].need; gainWarmth(need); addLights(20); markDirty(); syncUI(); log2("Ёлка +1 уровень"); } else log2("Максимальный уровень"); }
      else if(act==="reload_backend"){
        if(window.ElkaBackend && typeof window.ElkaBackend.reload==='function'){
          window.ElkaBackend.reload().then(()=>log2("Бэкенд перезагружен")).catch(e=>log2("Ошибка релоада: "+e.message));
        } else log2("ElkaBackend недоступен");
      }
      else if(act==="reset"){
        localStorage.clear();
        sessionStorage.clear();
        log2("Хранилище очищено. Перезагрузка...");
        setTimeout(function(){location.reload();},300);
      }
    }catch(e){ log2("Ошибка: "+e.message); }
  }
  if(DEBUG_ENABLED){
    var wait=setInterval(function(){ if(typeof spawnSanta==="function"){ clearInterval(wait); togglePanel(true); } },200);
  }
  window.__debug={open:function(){togglePanel(true);},close:function(){togglePanel(false);},run:runAction};

  function collectDiag(){
    var L=[];
    L.push('=== ДИАГНОСТИКА v4.2 ===');
    L.push('URL: '+location.href.slice(0,70));
    var tg=window.Telegram&&window.Telegram.WebApp;
    L.push('Telegram.WebApp: '+(tg?'есть':'НЕТ'));
    if(tg){
      var id=tg.initData||'';
      L.push('initData длина: '+id.length);
      L.push('содержит hash=: '+(id.indexOf('hash=')>=0?'ДА':'НЕТ'));
      var u=tg.initDataUnsafe||{};
      L.push('user id: '+(u.user?u.user.id:'нет'));
    }
    L.push('');
    if(typeof SUPABASE_URL!=='undefined') L.push('SUPABASE_URL: '+SUPABASE_URL);
    L.push('supabase SDK: '+(window.supabase?'загружен':'НЕ ЗАГРУЖЕН'));
    if(window.ElkaBackend){
      var s=window.ElkaBackend.getState();
      L.push('backend.initialized: '+s.initialized);
      L.push('backend.userId: '+s.currentUserId);
      L.push('accessTokenPresent: '+s.accessTokenPresent);
    }
    L.push('');
    L.push('Причина офлайна: '+(window.__elkaOfflineReason||'—'));
    if(window.__elkaOfflineError) L.push('Ошибка: '+window.__elkaOfflineError);
    if(window.__elkaTestResult){ L.push(''); L.push(window.__elkaTestResult); }
    if(logBuffer.length > 0){
      L.push('');
      L.push('=== ЛОГИ ('+logBuffer.length+') ===');
      L.push(logBuffer.join('\n'));
    }
    return L.join('\n');
  }
  function copyDiag(){
    var txt=collectDiag();
    var done=function(ok){ alert(ok?'Скопировано':'Не вышло скопировать'); };
    if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(txt).then(function(){done(true);},function(){done(fallbackCopy(txt));}); }
    else done(fallbackCopy(txt));
  }
  function fallbackCopy(t){
    var ta=document.createElement('textarea'); ta.value=t; ta.style.cssText='position:fixed;left:-9999px;';
    document.body.appendChild(ta); ta.focus(); ta.select();
    var ok=false; try{ok=document.execCommand('copy');}catch(e){}
    document.body.removeChild(ta); return ok;
  }
  function testTgAuth(){
    var tg=window.Telegram&&window.Telegram.WebApp;
    if(!tg || !tg.initData){
      window.__elkaTestResult='--- ТЕСТ ---\nTelegram.WebApp.initData отсутствует';
      showPanel(); return;
    }
    var realInitData = tg.initData;
    var url=SUPABASE_URL+'/functions/v1/tg-auth';
    var out=['--- ТЕСТ tg-auth ---'];
    out.push('Отправка initData...');
    window.__elkaTestResult=out.join('\n'); showPanel();
    fetch(url,{
      method:'POST',
      headers:{'Content-Type':'application/json','apikey':SUPABASE_ANON_KEY,'Authorization':'Bearer '+SUPABASE_ANON_KEY},
      body:JSON.stringify({initData:realInitData})
    })
    .then(function(resp){
      out.push('HTTP статус: '+resp.status);
      return resp.text().then(function(t){
        out.push('Ответ: '+t.slice(0,300));
        window.__elkaTestResult=out.join('\n'); showPanel();
      });
    })
    .catch(function(e){
      out.push('Ошибка: '+(e&&e.message?e.message:e));
      window.__elkaTestResult=out.join('\n'); showPanel();
    });
  }
  function showPanel(){
    var p=document.getElementById('__diagPanel');
    if(p){ p.textContent=collectDiag(); p.style.display='block'; }
  }
  window.addEventListener('elka:backend-offline',function(e){
    window.__elkaOfflineReason=(e.detail&&e.detail.reason)||'unknown';
    if(e.detail&&e.detail.error) window.__elkaOfflineError=String(e.detail.error);
    showPanel();
  });
  window.addEventListener('elka:backend-ready',function(){
    log2('Бэкенд успешно инициализирован и синхронизирован');
  });
  function buildDiag(){
    if(document.getElementById('__diagBtn')) return;
    var wrap=document.createElement('div');
    wrap.style.cssText='position:fixed;bottom:14px;right:14px;z-index:99998;display:flex;flex-direction:column;gap:8px;align-items:flex-end;';
    var mk=function(txt,bg){var b=document.createElement('button');b.textContent=txt;b.style.cssText='width:44px;height:44px;border-radius:50%;border:1px solid rgba(255,255,255,.25);background:'+bg+';color:#fff;font-size:18px;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.5);';return b;};
    var bMain=mk('🔍','rgba(10,16,28,.92)');
    var bCopy=mk('📋','rgba(30,60,120,.92)');
    var bTest=mk('🧪','rgba(90,40,140,.92)');
    wrap.appendChild(bTest);wrap.appendChild(bCopy);wrap.appendChild(bMain);
    document.body.appendChild(wrap);
    var panel=document.createElement('pre');
    panel.id='__diagPanel';
    panel.style.cssText='position:fixed;bottom:170px;right:14px;z-index:99998;max-width:320px;background:rgba(10,16,28,.98);border:1px solid rgba(250,204,21,.5);border-radius:12px;padding:10px;font-size:11px;line-height:1.4;color:#e2e8f0;display:none;white-space:pre-wrap;word-break:break-word;font-family:monospace;max-height:62vh;overflow-y:auto;margin:0;user-select:text;';
    document.body.appendChild(panel);
    bMain.onclick=function(){ panel.textContent=collectDiag(); panel.style.display=panel.style.display==='none'?'block':'none'; };
    bCopy.onclick=copyDiag;
    bTest.onclick=testTgAuth;
    if(window.__elkaOfflineReason) showPanel();
  }
  if(document.body) buildDiag();
  else document.addEventListener('DOMContentLoaded',buildDiag);
})();
