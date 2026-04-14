
function toggleMenu() {
  const menu = document.getElementById("mobileMenu");

  if (menu.style.display === "flex") {
    menu.style.display = "none";
  } else {
    menu.style.display = "flex";
  }
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^=\"#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
    // Close mobile menu if open
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenu.style.display === 'flex') {
      toggleMenu();
    }
  });
});

// Review Rating System
let selectedRating = 0;

document.addEventListener('DOMContentLoaded', function() {
  // Check if user has already reviewed from this device
  if (localStorage.getItem('hasReviewed') === 'true') {
    document.getElementById('reviewForm').style.display = 'none';
    const message = document.createElement('p');
    message.textContent = 'You have already submitted a review from this device. Thank you!';
    message.style.color = '#0a4ccf';
    message.style.fontWeight = 'bold';
    message.style.textAlign = 'center';
    message.style.marginTop = '20px';
    document.querySelector('.review-form-container').appendChild(message);
  } else {
    // Star rating functionality
    const stars = document.querySelectorAll('.star');
    stars.forEach(star => {
      star.addEventListener('click', function() {
        selectedRating = this.dataset.value;
        document.getElementById('ratingValue').value = selectedRating;
        updateStarDisplay(selectedRating);
      });

      star.addEventListener('mouseover', function() {
        updateStarDisplay(this.dataset.value);
      });
    });

    document.getElementById('starRating').addEventListener('mouseout', function() {
      updateStarDisplay(selectedRating);
    });

    // Form submission
    document.getElementById('reviewForm').addEventListener('submit', function(e) {
      e.preventDefault();
      submitReview();
    });
  }

  // Load and display existing reviews
  loadReviews();
});

function updateStarDisplay(rating) {
  const stars = document.querySelectorAll('.star');
  stars.forEach(star => {
    if (star.dataset.value <= rating) {
      star.classList.add('active');
    } else {
      star.classList.remove('active');
    }
  });
}

function submitReview() {
  const name = document.getElementById('clientName').value;
  const comment = document.getElementById('clientComment').value;
  const rating = document.getElementById('ratingValue').value;

  if (!name || !comment || !rating) {
    alert('Please fill all fields and select a rating');
    return;
  }

  const review = {
    id: Date.now(),
    name: name,
    comment: comment,
    rating: rating,
    date: new Date().toLocaleDateString()
  };

  let reviews = JSON.parse(localStorage.getItem('reviews')) || [];
  reviews.unshift(review);
  localStorage.setItem('reviews', JSON.stringify(reviews));

  // Set flag to prevent multiple reviews from same device
  localStorage.setItem('hasReviewed', 'true');

  document.getElementById('reviewForm').reset();
  selectedRating = 0;
  updateStarDisplay(0);
  document.getElementById('ratingValue').value = 0;

  loadReviews();
  alert('Thank you for your review!');
}

function loadReviews() {
  const reviews = JSON.parse(localStorage.getItem('reviews')) || [];
  const reviewsList = document.getElementById('reviewsList');
  
  // Update average rating for hero
  if (reviews.length > 0) {
    const averageRating = reviews.reduce((sum, review) => sum + parseInt(review.rating), 0) / reviews.length;
    const heroAvgElement = document.getElementById('heroAverageRating');
    if (heroAvgElement) {
      heroAvgElement.textContent = averageRating.toFixed(1);
      heroAvgElement.dataset.rating = averageRating.toFixed(1);
    }
  }

  if (reviews.length === 0) {
    reviewsList.innerHTML = '<p class="no-reviews">No reviews yet. Be the first to share your experience!</p>';
    return;
  }

  reviewsList.innerHTML = reviews.map(review => `
    <div class="review-card">
      <div class="review-header">
        <h4>${review.name}</h4>
        <span class="review-date">${review.date}</span>
      </div>
      <div class="review-rating">
        ${generateStars(review.rating)}
        <span class="rating-text">${review.rating}/5</span>
      </div>
      <p class="review-comment">${review.comment}</p>
      <button class="delete-btn" onclick="deleteReview(${review.id})">Delete</button>
    </div>
  `).join('');
}

function generateStars(rating) {
  let stars = '';
  for (let i = 1; i <= 5; i++) {
    stars += `<span class="star-display ${i <= rating ? 'filled' : ''}">★</span>`;
  }
  return stars;
}

function deleteReview(id) {
  if (confirm('Are you sure you want to delete this review?')) {
    let reviews = JSON.parse(localStorage.getItem('reviews')) || [];
    reviews = reviews.filter(review => review.id !== id);
    localStorage.setItem('reviews', JSON.stringify(reviews));
    loadReviews();
  }
}
