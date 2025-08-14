let quotes = JSON.parse(localStorage.getItem("quotes")) || {
  Inspiration: [
    "The best way to get started is to quit talking and begin doing.",
    "Dream big and dare to fail."
  ],
  Humor: [
    "I'm not arguing, I'm just explaining why I'm right.",
    "Why don’t skeletons fight each other? They don’t have the guts."
  ]
};

const body = document.body;

const categoryLabel = document.createElement("label");
categoryLabel.textContent = "Choose a category: ";
categoryLabel.setAttribute("for", "categorySelect");

const categorySelect = document.createElement("select");
categorySelect.id = "categorySelect";

body.insertBefore(categoryLabel, document.getElementById("quoteDisplay"));
body.insertBefore(categorySelect, document.getElementById("quoteDisplay"));

const hr = document.createElement("hr");

const formTitle = document.createElement("h3");
formTitle.textContent = "Add New Quote";

const quoteInput = document.createElement("input");
quoteInput.type = "text";
quoteInput.id = "newQuoteText";
quoteInput.placeholder = "Enter your quote";

const categoryInput = document.createElement("input");
categoryInput.type = "text";
categoryInput.id = "newQuoteCategory";
categoryInput.placeholder = "Enter category";

const addQuoteBtn = document.createElement("button");
addQuoteBtn.id = "addQuote";
addQuoteBtn.textContent = "Add Quote";

body.appendChild(hr);
body.appendChild(formTitle);
body.appendChild(quoteInput);
body.appendChild(categoryInput);
body.appendChild(addQuoteBtn);

function populateCategories() {
  categorySelect.innerHTML = "";
  Object.keys(quotes).forEach(category => {
    let option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  });
}

function showRandomQuote() {
  let category = categorySelect.value;
  let categoryQuotes = quotes[category];
  if (categoryQuotes && categoryQuotes.length > 0) {
    let randomIndex = Math.floor(Math.random() * categoryQuotes.length);
    document.getElementById("quoteDisplay").textContent = categoryQuotes[randomIndex];
  } else {
    document.getElementById("quoteDisplay").textContent = "No quotes available in this category.";
  }
}

function addNewQuote() {
  let text = quoteInput.value.trim();
  let category = categoryInput.value.trim();

  if (!text || !category) {
    alert("Please enter both a quote and category.");
    return;
  }

  if (!quotes[category]) {
    quotes[category] = [];
  }
  quotes[category].push(text);

  localStorage.setItem("quotes", JSON.stringify(quotes));

  quoteInput.value = "";
  categoryInput.value = "";

  populateCategories();
  alert("Quote added successfully!");
}

document.getElementById("newQuote").addEventListener("click", showRandomQuote);
addQuoteBtn.addEventListener("click", addNewQuote);

populateCategories();
showRandomQuote();
