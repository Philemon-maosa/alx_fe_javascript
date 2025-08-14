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
    quoteDisplay.innerHTML = lastQuote.text;
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
  btn.addEventListener("click", showRandomQuote);
  document.body.appendChild(btn);
}

function createAddQuoteForm() {
  const formTitle = document.createElement("h3");
  formTitle.textContent = "Add New Quote";
  document.body.appendChild(formTitle);

  const quoteInput = document.createElement("input");
  quoteInput.type = "text";
  quoteInput.placeholder = "Quote text";
  quoteInput.id = "quoteText";
  document.body.appendChild(quoteInput);

  const categoryInput = document.createElement("input");
  categoryInput.type = "text";
  categoryInput.placeholder = "Category";
  categoryInput.id = "quoteCategory";
  document.body.appendChild(categoryInput);

  const addBtn = document.createElement("button");
  addBtn.textContent = "Add Quote";
  addBtn.addEventListener("click", () => {
    const text = quoteInput.value.trim();
    const category = categoryInput.value.trim();
    if (!text || !category) {
      alert("Please enter both quote text and category.");
      return;
    }
    quotes.push({ text, category });
    saveQuotes();
    updateCategoryOptions(document.getElementById("categorySelect"));
    quoteInput.value = "";
    categoryInput.value = "";
  });
  document.body.appendChild(addBtn);
}

function createImportExportButtons() {
  const exportBtn = document.createElement("button");
  exportBtn.textContent = "Export Quotes (JSON)";
  exportBtn.addEventListener("click", exportQuotes);
  document.body.appendChild(exportBtn);

  const importInput = document.createElement("input");
  importInput.type = "file";
  importInput.accept = ".json";
  importInput.addEventListener("change", importFromJsonFile);
  document.body.appendChild(importInput);
}

// =========================
// Main Functionality
// =========================
function newQuote() {
  const category = document.getElementById("categorySelect").value;
  const randomQuote = getRandomQuote(category);
  const display = document.getElementById("quoteDisplay");

  if (!randomQuote) {
    display.innerHTML = "No quotes available in this category.";
    return;
  }

  display.innerHTML = randomQuote.text;
  sessionStorage.setItem("lastQuoteData", JSON.stringify(randomQuote));
}

// Alias to
