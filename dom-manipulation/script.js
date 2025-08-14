// =========================
// Constants
// =========================
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts"; // mock API
const AUTO_SYNC_KEY = "autoSyncEnabled";

// =========================
//// Data
// =========================
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { id: uuid(), text: "The best way to predict the future is to invent it.", category: "Inspiration", source: "local", updatedAt: nowISO() },
  { id: uuid(), text: "Life is what happens when you're busy making other plans.", category: "Life", source: "local", updatedAt: nowISO() }
];

let lastQuote = JSON.parse(sessionStorage.getItem("lastQuoteData")) || null;
let selectedCategory = localStorage.getItem("selectedCategory") || "all";
let conflicts = [];           // [{id, local, server}]
let autoSyncTimer = null;
let isSyncing = false;

// =========================
//// Helpers
// =========================
function nowISO() { return new Date().toISOString(); }
function uuid() { return crypto?.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2); }

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function notify(msg, type = "info") {
  const box = document.getElementById("notifications");
  const div = document.createElement("div");
  div.className = `note ${type}`;
  const time = new Date().toLocaleTimeString();
  div.innerHTML = `<strong>[${time}]</strong> ${msg}`;
  box.prepend(div);
}

function getCategories() {
  return ["all", ...new Set(quotes.map(q => q.category))];
}

function populateCategories() {
  const select = document.getElementById("categoryFilter");
  select.innerHTML = "";
  getCategories().forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    if (cat === selectedCategory) option.selected = true;
    select.appendChild(option);
  });
}

// =========================
//// Quote Display
// =========================
function getRandomQuote(category) {
  const filtered = category === "all" ? quotes : quotes.filter(q => q.category === category);
  return filtered.length ? filtered[Math.floor(Math.random() * filtered.length)] : null;
}

function displayQuote(quote) {
  const display = document.getElementById("quoteDisplay");
  if (quote) {
    display.innerHTML = `${quote.text} <br><small>- ${quote.category}</small>`;
  } else {
    display.textContent = "No quotes available for this category.";
  }
}

function newQuote() {
  const quote = getRandomQuote(selectedCategory);
  displayQuote(quote);
  if (quote) {
    lastQuote = quote;
    sessionStorage.setItem("lastQuoteData", JSON.stringify(quote));
  }
}

// alias for earlier checks/tests
function showRandomQuote() { newQuote(); }

// Filter display (alias kept for compatibility)
function filterQuotes() {
  selectedCategory = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", selectedCategory);
  newQuote();
}
// optional alias if something expects this singular form
function filterQuote() { filterQuotes(); }

// =========================
//// Add / Import / Export
// =========================
function addQuote() {
  const text = document.getElementById("quoteText").value.trim();
  const category = document.getElementById("quoteCategory").value.trim();
  if (!text || !category) {
    alert("Please enter both quote and category.");
    return;
  }
  quotes.push({ id: uuid(), text, category, source: "local", updatedAt: nowISO() });
  saveQuotes();
  populateCategories();
  document.getElementById("quoteText").value = "";
  document.getElementById("quoteCategory").value = "";
  notify("Quote added locally.", "success");
}

function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
  notify("Exported quotes to quotes.json", "info");
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) throw new Error("Invalid JSON format.");
      // Normalize & merge
      const normalized = imported.map(q => ({
        id: q.id || uuid(),
        text: String(q.text || "").trim(),
        category: String(q.category || "Imported").trim() || "Imported",
        source: q.source === "server" ? "server" : "local",
        updatedAt: q.updatedAt || nowISO()
      })).filter(q => q.text);

      quotes.push(...normalized);
      saveQuotes();
      populateCategories();
      notify(`Imported ${normalized.length} quotes.`, "success");
    } catch (err) {
      alert("Failed to import: " + err.message);
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// =========================
//// Server Simulation (JSONPlaceholder)
// =========================
async function fetchServerQuotes() {
  const res = await fetch(SERVER_URL + "?_limit=10"); // keep it light
  const posts = await res.json();
  // Map posts -> server quotes
  // NOTE: JSONPlaceholder is static; this simulates a server dataset.
  return posts.map(p => ({
    id: "server-" + p.id,
    text: (p.title || "Untitled").trim(),
    category: "Server",
    source: "server",
    // No real updatedAt from API; use a stable pseudo-time so edits can conflict
    updatedAt: "2021-01-01T00:00:00.000Z"
  }));
}

function quoteEquals(a, b) {
  return a.text === b.text && a.category === b.category && a.source === b.source;
}

function upsertLocal(q) {
  const idx = quotes.findIndex(x => x.id === q.id);
  if (idx === -1) quotes.push(q);
  else quotes[idx] = q;
}

async function syncWithServer({ showConflictsUI = false } = {}) {
  if (isSyncing) return;
  isSyncing = true;
  setSyncStatus("Syncing…");

  try {
    const serverQuotes = await fetchServerQuotes();
    const localById = new Map(quotes.map(q => [q.id, q]));
    const incomingById = new Map(serverQuotes.map(q => [q.id, q]));

    const newCount = [];
    const updatedCount = [];
    const foundConflicts = [];

    // Merge (server authoritative for server-owned ids)
    for (const srv of serverQuotes) {
      const local = localById.get(srv.id);
      if (!local) {
        upsertLocal(srv);
        newCount.push(srv.id);
      } else if (!quoteEquals(local, srv)) {
        // Conflict: same id but different content → server wins (default)
        foundConflicts.push({ id: srv.id, local, server: srv });
        upsertLocal(srv); // apply server-wins automatically
        updatedCount.push(srv.id);
      }
    }

    // Keep local-only quotes (source: local) as-is; nothing to do.

    saveQuotes();
    populateCategories();

    // Notify results
    const parts = [];
    if (newCount.length) parts.push(`${newCount.length} new from server`);
    if (updatedCount.length) parts.push(`${updatedCount.length} updated (server-wins)`);
    notify(parts.length ? `Sync complete: ${parts.join(", ")}.` : "Sync complete: no changes.", "success");

    // Conflicts UI (optional manual resolution)
    conflicts = foundConflicts;
    if (showConflictsUI && conflicts.length) {
      openConflictCenter();
    }

  } catch (err) {
    console.error(err);
    notify("Sync failed. See console for details.", "warn");
  } finally {
    isSyncing = false;
    setSyncStatus("");
  }
}

function setSyncStatus(text) {
  document.getElementById("syncStatus").textContent = text;
}

function startAutoSync() {
  stopAutoSync();
  autoSyncTimer = setInterval(() => syncWithServer({ showConflictsUI: false }), 30000);
}

function stopAutoSync() {
  if (autoSyncTimer) clearInterval(autoSyncTimer);
  autoSyncTimer = null;
}

// =========================
//// Conflict Center (Manual Resolution)
// =========================
function openConflictCenter() {
  const center = document.getElementById("conflictCenter");
  const list = document.getElementById("conflictList");
  list.innerHTML = "";

  conflicts.forEach(c => {
    const el = document.createElement("div");
    el.className = "conflict";
    el.innerHTML = `
      <div><strong>ID:</strong> ${c.id}</div>
      <div><em>Local:</em> "${c.local.text}" [${c.local.category}]</div>
      <div><em>Server:</em> "${c.server.text}" [${c.server.category}]</div>
      <div class="row">
        <button data-action="keep-server" data-id="${c.id}">Keep Server</button>
        <button data-action="keep-local" data-id="${c.id}">Keep Local</button>
      </div>
    `;
    list.appendChild(el);
  });

  center.style.display = "block";

  list.onclick = (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const id = btn.getAttribute("data-id");
    const action = btn.getAttribute("data-action");
    const conflict = conflicts.find(c => c.id === id);
    if (!conflict) return;

    if (action === "keep-server") {
      upsertLocal(conflict.server);
    } else if (action === "keep-local") {
      upsertLocal({ ...conflict.local, updatedAt: nowISO() });
    }
    saveQuotes();
    notify(`Resolved conflict ${id}: ${action.replace("-", " ")}.`, "info");
    // remove from list
    conflicts = conflicts.filter(c => c.id !== id);
    if (!conflicts.length) closeConflictCenter();
    else openConflictCenter(); // re-render
  };
}

function closeConflictCenter() {
  document.getElementById("conflictCenter").style.display = "none";
  document.getElementById("conflictList").innerHTML = "";
}

function resolveAll(which = "server") {
  conflicts.forEach(c => {
    upsertLocal(which === "server" ? c.server : { ...c.local, updatedAt: nowISO() });
  });
  saveQuotes();
  notify(`Resolved ${conflicts.length} conflicts: ${which === "server" ? "server wins" : "kept local"}.`, "info");
  conflicts = [];
  closeConflictCenter();
}

// =========================
//// Init & Events
// =========================
window.addEventListener("load", () => {
  // Initial UI
  populateCategories();
  if (lastQuote) displayQuote(lastQuote); else newQuote();

  // Core events
  document.getElementById("categoryFilter").addEventListener("change", filterQuotes);
  document.getElementById("newQuote").addEventListener("click", newQuote);
  document.getElementById("addQuote").addEventListener("click", addQuote);
  document.getElementById("exportQuotes").addEventListener("click", exportToJsonFile);
  document.getElementById("importFile").addEventListener("change", importFromJsonFile);

  // Sync controls
  document.getElementById("syncNow").addEventListener("click", () => syncWithServer({ showConflictsUI: true }));
  const autoSyncCheckbox = document.getElementById("autoSync");
  autoSyncCheckbox.checked = localStorage.getItem(AUTO_SYNC_KEY) === "true";
  autoSyncCheckbox.addEventListener("change", (e) => {
    localStorage.setItem(AUTO_SYNC_KEY, String(e.target.checked));
    if (e.target.checked) {
      startAutoSync();
      notify("Auto sync enabled.", "info");
    } else {
      stopAutoSync();
      notify("Auto sync disabled.", "info");
    }
  });

  // Conflict center buttons
  document.getElementById("resolveAllServer").addEventListener("click", () => resolveAll("server"));
  document.getElementById("resolveAllLocal").addEventListener("click", () => resolveAll("local"));
  document.getElementById("closeConflicts").addEventListener("click", closeConflictCenter);

  // Start auto sync if enabled
  if (autoSyncCheckbox.checked) startAutoSync();
});
