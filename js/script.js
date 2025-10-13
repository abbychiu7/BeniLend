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
    
    // If showing reservations page, populate it with current data
    if (pageId === 'reservations') {
        populateReservationsPage();
    }
}

// Function to open reservation form with selected equipment
function openReservation(equipmentName) {
    currentEquipment = equipmentName;
    document.getElementById('equipmentName').value = equipmentName;
    showPage('reservation');
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

// Reservation Data Structure with Due Dates
const userReservations = [
    {
        id: 1,
        equipment: 'DSLR Camera',
        startDate: '2025-10-15',
        startTime: '10:00',
        endDate: '2025-10-17',
        endTime: '17:00',
        status: 'upcoming',
        userId: 'student123',
        checkedOut: false
    },
    {
        id: 2,
        equipment: 'Speakers',
        startDate: '2025-10-13',
        startTime: '09:00',
        endDate: '2025-10-14',
        endTime: '15:00',
        status: 'active',
        userId: 'student123',
        checkedOut: true
    },
    {
        id: 3,
        equipment: 'Microphone Set',
        startDate: '2025-10-12',
        startTime: '14:00',
        endDate: '2025-10-13',
        endTime: '16:00',
        status: 'active',
        userId: 'student123',
        checkedOut: true
    }
];

// Notification System Functions
function getCurrentDate() {
    return new Date();
}

function parseDateTime(date, time) {
    return new Date(`${date}T${time}:00`);
}

function calculateDaysUntilDue(dueDateTime) {
    const now = getCurrentDate();
    const timeDiff = dueDateTime.getTime() - now.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
}

function calculateHoursUntilDue(dueDateTime) {
    const now = getCurrentDate();
    const timeDiff = dueDateTime.getTime() - now.getTime();
    return Math.ceil(timeDiff / (1000 * 3600));
}

function checkDueDateNotifications() {
    const notifications = [];
    const now = getCurrentDate();
    
    userReservations.forEach(reservation => {
        if (reservation.status === 'active' && reservation.checkedOut) {
            const dueDateTime = parseDateTime(reservation.endDate, reservation.endTime);
            const hoursUntilDue = calculateHoursUntilDue(dueDateTime);
            const daysUntilDue = calculateDaysUntilDue(dueDateTime);
            
            // Overdue items (past due date)
            if (hoursUntilDue < 0) {
                const hoursOverdue = Math.abs(hoursUntilDue);
                notifications.push({
                    type: 'urgent',
                    icon: '🚨',
                    title: `${reservation.equipment} is OVERDUE!`,
                    message: `This item was due ${hoursOverdue > 24 ? Math.floor(hoursOverdue/24) + ' days' : hoursOverdue + ' hours'} ago. Please return immediately to avoid late fees.`,
                    equipment: reservation.equipment,
                    reservationId: reservation.id,
                    priority: 1
                });
            }
            // Due today (within 24 hours)
            else if (hoursUntilDue <= 24 && hoursUntilDue > 0) {
                notifications.push({
                    type: 'warning',
                    icon: '⏰',
                    title: `${reservation.equipment} due ${hoursUntilDue <= 6 ? 'in ' + hoursUntilDue + ' hours' : 'today'}!`,
                    message: `Return by ${dueDateTime.toLocaleDateString()} at ${dueDateTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}.`,
                    equipment: reservation.equipment,
                    reservationId: reservation.id,
                    priority: 2
                });
            }
            // Due within 3 days
            else if (daysUntilDue <= 3 && daysUntilDue > 0) {
                notifications.push({
                    type: 'info',
                    icon: '📋',
                    title: `${reservation.equipment} due in ${daysUntilDue} ${daysUntilDue === 1 ? 'day' : 'days'}`,
                    message: `Due ${dueDateTime.toLocaleDateString()} at ${dueDateTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}. Plan your return ahead of time.`,
                    equipment: reservation.equipment,
                    reservationId: reservation.id,
                    priority: 3
                });
            }
        }
    });
    
    // Sort notifications by priority (urgent first)
    notifications.sort((a, b) => a.priority - b.priority);
    
    return notifications;
}

function displayNotifications(notifications) {
    const banner = document.getElementById('notificationBanner');
    
    if (notifications.length === 0) {
        banner.classList.add('hidden');
        return;
    }
    
    banner.innerHTML = '';
    banner.classList.remove('hidden');
    
    notifications.forEach((notification, index) => {
        const notificationElement = document.createElement('div');
        notificationElement.className = `notification-item notification-${notification.type} animate-in`;
        notificationElement.style.animationDelay = `${index * 0.1}s`;
        
        notificationElement.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${notification.icon}</span>
                <div class="notification-text">
                    <div class="notification-title">${notification.title}</div>
                    <div class="notification-message">${notification.message}</div>
                </div>
            </div>
            <div class="notification-actions">
                <button class="notification-btn notification-btn-primary" onclick="showPage('reservations')">
                    View Details
                </button>
                <button class="notification-btn notification-btn-secondary" onclick="extendReservation(${notification.reservationId})">
                    Extend
                </button>
                <button class="notification-close" onclick="dismissNotification(this)" aria-label="Dismiss">
                    ×
                </button>
            </div>
        `;
        
        banner.appendChild(notificationElement);
    });
}

function dismissNotification(closeButton) {
    const notificationItem = closeButton.closest('.notification-item');
    notificationItem.style.animation = 'slideOutUp 0.3s ease-in';
    
    setTimeout(() => {
        notificationItem.remove();
        
        // Hide banner if no notifications left
        const banner = document.getElementById('notificationBanner');
        if (banner.children.length === 0) {
            banner.classList.add('hidden');
        }
    }, 300);
}

function extendReservation(reservationId) {
    // Find the reservation
    const reservation = userReservations.find(r => r.id === reservationId);
    if (reservation) {
        // Extend by 1 day (this would typically involve server communication)
        const currentEndDate = new Date(reservation.endDate);
        currentEndDate.setDate(currentEndDate.getDate() + 1);
        reservation.endDate = currentEndDate.toISOString().split('T')[0];
        
        showNotification(`Extended ${reservation.equipment} return date by 1 day!`);
        
        // Refresh notifications
        setTimeout(() => {
            const notifications = checkDueDateNotifications();
            displayNotifications(notifications);
        }, 1000);
    }
}

function getDueIndicator(reservation) {
    if (reservation.status !== 'active' || !reservation.checkedOut) {
        return '';
    }
    
    const dueDateTime = parseDateTime(reservation.endDate, reservation.endTime);
    const hoursUntilDue = calculateHoursUntilDue(dueDateTime);
    const daysUntilDue = calculateDaysUntilDue(dueDateTime);
    
    if (hoursUntilDue < 0) {
        const hoursOverdue = Math.abs(hoursUntilDue);
        return `<span class="due-indicator due-urgent">
            <span class="icon">🚨</span>
            Overdue ${hoursOverdue > 24 ? Math.floor(hoursOverdue/24) + 'd' : hoursOverdue + 'h'}
        </span>`;
    } else if (hoursUntilDue <= 24) {
        return `<span class="due-indicator due-warning">
            <span class="icon">⏰</span>
            Due ${hoursUntilDue <= 6 ? 'in ' + hoursUntilDue + 'h' : 'today'}
        </span>`;
    } else if (daysUntilDue <= 3) {
        return `<span class="due-indicator due-soon">
            <span class="icon">📋</span>
            Due in ${daysUntilDue}d
        </span>`;
    }
    
    return '';
}

function populateReservationsPage() {
    const reservationList = document.getElementById('reservationList');
    
    if (!reservationList) return;
    
    reservationList.innerHTML = '';
    
    if (userReservations.length === 0) {
        reservationList.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: var(--text-light);">
                <h3>No Reservations</h3>
                <p>You don't have any reservations yet. Visit the dashboard to reserve equipment!</p>
                <button class="btn btn-primary" onclick="showPage('dashboard')" style="margin-top: 1rem;">
                    Browse Equipment
                </button>
            </div>
        `;
        return;
    }
    
    userReservations.forEach(reservation => {
        const startDateTime = parseDateTime(reservation.startDate, reservation.startTime);
        const endDateTime = parseDateTime(reservation.endDate, reservation.endTime);
        
        const reservationElement = document.createElement('div');
        reservationElement.className = 'reservation-item';
        
        const statusClass = reservation.status === 'active' ? 'reserved' : 'available';
        const statusText = reservation.status === 'active' ? 'Active' : 'Upcoming';
        
        const dueIndicator = getDueIndicator(reservation);
        
        reservationElement.innerHTML = `
            <div class="reservation-info">
                <h4>${reservation.equipment}${dueIndicator}</h4>
                <p>${startDateTime.toLocaleDateString()} ${startDateTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                   ${endDateTime.toLocaleDateString()} ${endDateTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                <span class="status ${statusClass}">${statusText}</span>
            </div>
            <div class="reservation-actions">
                ${reservation.status === 'upcoming' ? `
                    <button class="btn-small" style="background: var(--primary);" onclick="extendReservation(${reservation.id})">Extend</button>
                    <button class="btn-small" style="background: var(--danger);" onclick="cancelReservation(${reservation.id})">Cancel</button>
                ` : `
                    <button class="btn-small" style="background: var(--primary);" onclick="extendReservation(${reservation.id})">Extend</button>
                    <button class="btn-small" style="background: var(--accent); color: white;" onclick="returnEquipment(${reservation.id})">Return</button>
                `}
            </div>
        `;
        
        reservationList.appendChild(reservationElement);
    });
}

function cancelReservation(reservationId) {
    const reservationIndex = userReservations.findIndex(r => r.id === reservationId);
    if (reservationIndex > -1) {
        const reservation = userReservations[reservationIndex];
        userReservations.splice(reservationIndex, 1);
        showNotification(`Cancelled reservation for ${reservation.equipment}`);
        populateReservationsPage();
        
        // Refresh notifications
        setTimeout(() => {
            const notifications = checkDueDateNotifications();
            displayNotifications(notifications);
        }, 1000);
    }
}

function returnEquipment(reservationId) {
    const reservation = userReservations.find(r => r.id === reservationId);
    if (reservation) {
        reservation.status = 'completed';
        reservation.checkedOut = false;
        showNotification(`Successfully returned ${reservation.equipment}!`);
        populateReservationsPage();
        
        // Refresh notifications
        setTimeout(() => {
            const notifications = checkDueDateNotifications();
            displayNotifications(notifications);
        }, 1000);
    }
}

// Initialize notification system when page loads
function initializeNotificationSystem() {
    const notifications = checkDueDateNotifications();
    displayNotifications(notifications);
    
    // Check for notifications every 30 minutes
    setInterval(() => {
        const notifications = checkDueDateNotifications();
        displayNotifications(notifications);
    }, 30 * 60 * 1000);
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeNotificationSystem();
});