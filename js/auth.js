// Authentication and navigation management for BeniLend
class BeniLendAuth {
    constructor() {
        this.init();
    }

    init() {
        this.setupNavigation();
        this.checkAuthentication();
    }

    // Check if user is authenticated and redirect if needed
    checkAuthentication() {
        const currentPage = window.location.pathname.split('/').pop();
        const user = this.getCurrentUser();

        // Pages that don't require authentication
        const publicPages = ['index.html', 'index.html', ''];

        if (!user && !publicPages.includes(currentPage)) {
            // User not logged in, redirect to login
            window.location.href = 'index.html';
            return;
        }

        if (user) {
            // User is logged in, check page access
            this.checkPageAccess(user, currentPage);
        }
    }

    // Check if user has access to current page
    checkPageAccess(user, currentPage) {
        const userPages = ['dashboard.html', 'reservation.html'];
        const adminPages = ['admin.html', 'staff.html'];

        if (user.role === 'user' && adminPages.includes(currentPage)) {
            // User trying to access admin page
            window.location.href = 'dashboard.html';
        } else if (user.role === 'admin' && userPages.includes(currentPage)) {
            // Admin trying to access user page
            window.location.href = 'admin.html';
        }
    }

    // Get current logged in user
    getCurrentUser() {
        const userData = localStorage.getItem('benilend_user');
        return userData ? JSON.parse(userData) : null;
    }

    // Setup role-based navigation
    setupNavigation() {
        const user = this.getCurrentUser();
        const nav = document.querySelector('nav');
        
        if (!nav) return;

        // Clear existing navigation
        nav.innerHTML = '';

        if (!user) {
            // Not logged in - show basic navigation
            nav.innerHTML = `
                <a href="index.html">Home</a>
                <a href="index.html">Login</a>
            `;
        } else if (user.role === 'user') {
            // User navigation - only Dashboard and My Reservations
            nav.innerHTML = `
                <a href="dashboard.html" class="${this.isActivePage('dashboard.html') ? 'active' : ''}">Dashboard</a>
                <a href="reservation.html" class="${this.isActivePage('reservation.html') ? 'active' : ''}">My Reservations</a>
                <button class="logout-btn" onclick="authManager.logout()">Logout</button>
            `;
        } else if (user.role === 'admin') {
            // Admin navigation - only Admin and Staff Check-In
            nav.innerHTML = `
                <a href="admin.html" class="${this.isActivePage('admin.html') ? 'active' : ''}">Admin</a>
                <a href="staff.html" class="${this.isActivePage('staff.html') ? 'active' : ''}">Staff Check-In</a>
                <button class="logout-btn" onclick="authManager.logout()">Logout</button>
            `;
        }
    }

    // Check if current page is active
    isActivePage(pageName) {
        const currentPage = window.location.pathname.split('/').pop();
        return currentPage === pageName;
    }

    // Logout function
    logout() {
        localStorage.removeItem('benilend_user');
        this.showFloatingNotification('Logged out successfully!', 'success', '👋');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }

    // Floating notification function
    showFloatingNotification(message, type = 'success', icon = '✅') {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.75rem;">
                <span style="font-size: 1.25rem;">${icon}</span>
                <div>
                    <h4 style="margin: 0 0 0.25rem 0; color: var(--text); font-size: 1rem;">
                        ${type === 'success' ? 'Success!' : type === 'error' ? 'Error!' : 'Notice!'}
                    </h4>
                    <p style="margin: 0; color: var(--text-light); font-size: 0.9rem;">
                        ${message}
                    </p>
                </div>
            </div>
        `;
        
        // Set border color based on type
        if (type === 'success') {
            notification.style.borderLeftColor = '#4caf50';
        } else if (type === 'error') {
            notification.style.borderLeftColor = '#f44336';
        } else if (type === 'warning') {
            notification.style.borderLeftColor = '#ffa726';
        }
        
        document.body.appendChild(notification);

        // Remove notification after 4 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }

    // Get user display name
    getUserDisplayName() {
        const user = this.getCurrentUser();
        if (!user) return 'Guest';
        return user.role === 'admin' ? 'Admin' : 'Student';
    }

    // Check if current user has specific role
    hasRole(role) {
        const user = this.getCurrentUser();
        return user && user.role === role;
    }
}

// Initialize authentication manager
const authManager = new BeniLendAuth();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    authManager.init();
});