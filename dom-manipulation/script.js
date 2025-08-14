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
  btn.addEventListener("click", newQuote);
  document.body.appendChild(btn);
}

function createAddQuoteForm() {
  const formTitle = document.createElement("h3");
  formTitle.textContent = "Add New Quote";
  document.body.appendChild(formTitle);

  const quoteInput = document.createElement("input");
  quoteInput.type = "text";
  quoteInput.placeholder =
