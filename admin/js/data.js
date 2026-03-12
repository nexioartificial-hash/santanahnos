// ============================================================
// Santana Hnos. - Admin Panel Data & localStorage CRUD Helpers
// ============================================================

// --------------- localStorage Keys ---------------
const KEYS = {
  products:   'sh_products',
  clients:    'sh_clients',
  orders:     'sh_orders',
  queries:    'sh_queries',
  production: 'sh_production',
  users:      'sh_users',
  config:     'sh_config',
  session:    'sh_session'
};

// --------------- Generic CRUD ---------------

function getData(key) {
  return JSON.parse(localStorage.getItem(key) || '[]');
}

function setData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function addRecord(key, record) {
  const data = getData(key);
  data.push(record);
  setData(key, data);
  return record;
}

function updateRecord(key, id, updates) {
  const data = getData(key);
  const idx = data.findIndex(r => r.id === id);
  if (idx !== -1) {
    data[idx] = { ...data[idx], ...updates };
    setData(key, data);
  }
  return data[idx];
}

function deleteRecord(key, id) {
  const data = getData(key).filter(r => r.id !== id);
  setData(key, data);
}

function getRecord(key, id) {
  return getData(key).find(r => r.id === id);
}

function generateId(prefix) {
  return prefix + '-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4);
}

// --------------- Config helpers (object, not array) ---------------

function getConfig() {
  return JSON.parse(localStorage.getItem(KEYS.config) || '{}');
}

function setConfig(config) {
  localStorage.setItem(KEYS.config, JSON.stringify(config));
}

// --------------- Session helpers ---------------

function getSession() {
  return JSON.parse(localStorage.getItem('sh_session') || 'null');
}

function clearSession() {
  localStorage.removeItem('sh_session');
}

function isAdmin() {
  const s = getSession();
  return s && s.role === 'admin';
}

// --------------- Format helpers ---------------

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return day + '/' + month + '/' + year;
}

function formatDateTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return day + '/' + month + '/' + year + ' ' + hours + ':' + minutes;
}

function formatPrice(num) {
  if (num === null || num === undefined) return '';
  return '$' + Number(num).toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function formatShortDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return day + '/' + month;
}

// ===============================================================
// Demo Data
// ===============================================================

function initDemoData() {
  // Only initialize if products don't exist yet
  if (localStorage.getItem(KEYS.products)) return;

  // ---------- Products (20) ----------
  const products = [
    { id: 'ROT-001', name: 'Rótula de dirección Ford Focus 2008-2019', category: 'Rótula', brand: 'Ford', model: 'Focus', stock: 45, minStock: 10, price: 15500, status: 'active', createdAt: '2025-01-15' },
    { id: 'ROT-002', name: 'Rótula de dirección VW Gol Trend', category: 'Rótula', brand: 'Volkswagen', model: 'Gol Trend', stock: 32, minStock: 10, price: 12800, status: 'active', createdAt: '2025-01-15' },
    { id: 'ROT-003', name: 'Rótula de dirección Chevrolet Cruze', category: 'Rótula', brand: 'Chevrolet', model: 'Cruze', stock: 8, minStock: 10, price: 18200, status: 'active', createdAt: '2025-02-01' },
    { id: 'ROT-004', name: 'Rótula de suspensión Toyota Hilux 2005-2015', category: 'Rótula', brand: 'Toyota', model: 'Hilux', stock: 0, minStock: 15, price: 22000, status: 'active', createdAt: '2025-02-01' },
    { id: 'ROT-005', name: 'Rótula inferior Renault Duster', category: 'Rótula', brand: 'Renault', model: 'Duster', stock: 25, minStock: 8, price: 16500, status: 'active', createdAt: '2025-03-10' },
    { id: 'EXT-001', name: 'Extremo de dirección Fiat Palio/Siena', category: 'Extremo', brand: 'Fiat', model: 'Palio/Siena', stock: 60, minStock: 15, price: 8900, status: 'active', createdAt: '2025-01-15' },
    { id: 'EXT-002', name: 'Extremo de dirección Chevrolet Corsa', category: 'Extremo', brand: 'Chevrolet', model: 'Corsa', stock: 3, minStock: 10, price: 7500, status: 'active', createdAt: '2025-01-20' },
    { id: 'EXT-003', name: 'Extremo de dirección Ford Ranger 2012+', category: 'Extremo', brand: 'Ford', model: 'Ranger', stock: 18, minStock: 8, price: 14200, status: 'active', createdAt: '2025-04-05' },
    { id: 'EXT-004', name: 'Extremo de dirección Peugeot 308', category: 'Extremo', brand: 'Peugeot', model: '308', stock: 0, minStock: 10, price: 11500, status: 'active', createdAt: '2025-05-12' },
    { id: 'EXT-005', name: 'Extremo de dirección VW Amarok', category: 'Extremo', brand: 'Volkswagen', model: 'Amarok', stock: 14, minStock: 5, price: 16800, status: 'active', createdAt: '2025-06-01' },
    { id: 'TER-001', name: 'Terminal de dirección Renault Kangoo', category: 'Terminal', brand: 'Renault', model: 'Kangoo', stock: 22, minStock: 10, price: 9800, status: 'active', createdAt: '2025-03-15' },
    { id: 'TER-002', name: 'Terminal de dirección Citroën Berlingo', category: 'Terminal', brand: 'Citroën', model: 'Berlingo', stock: 5, minStock: 8, price: 10200, status: 'active', createdAt: '2025-04-20' },
    { id: 'BRA-001', name: 'Brazo de suspensión Toyota Hilux', category: 'Brazo', brand: 'Toyota', model: 'Hilux', stock: 12, minStock: 5, price: 35000, status: 'active', createdAt: '2025-02-10' },
    { id: 'BRA-002', name: 'Brazo de suspensión Honda CR-V', category: 'Brazo', brand: 'Honda', model: 'CR-V', stock: 7, minStock: 5, price: 28500, status: 'active', createdAt: '2025-05-01' },
    { id: 'BUJ-001', name: 'Buje de suspensión Peugeot 208', category: 'Buje', brand: 'Peugeot', model: '208', stock: 50, minStock: 15, price: 4500, status: 'active', createdAt: '2025-01-25' },
    { id: 'BUJ-002', name: 'Buje de suspensión Fiat Cronos', category: 'Buje', brand: 'Fiat', model: 'Cronos', stock: 38, minStock: 12, price: 4200, status: 'active', createdAt: '2025-03-01' },
    { id: 'KIT-001', name: 'Kit reparación dirección Ford Ranger', category: 'Kit', brand: 'Ford', model: 'Ranger', stock: 10, minStock: 5, price: 45000, status: 'active', createdAt: '2025-04-15' },
    { id: 'KIT-002', name: 'Kit reparación suspensión VW Gol', category: 'Kit', brand: 'Volkswagen', model: 'Gol', stock: 15, minStock: 8, price: 32000, status: 'active', createdAt: '2025-06-10' },
    { id: 'ROT-006', name: 'Rótula de dirección Nissan Frontier', category: 'Rótula', brand: 'Nissan', model: 'Frontier', stock: 0, minStock: 8, price: 19500, status: 'descontinuado', createdAt: '2024-11-01' },
    { id: 'EXT-006', name: 'Extremo de dirección Mercedes Sprinter', category: 'Extremo', brand: 'Mercedes-Benz', model: 'Sprinter', stock: 6, minStock: 5, price: 21000, status: 'active', createdAt: '2025-07-01' }
  ];

  // ---------- Clients (10) ----------
  const clients = [
    { id: 'CLI-001', name: 'Taller Mecánico Los Hermanos', cuit: '20-30456789-5', type: 'Taller', phone: '11 4624-5589', email: 'tallerloshermanos@gmail.com', city: 'Morón', address: 'Av. Rivadavia 18200', lastOrder: '2026-03-10', createdAt: '2024-06-15' },
    { id: 'CLI-002', name: 'Repuestos del Oeste SRL', cuit: '30-71234567-8', type: 'Casa de repuestos', phone: '11 4628-3341', email: 'repuestosoeste@gmail.com', city: 'Ituzaingó', address: 'Av. Santa Rosa 900', lastOrder: '2026-03-08', createdAt: '2024-03-20' },
    { id: 'CLI-003', name: 'Distribuidora Ramos', cuit: '30-70987654-2', type: 'Distribuidor', phone: '11 4656-7823', email: 'distribramos@gmail.com', city: 'Ramos Mejía', address: 'Av. de Mayo 450', lastOrder: '2026-02-28', createdAt: '2024-08-10' },
    { id: 'CLI-004', name: 'Autopartes Castelar', cuit: '20-28765432-1', type: 'Casa de repuestos', phone: '11 4629-1145', email: 'autopartescastelar@gmail.com', city: 'Castelar', address: 'Arias 2300', lastOrder: '2026-03-05', createdAt: '2024-05-01' },
    { id: 'CLI-005', name: 'Taller Don Carlos', cuit: '20-14523678-9', type: 'Taller', phone: '11 4484-6612', email: 'tallerdoncarlos@hotmail.com', city: 'Haedo', address: 'Laprida 155', lastOrder: '2026-02-15', createdAt: '2025-01-10' },
    { id: 'CLI-006', name: 'MegaRepuestos SA', cuit: '30-71567890-4', type: 'Distribuidor', phone: '11 4489-2200', email: 'megarepuestos@gmail.com', city: 'Merlo', address: 'Av. San Martín 3100', lastOrder: '2026-03-11', createdAt: '2024-02-15' },
    { id: 'CLI-007', name: 'Taller El Gallego', cuit: '20-22345678-6', type: 'Taller', phone: '11 4621-8834', email: 'elgallego.taller@gmail.com', city: 'Ituzaingó', address: 'Zufriategui 580', lastOrder: '2026-01-20', createdAt: '2025-04-05' },
    { id: 'CLI-008', name: 'Lubricentro Rápido', cuit: '20-33456789-0', type: 'Taller', phone: '11 4624-0098', email: 'lubrirapido@gmail.com', city: 'Morón', address: 'Brown 350', lastOrder: '2026-03-01', createdAt: '2025-06-20' },
    { id: 'CLI-009', name: 'Casa del Repuesto Merlo', cuit: '30-70111222-5', type: 'Casa de repuestos', phone: '11 4483-5567', email: 'casarepuesto.merlo@gmail.com', city: 'Merlo', address: 'Av. del Libertador 1200', lastOrder: '2026-02-22', createdAt: '2024-09-01' },
    { id: 'CLI-010', name: 'González Juan Carlos', cuit: '20-18900123-7', type: 'Particular', phone: '11 5051-3344', email: 'jcgonzalez@gmail.com', city: 'Castelar', address: 'Monteagudo 890', lastOrder: '2026-03-09', createdAt: '2025-11-15' }
  ];

  // ---------- Orders (12) ----------
  const orders = [
    {
      id: 'PED-001',
      clientId: 'CLI-006',
      clientName: 'MegaRepuestos SA',
      date: '2026-01-10',
      items: [
        { productId: 'ROT-001', productName: 'Rótula de dirección Ford Focus 2008-2019', quantity: 20, unitPrice: 15500 },
        { productId: 'ROT-002', productName: 'Rótula de dirección VW Gol Trend', quantity: 15, unitPrice: 12800 },
        { productId: 'EXT-001', productName: 'Extremo de dirección Fiat Palio/Siena', quantity: 30, unitPrice: 8900 }
      ],
      total: 769000,
      status: 'Entregado',
      createdAt: '2026-01-10'
    },
    {
      id: 'PED-002',
      clientId: 'CLI-001',
      clientName: 'Taller Mecánico Los Hermanos',
      date: '2026-01-18',
      items: [
        { productId: 'ROT-005', productName: 'Rótula inferior Renault Duster', quantity: 4, unitPrice: 16500 },
        { productId: 'EXT-002', productName: 'Extremo de dirección Chevrolet Corsa', quantity: 6, unitPrice: 7500 }
      ],
      total: 111000,
      status: 'Entregado',
      createdAt: '2026-01-18'
    },
    {
      id: 'PED-003',
      clientId: 'CLI-003',
      clientName: 'Distribuidora Ramos',
      date: '2026-01-25',
      items: [
        { productId: 'BUJ-001', productName: 'Buje de suspensión Peugeot 208', quantity: 40, unitPrice: 4500 },
        { productId: 'BUJ-002', productName: 'Buje de suspensión Fiat Cronos', quantity: 30, unitPrice: 4200 },
        { productId: 'TER-001', productName: 'Terminal de dirección Renault Kangoo', quantity: 10, unitPrice: 9800 }
      ],
      total: 404000,
      status: 'Entregado',
      createdAt: '2026-01-25'
    },
    {
      id: 'PED-004',
      clientId: 'CLI-002',
      clientName: 'Repuestos del Oeste SRL',
      date: '2026-02-05',
      items: [
        { productId: 'KIT-001', productName: 'Kit reparación dirección Ford Ranger', quantity: 3, unitPrice: 45000 },
        { productId: 'EXT-003', productName: 'Extremo de dirección Ford Ranger 2012+', quantity: 8, unitPrice: 14200 },
        { productId: 'BRA-001', productName: 'Brazo de suspensión Toyota Hilux', quantity: 2, unitPrice: 35000 }
      ],
      total: 318600,
      status: 'Despachado',
      createdAt: '2026-02-05'
    },
    {
      id: 'PED-005',
      clientId: 'CLI-004',
      clientName: 'Autopartes Castelar',
      date: '2026-02-12',
      items: [
        { productId: 'ROT-003', productName: 'Rótula de dirección Chevrolet Cruze', quantity: 6, unitPrice: 18200 },
        { productId: 'EXT-005', productName: 'Extremo de dirección VW Amarok', quantity: 4, unitPrice: 16800 },
        { productId: 'TER-002', productName: 'Terminal de dirección Citroën Berlingo', quantity: 5, unitPrice: 10200 }
      ],
      total: 227400,
      status: 'Despachado',
      createdAt: '2026-02-12'
    },
    {
      id: 'PED-006',
      clientId: 'CLI-009',
      clientName: 'Casa del Repuesto Merlo',
      date: '2026-02-20',
      items: [
        { productId: 'ROT-001', productName: 'Rótula de dirección Ford Focus 2008-2019', quantity: 10, unitPrice: 15500 },
        { productId: 'EXT-001', productName: 'Extremo de dirección Fiat Palio/Siena', quantity: 15, unitPrice: 8900 }
      ],
      total: 288500,
      status: 'Despachado',
      createdAt: '2026-02-20'
    },
    {
      id: 'PED-007',
      clientId: 'CLI-005',
      clientName: 'Taller Don Carlos',
      date: '2026-02-28',
      items: [
        { productId: 'BRA-002', productName: 'Brazo de suspensión Honda CR-V', quantity: 2, unitPrice: 28500 },
        { productId: 'ROT-005', productName: 'Rótula inferior Renault Duster', quantity: 3, unitPrice: 16500 },
        { productId: 'BUJ-001', productName: 'Buje de suspensión Peugeot 208', quantity: 10, unitPrice: 4500 }
      ],
      total: 151500,
      status: 'En preparación',
      createdAt: '2026-02-28'
    },
    {
      id: 'PED-008',
      clientId: 'CLI-006',
      clientName: 'MegaRepuestos SA',
      date: '2026-03-03',
      items: [
        { productId: 'KIT-002', productName: 'Kit reparación suspensión VW Gol', quantity: 5, unitPrice: 32000 },
        { productId: 'ROT-002', productName: 'Rótula de dirección VW Gol Trend', quantity: 20, unitPrice: 12800 },
        { productId: 'EXT-006', productName: 'Extremo de dirección Mercedes Sprinter', quantity: 4, unitPrice: 21000 }
      ],
      total: 500000,
      status: 'En preparación',
      createdAt: '2026-03-03'
    },
    {
      id: 'PED-009',
      clientId: 'CLI-007',
      clientName: 'Taller El Gallego',
      date: '2026-03-05',
      items: [
        { productId: 'ROT-001', productName: 'Rótula de dirección Ford Focus 2008-2019', quantity: 4, unitPrice: 15500 },
        { productId: 'EXT-002', productName: 'Extremo de dirección Chevrolet Corsa', quantity: 4, unitPrice: 7500 },
        { productId: 'TER-001', productName: 'Terminal de dirección Renault Kangoo', quantity: 6, unitPrice: 9800 }
      ],
      total: 150600,
      status: 'En preparación',
      createdAt: '2026-03-05'
    },
    {
      id: 'PED-010',
      clientId: 'CLI-010',
      clientName: 'González Juan Carlos',
      date: '2026-03-08',
      items: [
        { productId: 'ROT-003', productName: 'Rótula de dirección Chevrolet Cruze', quantity: 2, unitPrice: 18200 },
        { productId: 'BUJ-002', productName: 'Buje de suspensión Fiat Cronos', quantity: 4, unitPrice: 4200 }
      ],
      total: 53200,
      status: 'Pendiente',
      createdAt: '2026-03-08'
    },
    {
      id: 'PED-011',
      clientId: 'CLI-001',
      clientName: 'Taller Mecánico Los Hermanos',
      date: '2026-03-10',
      items: [
        { productId: 'BRA-001', productName: 'Brazo de suspensión Toyota Hilux', quantity: 3, unitPrice: 35000 },
        { productId: 'ROT-004', productName: 'Rótula de suspensión Toyota Hilux 2005-2015', quantity: 6, unitPrice: 22000 },
        { productId: 'EXT-003', productName: 'Extremo de dirección Ford Ranger 2012+', quantity: 4, unitPrice: 14200 }
      ],
      total: 293800,
      status: 'Pendiente',
      createdAt: '2026-03-10'
    },
    {
      id: 'PED-012',
      clientId: 'CLI-008',
      clientName: 'Lubricentro Rápido',
      date: '2026-03-11',
      items: [
        { productId: 'ROT-005', productName: 'Rótula inferior Renault Duster', quantity: 2, unitPrice: 16500 },
        { productId: 'EXT-001', productName: 'Extremo de dirección Fiat Palio/Siena', quantity: 5, unitPrice: 8900 },
        { productId: 'BUJ-001', productName: 'Buje de suspensión Peugeot 208', quantity: 8, unitPrice: 4500 }
      ],
      total: 113500,
      status: 'Pendiente',
      createdAt: '2026-03-11'
    }
  ];

  // ---------- Queries (6) ----------
  const queries = [
    { id: 'CON-001', name: 'Martín Rodríguez', email: 'martinrodriguez@gmail.com', phone: '11 3456-7890', message: 'Hola, necesito cotización de rótulas para Ford Focus 2015. ¿Tienen stock? Gracias.', date: '2026-03-12T10:30:00', read: false },
    { id: 'CON-002', name: 'Ana García', email: 'anagarcia@hotmail.com', phone: '11 2345-6789', message: 'Buenos días, soy de un taller en Moreno y me interesa ser distribuidor. ¿Cómo es el proceso?', date: '2026-03-11T15:45:00', read: false },
    { id: 'CON-003', name: 'Carlos Méndez', email: 'cmendez@gmail.com', phone: '11 6789-0123', message: 'Necesito extremos de dirección para Chevrolet Corsa 2010. ¿Hacen envíos al interior?', date: '2026-03-10T09:15:00', read: true },
    { id: 'CON-004', name: 'Laura Fernández', email: 'lauraf@gmail.com', phone: '11 4567-8901', message: 'Consulta por kit de reparación completo para VW Gol Power. Precio por cantidad.', date: '2026-03-08T14:20:00', read: true },
    { id: 'CON-005', name: 'Diego Sánchez', email: 'dsanchez@yahoo.com', phone: '11 7890-1234', message: 'Hola, tengo un taller en Ituzaingó. Me gustaría conocer su lista de precios actualizada.', date: '2026-03-05T11:00:00', read: false },
    { id: 'CON-006', name: 'Patricia López', email: 'plopez@gmail.com', phone: '11 5678-9012', message: 'Buenas tardes, necesito presupuesto de bujes para Peugeot 208 modelo 2020.', date: '2026-03-01T16:30:00', read: true }
  ];

  // ---------- Production (8) ----------
  const production = [
    { id: 'OP-001', productId: 'ROT-001', productName: 'Rótula de dirección Ford Focus', quantity: 100, startDate: '2026-03-01', endDate: '2026-03-15', status: 'En curso', responsible: 'Roberto Díaz', notes: 'Lote prioritario', createdAt: '2026-02-28' },
    { id: 'OP-002', productId: 'EXT-001', productName: 'Extremo de dirección Fiat Palio/Siena', quantity: 150, startDate: '2026-03-05', endDate: '2026-03-20', status: 'En curso', responsible: 'Roberto Díaz', notes: '', createdAt: '2026-03-04' },
    { id: 'OP-003', productId: 'ROT-004', productName: 'Rótula de suspensión Toyota Hilux', quantity: 80, startDate: '2026-03-10', endDate: '2026-03-25', status: 'Planificada', responsible: 'Miguel Fernández', notes: 'Reponer stock agotado', createdAt: '2026-03-09' },
    { id: 'OP-004', productId: 'BUJ-001', productName: 'Buje de suspensión Peugeot 208', quantity: 200, startDate: '2026-02-15', endDate: '2026-02-28', status: 'Finalizada', responsible: 'Roberto Díaz', notes: 'Completado sin novedad', createdAt: '2026-02-14' },
    { id: 'OP-005', productId: 'KIT-001', productName: 'Kit reparación dirección Ford Ranger', quantity: 50, startDate: '2026-02-20', endDate: '2026-03-05', status: 'Finalizada', responsible: 'Miguel Fernández', notes: '', createdAt: '2026-02-19' },
    { id: 'OP-006', productId: 'EXT-004', productName: 'Extremo de dirección Peugeot 308', quantity: 120, startDate: '2026-03-12', endDate: '2026-03-28', status: 'Planificada', responsible: 'Roberto Díaz', notes: 'Reponer stock agotado', createdAt: '2026-03-11' },
    { id: 'OP-007', productId: 'TER-001', productName: 'Terminal de dirección Renault Kangoo', quantity: 90, startDate: '2026-02-01', endDate: '2026-02-15', status: 'Finalizada', responsible: 'Roberto Díaz', notes: '', createdAt: '2026-01-30' },
    { id: 'OP-008', productId: 'ROT-002', productName: 'Rótula de dirección VW Gol Trend', quantity: 100, startDate: '2026-03-15', endDate: '2026-03-30', status: 'Planificada', responsible: 'Miguel Fernández', notes: 'Pedido grande de MegaRepuestos', createdAt: '2026-03-12' }
  ];

  // ---------- Users ----------
  const users = [
    { id: 'USR-001', username: 'admin', name: 'Carlos Santana', role: 'admin', lastAccess: '2026-03-12', status: 'active' },
    { id: 'USR-002', username: 'deposito', name: 'Miguel Fernández', role: 'deposito', lastAccess: '2026-03-11', status: 'active' },
    { id: 'USR-003', username: 'ventas', name: 'Laura Gómez', role: 'ventas', lastAccess: '2026-03-10', status: 'active' },
    { id: 'USR-004', username: 'produccion', name: 'Roberto Díaz', role: 'produccion', lastAccess: '2026-02-28', status: 'inactive' }
  ];

  // ---------- Config ----------
  const config = {
    name: 'Santana Hnos.',
    address: 'Av. Int. Carlos Ratti 3744, B1744 Ituzaingó, Buenos Aires',
    phone: '11 5051-5118',
    email: 'santanahnos1@gmail.com',
    cuit: '30-12345678-9',
    schedule: 'Lunes a Viernes: 8:00 a 17:00',
    lowStockThreshold: 10
  };

  // ---------- Save all to localStorage ----------
  setData(KEYS.products, products);
  setData(KEYS.clients, clients);
  setData(KEYS.orders, orders);
  setData(KEYS.queries, queries);
  setData(KEYS.production, production);
  setData(KEYS.users, users);
  setConfig(config);
}

// Initialize demo data on load
initDemoData();
