// Send a new quote to the server (POST)
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
    alert("Quote synced to server!");
  } catch (error) {
    console.error("Error sending quote to server:", error);
  }
}
