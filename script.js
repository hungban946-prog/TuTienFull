/* =========== SỬA Ở ĐÂY CHO RIÊNG BẠN =========== */
const CONFIG = {
  tenEm:  "Ngọc",   // tên người yêu, VD "Linh"
  tenAnh: "Anh",      // tên bạn ký cuối thư
  ngayYeu: "",        // ngày yêu nhau, VD "2024-02-14" (để trống thì hiện dòng 20/10)
  nhac: "",           // file nhạc cùng thư mục, VD "nhac.mp3"
  kyNiem: ""          // 1-2 câu KỶ NIỆM RIÊNG chỉ hai bạn hiểu, sẽ chèn vào thư. VD "Anh vẫn nhớ lần em đội mưa mang áo mưa cho anh."
};
const CAU1 = ["Giữa hàng tỷ vì sao…", "anh nhặt được một viên Ngọc."];
const REASONS = [
  "Nụ cười của em.","Sự dịu dàng của em.","Cả những lúc em dỗi.","Cách em quan tâm anh.",
  "Sự mạnh mẽ của em.","Lúc em ngốc nghếch.","Bình yên khi có em.","Chỉ cần là em."
];
const INTRO = [
  "20/10 này, anh tặng em một cái cây.",
  "Mỗi trái tim là một lần anh nhớ em.",
  "Chạm vào hai bạn nhỏ nhé."
];
const LOI_YEU = [
  "Anh thương em.","Em là điều đẹp nhất.","Em là Ngọc của anh.","Anh nhớ em.",
  "Có em là đủ.","Cảm ơn em.","Ở đây với anh nhé.","Mãi bên em."
];
const LETTER = [
  { cls:"to",   text:"Gửi {em}," },
  { text:"Cảm ơn em đã đến, và ở lại." },
  ...(CONFIG.kyNiem ? [{ text: CONFIG.kyNiem }] : []),
  { text:"Chúc em 20/10 thật nhiều nụ cười." },
  { cls:"sign", text:"— {anh}" }
];
const VOUCHERS = [
  ["🤗","1 cái ôm thật lâu","Dùng lúc nào em mệt cũng được, không cần lý do"],
  ["🍜","Anh bao 1 bữa em chọn","Em chọn món, anh không được than"],
  ["😤","Quyền dỗi 10 phút","Sau đó anh dỗ tới khi em cười mới thôi"],
  ["🎬","1 tối chỉ của em","Em chọn phim, anh ngồi xem cùng, không đụng điện thoại"],
  ["💌","Lời xin lỗi miễn phí","Lần sau anh vụng về, em cứ rút phiếu này"],
  ["💎","Được nâng niu như báu vật","Cả ngày hôm đó em chỉ việc làm công chúa"],
  ["♾️","Thương em vô thời hạn","Phiếu này không bao giờ hết hạn"]
];
const MSG4 = "Chúc em 20/10 thật rạng rỡ.";
/* =============================================== */

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const rnd = (a, b) => a + Math.random()*(b - a);
document.querySelectorAll('.nameHer').forEach(e => e.textContent = CONFIG.tenEm);

const cv = $('#c'), ctx = cv.getContext('2d');
let W, H, DPR, isM, T = 0, cur = -1, busy = false, run = 0, bgNight;
const COLORS = ['#e8a0aa','#d97b8a','#f2c4cb','#c9737f','#f6d9dc','#e8a0aa'];

/* ---------- tiện ích vẽ ---------- */
function heartXY(t){ return [16*Math.pow(Math.sin(t),3), -(13*Math.cos(t) - 5*Math.cos(2*t) - 2*Math.cos(3*t) - Math.cos(4*t))]; }
function heartPath(c, s){
  c.beginPath(); c.moveTo(0, s*0.9);
  c.bezierCurveTo(-s*1.3, -s*0.1, -s*0.7, -s*1.1, 0, -s*0.35);
  c.bezierCurveTo(s*0.7, -s*1.1, s*1.3, -s*0.1, 0, s*0.9); c.closePath();
}
function gemPath(c, s){
  c.beginPath(); c.moveTo(-s*.6,-s*.7); c.lineTo(s*.6,-s*.7); c.lineTo(s,-s*.1); c.lineTo(0,s); c.lineTo(-s,-s*.1); c.closePath();
}
const heartS = () => Math.min(W*0.021, H*0.017);
const easeBack = k => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3*Math.pow(k-1,3) + c1*Math.pow(k-1,2); };
function line(x1, y1, x2, y2){ ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }

const glowSprite = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d');
  const gr = g.createRadialGradient(32,32,0,32,32,32);
  gr.addColorStop(0,'rgba(255,240,225,1)'); gr.addColorStop(.25,'rgba(255,214,200,.55)'); gr.addColorStop(1,'rgba(255,214,200,0)');
  g.fillStyle = gr; g.fillRect(0,0,64,64); return c;
})();
function glow(x, y, r, a){ ctx.globalAlpha = a; ctx.drawImage(glowSprite, x-r, y-r, r*2, r*2); ctx.globalAlpha = 1; }

async function typeInto(el, text, speed, my){
  el.textContent = '';
  for (const ch of text){
    if (my !== run) return false;
    el.textContent += ch; await sleep(/[,.]/.test(ch) ? speed*4 : speed);
  }
  return true;
}
function showNext(i, delay = 0){
  const b = scenes[i].el.querySelector('[data-next]'); if (!b) return;
  const my = run; setTimeout(() => { if (my === run) b.classList.add('ready'); }, delay);
}

/* ---------- nền chung, tim bokeh ---------- */
const bokeh = [];
function buildNight(){
  bgNight = document.createElement('canvas'); bgNight.width = W*DPR; bgNight.height = H*DPR;
  const b = bgNight.getContext('2d'); b.scale(DPR, DPR);
  const g = b.createLinearGradient(0,0,0,H); g.addColorStop(0,'#0e0710'); g.addColorStop(.6,'#1d0f1b'); g.addColorStop(1,'#2e1624');
  b.fillStyle = g; b.fillRect(0,0,W,H);
  const r = b.createRadialGradient(W/2, H*.4, 0, W/2, H*.4, Math.max(W,H)*.6);
  r.addColorStop(0,'rgba(201,115,127,.16)'); r.addColorStop(1,'rgba(201,115,127,0)');
  b.fillStyle = r; b.fillRect(0,0,W,H);
}
function initBokeh(){
  bokeh.length = 0;
  for (let i = 0; i < (isM ? 16 : 26); i++) bokeh.push({
    x: rnd(0,W), y: rnd(0,H), s: rnd(5,14), vy: rnd(.15,.5), ph: rnd(0,6.28), a: rnd(.08,.24), c: COLORS[i % COLORS.length], d: i % 4 === 0
  });
}
function drawNight(){ ctx.drawImage(bgNight, 0, 0, W, H); }
function drawBokeh(m = 1){
  for (const b of bokeh){
    b.y -= b.vy; if (b.y < -20){ b.y = H + 20; b.x = rnd(0,W); }
    ctx.save(); ctx.globalAlpha = b.a*m*(.7 + .3*Math.sin(T*.02 + b.ph));
    ctx.translate(b.x + Math.sin(T*.01 + b.ph)*12, b.y); ctx.fillStyle = b.d ? '#f6e3d0' : b.c; (b.d ? gemPath : heartPath)(ctx, b.s); ctx.fill(); ctx.restore();
  }
}

/* ---------- pháo hoa tim + tim bay ---------- */
const sparks = [], rises = [], rain = [];
function burst(x, y, scale = 1, count = 40){
  for (let i = 0; i < count; i++){
    const [hx, hy] = heartXY(i/count*Math.PI*2), f = .17*scale*(.88 + Math.random()*.24);
    sparks.push({ x, y, vx: hx*f, vy: hy*f, life: 0, max: 80 + Math.random()*50, r: 1 + Math.random()*1.6,
      c: Math.random() < .7 ? '232,160,170' : (Math.random() < .5 ? '217,185,131' : '246,236,230') });
  }
}
function burstRise(x, y){
  for (let i = 0; i < 9; i++) rises.push({ x, y, vx: (Math.random()-.5)*1.6, vy: -(1 + Math.random()*1.6),
    s: 5 + Math.random()*7, life: 0, max: 90 + Math.random()*50, c: COLORS[Math.floor(Math.random()*COLORS.length)] });
}
function drawFx(){
  ctx.globalCompositeOperation = 'lighter';
  for (let i = sparks.length-1; i >= 0; i--){
    const s = sparks[i]; s.life++; s.vx *= .97; s.vy = s.vy*.97 + .012; s.x += s.vx; s.y += s.vy;
    const a = 1 - s.life/s.max; if (a <= 0){ sparks.splice(i,1); continue; }
    ctx.fillStyle = `rgba(${s.c},${a})`; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.283); ctx.fill();
    if (s.r > 1.8) glow(s.x, s.y, 9, a*.5);
  }
  ctx.globalCompositeOperation = 'source-over';
  for (let i = rises.length-1; i >= 0; i--){
    const r = rises[i]; r.life++; r.x += r.vx; r.y += r.vy; r.vy *= .985;
    const a = 1 - r.life/r.max; if (a <= 0){ rises.splice(i,1); continue; }
    ctx.save(); ctx.globalAlpha = a; ctx.translate(r.x, r.y); ctx.fillStyle = r.c; heartPath(ctx, r.s); ctx.fill(); ctx.restore();
  }
  for (let i = rain.length-1; i >= 0; i--){
    const r = rain[i]; r.y += r.vy; r.x += r.vx + Math.sin(r.y*.03 + r.ph)*.5; r.rot += r.vr;
    if (r.y > H + 24){ rain.splice(i,1); continue; }
    ctx.save(); ctx.globalAlpha = .85; ctx.translate(r.x, r.y); ctx.rotate(r.rot); ctx.fillStyle = r.c; heartPath(ctx, r.s); ctx.fill(); ctx.restore();
  }
}

/* =========================================================
   CẢNH 0: mở đầu
   ========================================================= */
const sc0 = {
  el: $('#s0'),
  enter(){ showNext(0, 900); },
  draw(){
    drawNight(); drawBokeh(1);
    ctx.globalCompositeOperation = 'lighter';
    glow(W/2, H*.4, 170 + Math.sin(T*.04)*16, .32);
    ctx.globalCompositeOperation = 'source-over';
  }
};

/* =========================================================
   CẢNH 1: bay xuyên sao, chòm sao trái tim
   ========================================================= */
const N1 = 28;
const s1 = { stars: [], speed: .06, phase: 0, p: 0, pts: [], inner: [], shoot: [], doneAt: 0 };
function layoutS1(){
  const S = heartS()*1.08, cx = W/2, cy = H*.36;
  s1.pts = []; s1.inner = [];
  for (let i = 0; i < N1; i++){ const [hx, hy] = heartXY(i/N1*6.2832); s1.pts.push({ x: cx + hx*S, y: cy + hy*S }); }
  for (let i = 0; i < 110; i++){
    const [hx, hy] = heartXY(Math.random()*6.2832), k = Math.pow(Math.random(), .6)*.94;
    s1.inner.push({ x: cx + hx*S*k, y: cy + hy*S*k, ph: rnd(0,6.28), r: rnd(.5,1.4) });
  }
}
const sc1 = {
  el: $('#s1'),
  enter(my){
    s1.stars = []; for (let i = 0; i < (isM ? 200 : 300); i++) s1.stars.push({ x: rnd(-1,1), y: rnd(-1,1), z: rnd(.03,1) });
    s1.speed = .06; s1.phase = 0; s1.p = 0; s1.doneAt = 0; s1.shoot = []; layoutS1();
    $('#cap1a').textContent = ''; $('#cap1b').textContent = '';
    (async () => {
      await sleep(2700); if (my !== run) return;
      s1.phase = 1;
      while (s1.p < N1){ await sleep(60); if (my !== run) return; }
      s1.doneAt = performance.now(); await sleep(900);
      if (!await typeInto($('#cap1a'), CAU1[0], 52, my)) return; await sleep(600);
      if (!await typeInto($('#cap1b'), CAU1[1], 40, my)) return;
      showNext(1, 400);
    })();
  },
  draw(){
    drawNight();
    const cx = W/2, cy = H/2, f = Math.max(W,H)*.45;
    if (s1.phase === 1) s1.speed += (.0011 - s1.speed)*.02;
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    for (const s of s1.stars){
      const pz = s.z; s.z -= s1.speed;
      if (s.z <= .02){ s.x = rnd(-1,1); s.y = rnd(-1,1); s.z = 1; continue; }
      const sx = cx + s.x/s.z*f*.5, sy = cy + s.y/s.z*f*.5, a = Math.min(1, (1 - s.z)*.9 + .12), sz = (1 - s.z)*2.1 + .4;
      if (s1.speed > .012){
        const px = cx + s.x/pz*f*.5, py = cy + s.y/pz*f*.5;
        ctx.strokeStyle = `rgba(255,236,230,${a})`; ctx.lineWidth = sz; line(px, py, sx, sy);
      } else { ctx.fillStyle = `rgba(255,236,230,${a})`; ctx.beginPath(); ctx.arc(sx, sy, sz*.7, 0, 6.283); ctx.fill(); }
    }
    // sao băng
    if (s1.phase === 1 && Math.random() < .012) s1.shoot.push({ x: rnd(W*.35, W), y: rnd(0, H*.3), life: 0 });
    for (let i = s1.shoot.length-1; i >= 0; i--){
      const m = s1.shoot[i]; m.life++; m.x -= 10; m.y += 5.4;
      const a = 1 - m.life/55; if (a <= 0){ s1.shoot.splice(i,1); continue; }
      const g = ctx.createLinearGradient(m.x, m.y, m.x + 120, m.y - 65);
      g.addColorStop(0, `rgba(255,236,230,${a})`); g.addColorStop(1, 'rgba(255,236,230,0)');
      ctx.strokeStyle = g; ctx.lineWidth = 2; line(m.x, m.y, m.x + 120, m.y - 65); glow(m.x, m.y, 12, a*.8);
    }
    // chòm sao
    if (s1.phase === 1){
      s1.p = Math.min(N1, s1.p + .11);
      const k = Math.floor(s1.p), pts = s1.pts;
      ctx.strokeStyle = 'rgba(232,160,170,.85)'; ctx.lineWidth = 1.5; ctx.shadowColor = 'rgba(232,160,170,.9)'; ctx.shadowBlur = 12;
      for (let i = 0; i < k && i < N1; i++){ const a = pts[i], b = pts[(i+1) % N1]; line(a.x, a.y, b.x, b.y); }
      if (k < N1){ const a = pts[k], b = pts[(k+1) % N1], f2 = s1.p - k; line(a.x, a.y, a.x + (b.x-a.x)*f2, a.y + (b.y-a.y)*f2); }
      ctx.shadowBlur = 0;
      for (let i = 0; i <= Math.min(k, N1-1); i++){
        const pt = pts[i], tw = .75 + .25*Math.sin(T*.07 + i);
        glow(pt.x, pt.y, 16*tw + 4, .85); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(pt.x, pt.y, 2.2, 0, 6.283); ctx.fill();
      }
      if (s1.doneAt){
        const e = Math.min(1, (performance.now() - s1.doneAt)/1600);
        for (const st of s1.inner){ glow(st.x, st.y, 6 + st.r*3, e*(.25 + .35*Math.sin(T*.05 + st.ph))); }
        // vòng tim lan toả
        const S = heartS()*1.08;
        for (let r = 0; r < 2; r++){
          const kk = ((T + r*90) % 180)/180, sc = 1 + kk*.55;
          ctx.save(); ctx.translate(W/2, H*.36); ctx.scale(sc, sc);
          ctx.strokeStyle = `rgba(232,160,170,${(1-kk)*.35})`; ctx.lineWidth = 1.2/sc; ctx.beginPath();
          for (let i = 0; i <= 80; i++){ const [hx, hy] = heartXY(i/80*6.2832); i ? ctx.lineTo(hx*S, hy*S) : ctx.moveTo(hx*S, hy*S); }
          ctx.stroke(); ctx.restore();
        }
      }
    }
    ctx.globalCompositeOperation = 'source-over';
  }
};

/* =========================================================
   CẢNH 2: vòng thẻ 3D
   ========================================================= */
const ringEl = $('#ring'), stage = $('#stage');
const cards = REASONS.map((t, i) => {
  const d = document.createElement('div'); d.className = 'card3';
  d.innerHTML = `<div class="n">${String(i+1).padStart(2,'0')}</div><div class="h">♥</div><p>${t}</p>`;
  ringEl.appendChild(d); return d;
});
let ang = 0, vel = .3, dragging = false, lastX = 0, R2 = 300;
function sizeRing(){
  const cw = isM ? 186 : 230, ch = isM ? 240 : 290; R2 = cw*1.3;
  ringEl.style.setProperty('--cw', cw + 'px'); ringEl.style.setProperty('--ch', ch + 'px');
  const step = 360/cards.length; cards.forEach((c, i) => { c.style.transform = `rotateY(${i*step}deg) translateZ(${R2}px)`; });
}
stage.addEventListener('pointerdown', e => { dragging = true; lastX = e.clientX; stage.setPointerCapture(e.pointerId); });
stage.addEventListener('pointermove', e => { if (!dragging) return; const dx = e.clientX - lastX; lastX = e.clientX; ang += dx*.4; vel = dx*.4; });
const endDrag = () => { dragging = false; };
stage.addEventListener('pointerup', endDrag); stage.addEventListener('pointercancel', endDrag);

const sc2 = {
  el: $('#s2'),
  enter(){ ang = 0; vel = 2.2; showNext(2, 3800); },
  draw(){
    drawNight(); drawBokeh(1);
    if (!dragging){ vel += (.22 - vel)*.03; ang += vel; }
    ringEl.style.transform = `rotateX(-6deg) rotateY(${ang}deg)`;
    const step = 360/cards.length;
    cards.forEach((c, i) => {
      const face = Math.cos((i*step + ang)*Math.PI/180);
      c.style.opacity = (.16 + .84*Math.pow((face + 1)/2, 1.5)).toFixed(3);
    });
    // sàn phát sáng + đốm sáng quay
    const r = stage.getBoundingClientRect(), cx = W/2, cy = r.top + r.height*.46 + (isM ? 150 : 185), rx = R2*1.05, ry = rx*.2;
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = 'rgba(232,160,170,.28)'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, 6.283); ctx.stroke();
    ctx.strokeStyle = 'rgba(232,160,170,.1)'; ctx.beginPath(); ctx.ellipse(cx, cy, rx*1.18, ry*1.18, 0, 0, 6.283); ctx.stroke();
    for (let i = 0; i < 16; i++){
      const a = T*.012 + i/16*6.2832, x = cx + Math.cos(a)*rx, y = cy + Math.sin(a)*ry;
      glow(x, y, 9, .5 + .4*Math.sin(T*.06 + i));
    }
    glow(cx, cy, rx*.9, .1);
    ctx.globalCompositeOperation = 'source-over';
  }
};

/* =========================================================
   CẢNH 3: cây tình yêu, đom đóm, hai bạn nhỏ
   ========================================================= */
let groundY, treeX, bx, gx, pH, bg3, stars3 = [], branches = [], blossoms = [], treeEnd = 0;
let t3 = 0, started3 = false, lastSpawn = 0;
const falls = [], flies = [];
let seed = 20102026;
const srnd = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const gy = x => groundY - Math.sin(Math.PI*x/W)*H*.012;

function layout3(){
  groundY = H*(isM ? .79 : .76); treeX = W*(isM ? .6 : .66);
  pH = Math.min(H*(isM ? .14 : .17), 150);
  bx = treeX - W*(isM ? .44 : .24); gx = bx + pH*.34;
}
function buildBg3(){
  bg3 = document.createElement('canvas'); bg3.width = W*DPR; bg3.height = H*DPR;
  const b = bg3.getContext('2d'); b.scale(DPR, DPR);
  const sky = b.createLinearGradient(0,0,0,groundY);
  sky.addColorStop(0,'#150a17'); sky.addColorStop(.45,'#2c1727'); sky.addColorStop(.8,'#5e3042'); sky.addColorStop(1,'#8c5262');
  b.fillStyle = sky; b.fillRect(0,0,W,H);
  const mx = W*(isM ? .16 : .12), my = H*(isM ? .36 : .46), mr = Math.min(W,H)*.042;
  const g = b.createRadialGradient(mx,my,mr*.5,mx,my,mr*5);
  g.addColorStop(0,'rgba(246,236,230,.28)'); g.addColorStop(1,'rgba(246,236,230,0)');
  b.fillStyle = g; b.fillRect(mx-mr*5, my-mr*5, mr*10, mr*10);
  b.fillStyle = '#f6ece6'; b.beginPath(); b.arc(mx,my,mr,0,6.283); b.fill();
  b.fillStyle = 'rgba(200,170,175,.25)'; b.beginPath(); b.arc(mx-mr*.3,my-mr*.2,mr*.22,0,6.283); b.fill();
  b.beginPath(); b.arc(mx+mr*.35,my+mr*.3,mr*.15,0,6.283); b.fill();
  b.fillStyle = '#2b1521'; b.beginPath(); b.moveTo(0,H);
  for (let x = 0; x <= W; x += 8) b.lineTo(x, groundY - H*.05 - Math.sin(x/W*Math.PI*1.6 + .6)*H*.035);
  b.lineTo(W,H); b.closePath(); b.fill();
  const gg = b.createLinearGradient(0, groundY-20, 0, H); gg.addColorStop(0,'#22101a'); gg.addColorStop(1,'#0d0609');
  b.fillStyle = gg; b.beginPath(); b.moveTo(0,H);
  for (let x = 0; x <= W; x += 8) b.lineTo(x, gy(x));
  b.lineTo(W,H); b.closePath(); b.fill();
  stars3 = []; const n = Math.min(90, Math.floor(W*H/9000));
  for (let i = 0; i < n; i++) stars3.push({ x: Math.random()*W, y: Math.random()*groundY*.65, r: .4 + Math.random()*1.1, ph: Math.random()*6.28 });
  flies.length = 0;
  for (let i = 0; i < (isM ? 22 : 34); i++) flies.push({ x: rnd(0,W), y: rnd(H*.45, H*.9), ph: rnd(0,6.28), sp: rnd(.6,1.4) });
}
const SPEED = .12;
function genTree(){
  seed = 20102026; branches = []; blossoms = []; treeEnd = 0;
  const s = H/800, maxD = isM ? 5 : 6, trunk = H*(isM ? .125 : .15);
  grow(treeX, gy(treeX) + 4, -Math.PI/2 + (srnd()-.5)*.08, trunk, .024*H*(isM ? .9 : 1), 0, 0);
  function grow(x, y, a, len, w, d, ts){
    const n = 8, pts = [[x, y]]; let cx = x, cy = y, ca = a;
    for (let i = 0; i < n; i++){ ca += (srnd()-.5)*.22; cx += Math.cos(ca)*len/n; cy += Math.sin(ca)*len/n; pts.push([cx, cy]); }
    const dur = len/SPEED; branches.push({ pts, w0: w, w1: w*.72, t0: ts, dur });
    const end = ts + dur; treeEnd = Math.max(treeEnd, end);
    if (d >= 2) for (let k = 0; k < 2; k++){ const p = pts[3 + Math.floor(srnd()*(pts.length-3))]; addB(p[0], p[1], 10*s, end); }
    if (d >= maxD){ const cnt = isM ? 8 : 5; for (let k = 0; k < cnt; k++) addB(cx, cy, 26*s, end); return; }
    for (const side of (d <= 1 ? [-1,0,1] : [-1,1])){
      let na = side === 0 ? ca + (srnd()-.5)*.2 : ca + side*(.38 + srnd()*.32);
      na += (-Math.PI/2 - na)*.12;
      grow(cx, cy, na, len*(side === 0 ? .86 : (isM ? .62 : .72) + srnd()*.08), w*.66, d+1, end);
    }
  }
  function addB(x, y, Rr, tb){
    const a = srnd()*6.283, r = Rr*Math.sqrt(srnd());
    blossoms.push({ x: x + Math.cos(a)*r, y: y + Math.sin(a)*r, s: (8 + srnd()*5)*s*(isM ? .9 : 1),
      c: COLORS[Math.floor(srnd()*COLORS.length)], t: tb + 200 + srnd()*900, ph: srnd()*6.28 });
  }
  treeEnd += 1100;
}
function drawTree(now){
  ctx.lineCap = 'round'; ctx.strokeStyle = '#26121a';
  for (const br of branches){
    if (now < br.t0) continue;
    const p = Math.min(1, (now - br.t0)/br.dur), n = br.pts.length - 1, upto = p*n;
    for (let i = 0; i < n && i < upto; i++){
      const f = Math.min(1, upto - i), a = br.pts[i], b = br.pts[i+1];
      ctx.lineWidth = br.w0 + (br.w1 - br.w0)*(i/n);
      line(a[0], a[1], a[0] + (b[0]-a[0])*f, a[1] + (b[1]-a[1])*f);
    }
  }
}
function drawBlossoms(now){
  ctx.globalAlpha = .95;
  for (const b of blossoms){
    const age = now - b.t; if (age < 0) continue;
    const sc = easeBack(Math.min(1, age/700));
    ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(Math.sin(T*.02 + b.ph)*.12); ctx.scale(sc, sc);
    ctx.fillStyle = b.c; heartPath(ctx, b.s); ctx.fill(); ctx.restore();
  }
  ctx.globalAlpha = 1;
}
function drawCouple(){
  const col = '#10080c'; ctx.fillStyle = col; ctx.strokeStyle = col; ctx.lineCap = 'round';
  const h = pH, by = gy(bx), top = by - h, g = h*.9, gby = gy(gx), gtop = gby - g;
  const hx = (bx + gx)/2, hy = top + .5*h;
  ctx.beginPath(); ctx.arc(bx, top + .075*h, .075*h, 0, 6.283); ctx.fill();
  ctx.lineWidth = .2*h; line(bx, top + .24*h, bx, top + .5*h);
  ctx.lineWidth = .075*h; line(bx - .045*h, top + .5*h, bx - .045*h, by - .02*h); line(bx + .045*h, top + .5*h, bx + .045*h, by - .02*h);
  ctx.lineWidth = .05*h; line(bx - .095*h, top + .24*h, bx - .105*h, top + .5*h); line(bx + .095*h, top + .24*h, hx, hy);
  ctx.beginPath(); ctx.arc(gx, gtop + .075*g, .07*g, 0, 6.283); ctx.fill();
  ctx.beginPath(); ctx.ellipse(gx + .1*g, gtop + .11*g, .025*g, .07*g, .6 + Math.sin(T*.03)*.18, 0, 6.283); ctx.fill();
  ctx.beginPath(); ctx.moveTo(gx - .05*g, gtop + .17*g); ctx.lineTo(gx + .05*g, gtop + .17*g); ctx.lineTo(gx + .17*g, gtop + .62*g);
  ctx.quadraticCurveTo(gx, gtop + .67*g, gx - .17*g, gtop + .62*g); ctx.closePath(); ctx.fill();
  ctx.lineWidth = .035*g; line(gx - .05*g, gtop + .62*g, gx - .05*g, gby - .02*g); line(gx + .05*g, gtop + .62*g, gx + .05*g, gby - .02*g);
  ctx.lineWidth = .04*g; line(gx + .06*g, gtop + .2*g, gx + .1*g, gtop + .48*g); line(gx - .055*g, gtop + .2*g, hx, hy);
  const bob = Math.sin(T*.04)*h*.03, hs = h*.1*(1 + Math.sin(T*.08)*.1);
  ctx.save(); ctx.translate(hx, top - .22*h + bob); ctx.shadowColor = 'rgba(232,160,170,.9)'; ctx.shadowBlur = 16;
  ctx.fillStyle = '#e8a0aa'; heartPath(ctx, hs); ctx.fill(); ctx.restore();
}
function spawnFall(now){
  const vis = blossoms.filter(b => now - b.t > 700); if (!vis.length || falls.length > 110) return;
  const b = vis[Math.floor(Math.random()*vis.length)];
  falls.push({ x: b.x, y: b.y, vy: .35 + Math.random()*.5, vx: -.25 + Math.random()*.2, rot: Math.random()*6, vr: (Math.random()-.5)*.05,
    s: b.s*(.6 + Math.random()*.4), c: b.c, land: 0, ph: Math.random()*6 });
}
const sc3 = {
  el: $('#s3'),
  enter(my){
    started3 = true; t3 = performance.now(); lastSpawn = 0; falls.length = 0;
    const el = $('#typed3'); el.classList.remove('final'); el.textContent = '';
    $('#hint3').style.opacity = 1;
    (async () => {
      await sleep(1200);
      for (const l of INTRO){ if (!await typeInto(el, l, 42, my)) return; await sleep(2200); if (my !== run) return; }
      el.classList.add('final'); el.innerHTML = 'Anh yêu em <span class="hb">♥</span>';
    })();
    showNext(3, treeEnd + 1500);
  },
  exit(){ started3 = false; },
  draw(){
    ctx.drawImage(bg3, 0, 0, W, H);
    for (const s of stars3){
      ctx.fillStyle = `rgba(246,236,230,${.25 + .5*Math.abs(Math.sin(T*.02 + s.ph))})`;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.283); ctx.fill();
    }
    const now = performance.now() - t3;
    drawCouple(); drawTree(now); drawBlossoms(now);
    if (now > treeEnd*.6 && now - lastSpawn > 280){ lastSpawn = now; spawnFall(now); }
    for (let i = falls.length-1; i >= 0; i--){
      const f = falls[i];
      if (!f.land){ f.y += f.vy; f.x += f.vx + Math.sin(f.y*.03 + f.ph)*.4; f.rot += f.vr; if (f.y >= gy(f.x) - 2) f.land = 1; } else f.land++;
      const a = f.land ? Math.max(0, 1 - f.land/260) : 1; if (a <= 0){ falls.splice(i,1); continue; }
      ctx.save(); ctx.globalAlpha = a*.9; ctx.translate(f.x, f.y); ctx.rotate(f.rot); ctx.fillStyle = f.c; heartPath(ctx, f.s); ctx.fill(); ctx.restore();
    }
    // đom đóm
    ctx.globalCompositeOperation = 'lighter';
    for (const f of flies){
      f.x += Math.sin(T*.01*f.sp + f.ph)*.5; f.y += Math.cos(T*.013*f.sp + f.ph)*.35;
      if (f.x < -10) f.x = W + 10; if (f.x > W + 10) f.x = -10;
      glow(f.x, f.y, 10, .25 + .6*Math.max(0, Math.sin(T*.04*f.sp + f.ph)));
    }
    ctx.globalCompositeOperation = 'source-over';
    drawFx();
  }
};
// tương tác với hai bạn nhỏ
let deck = [], bubbleTimer;
const shuffle = a => { for (let i = a.length-1; i > 0; i--){ const j = Math.floor(Math.random()*(i+1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
function say(){
  if (!deck.length) deck = shuffle([...LOI_YEU]);
  const b = $('#bubble'); b.textContent = deck.pop(); b.classList.add('show');
  const cx = (bx + gx)/2, top = gy(bx) - pH, half = b.offsetWidth/2;
  b.style.left = Math.min(Math.max(cx, half + 12), W - half - 12) + 'px';
  b.style.top = (top - .34*pH - b.offsetHeight - 8) + 'px';
  clearTimeout(bubbleTimer); bubbleTimer = setTimeout(() => b.classList.remove('show'), 5200);
  $('#hint3').style.opacity = 0;
}
addEventListener('click', e => {
  if (e.target.closest('button, #modal, #stage, #gift')) return;
  if (cur === 3){
    const by = gy(bx), top = by - pH;
    if (e.clientX > bx - .25*pH && e.clientX < gx + .25*pH && e.clientY > top - .4*pH && e.clientY < by + 6){ say(); burstRise((bx+gx)/2, top); }
    else burstRise(e.clientX, e.clientY);
  } else if (cur >= 0) burstRise(e.clientX, e.clientY);
});

/* bộ đếm */
function tick(){
  const el = $('#counter');
  if (!CONFIG.ngayYeu){ el.innerHTML = '20 · 10 · 2026 &nbsp;·&nbsp; mãi yêu em'; return; }
  const s = Math.max(0, Math.floor((Date.now() - new Date(CONFIG.ngayYeu).getTime())/1000));
  el.innerHTML = `Mình yêu nhau được <b>${Math.floor(s/86400).toLocaleString('vi-VN')}</b> ngày <b>${Math.floor(s%86400/3600)}</b> giờ <b>${Math.floor(s%3600/60)}</b> phút <b>${s%60}</b> giây`;
}
tick(); setInterval(tick, 1000);

/* thư */
let lrun = 0;
async function typeLetter(){
  const my = ++lrun, box = $('#letter'); box.innerHTML = '';
  for (const ln of LETTER){
    if (my !== lrun) return;
    const text = ln.text.replace('{em}', CONFIG.tenEm).replace('{anh}', CONFIG.tenAnh);
    const p = document.createElement('p'); if (ln.cls) p.className = ln.cls; box.appendChild(p); p.classList.add('typing');
    for (const ch of text){ if (my !== lrun) return; p.textContent += ch; await sleep(/[,.]/.test(ch) ? 150 : 30); }
    p.classList.remove('typing'); await sleep(380);
  }
}
$('#letterBtn').addEventListener('click', () => { $('#modal').classList.add('open'); typeLetter(); });
$('#vBtn').addEventListener('click', () => {
  lrun++; const box = $('#letter');
  box.innerHTML = '<p class="to">Phiếu tình yêu</p><p>Chạm để dùng nhé ♥</p>' + VOUCHERS.map((v,i) => `<div class="vc" data-i="${i}"><span class="e">${v[0]}</span><span><b>${v[1]}</b><small>${v[2]}</small></span></div>`).join('');
  $$('.vc').forEach(el => el.addEventListener('click', () => {
    navigator.vibrate && navigator.vibrate(40);
    if (+el.dataset.i === VOUCHERS.length - 1){ el.querySelector('small').textContent = 'Dùng hoài không hết đâu. Anh đảm bảo ♥'; return; }
    el.classList.add('used');
  }));
  $('#modal').classList.add('open');
});
$('#closeBtn').addEventListener('click', () => { lrun++; $('#modal').classList.remove('open'); });

/* =========================================================
   CẢNH 4: hộp quà và đêm pháo hoa
   ========================================================= */
let opened = false, fireTimer = null;
function giftCenter(){ const r = $('#gift').getBoundingClientRect(); return [r.left + r.width/2, r.top + r.height*.4]; }
async function openGift(){
  if (opened) return; opened = true; const my = run;
  $('#gw').classList.add('open'); $('#tip4').style.opacity = 0; $('#t4').textContent = 'Gửi em, người anh thương';
  const [x, y] = giftCenter(); burst(x, y, 1.6, 56); burstRise(x, y); setTimeout(() => burst(x, y, 2.4, 60), 350);
  await sleep(1100); if (my !== run) return;
  $('#msg4').classList.add('show');
  await typeInto($('#msg4'), MSG4, 34, my); if (my !== run) return;
  await sleep(500);
  const love = $('#love4'); love.innerHTML = '';
  [...'Anh yêu em'].forEach((ch, i) => { const s = document.createElement('span'); s.textContent = ch === ' ' ? '\u00A0' : ch; s.style.animationDelay = (i*.12) + 's'; love.appendChild(s); });
  const fire = () => burst(W*rnd(.15,.85), H*rnd(.12,.45), rnd(1.6,2.6), 46);
  fire(); fireTimer = setInterval(fire, 950);
  navigator.vibrate && navigator.vibrate([70,90,70,400,70,90,70]);
  $('#vBtn').style.display = ''; const rb = $('#replay'); rb.style.display = ''; rb.classList.add('ready');
}
$('#gift').addEventListener('click', openGift);
const sc4 = {
  el: $('#s4'),
  enter(){
    opened = false; clearInterval(fireTimer);
    $('#gw').classList.remove('open'); $('#msg4').classList.remove('show'); $('#msg4').textContent = '';
    $('#love4').innerHTML = ''; $('#tip4').style.opacity = 1; $('#t4').textContent = 'Chạm vào hộp quà';
    $('#replay').style.display = 'none'; $('#vBtn').style.display = 'none';
  },
  exit(){ clearInterval(fireTimer); },
  draw(){
    drawNight(); drawBokeh(1);
    ctx.globalCompositeOperation = 'lighter';
    if (T % 30 === 0) sc4._gc = giftCenter();
    const gc = sc4._gc || [W/2, H*.4];
    glow(gc[0], gc[1], (opened ? 260 : 150) + Math.sin(T*.05)*14, opened ? .3 : .22);
    ctx.globalCompositeOperation = 'source-over';
    if (opened && T % 7 === 0 && rain.length < 60) rain.push({ x: rnd(0,W), y: -20, vy: rnd(.8,1.8), vx: rnd(-.3,.3), rot: rnd(0,6), vr: rnd(-.03,.03),
      s: rnd(5,11), c: COLORS[Math.floor(Math.random()*COLORS.length)], ph: rnd(0,6) });
    drawFx();
  }
};
$('#replay').addEventListener('click', () => go(0));

/* =========================================================
   Điều phối cảnh + vòng lặp
   ========================================================= */
const scenes = [sc0, sc1, sc2, sc3, sc4];
$('#dots').innerHTML = scenes.map(() => '<i></i>').join('');
const dots = $$('#dots i');

async function go(i){
  if (busy) return; busy = true;
  { const w = $('#wp'); w.classList.remove('on'); void w.offsetWidth; w.classList.add('on'); }
  const veil = $('#veil');
  if (cur >= 0){ veil.classList.add('on'); await sleep(560); }
  run++; clearInterval(fireTimer);
  if (cur >= 0){ if (scenes[cur].exit) scenes[cur].exit(); scenes[cur].el.classList.remove('active'); }
  $$('.btn[data-next]').forEach(b => b.classList.remove('ready'));
  sparks.length = rises.length = rain.length = 0;
  cur = i; scenes[i].el.classList.add('active');
  dots.forEach((d, k) => d.classList.toggle('on', k === i));
  scenes[i].enter(run);
  veil.classList.remove('on'); busy = false;
}
$$('[data-next]').forEach(b => b.addEventListener('click', () => { startMusic(); go(Math.min(cur + 1, scenes.length - 1)); }));

(function loop(){
  if (!bgNight){ requestAnimationFrame(loop); return; }   // chờ resize() dựng xong canvas
  T++;
  ctx.clearRect(0, 0, W, H);
  try { if (cur >= 0) scenes[cur].draw(); else drawNight(); } catch (err) { console.error(err); }
  try { fx2(); } catch (e) {}
  requestAnimationFrame(loop);
})();

function resize(){
  DPR = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; isM = W < 640;
  cv.width = W*DPR; cv.height = H*DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  buildNight(); initBokeh(); layout3(); buildBg3(); genTree(); sizeRing(); layoutS1();
  falls.length = 0;
}
resize(); addEventListener('resize', resize);

/* nhạc */
let audio = null;
if (CONFIG.nhac){
  audio = new Audio(CONFIG.nhac); audio.loop = true; audio.volume = .6;
  $('#music').style.display = 'block';
  $('#music').addEventListener('click', () => { audio.paused ? audio.play() : audio.pause(); $('#music').style.opacity = audio.paused ? .4 : 1; });
}
function startMusic(){ if (audio && !audio._s){ audio._s = true; audio.play().catch(() => {}); } }

var rh2=[],sh2=[],rg2=[],tr2=[];
addEventListener('pointerdown',e=>rg2.push({x:e.clientX,y:e.clientY,l:0}));
addEventListener('pointermove',e=>{if(T%2===0)tr2.push({x:e.clientX,y:e.clientY,vx:rnd(-.6,.6),vy:rnd(-.9,-.1),l:0})});
function fx2(){
  ctx.globalCompositeOperation='lighter';
  glow(W*(.5+.3*Math.sin(T*.008)),H*(.4+.2*Math.cos(T*.011)),260,.13);
  glow(W*(.5+.3*Math.cos(T*.01)),H*(.55+.2*Math.sin(T*.007)),220,.1);
  for(let i=1;i<=34;i++){const a=Math.max(0,Math.sin(T*.04+i*1.7));if(a<.05)continue;const px=(i*.618034%1)*W,py=(i*.754878%1)*H,z=2+a*8;
    ctx.strokeStyle='rgba(255,236,225,'+a*.85+')';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(px-z,py);ctx.lineTo(px+z,py);ctx.moveTo(px,py-z);ctx.lineTo(px,py+z);ctx.stroke()}
  if(T%140===0&&cur>=0)burst(rnd(W*.15,W*.85),rnd(H*.1,H*.4),rnd(.9,1.5),36);
  if(T%180===0)rg2.push({x:W/2,y:H*.4,l:0});
  ctx.globalCompositeOperation='source-over';
  if(T%(W<640?11:7)===0)rh2.push({x:rnd(0,W),y:H+20,s:rnd(6,14),v:rnd(.5,1.4),ph:rnd(0,6.3),g:Math.random()<.25,c:COLORS[(Math.random()*COLORS.length)|0]});
  for(let i=rh2.length-1;i>=0;i--){const r=rh2[i],s=r.s;r.y-=r.v;r.x+=Math.sin(T*.02+r.ph)*.6;if(r.y<-30){rh2.splice(i,1);continue}
    ctx.save();ctx.globalAlpha=Math.min(.5,r.y/H*.9);ctx.translate(r.x,r.y);ctx.rotate(Math.sin(T*.03+r.ph)*.3);ctx.fillStyle=r.g?'#f6e3d0':r.c;
    if(r.g){ctx.beginPath();ctx.moveTo(-s*.6,-s*.7);ctx.lineTo(s*.6,-s*.7);ctx.lineTo(s,-s*.1);ctx.lineTo(0,s);ctx.lineTo(-s,-s*.1);ctx.closePath()}else heartPath(ctx,s);
    ctx.fill();ctx.restore()}
  ctx.globalCompositeOperation='lighter';
  if(Math.random()<.01)sh2.push({x:rnd(W*.3,W),y:rnd(0,H*.4),l:0});
  for(let i=sh2.length-1;i>=0;i--){const s=sh2[i];s.l++;s.x-=11;s.y+=5;if(s.l>40){sh2.splice(i,1);continue}const g=ctx.createLinearGradient(s.x,s.y,s.x+80,s.y-36);g.addColorStop(0,'rgba(255,240,225,'+(1-s.l/40)+')');g.addColorStop(1,'rgba(255,240,225,0)');ctx.strokeStyle=g;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(s.x,s.y);ctx.lineTo(s.x+80,s.y-36);ctx.stroke()}
  for(let i=rg2.length-1;i>=0;i--){const r=rg2[i];r.l++;const a=1-r.l/50;if(a<=0){rg2.splice(i,1);continue}ctx.strokeStyle='rgba(232,160,170,'+a*.7+')';ctx.lineWidth=2;ctx.beginPath();ctx.arc(r.x,r.y,r.l*2.2,0,6.283);ctx.stroke()}
  for(let i=tr2.length-1;i>=0;i--){const p=tr2[i];p.l++;p.vy+=.01;p.x+=p.vx;p.y+=p.vy;const a=1-p.l/45;if(a<=0){tr2.splice(i,1);continue}ctx.globalAlpha=a;ctx.fillStyle='#f6d9dc';ctx.beginPath();ctx.arc(p.x,p.y,2,0,6.283);ctx.fill()}
  ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
}
document.querySelectorAll('.kicker,.big,#title3 h1').forEach(e=>{if(e.children.length||!e.textContent.trim())return;let d=0;e.innerHTML=e.textContent.split(' ').map(w=>'<span style="display:inline-block;white-space:nowrap">'+[...w].map(c=>'<span class="ch" style="animation-delay:'+(d++*.045).toFixed(2)+'s">'+c+'</span>').join('')+'</span>').join(' ')});
go(0);
