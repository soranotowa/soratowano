
/*
 * インターバルる | トワノソラ
 *
 * 稼働・休憩の繰り返しタイマー
 * アラーム音、カウントダウン、
 * 毎秒の電子音、設定保存に対応
 */

document.addEventListener("DOMContentLoaded", () => {
  const workInput = document.getElementById("work-time");
  const restInput = document.getElementById("rest-time");
  const workSound = document.getElementById("work-sound");
  const restSound = document.getElementById("rest-sound");
  const countdownInput = document.getElementById("countdown-seconds");
  const tickSound = document.getElementById("tick-sound");
  const volumeInput = document.getElementById("alarm-volume");
  const volumeValue = document.getElementById("volume-value");

  const display = document.getElementById("time-display");
  const phaseLabel = document.getElementById("phase-label");
  const nextPhase = document.getElementById("next-phase");
  const progressFill = document.getElementById("progress-fill");
  const startPauseButton = document.getElementById("start-pause");
  const resetButton = document.getElementById("reset");

  const STORAGE_KEY = "soratowano_interval_settings_v2";

  let phase = "work";
  let running = false;
  let started = false;
  let remainingMs = 30000;
  let phaseDurationMs = 30000;
  let endTime = 0;
  let timerId = null;
  let lastSoundSecond = null;
  let audioContext = null;

  // -----------------------------
  // 設定値
  // -----------------------------

  function getSeconds(input, fallback) {
    const value = Number(input.value);

    if (!Number.isFinite(value) || input.value.trim() === "") {
      return fallback;
    }

    return Math.min(3600, Math.max(1, Math.round(value)));
  }

  function getDurationMs(type) {
    const input = type === "work" ? workInput : restInput;
    const fallback = type === "work" ? 30 : 10;
    return getSeconds(input, fallback) * 1000;
  }

  function formatTime(ms) {
    const total = Math.ceil(Math.max(0, ms) / 1000);
    const minutes = Math.floor(total / 60);
    const seconds = total % 60;

    return (
      String(minutes).padStart(2, "0") +
      ":" +
      String(seconds).padStart(2, "0")
    );
  }

  function selectedSound(type) {
    return type === "work"
      ? workSound.value
      : restSound.value;
  }

  function getVolume() {
    return Number(volumeInput.value) / 100;
  }

  // -----------------------------
  // Web Audio API
  // -----------------------------

  async function unlockAudio() {
    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) return false;

    try {
      if (!audioContext || audioContext.state === "closed") {
        audioContext = new AudioContextClass();
      }

      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }

      return audioContext.state === "running";
    } catch (error) {
      console.warn("音声を有効化できませんでした", error);
      return false;
    }
  }

  function tone(frequency, duration, delay = 0, type = "sine") {
    if (!audioContext || audioContext.state !== "running") return;

    const volume = getVolume();
    if (volume <= 0) return;

    const now = audioContext.currentTime + delay;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);

    const level = volume * 0.18;

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(level, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      now + duration
    );

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start(now);
    oscillator.stop(now + duration + 0.02);

    oscillator.onended = () => {
      oscillator.disconnect();
      gain.disconnect();
    };
  }

  function playSound(name) {
    switch (name) {
      case "beep":
        tone(880, 0.16);
        break;

      case "double":
        tone(880, 0.12);
        tone(1100, 0.12, 0.17);
        break;

      case "chime":
        tone(660, 0.18);
        tone(990, 0.5, 0.16);
        break;

      case "off":
      default:
        break;
    }
  }

  function playCountdown() {
    tone(760, 0.08);
  }

  function playTick() {
    tone(470, 0.035, 0, "triangle");
  }

  // -----------------------------
  // 表示
  // -----------------------------

  function render() {
    display.textContent = formatTime(remainingMs);

    if (!started) {
      phaseLabel.textContent = "準備OK";
      nextPhase.textContent = "スタートを押してください";
    } else {
      phaseLabel.textContent = phase === "work"
        ? "稼働中"
        : "休憩中";

      const nextDuration = getDurationMs(
        phase === "work" ? "rest" : "work"
      );

      const nextName = phase === "work" ? "休憩" : "稼働";

      nextPhase.textContent =
        (running ? "" : "一時停止中 ｜ ") +
        `次は${nextName} ${formatTime(nextDuration)}`;
    }

    const progress = phaseDurationMs > 0
      ? (1 - remainingMs / phaseDurationMs) * 100
      : 0;

    progressFill.style.width =
      `${Math.min(100, Math.max(0, progress))}%`;

    startPauseButton.textContent = running
      ? "一時停止"
      : started ? "再開" : "スタート";

    document.body.dataset.phase = phase;
  }

  // -----------------------------
  // 秒ごとの音
  // -----------------------------

  function announceSecond() {
    if (!running) return;

    const seconds = Math.ceil(Math.max(0, remainingMs) / 1000);

    if (seconds <= 0 || seconds === lastSoundSecond) return;

    lastSoundSecond = seconds;

    const countdown = Number(countdownInput.value);

    // 残りN秒以内ではカウントダウン音を優先
    if (countdown > 0 && seconds <= countdown) {
      playCountdown();
    } else if (tickSound.checked) {
      playTick();
    }
  }

  // -----------------------------
  // フェーズ切り替え
  // -----------------------------

  function advancePhase(now) {
    // 現在フェーズが終了したら次へ
    const oldEndTime = endTime;
    phase = phase === "work" ? "rest" : "work";
    phaseDurationMs = getDurationMs(phase);
    endTime = oldEndTime + phaseDurationMs;

    // タブが長時間停止していた場合は、
    // 経過したサイクルをまとめて飛ばす
    if (now >= endTime) {
      const workMs = getDurationMs("work");
      const restMs = getDurationMs("rest");
      const cycleMs = workMs + restMs;

      const cycles = Math.floor((now - endTime) / cycleMs);
      endTime += cycles * cycleMs;

      // 現在フェーズからさらに1～2回進める
      for (let i = 0; i < 2 && now >= endTime; i++) {
        phase = phase === "work" ? "rest" : "work";
        phaseDurationMs = getDurationMs(phase);
        endTime += phaseDurationMs;
      }
    }

    lastSoundSecond = null;
    playSound(selectedSound(phase));
  }

  function tick() {
    if (!running) return;

    const now = performance.now();

    if (now >= endTime) {
      advancePhase(now);
    }

    remainingMs = Math.max(0, endTime - now);

    announceSecond();
    render();
  }

  // -----------------------------
  // 開始・一時停止・リセット
  // -----------------------------

  function start() {
    if (running) return;

    const firstStart = !started;

    running = true;
    started = true;
    endTime = performance.now() + remainingMs;

    // スマホの音声再生制限に対応するため、
    // ユーザーのタップ操作で音を有効化する
    unlockAudio().then((enabled) => {
      if (enabled && firstStart && running) {
        playSound(selectedSound("work"));
      }
    });

    lastSoundSecond = Math.ceil(remainingMs / 1000);

    timerId = setInterval(tick, 50);
    render();
  }

  function pause() {
    if (!running) return;

    tick();

    remainingMs = Math.max(
      0,
      endTime - performance.now()
    );

    running = false;
    clearInterval(timerId);
    timerId = null;

    render();
  }

  function reset() {
    running = false;
    started = false;

    clearInterval(timerId);
    timerId = null;

    phase = "work";
    phaseDurationMs = getDurationMs("work");
    remainingMs = phaseDurationMs;
    lastSoundSecond = null;

    render();
  }

  // -----------------------------
  // 設定保存
  // -----------------------------

  function saveSettings() {
    const settings = {
      work: getSeconds(workInput, 30),
      rest: getSeconds(restInput, 10),
      workSound: workSound.value,
      restSound: restSound.value,
      countdown: Number(countdownInput.value),
      tickSound: tickSound.checked,
      volume: Number(volumeInput.value)
    };

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(settings)
      );
    } catch (error) {
      console.warn("設定を保存できませんでした", error);
    }
  }

  function loadSettings() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const settings = JSON.parse(raw);

      if (settings.work != null) {
        workInput.value = settings.work;
      }

      if (settings.rest != null) {
        restInput.value = settings.rest;
      }

      const soundOptions = ["beep", "double", "chime", "off"];

      if (soundOptions.includes(settings.workSound)) {
        workSound.value = settings.workSound;
      }

      if (soundOptions.includes(settings.restSound)) {
        restSound.value = settings.restSound;
      }

      if ([0, 3, 5, 10].includes(Number(settings.countdown))) {
        countdownInput.value = String(settings.countdown);
      }

      if (typeof settings.tickSound === "boolean") {
        tickSound.checked = settings.tickSound;
      }

      if (Number.isFinite(Number(settings.volume)) &&
          settings.volume != null) {
        volumeInput.value = Math.min(
          100,
          Math.max(0, Number(settings.volume))
        );
      }

    } catch (error) {
      console.warn("設定を読み込めませんでした", error);
    }

    workInput.value = getSeconds(workInput, 30);
    restInput.value = getSeconds(restInput, 10);
  }

  // -----------------------------
  // 操作イベント
  // -----------------------------

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

  [
    workSound,
    restSound,
    countdownInput,
    tickSound
  ].forEach((input) => {
    input.addEventListener("change", saveSettings);
  });

  volumeInput.addEventListener("input", () => {
    volumeValue.textContent = `${volumeInput.value}%`;
    saveSettings();
  });

  document.getElementById("preview-work")
    .addEventListener("click", async () => {
      if (await unlockAudio()) {
        playSound(workSound.value);
      }
    });

  document.getElementById("preview-rest")
    .addEventListener("click", async () => {
      if (await unlockAudio()) {
        playSound(restSound.value);
      }
    });

  // -----------------------------
  // 初期化
  // -----------------------------

  loadSettings();
  volumeValue.textContent = `${volumeInput.value}%`;
  reset();
});
