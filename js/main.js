
/*
 * トワノソラ - 共通JavaScript
 *
 * Windows 2000風の画面操作を実装
 */

document.addEventListener("DOMContentLoaded", () => {
  const desktop = document.querySelector(".desktop");
  const explorer = document.querySelector(".explorer-window");
  const workspace = document.querySelector(".workspace");

  const minimizeButton = document.getElementById("minimize-button");
  const maximizeButton = document.getElementById("maximize-button");
  const closeButton = document.getElementById("close-button");
  const restoreButton = document.getElementById("restore-button");

  const startButton = document.getElementById("start-button");
  const startMenu = document.getElementById("start-menu");
  const startAbout = document.getElementById("start-about");

  const clock = document.getElementById("taskbar-clock");

  // --------------------------------------
  // 時計
  // --------------------------------------

  function updateClock() {
    const now = new Date();

    if (clock) {
      clock.textContent = now.toLocaleTimeString("ja-JP", {
        hour: "2-digit",
        minute: "2-digit"
      });

      clock.dateTime = now.toISOString();
    }
  }

  updateClock();
  setInterval(updateClock, 1000);

  // --------------------------------------
  // ウィンドウ操作
  // --------------------------------------

  function restoreWindow() {
    explorer.classList.remove("is-minimized");
    restoreButton.setAttribute("aria-pressed", "true");
  }

  function minimizeWindow() {
    explorer.classList.add("is-minimized");
    restoreButton.setAttribute("aria-pressed", "false");
    closeStartMenu();
  }

  minimizeButton.addEventListener("click", minimizeWindow);
  closeButton.addEventListener("click", minimizeWindow);

  maximizeButton.addEventListener("click", () => {
    restoreWindow();

    const maximized = desktop.classList.toggle("is-maximized");

    maximizeButton.setAttribute(
      "aria-label",
      maximized ? "元のサイズに戻す" : "最大化"
    );
  });

  restoreButton.addEventListener("click", () => {
    const minimized = explorer.classList.contains("is-minimized");

    if (minimized) {
      restoreWindow();
    } else {
      minimizeWindow();
    }
  });

  // --------------------------------------
  // スタートメニュー
  // --------------------------------------

  function closeStartMenu() {
    startMenu.hidden = true;
    startButton.setAttribute("aria-expanded", "false");
  }

  function toggleStartMenu() {
    const opening = startMenu.hidden;

    startMenu.hidden = !opening;
    startButton.setAttribute("aria-expanded", String(opening));
  }

  startButton.addEventListener("click", toggleStartMenu);

  document.addEventListener("click", (event) => {
    if (
      !startMenu.contains(event.target) &&
      !startButton.contains(event.target)
    ) {
      closeStartMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeStartMenu();
    }
  });

  startMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      restoreWindow();
      closeStartMenu();
    });
  });

  startAbout.addEventListener("click", () => {
    restoreWindow();
    closeStartMenu();
    document.getElementById("about").scrollIntoView({
      behavior: "smooth"
    });
  });

  // --------------------------------------
  // サイドバーナビゲーション
  // --------------------------------------

  const navLinks = document.querySelectorAll(".nav-link");

  function setActiveNav(sectionId) {
    navLinks.forEach((link) => {
      const active = link.dataset.section === sectionId;

      link.classList.toggle("active", active);

      if (active) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      setActiveNav(link.dataset.section);
    });
  });

  // URLのハッシュに合わせて選択状態を更新
  window.addEventListener("hashchange", () => {
    const sectionId = window.location.hash.slice(1) || "home";
    setActiveNav(sectionId);
  });

  setActiveNav(window.location.hash.slice(1) || "home");

  // --------------------------------------
  // 上部メニューバー
  // --------------------------------------

  const fileMenu = document.querySelector('[data-menu="file"]');
  const viewMenu = document.querySelector('[data-menu="view"]');

  fileMenu.addEventListener("click", () => {
    restoreWindow();
    window.location.hash = "home";
  });

  viewMenu.addEventListener("click", () => {
    workspace.classList.toggle("sidebar-hidden");
  });

  // --------------------------------------
  // アドレスバー
  // --------------------------------------

  const addressInput = document.getElementById("address-input");
  const goButton = document.getElementById("go-button");

  // 実際の公開先URLを表示
  addressInput.value = window.location.origin + "/";

  goButton.addEventListener("click", () => {
    restoreWindow();
    window.location.hash = "home";
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});
