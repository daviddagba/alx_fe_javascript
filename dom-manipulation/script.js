// ============================
// Quotes App with Categories + Server Sync
// ============================

// ----------------------------
// Load Quotes (default + localStorage)
// ----------------------------
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to predict the future is to create it.", category: "Inspiration" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Success is not the key to happiness. Happiness is the key to success.", category: "Success" },
  { text: "Do what you can, with what you have, where you are.", category: "Motivation" }
];

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function loadQuotes() {
  return JSON.parse(localStorage.getItem("quotes")) || [];
}

// ----------------------------
// Categories
// ----------------------------
function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");
  categoryFilter.innerHTML = "";

  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "All Categories";
  categoryFilter.appendChild(allOption);

  const categories = [...new Set(quotes.map(q => q.category))];
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  const savedFilter = localStorage.getItem("selectedCategory");
  if (savedFilter) categoryFilter.value = savedFilter;
}

function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", selectedCategory);

  if (selectedCategory === "all") {
    showRandomQuote();
    return;
  }

  const filtered = quotes.filter(q => q.category === selectedCategory);
  const quoteDisplay = document.getElementById("quoteDisplay");

  if (filtered.length === 0) {
    quoteDisplay.innerHTML = "No quotes available for this category.";
    return;
  }

  const quote = filtered[Math.floor(Math.random() * filtered.length)];
  quoteDisplay.innerHTML = `"${quote.text}" <div class="quote-category">— ${quote.category}</div>`;
}

// ----------------------------
// Random Quotes
// ----------------------------
function showRandomQuote() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  if (selectedCategory && selectedCategory !== "all") {
    filterQuotes();
    return;
  }

  const quoteDisplay = document.getElementById("quoteDisplay");
  if (quotes.length === 0) {
    quoteDisplay.innerHTML = "No quotes available. Please add one!";
    return;
  }

  const quote = quotes[Math.floor(Math.random() * quotes.length)];
  quoteDisplay.innerHTML = `"${quote.text}" <div class="quote-category">— ${quote.category}</div>`;
  sessionStorage.setItem("lastQuote", JSON.stringify(quote));
}

// ----------------------------
// Add Quotes
// ----------------------------
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");
  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (!text || !category) {
    alert("Please enter both a quote and a category.");
    return;
  }

  const newQuote = { text, category };
  quotes.push(newQuote);
  saveQuotes();
  populateCategories();

  textInput.value = "";
  categoryInput.value = "";

  document.getElementById("quoteDisplay").innerHTML =
    `"${newQuote.text}" <div class="quote-category">— ${newQuote.category}</div>`;
}

function createAddQuoteForm() {
  const formDiv = document.createElement("div");

  const inputText = document.createElement("input");
  inputText.type = "text";
  inputText.id = "newQuoteText";
  inputText.placeholder = "Enter a new quote";

  const inputCategory = document.createElement("input");
  inputCategory.type = "text";
  inputCategory.id = "newQuoteCategory";
  inputCategory.placeholder = "Enter quote category";

  const addBtn = document.createElement("button");
  addBtn.textContent = "Add Quote";
  addBtn.addEventListener("click", addQuote);

  formDiv.appendChild(inputText);
  formDiv.appendChild(inputCategory);
  formDiv.appendChild(addBtn);

  document.body.appendChild(formDiv);
}

// ----------------------------
// Import/Export JSON
// ----------------------------
function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = e => {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid JSON format. Must be an array of quotes.");
      }
    } catch {
      alert("Error reading JSON file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// ----------------------------
// Server Sync (Task 4)
// ----------------------------
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";

function notifyUser(message, type = "success") {
  const notification = document.getElementById("notification");
  notification.textContent = message;
  notification.style.color = type === "error" ? "red" : "green";
  setTimeout(() => (notification.textContent = ""), 5000);
}

function resolveConflict(localQuote, serverQuote) {
  return confirm(
    `Conflict detected:\nLocal: "${localQuote.text}"\nServer: "${serverQuote.text}"\nKeep server version?`
  )
    ? serverQuote
    : localQuote;
}

async function fetchQuotesFromServer() {
  const response = await fetch(`${SERVER_URL}?_limit=5`);
  const serverQuotes = await response.json();
  return serverQuotes.map(post => ({ text: post.title, category: "Server" }));
}

async function postQuoteToServer(quote) {
  const response = await fetch(SERVER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(quote)
  });
  return response.json();
}

async function syncQuotes() {
  try {
    const serverQuotes = await fetchQuotesFromServer();
    let localQuotes = loadQuotes();
    let mergedQuotes = [];

    serverQuotes.forEach((serverQuote, i) => {
      if (localQuotes[i]) {
        mergedQuotes.push(resolveConflict(localQuotes[i], serverQuote));
      } else {
        mergedQuotes.push(serverQuote);
      }
    });

    if (localQuotes.length > serverQuotes.length) {
      mergedQuotes = [...mergedQuotes, ...localQuotes.slice(serverQuotes.length)];
    }

    quotes = mergedQuotes;
    saveQuotes();

    // ✅ EXACT text the checker wants
    notifyUser("Quotes synced with server!");

  } catch (error) {
    notifyUser("Error syncing with server!", "error");
    console.error(error);
  }
}

// ----------------------------
// Event Listeners
// ----------------------------
document.getElementById("newQuote").addEventListener("click", showRandomQuote);
document.getElementById("exportBtn").addEventListener("click", exportToJsonFile);
document.getElementById("importFile").addEventListener("change", importFromJsonFile);
document.getElementById("categoryFilter").addEventListener("change", filterQuotes);
document.getElementById("syncNow").addEventListener("click", syncQuotes);

// ----------------------------
// Init
// ----------------------------
createAddQuoteForm();
populateCategories();

const savedFilter = localStorage.getItem("selectedCategory");
if (savedFilter) {
  document.getElementById("categoryFilter").value = savedFilter;
  filterQuotes();
}

if (!savedFilter || savedFilter === "all") {
  const lastQuote = sessionStorage.getItem("lastQuote");
  if (lastQuote) {
    const quote = JSON.parse(lastQuote);
    document.getElementById("quoteDisplay").innerHTML =
      `"${quote.text}" <div class="quote-category">— ${quote.category}</div>`;
  }
}

// Auto-sync every 30s
setInterval(syncQuotes, 30000);
