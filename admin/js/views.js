/* ============================================================
   views.js — All view rendering + CRUD for Santana Hnos. Admin
   Depends on: data.js, helpers.js
   ============================================================ */

// ── View State ──
const viewState = {
    productos: { page: 1, search: '', categoryFilter: '', brandFilter: '', stockFilter: '', sortCol: 'id', sortDir: 'asc' },
    pedidos: { page: 1, search: '', statusFilter: '', sortCol: 'date', sortDir: 'desc' },
    clientes: { page: 1, search: '', typeFilter: '', sortCol: 'name', sortDir: 'asc' },
    produccion: { page: 1, search: '' },
    consultas: { filter: 'all' },
    usuarios: { page: 1 }
};

const ITEMS_PER_PAGE = 8;
const mc = () => document.getElementById('main-content');

/* ================================================================
   DASHBOARD VIEW
   ================================================================ */
function renderDashboard() {
    const products = getData('sh_products');
    const orders = getData('sh_orders');
    const queries = getData('sh_queries');
    const production = getData('sh_production');

    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const inStock = products.filter(p => p.stock > 0).length;
    const lowStock = products.filter(p => p.stock > 0 && p.stock <= p.minStock).length;
    const noStock = products.filter(p => p.stock === 0).length;
    const ordersThisMonth = orders.filter(o => { const d = new Date(o.date); return d.getMonth() === thisMonth && d.getFullYear() === thisYear; });
    const pendingOrders = orders.filter(o => o.status === 'Pendiente').length;
    const unreadQueries = queries.filter(q => !q.read).length;
    const weekAgo = new Date(now.getTime() - 7 * 86400000);
    const queriesThisWeek = queries.filter(q => new Date(q.date) >= weekAgo).length;
    const prodThisMonth = production.filter(p => { const d = new Date(p.startDate); return d.getMonth() === thisMonth && d.getFullYear() === thisYear; }).reduce((s, p) => s + p.quantity, 0);

    // Bar chart data — orders by month last 6 months
    const months = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date(thisYear, thisMonth - i, 1);
        months.push({ month: d.getMonth(), year: d.getFullYear(), label: d.toLocaleString('es-AR', { month: 'short' }).replace('.', '') });
    }
    const ordersByMonth = months.map(m => {
        return { label: m.label, count: orders.filter(o => { const d = new Date(o.date); return d.getMonth() === m.month && d.getFullYear() === m.year; }).length };
    });
    const maxOrders = Math.max(...ordersByMonth.map(o => o.count), 1);

    const lastOrders = [...orders].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
    const lastQueries = [...queries].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

    mc().innerHTML = `
    <h1 class="text-2xl font-heading font-bold text-gray-800 mb-6">Dashboard</h1>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        ${summaryCard('Productos en Stock', inStock, `${lowStock} con stock bajo`, 'green', boxIcon())}
        ${summaryCard('Pedidos del Mes', ordersThisMonth.length, `${pendingOrders} pendientes`, 'blue', cartIcon())}
        ${summaryCard('Consultas sin Leer', unreadQueries, `${queriesThisWeek} esta semana`, 'amber', mailIcon())}
        ${summaryCard('Producción Mensual', prodThisMonth + ' uds', `${production.filter(p => p.status === 'En curso').length} en curso`, 'emerald', factoryIcon())}
    </div>

    <!-- Chart -->
    <div class="bg-white rounded-xl shadow-sm p-6 mb-8">
        <h2 class="text-lg font-heading font-bold text-gray-800 mb-4">Pedidos por Mes</h2>
        <div class="flex items-end gap-3 h-48">
            ${ordersByMonth.map(m => `
                <div class="flex-1 flex flex-col items-center justify-end h-full">
                    <span class="text-xs font-bold text-gray-600 mb-1">${m.count}</span>
                    <div class="w-full bg-primary rounded-t-md transition-all" style="height:${Math.max((m.count / maxOrders) * 100, 4)}%"></div>
                    <span class="text-xs text-gray-500 mt-2 capitalize">${m.label}</span>
                </div>
            `).join('')}
        </div>
    </div>

    <!-- Tables Row -->
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <!-- Last Orders -->
        <div class="bg-white rounded-xl shadow-sm overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h2 class="font-heading font-bold text-gray-800">Últimos Pedidos</h2>
                <a href="#pedidos" class="text-sm text-primary hover:underline">Ver todos</a>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead><tr class="bg-gray-50 text-gray-500 text-xs uppercase">
                        <th class="px-4 py-3 text-left">#</th>
                        <th class="px-4 py-3 text-left">Cliente</th>
                        <th class="px-4 py-3 text-left">Fecha</th>
                        <th class="px-4 py-3 text-right">Total</th>
                        <th class="px-4 py-3 text-center">Estado</th>
                    </tr></thead>
                    <tbody>
                        ${lastOrders.map((o, i) => `<tr class="${i % 2 ? 'bg-gray-50/50' : ''} hover:bg-gray-50 cursor-pointer" onclick="navigate('#pedidos')">
                            <td class="px-4 py-3 font-medium text-gray-700">${o.id}</td>
                            <td class="px-4 py-3 text-gray-600">${o.clientName}</td>
                            <td class="px-4 py-3 text-gray-500">${formatDate(o.date)}</td>
                            <td class="px-4 py-3 text-right font-medium">${formatPrice(o.total)}</td>
                            <td class="px-4 py-3 text-center">${statusBadge(o.status)}</td>
                        </tr>`).join('')}
                        ${lastOrders.length === 0 ? '<tr><td colspan="5" class="px-4 py-8 text-center text-gray-400">Sin pedidos</td></tr>' : ''}
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Last Queries -->
        <div class="bg-white rounded-xl shadow-sm overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h2 class="font-heading font-bold text-gray-800">Consultas Recientes</h2>
                <a href="#consultas" class="text-sm text-primary hover:underline">Ver todas</a>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead><tr class="bg-gray-50 text-gray-500 text-xs uppercase">
                        <th class="px-4 py-3 w-4"></th>
                        <th class="px-4 py-3 text-left">Nombre</th>
                        <th class="px-4 py-3 text-left">Mensaje</th>
                        <th class="px-4 py-3 text-left">Fecha</th>
                    </tr></thead>
                    <tbody>
                        ${lastQueries.map((q, i) => `<tr class="${i % 2 ? 'bg-gray-50/50' : ''} ${!q.read ? 'font-medium' : ''} hover:bg-gray-50 cursor-pointer" onclick="navigate('#consultas')">
                            <td class="px-4 py-3"><span class="w-2.5 h-2.5 rounded-full inline-block ${!q.read ? 'bg-gold' : 'bg-gray-300'}"></span></td>
                            <td class="px-4 py-3 text-gray-700">${q.name}</td>
                            <td class="px-4 py-3 text-gray-500 truncate max-w-[200px]">${q.message.substring(0, 50)}${q.message.length > 50 ? '...' : ''}</td>
                            <td class="px-4 py-3 text-gray-400">${formatDate(q.date)}</td>
                        </tr>`).join('')}
                        ${lastQueries.length === 0 ? '<tr><td colspan="4" class="px-4 py-8 text-center text-gray-400">Sin consultas</td></tr>' : ''}
                    </tbody>
                </table>
            </div>
        </div>
    </div>`;
}

function summaryCard(title, value, sub, color, icon) {
    const colors = { green: 'bg-green-100 text-green-600', blue: 'bg-blue-100 text-blue-600', amber: 'bg-amber-100 text-amber-600', emerald: 'bg-emerald-100 text-emerald-700' };
    return `<div class="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
        <div class="w-14 h-14 rounded-xl ${colors[color] || colors.green} flex items-center justify-center flex-shrink-0">${icon}</div>
        <div>
            <p class="text-sm text-gray-500">${title}</p>
            <p class="text-2xl font-heading font-bold text-gray-800">${value}</p>
            <p class="text-xs text-yellow-600 mt-0.5">${sub}</p>
        </div>
    </div>`;
}

function boxIcon() { return '<svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"/></svg>'; }
function cartIcon() { return '<svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"/></svg>'; }
function mailIcon() { return '<svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/></svg>'; }
function factoryIcon() { return '<svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M11.42 15.17l-5.1-3.06A1.5 1.5 0 004.5 13.41V20.25h15V9.75a1.5 1.5 0 00-.82-1.34l-5.1-3.06a1.5 1.5 0 00-1.58 0l-5.1 3.06"/></svg>'; }

/* ================================================================
   PRODUCTOS VIEW
   ================================================================ */
function renderProductos() {
    let data = getData('sh_products');
    const allData = data;
    const st = viewState.productos;

    // Get unique categories and brands from actual data
    const categories = [...new Set(allData.map(p => p.category))].filter(Boolean).sort();
    const brands = [...new Set(allData.map(p => p.brand))].filter(Boolean).sort();

    // Filter
    if (st.search) data = data.filter(p => (p.name + p.id + p.brand + p.model).toLowerCase().includes(st.search.toLowerCase()));
    if (st.categoryFilter) data = data.filter(p => p.category === st.categoryFilter);
    if (st.brandFilter) data = data.filter(p => p.brand === st.brandFilter);
    if (st.stockFilter === 'ok') data = data.filter(p => p.stock > p.minStock);
    else if (st.stockFilter === 'low') data = data.filter(p => p.stock > 0 && p.stock <= p.minStock);
    else if (st.stockFilter === 'out') data = data.filter(p => p.stock === 0);

    // Sort
    data = sortTable(data, st.sortCol, st.sortDir);

    const { items, totalPages, currentPage } = paginate(data, st.page, ITEMS_PER_PAGE);
    const arrow = (col) => st.sortCol === col ? (st.sortDir === 'asc' ? ' ↑' : ' ↓') : '';

    mc().innerHTML = `
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 class="text-2xl font-heading font-bold text-gray-800">Productos / Stock</h1>
        <div class="flex gap-2 flex-wrap">
            <button onclick="showPriceIncrease()" class="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600">% Aumento</button>
            <button onclick="showDownloadOptions()" class="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Descargar Lista</button>
            <button onclick="newProduct()" class="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-green-800">+ Nuevo Producto</button>
        </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-col sm:flex-row gap-3 flex-wrap">
        <input type="text" placeholder="Buscar producto..." value="${st.search}" oninput="viewState.productos.search=this.value;viewState.productos.page=1;renderProductos()"
            class="flex-1 min-w-[200px] border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary">
        <select onchange="viewState.productos.categoryFilter=this.value;viewState.productos.page=1;renderProductos()" class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary">
            <option value="">Todas las categorias</option>
            ${categories.map(c => `<option value="${c}" ${st.categoryFilter === c ? 'selected' : ''}>${c}</option>`).join('')}
        </select>
        <select onchange="viewState.productos.brandFilter=this.value;viewState.productos.page=1;renderProductos()" class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary">
            <option value="">Todas las marcas</option>
            ${brands.map(b => `<option value="${b}" ${st.brandFilter === b ? 'selected' : ''}>${b}</option>`).join('')}
        </select>
        <select onchange="viewState.productos.stockFilter=this.value;viewState.productos.page=1;renderProductos()" class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary">
            <option value="" ${!st.stockFilter ? 'selected' : ''}>Todo el stock</option>
            <option value="ok" ${st.stockFilter === 'ok' ? 'selected' : ''}>Stock OK</option>
            <option value="low" ${st.stockFilter === 'low' ? 'selected' : ''}>Stock Bajo</option>
            <option value="out" ${st.stockFilter === 'out' ? 'selected' : ''}>Sin Stock</option>
        </select>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead><tr class="bg-gray-50 text-gray-500 text-xs uppercase">
                    <th class="px-4 py-3 text-left cursor-pointer hover:text-gray-700" onclick="sortProductos('id')">Código${arrow('id')}</th>
                    <th class="px-4 py-3 text-left cursor-pointer hover:text-gray-700" onclick="sortProductos('name')">Producto${arrow('name')}</th>
                    <th class="px-4 py-3 text-left cursor-pointer hover:text-gray-700" onclick="sortProductos('category')">Categoría${arrow('category')}</th>
                    <th class="px-4 py-3 text-left">Marca/Modelo</th>
                    <th class="px-4 py-3 text-center cursor-pointer hover:text-gray-700" onclick="sortProductos('stock')">Stock${arrow('stock')}</th>
                    <th class="px-4 py-3 text-right cursor-pointer hover:text-gray-700" onclick="sortProductos('price')">Precio${arrow('price')}</th>
                    <th class="px-4 py-3 text-center">Estado</th>
                    <th class="px-4 py-3 text-center">Acciones</th>
                </tr></thead>
                <tbody>
                    ${items.map((p, i) => `<tr class="${i % 2 ? 'bg-gray-50/50' : ''} hover:bg-gray-50">
                        <td class="px-4 py-3 font-mono text-xs font-medium text-gray-700">${p.id}</td>
                        <td class="px-4 py-3 text-gray-800 font-medium max-w-[250px] truncate">${p.name}</td>
                        <td class="px-4 py-3 text-gray-600">${p.category}</td>
                        <td class="px-4 py-3 text-gray-500 text-xs">${p.brand} ${p.model}</td>
                        <td class="px-4 py-3 text-center">${stockBadge(p.stock, p.minStock)}</td>
                        <td class="px-4 py-3 text-right font-medium">${formatPrice(p.price)}</td>
                        <td class="px-4 py-3 text-center">${statusBadge(p.status === 'active' ? 'Activo' : 'Descontinuado')}</td>
                        <td class="px-4 py-3 text-center">
                            <button onclick="editProduct('${p.id}')" class="text-blue-600 hover:text-blue-800 mr-2" title="Editar">
                                <svg class="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"/></svg>
                            </button>
                            <button onclick="deleteProduct('${p.id}')" class="text-red-500 hover:text-red-700" title="Eliminar">
                                <svg class="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/></svg>
                            </button>
                        </td>
                    </tr>`).join('')}
                    ${items.length === 0 ? '<tr><td colspan="8" class="px-4 py-8 text-center text-gray-400">No se encontraron productos</td></tr>' : ''}
                </tbody>
            </table>
        </div>
        ${totalPages > 1 ? renderPagination(totalPages, currentPage, 'productosPage') : ''}
    </div>`;
}

function sortProductos(col) {
    const st = viewState.productos;
    if (st.sortCol === col) st.sortDir = st.sortDir === 'asc' ? 'desc' : 'asc';
    else { st.sortCol = col; st.sortDir = 'asc'; }
    renderProductos();
}

function productosPage(n) { viewState.productos.page = n; renderProductos(); }

function newProduct() {
    openModal('Nuevo Producto', productFormHtml(), `
        <button onclick="closeModal()" class="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
        <button onclick="saveProduct()" class="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-green-800">Guardar</button>
    `);
}

function editProduct(id) {
    const p = getRecord('sh_products', id);
    if (!p) return;
    openModal('Editar Producto', productFormHtml(p), `
        <button onclick="closeModal()" class="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
        <button onclick="saveProduct('${id}')" class="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-green-800">Guardar</button>
    `);
}

function productFormHtml(p = {}) {
    const isEdit = !!p.id;
    return `<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Código</label>
            <input id="f-id" type="text" value="${p.id || ''}" ${isEdit ? 'readonly class="bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-sm w-full"' : 'class="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:border-primary"'} placeholder="ROT-XXX">
        </div>
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <select id="f-category" class="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:border-primary">
                ${['Rótula','Extremo','Terminal','Brazo','Buje','Kit'].map(c => `<option ${p.category === c ? 'selected' : ''}>${c}</option>`).join('')}
            </select>
        </div>
        <div class="sm:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input id="f-name" type="text" value="${p.name || ''}" class="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:border-primary" placeholder="Nombre del producto">
        </div>
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Marca</label>
            <input id="f-brand" type="text" value="${p.brand || ''}" class="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:border-primary">
        </div>
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
            <input id="f-model" type="text" value="${p.model || ''}" class="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:border-primary">
        </div>
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Stock Actual</label>
            <input id="f-stock" type="number" min="0" value="${p.stock ?? 0}" class="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:border-primary">
        </div>
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Stock Mínimo</label>
            <input id="f-minStock" type="number" min="0" value="${p.minStock ?? 5}" class="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:border-primary">
        </div>
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Precio Unitario ($)</label>
            <input id="f-price" type="number" min="0" step="0.01" value="${p.price || ''}" class="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:border-primary">
        </div>
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select id="f-status" class="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:border-primary">
                <option value="active" ${p.status === 'active' ? 'selected' : ''}>Activo</option>
                <option value="descontinuado" ${p.status === 'descontinuado' ? 'selected' : ''}>Descontinuado</option>
            </select>
        </div>
    </div>`;
}

function saveProduct(editId) {
    const data = {
        id: editId || document.getElementById('f-id').value.trim(),
        name: document.getElementById('f-name').value.trim(),
        category: document.getElementById('f-category').value,
        brand: document.getElementById('f-brand').value.trim(),
        model: document.getElementById('f-model').value.trim(),
        stock: parseInt(document.getElementById('f-stock').value) || 0,
        minStock: parseInt(document.getElementById('f-minStock').value) || 5,
        price: parseFloat(document.getElementById('f-price').value) || 0,
        status: document.getElementById('f-status').value
    };
    if (!data.id || !data.name) { showToast('Completá código y nombre', 'error'); return; }
    if (editId) {
        updateRecord('sh_products', editId, data);
        showToast('Producto actualizado');
    } else {
        if (getRecord('sh_products', data.id)) { showToast('Ya existe un producto con ese código', 'error'); return; }
        data.createdAt = new Date().toISOString().split('T')[0];
        addRecord('sh_products', data);
        showToast('Producto creado');
    }
    closeModal();
    updateNotifications();
    renderProductos();
}

function deleteProduct(id) {
    confirmDelete(() => {
        deleteRecord('sh_products', id);
        showToast('Producto eliminado', 'warning');
        updateNotifications();
        renderProductos();
    });
}

function showDownloadOptions() {
    openModal('Descargar Lista de Precios', `
        <p class="text-sm text-gray-600 mb-4">Selecciona el formato de descarga:</p>
        <div class="flex flex-col gap-3">
            <button onclick="downloadListaPDF();closeModal()" class="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                <div class="w-10 h-10 bg-red-100 text-red-600 rounded-lg flex items-center justify-center font-bold text-sm">PDF</div>
                <div class="text-left">
                    <p class="font-medium text-gray-800">Lista de Precios PDF</p>
                    <p class="text-xs text-gray-500">Con logo, formato profesional, agrupado por marca</p>
                </div>
            </button>
            <button onclick="downloadListaCSV();closeModal()" class="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                <div class="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center font-bold text-sm">CSV</div>
                <div class="text-left">
                    <p class="font-medium text-gray-800">Lista de Precios CSV</p>
                    <p class="text-xs text-gray-500">Para Excel, con todas las columnas</p>
                </div>
            </button>
        </div>
    `, `<button onclick="closeModal()" class="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cerrar</button>`);
}

function downloadListaCSV() {
    const data = getData('sh_products');
    exportCSV(data, [
        { key: 'id', label: 'Codigo' }, { key: 'name', label: 'Producto' }, { key: 'category', label: 'Categoria' },
        { key: 'brand', label: 'Marca' }, { key: 'model', label: 'Modelo' }, { key: 'stock', label: 'Stock' },
        { key: 'minStock', label: 'Stock Min.' }, { key: 'price', label: 'Precio' }, { key: 'status', label: 'Estado' }
    ], 'lista_precios_santana_hnos.csv');
    showToast('CSV descargado');
}

function downloadListaPDF() {
    // Uses the same generatePDF from the homepage if available, otherwise basic jsPDF
    const products = getData('sh_products').filter(p => p.status === 'active');
    if (typeof window.jspdf === 'undefined') {
        // Load jsPDF dynamically
        const s1 = document.createElement('script');
        s1.src = '../lib/jspdf.umd.min.js';
        s1.onload = () => {
            const s2 = document.createElement('script');
            s2.src = '../lib/jspdf.plugin.autotable.min.js';
            s2.onload = () => {
                const s3 = document.createElement('script');
                s3.src = '../lib/logo-base64.js';
                s3.onload = () => _generateAdminPDF(products);
                document.head.appendChild(s3);
            };
            document.head.appendChild(s2);
        };
        document.head.appendChild(s1);
    } else {
        _generateAdminPDF(products);
    }
}

function _generateAdminPDF(products) {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        const pageW = doc.internal.pageSize.getWidth();
        const pageH = doc.internal.pageSize.getHeight();

        // Header background (dark green)
        doc.setFillColor(13, 51, 24);
        doc.rect(0, 0, pageW, 46, 'F');

        // Gold accent line
        doc.setFillColor(193, 154, 61);
        doc.rect(0, 46, pageW, 1.5, 'F');

        // Logo
        if (typeof LOGO_BASE64 !== 'undefined') {
            doc.addImage(LOGO_BASE64, 'PNG', 14, 5, 28, 28);
        }

        // Company name
        doc.setTextColor(212, 216, 219);
        doc.setFontSize(28);
        doc.setFont('helvetica', 'bold');
        doc.text('SANTANA HNOS.', pageW / 2 + 10, 18, { align: 'center' });

        // Subtitle
        doc.setFontSize(11);
        doc.setTextColor(193, 154, 61);
        doc.text('FABRICA DE ROTULAS Y EXTREMOS DE DIRECCION', pageW / 2 + 10, 26, { align: 'center' });

        // Contact info
        doc.setFontSize(8);
        doc.setTextColor(180, 180, 180);
        doc.text('Av. Int. Carlos Ratti 3744, Ituzaingo, Buenos Aires  |  Tel: 11 5051-5118  |  santanahnos1@gmail.com', pageW / 2, 38, { align: 'center' });

        // List title
        doc.setFontSize(14);
        doc.setTextColor(13, 51, 24);
        doc.setFont('helvetica', 'bold');
        doc.text('LISTA DE PRECIOS - Lista 96', pageW / 2, 56, { align: 'center' });

        // Date
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.setFont('helvetica', 'normal');
        const now = new Date();
        doc.text('Fecha: ' + now.toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' }), pageW / 2, 62, { align: 'center' });

        // Group by brand
        const byBrand = {};
        products.forEach(p => {
            const b = (p.brand || '').toUpperCase();
            if (!byBrand[b]) byBrand[b] = [];
            byBrand[b].push(p);
        });

        const brandOrder = ['FORD', 'VOLKSWAGEN', 'CHEVROLET', 'RENAULT', 'PEUGEOT', 'FIAT', 'TOYOTA', 'CHERY', 'MERCEDES-BENZ'];
        const brandNames = { 'FORD': 'FORD', 'VOLKSWAGEN': 'VOLKSWAGEN', 'CHEVROLET': 'CHEVROLET', 'RENAULT': 'RENAULT', 'PEUGEOT': 'PEUGEOT / CITROEN', 'FIAT': 'FIAT', 'TOYOTA': 'TOYOTA', 'CHERY': 'CHERY', 'MERCEDES-BENZ': 'MERCEDES-BENZ' };
        const sortedBrands = brandOrder.filter(b => byBrand[b]);
        Object.keys(byBrand).forEach(b => { if (!sortedBrands.includes(b)) sortedBrands.push(b); });

        let startY = 68;

        sortedBrands.forEach(brand => {
            const items = byBrand[brand];
            const rows = items.map(p => [
                p.id,
                p.name,
                '$' + Number(p.price).toLocaleString('es-AR', { minimumFractionDigits: 2 })
            ]);

            doc.autoTable({
                startY: startY,
                head: [[{ content: (brandNames[brand] || brand) + ' (' + items.length + ' productos)', colSpan: 3, styles: { fillColor: [13, 51, 24], textColor: [193, 154, 61], fontStyle: 'bold', fontSize: 10, halign: 'left' } }],
                       ['Codigo', 'Descripcion', 'Precio']],
                body: rows,
                theme: 'grid',
                styles: {
                    fontSize: 8,
                    cellPadding: 2,
                    lineColor: [220, 220, 220],
                    lineWidth: 0.2,
                },
                headStyles: {
                    fillColor: [240, 240, 240],
                    textColor: [50, 50, 50],
                    fontStyle: 'bold',
                    fontSize: 8,
                },
                columnStyles: {
                    0: { cellWidth: 25, fontStyle: 'bold', textColor: [80, 80, 80] },
                    1: { cellWidth: 'auto' },
                    2: { cellWidth: 30, halign: 'right', fontStyle: 'bold', textColor: [13, 51, 24] },
                },
                alternateRowStyles: {
                    fillColor: [248, 249, 250],
                },
                margin: { left: 15, right: 15 },
                didDrawPage: function(data) {
                    // Footer on each page
                    doc.setFillColor(13, 51, 24);
                    doc.rect(0, pageH - 12, pageW, 12, 'F');
                    doc.setFontSize(7);
                    doc.setTextColor(180, 180, 180);
                    doc.text('SANTANA HNOS. - Precios sujetos a modificacion sin previo aviso - IVA no incluido', pageW / 2, pageH - 6, { align: 'center' });
                    doc.text('Pag. ' + doc.internal.getCurrentPageInfo().pageNumber, pageW - 15, pageH - 6, { align: 'right' });
                }
            });
            startY = doc.lastAutoTable.finalY + 6;
        });

        doc.save('Santana_Hnos_Lista_Precios.pdf');
        showToast('PDF descargado');
    } catch (e) {
        showToast('Error al generar PDF', 'error');
        console.error(e);
    }
}

function showPriceIncrease() {
    openModal('Aumento Porcentual de Precios', `
        <p class="text-sm text-gray-600 mb-4">Ingresa el porcentaje de aumento a aplicar sobre <strong>todos los productos</strong>.</p>
        <div class="flex items-center gap-3 mb-4">
            <input type="number" id="price-increase-pct" min="0.1" max="500" step="0.1" value="10" placeholder="Ej: 10"
                class="w-32 border border-gray-200 rounded-lg px-4 py-3 text-lg font-bold text-center focus:outline-none focus:border-primary">
            <span class="text-2xl font-bold text-gray-500">%</span>
        </div>
        <div class="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
            <strong>Atencion:</strong> Esto modificara los precios en toda la lista, incluyendo lo que se muestra en la pagina web publica y las descargas de PDF/CSV.
        </div>
    `, `
        <button onclick="closeModal()" class="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
        <button onclick="applyPriceIncrease()" class="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600">Aplicar Aumento</button>
    `);
}

function applyPriceIncrease() {
    const pct = parseFloat(document.getElementById('price-increase-pct').value);
    if (!pct || pct <= 0 || pct > 500) {
        showToast('Porcentaje invalido', 'error');
        return;
    }
    const factor = 1 + (pct / 100);
    const products = getData('sh_products');
    products.forEach(p => {
        p.price = Math.round(p.price * factor * 100) / 100;
    });
    setData('sh_products', products);

    // Also update the products.json data used by the homepage catalog
    try {
        const catalogProducts = products.map(p => ({
            c: p.id,
            d: p.name,
            b: p.brand.toUpperCase() === 'MERCEDES-BENZ' ? 'MERCEDES-BENZ' : p.brand.toUpperCase(),
            p: p.price
        }));
        localStorage.setItem('sh_catalog_products', JSON.stringify(catalogProducts));
    } catch(e) {}

    closeModal();
    showToast('Aumento del ' + pct + '% aplicado a ' + products.length + ' productos');
    renderProductos();
}

/* ================================================================
   PEDIDOS VIEW
   ================================================================ */
function renderPedidos() {
    let data = getData('sh_orders');
    const st = viewState.pedidos;

    if (st.search) data = data.filter(o => (o.id + o.clientName).toLowerCase().includes(st.search.toLowerCase()));
    if (st.statusFilter) data = data.filter(o => o.status === st.statusFilter);
    data = sortTable(data, st.sortCol, st.sortDir);

    const { items, totalPages, currentPage } = paginate(data, st.page, ITEMS_PER_PAGE);
    const statuses = ['Pendiente', 'En preparación', 'Despachado', 'Entregado'];

    mc().innerHTML = `
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 class="text-2xl font-heading font-bold text-gray-800">Pedidos</h1>
        <button onclick="newOrder()" class="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-green-800">+ Nuevo Pedido</button>
    </div>
    <div class="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-col sm:flex-row gap-3">
        <input type="text" placeholder="Buscar pedido o cliente..." value="${st.search}" oninput="viewState.pedidos.search=this.value;viewState.pedidos.page=1;renderPedidos()"
            class="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary">
        <select onchange="viewState.pedidos.statusFilter=this.value;viewState.pedidos.page=1;renderPedidos()" class="border border-gray-200 rounded-lg px-3 py-2 text-sm">
            <option value="">Todos los estados</option>
            ${statuses.map(s => `<option value="${s}" ${st.statusFilter === s ? 'selected' : ''}>${s}</option>`).join('')}
        </select>
    </div>
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead><tr class="bg-gray-50 text-gray-500 text-xs uppercase">
                    <th class="px-4 py-3 text-left">#Pedido</th>
                    <th class="px-4 py-3 text-left">Cliente</th>
                    <th class="px-4 py-3 text-left">Fecha</th>
                    <th class="px-4 py-3 text-center">Items</th>
                    <th class="px-4 py-3 text-right">Total</th>
                    <th class="px-4 py-3 text-center">Estado</th>
                    <th class="px-4 py-3 text-center">Acciones</th>
                </tr></thead>
                <tbody>
                    ${items.map((o, i) => `<tr class="${i % 2 ? 'bg-gray-50/50' : ''} hover:bg-gray-50">
                        <td class="px-4 py-3 font-mono text-xs font-medium">${o.id}</td>
                        <td class="px-4 py-3 text-gray-700">${o.clientName}</td>
                        <td class="px-4 py-3 text-gray-500">${formatDate(o.date)}</td>
                        <td class="px-4 py-3 text-center">${o.items.length}</td>
                        <td class="px-4 py-3 text-right font-medium">${formatPrice(o.total)}</td>
                        <td class="px-4 py-3 text-center">
                            <select onchange="changeOrderStatus('${o.id}',this.value)" class="text-xs border rounded px-2 py-1 focus:outline-none">
                                ${statuses.map(s => `<option value="${s}" ${o.status === s ? 'selected' : ''}>${s}</option>`).join('')}
                            </select>
                        </td>
                        <td class="px-4 py-3 text-center">
                            <button onclick="viewOrder('${o.id}')" class="text-blue-600 hover:text-blue-800 mr-2" title="Ver detalle">
                                <svg class="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                            </button>
                            <button onclick="deleteOrder('${o.id}')" class="text-red-500 hover:text-red-700" title="Eliminar">
                                <svg class="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/></svg>
                            </button>
                        </td>
                    </tr>`).join('')}
                    ${items.length === 0 ? '<tr><td colspan="7" class="px-4 py-8 text-center text-gray-400">No se encontraron pedidos</td></tr>' : ''}
                </tbody>
            </table>
        </div>
        ${totalPages > 1 ? renderPagination(totalPages, currentPage, 'pedidosPage') : ''}
    </div>`;
}

function pedidosPage(n) { viewState.pedidos.page = n; renderPedidos(); }

function viewOrder(id) {
    const o = getRecord('sh_orders', id);
    if (!o) return;
    openModal(`Pedido ${o.id}`, `
        <div class="mb-4">
            <p class="text-sm text-gray-500">Cliente: <strong class="text-gray-700">${o.clientName}</strong></p>
            <p class="text-sm text-gray-500">Fecha: <strong class="text-gray-700">${formatDate(o.date)}</strong></p>
            <p class="text-sm text-gray-500">Estado: ${statusBadge(o.status)}</p>
        </div>
        <table class="w-full text-sm border-t">
            <thead><tr class="bg-gray-50 text-xs text-gray-500 uppercase">
                <th class="px-3 py-2 text-left">Producto</th>
                <th class="px-3 py-2 text-center">Cant.</th>
                <th class="px-3 py-2 text-right">P. Unit.</th>
                <th class="px-3 py-2 text-right">Subtotal</th>
            </tr></thead>
            <tbody>
                ${o.items.map((it, i) => `<tr class="${i % 2 ? 'bg-gray-50' : ''}">
                    <td class="px-3 py-2">${it.productName}</td>
                    <td class="px-3 py-2 text-center">${it.quantity}</td>
                    <td class="px-3 py-2 text-right">${formatPrice(it.unitPrice)}</td>
                    <td class="px-3 py-2 text-right font-medium">${formatPrice(it.quantity * it.unitPrice)}</td>
                </tr>`).join('')}
            </tbody>
            <tfoot><tr class="border-t font-bold">
                <td colspan="3" class="px-3 py-3 text-right">TOTAL:</td>
                <td class="px-3 py-3 text-right text-primary">${formatPrice(o.total)}</td>
            </tr></tfoot>
        </table>
    `, `<button onclick="closeModal()" class="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cerrar</button>`);
}

function changeOrderStatus(id, status) {
    updateRecord('sh_orders', id, { status });
    showToast('Estado actualizado');
    updateNotifications();
}

function newOrder() {
    const clients = getData('sh_clients');
    const products = getData('sh_products').filter(p => p.status === 'active');
    openModal('Nuevo Pedido', `
        <div class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                <select id="f-order-client" class="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:border-primary">
                    <option value="">Seleccionar cliente...</option>
                    ${clients.map(c => `<option value="${c.id}" data-name="${c.name}">${c.name}</option>`).join('')}
                </select>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Productos</label>
                <div id="order-items-container">
                    <div class="order-item flex gap-2 mb-2 items-center">
                        <select onchange="updateOrderItemPrice(this)" class="oi-product flex-1 border border-gray-200 rounded-lg px-2 py-2 text-sm">
                            <option value="">Producto...</option>
                            ${products.map(p => `<option value="${p.id}" data-price="${p.price}" data-name="${p.name}">${p.id} - ${p.name}</option>`).join('')}
                        </select>
                        <input type="number" min="1" value="1" oninput="calcOrderTotal()" class="oi-qty w-16 border border-gray-200 rounded-lg px-2 py-2 text-sm text-center">
                        <span class="oi-price text-sm text-gray-500 w-24 text-right">$0</span>
                    </div>
                </div>
                <button onclick="addOrderItem()" class="text-sm text-primary hover:underline mt-1">+ Agregar producto</button>
            </div>
            <div class="text-right border-t pt-3">
                <span class="text-lg font-bold text-gray-800">Total: <span id="order-total">$0</span></span>
            </div>
        </div>
    `, `
        <button onclick="closeModal()" class="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancelar</button>
        <button onclick="saveOrder()" class="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-green-800">Crear Pedido</button>
    `);
}

function addOrderItem() {
    const products = getData('sh_products').filter(p => p.status === 'active');
    const container = document.getElementById('order-items-container');
    const div = document.createElement('div');
    div.className = 'order-item flex gap-2 mb-2 items-center';
    div.innerHTML = `
        <select onchange="updateOrderItemPrice(this)" class="oi-product flex-1 border border-gray-200 rounded-lg px-2 py-2 text-sm">
            <option value="">Producto...</option>
            ${products.map(p => `<option value="${p.id}" data-price="${p.price}" data-name="${p.name}">${p.id} - ${p.name}</option>`).join('')}
        </select>
        <input type="number" min="1" value="1" oninput="calcOrderTotal()" class="oi-qty w-16 border border-gray-200 rounded-lg px-2 py-2 text-sm text-center">
        <span class="oi-price text-sm text-gray-500 w-24 text-right">$0</span>
        <button onclick="this.parentElement.remove();calcOrderTotal()" class="text-red-400 hover:text-red-600">✕</button>
    `;
    container.appendChild(div);
}

function updateOrderItemPrice(sel) {
    const opt = sel.selectedOptions[0];
    const price = parseFloat(opt?.dataset.price || 0);
    const row = sel.closest('.order-item');
    row.querySelector('.oi-price').textContent = formatPrice(price);
    calcOrderTotal();
}

function calcOrderTotal() {
    let total = 0;
    document.querySelectorAll('.order-item').forEach(row => {
        const sel = row.querySelector('.oi-product');
        const qty = parseInt(row.querySelector('.oi-qty').value) || 0;
        const price = parseFloat(sel.selectedOptions[0]?.dataset.price || 0);
        total += qty * price;
    });
    const el = document.getElementById('order-total');
    if (el) el.textContent = formatPrice(total);
}

function saveOrder() {
    const clientSel = document.getElementById('f-order-client');
    const clientId = clientSel.value;
    const clientName = clientSel.selectedOptions[0]?.dataset.name || '';
    if (!clientId) { showToast('Seleccioná un cliente', 'error'); return; }

    const items = [];
    let total = 0;
    document.querySelectorAll('.order-item').forEach(row => {
        const sel = row.querySelector('.oi-product');
        const qty = parseInt(row.querySelector('.oi-qty').value) || 0;
        const opt = sel.selectedOptions[0];
        if (sel.value && qty > 0) {
            const unitPrice = parseFloat(opt.dataset.price || 0);
            items.push({ productId: sel.value, productName: opt.dataset.name || sel.value, quantity: qty, unitPrice });
            total += qty * unitPrice;
        }
    });
    if (items.length === 0) { showToast('Agregá al menos un producto', 'error'); return; }

    const order = {
        id: generateId('PED'),
        clientId, clientName, items, total,
        date: new Date().toISOString().split('T')[0],
        status: 'Pendiente',
        createdAt: new Date().toISOString().split('T')[0]
    };
    addRecord('sh_orders', order);
    // Update client lastOrder
    updateRecord('sh_clients', clientId, { lastOrder: order.date });
    closeModal();
    showToast('Pedido creado');
    updateNotifications();
    renderPedidos();
}

function deleteOrder(id) {
    confirmDelete(() => {
        deleteRecord('sh_orders', id);
        showToast('Pedido eliminado', 'warning');
        renderPedidos();
    });
}

/* ================================================================
   CLIENTES VIEW
   ================================================================ */
function renderClientes() {
    let data = getData('sh_clients');
    const st = viewState.clientes;

    if (st.search) data = data.filter(c => (c.name + c.cuit + c.email + c.city).toLowerCase().includes(st.search.toLowerCase()));
    if (st.typeFilter) data = data.filter(c => c.type === st.typeFilter);
    data = sortTable(data, st.sortCol, st.sortDir);

    const { items, totalPages, currentPage } = paginate(data, st.page, ITEMS_PER_PAGE);

    mc().innerHTML = `
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 class="text-2xl font-heading font-bold text-gray-800">Clientes</h1>
        <div class="flex gap-2">
            <button onclick="exportClientes()" class="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Exportar CSV</button>
            <button onclick="newClient()" class="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-green-800">+ Nuevo Cliente</button>
        </div>
    </div>
    <div class="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-col sm:flex-row gap-3">
        <input type="text" placeholder="Buscar cliente..." value="${st.search}" oninput="viewState.clientes.search=this.value;viewState.clientes.page=1;renderClientes()"
            class="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary">
        <select onchange="viewState.clientes.typeFilter=this.value;viewState.clientes.page=1;renderClientes()" class="border border-gray-200 rounded-lg px-3 py-2 text-sm">
            <option value="">Todos los tipos</option>
            ${['Taller','Casa de repuestos','Distribuidor','Particular'].map(t => `<option value="${t}" ${st.typeFilter === t ? 'selected' : ''}>${t}</option>`).join('')}
        </select>
    </div>
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead><tr class="bg-gray-50 text-gray-500 text-xs uppercase">
                    <th class="px-4 py-3 text-left">Nombre</th>
                    <th class="px-4 py-3 text-left">CUIT</th>
                    <th class="px-4 py-3 text-left">Tipo</th>
                    <th class="px-4 py-3 text-left">Teléfono</th>
                    <th class="px-4 py-3 text-left">Localidad</th>
                    <th class="px-4 py-3 text-left">Últ. Pedido</th>
                    <th class="px-4 py-3 text-center">Acciones</th>
                </tr></thead>
                <tbody>
                    ${items.map((c, i) => `<tr class="${i % 2 ? 'bg-gray-50/50' : ''} hover:bg-gray-50">
                        <td class="px-4 py-3 font-medium text-gray-800">${c.name}</td>
                        <td class="px-4 py-3 font-mono text-xs text-gray-500">${c.cuit}</td>
                        <td class="px-4 py-3">${statusBadge(c.type)}</td>
                        <td class="px-4 py-3 text-gray-600">${c.phone}</td>
                        <td class="px-4 py-3 text-gray-600">${c.city}</td>
                        <td class="px-4 py-3 text-gray-500">${c.lastOrder ? formatDate(c.lastOrder) : '-'}</td>
                        <td class="px-4 py-3 text-center whitespace-nowrap">
                            <button onclick="editClient('${c.id}')" class="text-blue-600 hover:text-blue-800 mr-1" title="Editar">
                                <svg class="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"/></svg>
                            </button>
                            <button onclick="viewClientOrders('${c.id}')" class="text-green-600 hover:text-green-800 mr-1" title="Ver pedidos">
                                <svg class="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z"/></svg>
                            </button>
                            <button onclick="deleteClient('${c.id}')" class="text-red-500 hover:text-red-700" title="Eliminar">
                                <svg class="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/></svg>
                            </button>
                        </td>
                    </tr>`).join('')}
                    ${items.length === 0 ? '<tr><td colspan="7" class="px-4 py-8 text-center text-gray-400">No se encontraron clientes</td></tr>' : ''}
                </tbody>
            </table>
        </div>
        ${totalPages > 1 ? renderPagination(totalPages, currentPage, 'clientesPage') : ''}
    </div>`;
}

function clientesPage(n) { viewState.clientes.page = n; renderClientes(); }

function clientFormHtml(c = {}) {
    return `<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="sm:col-span-2"><label class="block text-sm font-medium text-gray-700 mb-1">Nombre / Razón Social</label>
            <input id="f-cname" type="text" value="${c.name || ''}" class="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:border-primary"></div>
        <div><label class="block text-sm font-medium text-gray-700 mb-1">CUIT</label>
            <input id="f-ccuit" type="text" value="${c.cuit || ''}" placeholder="XX-XXXXXXXX-X" class="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:border-primary"></div>
        <div><label class="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select id="f-ctype" class="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:border-primary">
                ${['Taller','Casa de repuestos','Distribuidor','Particular'].map(t => `<option ${c.type === t ? 'selected' : ''}>${t}</option>`).join('')}
            </select></div>
        <div><label class="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
            <input id="f-cphone" type="text" value="${c.phone || ''}" class="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:border-primary"></div>
        <div><label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input id="f-cemail" type="email" value="${c.email || ''}" class="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:border-primary"></div>
        <div><label class="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
            <input id="f-caddress" type="text" value="${c.address || ''}" class="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:border-primary"></div>
        <div><label class="block text-sm font-medium text-gray-700 mb-1">Localidad</label>
            <input id="f-ccity" type="text" value="${c.city || ''}" class="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:border-primary"></div>
    </div>`;
}

function newClient() {
    openModal('Nuevo Cliente', clientFormHtml(), `
        <button onclick="closeModal()" class="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancelar</button>
        <button onclick="saveClient()" class="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-green-800">Guardar</button>`);
}

function editClient(id) {
    const c = getRecord('sh_clients', id);
    if (!c) return;
    openModal('Editar Cliente', clientFormHtml(c), `
        <button onclick="closeModal()" class="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancelar</button>
        <button onclick="saveClient('${id}')" class="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-green-800">Guardar</button>`);
}

function saveClient(editId) {
    const data = {
        name: document.getElementById('f-cname').value.trim(),
        cuit: document.getElementById('f-ccuit').value.trim(),
        type: document.getElementById('f-ctype').value,
        phone: document.getElementById('f-cphone').value.trim(),
        email: document.getElementById('f-cemail').value.trim(),
        address: document.getElementById('f-caddress').value.trim(),
        city: document.getElementById('f-ccity').value.trim()
    };
    if (!data.name) { showToast('Completá el nombre', 'error'); return; }
    if (editId) {
        updateRecord('sh_clients', editId, data);
        showToast('Cliente actualizado');
    } else {
        data.id = generateId('CLI');
        data.lastOrder = null;
        data.createdAt = new Date().toISOString().split('T')[0];
        addRecord('sh_clients', data);
        showToast('Cliente creado');
    }
    closeModal();
    renderClientes();
}

function deleteClient(id) {
    confirmDelete(() => {
        deleteRecord('sh_clients', id);
        showToast('Cliente eliminado', 'warning');
        renderClientes();
    });
}

function viewClientOrders(id) {
    const client = getRecord('sh_clients', id);
    const orders = getData('sh_orders').filter(o => o.clientId === id);
    openModal(`Pedidos de ${client?.name || id}`, orders.length === 0
        ? '<p class="text-gray-400 text-center py-4">Este cliente no tiene pedidos</p>'
        : `<table class="w-full text-sm">
            <thead><tr class="bg-gray-50 text-xs text-gray-500 uppercase">
                <th class="px-3 py-2 text-left">#</th>
                <th class="px-3 py-2 text-left">Fecha</th>
                <th class="px-3 py-2 text-center">Items</th>
                <th class="px-3 py-2 text-right">Total</th>
                <th class="px-3 py-2 text-center">Estado</th>
            </tr></thead>
            <tbody>
                ${orders.map((o, i) => `<tr class="${i % 2 ? 'bg-gray-50' : ''}">
                    <td class="px-3 py-2 font-mono text-xs">${o.id}</td>
                    <td class="px-3 py-2">${formatDate(o.date)}</td>
                    <td class="px-3 py-2 text-center">${o.items.length}</td>
                    <td class="px-3 py-2 text-right font-medium">${formatPrice(o.total)}</td>
                    <td class="px-3 py-2 text-center">${statusBadge(o.status)}</td>
                </tr>`).join('')}
            </tbody>
        </table>`,
    `<button onclick="closeModal()" class="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cerrar</button>`);
}

function exportClientes() {
    exportCSV(getData('sh_clients'), [
        { key: 'name', label: 'Nombre' }, { key: 'cuit', label: 'CUIT' }, { key: 'type', label: 'Tipo' },
        { key: 'phone', label: 'Teléfono' }, { key: 'email', label: 'Email' }, { key: 'city', label: 'Localidad' }
    ], 'clientes_santana_hnos.csv');
    showToast('CSV exportado');
}

/* ================================================================
   PRODUCCIÓN VIEW
   ================================================================ */
function renderProduccion() {
    let data = getData('sh_production');
    const st = viewState.produccion;

    if (st.search) data = data.filter(p => (p.id + p.productName + p.responsible).toLowerCase().includes(st.search.toLowerCase()));

    const enCurso = data.filter(p => p.status === 'En curso').length;
    const finalizadas = data.filter(p => p.status === 'Finalizada').length;
    const planificadas = data.filter(p => p.status === 'Planificada').length;

    const { items, totalPages, currentPage } = paginate(data, st.page, ITEMS_PER_PAGE);

    mc().innerHTML = `
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 class="text-2xl font-heading font-bold text-gray-800">Producción</h1>
        <button onclick="newProduction()" class="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-green-800">+ Nueva Orden</button>
    </div>

    <!-- Mini stats -->
    <div class="grid grid-cols-3 gap-4 mb-6">
        <div class="bg-white rounded-xl shadow-sm p-4 text-center">
            <p class="text-2xl font-heading font-bold text-gray-400">${planificadas}</p>
            <p class="text-xs text-gray-500">Planificadas</p>
        </div>
        <div class="bg-white rounded-xl shadow-sm p-4 text-center">
            <p class="text-2xl font-heading font-bold text-blue-600">${enCurso}</p>
            <p class="text-xs text-gray-500">En curso</p>
        </div>
        <div class="bg-white rounded-xl shadow-sm p-4 text-center">
            <p class="text-2xl font-heading font-bold text-green-600">${finalizadas}</p>
            <p class="text-xs text-gray-500">Finalizadas</p>
        </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm p-4 mb-6">
        <input type="text" placeholder="Buscar orden de producción..." value="${st.search}" oninput="viewState.produccion.search=this.value;viewState.produccion.page=1;renderProduccion()"
            class="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary">
    </div>

    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead><tr class="bg-gray-50 text-gray-500 text-xs uppercase">
                    <th class="px-4 py-3 text-left">#OP</th>
                    <th class="px-4 py-3 text-left">Producto</th>
                    <th class="px-4 py-3 text-center">Cantidad</th>
                    <th class="px-4 py-3 text-left">Inicio</th>
                    <th class="px-4 py-3 text-left">Fin Est.</th>
                    <th class="px-4 py-3 text-center">Estado</th>
                    <th class="px-4 py-3 text-left">Responsable</th>
                    <th class="px-4 py-3 text-center">Acciones</th>
                </tr></thead>
                <tbody>
                    ${items.map((p, i) => `<tr class="${i % 2 ? 'bg-gray-50/50' : ''} hover:bg-gray-50">
                        <td class="px-4 py-3 font-mono text-xs font-medium">${p.id}</td>
                        <td class="px-4 py-3 text-gray-700">${p.productName}</td>
                        <td class="px-4 py-3 text-center font-medium">${p.quantity}</td>
                        <td class="px-4 py-3 text-gray-500">${formatDate(p.startDate)}</td>
                        <td class="px-4 py-3 text-gray-500">${formatDate(p.endDate)}</td>
                        <td class="px-4 py-3 text-center">${statusBadge(p.status)}</td>
                        <td class="px-4 py-3 text-gray-600">${p.responsible}</td>
                        <td class="px-4 py-3 text-center whitespace-nowrap">
                            <button onclick="editProduction('${p.id}')" class="text-blue-600 hover:text-blue-800 mr-2" title="Editar">
                                <svg class="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"/></svg>
                            </button>
                            <button onclick="deleteProduction('${p.id}')" class="text-red-500 hover:text-red-700" title="Eliminar">
                                <svg class="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/></svg>
                            </button>
                        </td>
                    </tr>`).join('')}
                    ${items.length === 0 ? '<tr><td colspan="8" class="px-4 py-8 text-center text-gray-400">No se encontraron órdenes</td></tr>' : ''}
                </tbody>
            </table>
        </div>
        ${totalPages > 1 ? renderPagination(totalPages, currentPage, 'produccionPage') : ''}
    </div>`;
}

function produccionPage(n) { viewState.produccion.page = n; renderProduccion(); }

function productionFormHtml(p = {}) {
    const products = getData('sh_products');
    return `<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="sm:col-span-2"><label class="block text-sm font-medium text-gray-700 mb-1">Producto</label>
            <select id="f-pprod" class="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:border-primary">
                ${products.map(pr => `<option value="${pr.id}" data-name="${pr.name}" ${p.productId === pr.id ? 'selected' : ''}>${pr.id} - ${pr.name}</option>`).join('')}
            </select></div>
        <div><label class="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
            <input id="f-pqty" type="number" min="1" value="${p.quantity || 100}" class="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:border-primary"></div>
        <div><label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select id="f-pstatus" class="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:border-primary">
                ${['Planificada','En curso','Finalizada'].map(s => `<option ${p.status === s ? 'selected' : ''}>${s}</option>`).join('')}
            </select></div>
        <div><label class="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
            <input id="f-pstart" type="date" value="${p.startDate || new Date().toISOString().split('T')[0]}" class="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:border-primary"></div>
        <div><label class="block text-sm font-medium text-gray-700 mb-1">Fecha Est. Fin</label>
            <input id="f-pend" type="date" value="${p.endDate || ''}" class="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:border-primary"></div>
        <div><label class="block text-sm font-medium text-gray-700 mb-1">Responsable</label>
            <input id="f-presp" type="text" value="${p.responsible || ''}" class="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:border-primary"></div>
        <div><label class="block text-sm font-medium text-gray-700 mb-1">Notas</label>
            <input id="f-pnotes" type="text" value="${p.notes || ''}" class="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:border-primary"></div>
    </div>`;
}

function newProduction() {
    openModal('Nueva Orden de Producción', productionFormHtml(), `
        <button onclick="closeModal()" class="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancelar</button>
        <button onclick="saveProduction()" class="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-green-800">Guardar</button>`);
}

function editProduction(id) {
    const p = getRecord('sh_production', id);
    if (!p) return;
    openModal('Editar Orden de Producción', productionFormHtml(p), `
        <button onclick="closeModal()" class="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancelar</button>
        <button onclick="saveProduction('${id}')" class="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-green-800">Guardar</button>`);
}

function saveProduction(editId) {
    const prodSel = document.getElementById('f-pprod');
    const data = {
        productId: prodSel.value,
        productName: prodSel.selectedOptions[0]?.dataset.name || prodSel.value,
        quantity: parseInt(document.getElementById('f-pqty').value) || 0,
        status: document.getElementById('f-pstatus').value,
        startDate: document.getElementById('f-pstart').value,
        endDate: document.getElementById('f-pend').value,
        responsible: document.getElementById('f-presp').value.trim(),
        notes: document.getElementById('f-pnotes').value.trim()
    };
    if (editId) {
        updateRecord('sh_production', editId, data);
        showToast('Orden actualizada');
    } else {
        data.id = generateId('OP');
        data.createdAt = new Date().toISOString().split('T')[0];
        addRecord('sh_production', data);
        showToast('Orden creada');
    }
    closeModal();
    renderProduccion();
}

function deleteProduction(id) {
    confirmDelete(() => {
        deleteRecord('sh_production', id);
        showToast('Orden eliminada', 'warning');
        renderProduccion();
    });
}

/* ================================================================
   CONSULTAS WEB VIEW
   ================================================================ */
function renderConsultas() {
    let data = getData('sh_queries');
    const filter = viewState.consultas.filter;

    if (filter === 'unread') data = data.filter(q => !q.read);
    else if (filter === 'read') data = data.filter(q => q.read);

    data.sort((a, b) => new Date(b.date) - new Date(a.date));

    const allQueries = getData('sh_queries');
    const unreadCount = allQueries.filter(q => !q.read).length;

    mc().innerHTML = `
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 class="text-2xl font-heading font-bold text-gray-800">Consultas Web</h1>
        <span class="text-sm text-gray-500">${unreadCount} sin leer</span>
    </div>

    <!-- Filter tabs -->
    <div class="flex gap-1 mb-6 bg-white rounded-xl shadow-sm p-1 w-fit">
        ${['all', 'unread', 'read'].map(f => {
            const labels = { all: 'Todas', unread: `No leídas (${unreadCount})`, read: 'Leídas' };
            const active = filter === f;
            return `<button onclick="filterConsultas('${f}')" class="px-4 py-2 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'}">${labels[f]}</button>`;
        }).join('')}
    </div>

    <!-- Inbox list -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden divide-y divide-gray-100">
        ${data.map(q => `
            <div class="flex items-start gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors ${!q.read ? 'bg-amber-50/30' : ''}" onclick="viewQuery('${q.id}')">
                <span class="w-2.5 h-2.5 rounded-full mt-2 flex-shrink-0 ${!q.read ? 'bg-gold' : 'bg-gray-300'}"></span>
                <div class="flex-1 min-w-0">
                    <div class="flex justify-between items-start gap-2">
                        <p class="font-medium text-gray-800 ${!q.read ? 'font-bold' : ''}">${q.name}</p>
                        <span class="text-xs text-gray-400 whitespace-nowrap">${formatDate(q.date)}</span>
                    </div>
                    <p class="text-sm text-gray-500">${q.email} · ${q.phone}</p>
                    <p class="text-sm text-gray-400 truncate mt-0.5">${q.message.substring(0, 80)}${q.message.length > 80 ? '...' : ''}</p>
                </div>
            </div>
        `).join('')}
        ${data.length === 0 ? '<div class="px-5 py-8 text-center text-gray-400">No hay consultas</div>' : ''}
    </div>`;
}

function filterConsultas(f) { viewState.consultas.filter = f; renderConsultas(); }

function viewQuery(id) {
    const q = getRecord('sh_queries', id);
    if (!q) return;
    // Mark as read
    if (!q.read) {
        updateRecord('sh_queries', id, { read: true });
        updateNotifications();
    }
    openModal('Consulta Web', `
        <div class="space-y-3">
            <div class="flex gap-4 text-sm">
                <div><span class="text-gray-400">Nombre:</span> <strong class="text-gray-700">${q.name}</strong></div>
            </div>
            <div class="flex flex-wrap gap-4 text-sm">
                <div><span class="text-gray-400">Email:</span> <a href="mailto:${q.email}" class="text-primary hover:underline">${q.email}</a></div>
                <div><span class="text-gray-400">Teléfono:</span> <span class="text-gray-700">${q.phone}</span></div>
            </div>
            <div class="text-sm"><span class="text-gray-400">Fecha:</span> <span class="text-gray-700">${formatDateTime(q.date)}</span></div>
            <div class="border-t pt-3 mt-3">
                <p class="text-gray-700 leading-relaxed">${q.message}</p>
            </div>
        </div>
    `, `
        <button onclick="deleteQuery('${q.id}')" class="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100">Eliminar</button>
        <a href="mailto:${q.email}?subject=Re: Consulta Santana Hnos.&body=Hola ${q.name},%0A%0A" class="inline-block px-4 py-2 bg-gold text-white rounded-lg text-sm font-medium hover:bg-yellow-600">Responder por Email</a>
        <button onclick="closeModal()" class="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cerrar</button>
    `);
    renderConsultas();
}

function deleteQuery(id) {
    confirmDelete(() => {
        deleteRecord('sh_queries', id);
        closeModal();
        showToast('Consulta eliminada', 'warning');
        updateNotifications();
        renderConsultas();
    });
}

/* ================================================================
   USUARIOS VIEW (admin only)
   ================================================================ */
function renderUsuarios() {
    if (!isAdmin()) { navigate('#dashboard'); return; }
    const data = getData('sh_users');

    mc().innerHTML = `
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 class="text-2xl font-heading font-bold text-gray-800">Usuarios</h1>
        <button onclick="newUser()" class="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-green-800">+ Nuevo Usuario</button>
    </div>
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead><tr class="bg-gray-50 text-gray-500 text-xs uppercase">
                    <th class="px-4 py-3 text-left">Usuario</th>
                    <th class="px-4 py-3 text-left">Nombre</th>
                    <th class="px-4 py-3 text-center">Rol</th>
                    <th class="px-4 py-3 text-left">Último Acceso</th>
                    <th class="px-4 py-3 text-center">Estado</th>
                    <th class="px-4 py-3 text-center">Acciones</th>
                </tr></thead>
                <tbody>
                    ${data.map((u, i) => `<tr class="${i % 2 ? 'bg-gray-50/50' : ''} hover:bg-gray-50">
                        <td class="px-4 py-3 font-mono text-xs font-medium">${u.username}</td>
                        <td class="px-4 py-3 text-gray-700">${u.name}</td>
                        <td class="px-4 py-3 text-center">${statusBadge(u.role)}</td>
                        <td class="px-4 py-3 text-gray-500">${formatDate(u.lastAccess)}</td>
                        <td class="px-4 py-3 text-center">${statusBadge(u.status === 'active' ? 'Activo' : 'Inactivo')}</td>
                        <td class="px-4 py-3 text-center whitespace-nowrap">
                            <button onclick="editUser('${u.id}')" class="text-blue-600 hover:text-blue-800 mr-2" title="Editar">
                                <svg class="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"/></svg>
                            </button>
                            ${u.username !== getSession()?.user ? `<button onclick="deleteUser('${u.id}')" class="text-red-500 hover:text-red-700" title="Eliminar">
                                <svg class="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/></svg>
                            </button>` : '<span class="text-xs text-gray-400">Vos</span>'}
                        </td>
                    </tr>`).join('')}
                </tbody>
            </table>
        </div>
    </div>`;
}

function userFormHtml(u = {}) {
    const isEdit = !!u.id;
    return `<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><label class="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
            <input id="f-uuser" type="text" value="${u.username || ''}" ${isEdit ? 'readonly class="bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-sm w-full"' : 'class="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:border-primary"'}></div>
        <div><label class="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
            <input id="f-uname" type="text" value="${u.name || ''}" class="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:border-primary"></div>
        <div><label class="block text-sm font-medium text-gray-700 mb-1">Rol</label>
            <select id="f-urole" class="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:border-primary">
                ${['admin','deposito','ventas','produccion'].map(r => `<option value="${r}" ${u.role === r ? 'selected' : ''}>${r.charAt(0).toUpperCase() + r.slice(1)}</option>`).join('')}
            </select></div>
        <div><label class="block text-sm font-medium text-gray-700 mb-1">Contraseña${isEdit ? ' (vacío = no cambiar)' : ''}</label>
            <input id="f-upass" type="password" class="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:border-primary" placeholder="${isEdit ? '••••••••' : ''}"></div>
        <div><label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select id="f-ustatus" class="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:border-primary">
                <option value="active" ${u.status === 'active' ? 'selected' : ''}>Activo</option>
                <option value="inactive" ${u.status === 'inactive' ? 'selected' : ''}>Inactivo</option>
            </select></div>
    </div>`;
}

function newUser() {
    openModal('Nuevo Usuario', userFormHtml(), `
        <button onclick="closeModal()" class="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancelar</button>
        <button onclick="saveUser()" class="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-green-800">Guardar</button>`);
}

function editUser(id) {
    const u = getRecord('sh_users', id);
    if (!u) return;
    openModal('Editar Usuario', userFormHtml(u), `
        <button onclick="closeModal()" class="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancelar</button>
        <button onclick="saveUser('${id}')" class="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-green-800">Guardar</button>`);
}

function saveUser(editId) {
    const data = {
        username: document.getElementById('f-uuser').value.trim(),
        name: document.getElementById('f-uname').value.trim(),
        role: document.getElementById('f-urole').value,
        status: document.getElementById('f-ustatus').value
    };
    if (!data.username || !data.name) { showToast('Completá usuario y nombre', 'error'); return; }
    if (editId) {
        updateRecord('sh_users', editId, data);
        showToast('Usuario actualizado');
    } else {
        const pass = document.getElementById('f-upass').value;
        if (!pass) { showToast('Ingresá una contraseña', 'error'); return; }
        data.id = generateId('USR');
        data.lastAccess = new Date().toISOString().split('T')[0];
        addRecord('sh_users', data);
        showToast('Usuario creado');
    }
    closeModal();
    renderUsuarios();
}

function deleteUser(id) {
    const session = getSession();
    const user = getRecord('sh_users', id);
    if (user && user.username === session?.user) { showToast('No podés eliminar tu propio usuario', 'error'); return; }
    confirmDelete(() => {
        deleteRecord('sh_users', id);
        showToast('Usuario eliminado', 'warning');
        renderUsuarios();
    });
}

/* ================================================================
   CONFIGURACIÓN VIEW (admin only)
   ================================================================ */
function renderConfiguracion() {
    if (!isAdmin()) { navigate('#dashboard'); return; }
    const config = getConfig();

    mc().innerHTML = `
    <h1 class="text-2xl font-heading font-bold text-gray-800 mb-6">Configuración</h1>
    <div class="bg-white rounded-xl shadow-sm p-6 max-w-2xl">
        <h2 class="text-lg font-heading font-bold text-gray-700 mb-4">Datos de la Empresa</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="sm:col-span-2"><label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input id="cfg-name" type="text" value="${config.name || ''}" class="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:border-primary"></div>
            <div class="sm:col-span-2"><label class="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                <input id="cfg-address" type="text" value="${config.address || ''}" class="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:border-primary"></div>
            <div><label class="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input id="cfg-phone" type="text" value="${config.phone || ''}" class="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:border-primary"></div>
            <div><label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input id="cfg-email" type="email" value="${config.email || ''}" class="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:border-primary"></div>
            <div><label class="block text-sm font-medium text-gray-700 mb-1">CUIT</label>
                <input id="cfg-cuit" type="text" value="${config.cuit || ''}" class="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:border-primary"></div>
            <div><label class="block text-sm font-medium text-gray-700 mb-1">Horario</label>
                <input id="cfg-schedule" type="text" value="${config.schedule || ''}" class="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:border-primary"></div>
            <div><label class="block text-sm font-medium text-gray-700 mb-1">Umbral Stock Bajo</label>
                <input id="cfg-threshold" type="number" min="1" value="${config.lowStockThreshold || 10}" class="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:border-primary"></div>
        </div>
        <div class="mt-6 flex justify-end">
            <button onclick="saveConfig()" class="px-6 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-green-800">Guardar Configuración</button>
        </div>
    </div>`;
}

function saveConfig() {
    const config = {
        name: document.getElementById('cfg-name').value.trim(),
        address: document.getElementById('cfg-address').value.trim(),
        phone: document.getElementById('cfg-phone').value.trim(),
        email: document.getElementById('cfg-email').value.trim(),
        cuit: document.getElementById('cfg-cuit').value.trim(),
        schedule: document.getElementById('cfg-schedule').value.trim(),
        lowStockThreshold: parseInt(document.getElementById('cfg-threshold').value) || 10
    };
    setConfig(config);
    showToast('Configuración guardada');
}

/* ================================================================
   NUEVOS CLIENTES / LEADS VIEW
   ================================================================ */
const leadsState = { page: 1, search: '', zonaFilter: '', tipoFilter: '', estadoFilter: '', contactFilter: '', lineaFilter: '', sortCol: 'nombre', sortDir: 'asc', activeZona: null };

function renderLeads() {
    if (!leadsState.activeZona) {
        renderLeadsFolders();
    } else {
        renderLeadsTable();
    }
}

function renderLeadsFolders() {
    const allLeads = getData('sh_leads') || [];
    const oesteCount = allLeads.length;
    const oestePhones = allLeads.filter(l => l.telefono).length;
    const oesteEmails = allLeads.filter(l => l.email).length;

    const folderSvg = `<svg class="w-12 h-12" fill="none" viewBox="0 0 48 48"><path d="M6 12a2 2 0 012-2h10l4 4h18a2 2 0 012 2v20a2 2 0 01-2 2H8a2 2 0 01-2-2V12z" fill="currentColor" opacity="0.15"/><path d="M6 12a2 2 0 012-2h10l4 4h18a2 2 0 012 2v20a2 2 0 01-2 2H8a2 2 0 01-2-2V12z" stroke="currentColor" stroke-width="2" fill="none"/></svg>`;
    const lockSvg = `<svg class="w-4 h-4 text-gray-400 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/></svg>`;

    mc().innerHTML = `
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
            <h1 class="text-2xl font-heading font-bold text-gray-800">Nuevos Clientes (Leads)</h1>
            <p class="text-sm text-gray-500 mt-1">Seleccioná una zona para ver los leads</p>
        </div>
        <div class="flex gap-2">
            <button onclick="importLeadsFromFile()" class="px-4 py-2 bg-gold text-white rounded-lg text-sm font-medium hover:bg-yellow-600">Importar JSON</button>
        </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <!-- Zona Oeste - Active -->
        <div onclick="leadsState.activeZona='Zona Oeste';renderLeads()" class="bg-white rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer border-2 border-transparent hover:border-primary group">
            <div class="p-6 text-center">
                <div class="text-primary mb-3 flex justify-center">${folderSvg}</div>
                <h3 class="font-heading font-bold text-lg text-gray-800 group-hover:text-primary transition-colors">Zona Oeste</h3>
                <div class="mt-3 space-y-1">
                    <p class="text-2xl font-bold text-primary">${oesteCount}</p>
                    <p class="text-xs text-gray-500">leads</p>
                </div>
                <div class="mt-3 flex justify-center gap-3 text-xs text-gray-500">
                    <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-green-500"></span>${oestePhones} tel.</span>
                    <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-blue-500"></span>${oesteEmails} email</span>
                </div>
            </div>
        </div>

        <!-- Zona Sur - Proximamente -->
        <div class="bg-white rounded-xl shadow-sm opacity-60 border-2 border-dashed border-gray-200">
            <div class="p-6 text-center">
                <div class="text-gray-300 mb-3 flex justify-center">${folderSvg}</div>
                <h3 class="font-heading font-bold text-lg text-gray-400 flex items-center justify-center">Zona Sur ${lockSvg}</h3>
                <div class="mt-4">
                    <span class="inline-block px-3 py-1 bg-gray-100 text-gray-400 rounded-full text-xs font-medium">Proximamente</span>
                </div>
            </div>
        </div>

        <!-- Zona Norte - Proximamente -->
        <div class="bg-white rounded-xl shadow-sm opacity-60 border-2 border-dashed border-gray-200">
            <div class="p-6 text-center">
                <div class="text-gray-300 mb-3 flex justify-center">${folderSvg}</div>
                <h3 class="font-heading font-bold text-lg text-gray-400 flex items-center justify-center">Zona Norte ${lockSvg}</h3>
                <div class="mt-4">
                    <span class="inline-block px-3 py-1 bg-gray-100 text-gray-400 rounded-full text-xs font-medium">Proximamente</span>
                </div>
            </div>
        </div>

        <!-- CABA - Proximamente -->
        <div class="bg-white rounded-xl shadow-sm opacity-60 border-2 border-dashed border-gray-200">
            <div class="p-6 text-center">
                <div class="text-gray-300 mb-3 flex justify-center">${folderSvg}</div>
                <h3 class="font-heading font-bold text-lg text-gray-400 flex items-center justify-center">CABA ${lockSvg}</h3>
                <div class="mt-4">
                    <span class="inline-block px-3 py-1 bg-gray-100 text-gray-400 rounded-full text-xs font-medium">Proximamente</span>
                </div>
            </div>
        </div>
    </div>

    <!-- Hidden file input for JSON import -->
    <input type="file" id="leads-file-input" accept=".json" class="hidden" onchange="handleLeadsFileImport(event)">
    `;
}

function renderLeadsTable() {
    let data = getData('sh_leads') || [];
    const st = leadsState;

    if (st.search) data = data.filter(l => ((l.nombre||'') + (l.localidad||'') + (l.telefono||'') + (l.email||'') + (l.direccion||'')).toLowerCase().includes(st.search.toLowerCase()));
    if (st.tipoFilter) data = data.filter(l => l.tipo === st.tipoFilter);
    if (st.estadoFilter) data = data.filter(l => l.estado === st.estadoFilter);
    if (st.contactFilter === 'email') data = data.filter(l => l.email);
    else if (st.contactFilter === 'telefono') data = data.filter(l => l.telefono);
    else if (st.contactFilter === 'web') data = data.filter(l => l.sitio_web);
    if (st.lineaFilter) data = data.filter(l => l.tipo_linea === st.lineaFilter);
    data = sortTable(data, st.sortCol, st.sortDir);

    const { items, totalPages, currentPage } = paginate(data, st.page, ITEMS_PER_PAGE);
    const allLeads = getData('sh_leads') || [];
    const tipos = [...new Set(allLeads.map(l => l.tipo).filter(Boolean))];

    const stats = {
        total: allLeads.length,
        conTelefono: allLeads.filter(l => l.telefono).length,
        conEmail: allLeads.filter(l => l.email).length,
        conWeb: allLeads.filter(l => l.sitio_web).length,
        nuevo: allLeads.filter(l => l.estado === 'nuevo').length,
        contactado: allLeads.filter(l => l.estado === 'contactado').length,
        cliente: allLeads.filter(l => l.estado === 'cliente').length,
    };

    mc().innerHTML = `
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div class="flex items-center gap-3">
            <button onclick="leadsState.activeZona=null;renderLeads()" class="p-2 rounded-lg hover:bg-gray-200 transition-colors text-gray-500 hover:text-gray-700" title="Volver a zonas">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/></svg>
            </button>
            <div>
                <h1 class="text-2xl font-heading font-bold text-gray-800">${st.activeZona}</h1>
                <p class="text-sm text-gray-500">Nuevos Clientes (Leads)</p>
            </div>
        </div>
        <div class="flex gap-2 flex-wrap">
            <button onclick="exportLeads()" class="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Exportar CSV</button>
            <button onclick="importLeadsFromFile()" class="px-4 py-2 bg-gold text-white rounded-lg text-sm font-medium hover:bg-yellow-600">Importar JSON</button>
            <button onclick="newLead()" class="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-green-800">+ Agregar Lead</button>
        </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-3 mb-6">
        <div class="bg-white rounded-xl shadow-md ring-1 ring-gray-100 p-4 text-center">
            <p class="text-2xl font-bold text-gray-800">${stats.total}</p><p class="text-xs text-gray-400 mt-1">Total</p>
        </div>
        <div class="bg-white rounded-xl shadow-md ring-1 ring-gray-100 p-4 text-center">
            <p class="text-2xl font-bold text-gray-700">${stats.conTelefono}</p><p class="text-xs text-gray-400 mt-1">Con Telefono</p>
        </div>
        <div class="bg-white rounded-xl shadow-md ring-1 ring-gray-100 p-4 text-center">
            <p class="text-2xl font-bold text-gray-700">${stats.conEmail}</p><p class="text-xs text-gray-400 mt-1">Con Email</p>
        </div>
        <div class="bg-white rounded-xl shadow-md ring-1 ring-gray-100 p-4 text-center">
            <p class="text-2xl font-bold text-gray-700">${stats.conWeb}</p><p class="text-xs text-gray-400 mt-1">Con Web</p>
        </div>
        <div class="bg-white rounded-xl shadow-md ring-1 ring-gray-100 p-4 text-center border-l-4 border-primary">
            <p class="text-2xl font-bold text-gray-800">${stats.nuevo}</p><p class="text-xs text-gray-400 mt-1">Nuevos</p>
        </div>
        <div class="bg-white rounded-xl shadow-md ring-1 ring-gray-100 p-4 text-center border-l-4 border-gray-400">
            <p class="text-2xl font-bold text-gray-700">${stats.contactado}</p><p class="text-xs text-gray-400 mt-1">Contactados</p>
        </div>
        <div class="bg-white rounded-xl shadow-md ring-1 ring-gray-100 p-4 text-center border-l-4 border-gray-400">
            <p class="text-2xl font-bold text-gray-700">${stats.cliente}</p><p class="text-xs text-gray-400 mt-1">Clientes</p>
        </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-col sm:flex-row gap-3 flex-wrap">
        <input type="text" placeholder="Buscar por nombre, localidad, telefono, email..." value="${st.search}" oninput="leadsState.search=this.value;leadsState.page=1;renderLeads()"
            class="flex-1 min-w-[200px] border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary">
        <select onchange="leadsState.tipoFilter=this.value;leadsState.page=1;renderLeads()" class="border border-gray-200 rounded-lg px-3 py-2 text-sm">
            <option value="">Todos los tipos</option>
            ${tipos.map(t => `<option value="${t}" ${st.tipoFilter === t ? 'selected' : ''}>${t}</option>`).join('')}
        </select>
        <select onchange="leadsState.contactFilter=this.value;leadsState.page=1;renderLeads()" class="border border-gray-200 rounded-lg px-3 py-2 text-sm">
            <option value="" ${!st.contactFilter ? 'selected' : ''}>Todos los contactos</option>
            <option value="email" ${st.contactFilter === 'email' ? 'selected' : ''}>Con Email</option>
            <option value="telefono" ${st.contactFilter === 'telefono' ? 'selected' : ''}>Con Telefono</option>
            <option value="web" ${st.contactFilter === 'web' ? 'selected' : ''}>Con Web</option>
        </select>
        <select onchange="leadsState.lineaFilter=this.value;leadsState.page=1;renderLeads()" class="border border-gray-200 rounded-lg px-3 py-2 text-sm">
            <option value="" ${!st.lineaFilter ? 'selected' : ''}>Fijo y Celular</option>
            <option value="fijo" ${st.lineaFilter === 'fijo' ? 'selected' : ''}>Solo Fijos</option>
            <option value="celular" ${st.lineaFilter === 'celular' ? 'selected' : ''}>Solo Celulares</option>
        </select>
        <select onchange="leadsState.estadoFilter=this.value;leadsState.page=1;renderLeads()" class="border border-gray-200 rounded-lg px-3 py-2 text-sm">
            <option value="" ${!st.estadoFilter ? 'selected' : ''}>Todos los estados</option>
            <option value="nuevo" ${st.estadoFilter === 'nuevo' ? 'selected' : ''}>Nuevos</option>
            <option value="contactado" ${st.estadoFilter === 'contactado' ? 'selected' : ''}>Contactados</option>
            <option value="cliente" ${st.estadoFilter === 'cliente' ? 'selected' : ''}>Clientes</option>
            <option value="descartado" ${st.estadoFilter === 'descartado' ? 'selected' : ''}>Descartados</option>
        </select>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead><tr class="bg-gray-50 text-gray-500 text-xs uppercase">
                    <th class="px-4 py-3 text-left cursor-pointer hover:text-gray-700" onclick="sortLeads('nombre')">Nombre</th>
                    <th class="px-4 py-3 text-left">Tipo</th>
                    <th class="px-4 py-3 text-left">Localidad</th>
                    <th class="px-4 py-3 text-left">Telefono</th>
                    <th class="px-4 py-3 text-center">Linea</th>
                    <th class="px-4 py-3 text-left">Email</th>
                    <th class="px-4 py-3 text-center cursor-pointer hover:text-gray-700" onclick="sortLeads('rating')">Rating</th>
                    <th class="px-4 py-3 text-center">Estado</th>
                    <th class="px-4 py-3 text-center">Acciones</th>
                </tr></thead>
                <tbody>
                    ${items.map((l, i) => `<tr class="${i % 2 ? 'bg-gray-50/50' : ''} hover:bg-gray-50">
                        <td class="px-4 py-3 font-medium text-gray-800 max-w-[200px] truncate">${l.nombre || '-'}</td>
                        <td class="px-4 py-3 text-gray-600 text-xs">${l.tipo || '-'}</td>
                        <td class="px-4 py-3 text-gray-600">${l.localidad || '-'}</td>
                        <td class="px-4 py-3 text-gray-600">${l.telefono || '-'}</td>
                        <td class="px-4 py-3 text-center">${l.tipo_linea === 'celular' ? '<span class="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">Celular</span>' : l.tipo_linea === 'fijo' ? '<span class="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">Fijo</span>' : '-'}</td>
                        <td class="px-4 py-3">${l.email ? `<a href="mailto:${l.email}" class="text-blue-600 hover:underline text-xs">${l.email}</a>` : '-'}</td>
                        <td class="px-4 py-3 text-center">${l.rating ? `<span class="text-yellow-500 font-medium">${l.rating} ★</span>` : '-'}</td>
                        <td class="px-4 py-3 text-center">
                            <select onchange="changeLeadEstado('${l.id}',this.value)" class="text-xs border rounded px-2 py-1 focus:outline-none">
                                ${['nuevo','contactado','cliente','descartado'].map(e => `<option value="${e}" ${l.estado === e ? 'selected' : ''}>${e.charAt(0).toUpperCase() + e.slice(1)}</option>`).join('')}
                            </select>
                        </td>
                        <td class="px-4 py-3 text-center whitespace-nowrap">
                            <button onclick="viewLead('${l.id}')" class="text-blue-600 hover:text-blue-800 mr-1" title="Ver detalle">
                                <svg class="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                            </button>
                            <button onclick="convertLeadToClient('${l.id}')" class="text-green-600 hover:text-green-800 mr-1" title="Convertir a cliente">
                                <svg class="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z"/></svg>
                            </button>
                            <button onclick="deleteLead('${l.id}')" class="text-red-500 hover:text-red-700" title="Eliminar">
                                <svg class="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/></svg>
                            </button>
                        </td>
                    </tr>`).join('')}
                    ${items.length === 0 ? '<tr><td colspan="9" class="px-4 py-8 text-center text-gray-400">No hay leads. Importa datos del scraper o agrega manualmente.</td></tr>' : ''}
                </tbody>
            </table>
        </div>
        ${totalPages > 1 ? renderPagination(totalPages, currentPage, 'leadsPage') : ''}
    </div>

    <!-- Hidden file input for JSON import -->
    <input type="file" id="leads-file-input" accept=".json" class="hidden" onchange="handleLeadsFileImport(event)">
    `;
}

function leadsPage(n) { leadsState.page = n; renderLeads(); }
function sortLeads(col) {
    if (leadsState.sortCol === col) leadsState.sortDir = leadsState.sortDir === 'asc' ? 'desc' : 'asc';
    else { leadsState.sortCol = col; leadsState.sortDir = 'asc'; }
    renderLeads();
}
function filterLeadsByEstado(val) {
    // Re-filter using a temporary state
    leadsState.estadoFilter = val;
    renderLeads();
}

function changeLeadEstado(id, estado) {
    updateRecord('sh_leads', id, { estado });
    showToast('Estado actualizado');
}

function viewLead(id) {
    const l = getRecord('sh_leads', id);
    if (!l) return;
    openModal(`${l.nombre}`, `
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div><span class="text-gray-400">Tipo:</span> <strong>${l.tipo || '-'}</strong></div>
            <div><span class="text-gray-400">Categoría Google:</span> <strong>${l.categoria || '-'}</strong></div>
            <div><span class="text-gray-400">Dirección:</span> <strong>${l.direccion || '-'}</strong></div>
            <div><span class="text-gray-400">Localidad:</span> <strong>${l.localidad || '-'}</strong></div>
            <div><span class="text-gray-400">Partido:</span> <strong>${l.partido || '-'}</strong></div>
            <div><span class="text-gray-400">Zona:</span> <strong>${l.zona || '-'}</strong></div>
            <div><span class="text-gray-400">Teléfono:</span> <strong>${l.telefono || '-'}</strong></div>
            <div><span class="text-gray-400">Celular/WhatsApp:</span> <strong>${l.whatsapp || l.celular || '-'}</strong></div>
            <div><span class="text-gray-400">Email:</span> <strong>${l.email ? `<a href="mailto:${l.email}" class="text-primary hover:underline">${l.email}</a>` : '-'}</strong></div>
            <div><span class="text-gray-400">Sitio Web:</span> <strong>${l.sitio_web ? `<a href="${l.sitio_web}" target="_blank" class="text-primary hover:underline">${l.sitio_web}</a>` : '-'}</strong></div>
            <div><span class="text-gray-400">Instagram:</span> <strong>${l.instagram ? `<a href="${l.instagram}" target="_blank" class="text-pink-600 hover:underline">${l.instagram}</a>` : '-'}</strong></div>
            <div><span class="text-gray-400">Facebook:</span> <strong>${l.facebook ? `<a href="${l.facebook}" target="_blank" class="text-blue-600 hover:underline">${l.facebook}</a>` : '-'}</strong></div>
            <div><span class="text-gray-400">Rating:</span> <strong>${l.rating ? `${l.rating} ★ (${l.cantidad_resenas || 0} reseñas)` : '-'}</strong></div>
            <div><span class="text-gray-400">Horarios:</span> <strong>${l.horarios || '-'}</strong></div>
            <div class="sm:col-span-2"><span class="text-gray-400">Google Maps:</span> ${l.google_maps_url ? `<a href="${l.google_maps_url}" target="_blank" class="text-primary hover:underline text-xs">Ver en Maps</a>` : '-'}</div>
            <div class="sm:col-span-2"><span class="text-gray-400">Notas:</span> <strong>${l.notas || '-'}</strong></div>
        </div>
    `, `
        ${l.whatsapp || l.celular ? `<a href="https://wa.me/${(l.whatsapp || l.celular).replace(/\D/g,'')}" target="_blank" class="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">WhatsApp</a>` : ''}
        <button onclick="convertLeadToClient('${l.id}')" class="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-green-800">Convertir a Cliente</button>
        <button onclick="closeModal()" class="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cerrar</button>
    `);
}

function convertLeadToClient(id) {
    const l = getRecord('sh_leads', id);
    if (!l) return;
    const newClient = {
        id: generateId('CLI'),
        name: l.nombre,
        cuit: '',
        type: l.tipo || 'Casa de repuestos',
        phone: l.telefono || l.whatsapp || l.celular || '',
        email: l.email || '',
        address: l.direccion || '',
        city: l.localidad || '',
        lastOrder: null,
        createdAt: new Date().toISOString().split('T')[0]
    };
    addRecord('sh_clients', newClient);
    updateRecord('sh_leads', id, { estado: 'cliente' });
    closeModal();
    showToast('Lead convertido a cliente');
    renderLeads();
}

function deleteLead(id) {
    confirmDelete(() => {
        deleteRecord('sh_leads', id);
        showToast('Lead eliminado', 'warning');
        renderLeads();
    });
}

function newLead() {
    openModal('Nuevo Lead', `<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="sm:col-span-2"><label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input id="f-lname" type="text" class="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:border-primary"></div>
        <div><label class="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select id="f-ltype" class="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full">
                <option>Casa de repuestos</option><option>Taller</option><option>Distribuidor</option><option>Lubricentro</option><option>Otro</option>
            </select></div>
        <div><label class="block text-sm font-medium text-gray-700 mb-1">Localidad</label>
            <input id="f-lloc" type="text" class="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:border-primary"></div>
        <div><label class="block text-sm font-medium text-gray-700 mb-1">Zona</label>
            <select id="f-lzona" class="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full">
                <option>CABA</option><option>Zona Oeste</option><option>Zona Sur</option><option>Zona Norte</option>
            </select></div>
        <div><label class="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
            <input id="f-lphone" type="text" class="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:border-primary"></div>
        <div><label class="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
            <input id="f-lwa" type="text" class="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:border-primary"></div>
        <div><label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input id="f-lemail" type="email" class="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:border-primary"></div>
        <div><label class="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
            <input id="f-laddr" type="text" class="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:border-primary"></div>
        <div class="sm:col-span-2"><label class="block text-sm font-medium text-gray-700 mb-1">Notas</label>
            <textarea id="f-lnotes" rows="2" class="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:border-primary resize-none"></textarea></div>
    </div>`, `
        <button onclick="closeModal()" class="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancelar</button>
        <button onclick="saveLead()" class="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-green-800">Guardar</button>
    `);
}

function saveLead() {
    const lead = {
        id: generateId('LEAD'),
        nombre: document.getElementById('f-lname').value.trim(),
        tipo: document.getElementById('f-ltype').value,
        localidad: document.getElementById('f-lloc').value.trim(),
        zona: document.getElementById('f-lzona').value,
        telefono: document.getElementById('f-lphone').value.trim(),
        whatsapp: document.getElementById('f-lwa').value.trim(),
        email: document.getElementById('f-lemail').value.trim(),
        direccion: document.getElementById('f-laddr').value.trim(),
        notas: document.getElementById('f-lnotes').value.trim(),
        estado: 'nuevo',
        rating: '', cantidad_resenas: '', categoria: '', horarios: '',
        sitio_web: '', instagram: '', facebook: '', google_maps_url: '',
        celular: '', partido: '',
        fecha_scraping: new Date().toISOString()
    };
    if (!lead.nombre) { showToast('Ingresá un nombre', 'error'); return; }
    addRecord('sh_leads', lead);
    closeModal();
    showToast('Lead agregado');
    renderLeads();
}

function importLeadsFromFile() {
    document.getElementById('leads-file-input').click();
}

function handleLeadsFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const json = JSON.parse(e.target.result);
            let imported = [];
            // Support both formats: array or {clientes_potenciales: [...]}
            if (Array.isArray(json)) {
                imported = json;
            } else if (json.clientes_potenciales) {
                imported = json.clientes_potenciales.map(c => ({
                    id: c.id || generateId('LEAD'),
                    nombre: c.nombre || '',
                    tipo: c.tipo || '',
                    localidad: c.ubicacion?.localidad || '',
                    partido: c.ubicacion?.partido || '',
                    zona: c.ubicacion?.zona || '',
                    direccion: c.ubicacion?.direccion || '',
                    telefono: c.contacto?.telefono || '',
                    celular: c.contacto?.celular || '',
                    whatsapp: c.contacto?.whatsapp || '',
                    email: c.contacto?.email || '',
                    sitio_web: c.online?.sitio_web || '',
                    instagram: c.online?.instagram || '',
                    facebook: c.online?.facebook || '',
                    google_maps_url: c.online?.google_maps || '',
                    rating: c.reputacion?.rating || '',
                    cantidad_resenas: c.reputacion?.cantidad_resenas || '',
                    estado: c.estado_comercial || 'nuevo',
                    notas: c.notas || '',
                    tipo_linea: c.tipo_linea || '',
                    whatsapp_probable: c.whatsapp_probable || false,
                    link_whatsapp: c.link_whatsapp || '',
                    categoria: '', horarios: '',
                    fecha_scraping: json.metadata?.fecha_scraping || new Date().toISOString()
                }));
            }
            if (imported.length === 0) { showToast('No se encontraron datos en el archivo', 'error'); return; }
            const existing = getData('sh_leads') || [];
            const existingNames = new Set(existing.map(l => l.nombre?.toLowerCase()));
            let added = 0;
            imported.forEach(lead => {
                if (!lead.id) lead.id = generateId('LEAD');
                if (!lead.estado) lead.estado = 'nuevo';
                if (!existingNames.has(lead.nombre?.toLowerCase())) {
                    existing.push(lead);
                    existingNames.add(lead.nombre?.toLowerCase());
                    added++;
                }
            });
            setData('sh_leads', existing);
            showToast(`${added} leads importados (${imported.length - added} duplicados omitidos)`);
            renderLeads();
        } catch (err) {
            showToast('Error al leer el archivo JSON', 'error');
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

function exportLeads() {
    const data = getData('sh_leads') || [];
    exportCSV(data, [
        { key: 'nombre', label: 'Nombre' }, { key: 'tipo', label: 'Tipo' },
        { key: 'localidad', label: 'Localidad' }, { key: 'zona', label: 'Zona' },
        { key: 'telefono', label: 'Teléfono' }, { key: 'whatsapp', label: 'WhatsApp' },
        { key: 'email', label: 'Email' }, { key: 'sitio_web', label: 'Web' },
        { key: 'rating', label: 'Rating' }, { key: 'estado', label: 'Estado' },
        { key: 'direccion', label: 'Dirección' }
    ], 'leads_santana_hnos.csv');
    showToast('CSV exportado');
}
