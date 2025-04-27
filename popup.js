document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('searchInput');
  const searchButton = document.getElementById('searchButton');

  // Focus the input when the popup opens
  searchInput.focus();

  function sendQuery() {
    const query = searchInput.value.trim();
    if (query) {
      chrome.runtime.sendMessage({
        action: 'searchGrok',
        query: query
      });
      // Close the popup after sending the query
      window.close();
    }
  }

  // Handle search button click
  searchButton.addEventListener('click', sendQuery);

  // Handle Enter key press
  searchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      sendQuery();
    }
  });
}); 