// ======== Global Data ========
let quotes = [];
let categories = [];

// ======== Local Storage Handling ========
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function loadQuotes() {
  const storedQuotes = localStorage.getItem("quotes");
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  }
}

function saveCategories() {
  localStorage.setItem("categories", JSON.stringify(categories));
}

function loadCategories() {
  const storedCategories = localStorage.getItem("categories");
  if (storedCategories) {
    categories = JSON.parse(storedCategories);
  }
}

// ======== Session Storage Handling ========
function saveLastViewedQuote(quote) {
  sessionStorage.setItem("lastViewedQuote", JSON.stringify(quote));
}

function getLastViewedQuote() {
  const quote = sessionStorage.getItem("lastViewedQuote");
  return quote ? JSON.parse(quote) : null;
}

// ======== Server Fetching ========
async function fetchServerQuotes() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts");
    const data = await response.json();
    return data.slice(0, 10).map(post => ({
      text: post.title,
      category: "Server"
    }));
  } catch (error) {
    console.error("Error fetching server quotes:", error);
    return [];
  }
}

function fetchQuotesFromServer() {
  return fetchServerQuotes();
}

// ======== Server Sending (POST) ========
async function sendQuoteToServer(quote) {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      body: JSON.stringify(quote),
      headers: {
        "Content-Type": "application/json"
      }
    });

    const data = await response.json();
    console.log("Quote successfully sent to server:", data);
  } catch (error) {
    console.error("Error sending quote to server:", error);
  }
}

// ======== Sync Quotes ========
async function syncQuotes() {
  const serverQuotes = await fetchServerQuotes();
  quotes.push(...serverQuotes);
  saveQuotes();
  renderCategoryOptions();
  console.log("Quotes synced with server!");
}

// ======== DOM Elements ========
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");

const categorySelect = document.createElement("select");
categorySelect.id = "categorySelect";
document.body.insertBefore(categorySelect, newQuoteBtn);

// ======== DOM Functions ========
function renderCategoryOptions() {
  categorySelect.innerHTML = "";
  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  });
}

function showRandomQuote() {
  const selectedCategory = categorySelect.value;
  const filteredQuotes = selectedCategory
    ? quotes.filter(q => q.category === selectedCategory)
    : quotes;

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes available in this category.";
    return;
  }

  const randomQuote = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
  quoteDisplay.textContent = `"${randomQuote.text}" - ${randomQuote.category}`;
  saveLastViewedQuote(randomQuote);
}

function createAddQuoteForm() {
  const form = document.createElement("form");

  const quoteInput = document.createElement("input");
  quoteInput.type = "text";
  quoteInput.placeholder = "Enter quote";
  form.appendChild(quoteInput);

  const categoryInput = document.createElement("input");
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter category";
  form.appendChild(categoryInput);

  const submitBtn = document.createElement("button");
  submitBtn.textContent = "Add Quote";
  form.appendChild(submitBtn);

  form.addEventListener("submit", event => {
    event.preventDefault();
    const newQuote = {
      text: quoteInput.value,
      category: categoryInput.value
    };
    quotes.push(newQuote);

    if (!categories.includes(newQuote.category)) {
      categories.push(newQuote.category);
      saveCategories();
      renderCategoryOptions();
    }

    saveQuotes();
    sendQuoteToServer(newQuote);

    quoteInput.value = "";
    categoryInput.value = "";
  });

  document.body.appendChild(form);
}

// ======== Import / Export JSON ========
function exportQuotesToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();

  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    const importedQuotes = JSON.parse(e.target.result);
    quotes.push(...importedQuotes);

    importedQuotes.forEach(q => {
      if (!categories.includes(q.category)) {
        categories.push(q.category);
      }
    });

    saveQuotes();
    saveCategories();
    renderCategoryOptions();
    alert("Quotes imported successfully!");
  };
  fileReader.readAsText(event.target.files[0]);
}

// ======== Init ========
loadQuotes();
loadCategories();
renderCategoryOptions();
createAddQuoteForm();

newQuoteBtn.addEventListener("click", showRandomQuote);

const exportBtn = document.createElement("button");
exportBtn.textContent = "Export Quotes";
exportBtn.addEventListener("click", exportQuotesToJsonFile);
document.body.appendChild(exportBtn);

const importInput = document.createElement("input");
importInput.type = "file";
importInput.accept = ".json";
importInput.addEventListener("change", importFromJsonFile);
document.body.appendChild(importInput);

syncQuotes();

const lastViewed = getLastViewedQuote();
if (lastViewed) {
  quoteDisplay.textContent = `"${lastViewed.text}" - ${lastViewed.category}`;
}

setInterval(syncQuotes, 60000);