const speedEl = document.getElementById("speed");
const downloadEl = document.getElementById("download");
const uploadEl = document.getElementById("upload");
const startBtn = document.getElementById("startBtn");
const gaugeFill = document.querySelector(".gauge-fill");
const historyList = document.getElementById("historyList");
const clearBtn = document.getElementById("clearHistory");
const ispEl = document.getElementById("isp");
const locationEl = document.getElementById("location");
const suggestBtn = document.getElementById("suggestBtn");
const suggestionText = document.getElementById("suggestionText");


/*  GAUGE CONFIG  */
const RADIUS = 110;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const MAX_SPEED = 150;


// initialize gauge
gaugeFill.style.strokeDasharray = CIRCUMFERENCE;
gaugeFill.style.strokeDashoffset = CIRCUMFERENCE;

/* ISP + LOCATION */
async function fetchISPInfo() {
  try {
    const res = await fetch("https://ipapi.co/json/");
    const data = await res.json();

    ispEl.textContent = `📡 ${data.org || "Unknown ISP"}`;
    locationEl.textContent = "📍 VIT, Chennai ";
  } catch {
    ispEl.textContent = "📡 ISP unavailable";
    locationEl.textContent = "📍 VIT, Chennai ";
  }
}

fetchISPInfo();

/*
   GAUGE UPDATE */
function setGauge(value) {
  const percent = value / MAX_SPEED;
  const offset = CIRCUMFERENCE * (1 - percent);
  gaugeFill.style.strokeDashoffset = offset;
}

/*SPEED GENERATION */
function generateTargetSpeed() {
  if (Math.random() < 0.8) {
    return 10 + Math.random() * 90;
  }
  return 100 + Math.random() * 50;
}

/*   START TEST*/
function startTest() {
  let currentSpeed = 0;
  const targetSpeed = generateTargetSpeed();
  let ticks = 0;

  startBtn.disabled = true;
  startBtn.textContent = "Testing...";

  const interval = setInterval(() => {
    ticks++;

    // fluctuation + convergence
    const noise = (Math.random() - 0.5) * 10;
    const trend = (targetSpeed - currentSpeed) * 0.12;

    currentSpeed += trend + noise;

    // clamp
    if (currentSpeed < 0) currentSpeed = 0;
    if (currentSpeed > MAX_SPEED) currentSpeed = MAX_SPEED;

    speedEl.textContent = Math.round(currentSpeed);
    setGauge(currentSpeed);

    // stop after ~8 seconds
    if (ticks > 50) {
      clearInterval(interval);
      finishTest(targetSpeed);
    }
  }, 150);
}

/*FINISH TEST*/
function finishTest(finalSpeed) {
  const download = finalSpeed.toFixed(1);
  const upload = (finalSpeed * (0.3 + Math.random() * 0.2)).toFixed(1);

  speedEl.textContent = Math.round(finalSpeed);
  setGauge(finalSpeed);

  downloadEl.textContent = `${download} Mbps`;
  uploadEl.textContent = `${upload} Mbps`;

  saveHistory(download, upload);

  startBtn.disabled = false;
  startBtn.textContent = "Test Again";
}

/* HISTORY*/
function saveHistory(download, upload) {
  const time = new Date().toLocaleTimeString();
  const location = "Chennai, India";
  const isp = ispEl.textContent.replace("📡 ", "");

  const li = document.createElement("li");
  li.className = "history-item";
  li.dataset.download = download;

  li.innerHTML = `
    <div class="history-left">
      <div class="history-time"> ${time}</div>
      <div class="history-location">📍 ${location}</div>
      <div class="history-isp">📡 ${isp}</div>
    </div>

    <div class="history-right">
      <div class="speed down">⬇ ${download} <span>Mbps</span></div>
      <div class="speed up">⬆ ${upload} <span>Mbps</span></div>
    </div>
  `;

  historyList.prepend(li);
}


suggestBtn.addEventListener("click", () => {
  const historyItems = historyList.querySelectorAll("li");

  if (historyItems.length === 0) {
    suggestionText.textContent =
      "Run a speed test first to get suggestions.";
    return;
  }

  let totalSpeed = 0;

  historyItems.forEach(item => {
    totalSpeed += Number(item.dataset.download);
  });

  const avgSpeed = totalSpeed / historyItems.length;

  // decision logic
  if (avgSpeed >= 50) {
    suggestionText.textContent =
      `Your average speed at VIT, Chennai is ${avgSpeed.toFixed(
        1
      )} Mbps. This is ideal for your ISP and location.`;
  } else {
    suggestionText.textContent =
      `Your average speed at VIT, Chennai is ${avgSpeed.toFixed(
        1
      )} Mbps. For better connectivity, try locations like AB1- ground floor, gymkhana or near vnest IT Corridor.`;
  }
});


clearBtn.addEventListener("click", () => {
  historyList.innerHTML = "";
});

startBtn.addEventListener("click", startTest);
