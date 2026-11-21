(() => {
  "use strict";
  const projects = Array.isArray(window.DEVLOG_DATA) ? window.DEVLOG_DATA : [];
  const search = document.getElementById("project-search");
  const list = document.getElementById("project-list");
  const entries = document.getElementById("project-entries");
  const empty = document.getElementById("empty-message");
  const count = document.getElementById("project-count");

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function formatDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    return value.replace(/-/g, ".");
  }
  function buildList(projectsToShow) {
    list.replaceChildren();
    for (const p of projectsToShow) {
      const a = el("a", "project-link");
      a.href = `#${p.id}`;
      a.append(el("span", "project-icon", p.icon || "📁"));
      const text = el("span", "project-link-text");
      text.append(el("span", "project-link-title", p.name));
      text.append(el("span", "project-link-subtitle", p.status || ""));
      a.append(text);
      a.addEventListener("click", () => {
        const target = document.getElementById(p.id);
        if (target) target.open = true;
      });
      list.append(a);
    }
    empty.hidden = projectsToShow.length !== 0;
    count.textContent = `${projectsToShow.length}件`;
  }
  function renderDetails(p) {
    const details = el("details", "project-details");
    details.id = p.id;
    const summary = el("summary");
    summary.append(el("span", "project-icon", p.icon || "📁"));
    const heading = el("span", "project-heading");
    heading.append(el("span", "project-link-title", p.name));
    heading.append(el("small", "", p.status || ""));
    summary.append(heading);
    details.append(summary);

    const body = el("div", "project-body");
    if (p.description) {
      body.append(el("p", "project-description", p.description));
    }
    if (p.url) {
      const link = el("a", "app-link", "ツールを開く ↗");
      link.href = p.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      body.append(link);
    } else if (p.status !== "新規受付終了") {
      body.append(el("p", "no-data", "ツールは公開準備中です。"));
    }
    body.append(el("h3", "block-title", "今後の課題"));
    if (p.tasks?.length) {
      const ul = el("ul", "todo-list");
      for (const task of p.tasks) {
        const li = el("li");
        li.append(el("span", task.done ? "todo-state done" : "todo-state", task.done ? "☑ 完了" : "□ 未完了"));
        li.append(document.createTextNode(task.text));
        ul.append(li);
      }
      body.append(ul);
    } else {
      body.append(el("p", "no-data", "課題はまだ登録されていません。"));
    }
    body.append(el("h3", "block-title", "日付別の開発記録"));
    const logs = [...(p.logs || [])].sort((a, b) => b.date.localeCompare(a.date));
    if (!logs.length) {
      body.append(el("p", "no-data", "開発記録はこれから追加します。"));
    } else {
      for (const item of logs) {
        const article = el("article", "log");
        const time = el("time", "", formatDate(item.date));
        time.dateTime = item.date;
        article.append(time, el("h4", "", item.title), el("p", "", item.body));
        body.append(article);
      }
    }
    details.append(body);
    return details;
  }
  for (const project of projects) entries.append(renderDetails(project));
  function updateSearch() {
    const query = search.value.trim().toLocaleLowerCase("ja");
    buildList(projects.filter(p => `${p.name} ${p.description || ""}`.toLocaleLowerCase("ja").includes(query)));
  }
  search.addEventListener("input", updateSearch);
  updateSearch();
  function openFromHash() {
    const id = decodeURIComponent(location.hash.slice(1));
    const target = projects.some(p => p.id === id) ? document.getElementById(id) : null;
    if (target) target.open = true;
  }
  window.addEventListener("hashchange", openFromHash);
  openFromHash();
})();
