/* Omakaseya (任せ屋) - form order untuk Carrd.
   Dipasang lewat: <script src="https://DOMAIN-VERCEL/omakase-order.js"></script>
   Form muncul di elemen dengan id="omakase-order".
   Data: menus.json dan config.js (API_URL) dari domain yang sama.
   Opsional di tag script: data-width="660" data-scale="1" data-bg="transparent" data-api="https://.../exec" */
(function () {
  "use strict";
  var CONTAINER_ID = "omakase-order";
  var BASE = "", WIDTH = 660, BG = "#f3efe4", SCALE = 1, API_ATTR = "";
  try {
    var cs = document.currentScript || document.querySelector('script[src*="omakase-order.js"]');
    BASE = new URL(cs.src).origin;
    var dw = parseInt(cs.getAttribute("data-width"), 10); if (dw >= 320) WIDTH = dw;
    if (cs.getAttribute("data-bg")) BG = cs.getAttribute("data-bg");
    var ds = parseFloat(cs.getAttribute("data-scale")); if (ds >= 0.5 && ds <= 1.5) SCALE = ds;
    API_ATTR = cs.getAttribute("data-api") || "";
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

  var CSS = `:host{all:initial;display:block;--w:__W__px;--bg:__BG__;color-scheme:light;--ink:#000144;--paper:#f3efe4;--lilac:#d8d9fb;--sky:#cfe6f2;--mute:#6b6c99;--hi:#ffd75e;--red:#c4161c}
*{box-sizing:border-box}
.omk{background:var(--bg);color:var(--ink);font:16px/1.5 Archivo,system-ui,sans-serif;text-align:left;-webkit-text-size-adjust:100%}
.wrap{max-width:var(--w);margin:0 auto;padding:0 16px 56px}
.strip{height:28px;margin:0 -16px 26px;background:repeating-conic-gradient(var(--ink) 0 25%,transparent 0 50%) 0 0/28px 28px}
.strip.end{margin:34px -16px 0}
.jp{font:700 15.2px 'Fuzzy Bubbles',Archivo,cursive;color:var(--mute);margin:0 0 4px}
h1{font:900 clamp(41.6px,13vw,67.2px)/.9 Archivo,sans-serif;letter-spacing:-.045em;text-transform:uppercase;margin:0 0 16px}
.hl{background:linear-gradient(var(--hi),var(--hi)) 0 92%/100% .45em no-repeat}
.intro p{margin:0 0 12px;font-size:15.2px;max-width:60ch}
.intro{margin-bottom:26px}
.card,section{position:relative;border-radius:3px;padding:18px 18px 12px;margin-bottom:26px;box-shadow:6px 6px 0 rgba(0,0,0,.28);background:#fff}
.c1{background:var(--sky)}.c2{background:var(--lilac)}.c3{background:#fff}
.c4{background:var(--ink);color:#fff;box-shadow:6px 6px 0 var(--hi)}
.top{display:flex;justify-content:space-between;align-items:baseline;gap:10px;padding-bottom:10px;margin-bottom:12px;border-bottom:2px solid currentColor;font-size:10.88px;font-weight:700;letter-spacing:.16em;text-transform:uppercase}
.top em{font:700 14.4px 'Fuzzy Bubbles',Archivo,cursive;letter-spacing:0;text-transform:none;color:var(--mute)}.c4 .top em{color:var(--hi)}
h2{font:900 24.8px/1.1 Archivo,sans-serif;letter-spacing:-.02em;margin:0 0 6px}
.hint{color:var(--mute);font-size:13.6px;margin:0 0 10px}.c4 .hint{color:#c9caf0}
label{display:block;font-weight:700;margin:16px 0 6px;font-size:12.8px;letter-spacing:.1em;text-transform:uppercase}
input[type=text],input[type=email],input[type=number],input[type=search],select{width:100%;border:2px solid var(--ink);border-radius:2px;padding:12px;font:inherit;font-weight:500;color:var(--ink);background:#fff;-webkit-appearance:none;appearance:none}
select{background-image:linear-gradient(45deg,transparent 50%,var(--ink) 50%),linear-gradient(135deg,var(--ink) 50%,transparent 50%);background-position:calc(100% - 18px) 55%,calc(100% - 12px) 55%;background-size:6px 6px;background-repeat:no-repeat;padding-right:36px}
input:focus,select:focus{outline:3px solid var(--hi);outline-offset:1px}
.row{display:grid;grid-template-columns:150px 1fr;gap:8px}@media(max-width:440px){.row{grid-template-columns:1fr}}
.opt{display:flex;gap:12px;align-items:center;padding:12px 14px;margin:8px 0;border:2px solid var(--ink);border-radius:2px;background:#fff;cursor:pointer;font-size:15.2px;font-weight:600;letter-spacing:0;text-transform:none;transition:background .15s,color .15s}
.opt:hover{background:var(--hi)}
.opt input{width:20px;height:20px;accent-color:var(--ink);flex:none;margin:0}
.opt:has(input:checked){background:var(--ink);color:#fff}.opt:has(input:checked) input{accent-color:var(--hi)}
.item{display:flex;gap:12px;align-items:flex-start;padding:12px 8px;margin:0;cursor:pointer;font-weight:500;font-size:15.2px;letter-spacing:0;text-transform:none;border-bottom:1px solid rgba(0,1,68,.18);transition:background .15s}
.item input{width:22px;height:22px;accent-color:var(--ink);flex:none;margin:1px 0 0}
.item:hover{background:rgba(255,215,94,.3)}.item:has(input:checked){background:rgba(255,215,94,.6)}
.item .p{margin-left:auto;font-weight:800;white-space:nowrap}.item.off{opacity:.45;cursor:not-allowed}.item.off:hover{background:none}
.gh{font:700 16px 'Fuzzy Bubbles',Archivo,cursive;color:var(--mute);margin:20px 0 4px}.gh:first-child{margin-top:4px}
details{border-bottom:2px solid var(--ink)}
summary{list-style:none;cursor:pointer;padding:14px 0;min-height:50px;display:flex;justify-content:space-between;align-items:center;font-weight:900;font-size:16px;letter-spacing:.06em;text-transform:uppercase}
summary::-webkit-details-marker{display:none}summary::after{content:'+';font-size:24px;font-weight:700;line-height:1;transition:transform .25s}
details[open] summary::after{transform:rotate(45deg)}
.x{margin:0 0 10px 34px;padding:10px 12px;background:var(--lilac);border:2px dashed var(--ink);border-radius:2px;display:flex;gap:10px;align-items:center;font-weight:700;font-size:13.6px}.x input{width:84px;flex:none}.x[hidden]{display:none}
.sum div{display:flex;justify-content:space-between;gap:10px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.2);font-size:14.72px}
.sum .hint{border:0}.sum .tot{border-bottom:0;border-top:2px solid #fff;margin-top:8px;padding-top:12px;font-weight:900;font-size:27.2px;letter-spacing:-.02em;align-items:baseline}
.tot span:first-child{font-size:12px;letter-spacing:.16em;text-transform:uppercase}.tot span:last-child{color:var(--hi)}
.btn{display:flex;justify-content:space-between;align-items:center;width:100%;border:0;border-radius:2px;background:var(--hi);color:var(--ink);padding:15px 16px;font:900 13.6px Archivo,sans-serif;letter-spacing:.14em;text-transform:uppercase;cursor:pointer;min-height:52px;margin-bottom:10px;transition:background .2s,color .2s}
.btn::after{content:'→';font-size:19.2px;transition:transform .25s}.btn:hover:not(:disabled){background:#fff}.btn:hover:not(:disabled)::after{transform:translateX(5px)}
.btn:disabled{background:rgba(255,255,255,.2);color:rgba(255,255,255,.55);cursor:not-allowed}
.err{color:var(--red);font-size:14.4px;font-weight:600;min-height:1.3em;margin:8px 0}.c4 .err{color:var(--hi)}
.hp{position:absolute;left:-9999px;height:0;overflow:hidden}
.sug{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0 0}
.chip{border:2px solid var(--ink);border-radius:2px;background:#fff;color:var(--ink);font:600 13px Archivo,sans-serif;padding:6px 10px;min-height:36px;cursor:pointer;word-break:break-all;text-align:left}.chip:hover{background:var(--hi)}
.sw{margin:0 0 10px}
.info{border:2px dashed var(--ink);border-radius:2px;background:var(--paper);padding:14px 16px;margin:12px 0 8px;font-size:14px}
.info h3{margin:0 0 6px;font:900 12.8px Archivo,sans-serif;letter-spacing:.1em;text-transform:uppercase}
.info p{margin:0 0 10px}.info ul{margin:0 0 12px;padding-left:20px}.info li{margin:0 0 4px}.info h3:not(:first-child){border-top:2px dashed var(--ink);padding-top:12px;margin-top:12px}
.ok{background:var(--ink);color:#fff;border-radius:3px;padding:20px;margin-bottom:26px;box-shadow:6px 6px 0 var(--hi)}
.tagline{font:700 16px 'Fuzzy Bubbles',Archivo,cursive;color:var(--hi);margin:0}
.code{font:900 clamp(41.6px,14vw,60.8px)/1 Archivo,sans-serif;letter-spacing:-.04em;color:var(--hi);margin:6px 0 12px}
.ok p{margin:0 0 8px}.dl{display:flex;flex-direction:column;padding:10px 0;border-top:1px solid rgba(255,255,255,.3);border-bottom:1px solid rgba(255,255,255,.3);margin:12px 0}
.dl span{font-size:11.2px;letter-spacing:.16em;text-transform:uppercase;color:#c9caf0}.dl b{font-size:19.2px}.small{font-size:13.6px;color:#c9caf0}
.total{font-size:12px;letter-spacing:.16em;text-transform:uppercase;margin:0 0 6px;display:flex;justify-content:space-between;align-items:baseline}.total b{font:900 35.2px/1 Archivo;letter-spacing:-.03em;text-transform:none}
.qris{width:100%;max-width:420px;display:block;margin:12px auto;background:#fff;border-radius:3px;border:2px solid var(--ink)}
[hidden]{display:none!important}
@media(prefers-reduced-motion:reduce){*{transition:none!important}}`;
  var FORM_HTML = `<div class="omk"><div class="wrap" id="app">
<div class="strip"></div>
<p class="jp">任せ屋、 tarot reading services</p>
<h1>Omaka<wbr>seya.</h1>
<div class="intro">
<p>Selamat datang di OMAKASEYA! Jika kamu mendapatkan link dari form ini, maka kamu diperkenankan untuk mendapat sesi dengan tim karyawan kecil kami. Silakan isi satu per satu dan lakukan dengan seksama. <span class="hl">Tidak ada yang perlu dilakukan dengan terburu-buru.</span></p>
<p>Ingat, bahwasanya Anda <b>tidak memiliki kuasa untuk memilih reader</b> mana yang akan mengerjakan bacaan Anda. Bisa saja Anda hanya akan dibacakan oleh salah satu, salah dua, atau bahkan ketiganya sekaligus. Inilah yang menjadi unik dari toko OMAKASEYA yang berkonsep omakase.</p>
</div>
<div id="form">
<section class="c3"><div class="top"><span>01 / Layanan</span><em>mau pesan apa?</em></div><h2>Mau memesan menu apa?</h2>
<p class="hint">Pilihan ini hanya untuk menampilkan daftar menu yang sesuai, tidak ikut tercatat di order.</p>
<label class="opt"><input type="radio" name="svc" value="tarot"><span>Tarot saja</span></label>
<label class="opt"><input type="radio" name="svc" value="bazi"><span>Bazi saja</span></label>
<label class="opt"><input type="radio" name="svc" value="both"><span>Tarot dan Bazi</span></label>
<div class="info" id="baziInfo" hidden><h3>Syarat &amp; Ketentuan Bazi</h3>
<p>Untuk reading Bazi, kami memerlukan beberapa data pribadi berikut:</p>
<ul><li>Jenis kelamin biologis</li><li>Tanggal lahir lengkap (tanggal, bulan, dan tahun)</li><li>Jam lahir (menit tidak wajib diketahui, tapi minimal kami perlu tahu kamu lahir siang atau malam)</li></ul>
<h3>Mengapa data ini diperlukan?</h3>
<p>Chart Bazi dihitung berdasarkan tahun, bulan, hari, dan jam lahir. Karena pilar jam berganti setiap dua jam, menit kelahiran tidak wajib diketahui. Namun semakin spesifik jam lahirmu, semakin tepat chart dan interpretasinya, dan minimal kami perlu tahu apakah kamu lahir siang atau malam.</p>
<p>Dalam perhitungan Bazi, jenis kelamin biologis digunakan untuk menentukan arah dan urutan Luck Pillars (siklus keberuntungan 10 tahunan). Data ini hanya digunakan untuk keperluan perhitungan Bazi, bukan untuk menentukan identitas gender. Kami menghormati identitas gender setiap klien.</p>
<p>Kami memahami bahwa sebagian orang mungkin merasa kurang nyaman membagikan data tersebut. Namun, data ini diperlukan agar chart dapat dihitung dengan tepat. Jika data yang dibutuhkan tidak dapat diberikan, kami belum dapat memproses reading Bazi. Data ini tidak diisi di form ini. Terima kasih atas pengertianmu.</p></div></section>
<section class="c1"><div class="top"><span>02 / Persetujuan</span><em>wajib ✦</em></div><h2>Persetujuan</h2>
<label class="opt"><input type="radio" name="agree" value="1"><span>Saya menyetujui sistem toko Omakaseya.</span></label>
<label class="opt"><input type="radio" name="agree" value="0"><span>Saya tidak menyetujui.</span></label>
<p class="err" id="noagree" hidden>Terima kasih sudah berkunjung. Kamu perlu menyetujui sistem toko untuk memesan.</p></section>
<div id="rest" hidden>
<section class="c2"><div class="top"><span>03 / Informasi Klien</span><em>kenalan dulu~</em></div><h2>Informasi Klien</h2>
<label>Apakah ini kunjungan pertamamu?</label>
<label class="opt"><input type="radio" name="visit" value="Belum pernah."><span>Belum pernah.</span></label>
<label class="opt"><input type="radio" name="visit" value="Sudah pernah."><span>Sudah pernah.</span></label>
<label for="name">Nama Klien</label><p class="hint">Nama untuk sampul PDF. Boleh nama samaran atau inisial. Jika lebih dari satu orang, tulis semuanya, contoh: Muzakiel / Finnian (teman).</p>
<input id="name" type="text" maxlength="60" autocomplete="off">
<label for="contact">Kontak Utama</label><p class="hint">Kontak yang kamu pakai untuk menghubungi kami. Hasil bacaan dikirim ke sini.</p>
<div class="row"><select id="platform"><option>Twitter</option><option>Telegram</option><option>WhatsApp</option></select><input id="contact" type="text" maxlength="80" placeholder="Username atau nomor"></div>
<label for="email">Kontak Email</label><p class="hint">Dipakai bila akunmu bermasalah saat sesi (suspend Twitter/X, banned Telegram).</p>
<input id="email" type="email" maxlength="120" autocomplete="email" inputmode="email" autocapitalize="off" spellcheck="false" placeholder="nama@gmail.com" style="margin-bottom:0">
<div class="sug" id="esug" hidden></div><p class="err" id="eerr" role="alert" hidden></p><div style="height:6px"></div>
<div class="hp" aria-hidden="true"><label>Website<input id="website" type="text" tabindex="-1" autocomplete="off"></label></div></section>
<section class="c3"><div class="top"><span>04 / Pilihan Menu</span><em>pilih satu atau lebih</em></div><h2>Pilihan Menu</h2><p class="hint" id="menuHint">Pilih jenis layanan di bagian 01 dulu.</p>
<div class="sw" id="msearchw" hidden><input id="msearch" type="search" placeholder="Cari menu, contoh: ghosting, karier, bazi…" maxlength="40" autocomplete="off" aria-label="Cari menu"></div>
<p class="hint" id="mnone" hidden>Tidak ada menu yang cocok. Coba kata kunci lain.</p><div id="menu"></div></section>
<section class="c4"><div class="top"><span>05 / Ringkasan</span><em>cek lagi ya</em></div><div class="sum" id="sum"></div><p class="hint" style="margin-top:12px">Harga final dihitung ulang oleh sistem saat order dikirim.</p>
<div class="err" id="err" role="alert"></div><button class="btn" id="go" disabled>Kirim order</button></section>
</div></div>
<div id="done" hidden></div>
<div class="strip end"></div></div></div>`;

  async function start(container) {
    injectFonts();
    var API = API_ATTR || await loadApi();
    var host = mountHost(container);
    var root = host.attachShadow({ mode: "open" });
    root.innerHTML = "<style>" + scaleCss(CSS, SCALE).replace(/__W__/g, WIDTH).replace(/__BG__/g, BG) + "</style>" + FORM_HTML;

    /* ---- logika form (dari index.html) ---- */
    const $=s=>root.querySelector(s),$$=s=>[...root.querySelectorAll(s)],esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
    const idr=n=>'Rp '+Number(n).toLocaleString('id-ID');
    let CFG,IDX={},SVC={},sel={},KEY=null,busy=false,agreed=false,CH='';
    const DOMS=['gmail.com','yahoo.com','yahoo.co.id','outlook.com','hotmail.com','icloud.com','aol.com','live.com','proton.me'],
     TYPO={'gmial.com':'gmail.com','gmai.com':'gmail.com','gamil.com':'gmail.com','gmil.com':'gmail.com','gnail.com':'gmail.com','gmail.co':'gmail.com','gmail.con':'gmail.com','gmail.cm':'gmail.com','gmail.om':'gmail.com','yaho.com':'yahoo.com','yahooo.com':'yahoo.com','yahoo.con':'yahoo.com','yahoo.co':'yahoo.com','hotmial.com':'hotmail.com','hotmal.com':'hotmail.com','hotmail.con':'hotmail.com','outlok.com':'outlook.com','outlook.con':'outlook.com','iclod.com':'icloud.com','icloud.con':'icloud.com'},
     isEmail=v=>/^[^\s@]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/.test(v)&&!/\.\./.test(v);
    let eTouched=false;
    function emailUi(){const v=$('#email').value.trim(),i=v.indexOf('@'),one=i>-1&&i===v.lastIndexOf('@'),dom=one?v.slice(i+1).toLowerCase():'';let list=[],msg='';
     if(TYPO[dom]){list=[v.slice(0,i)+'@'+TYPO[dom]];msg='Domainnya kelihatan typo. Maksud kamu '+list[0]+'?'}
     else{if(v&&!/\s/.test(v)&&(i<0||one)){const u=i<0?v:v.slice(0,i);if(u)list=DOMS.filter(x=>x.startsWith(dom)&&x!==dom).slice(0,6).map(x=>u+'@'+x)}
      if(eTouched&&!isEmail(v))msg=!v?'Email wajib diisi.':/\s/.test(v)?'Email tidak boleh mengandung spasi.':i<0?'Email harus memakai @, contoh: nama@gmail.com.':'Format email belum benar, contoh: nama@gmail.com.'}
     const sg=$('#esug');sg.innerHTML=list.map(x=>`<button type="button" class="chip" data-e="${esc(x)}">${esc(x)}</button>`).join('');sg.hidden=!list.length;
     const er=$('#eerr');er.textContent=msg;er.hidden=!msg}
    
    const note=()=>{};
    function build(){const m=$('#menu');CFG.groups.forEach(g=>{const svc=(g.service==='bazi'||g.name==='Bazi')?'bazi':'tarot';const h=document.createElement('div');h.className='gh';h.dataset.svc=svc;h.textContent=g.name==='Coming Soon'?'Segera hadir':g.name;m.appendChild(h);
     g.cats.forEach(c=>{c.items.forEach(i=>{IDX[i.id]=i;SVC[i.id]=svc});const d=document.createElement('details');d.dataset.svc=svc;d.dataset.g=g.name;
     d.innerHTML=`<summary><span>${esc(c.name)}</span><small data-n="${esc(g.name+c.name)}"></small></summary>`+c.items.map(i=>{const off=i.enabled===false;
     return `<label class="item${off?' off':''}"><input type="checkbox" value="${i.id}" ${off?'disabled':''}><span>${esc(i.name)}${off?' <small>(coming soon)</small>':''}</span><span class="p">${off?'':idr(i.price)+(i.kind==='perQuestion'?' / '+(i.unit||'pertanyaan'):'')}</span></label>`+
     (i.kind==='perQuestion'?`<div class="x" data-x="${i.id}" hidden>Jumlah ${esc(i.unit||'pertanyaan')} <input type="number" min="1" max="${CFG.defaults.maxQuestions}" value="1" data-f="q"></div>`:'')+
     (i.kind==='custom'?`<div class="x" data-x="${i.id}" hidden>Tambahan kartu (mulai 5 kartu; +${idr(i.extraCardPrice)}/kartu) <input type="number" min="0" max="${CFG.defaults.maxExtraCards}" value="0" data-f="e"></div>`:'')}).join('');
     m.appendChild(d)})})}
    function show(){const mb=CH==='bazi'||CH==='both',mt=CH==='tarot'||CH==='both';
     $$('#menu [data-svc]').forEach(e=>{e.hidden=!(e.dataset.svc==='bazi'?mb:mt)});$('#baziInfo').hidden=!mb;$('#menuHint').hidden=!!CH;
     Object.keys(sel).forEach(id=>{if(SVC[id]==='bazi'?mb:mt)return;delete sel[id];const c=$('#menu input[value="'+id+'"]'),x=$('[data-x="'+id+'"]');if(c)c.checked=false;if(x)x.hidden=true});filt()}
    function filt(){const k=($('#msearch').value||'').trim().toLowerCase(),mb=CH==='bazi'||CH==='both',mt=CH==='tarot'||CH==='both';let gh=null,cnt=0,any=false;const fin=()=>{if(gh)gh.hidden=!cnt};
     [...$('#menu').children].forEach(e=>{
      if(e.classList.contains('gh')){fin();gh=e;cnt=0;return}
      if(e.tagName!=='DETAILS')return;
      const ok=e.dataset.svc==='bazi'?mb:mt,cat=e.querySelector('summary span').textContent,g=e.dataset.g||'';let n=0;
      e.querySelectorAll('label.item').forEach(l=>{const c=l.querySelector('input'),hit=ok&&(!k||c.checked||(l.textContent+' '+cat+' '+g).toLowerCase().includes(k));l.hidden=!hit;if(hit)n++});
      e.hidden=!ok||!n;
      if(k&&n&&!e.open){e.open=true;e.dataset.so='1'}else if(!k&&e.dataset.so){e.open=false;delete e.dataset.so}
      if(!e.hidden){cnt++;any=true}});
     fin();$('#mnone').hidden=!(CH&&k&&!any);$('#msearchw').hidden=!CH}
    function calc(){let t=0,rows=[];for(const[id,s]of Object.entries(sel)){const m=IDX[id];let a=m.price,l=m.name;
     if(m.kind==='perQuestion'){a*=s.q;l+=` (${s.q} ${m.unit||'pertanyaan'})`}if(m.kind==='custom'){a+=s.e*m.extraCardPrice;if(s.e)l+=` (+${s.e} kartu)`}t+=a;rows.push([l,a])}return{t,rows}}
    function paint(){const{t,rows}=calc();$('#sum').innerHTML=rows.length?rows.map(r=>`<div><span>${esc(r[0])}</span><span>${idr(r[1])}</span></div>`).join('')+`<div class="tot"><span>Total</span><span>${idr(t)}</span></div>`:'<span class="hint">Belum ada menu dipilih.</span>';
     const ok=agreed&&$('input[name=visit]:checked')&&$('#name').value.trim()&&$('#contact').value.trim()&&isEmail($('#email').value.trim())&&CH&&rows.length&&!busy;$('#go').disabled=!ok;note()}
    root.addEventListener('change',e=>{const t=e.target;
     if(t.name==='svc'){CH=t.value;show()}
     if(t.name==='agree'){agreed=t.value==='1';$('#rest').hidden=!agreed;$('#noagree').hidden=agreed}
     if(t.type==='checkbox'&&IDX[t.value]){const x=root.querySelector(`[data-x="${t.value}"]`);if(t.checked)sel[t.value]={q:1,e:0};else delete sel[t.value];if(x)x.hidden=!t.checked}
     paint()});
    root.addEventListener('input',e=>{const t=e.target;if(t.id==='msearch'){filt();return}const x=t.closest&&t.closest('[data-x]');if(x&&sel[x.dataset.x]){const lim=t.dataset.f==='q'?CFG.defaults.maxQuestions:CFG.defaults.maxExtraCards,min=t.dataset.f==='q'?1:0;sel[x.dataset.x][t.dataset.f]=Math.max(min,Math.min(lim,parseInt(t.value,10)||min))}paint()});
    async function submit(){if(busy)return;busy=true;$('#go').disabled=true;$('#go').textContent='Mengirim...';$('#err').textContent='';
     KEY=KEY||(crypto.randomUUID?crypto.randomUUID():String(Date.now())+Math.random().toString(16).slice(2)+'0000000000');
     const body={key:KEY,agreed,visit:$('input[name=visit]:checked').value,name:$('#name').value,platform:$('#platform').value,contact:$('#contact').value,email:$('#email').value,website:$('#website').value,
      items:Object.entries(sel).map(([id,s])=>({id,questions:s.q,extraCards:s.e}))};
     try{if(!API||/GANTI/.test(API))throw new Error('Form order belum tersambung.');
      const r=await fetch(API,{method:'POST',headers:{'content-type':'text/plain;charset=utf-8'},body:JSON.stringify(body)});const j=await r.json().catch(()=>({}));
      if(!j.ok)throw new Error(j.message||'Gagal mengirim. Silakan coba lagi.');done(j,body.platform)}
     catch(e){$('#err').textContent=e.message;busy=false;$('#go').textContent='Kirim order';paint()}} // KEY dipertahankan: coba ulang tidak membuat order ganda
    function done(j,platform){KEY=null;const dl=j.deadline?new Date(j.deadline+'T00:00:00').toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'}):'-';
     $('#form').hidden=true;const d=$('#done');d.hidden=false;
     d.innerHTML=`<div class="ok"><p class="tagline">Order diterima${j.duplicate?' (sudah tercatat sebelumnya)':''}</p><div class="code">${esc(j.code)}</div>
     <p>${(j.items||[]).map(i=>esc(i.label)).join(', ')}</p><p class="dl"><span>Perkiraan deadline</span><b>${esc(dl)}</b></p><p class="small">Simpan kode ini. Pembaca akan menghubungimu lewat <b>${esc(platform)}</b>.</p></div>
     <section class="card c2"><div class="top"><span>Pembayaran</span><em>last step ✦</em></div><p class="total">Total <b>${idr(j.total)}</b></p><p class="hint">Bayar dengan QRIS, lalu <b>kirim bukti pembayaran lewat chat</b> ke pembaca.</p>
     <img class="qris" src="${BASE}/qris.png" alt="Kode QRIS" onerror="this.style.display='none'"></section>`;host.scrollIntoView({behavior:'auto',block:'start'});note()}
    $('#go').addEventListener('click',submit);['name','contact','email'].forEach(i=>$('#'+i).addEventListener('input',paint));
    $('#email').addEventListener('input',emailUi);$('#email').addEventListener('blur',()=>{eTouched=true;emailUi()});
    $('#esug').addEventListener('mousedown',e=>e.preventDefault());
    $('#esug').addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-e]');if(!b)return;$('#email').value=b.dataset.e;eTouched=true;emailUi();paint();$('#email').focus()});
    fetch(BASE+'/menus.json',{cache:'no-cache'}).then(r=>r.json()).then(c=>{CFG=c;build();show();paint()}).catch(()=>{});
  }

  ready(function () { findContainer(start); });
})();
