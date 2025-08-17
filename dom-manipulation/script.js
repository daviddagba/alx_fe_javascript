// Initial Quotes Array
let quotes = [
  { text: "The best way to predict the future is to create it.", category: "Inspiration" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Success is not the key to happiness. Happiness is the key to success.", category: "Success" },
  { text: "Do what you can, with what you have, where you are.", category: "Motivation" }
];

// DOM Elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const addQuoteBtn = document.getElementById("addQuoteBtn");
const newQuoteText = document.getElementById("newQuoteText");
const newQuoteCategory = document.getElementById("newQuoteCategory");

// Function to show random quote
function showRandomQuote() {
  if (quotes.length === 0) {
    quoteDisplay.innerHTML = "No quotes available. Please add one!";
    return;
  }
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  quoteDisplay.innerHTML = `
    "${quote.text}" 
    <div class="quote-category">— ${quote.category}</div>
  `;
}

// Function to add a new quote
function addQuote() {
  const text = newQuoteText.value.trim();
  const category = newQuoteCategory.value.trim();

  if (!text || !category) {
    alert("Please enter both a quote and a category.");
    return;
  }

  const newQuote = { text, category };
  quotes.push(newQuote);

  // Clear inputs
  newQuoteText.value = "";
  newQuoteCategory.value = "";

  // Show the newly added quote immediately
  quoteDisplay.innerHTML = `
    "${newQuote.text}" 
    <div class="quote-category">— ${newQuote.category}</div>
  `;
}

// Event Listeners
newQuoteBtn.addEventListener("click", showRandomQuote);
addQuoteBtn.addEventListener("click", addQuote);
