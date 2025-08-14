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

// Alias for backwards compatibility
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

// ======== DOM Elements ========
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const categorySelect = document.createElement("select");
categorySelect.id = "categorySelect";
document.body.insertBefore(categorySelect, newQuoteBtn);

const addQuoteForm = cre
