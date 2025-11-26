// --- Utility ---
const pad = (n, d = 2) => String(n).padStart(d, "0");

// --- Live Clock ---
const liveClock = document.getElementById("liveClock");
const tzLine = document.getElementById("tz");

function updateClock() {
  const now = new Date();
  liveClock.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  tzLine.textContent = "Timezone: " + Intl.DateTimeFormat().resolvedOptions().timeZone;
}
setInterval(updateClock, 250);
updateClock();

// --- Countdown ---
const modeDuration = document.getElementById("modeDuration");
const modeTarget = document.getElementById("modeTarget");

const durationRow = document.getElementById("durationRow");
const targetRow = document.getElementById("targetRow");

const h = document.getElementById("hours");
const m = document.getElementById("minutes");
const s = document.getElementById("seconds");
const target = document.getElementById("targetInput");

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");
const countDisplay = document.getElementById("countDisplay");

let timer = {
  running: false,
  targetTime: null,
  remainingPause: null,
  mode: "duration",
};

function switchMode(mode) {
  timer.mode = mode;

  if (mode === "duration") {
    modeDuration.classList.add("active");
    modeTarget.classList.remove("active");

    durationRow.style.display = "";
    targetRow.style.display = "none";
  } else {
    modeTarget.classList.add("active");
    modeDuration.classList.remove("active");

    durationRow.style.display = "none";
    targetRow.style.display = "";
  }

  resetCountdown();
}

modeDuration.onclick = () => switchMode("duration");
modeTarget.onclick = () => switchMode("target");

function getDurationMs() {
  return ((+h.value * 60 + +m.value) * 60 + +s.value) * 1000;
}

function fmt(ms) {
  if (ms < 0) ms = 0;
  const t = Math.floor(ms / 1000);
  return `${pad(t / 3600 | 0)}:${pad((t % 3600) / 60 | 0)}:${pad(t % 60)}`;
}

let loop;

function startCountdown() {
  if (timer.running) return;

  const now = Date.now();

  if (timer.mode === "duration") {
    const dur = getDurationMs();
    if (dur <= 0) return alert("Enter a valid duration");

    timer.targetTime = now + (timer.remainingPause ?? dur);

  } else {
    if (!target.value) return alert("Select a date/time");
    const t = new Date(target.value).getTime();
    if (t <= now) return alert("Pick a future time");
    timer.targetTime = t;
  }

  timer.running = true;

  function tick() {
    if (!timer.running) return;

    const left = timer.targetTime - Date.now();
    countDisplay.textContent = fmt(left);

    if (left <= 0) {
      timer.running = false;
      countDisplay.textContent = "00:00:00";
      return;
    }

    loop = setTimeout(tick, 200);
  }

  tick();
}

function pauseCountdown() {
  if (!timer.running) return;
  timer.running = false;

  timer.remainingPause = timer.targetTime - Date.now();
  clearTimeout(loop);
}

function resetCountdown() {
  timer.running = false;
  timer.targetTime = null;
  timer.remainingPause = null;

  clearTimeout(loop);
  countDisplay.textContent = "00:00:00";
}

startBtn.onclick = startCountdown;
pauseBtn.onclick = pauseCountdown;
resetBtn.onclick = resetCountdown;

// --- Stopwatch ---
const swStart = document.getElementById("swStart");
const swLap = document.getElementById("swLap");
const swReset = document.getElementById("swReset");
const swDisplay = document.getElementById("stopwatchDisplay");
const lapList = document.getElementById("lapList");

let sw = {
  run: false,
  start: null,
  past: 0,
  raf: null,
};

function fmtSW(ms) {
  const t = Math.floor(ms / 1000);
  const hrs = t / 3600 | 0;
  const min = (t % 3600) / 60 | 0;
  const sec = t % 60;
  const milli = ms % 1000;

  return `${pad(hrs)}:${pad(min)}:${pad(sec)}.${String(milli).padStart(3, "0")}`;
}

function swTick() {
  if (!sw.run) return;

  const now = Date.now();
  swDisplay.textContent = fmtSW(sw.past + (now - sw.start));

  sw.raf = requestAnimationFrame(swTick);
}

swStart.onclick = () => {
  if (!sw.run) {
    sw.run = true;
    sw.start = Date.now();
    swStart.textContent = "Pause";
    swTick();
  } else {
    sw.run = false;
    sw.past += Date.now() - sw.start;
    cancelAnimationFrame(sw.raf);
    swStart.textContent = "Start";
  }
};

swLap.onclick = () => {
  if (!sw.run) return;
  const ms = sw.past + (Date.now() - sw.start);
  const div = document.createElement("div");
  div.className = "small";
  div.style.padding = "6px 0";
  div.textContent = "Lap — " + fmtSW(ms);
  lapList.prepend(div);
};

swReset.onclick = () => {
  sw.run = false;
  sw.start = null;
  sw.past = 0;
  cancelAnimationFrame(sw.raf);
  swDisplay.textContent = "00:00:00.000";
  lapList.innerHTML = "";
  swStart.textContent = "Start";
};
