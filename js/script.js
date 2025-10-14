// Global variable to store current equipment selection
let currentEquipment = '';

// Function to switch between pages
function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.add('hidden');
    });
    
    // Show selected page
    document.getElementById(pageId).classList.remove('hidden');

    // Update active navigation link
    document.querySelectorAll('nav a').forEach(link => {
        link.classList.remove('active');
    });
    event.target.classList.add('active');
}

// Function to open reservation form with selected equipment
function openReservation(equipmentName) {
    // Redirect to reservation page with equipment parameter
    window.location.href = `reservation.html?equipment=${encodeURIComponent(equipmentName)}`;
}

// Function to handle reservation form submission
function submitReservation(event) {
    event.preventDefault();
    showNotification(`Reservation confirmed for ${currentEquipment}!`);
    
    // Redirect to reservations page after 1.5 seconds
    setTimeout(() => {
        showPage('reservations');
    }, 1500);
}

// Function to show notification messages
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <h4 style="margin-bottom: 0.5rem; color: var(--accent);">Success!</h4>
        <p style="color: var(--text-light);">${message}</p>
    `;
    document.body.appendChild(notification);

    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Search functionality
document.getElementById('searchInput').addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    const cards = document.querySelectorAll('.equipment-card');
    
    cards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        if (title.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
});

// Set default dates and times when page loads
window.addEventListener('DOMContentLoaded', function() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Format dates for input fields (YYYY-MM-DD)
    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    document.getElementById('dateFrom').value = formatDate(today);
    document.getElementById('dateTo').value = formatDate(tomorrow);
    document.getElementById('timeFrom').value = '09:00';
    document.getElementById('timeTo').value = '17:00';
});

// Admin functions
function approveReservation(button) {
    const card = button.closest('.admin-reservation-card');
    const userName = card.querySelector('h4').textContent;
    const equipment = card.querySelector('.detail-value').textContent;
    
    // Add approved styling
    card.classList.add('approved-card');
    
    // Update status badge
    const statusBadge = card.querySelector('.status-badge');
    statusBadge.textContent = 'Approved';
    statusBadge.classList.remove('pending');
    statusBadge.classList.add('approved');
    
    // Remove action buttons
    const actionsDiv = card.querySelector('.admin-card-actions');
    actionsDiv.remove();
    
    // Add approval info to card body
    const cardBody = card.querySelector('.admin-card-body');
    const approvalDetail = document.createElement('div');
    approvalDetail.className = 'reservation-detail';
    approvalDetail.innerHTML = `
        <span class="detail-label">Approved by:</span>
        <span class="detail-value">Admin - ${new Date().toLocaleString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        })}</span>
    `;
    cardBody.appendChild(approvalDetail);
    
    // Show notification
    showNotification(`Reservation approved for ${userName} - ${equipment}`);
    
    // Update stats
    updateAdminStats();
}

function rejectReservation(button) {
    const card = button.closest('.admin-reservation-card');
    const userName = card.querySelector('h4').textContent;
    const equipment = card.querySelector('.detail-value').textContent;
    
    // Add fade out animation
    card.style.transition = 'all 0.3s ease';
    card.style.opacity = '0';
    card.style.transform = 'translateX(-20px)';
    
    setTimeout(() => {
        card.remove();
        showNotification(`Reservation rejected for ${userName} - ${equipment}`);
        updateAdminStats();
    }, 300);
}

function updateAdminStats() {
    // Count pending reservations
    const pendingCards = document.querySelectorAll('.admin-reservation-card:not(.approved-card)');
    const pendingCount = pendingCards.length;
    
    // Update pending stat
    const statCards = document.querySelectorAll('.stat-card');
    if (statCards.length > 0) {
        statCards[0].querySelector('h3').textContent = pendingCount;
    }
}