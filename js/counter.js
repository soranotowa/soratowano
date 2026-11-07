
/*
 * トワノソラ アクセスカウンター表示
 *
 * 同じタブでの再読み込みは加算せず、
 * 新しいタブで開いたときに加算する簡易方式。
 */

document.addEventListener("DOMContentLoaded", async () => {
  const counter = document.getElementById("visitor-count");

  if (!counter) return;

  const STORAGE_KEY = "soratowano_counter_visited";

  try {
    // このタブで一度カウント済みか確認
    const counted = sessionStorage.getItem(STORAGE_KEY) === "yes";

    const response = await fetch("/api/counter", {
      method: counted ? "GET" : "POST",
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error("Counter API error");
    }

    const data = await response.json();

    if (typeof data.count !== "number") {
      throw new Error("Invalid counter data");
    }

    if (!counted) {
      sessionStorage.setItem(STORAGE_KEY, "yes");
    }

    // 7桁のゼロ埋め表示
    const formatted = String(data.count).padStart(7, "0");

    counter.textContent = formatted;
    counter.setAttribute(
      "aria-label",
      `アクセス数 ${data.count}回`
    );
  } catch (error) {
    console.error("Counter error:", error);
    counter.textContent = "-------";
    counter.setAttribute(
      "aria-label",
      "アクセス数を取得できませんでした"
    );
  }
});
