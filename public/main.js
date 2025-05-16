document.addEventListener('DOMContentLoaded', () => {
  const bookForm = document.getElementById('bookForm');
  const searchBtn = document.getElementById('searchBtn');
  const searchQuery = document.getElementById('searchQuery');
  const booksList = document.getElementById('booksList');
  const apiResults = document.getElementById('apiResults');
  const weatherData = document.getElementById('weatherData');

  // Load books and weather on page load
  fetchBooks();
  fetchWeather();

  // Set up weather refresh interval (every 30 minutes)
  setInterval(fetchWeather, 30 * 60 * 1000);

  // Form submission for adding a new book
  bookForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const title = document.getElementById('title').value.trim();
    const author = document.getElementById('author').value.trim();
    const year = document.getElementById('year').value;
    
    if (!title || !author || !year) {
      alert('Please fill in all fields');
      return;
    }

    // Create the book data object with the form values
    const bookData = {
      title: title,
      author: author,
      year: parseInt(year)
    };

    fetch('/api/books', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookData),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then((data) => {
      bookForm.reset();
      fetchBooks();
      showNotification(`"${data.title}" added to your collection!`);
    })
    .catch(error => {
      console.error('Error:', error);
      showNotification('Failed to add book. Please try again.', true);
    });
  });

  // Search OpenLibrary API
  searchBtn.addEventListener('click', () => {
    const query = searchQuery.value.trim();
    if (query) {
      apiResults.innerHTML = '<p class="loading">Searching for books...</p>';
      
      fetch(`/api/external/books?q=${encodeURIComponent(query)}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          if (data.docs && data.docs.length > 0) {
            displayApiResults(data.docs);
          } else {
            apiResults.innerHTML = '<p>No books found. Try another search term.</p>';
          }
        })
        .catch(error => {
          console.error('Error:', error);
          apiResults.innerHTML = '<p>Error fetching books. Please try again.</p>';
        });
    }
  });

  // Allow pressing Enter to search
  searchQuery.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      searchBtn.click();
    }
  });

  function fetchBooks() {
    booksList.innerHTML = '<p class="loading">Loading your collection...</p>';
    
    fetch('/api/books')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(books => {
        if (books.length === 0) {
          booksList.innerHTML = '<p>Your collection is empty. Add some books!</p>';
        } else {
          displayBooks(books);
        }
      })
      .catch(error => {
        console.error('Error:', error);
        booksList.innerHTML = '<p>Error loading books. Please refresh the page.</p>';
      });
  }

  function fetchWeather() {
    fetch('/api/external/weather')
      .then(response => {
        if (!response.ok) {
          throw new Error('Weather data not available');
        }
        return response.json();
      })
      .then(data => {
        weatherData.textContent = `${data.temperature}°F, ${data.description}`;
        updateWeatherMessage(data.temperature, data.description);
      })
      .catch(error => {
        console.error('Weather error:', error);
        weatherData.textContent = 'Not available';
      });
  }

  function updateWeatherMessage(temp, description) {
    const weatherMessage = document.querySelector('.weather-message');
    
    if (description.toLowerCase().includes('rain')) {
      weatherMessage.textContent = 'Rainy day? Perfect for staying in with a good book!';
    } else if (temp < 10) {
      weatherMessage.textContent = 'It\'s cold outside! Grab a blanket and a book.';
    } else if (temp > 25) {
      weatherMessage.textContent = 'Warm day! Find a shady spot outdoors for reading.';
    } else {
      weatherMessage.textContent = 'Perfect reading weather today!';
    }
  }

  function displayBooks(books) {
    booksList.innerHTML = books.map(book => `
      <div class="book-card">
        <h3>${escapeHtml(book.title)}</h3>
        <p><strong>Author:</strong> ${escapeHtml(book.author)}</p>
        <p><strong>Year:</strong> ${book.year}</p>
        <p><small>Added on: ${new Date(book.createdAt).toLocaleDateString()}</small></p>
      </div>
    `).join('');
  }

  function displayApiResults(books) {
    apiResults.innerHTML = books.slice(0, 10).map(book => `
      <div class="book-card">
        <h3>${escapeHtml(book.title)}</h3>
        <p><strong>Author:</strong> ${book.author_name ? escapeHtml(book.author_name.join(', ')) : 'Unknown'}</p>
        <p><strong>First Published:</strong> ${book.first_publish_year || 'Unknown'}</p>
        <p><strong>Language:</strong> ${book.language ? book.language.slice(0, 3).join(', ') : 'Not specified'}</p>
      </div>
    `).join('');
  }

  // // Helper function to prevent XSS attacks
  // function escapeHtml(unsafe) {
  //   return unsafe
  //     .replace(/&/g, "&amp;")
  //     .replace(/</g, "&lt;")
  //     .replace(/>/g, "&gt;")
  //     .replace(/"/g, "&quot;")
  //     .replace(/'/g, "&#039;");
  // }

  // Simple notification system
  function showNotification(message, isError = false) {
    const notification = document.createElement('div');
    notification.className = `notification ${isError ? 'error' : 'success'}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 500);
    }, 5000);
  }
});