// =========================
// Data
// =========================
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to predict the future is to invent it.", category: "Inspiration" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" }
];

let lastQuote = JSON.parse(sessionStorage.getItem("lastQuoteData")) || null;
let selectedCategory = localStorage.getItem("selectedCategory") || "all";

// =========================
// Save to Local Storage
// =========================
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// =========================
// Category Helpers
// =========================
function getCategories() {
  return ["all", ...new Set(quotes.map(q => q.category))];
}

function updateCategoryFilter() {
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
// Quote Functions
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

// =========================
// Filtering Function
// =========================
function filterQuotes() {
  selectedCategory = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", selectedCategory);
  newQuote();
}

// =========================
// Event Handlers
// =========================
document.getElementById("categoryFilter").addEventListener("change", filterQuotes);

document.getElementById("newQuote").addEventListener("click", newQuote);

document.getElementById("addQuote").addEventListener("click", function () {
  const text = document.getElementById("quoteText").value.trim();
  const category = document.getElementById("quoteCategory").value.trim();
  if (text && category) {
    quotes.push({ text, category });
    saveQuotes();
    updateCategoryFilter();
    document.getElementById("quoteText").value = "";
    document.getElementById("quoteCategory").value = "";
    alert("Quote added successfully!");
  } else {
    alert("Please enter both quote and category.");
  }
});

document.getElementById("exportQuotes").addEventListener("click", function () {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
});

document.getElementById("importFile").addEventListener("change", function (event) {
  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes = importedQuotes;
        saveQuotes();
        updateCategoryFilter();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid file format.");
      }
    } catch {
      alert("Error reading file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
});

// =========================
// Init
// =========================
updateCategoryFilter();
if (lastQuote) {
  displayQuote(lastQuote);
} else {
  newQuote();
}
