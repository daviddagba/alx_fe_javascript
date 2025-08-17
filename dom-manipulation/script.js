// ----------------------------
// Quotes Array (load from localStorage if available)
// ----------------------------
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to predict the future is to create it.", category: "Inspiration" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Success is not the key to happiness. Happiness is the key to success.", category: "Success" },
  { text: "Do what you can, with what you have, where you are.", category: "Motivation" }
];

// ----------------------------
// Save Quotes to Local Storage
// ----------------------------
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// ----------------------------
// Populate Categories Dynamically
// ----------------------------
function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");
  categoryFilter.innerHTML = "";

  // Always add "All Categories" option
  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "All Categories";
  categoryFilter.appendChild(allOption);

  // Get unique categories
  const categories = [...new Set(quotes.map(q => q.category))];

  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  // Restore last selected filter from localStorage
  const savedFilter = localStorage.getItem("selectedCategory");
  if (savedFilter) {
    categoryFilter.value = savedFilter;
  }
}

// ----------------------------
// Filter Quotes Based on Category
// ----------------------------
function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", selectedCategory); // persist filter choice

  if (selectedCategory === "all") {
    showRandomQuote(); // fallback to normal random mode
    return;
  }

  // Filter quotes
  const filtered = quotes.filter(q => q.category === selectedCategory);
  const quoteDisplay = document.getElementById("quoteDisplay");

  if (filtered.length === 0) {
    quoteDisplay.innerHTML = "No quotes available for this category.";
    return;
  }

  // Show random from selected category
  const randomIndex = Math.floor(Math.random() * filtered.length);
  const quote = filtered[randomIndex];

  quoteDisplay.innerHTML = `"${quote.text}" <div class="quote-category">— ${quote.category}</div>`;
}

// ----------------------------
// Show Random Quote (unfiltered)
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

  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];

  quoteDisplay.innerHTML = `"${quote.text}" <div class="quote-category">— ${quote.category}</div>`;
  sessionStorage.setItem("lastQuote", JSON.stringify(quote)); // save last viewed
}

// ----------------------------
// Add a New Quote
// ----------------------------
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");
  const quoteDisplay = document.getElementById("quoteDisplay");

  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (!text || !category) {
    alert("Please enter both a quote and a category.");
    return;
  }

  const newQuote = { text, category };
  quotes.push(newQuote);

  saveQuotes();
  populateCategories(); // ✅ update dropdown with new category if needed

  textInput.value = "";
  categoryInput.value = "";

  quoteDisplay.innerHTML = `"${newQuote.text}" <div class="quote-category">— ${newQuote.category}</div>`;
}

// ----------------------------
// Create Add Quote Form
// ----------------------------
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
// Export & Import JSON
// ----------------------------
function exportToJsonFile() {
  const jsonData = JSON.stringify(quotes, null, 2);
  const blob = new Blob([jsonData], { type: "application/json" });
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
  fileReader.onload = function (e) {
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
    } catch (err) {
      alert("Error reading JSON file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// ----------------------------
// Event Listeners
// ----------------------------
document.getElementById("newQuote").addEventListener("click", showRandomQuote);
document.getElementById("exportBtn").addEventListener("click", exportToJsonFile);
document.getElementById("importFile").addEventListener("change", importFromJsonFile);
document.getElementById("categoryFilter").addEventListener("change", filterQuotes);

// ----------------------------
// Init
// ----------------------------
createAddQuoteForm();
populateCategories();

// Restore last filter
const savedFilter = localStorage.getItem("selectedCategory");
if (savedFilter) {
  document.getElementById("categoryFilter").value = savedFilter;
  filterQuotes();
}

// Restore last quote (if no filter applied)
if (!savedFilter || savedFilter === "all") {
  const lastQuote = sessionStorage.getItem("lastQuote");
  if (lastQuote) {
    const quote = JSON.parse(lastQuote);
    document.getElementById("quoteDisplay").innerHTML =
      `"${quote.text}" <div class="quote-category">— ${quote.category}</div>`;
  }
}

// ===== Simulated Server Sync (Task 4) =====

// Example server URL (using JSONPlaceholder posts as mock quotes)
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";

// Notify user
function notifyUser(message, type = "info") {
  const notificationDiv = document.getElementById("notification");
  notificationDiv.textContent = message;
  notificationDiv.style.color = type === "error" ? "red" : "green";
  setTimeout(() => { notificationDiv.textContent = ""; }, 5000);
}

// Conflict resolution (manual prompt)
function resolveConflict(localQuote, serverQuote) {
  return confirm(
    `Conflict detected:\nLocal: "${localQuote.text}"\nServer: "${serverQuote.text}"\nKeep server version?`
  )
    ? serverQuote
    : localQuote;
}

// Sync quotes from server
async function syncWithServer() {
  try {
    const response = await fetch(SERVER_URL);
    const serverQuotes = await response.json();

    // Convert server data to quote format (limit to first 5 for demo)
    const formattedServerQuotes = serverQuotes.slice(0, 5).map(post => ({
      text: post.title,
      category: "Server"
    }));

    let localQuotes = loadQuotes();
    let mergedQuotes = [];

    // Handle conflicts manually
    formattedServerQuotes.forEach((serverQuote, i) => {
      if (localQuotes[i]) {
        mergedQuotes.push(resolveConflict(localQuotes[i], serverQuote));
      } else {
        mergedQuotes.push(serverQuote);
      }
    });

    // Add remaining local quotes (if any)
    if (localQuotes.length > formattedServerQuotes.length) {
      mergedQuotes = [...mergedQuotes, ...localQuotes.slice(formattedServerQuotes.length)];
    }

    // Save merged quotes locally
    quotes = mergedQuotes;
    saveQuotes();

    notifyUser("Data synced with server (conflicts resolved).");

  } catch (error) {
    notifyUser("Error syncing with server!", "error");
    console.error(error);
  }
}

// Event listener for manual sync
document.getElementById("syncNow").addEventListener("click", syncWithServer);

// Auto-sync every 30 seconds
setInterval(syncWithServer, 30000);
