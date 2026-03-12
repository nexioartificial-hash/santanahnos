/*  ============================================================
    helpers.js — Utility functions for Santana Hnos. Admin Panel
    Depends on: data.js (getData, setData, getSession, etc.)
    ============================================================ */

/* ---------------------------------------------------------------
   TOAST SYSTEM
   --------------------------------------------------------------- */
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const colors = {
        success: 'bg-green-600',
        error:   'bg-red-600',
        warning: 'bg-yellow-500',
        info:    'bg-blue-600'
    };

    const icons = {
        success: '<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
        error:   '<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
        warning: '<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>',
        info:    '<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>'
    };

    const toast = document.createElement('div');
    toast.className = `${colors[type] || colors.success} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] max-w-md transform translate-x-full transition-transform duration-300 ease-out`;
    toast.innerHTML = `
        ${icons[type] || icons.success}
        <span class="text-sm font-medium flex-1">${message}</span>
        <button class="ml-2 hover:opacity-70 transition-opacity flex-shrink-0" onclick="this.parentElement.remove()">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
        </button>
    `;

    container.appendChild(toast);

    // Slide in
    requestAnimationFrame(function () {
        requestAnimationFrame(function () {
            toast.classList.remove('translate-x-full');
            toast.classList.add('translate-x-0');
        });
    });

    // Auto-dismiss after 3 seconds
    var timeout = setTimeout(function () {
        dismissToast(toast);
    }, 3000);

    // Cancel auto-dismiss if user closes manually
    toast.querySelector('button').addEventListener('click', function () {
        clearTimeout(timeout);
    });
}

function dismissToast(toast) {
    if (!toast || !toast.parentElement) return;
    toast.classList.remove('translate-x-0');
    toast.classList.add('translate-x-full');
    setTimeout(function () {
        if (toast.parentElement) toast.remove();
    }, 300);
}


/* ---------------------------------------------------------------
   MODAL SYSTEM
   --------------------------------------------------------------- */
function openModal(title, bodyHtml, footerHtml) {
    footerHtml = footerHtml || '';

    var container = document.getElementById('modal-container');
    var titleEl   = document.getElementById('modal-title');
    var bodyEl    = document.getElementById('modal-body');
    var footerEl  = document.getElementById('modal-footer');

    if (!container) return;

    if (titleEl)  titleEl.textContent = title;
    if (bodyEl)   bodyEl.innerHTML = bodyHtml;
    if (footerEl) footerEl.innerHTML = footerHtml;

    container.classList.remove('hidden');
    // Trigger fade-in
    requestAnimationFrame(function () {
        container.classList.add('opacity-100');
        var panel = container.querySelector('.modal-panel');
        if (panel) {
            panel.classList.remove('scale-95', 'opacity-0');
            panel.classList.add('scale-100', 'opacity-100');
        }
    });

    // Close on overlay click
    container.addEventListener('click', function onOverlay(e) {
        if (e.target === container) {
            closeModal();
            container.removeEventListener('click', onOverlay);
        }
    });

    // Close on Escape
    function onEscape(e) {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', onEscape);
        }
    }
    document.addEventListener('keydown', onEscape);
}

function closeModal() {
    var container = document.getElementById('modal-container');
    if (!container) return;

    var panel = container.querySelector('.modal-panel');
    if (panel) {
        panel.classList.remove('scale-100', 'opacity-100');
        panel.classList.add('scale-95', 'opacity-0');
    }
    container.classList.remove('opacity-100');

    setTimeout(function () {
        container.classList.add('hidden');
    }, 200);
}


/* ---------------------------------------------------------------
   DELETE CONFIRMATION
   --------------------------------------------------------------- */
function confirmDelete(callback) {
    var modal = document.getElementById('delete-modal');
    if (!modal) return;

    modal.classList.remove('hidden');
    requestAnimationFrame(function () {
        modal.classList.add('opacity-100');
        var panel = modal.querySelector('.modal-panel');
        if (panel) {
            panel.classList.remove('scale-95', 'opacity-0');
            panel.classList.add('scale-100', 'opacity-100');
        }
    });

    var confirmBtn = document.getElementById('delete-confirm-btn');
    var cancelBtn  = document.getElementById('delete-cancel-btn');

    function closeDelete() {
        var panel = modal.querySelector('.modal-panel');
        if (panel) {
            panel.classList.remove('scale-100', 'opacity-100');
            panel.classList.add('scale-95', 'opacity-0');
        }
        modal.classList.remove('opacity-100');
        setTimeout(function () {
            modal.classList.add('hidden');
        }, 200);
        // Cleanup
        document.removeEventListener('keydown', onEsc);
        modal.removeEventListener('click', onOverlay);
        if (confirmBtn) confirmBtn.removeEventListener('click', onConfirm);
        if (cancelBtn)  cancelBtn.removeEventListener('click', closeDelete);
    }

    function onConfirm() {
        if (typeof callback === 'function') callback();
        closeDelete();
    }

    function onEsc(e) {
        if (e.key === 'Escape') closeDelete();
    }

    function onOverlay(e) {
        if (e.target === modal) closeDelete();
    }

    if (confirmBtn) confirmBtn.addEventListener('click', onConfirm);
    if (cancelBtn)  cancelBtn.addEventListener('click', closeDelete);
    document.addEventListener('keydown', onEsc);
    modal.addEventListener('click', onOverlay);
}


function closeDeleteModal() {
    var modal = document.getElementById('delete-modal');
    if (!modal) return;
    modal.classList.remove('opacity-100');
    setTimeout(function () { modal.classList.add('hidden'); }, 200);
}

/* ---------------------------------------------------------------
   TABLE SORTING
   --------------------------------------------------------------- */
function sortTable(data, column, direction) {
    direction = direction || 'asc';

    var sorted = data.slice().sort(function (a, b) {
        var valA = a[column];
        var valB = b[column];

        // Handle null / undefined
        if (valA == null) valA = '';
        if (valB == null) valB = '';

        // Try date detection (DD/MM/YYYY or YYYY-MM-DD)
        var dateA = parseDate(valA);
        var dateB = parseDate(valB);
        if (dateA && dateB) {
            return direction === 'asc' ? dateA - dateB : dateB - dateA;
        }

        // Numeric
        var numA = parseFloat(valA);
        var numB = parseFloat(valB);
        if (!isNaN(numA) && !isNaN(numB)) {
            return direction === 'asc' ? numA - numB : numB - numA;
        }

        // String
        var strA = String(valA).toLowerCase();
        var strB = String(valB).toLowerCase();
        if (strA < strB) return direction === 'asc' ? -1 : 1;
        if (strA > strB) return direction === 'asc' ? 1 : -1;
        return 0;
    });

    return sorted;
}

function parseDate(val) {
    if (typeof val !== 'string') return null;
    // DD/MM/YYYY
    var match = val.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (match) {
        return new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
    }
    // YYYY-MM-DD
    match = val.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) {
        return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
    }
    return null;
}


/* ---------------------------------------------------------------
   PAGINATION
   --------------------------------------------------------------- */
function paginate(data, page, perPage) {
    perPage = perPage || 8;
    var totalPages = Math.max(1, Math.ceil(data.length / perPage));
    page = Math.max(1, Math.min(page, totalPages));
    var start = (page - 1) * perPage;
    var items = data.slice(start, start + perPage);
    return {
        items: items,
        totalPages: totalPages,
        currentPage: page
    };
}

function renderPagination(totalPages, currentPage, onPageChange) {
    if (totalPages <= 1) return '';

    var html = '<nav class="flex items-center justify-center gap-1 mt-4">';

    // Previous
    var prevDisabled = currentPage <= 1;
    html += '<button ' + (prevDisabled ? 'disabled' : 'onclick="' + onPageChange + '(' + (currentPage - 1) + ')"') +
        ' class="px-3 py-2 text-sm rounded-lg ' +
        (prevDisabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100') +
        '">' +
        '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>' +
        '</button>';

    // Page numbers with ellipsis
    var pages = buildPageNumbers(totalPages, currentPage);
    for (var i = 0; i < pages.length; i++) {
        var p = pages[i];
        if (p === '...') {
            html += '<span class="px-2 py-2 text-sm text-gray-400">...</span>';
        } else {
            var isActive = p === currentPage;
            html += '<button onclick="' + onPageChange + '(' + p + ')" class="px-3 py-2 text-sm rounded-lg font-medium ' +
                (isActive ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100') +
                '">' + p + '</button>';
        }
    }

    // Next
    var nextDisabled = currentPage >= totalPages;
    html += '<button ' + (nextDisabled ? 'disabled' : 'onclick="' + onPageChange + '(' + (currentPage + 1) + ')"') +
        ' class="px-3 py-2 text-sm rounded-lg ' +
        (nextDisabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100') +
        '">' +
        '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>' +
        '</button>';

    html += '</nav>';
    return html;
}

function buildPageNumbers(total, current) {
    if (total <= 7) {
        var all = [];
        for (var i = 1; i <= total; i++) all.push(i);
        return all;
    }
    var pages = [];
    pages.push(1);
    if (current > 3) pages.push('...');
    var start = Math.max(2, current - 1);
    var end   = Math.min(total - 1, current + 1);
    for (var j = start; j <= end; j++) pages.push(j);
    if (current < total - 2) pages.push('...');
    pages.push(total);
    return pages;
}


/* ---------------------------------------------------------------
   SEARCH / FILTER
   --------------------------------------------------------------- */
function filterData(data, searchTerm, fields) {
    if (!searchTerm || !searchTerm.trim()) return data;
    var term = searchTerm.toLowerCase().trim();

    return data.filter(function (item) {
        for (var i = 0; i < fields.length; i++) {
            var value = item[fields[i]];
            if (value != null && String(value).toLowerCase().indexOf(term) !== -1) {
                return true;
            }
        }
        return false;
    });
}


/* ---------------------------------------------------------------
   CSV EXPORT
   --------------------------------------------------------------- */
function exportCSV(data, columns, filename) {
    if (!data || !data.length) {
        showToast('No hay datos para exportar.', 'warning');
        return;
    }

    // BOM for Excel UTF-8 compatibility
    var bom = '\uFEFF';

    // Header row
    var header = columns.map(function (col) {
        return '"' + col.label.replace(/"/g, '""') + '"';
    }).join(',');

    // Data rows
    var rows = data.map(function (item) {
        return columns.map(function (col) {
            var val = item[col.key];
            if (val == null) val = '';
            return '"' + String(val).replace(/"/g, '""') + '"';
        }).join(',');
    });

    var csvContent = bom + header + '\n' + rows.join('\n');
    var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    var url = URL.createObjectURL(blob);

    var link = document.createElement('a');
    link.href = url;
    link.download = (filename || 'export') + '.csv';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast('Archivo CSV descargado correctamente.', 'success');
}


/* ---------------------------------------------------------------
   DATE / TIME CLOCK
   --------------------------------------------------------------- */
function startClock() {
    var display = document.getElementById('datetime-display');
    if (!display) return;

    function update() {
        var now = new Date();
        var dd   = String(now.getDate()).padStart(2, '0');
        var mm   = String(now.getMonth() + 1).padStart(2, '0');
        var yyyy = now.getFullYear();
        var hh   = String(now.getHours()).padStart(2, '0');
        var min  = String(now.getMinutes()).padStart(2, '0');
        var ss   = String(now.getSeconds()).padStart(2, '0');
        display.textContent = dd + '/' + mm + '/' + yyyy + ' ' + hh + ':' + min + ':' + ss;
    }

    update();
    setInterval(update, 1000);
}


/* ---------------------------------------------------------------
   NOTIFICATION BADGE UPDATER
   --------------------------------------------------------------- */
function updateNotifications() {
    var queries  = getData('queries') || [];
    var products = getData('products') || [];

    // Count unread queries
    var unreadQueries = queries.filter(function (q) {
        return !q.read;
    });

    // Count low-stock products (stock <= minStock)
    var lowStock = products.filter(function (p) {
        return typeof p.stock === 'number' && typeof p.minStock === 'number' && p.stock <= p.minStock;
    });

    var totalCount = unreadQueries.length + lowStock.length;

    // Update top-bar badge
    var badge = document.getElementById('notif-badge');
    if (badge) {
        if (totalCount > 0) {
            badge.textContent = totalCount > 99 ? '99+' : totalCount;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }

    // Update sidebar queries badge
    var sidebarBadge = document.getElementById('sidebar-queries-badge');
    if (sidebarBadge) {
        if (unreadQueries.length > 0) {
            sidebarBadge.textContent = unreadQueries.length > 99 ? '99+' : unreadQueries.length;
            sidebarBadge.classList.remove('hidden');
        } else {
            sidebarBadge.classList.add('hidden');
        }
    }

    // Populate notification dropdown
    var dropdown = document.getElementById('notif-dropdown');
    if (dropdown) {
        var html = '';

        if (totalCount === 0) {
            html = '<div class="px-4 py-6 text-center text-gray-500 text-sm">No hay notificaciones nuevas</div>';
        } else {
            // Unread queries (show up to 5)
            var querySlice = unreadQueries.slice(0, 5);
            for (var i = 0; i < querySlice.length; i++) {
                var q = querySlice[i];
                html += '<a href="queries.html" class="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100">' +
                    '<div class="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">' +
                        '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>' +
                    '</div>' +
                    '<div class="flex-1 min-w-0">' +
                        '<p class="text-sm font-medium text-gray-800 truncate">' + escapeHtml(q.name || 'Consulta') + '</p>' +
                        '<p class="text-xs text-gray-500 truncate">' + escapeHtml(q.message || '') + '</p>' +
                    '</div>' +
                '</a>';
            }

            // Low stock items (show up to 5)
            var stockSlice = lowStock.slice(0, 5);
            for (var j = 0; j < stockSlice.length; j++) {
                var p = stockSlice[j];
                var stockColor = p.stock === 0 ? 'red' : 'yellow';
                html += '<a href="products.html" class="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100">' +
                    '<div class="w-8 h-8 rounded-full bg-' + stockColor + '-100 text-' + stockColor + '-600 flex items-center justify-center flex-shrink-0 mt-0.5">' +
                        '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>' +
                    '</div>' +
                    '<div class="flex-1 min-w-0">' +
                        '<p class="text-sm font-medium text-gray-800 truncate">' + escapeHtml(p.name || 'Producto') + '</p>' +
                        '<p class="text-xs text-gray-500">Stock: ' + p.stock + ' (min: ' + p.minStock + ')</p>' +
                    '</div>' +
                '</a>';
            }

            // "View all" link if there are more
            if (unreadQueries.length > 5 || lowStock.length > 5) {
                html += '<div class="px-4 py-2 text-center">' +
                    '<a href="queries.html" class="text-xs text-primary font-medium hover:underline">Ver todas las notificaciones</a>' +
                '</div>';
            }
        }

        dropdown.innerHTML = html;
    }
}

function escapeHtml(text) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
}


/* ---------------------------------------------------------------
   GLOBAL SEARCH
   --------------------------------------------------------------- */
function globalSearch(term) {
    var resultsEl = document.getElementById('search-results');
    if (!resultsEl) return;

    if (!term || !term.trim()) {
        resultsEl.classList.add('hidden');
        resultsEl.innerHTML = '';
        return;
    }

    var search = term.toLowerCase().trim();
    var products = getData('products') || [];
    var clients  = getData('clients') || [];
    var orders   = getData('orders') || [];

    // Search products
    var matchedProducts = products.filter(function (p) {
        return (p.name && p.name.toLowerCase().indexOf(search) !== -1) ||
               (p.id && String(p.id).toLowerCase().indexOf(search) !== -1);
    }).slice(0, 5);

    // Search clients
    var matchedClients = clients.filter(function (c) {
        return (c.name && c.name.toLowerCase().indexOf(search) !== -1) ||
               (c.cuit && String(c.cuit).toLowerCase().indexOf(search) !== -1);
    }).slice(0, 5);

    // Search orders
    var matchedOrders = orders.filter(function (o) {
        return (o.id && String(o.id).toLowerCase().indexOf(search) !== -1) ||
               (o.clientName && o.clientName.toLowerCase().indexOf(search) !== -1);
    }).slice(0, 5);

    var totalResults = matchedProducts.length + matchedClients.length + matchedOrders.length;

    if (totalResults === 0) {
        resultsEl.innerHTML = '<div class="px-4 py-6 text-center text-gray-500 text-sm">No se encontraron resultados para "' + escapeHtml(term) + '"</div>';
        resultsEl.classList.remove('hidden');
        return;
    }

    var html = '';

    // Products group
    if (matchedProducts.length > 0) {
        html += '<div class="px-3 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">Productos</div>';
        for (var i = 0; i < matchedProducts.length; i++) {
            var p = matchedProducts[i];
            html += '<a href="products.html?id=' + encodeURIComponent(p.id) + '" class="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors cursor-pointer">' +
                '<div class="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">' +
                    '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>' +
                '</div>' +
                '<div class="flex-1 min-w-0">' +
                    '<p class="text-sm font-medium text-gray-800 truncate">' + escapeHtml(p.name || '') + '</p>' +
                    '<p class="text-xs text-gray-500">ID: ' + escapeHtml(String(p.id || '')) + '</p>' +
                '</div>' +
            '</a>';
        }
    }

    // Clients group
    if (matchedClients.length > 0) {
        html += '<div class="px-3 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">Clientes</div>';
        for (var j = 0; j < matchedClients.length; j++) {
            var c = matchedClients[j];
            html += '<a href="clients.html?id=' + encodeURIComponent(c.id || c.cuit) + '" class="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors cursor-pointer">' +
                '<div class="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">' +
                    '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>' +
                '</div>' +
                '<div class="flex-1 min-w-0">' +
                    '<p class="text-sm font-medium text-gray-800 truncate">' + escapeHtml(c.name || '') + '</p>' +
                    '<p class="text-xs text-gray-500">CUIT: ' + escapeHtml(String(c.cuit || '')) + '</p>' +
                '</div>' +
            '</a>';
        }
    }

    // Orders group
    if (matchedOrders.length > 0) {
        html += '<div class="px-3 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">Pedidos</div>';
        for (var k = 0; k < matchedOrders.length; k++) {
            var o = matchedOrders[k];
            html += '<a href="orders.html?id=' + encodeURIComponent(o.id) + '" class="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors cursor-pointer">' +
                '<div class="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0">' +
                    '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>' +
                '</div>' +
                '<div class="flex-1 min-w-0">' +
                    '<p class="text-sm font-medium text-gray-800 truncate">Pedido #' + escapeHtml(String(o.id || '')) + '</p>' +
                    '<p class="text-xs text-gray-500">' + escapeHtml(o.clientName || '') + '</p>' +
                '</div>' +
            '</a>';
        }
    }

    resultsEl.innerHTML = html;
    resultsEl.classList.remove('hidden');
}


/* ---------------------------------------------------------------
   STATUS BADGE HELPERS
   --------------------------------------------------------------- */
function statusBadge(status) {
    if (!status) return '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">—</span>';

    var lower = status.toLowerCase().trim();
    var colorMap = {
        'pendiente':       'bg-yellow-100 text-yellow-800',
        'en preparación':  'bg-blue-100 text-blue-800',
        'en preparacion':  'bg-blue-100 text-blue-800',
        'despachado':      'bg-purple-100 text-purple-800',
        'entregado':       'bg-green-100 text-green-800',
        'planificada':     'bg-gray-100 text-gray-700',
        'en curso':        'bg-blue-100 text-blue-800',
        'finalizada':      'bg-green-100 text-green-800',
        'active':          'bg-green-100 text-green-800',
        'activo':          'bg-green-100 text-green-800',
        'inactive':        'bg-red-100 text-red-800',
        'inactivo':        'bg-red-100 text-red-800',
        'descontinuado':   'bg-gray-100 text-gray-700',
        'cancelado':       'bg-red-100 text-red-800'
    };

    var dotMap = {
        'bg-yellow-100 text-yellow-800': 'bg-yellow-500',
        'bg-blue-100 text-blue-800':     'bg-blue-500',
        'bg-purple-100 text-purple-800': 'bg-purple-500',
        'bg-green-100 text-green-800':   'bg-green-500',
        'bg-gray-100 text-gray-700':     'bg-gray-400',
        'bg-red-100 text-red-800':       'bg-red-500'
    };

    var classes = colorMap[lower] || 'bg-gray-100 text-gray-700';
    var dot = dotMap[classes] || 'bg-gray-400';

    return '<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ' + classes + '">' +
        '<span class="w-1.5 h-1.5 rounded-full ' + dot + '"></span>' +
        escapeHtml(status) +
    '</span>';
}

function stockBadge(stock, minStock) {
    stock    = parseInt(stock) || 0;
    minStock = parseInt(minStock) || 0;

    var classes, text;

    if (stock === 0) {
        classes = 'bg-red-100 text-red-800';
        text = '<span class="w-1.5 h-1.5 rounded-full bg-red-500"></span>Sin stock';
    } else if (stock <= minStock) {
        classes = 'bg-yellow-100 text-yellow-800';
        text = '<span class="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>' + stock + ' uds.';
    } else {
        classes = 'bg-green-100 text-green-800';
        text = '<span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>' + stock + ' uds.';
    }

    return '<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ' + classes + '">' +
        text +
    '</span>';
}


/* ---------------------------------------------------------------
   ROLE / ACCESS CHECK
   --------------------------------------------------------------- */
function checkAccess() {
    var session = getSession();

    if (!session || !session.user || !session.role) {
        window.location.href = 'index.html';
        return;
    }

    // Hide admin-only elements for non-admin users
    if (session.role !== 'admin') {
        var adminElements = document.querySelectorAll('.admin-only');
        for (var i = 0; i < adminElements.length; i++) {
            adminElements[i].style.display = 'none';
        }
    }

    return session;
}


/* ---------------------------------------------------------------
   BREADCRUMB
   --------------------------------------------------------------- */
function setBreadcrumb(section) {
    var breadcrumb = document.getElementById('breadcrumb');
    if (!breadcrumb) return;
    var labels = {
        dashboard: 'Dashboard', productos: 'Productos / Stock', pedidos: 'Pedidos',
        clientes: 'Clientes', produccion: 'Producción', consultas: 'Consultas Web',
        usuarios: 'Usuarios', configuracion: 'Configuración', leads: 'Nuevos Clientes'
    };
    var label = labels[section] || section;
    breadcrumb.innerHTML =
        '<a href="#dashboard" class="text-gray-500 hover:text-primary transition-colors">Inicio</a>' +
        '<svg class="w-4 h-4 text-gray-400 mx-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>' +
        '<span class="text-gray-800 font-medium">' + escapeHtml(label) + '</span>';
}
