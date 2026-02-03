const speedEl = document.getElementById("speed");
const downloadEl = document.getElementById("download");
const uploadEl = document.getElementById("upload");
const startBtn = document.getElementById("startBtn");
const gaugeFill = document.querySelector(".gauge-fill");
const historyList = document.getElementById("historyList");
const clearBtn = document.getElementById("clearHistory");
const ispEl = document.getElementById("isp");
const locationEl = document.getElementById("location");

const insightSubtitle = document.getElementById("insightSubtitle");
const tipText = document.getElementById("tipText");
const insightFooter = document.getElementById("insightFooter");
const ispName = document.getElementById("ispName");

/* ================= GAUGE CONFIG ================= */
const RADIUS = 110;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const MAX_SPEED = 150;

// initialize gauge
gaugeFill.style.strokeDasharray = CIRCUMFERENCE;
gaugeFill.style.strokeDashoffset = CIRCUMFERENCE;

/* ================= ISP + LOCATION ================= */
async function fetchISPInfo() {
  try {
    const res = await fetch("https://ipapi.co/json/");
    const data = await res.json();

    ispEl.textContent = `📡 ${data.org || "Local ISP"}`;
    locationEl.textContent = "📍 VIT, Chennai";
  } catch {
    ispEl.textContent = "📡 Local ISP";
    locationEl.textContent = "📍 VIT, Chennai";
  }
}

fetchISPInfo();

/* ================= GAUGE UPDATE ================= */
function setGauge(value) {
  const percent = value / MAX_SPEED;
  const offset = CIRCUMFERENCE * (1 - percent);
  gaugeFill.style.strokeDashoffset = offset;
}

/* ================= SPEED GENERATION ================= */
function generateTargetSpeed() {
  if (Math.random() < 0.7) {
    return 10 + Math.random() * 90;
  }
  return 100 + Math.random() * 40;
}

/* ================= START TEST ================= */
function startTest() {
  let currentSpeed = 0;
  const targetSpeed = generateTargetSpeed();
  let ticks = 0;

  startBtn.disabled = true;
  startBtn.textContent = "Testing...";

  const interval = setInterval(() => {
    ticks++;

    const noise = (Math.random() - 0.5) * 10;
    const trend = (targetSpeed - currentSpeed) * 0.12;

    currentSpeed += trend + noise;

    if (currentSpeed < 0) currentSpeed = 0;
    if (currentSpeed > MAX_SPEED) currentSpeed = MAX_SPEED;

    speedEl.textContent = Math.round(currentSpeed);
    setGauge(currentSpeed);

    if (ticks > 50) {
      clearInterval(interval);
      finishTest(targetSpeed);
    }
  }, 150);
}

/* ================= FINISH TEST ================= */
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

/* ================= INSIGHT ENGINE ================= */
function updateInsight() {
  const items = document.querySelectorAll(".history-item");
  if (items.length === 0) return;

  let total = 0;
  items.forEach(item => {
    total += Number(item.dataset.download);
  });

  const avg = total / items.length;
  const isp = ispEl.textContent.replace("📡 ", "");

  ispName.textContent = isp;

  if (avg >= 50) {
    insightSubtitle.textContent = "Your connection is blazing fast!";
    tipText.textContent =
      `Based on your test history at VIT, Chennai, your average speed of ${avg.toFixed(
        1
      )} Mbps is ideal for ${isp}.`;
    insightFooter.textContent =
      "⚡ You're getting great speeds! No improvements needed.";
  } else {
    insightSubtitle.textContent = "Your connection could be improved";
    tipText.textContent =
      `Your average speed at VIT, Chennai is ${avg.toFixed(
        1
      )} Mbps. For stronger connectivity, try AB1 ground floor, Gymkhana, or areas near V-Nest during off-peak hours.`;
    insightFooter.textContent =
      "📍 Suggested better connectivity zones nearby.";
  }
}

/* ================= HISTORY ================= */
function saveHistory(download, upload) {
  const time = new Date().toLocaleTimeString();
  const location = "VIT, Chennai";
  const isp = ispEl.textContent.replace("📡 ", "");

  const li = document.createElement("li");
  li.className = "history-item";
  li.dataset.download = download;

  li.innerHTML = `
    <div class="history-left">
      <div class="history-time">${time}</div>
      <div class="history-location">📍 ${location}</div>
      <div class="history-isp">📡 ${isp}</div>
    </div>

    <div class="history-right">
      <div class="speed down">⬇ ${download} <span>Mbps</span></div>
      <div class="speed up">⬆ ${upload} <span>Mbps</span></div>
    </div>
  `;

  historyList.prepend(li);
  updateInsight();
}

/* ================= EVENTS ================= */
clearBtn.addEventListener("click", () => {
  historyList.innerHTML = "";
  insightSubtitle.textContent = "Run tests to analyze your connection";
  tipText.textContent =
    "Run multiple tests to receive location-based network suggestions.";
  insightFooter.textContent = "⚡ Waiting for test data...";
});

startBtn.addEventListener("click", startTest);
