// Fetch quotes from placeholder API
async function fetchServerQuotes() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts");
    const data = await response.json();
    // Convert posts to quote objects
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
