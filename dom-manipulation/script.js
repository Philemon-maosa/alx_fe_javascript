// =========================
// Data Handling
// =========================
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to predict the future is to invent it.", category: "Inspiration" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" }
];

let lastQuote = JSON.parse(sessionStorage.getItem("lastQuoteData")) || null;

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
  return filtered.length ? filtered[Math.floor(Math.random() * filtered.length)] : null;
}

// =========================
// UI Creation
// =========================
function createQuoteDisplay() {
  const quoteDisplay = document.createElement("div");
  quoteDisplay.id = "quoteDisplay";
  document.body.appendChild(quoteDisplay);

  if (lastQuote) {
    quoteDisplay.innerHTML = `<strong>${lastQuote.text}</strong> <em>(${lastQuote.category})</em>`;
  }

  return quoteDisplay;
}

function createCategorySelect() {
  const label = document.createElement("label");
  label.textContent = "Select Category: ";
  document.body.appendChild(label);

  const select = document.createElement("select");
  select.id = "categorySelect";
  updateCategoryOptions(select);
  document.body.appendChild(select);
}

function updateCategoryOptions(selectElem) {
  selectElem.innerHTML = `<option value="">All</option>`;
  getCategories().forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    selectElem.appendChild(opt);
  });
}

function createNewQuoteButton() {
  const btn = document.createElement("button");
  btn.id = "newQuote";
  btn.textContent = "Show New Quote";
  btn.addEventListener("click", newQuote);
  document.body.appendChild(btn);
}

function createAddQuoteForm() {
  const formTitle = document.createElement("h3");
  formTitle.textContent = "Add New Quote";
  document.body.appendChild(formTitle);

  const quoteInput = document.createElement("input");
  quoteInput.type = "text";
  quoteInput.placeholder = "Enter quote text";
  quoteInput.id = "quoteText";
  document.body.appendChild(quoteInput);

  const categoryInput = document.createElement("input");
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter category";
  categoryInput.id = "quoteCategory";
  document.body.appendChild(categoryInput);

  const addBtn = document.createElement("button");
  addBtn.textContent = "Add Quote";
  addBtn.addEventListener("click", () => {
    const text = quoteInput.value.trim();
    const category = categoryInput.value.trim();
    if (text && category) {
      quotes.push({ text, category });
      saveQuotes();
      updateCategoryOptions(document.getElementById("categorySelect"));
      quoteInput.value = "";
      categoryInput.value = "";
      alert("Quote added!");
    } else {
      alert("Please enter both text and category.");
    }
  });
  document.body.appendChild(addBtn);
}

function createImportExportButtons() {
  const exportBtn = document.createElement("button");
  exportBtn.textContent = "Export Quotes (JSON)";
  exportBtn.addEventListener("click", exportToJsonFile);
  document.body.appendChild(exportBtn);

  const importInput = document.createElement("input");
  importInput.type = "file";
  importInput.accept = ".json";
  importInput.addEventListener("change", importFromJsonFile);
  document.body.appendChild(importInput);
}

// =========================
// Core Functionality
// =========================
function newQuote() {
  const category = document.getElementById("categorySelect").value;
  const quote = getRandomQuote(category);
  const quoteDisplay = document.getElementById("quoteDisplay");

  if (quote) {
    quoteDisplay.innerHTML = `<strong>${quote.text}</strong> <em>(${quote.category})</em>`;
    lastQuote = quote;
    sessionStorage.setItem("lastQuoteData", JSON.stringify(quote));
  } else {
    quoteDisplay.innerHTML = "No quotes available for this category.";
  }
}

function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href
