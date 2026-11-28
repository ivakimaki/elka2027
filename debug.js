/* ============================================================
DEBUG PANEL + DIAG v4.4 (удалены лишние скроллы, исправлен копипаст буфера)
============================================================ */
(function(){
  var logBuffer = [];
  var MAX_LOG_LINES = 30;
  function addLog(type, args){
    var textStr = Array.from(args).map(function(a){
      try{ return typeof a==='object'?JSON.stringify(a):String(a); }catch(e){ return String(a); }
    }).join(' ');
    if(textStr.indexOf('scroll') >= 0 || textStr.indexOf('tgbrowser') >= 0) return;
    logBuffer.push('['+type+'] '+textStr);
    if(logBuffer.length>MAX_LOG_LINES) logBuffer.shift();
  }
  var origLog=console.log, origWarn=console.warn, origError=console.error;
  console.log=function(){addLog('LOG',arguments);origLog.apply(console,arguments);};
  console.warn=function(){addLog('WARN',arguments);origWarn.apply(console,arguments);};
  console.error=function(){addLog('ERROR',arguments);origError.apply(console,arguments);};

  window.addEventListener('error', function(e){
    addLog('WIN_ERR', [e.message, e.filename ? (e.filename.split('/').pop()+':'+e.lineno+':'+e.colno) : '']);
  });
  window.addEventListener('unhandledrejection', function(e){
    addLog('PROMISE_ERR', [e.reason && e.reason.message ? e.reason.message : String(e.reason)]);
  });

  function collectDiag(){
    var L=[];
    L.push('=== ДИАГНОСТИКА v4.4 ===');
    L.push('URL: '+location.href.slice(0,70));
    var tg=window.Telegram&&window.Telegram.WebApp;
    L.push('Telegram.WebApp: '+(tg?'есть':'НЕТ'));
    if(tg){
      var id=tg.initData||'';
      L.push('initData длина: '+id.length);
      L.push('содержит hash=: '+(id.indexOf('hash=')>=0?'ДА':'НЕТ'));
      var u=tg.initDataUnsafe||{};
      L.push('user id: '+(u.user?u.user.id:'нет'));
      L.push('username: '+(u.user?u.user.username:'нет'));
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
    if(logBuffer.length > 0){
      L.push('');
      L.push('=== ЛОГИ ('+logBuffer.length+') ===');
      L.push(logBuffer.join('\n'));
    }
    return L.join('\n');
  }

  function copyDiag(){
    var panel=document.getElementById('__diagPanel');
    var txt = panel && panel.style.display !== 'none' ? panel.textContent : collectDiag();
    var done=function(ok){ if(typeof showToast==='function') showToast(ok?'📋 Дебаг скопирован в буфер':'Не удалось скопировать'); };
    if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(txt).then(function(){done(true);},function(){done(fallbackCopy(txt));}); }
    else done(fallbackCopy(txt));
  }
  function fallbackCopy(t){
    var ta=document.createElement('textarea'); ta.value=t; ta.style.cssText='position:fixed;left:-9999px;';
    document.body.appendChild(ta); ta.focus(); ta.select();
    var ok=false; try{ok=document.execCommand('copy');}catch(e){}
    document.body.removeChild(ta); return ok;
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

  function buildDiag(){
    if(document.getElementById('__diagBtn')) return;
    var wrap=document.createElement('div');
    wrap.style.cssText='position:fixed;bottom:14px;right:14px;z-index:99998;display:flex;flex-direction:column;gap:8px;align-items:flex-end;';
    var mk=function(txt,bg){var b=document.createElement('button');b.textContent=txt;b.style.cssText='width:44px;height:44px;border-radius:50%;border:1px solid rgba(255,255,255,.25);background:'+bg+';color:#fff;font-size:18px;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.5);';return b;};
    var bMain=mk('🔍','rgba(10,16,28,.92)');
    var bCopy=mk('📋','rgba(30,60,120,.92)');
    wrap.appendChild(bCopy);wrap.appendChild(bMain);
    document.body.appendChild(wrap);
    var panel=document.createElement('pre');
    panel.id='__diagPanel';
    panel.style.cssText='position:fixed;bottom:170px;right:14px;z-index:99998;max-width:320px;background:rgba(10,16,28,.98);border:1px solid rgba(250,204,21,.5);border-radius:12px;padding:10px;font-size:11px;line-height:1.4;color:#e2e8f0;display:none;white-space:pre-wrap;word-break:break-word;font-family:monospace;max-height:62vh;overflow-y:auto;margin:0;user-select:text;';
    document.body.appendChild(panel);
    bMain.onclick=function(){ panel.textContent=collectDiag(); panel.style.display=panel.style.display==='none'?'block':'none'; };
    bCopy.onclick=copyDiag;
  }
  if(document.body) buildDiag();
  else document.addEventListener('DOMContentLoaded',buildDiag);
})();