// =========================
// Data Handling
// =========================
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to predict the future is to invent it.", category: "Inspiration" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" }
];

let lastQuote = sessionStorage.getItem("lastQuote") || "";

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
  const filtered = category ? quotes.filter(q => q.category === category) : quotes;
  return filtered[Math.floor(Math.random() * filtered.length)];
}

// =========================
// UI Creation
// =========================
function createQuoteDisplay() {
  const quoteDisplay = document.createElement("div");
  quoteDisplay.id = "quoteDisplay";
  document.body.appendChild(quoteDisplay);

  if (lastQuote) {
    quoteDisplay.textContent = lastQuote;
  }

  return quoteDisplay;
}

function createAddQuoteForm() {
  const formTitle = document.createElement("h3");
  formTitle.textContent = "Add New Quote";

  const quoteInput = document.createEle
