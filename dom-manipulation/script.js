// Quotes array
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" }
];

// Session storage for last viewed quote
let lastViewedQuote = sessionStorage.getItem("lastViewedQuote") || null;

// Create UI dynamically
function createUI() {
  document.body.innerHTML = `
    <h1>Dynamic Quote Generator</h1>
    <div>
      <select id="categorySelect"></select>
      <button id="newQuote">Show New Quote</button>
    </div>
    <div id="quoteDisplay" style="margin: 10px 0; font-style: italic;"></div>

    <h2>Add a New Quote</h2>
    <input type="text" id="quoteText" placeholder="Enter quote" />
    <input type="text" id="quoteCategory" placeholder="Enter category" />
    <button id="addQuote">Add Quote</button>

    <h2>Import / Export</h2>
    <button id="exportQuotes">Export Quotes (JSON)</button>
    <input type="file" id="importFile" accept=".json" />
  `;
}

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Populate category dropdown
function populateCategories() {
  const categorySelect = document.getElementById("categorySelect");
  const categories = [...new Set(quotes.map(q => q.category))];
  categorySelect.innerHTML = `<option value="all">All Categories</option>` +
    categories.map(cat => `<option value="${cat}">${cat}</option>`).join("");
}

// Show random quote
function showRandomQuote() {
  const category = document.getElementById("categorySelect").value;
  const filteredQuotes = category === "all" ? quotes : quotes.filter(q => q.category === category);
  if (filteredQuotes.length === 0) {
    document.getElementById("quoteDisplay").innerText = "No quotes available for this category.";
    return;
  }
  const randomQuote = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
  document.getElementById("quoteDisplay").innerText = randomQuote.text;
  sessionStorage.setItem("lastViewedQuote", randomQuote.text);
}

// Add new quote
function addQuote() {
  const text = document.getElementById("quoteText").value.trim();
  const category = document.getElementById("quoteCategory").value.trim();
  if (!text || !category) {
    alert("Please fill in both fields.");
    return;
  }
  quotes.push({ text, category });
  saveQuotes();
  populateCategories();
  document.getElementById("quoteText").value = "";
  document.getElementById("quoteCategory").value = "";
  alert("Quote added!");
}

// Export quotes as JSON file
function exportQuotes() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

// Import quotes from JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid JSON format.");
      }
    } catch {
      alert("Error reading file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// Simulated server fetch
async function fetchServerQuotes() {
  // Simulate delay
  return new Promise(resolve => {
    setTimeout(() => {
      resolve([
        { text: "Server wisdom 1", category: "Motivation" },
        { text: "Server wisdom 2", category: "Life" }
      ]);
    }, 500);
  });
}

// Alias to match missing function calls
function fetchQuotesFromServer() {
  return fetchServerQuotes();
}

// Sync quotes with server (dummy merge)
async function syncWithServer() {
  const serverQuotes = await fetchQuotesFromServer();
  const newQuotes = serverQuotes.filter(sq =>
    !quotes.some(lq => lq.text === sq.text && lq.category === sq.category)
  );
  if (newQuotes.length > 0) {
    quotes.push(...newQuotes);
    saveQuotes();
    populateCategories();
    alert(`Synced ${newQuotes.length} new quotes from server.`);
  } else {
    alert("No new quotes found on server.");
  }
}

// Initialize app
function init() {
  createUI();
  populateCategories();
  if (lastViewedQuote) {
    document.getElementById("quoteDisplay").innerText = lastViewedQuote;
  }

  document.getElementById("newQuote").addEventListener("click", showRandomQuote);
  document.getElementById("addQuote").addEventListener("click", addQuote);
  document.getElementById("exportQuotes").addEventListener("click", exportQuotes);
  document.getElementById("importFile").addEventListener("change", importFromJsonFile);
}

// Run app
init();
