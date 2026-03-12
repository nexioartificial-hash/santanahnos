/**
 * app.js - Main Application Controller for Santanahnos Admin Dashboard
 *
 * Dependencies (must be loaded before this file):
 *   - data.js    : Data access layer (getSession, clearSession, initDemoData, etc.)
 *   - helpers.js : Utility functions (isAdmin, setBreadcrumb, startClock, etc.)
 *   - views.js   : View renderers (renderDashboard, renderProductos, etc.)
 *
 * Responsibilities:
 *   1. Session validation and redirect
 *   2. Hash-based routing
 *   3. Sidebar setup (desktop collapse + mobile drawer)
 *   4. Topbar setup (search, notifications, user dropdown)
 *   5. Keyboard shortcuts
 */

/* ===================================================================
   1. SESSION CHECK & BOOTSTRAP
   =================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    const session = getSession();
    if (!session) {
        window.location.href = 'index.html';
        return;
    }

    // Populate localStorage with sample data on first run
    initDemoData();

    // Wire up all UI chrome
    setupSidebar();
    setupTopbar();
    setupRouter();
    checkAccess();
    startClock();
    updateNotifications();

    // Land on the current hash or fall back to dashboard
    navigate(window.location.hash || '#dashboard');
});

/* ===================================================================
   2. HASH ROUTER
   =================================================================== */

/**
 * Programmatically navigate to a hash route.
 * @param {string} hash - e.g. '#productos'
 */
function navigate(hash) {
    hash = hash || '#dashboard';
    window.location.hash = hash;
}

/**
 * Register the hashchange listener and handle the initial route.
 */
function setupRouter() {
    window.addEventListener('hashchange', handleRoute);
    handleRoute();
}

/**
 * Read the current hash, highlight the matching sidebar link,
 * enforce role-based access, and render the correct view.
 */
function handleRoute() {
    var hash = window.location.hash || '#dashboard';
    var section = hash.replace('#', '');

    // ---- Highlight active sidebar link ----
    document.querySelectorAll('#sidebar nav a').forEach(function (a) {
        a.classList.remove('active-nav');
        if (a.getAttribute('href') === hash) {
            a.classList.add('active-nav');
        }
    });

    // ---- Breadcrumb ----
    setBreadcrumb(section);

    // ---- Role guard: admin-only sections ----
    if ((section === 'usuarios' || section === 'configuracion') && !isAdmin()) {
        navigate('#dashboard');
        return;
    }

    // ---- Render the view that matches the section ----
    switch (section) {
        case 'dashboard':
            renderDashboard();
            break;
        case 'productos':
            renderProductos();
            break;
        case 'pedidos':
            renderPedidos();
            break;
        case 'clientes':
            renderClientes();
            break;
        case 'produccion':
            renderProduccion();
            break;
        case 'consultas':
            renderConsultas();
            break;
        case 'usuarios':
            renderUsuarios();
            break;
        case 'configuracion':
            renderConfiguracion();
            break;
        case 'leads':
            renderLeads();
            break;
        default:
            renderDashboard();
            break;
    }

    // ---- Close mobile sidebar after navigation ----
    closeMobileSidebar();
}

/* ===================================================================
   3. SIDEBAR SETUP
   =================================================================== */

/**
 * Wire the desktop collapse toggle, mobile hamburger button,
 * overlay click-to-close, and populate user info in the sidebar.
 */
function setupSidebar() {
    var sidebar = document.getElementById('sidebar');
    var toggle = document.getElementById('sidebar-toggle');
    var overlay = document.getElementById('sidebar-overlay');
    var mobileBtn = document.getElementById('mobile-menu-btn');

    // ---- Desktop: collapse / expand ----
    if (toggle) {
        toggle.addEventListener('click', function () {
            sidebar.classList.toggle('collapsed');

            var main = document.getElementById('main-content');
            var topbar = document.querySelector('.topbar');

            if (sidebar.classList.contains('collapsed')) {
                main.style.marginLeft = '4rem';
                if (topbar) topbar.style.left = '4rem';
            } else {
                main.style.marginLeft = '16rem';
                if (topbar) topbar.style.left = '16rem';
            }
        });
    }

    // ---- Mobile: hamburger opens drawer ----
    if (mobileBtn) {
        mobileBtn.addEventListener('click', function () {
            sidebar.classList.add('mobile-open');
            if (overlay) overlay.classList.remove('hidden');
        });
    }

    // ---- Overlay click closes mobile drawer ----
    if (overlay) {
        overlay.addEventListener('click', closeMobileSidebar);
    }

    // ---- Populate user info in sidebar ----
    var session = getSession();
    var displayName = (session && (session.name || session.user)) || '';

    var userNameEl = document.getElementById('user-name');
    if (userNameEl) {
        userNameEl.textContent = displayName;
    }

    var userAvatarEl = document.getElementById('user-avatar');
    if (userAvatarEl) {
        userAvatarEl.textContent = displayName.charAt(0).toUpperCase();
    }
}

/**
 * Close the mobile sidebar drawer and re-hide the overlay.
 */
function closeMobileSidebar() {
    var sidebar = document.getElementById('sidebar');
    var overlay = document.getElementById('sidebar-overlay');

    if (sidebar) sidebar.classList.remove('mobile-open');
    if (overlay) overlay.classList.add('hidden');
}

/* ===================================================================
   4. TOPBAR SETUP
   =================================================================== */

/**
 * Wire up:
 *   - Global search input with live results dropdown
 *   - Notification bell toggle
 *   - User menu dropdown toggle
 *   - Outside-click dismissal for all dropdowns
 *   - Logout buttons (topbar + sidebar)
 */
function setupTopbar() {
    var searchInput = document.getElementById('global-search');
    var searchResults = document.getElementById('search-results');
    var bell = document.getElementById('notif-bell');
    var notifDropdown = document.getElementById('notif-dropdown');
    var userBtn = document.getElementById('user-menu-btn');
    var userDropdown = document.getElementById('user-dropdown');

    // ---- Global search ----
    if (searchInput && searchResults) {
        searchInput.addEventListener('input', function (e) {
            var term = e.target.value.trim();
            if (term.length < 2) {
                searchResults.classList.add('hidden');
                return;
            }
            globalSearch(term);
        });

        // Close search results when clicking outside
        document.addEventListener('click', function (e) {
            if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
                searchResults.classList.add('hidden');
            }
        });
    }

    // ---- Notification bell ----
    if (bell && notifDropdown) {
        bell.addEventListener('click', function (e) {
            e.stopPropagation();
            notifDropdown.classList.toggle('hidden');
            // Close user dropdown if open
            if (userDropdown) userDropdown.classList.add('hidden');
        });
    }

    // ---- User menu dropdown ----
    if (userBtn && userDropdown) {
        userBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            userDropdown.classList.toggle('hidden');
            if (notifDropdown) notifDropdown.classList.add('hidden');
        });
    }

    // ---- Close all dropdowns on outside click ----
    document.addEventListener('click', function () {
        if (notifDropdown) notifDropdown.classList.add('hidden');
        if (userDropdown) userDropdown.classList.add('hidden');
    });

    // ---- Logout buttons ----
    var logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);

    var sidebarLogout = document.getElementById('sidebar-logout');
    if (sidebarLogout) sidebarLogout.addEventListener('click', logout);
}

/**
 * Clear the active session and redirect to the login page.
 */
function logout() {
    clearSession();
    window.location.href = 'index.html';
}

/* ===================================================================
   5. KEYBOARD SHORTCUTS
   =================================================================== */

document.addEventListener('keydown', function (e) {
    // Escape closes any open modal
    if (e.key === 'Escape') {
        closeModal();

        var deleteModal = document.getElementById('delete-modal');
        if (deleteModal) deleteModal.classList.add('hidden');
    }
});
