// =========================
// Data
// =========================
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to predict the future is to invent it.", category: "Inspiration" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" }
];

let lastQuote = JSON.parse(sessionStorage.getItem("lastQuoteData")) || null;
let lastCategory = localStorage.getItem("lastCategory") || "all";

// =========================
// Storage Helpers
// =========================
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function saveLastCategory(cat) {
  localStorage.setItem("lastCategory", cat);
}

// =========================
// Category Functions
// =========================
function getCategories() {
  return [...new Set(quotes.map(q => q.category))];
}

function populateCategories() {
  const select = document.getElementById("categoryFilter");
  select.innerHTML = `<option value="all">All Categories</option>`;
  getCategories().forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    select.appendChild(opt);
  });
  select.value = lastCategory; // restore last selected
}

// =========================
// Quote Functions
// =========================
function getRandomQuote(category) {
  let filtered = category && category !== "all"
    ? quotes.filter(q => q.category === category)
    : quotes;
  if (!filtered.length) return null;
  return filtered[Math.floor(Math.random() * filtered.length)];
}

function displayQuote(quote) {
  const display = document.getElementById("quoteDisplay");
  if (quote) {
    display.textContent = `${quote.text} (${quote.category})`;
    sessionStorage.setItem("lastQuoteData", JSON.stringify(quote));
  } else {
    display.textContent = "No quotes available for this category.";
  }
}

function newQuote() {
  const category = document.getElementById("categoryFilter").value;
  const quote = getRandomQuote(category);
  displayQuote(quote);
}

// =========================
// Filter Function
// =========================
function filterQuotes() {
  const category = document.getElementById("categoryFilter").value;
  saveLastCategory(category);
  const quote = getRandomQuote(category);
  displayQuote(quote);
}

// =========================
// Add Quote
// =========================
function addQuote() {
  const text = document.getElementById("quoteText").value.trim();
  const category = document.getElementById("quoteCategory").value.trim();
  if (!text || !category) {
    alert("Please enter both a quote and a category.");
    return;
  }
  quotes.push({ text, category });
  saveQuotes();
  populateCategories();
  document.getElementById("quoteText").value = "";
  document.getElementById("quoteCategory").value = "";
  alert("Quote added successfully!");
}

// =========================
// Import / Export
// =========================
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

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
        alert("Invalid file format.");
      }
    } catch {
      alert("Error parsing file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// =========================
// Init
// =========================
window.onload = function() {
  populateCategories();
  document.getElementById("newQuote").addEventListener("click", newQuote);
  document.getElementById("addQuote").addEventListener("click", addQuote);
  document.getElementById("categoryFilter").addEventListener("change", filterQuotes);
  document.getElementById("exportQuotes").addEventListener("click", exportToJsonFile);
  document.getElementById("importFile").addEventListener("change", importFromJsonFile);

  // Show last viewed quote or new one
  if (lastQuote) {
    displayQuote(lastQuote);
  } else {
    newQuote();
  }
};
