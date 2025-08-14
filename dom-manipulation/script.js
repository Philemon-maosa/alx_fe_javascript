// =========================
// Data Handling
// =========================
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to predict the future is to invent it.", category: "Inspiration" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" }
];

let lastQuoteData = JSON.parse(sessionStorage.getItem("lastQuoteData")) || null;

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

  if (lastQuoteData) {
    quoteDisplay.innerHTML = lastQuoteData.text;
  }

  return quoteDisplay;
}

function createCategorySelect() {
  const select = document.createElement("select");
  select.id = "categorySelect";

  updateCategoryOptions(select);

  select.addEventListener("change", () => {
    sessionStorage.setItem("lastCategory", select.value);
    showRandomQuote();
  });

  document.body.appendChild(select);
  return select;
}

function updateCategoryOptions(selectElement) {
  selectElement.innerHTML = `<option value="">All Categories</option>`;
  getCategories().forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    selectElement.appendChild(opt);
  });

  // Restore last category if exists
  const lastCategory = sessionStorage.getItem("lastCategory");
  if (lastCategory) {
    selectElement.value = lastCategory;
  }
}

function createAddQuoteForm() {
  const formTitle = document.createElement("h3");
  formTitle.textContent = "Add New Quote";

  const quoteInput = document.createElement("input");
  quoteInput.type = "text";
  quoteInput.placeholder = "Enter quote";

  const categoryInput = document.createElement("input");
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter category";

  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";

  addButton.addEventListener("click", () => {
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
      alert("Please enter both a quote and a category.");
    }
  });

  document.body.appendChild(formTitle);
  document.body.appendChild(quoteInput);
  document.body.appendChild(categoryInput);
  document.body.appendChild(addButton);
}

function createButtons() {
  const showButton = document.createElement("button");
  showButton.textContent = "Show New Quote";
  showButton.addEventListener("click", showRandomQuote);

  const exportButton = document.createElement("button");
  exportButton.textContent = "Export Quotes (JSON)";
  exportButton.addEventListener("click", exportToJsonFile);

  const importInput = document.createElement("input");
  importInput.type = "file";
  importInput.accept = ".json";
  importInput.addEventListener("change", importFromJsonFile);

  document.body.appendChild(showButton);
  document.body.appendChild(exportButton);
  document.body.appendChild(importInput);
}

// =========================
// Main Functionalities
// =========================
function showRandomQuote() {
  const category = document.getElementById("categorySelect").value;
  const randomQuote = getRandomQuote(category);
  const display = document.getElementById("quoteDisplay");

  if (!randomQuote) {
    display.innerHTML = "No quotes available in this categ
