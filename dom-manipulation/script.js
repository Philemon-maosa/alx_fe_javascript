// =========================
// Data Handling
// =========================
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to predict the future is to invent it.", category: "Inspiration" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" }
];

let lastQuote = JSON.parse(sessionStorage.getItem("lastQuoteData")) || null;
let selectedCategory = localStorage.getItem("selectedCategory") || "all";

// =========================
// Utility Functions
// =========================
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function getCategories() {
  return [...new Set(quotes.map(q => q.category))];
}

function getRandomQuote(category) {
  const filtered = category && category !== "all" ? quotes.filter(q => q.category === category) : quotes;
  return filtered.length ? filtered[Math.floor(Math.random() * filtered.length)] : null;
}

// =========================
// UI Creation
// =========================
function createQuoteDisplay() {
  const quoteDisplay = document.getElementById("quoteDisplay");
  if (lastQuote) {
    quoteDisplay.innerHTML = `${lastQuote.text} <br><small>- ${lastQuote.category}</small>`;
  }
}

function createCategoryFilter() {
  const select = document.getElementById("categoryFilter");
  select.innerHTML = `<option value="all">All Categories</option>`;
  getCategories().forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    if (cat === selectedCategory) opt.selected = true;
    select.appendChild(opt);
  });
}

function filterQuotes() {
  const select = document.getElementById("categoryFilter");
  selectedCategory = select.value;
  localStorage.setItem("selectedCategory", selectedCategory);
  newQuote();
}

function createNewQuoteButton() {
  document.getElementById("newQuote").addEventListener("click", newQuote);
}

function createAddQuoteForm() {
  const form = document.getElementById("addQuoteForm");
  form.addEventListener("submit", e => {
    e.preventDefault();
    const text = document.getElementById("quoteText").value.trim();
    const category = document.getElementById("quoteCategory").value.trim();
    if (text && category) {
      quotes.push({ text, category });
      saveQuotes();
      createCategoryFilter();
      form.reset();
      alert("Quote added successfully!");
    }
  });
}

// =========================
// Quote Display
// =========================
function newQuote() {
  const quote = getRandomQuote(selectedCategory);
  if (!quote) {
    document.getElementById("quoteDisplay").innerHTML = "No quotes available for this category.";
    return;
  }
  document.getElementById("quoteDisplay").innerHTML = `${quote.text} <br><small>- ${quote.category}</small>`;
  lastQuote = quote;
  sessionStorage.setItem("lastQuoteData", JSON.stringify(quote));
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
  a.click();
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        createCategoryFilter();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid file format.");
      }
    } catch {
      alert("Error reading file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// =========================
// Init
// =========================
window.onload = function() {
  createQuoteDisplay();
  createCategoryFilter();
  createNewQuoteButton();
  createAddQuoteForm();
};
