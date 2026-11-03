
/*
 * タイムインターバル君
 * トワノソラ
 *
 * 稼働と休憩を自動で繰り返すタイマー
 */

document.addEventListener("DOMContentLoaded", () => {
  const workInput = document.getElementById("work-time");
  const restInput = document.getElementById("rest-time");
  const display = document.getElementById("time-display");
  const phaseLabel = document.getElementById("phase-label");
  const nextPhase = document.getElementById("next-phase");
  const progressFill = document.getElementById("progress-fill");
  const startPauseButton = document.getElementById("start-pause");
  const resetButton = document.getElementById("reset");

  const STORAGE_KEY = "towan osora_interval_settings".replace(" ", "");

  let phase = "work";
  let running = false;
  let remainingMs = 30000;
  let phaseDurationMs = 30000;
  let endTime = 0;
  let timerId = null;

  function getSeconds(input, fallback) {
    const value = Number(input.value);
    if (!Number.isFinite(value)) return fallback;
    return Math.min(3600, Math.max(1, Math.round(value)));
  }

  function getDurationMs(type) {
    const seconds = type === "work"
      ? getSeconds(workInput, 30)
      : getSeconds(restInput, 10);

    return seconds * 1000;
  }

  function formatTime(ms) {
    const totalSeconds = Math.ceil(Math.max(0, ms) / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  function render() {
    display.textContent = formatTime(remainingMs);

    phaseLabel.textContent = running || remainingMs !== getDurationMs("work") || phase !== "work"
      ? (phase === "work" ? "稼働中" : "休憩中")
      : "準備OK";

    const nextSeconds = phase === "work"
      ? getSeconds(restInput, 10)
      : getSeconds(workInput, 30);

    nextPhase.textContent = running || startPauseButton.textContent === "再開"
      ? `次は${phase === "work" ? "休憩" : "稼働"} ${nextSeconds}秒`
      : "スタートを押してください";

    const progress = phaseDurationMs > 0
      ? (1 - remainingMs / phaseDurationMs) * 100
      : 0;

    progressFill.style.width = `${Math.min(100, Math.max(0, progress))}%`;
    startPauseButton.textContent = running ? "一時停止" :
      (remainingMs < phaseDurationMs ? "再開" : "スタート");
  }

  function switchPhase() {
    phase = phase === "work" ? "rest" : "work";
    phaseDurationMs = getDurationMs(phase);
    remainingMs = phaseDurationMs;
  }

  function tick() {
    if (!running) return;

    let now = performance.now();
    remainingMs = endTime - now;

    while (remainingMs <= 0) {
      const overrun = -remainingMs;
      switchPhase();
      remainingMs = phaseDurationMs - overrun;
      endTime = now + remainingMs;
    }

    render();
  }

  function start() {
    if (running) return;

    running = true;
    endTime = performance.now() + remainingMs;
    timerId = setInterval(tick, 100);

    render();
  }

  function pause() {
    if (!running) return;

    remainingMs = Math.max(0, endTime - performance.now());
    running = false;
    clearInterval(timerId);
    timerId = null;

    render();
  }

  function reset() {
    running = false;
    clearInterval(timerId);
    timerId = null;

    phase = "work";
    phaseDurationMs = getDurationMs("work");
    remainingMs = phaseDurationMs;

    render();
  }

  function saveSettings() {
    const settings = {
      work: getSeconds(workInput, 30),
      rest: getSeconds(restInput, 10)
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }

  function loadSettings() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const settings = JSON.parse(raw);

      if (Number.isFinite(Number(settings.work))) {
        workInput.value = getSeconds({ value: settings.work }, 30);
      }

      if (Number.isFinite(Number(settings.rest))) {
        restInput.value = getSeconds({ value: settings.rest }, 10);
      }
    } catch (error) {
      console.warn("設定を読み込めませんでした", error);
    }
  }

  startPauseButton.addEventListener("click", () => {
    if (running) {
      pause();
    } else {
      start();
    }
  });

  resetButton.addEventListener("click", reset);

  [workInput, restInput].forEach((input) => {
    input.addEventListener("change", () => {
      input.value = getSeconds(
        input,
        input === workInput ? 30 : 10
      );

      saveSettings();
      reset();
    });
  });

  loadSettings();
  reset();
});
