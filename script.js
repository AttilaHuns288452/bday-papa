// Smooth helpers
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];

const btnConfetti = $("#btnConfetti");
const btnScroll = $("#btnScroll");
const btnTop = $("#btnTop");
const btnSaveWish = $("#btnSaveWish");
const btnClearWish = $("#btnClearWish");
const wish = $("#wish");
const wishText = $("#wishText");
const wishCard = $("#wishCard");
const audio = $("#bdayAudio");
const noteDialog = $("#noteDialog");
const noteText = $("#noteText");
const checklist = $("#checklist");

// -------- Confetti (simple canvas particles) --------
const canvas = $("#confetti");
const ctx = canvas.getContext("2d");
let W = 0, H = 0;
const particles = [];
let running = false;

function resize(){
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  W = Math.floor(window.innerWidth * dpr);
  H = Math.floor(window.innerHeight * dpr);
  canvas.width = W;
  canvas.height = H;
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";
  ctx.setTransform(1,0,0,1,0,0);
  ctx.scale(dpr, dpr);
}
window.addEventListener("resize", resize);
resize();

function rand(min, max){ return Math.random() * (max - min) + min; }

function popConfetti(count = 160){
  for(let i=0;i<count;i++){
    particles.push({
      x: rand(0, window.innerWidth),
      y: rand(-40, -10),
      vx: rand(-2.2, 2.2),
      vy: rand(2.0, 6.2),
      w: rand(6, 12),
      h: rand(6, 14),
      rot: rand(0, Math.PI),
      vr: rand(-0.12, 0.12),
      life: rand(140, 220)
    });
  }
  if(!running){
    running = true;
    requestAnimationFrame(tick);
  }
}

function tick(){
  ctx.clearRect(0,0, window.innerWidth, window.innerHeight);
  for(let i = particles.length - 1; i >= 0; i--){
    const p = particles[i];
    p.life -= 1;
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.03; // gravity
    p.rot += p.vr;
    // draw (no hard-coded colors; use HSL)
    const hue = (p.life * 3 + i) % 360;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = `hsl(${hue} 85% 65% / 0.95)`;
    ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
    ctx.restore();

    if(p.life <= 0 || p.y > window.innerHeight + 60){
      particles.splice(i, 1);
    }
  }
  if(particles.length){
    requestAnimationFrame(tick);
  } else {
    running = false;
    ctx.clearRect(0,0, window.innerWidth, window.innerHeight);
  }
}

btnConfetti?.addEventListener("click", () => popConfetti(190));

// -------- Scroll buttons --------
btnScroll?.addEventListener("click", () => {
  $("#memories")?.scrollIntoView({ behavior: "smooth", block: "start" });
});
btnTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

// -------- Notes dialog --------
$$(".miniBtn").forEach(btn => {
  btn.addEventListener("click", () => {
    noteText.textContent = btn.dataset.note || "";
    if(typeof noteDialog.showModal === "function") noteDialog.showModal();
    popConfetti(90);
  });
});

// -------- Wish card --------
const WISH_KEY = "papa_bday_wish_v1";
function renderWish(text){
  const t = (text || "").trim();
  wishText.textContent = t ? t : "Type your message above to preview it here.";
  wishCard.classList.toggle("wishCard--hasText", Boolean(t));
}

const savedWish = localStorage.getItem(WISH_KEY) || "";
wish.value = savedWish;
renderWish(savedWish);

wish.addEventListener("input", () => renderWish(wish.value));

btnSaveWish?.addEventListener("click", () => {
  localStorage.setItem(WISH_KEY, wish.value || "");
  popConfetti(140);
});

btnClearWish?.addEventListener("click", () => {
  wish.value = "";
  renderWish("");
  localStorage.removeItem(WISH_KEY);
});

// -------- Checklist persistence --------
const CHECK_KEY = "papa_bday_checklist_v1";
function loadChecklist(){
  try{
    const state = JSON.parse(localStorage.getItem(CHECK_KEY) || "[]");
    const inputs = checklist.querySelectorAll("input[type='checkbox']");
    inputs.forEach((el, idx) => { el.checked = Boolean(state[idx]); });
  }catch(e){}
}
function saveChecklist(){
  const inputs = checklist.querySelectorAll("input[type='checkbox']");
  const state = [...inputs].map(el => el.checked);
  localStorage.setItem(CHECK_KEY, JSON.stringify(state));
}
checklist?.addEventListener("change", saveChecklist);
loadChecklist();

// -------- Try to autoplay audio (may be blocked by browser) --------
window.addEventListener("load", async () => {
  try{
    audio.volume = 0.85;
    const p = audio.play();
    if(p && typeof p.then === "function") await p;
  }catch(e){
    // Autoplay may be blocked; user can press play.
  }
  // gentle confetti entrance
  setTimeout(() => popConfetti(110), 500);
});
