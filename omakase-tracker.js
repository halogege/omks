/* Omakaseya (任せ屋) - Reading Tracker untuk Carrd.
   Dipasang lewat: <script src="https://DOMAIN-VERCEL/omakase-tracker.js"></script>
   Tracker muncul di elemen dengan id="omakase-tracker".
   Data: menus.json dan config.js (API_URL) dari domain yang sama.
   Opsional di tag script: data-width="1152" data-scale="1" data-bg="transparent" data-theme="light" data-api="https://.../exec" data-hash="tracker"
   Link order: https://DOMAIN/?kode=OMK-0091#tracker (juga terbaca #tracker?kode=OMK-0091 atau #OMK-0091).
   data-hash = nama section Carrd untuk tracker (default: id section tempat container berada, atau "tracker"). */
(function () {
  "use strict";
  var CONTAINER_ID = "omakase-tracker";
  var BASE = "", WIDTH = 1152, BG = "", SCALE = 1, API_ATTR = "", AUTODARK = true, HASHNAME = "tracker", HASH_SET = false;
  try {
    var cs = document.currentScript || document.querySelector('script[src*="omakase-tracker.js"]');
    BASE = new URL(cs.src).origin;
    var dw = parseInt(cs.getAttribute("data-width"), 10); if (dw >= 320) WIDTH = dw;
    if (cs.getAttribute("data-bg")) BG = cs.getAttribute("data-bg");
    var ds = parseFloat(cs.getAttribute("data-scale")); if (ds >= 0.5 && ds <= 1.5) SCALE = ds;
    API_ATTR = cs.getAttribute("data-api") || "";
    if (cs.getAttribute("data-theme") === "light") AUTODARK = false;
    var dh = (cs.getAttribute("data-hash") || "").replace(/[^A-Za-z0-9_-]/g, ""); if (dh) { HASHNAME = dh; HASH_SET = true; }
  } catch (e) { BASE = ""; }

  function ready(fn) { if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn); else fn(); }
  function findContainer(cb) {
    var tries = 0;
    (function look() {
      var el = document.getElementById(CONTAINER_ID);
      if (el) return cb(el);
      if (++tries > 40) { console.warn("[" + CONTAINER_ID + "] Container dengan id '" + CONTAINER_ID + "' tidak ditemukan."); return; }
      setTimeout(look, 250);
    })();
  }
  // Kecilkan/besarkan semua ukuran px (kecuali garis tipis <=4px dan breakpoint @media)
  function scaleCss(css, k) {
    if (k === 1) return css;
    var heads = [];
    css = css.replace(/@media\([^)]*\)/g, function (m) { heads.push(m); return "@M" + (heads.length - 1) + "@"; });
    css = css.replace(/(\d+(?:\.\d+)?)px/g, function (m, n) { n = parseFloat(n); return n <= 4 ? m : (Math.round(n * k * 10) / 10) + "px"; });
    return css.replace(/@M(\d+)@/g, function (m, i) { return heads[+i]; });
  }
  // config.js milik Omakaseya mengisi window.API_URL. Diambil lalu dikembalikan supaya tidak menimpa embed lain di halaman yang sama.
  function loadApi() {
    return new Promise(function (res) {
      var prev = window.API_URL, s = document.createElement("script");
      window.API_URL = undefined;
      s.src = BASE + "/config.js";
      s.onload = function () { var u = window.API_URL; window.API_URL = prev; res(u || null); };
      s.onerror = function () { window.API_URL = prev; res(null); };
      document.head.appendChild(s);
    });
  }
  function injectFonts() {
    if (document.getElementById("omk-fonts")) return;
    var l = document.createElement("link");
    l.id = "omk-fonts"; l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?display=swap&family=Archivo:wght@400;500;600;700;800;900&family=Fuzzy+Bubbles:wght@700&display=swap";
    document.head.appendChild(l);
  }
  function mountHost(container) {
    var host = document.createElement("div");
    // Carrd: isi container ada di .wrapper > .inner (layout flex). Masuk ke situ dan paksa selebar container.
    var target = container.querySelector(".wrapper > .inner") || container;
    host.style.cssText = "display:block;width:100%;max-width:100%;flex:1 1 100%;min-width:0;align-self:stretch;margin:0;";
    target.appendChild(host);
    return host;
  }

  var CSS = `:host{all:initial;display:block;--w:__W__px;color-scheme:light;--bg:#f3efe4;--fg:#000144;--mute:#6b6c99;--card:#fff;--line:rgba(0,1,68,.18);--head:#000144;--headfg:#fff;--hover:rgba(255,215,94,.3);--hi:#ffd75e;--red:#c4161c;--lilac:#d8d9fb;--sky:#cfe6f2;--sh:rgba(0,0,0,.28);
--b-rec-bg:#cfe6f2;--b-rec-fg:#000144;--b-pro-bg:#ffd75e;--b-pro-fg:#000144;--b-del-bg:#bbf7d0;--b-del-fg:#000144;--b-can-bg:#000144;--b-can-fg:#fff}
:host(.dark){color-scheme:dark;--bg:#07070f;--fg:#f1f1ff;--mute:#9b9cc6;--card:#0f0f1c;--line:#2b2b42;--hover:rgba(255,215,94,.14);--lilac:#23244f;--sky:#1a2f3d;--sh:rgba(255,255,255,.12);
--b-rec-bg:#1a2f3d;--b-rec-fg:#fff;--b-pro-bg:#854d0e;--b-pro-fg:#fff;--b-del-bg:#166534;--b-del-fg:#fff;--b-can-bg:#404040;--b-can-fg:#fff}
*{box-sizing:border-box}
:host{--c-general:#cfe6f2;--c-selfdevelopment:#c9f0d4;--c-romance:#ffc9dc;--c-spiritual:#d8d9fb;--c-surpriseme:#ffd75e;--c-bazi:#ffd0b0}
:host(.dark){--c-general:#1a4a63;--c-selfdevelopment:#14532d;--c-romance:#7a2146;--c-spiritual:#3a3b85;--c-surpriseme:#854d0e;--c-bazi:#7c3a14}
.omk{background:var(--bg);color:var(--fg);font:16px/1.5 Archivo,system-ui,sans-serif;text-align:left;-webkit-text-size-adjust:100%;transition:background .2s,color .2s}
.strip{height:28px;background:repeating-conic-gradient(var(--fg) 0 25%,transparent 0 50%) 0 0/28px 28px}
.strip.end{margin-top:34px}
main{max-width:var(--w);margin:0 auto;padding:26px 16px 0}
.jp{font:700 15.2px 'Fuzzy Bubbles',Archivo,cursive;color:var(--mute);margin:0 0 4px}
header.hd{display:flex;flex-direction:column;gap:14px;margin-bottom:22px}
@media(min-width:768px){header.hd{flex-direction:row;justify-content:space-between;align-items:flex-end}}
h1{font:900 clamp(38.4px,11vw,60.8px)/.9 Archivo,sans-serif;letter-spacing:-.045em;text-transform:uppercase;margin:0}
.hl{background:linear-gradient(var(--hi),var(--hi)) 0 92%/100% .45em no-repeat;color:var(--fg)}
.sub{margin:10px 0 0;font:700 15.2px 'Fuzzy Bubbles',Archivo,cursive;color:var(--mute)}
.ctl{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
input[type=search],select{border:2px solid var(--fg);border-radius:2px;background:var(--card);color:var(--fg);font:500 15.2px Archivo,sans-serif;padding:10px 12px;min-height:44px;-webkit-appearance:none;appearance:none}
select{background-image:linear-gradient(45deg,transparent 50%,var(--fg) 50%),linear-gradient(135deg,var(--fg) 50%,transparent 50%);background-position:calc(100% - 18px) 55%,calc(100% - 12px) 55%;background-size:6px 6px;background-repeat:no-repeat;padding-right:36px}
input[type=search]{width:240px;max-width:100%}
input:focus-visible,select:focus-visible,button:focus-visible,tr[tabindex]:focus-visible{outline:3px solid var(--hi);outline-offset:1px}
.icon{width:44px;height:44px;border:2px solid var(--fg);border-radius:2px;background:var(--card);color:var(--fg);cursor:pointer;font-size:16.8px;line-height:1;transition:background .15s}
.icon:hover{background:var(--hi);color:#000144}
.tabs{display:inline-flex;border:2px solid var(--fg);border-radius:2px;overflow:hidden;box-shadow:4px 4px 0 var(--sh)}
.tab{border:0;background:var(--card);color:var(--fg);padding:8px 16px;min-height:44px;font:800 12.48px Archivo,sans-serif;letter-spacing:.12em;text-transform:uppercase;cursor:pointer;transition:background .15s,color .15s}
.tab+.tab{border-left:2px solid var(--fg)}
.tab:hover{background:var(--hi);color:#000144}
.tab[aria-selected=true]{background:var(--fg);color:var(--bg)}
.tab b{font-weight:900;opacity:.65;margin-left:4px}
.blk{margin-bottom:34px}
.blk .top{display:flex;justify-content:space-between;align-items:baseline;gap:10px;padding-bottom:8px;margin-bottom:12px;border-bottom:2px solid var(--fg);font-weight:800;letter-spacing:.16em;text-transform:uppercase}
.blk .top>span{font:900 24px/1.1 Archivo,sans-serif;letter-spacing:-.02em}.blk .top b{margin-left:6px;opacity:.55}
.blk .top em{font:700 15.2px 'Fuzzy Bubbles',Archivo,cursive;letter-spacing:0;text-transform:none;color:var(--mute)}
.bar{display:flex;justify-content:space-between;align-items:center;gap:10px;margin:0 0 10px;font-size:10.88px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--mute)}
.link{border:0;background:none;padding:6px 0;font:700 11.52px Archivo,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:var(--fg);text-decoration:underline;text-underline-offset:3px;cursor:pointer}
.wrapt{overflow-x:auto;border:2px solid var(--fg);border-radius:3px;background:var(--card);box-shadow:6px 6px 0 var(--sh)}
table{width:100%;min-width:560px;table-layout:fixed;border-collapse:collapse;font-size:14.72px}
th:nth-child(1){width:13%}th:nth-child(2){width:21%}th:nth-child(3){width:18%}th:nth-child(4){width:14%}th:nth-child(5){width:14%}th:nth-child(6){width:20%}
thead{background:var(--head);color:var(--headfg)}
th{padding:12px;text-align:left;font-weight:800;font-size:10.88px;letter-spacing:.16em;text-transform:uppercase}
td{padding:12px;border-top:1px solid var(--line);vertical-align:top}
tbody tr{cursor:pointer;transition:background .15s}tbody tr:hover{background:var(--hover)}
.code{font-weight:900;white-space:nowrap;letter-spacing:-.01em}
.nm{font-weight:700}
.nmw{overflow-wrap:anywhere;word-break:break-word}
.th{display:flex;flex-wrap:wrap;gap:4px}.th.col{flex-direction:column;align-items:flex-start}
.tg{display:inline-block;padding:2px 8px;border:2px solid var(--fg);border-radius:2px;background:var(--lilac);font-size:10.56px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;white-space:nowrap}
.tg[data-t=general]{background:var(--c-general)}.tg[data-t=selfdevelopment]{background:var(--c-selfdevelopment)}.tg[data-t=romance]{background:var(--c-romance)}.tg[data-t=spiritual]{background:var(--c-spiritual)}.tg[data-t=surpriseme]{background:var(--c-surpriseme)}.tg[data-t=bazi]{background:var(--c-bazi)}
.dt{white-space:nowrap}
.badge{display:inline-block;padding:3px 9px;border:2px solid var(--fg);border-radius:2px;font-size:10.56px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;white-space:nowrap}
.s-received{background:var(--b-rec-bg);color:var(--b-rec-fg)}.s-progress{background:var(--b-pro-bg);color:var(--b-pro-fg)}
.s-delivered{background:var(--b-del-bg);color:var(--b-del-fg)}.s-cancelled{background:var(--b-can-bg);color:var(--b-can-fg)}
.md{display:none}.sm{display:block;margin-top:6px;font-weight:500}.sd{margin-top:4px;font-size:12.48px;color:var(--mute)}
@media(min-width:900px){.md{display:table-cell}.sm{display:none}}
.sh{display:none}
@media(max-width:899px){.lg{display:none}.sh{display:inline}table{min-width:0}th:nth-child(2){width:40%}th:nth-child(5){width:26%}th:nth-child(6){width:34%}th,td{padding:10px 8px}.dt,.badge{white-space:normal}}
.pager{display:flex;flex-wrap:wrap;justify-content:center;gap:6px;margin-top:18px}
.pg{min-width:40px;min-height:40px;padding:0 10px;border:2px solid var(--fg);border-radius:2px;background:var(--card);color:var(--fg);font:800 13.6px Archivo,sans-serif;cursor:pointer;transition:background .15s}
.pg:hover:not(:disabled){background:var(--hi);color:#000144}.pg[aria-current=page]{background:var(--fg);color:var(--bg)}.pg:disabled{opacity:.4;cursor:not-allowed}
.gap{align-self:center;color:var(--mute)}
.msg{padding:28px 16px;text-align:center}.msg p{margin:0 0 10px}.msg .err{color:var(--red);font-weight:700}
.btn{display:inline-flex;justify-content:space-between;align-items:center;gap:14px;border:0;border-radius:2px;background:var(--hi);color:#000144;padding:12px 16px;font:900 12.8px Archivo,sans-serif;letter-spacing:.14em;text-transform:uppercase;cursor:pointer;min-height:48px;transition:background .2s}
.btn:hover:not(:disabled){background:#fff;outline:2px solid #000144}
.note{margin:24px 0 0;font-size:13.12px;color:var(--mute);max-width:70ch}
#modal{position:fixed;inset:0;z-index:50;display:none;align-items:center;justify-content:center;padding:16px;background:rgba(0,1,68,.55)}
#modal.open{display:flex}
.dlg{position:relative;width:100%;max-width:640px;max-height:90vh;overflow:auto;background:var(--card);color:var(--fg);border:2px solid var(--fg);border-radius:3px;padding:22px;box-shadow:6px 6px 0 var(--hi)}
.x{position:absolute;right:12px;top:10px;border:0;background:none;color:var(--mute);font-size:19.2px;cursor:pointer;padding:6px 10px}.x:hover{color:var(--fg)}
.mh{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;padding-right:32px;padding-bottom:10px;margin-bottom:10px;border-bottom:2px solid var(--fg)}
.mh h3{margin:0;font:900 24.8px/1.1 Archivo,sans-serif;letter-spacing:-.02em;word-break:break-word}
.cs{margin:0 0 14px;font:700 15.2px 'Fuzzy Bubbles',Archivo,cursive;color:var(--mute)}.cs em{font-style:normal}
.grid{display:grid;grid-template-columns:1fr;gap:8px}@media(min-width:520px){.grid{grid-template-columns:1fr 1fr}}
.ic{border:2px solid var(--fg);border-radius:2px;padding:8px 12px;background:var(--card)}
.il{display:block;font-size:10.56px;letter-spacing:.16em;text-transform:uppercase;color:var(--mute);font-weight:800}
.iv{display:block;font-weight:700;word-break:break-all}
.sl{margin:18px 0 8px;font-size:10.88px;letter-spacing:.16em;text-transform:uppercase;color:var(--mute);font-weight:800}
.tm{border:2px solid var(--fg);border-radius:2px;background:var(--card);padding:10px 14px;margin-bottom:8px}.tm .mn{margin-top:6px;font-weight:600}
.mf{display:flex;justify-content:flex-end;align-items:center;gap:12px;margin-top:18px}
.mf span{font-size:12.8px;color:var(--mute)}
@media(prefers-reduced-motion:reduce){*{transition:none!important}}`;
  var MAIN_HTML = `<div class="omk"><div class="strip"></div>
<main>
<header class="hd">
  <div>
    <p class="jp">任せ屋、 tarot reading services</p>
    <h1>Reading <span class="hl">tracker.</span></h1>
    <p class="sub">Last updated: <span id="lastUpdate">—</span></p>
  </div>
  <div class="ctl">
    <input id="q" type="search" placeholder="Cari kode, nama, platform…" autocomplete="off" maxlength="40" aria-label="Cari order">
    <select id="statusFilter" aria-label="Saring status"></select>
    <button class="icon" id="dark" type="button" aria-label="Ganti mode gelap" title="Mode gelap">☾</button>
  </div>
</header>

<div class="bar"><span id="count"></span><button class="link" id="refresh" type="button">Perbarui sekarang</button></div>

<div id="secs"></div>

<p class="note">Note: Status bersifat view-only dan diperbarui oleh Admin. Demi privasi, nama, kontak, dan email disensor: hanya huruf depan dan belakang tiap kata yang terlihat. Klik baris untuk melihat detail. Urutan: order terbaru di paling atas.</p>
</main>
<div class="strip end"></div></div>`;
  var MODAL_HTML = `<div class="omk"><div id="modal" aria-hidden="true">
  <div class="dlg" role="dialog" aria-modal="true" aria-labelledby="mName">
    <button class="x" id="mClose" type="button" aria-label="Tutup">✕</button>
    <div class="mh"><h3 id="mName"></h3><span id="mStatus" class="badge"></span></div>
    <div class="cs"><em id="mClient"></em></div>
    <div class="grid">
      <div class="ic"><span class="il">Kode</span><span class="iv" id="mCode"></span></div>
      <div class="ic"><span class="il">Platform</span><span class="iv" id="mPlatform"></span></div>
      <div class="ic"><span class="il">Kontak</span><span class="iv" id="mContact"></span></div>
      <div class="ic"><span class="il">Email</span><span class="iv" id="mEmail"></span></div>
      <div class="ic"><span class="il">Tanggal Order</span><span class="iv" id="mOrder"></span></div>
      <div class="ic"><span class="il">Tanggal Received</span><span class="iv" id="mRecv"></span></div>
    </div>
    <div class="sl">Pesanan</div>
    <div id="mThemes"></div>
    <div class="mf"><span id="copied" hidden>Link disalin ✓</span><button class="btn" id="share" type="button">Share Link</button></div>
  </div>
</div></div>`;

  async function start(container) {
    injectFonts();
    var API = API_ATTR || await loadApi();
    // Nama section Carrd tempat tracker berada (dipakai untuk pindah section saat link ?kode= dibuka)
    if (!HASH_SET) { var sec = container.closest && container.closest("section[id]"); if (sec && /^[A-Za-z0-9_-]+$/.test(sec.id)) HASHNAME = sec.id; }
    var css = scaleCss(CSS, SCALE).replace(/__W__/g, WIDTH);
    if (BG) css += "\n:host,:host(.dark){--bg:" + BG + "}";
    var host = mountHost(container);
    var root = host.attachShadow({ mode: "open" });
    root.innerHTML = "<style>" + css + "</style>" + MAIN_HTML;
    // Popup detail dipasang di body supaya position:fixed tidak terpengaruh transform Carrd
    var mHost = document.createElement("div");
    mHost.style.cssText = "all:initial;display:block";
    document.body.appendChild(mHost);
    var mRoot = mHost.attachShadow({ mode: "open" });
    mRoot.innerHTML = "<style>" + css + "</style>" + MODAL_HTML;

    // Mode gelap (class "dark" di kedua host)
    var dark = false;
    try { var tv = localStorage.getItem("omk-theme"); dark = tv === "dark" || (!tv && AUTODARK && window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches); } catch (e) {}
    function applyDark() { host.classList.toggle("dark", dark); mHost.classList.toggle("dark", dark); }
    function isDark() { return dark; }
    function toggleDark() { dark = !dark; applyDark(); return dark; }
    applyDark();

    /* ---- logika tracker (dari tracker.html) ---- */
    const $=s=>root.querySelector(s)||mRoot.querySelector(s),esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
    const ST={received:'Form Received',progress:'On Progress',delivered:'Delivered',cancelled:'Cancelled'},PAGE=15,REFRESH_MS=60000;
    let ALL=[],status='',q='',loaded=false,loading=false,lastFocus=null,openCode='';
    const SEC=[{k:'a',t:'Aktif',em:'lagi dikerjakan ✦',f:o=>isActive(o),p:1},{k:'d',t:'Completed',em:'sudah selesai ✦',f:o=>!isActive(o),p:1}];
    $('#secs').innerHTML=SEC.map(s=>`<section class="blk" id="sec-${s.k}"><div class="top"><span>${s.t}<b id="c-${s.k}">0</b></span><em>${s.em}</em></div><div class="wrapt"><table><thead><tr><th class="md">Kode</th><th>Nama</th><th class="md">Tema</th><th class="md">Order</th><th>Received</th><th><span class="lg">Status Pesanan</span><span class="sh">Status</span></th></tr></thead><tbody id="body-${s.k}"></tbody></table><div id="state-${s.k}"></div></div><nav class="pager" id="pager-${s.k}" aria-label="Halaman ${s.t}"></nav></section>`).join('');
    // Ambil daftar pesanan dari respon API; toleran terhadap nama field lain / format string.
    const ITEM_KEYS=['items','item','pesanan','menu','menus','reading','readings'];
    function itemsOf(o){let v;for(const k of ITEM_KEYS){const x=o[k];if(Array.isArray(x)&&x.length||typeof x==='string'&&x.trim()){v=x;break}}
     if(v==null)return[];
     if(typeof v==='string')v=v.split(/\s*[,;|\n]\s*/);
     return(Array.isArray(v)?v:[v]).map(x=>x&&typeof x==='object'?(x.label||x.name||x.title||x.menu||''):x).map(x=>String(x).trim()).filter(Boolean)}
    const slug=t=>String(t).toLowerCase().replace(/[^a-z]/g,'');
    const note=()=>{};

    const fmtDate=s=>s?new Date(s+'T00:00:00+07:00').toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric',timeZone:'Asia/Jakarta'}):'—';
    const isActive=o=>o.status==='received'||o.status==='progress';
    function rows(sec){
      const k=q.trim().toLowerCase();
      return ALL.filter(o=>sec.f(o)&&(!status||o.status===status)&&(!k||[o.code,o.name,o.platform,o.contact,o.email,o.items.join(' '),(o.tema||[]).join(' ')].join(' ').toLowerCase().includes(k)));
    }   // ALL sudah diurutkan terbaru di atas (n menurun), jadi tiap tabel terbaru di paling atas

    // Kolom Tema: nama grup dari menus.json (General, Self Development, Romance, Spiritual, Surprise Me!), tanpa jumlah pertanyaan/kartu.
    // Label order dicocokkan ke nama menu di menus.json. Kalau tidak ketemu, dipakai kata tema di THEMES atau nama menu tanpa "(...)".
    const THEMES=['spiritual','bazi','romance','general'],THEME_RE=new RegExp(THEMES.join('|'),'i');
    let MAP=[];
    function buildMap(c){MAP=[];((c&&c.groups)||[]).forEach(g=>g.cats.forEach(k=>k.items.forEach(i=>MAP.push([String(i.name).toLowerCase(),g.name.split(',')[0].trim()]))));MAP.sort((a,b)=>b[0].length-a[0].length)}
    function themeOf(l){const raw=String(l),low=raw.toLowerCase(),s=raw.replace(/\s*\([^)]*\)/g,'').trim(),h=MAP.find(m=>low.startsWith(m[0]))||MAP.find(m=>low.includes(m[0])),t=s.match(THEME_RE);return h?h[1]:t?t[0]:s}
    function themes(items){const out=[];(items||[]).forEach(l=>{const v=themeOf(l);if(v&&!out.some(x=>x.toLowerCase()===v.toLowerCase()))out.push(v)});return out}
    function tr(o){
      const tg=o.tema||[],tags=tg.length?tg.map(i=>`<span class="tg" data-t="${slug(i)}">${esc(i)}</span>`).join(''):'—',thw=`<div class="th${tg.length>=3?' col':''}">${tags}</div>`;
      return `<tr tabindex="0" data-n="${o.n}"><td class="code md">${esc(o.code||'—')}</td><td class="nm"><div class="nmw">${esc(o.name)}<div class="sm">${thw}</div></div></td>
    <td class="md">${thw}</td>
    <td class="md dt">${esc(fmtDate(o.orderDate))}</td><td class="dt">${esc(fmtDate(o.deadline))}</td><td><span class="badge s-${esc(o.status)}">${esc(ST[o.status]||o.status)}</span></td></tr>`;
    }
    function pager(sec,pages){
      const el=$('#pager-'+sec.k),page=sec.p,d=`data-s="${sec.k}"`;if(pages<=1){el.innerHTML='';return}
      const set=new Set([1,pages,page-1,page,page+1]),list=[...set].filter(p=>p>=1&&p<=pages).sort((a,b)=>a-b);
      let h=`<button class="pg" ${d} data-p="${page-1}" ${page<=1?'disabled':''} aria-label="Sebelumnya">‹</button>`,prev=0;
      list.forEach(p=>{if(prev&&p-prev>1)h+='<span class="gap">…</span>';h+=`<button class="pg" ${d} data-p="${p}" ${p===page?'aria-current="page"':''}>${p}</button>`;prev=p});
      el.innerHTML=h+`<button class="pg" ${d} data-p="${page+1}" ${page>=pages?'disabled':''} aria-label="Berikutnya">›</button>`;
    }
    function counts(){
      const sel=$('#statusFilter'),keys=['received','progress','delivered'].concat(ALL.some(o=>o.status==='cancelled')?['cancelled']:[]);
      if(sel.dataset.k!==keys.join()){sel.innerHTML='<option value="">All Status</option>'+keys.map(s=>`<option value="${s}">${ST[s]}</option>`).join('');sel.dataset.k=keys.join();sel.value=status}
    }
    function render(){
      counts();if(!loaded)return;let tot=0;
      SEC.forEach(sec=>{const r=rows(sec),pages=Math.max(1,Math.ceil(r.length/PAGE));sec.p=Math.min(sec.p,pages);tot+=r.length;
        $('#c-'+sec.k).textContent=r.length;
        $('#body-'+sec.k).innerHTML=r.slice((sec.p-1)*PAGE,sec.p*PAGE).map(tr).join('');
        $('#state-'+sec.k).innerHTML=r.length?'':`<div class="msg"><p><b>${ALL.some(sec.f)?'Tidak ada order yang cocok.':sec.k==='a'?'Tidak ada order aktif.':'Belum ada order selesai.'}</b></p></div>`;
        pager(sec,pages)});
      $('#count').textContent=tot+' order';note();
    }
    function fail(msg){
      if(loaded)return;
      SEC.forEach(x=>{$('#body-'+x.k).innerHTML='';$('#pager-'+x.k).innerHTML='';$('#state-'+x.k).innerHTML='';$('#c-'+x.k).textContent=''});$('#count').textContent='';$('#lastUpdate').textContent='gagal memuat';
      $('#state-a').innerHTML=`<div class="msg"><p class="err">${esc(msg)}</p><button class="btn" type="button" id="retry">Coba lagi</button></div>`;note();
    }
    async function load(){
      if(loading)return;loading=true;$('#refresh').disabled=true;
      if(!loaded)$('#state-a').innerHTML='<div class="msg"><p>Memuat data order…</p></div>';
      try{
        if(!API||/GANTI/.test(API))throw new Error('Tracker belum tersambung ke data order.');
        const r=await fetch(API+(API.includes('?')?'&':'?')+'action=tracker&t='+Date.now(),{cache:'no-store'});
        const j=await r.json();
        if(!j||!j.ok||!Array.isArray(j.orders))throw new Error('Data order belum bisa dibaca.');
        ALL=j.orders.map(o=>{const it=itemsOf(o),tm=Array.isArray(o.themes)&&o.themes.length?o.themes.map(x=>String(x).trim()).filter(Boolean):themes(it);return Object.assign({},o,{items:it,tema:tm.filter((x,i)=>tm.findIndex(y=>y.toLowerCase()===x.toLowerCase())===i)})}).sort((a,b)=>b.n-a.n);loaded=true;
        $('#lastUpdate').textContent=new Date(j.updated).toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit',timeZone:'Asia/Jakarta'}).replace('.',':')+' WIB';
        render();
        if(openCode){const o=ALL.find(x=>String(x.code).toLowerCase()===openCode.toLowerCase());openCode='';if(o)openModal(o)}
      }catch(e){fail(e&&e.message&&!/fetch|json|network|load failed/i.test(e.message)?e.message:'Tidak bisa terhubung ke server. Periksa koneksi lalu coba lagi.')}
      finally{loading=false;$('#refresh').disabled=false}
    }
    /* modal */
    let cur=null;
    function openModal(o){
      cur=o;lastFocus=document.activeElement;
      $('#mName').textContent=o.name;const b=$('#mStatus');b.textContent=ST[o.status]||o.status;b.className='badge s-'+o.status;
      $('#mClient').textContent=o.visit==='Sudah pernah.'?'It\u2019s nice to see you around again. Welcome back, the cards missed you! ✦':o.visit==='Belum pernah.'?'Welcome to your first journey together! ✦':'';
      $('#mCode').textContent=o.code||'—';$('#mPlatform').textContent=o.platform||'—';$('#mContact').textContent=o.contact||'—';$('#mEmail').textContent=o.email||'—';
      $('#mOrder').textContent=fmtDate(o.orderDate);$('#mRecv').textContent=fmtDate(o.deadline);
      const grp={},tl=(o.tema||[]).slice();if(o.menus&&typeof o.menus==='object'&&!Array.isArray(o.menus))Object.keys(o.menus).forEach(t=>{grp[t.toLowerCase()]=[].concat(o.menus[t]).map(String).filter(Boolean);if(!tl.some(x=>x.toLowerCase()===t.toLowerCase()))tl.push(t)});(o.items||[]).forEach(m=>{const t=themeOf(m),k=t.toLowerCase();(grp[k]=grp[k]||[]).push(m);if(!tl.some(x=>x.toLowerCase()===k))tl.push(t)});
      $('#mThemes').innerHTML=tl.length?tl.map(t=>`<div class="tm"><span class="tg" data-t="${slug(t)}">${esc(t)}</span>${(grp[t.toLowerCase()]||[]).map(m=>`<div class="mn">${esc(m)}</div>`).join('')}</div>`).join(''):'<div class="tm">—</div>';
      $('#copied').hidden=true;$('#modal').classList.add('open');$('#modal').setAttribute('aria-hidden','false');$('#mClose').focus();
    }
    function closeModal(){$('#modal').classList.remove('open');$('#modal').setAttribute('aria-hidden','true');cur=null;if(lastFocus&&lastFocus.focus)lastFocus.focus()}
    $('#mClose').addEventListener('click',closeModal);
    $('#modal').addEventListener('click',e=>{if(e.target.id==='modal')closeModal()});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&cur)closeModal()});
    $('#share').addEventListener('click',async()=>{
      if(!cur||!cur.code)return;const url=location.origin+location.pathname+'?kode='+encodeURIComponent(cur.code)+'#'+HASHNAME;
      try{await navigator.clipboard.writeText(url);$('#copied').hidden=false}catch(e){prompt('Salin link ini:',url)}
    });
    /* events */
    const openRow=t=>{const o=ALL.find(x=>String(x.n)===t.dataset.n);if(o)openModal(o)};
    $('#secs').addEventListener('click',e=>{const t=e.target.closest('tr[data-n]');if(t)return openRow(t);
      const b=e.target.closest('[data-p]');if(!b||b.disabled)return;const sc=SEC.find(x=>x.k===b.dataset.s);if(sc){sc.p=+b.dataset.p;render();$('#sec-'+sc.k).scrollIntoView()}});
    $('#secs').addEventListener('keydown',e=>{if(e.key!=='Enter'&&e.key!==' ')return;const t=e.target.closest('tr[data-n]');if(!t)return;e.preventDefault();openRow(t)});
    $('#q').addEventListener('input',e=>{q=e.target.value;SEC.forEach(x=>x.p=1);render()});
    $('#statusFilter').addEventListener('change',e=>{status=e.target.value;SEC.forEach(x=>x.p=1);render()});
    $('#refresh').addEventListener('click',load);
    root.addEventListener('click',e=>{if(e.target.id==='retry')load()});
    document.addEventListener('visibilitychange',()=>{if(!document.hidden&&loaded)load()});
    setInterval(()=>{if(!document.hidden)load()},REFRESH_MS);
    function theme(){$('#dark').textContent=isDark()?'☀':'☾'}
    $('#dark').addEventListener('click',()=>{const d=toggleDark();try{localStorage.setItem('omk-theme',d?'dark':'light')}catch(e){}theme()});
    theme();
    // tautan langsung: tracker?kode=OMK-0091  (membuka detail order itu)
    const CODE_RE=/^[A-Za-z]{2,6}-\d{1,6}$/;
    // Terima: ?kode=OMK-0091 | #tracker?kode=OMK-0091 | #OMK-0091. Hash biasa seperti #tracker diabaikan.
    function readKode(){let v='';try{const h=location.hash.slice(1),i=h.indexOf('?');v=new URLSearchParams(location.search).get('kode')||(i>-1?new URLSearchParams(h.slice(i+1)).get('kode'):'')||(i>-1?h.slice(0,i):h)||''}catch(e){}v=String(v).trim().slice(0,40);return CODE_RE.test(v)?v:''}
    function gotoKode(k,scroll){if(loaded){const o=ALL.find(x=>String(x.code).toLowerCase()===k.toLowerCase());if(o)openModal(o)}else openCode=k;if(scroll)host.scrollIntoView({behavior:'auto',block:'start'})}
    // Carrd menampilkan section lewat hash. Kalau halaman dibuka dengan ?kode= tapi hash-nya bukan section tracker (mis. kosong atau #home), pindahkan.
    function goSection(){const b=location.hash.slice(1).split('?')[0];if(b!==HASHNAME){try{location.hash=HASHNAME}catch(e){}}}
    let lastK='';
    (function(){const k=readKode();if(k){lastK=k;openCode=k;setTimeout(goSection,300);setTimeout(goSection,1500)}})();
    window.addEventListener('hashchange',()=>{const k=readKode();if(k&&k!==lastK){lastK=k;gotoKode(k,true)}});
    fetch(BASE+'/menus.json',{cache:'no-cache'}).then(r=>r.json()).then(c=>{buildMap(c);if(loaded)render()}).catch(()=>{});
    load();
  }

  ready(function () { findContainer(start); });
})();
