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

  // ---------- Products (330 - Lista 96 Santana Hnos.) ----------
  const products = [
    { id: "201", name: "EXTREMO GALAXY", category: "Extremo", brand: "Ford", model: "GALAXY", stock: 19, minStock: 10, price: 10958.27, status: "active", createdAt: "2026-03-01" },
    { id: "211", name: "EXTREMO FIESTA M/V", category: "Extremo", brand: "Ford", model: "FIESTA", stock: 8, minStock: 10, price: 10471.24, status: "active", createdAt: "2026-03-01" },
    { id: "214", name: "ROTULA INF.FIESTA", category: "Rotula Inferior", brand: "Ford", model: "FIESTA", stock: 40, minStock: 10, price: 13028.17, status: "active", createdAt: "2026-03-01" },
    { id: "215", name: "BIELETA BARRA EST.FIESTA", category: "Bieleta", brand: "Ford", model: "FIESTA", stock: 36, minStock: 10, price: 13393.45, status: "active", createdAt: "2026-03-01" },
    { id: "216", name: "ROTULA INF.FORD FIESTA KINETIC", category: "Rotula Inferior", brand: "Ford", model: "FIESTA", stock: 33, minStock: 10, price: 10646.13, status: "active", createdAt: "2026-03-01" },
    { id: "217", name: "EXTREMO DER FORD-KINETIC", category: "Extremo", brand: "Ford", model: "", stock: 22, minStock: 10, price: 14703.38, status: "active", createdAt: "2026-03-01" },
    { id: "218", name: "EXTREMO IZQ.FORD-KINETIC", category: "Extremo", brand: "Ford", model: "", stock: 18, minStock: 10, price: 14703.38, status: "active", createdAt: "2026-03-01" },
    { id: "221", name: "EXTREMO DERECHO FIESTA 97/AD", category: "Extremo", brand: "Ford", model: "FIESTA", stock: 74, minStock: 10, price: 10471.24, status: "active", createdAt: "2026-03-01" },
    { id: "222", name: "EXTREMO IZQUIERDO FIESTA 97/AD", category: "Extremo", brand: "Ford", model: "FIESTA", stock: 16, minStock: 10, price: 10471.24, status: "active", createdAt: "2026-03-01" },
    { id: "224", name: "ROT.INF FIESTA 03AD ECOSPORT", category: "Rotula Inferior", brand: "Ford", model: "FIESTA", stock: 80, minStock: 10, price: 14611.03, status: "active", createdAt: "2026-03-01" },
    { id: "225", name: "EXT. DER. FIESTA 03AD ECOSPORT", category: "Extremo", brand: "Ford", model: "FIESTA", stock: 59, minStock: 10, price: 13880.48, status: "active", createdAt: "2026-03-01" },
    { id: "226", name: "EXT. IZQ. FIESTA 03AD ECOSPORT", category: "Extremo", brand: "Ford", model: "FIESTA", stock: 9, minStock: 10, price: 13880.48, status: "active", createdAt: "2026-03-01" },
    { id: "231", name: "EXTREMO ESCORT HASTA 96", category: "Extremo", brand: "Ford", model: "ESCORT", stock: 8, minStock: 10, price: 10471.24, status: "active", createdAt: "2026-03-01" },
    { id: "241", name: "EXTREMO DERECHO MONDEO", category: "Extremo", brand: "Ford", model: "MONDEO", stock: 16, minStock: 10, price: 13880.48, status: "active", createdAt: "2026-03-01" },
    { id: "242", name: "EXTREMO IZQUIERDO MONDEO", category: "Extremo", brand: "Ford", model: "MONDEO", stock: 32, minStock: 10, price: 13880.48, status: "active", createdAt: "2026-03-01" },
    { id: "244", name: "ROTULA INFERIOR MONDEO", category: "Rotula Inferior", brand: "Ford", model: "MONDEO", stock: 34, minStock: 10, price: 15463.34, status: "active", createdAt: "2026-03-01" },
    { id: "250", name: "EXTREMO TRANSIT  2002-AD", category: "Extremo", brand: "Ford", model: "TRANSIT", stock: 69, minStock: 10, price: 14496.0, status: "active", createdAt: "2026-03-01" },
    { id: "251", name: "EXTREMO TRANSIT L-100mm", category: "Extremo", brand: "Ford", model: "TRANSIT", stock: 8, minStock: 10, price: 13880.48, status: "active", createdAt: "2026-03-01" },
    { id: "252", name: "EXTREMO TRANSIT L-120mm", category: "Extremo", brand: "Ford", model: "TRANSIT", stock: 76, minStock: 10, price: 14854.55, status: "active", createdAt: "2026-03-01" },
    { id: "253", name: "ROT.INFERIOR TRANSIT.MOD.NUEVO", category: "Rotula Inferior", brand: "Ford", model: "TRANSIT", stock: 30, minStock: 10, price: 15462.88, status: "active", createdAt: "2026-03-01" },
    { id: "254", name: "ROTULA INFERIOR TRANSIT", category: "Rotula Inferior", brand: "Ford", model: "TRANSIT", stock: 74, minStock: 10, price: 26543.37, status: "active", createdAt: "2026-03-01" },
    { id: "260", name: "EXTREMO FOCUS 08/09", category: "Extremo", brand: "Ford", model: "FOCUS", stock: 58, minStock: 10, price: 10958.27, status: "active", createdAt: "2026-03-01" },
    { id: "261", name: "EXTREMO DERECHO FOCUS", category: "Extremo", brand: "Ford", model: "FOCUS", stock: 33, minStock: 10, price: 10471.24, status: "active", createdAt: "2026-03-01" },
    { id: "262", name: "EXTREMO IZQUIERDO FOCUS", category: "Extremo", brand: "Ford", model: "FOCUS", stock: 62, minStock: 10, price: 10471.24, status: "active", createdAt: "2026-03-01" },
    { id: "264", name: "ROTULA INFERIOR FOCUS", category: "Rotula Inferior", brand: "Ford", model: "FOCUS", stock: 80, minStock: 10, price: 15098.07, status: "active", createdAt: "2026-03-01" },
    { id: "265", name: "EXTREMO FOCUS DER.MOD/NVO 09AD", category: "Extremo", brand: "Ford", model: "FOCUS", stock: 40, minStock: 10, price: 13210.53, status: "active", createdAt: "2026-03-01" },
    { id: "266", name: "EXTREMO FOCUS IZQ.MOD/NVO 09AD", category: "Extremo", brand: "Ford", model: "FOCUS", stock: 5, minStock: 10, price: 13210.53, status: "active", createdAt: "2026-03-01" },
    { id: "267", name: "ROTULA INFERIOR FOCUS 09 AD¯", category: "Rotula Inferior", brand: "Ford", model: "FOCUS", stock: 25, minStock: 10, price: 15825.04, status: "active", createdAt: "2026-03-01" },
    { id: "268", name: "ROT.INF.DER.FOCUS III 2014AD>>", category: "Rotula Inferior", brand: "Ford", model: "FOCUS", stock: 59, minStock: 10, price: 16659.24, status: "active", createdAt: "2026-03-01" },
    { id: "269", name: "ROT.INF.IZQ.FOCUS III 2014AD>>", category: "Rotula Inferior", brand: "Ford", model: "FOCUS", stock: 48, minStock: 10, price: 16659.24, status: "active", createdAt: "2026-03-01" },
    { id: "270", name: "EXTREMO TAUNUS", category: "Extremo", brand: "Ford", model: "TAUNUS", stock: 40, minStock: 10, price: 10471.24, status: "active", createdAt: "2026-03-01" },
    { id: "271", name: "EXT.DER.FOCUS III 2014/KUGA", category: "Extremo", brand: "Ford", model: "FOCUS", stock: 24, minStock: 10, price: 13822.08, status: "active", createdAt: "2026-03-01" },
    { id: "272", name: "EXT.IZQ.FOCUS III 2014/KUGA", category: "Extremo", brand: "Ford", model: "FOCUS", stock: 32, minStock: 10, price: 13822.08, status: "active", createdAt: "2026-03-01" },
    { id: "273", name: "ROT.SUPERIOR TAUNUS", category: "Rotula Superior", brand: "Ford", model: "TAUNUS", stock: 48, minStock: 10, price: 14611.02, status: "active", createdAt: "2026-03-01" },
    { id: "274", name: "ROT.INFERIOR TAUNUS", category: "Rotula Inferior", brand: "Ford", model: "TAUNUS", stock: 18, minStock: 10, price: 14611.03, status: "active", createdAt: "2026-03-01" },
    { id: "280", name: "EXT.FALCON DIR.HID.C/G L-245mm", category: "Extremo", brand: "Ford", model: "FALCON", stock: 16, minStock: 10, price: 10836.52, status: "active", createdAt: "2026-03-01" },
    { id: "283", name: "ROTULA SUPERIOR FALCON", category: "Rotula Superior", brand: "Ford", model: "FALCON", stock: 53, minStock: 10, price: 12541.13, status: "active", createdAt: "2026-03-01" },
    { id: "284", name: "ROTULA INFERIOR FALCON", category: "Rotula Inferior", brand: "Ford", model: "FALCON", stock: 17, minStock: 10, price: 14611.03, status: "active", createdAt: "2026-03-01" },
    { id: "285", name: "ROTULA INF. FALCON 63/77 4 ag.", category: "Rotula Inferior", brand: "Ford", model: "FALCON", stock: 50, minStock: 10, price: 14611.03, status: "active", createdAt: "2026-03-01" },
    { id: "291", name: "EXTREMO RANGER L 142mm", category: "Extremo", brand: "Ford", model: "RANGER", stock: 49, minStock: 10, price: 14611.03, status: "active", createdAt: "2026-03-01" },
    { id: "294", name: "ROTULA INFERIOR RANGER 98 AD", category: "Rotula Inferior", brand: "Ford", model: "RANGER", stock: 38, minStock: 10, price: 15463.34, status: "active", createdAt: "2026-03-01" },
    { id: "295", name: "ROTULA INF.FORD RANGER 2012>>", category: "Rotula Inferior", brand: "Ford", model: "RANGER", stock: 10, minStock: 10, price: 17009.67, status: "active", createdAt: "2026-03-01" },
    { id: "204D", name: "ROTULA INF.DER.GALAXI", category: "Rotula Inferior", brand: "Ford", model: "", stock: 63, minStock: 10, price: 13393.45, status: "active", createdAt: "2026-03-01" },
    { id: "204I", name: "ROTULA INF.IZQ.GALAXI", category: "Rotula Inferior", brand: "Ford", model: "", stock: 73, minStock: 10, price: 13393.45, status: "active", createdAt: "2026-03-01" },
    { id: "234D", name: "BRAZO ROTULA DER.ESCORT", category: "Brazo", brand: "Ford", model: "ESCORT", stock: 20, minStock: 10, price: 34618.24, status: "active", createdAt: "2026-03-01" },
    { id: "234I", name: "BRAZO ROTULA IZQ.ESCORT", category: "Brazo", brand: "Ford", model: "ESCORT", stock: 53, minStock: 10, price: 34618.24, status: "active", createdAt: "2026-03-01" },
    { id: "236D", name: "BRAZO ROT.SIERRA DERECHO", category: "Brazo", brand: "Ford", model: "SIERRA", stock: 15, minStock: 10, price: 33483.61, status: "active", createdAt: "2026-03-01" },
    { id: "236I", name: "BRAZO ROT. SIERRA IZQUIERDO", category: "Brazo", brand: "Ford", model: "SIERRA", stock: 75, minStock: 10, price: 33483.61, status: "active", createdAt: "2026-03-01" },
    { id: "241G", name: "EXT.DER.MONDEO C/GRUESO 96>>", category: "Extremo", brand: "Ford", model: "MONDEO", stock: 42, minStock: 10, price: 13880.48, status: "active", createdAt: "2026-03-01" },
    { id: "242G", name: "EXT.IZQ.MONDEO C/GRUESO 96>>", category: "Extremo", brand: "Ford", model: "MONDEO", stock: 51, minStock: 10, price: 13880.48, status: "active", createdAt: "2026-03-01" },
    { id: "263D", name: "EXT.DER.FOCUS MOD.06/09 14x1.5", category: "Extremo", brand: "Ford", model: "FOCUS", stock: 78, minStock: 10, price: 10470.76, status: "active", createdAt: "2026-03-01" },
    { id: "263I", name: "EXT.IZQ.FOCUS MOD.06/09 14x1.5", category: "Extremo", brand: "Ford", model: "FOCUS", stock: 29, minStock: 10, price: 10470.76, status: "active", createdAt: "2026-03-01" },
    { id: "281F", name: "EXT.FALCON CORTO CONO FINO ®78", category: "Extremo", brand: "Ford", model: "FALCON", stock: 13, minStock: 10, price: 9862.45, status: "active", createdAt: "2026-03-01" },
    { id: "281G", name: "EXTREMO FALCON CORTO C/G 78¯", category: "Extremo", brand: "Ford", model: "FALCON", stock: 10, minStock: 10, price: 9862.45, status: "active", createdAt: "2026-03-01" },
    { id: "282F", name: "EXT.FALCON LARGO C/F (78-82)", category: "Extremo", brand: "Ford", model: "FALCON", stock: 34, minStock: 10, price: 10471.24, status: "active", createdAt: "2026-03-01" },
    { id: "282G", name: "EXT.FALCON LARGO C/G 83¯", category: "Extremo", brand: "Ford", model: "FALCON", stock: 42, minStock: 10, price: 10471.24, status: "active", createdAt: "2026-03-01" },
    { id: "SP01", name: "EXTREMO M.BENZ SPRINTER", category: "Extremo", brand: "Ford", model: "", stock: 15, minStock: 10, price: 14680.66, status: "active", createdAt: "2026-03-01" },
    { id: "227", name: "ROT.INF.DER.FORD TERRITORY MOD.2021>>", category: "Rotula Inferior", brand: "Ford", model: "TERRITORY", stock: 34, minStock: 10, price: 16091.0, status: "active", createdAt: "2026-03-01" },
    { id: "228", name: "ROT.INF.IZQ.FORD TERRITORY MOD.2021>>", category: "Rotula Inferior", brand: "Ford", model: "TERRITORY", stock: 17, minStock: 10, price: 16091.0, status: "active", createdAt: "2026-03-01" },
    { id: "286", name: "EXT.DER.F-100-ESTANCIERA-IKA-DODGE 100/200", category: "Extremo", brand: "Ford", model: "F-100", stock: 53, minStock: 10, price: 13880.0, status: "active", createdAt: "2026-03-01" },
    { id: "287", name: "EXT.IZQ.F-100 -ESTANCIERA-IKA-DODGE 100/200", category: "Extremo", brand: "Ford", model: "F-100", stock: 40, minStock: 10, price: 13880.0, status: "active", createdAt: "2026-03-01" },
    { id: "288", name: "EZXTREMO FORD F-100 66/92 TWIN IBEAM", category: "Otro", brand: "Ford", model: "F-100", stock: 63, minStock: 10, price: 10920.0, status: "active", createdAt: "2026-03-01" },
    { id: "500", name: "ROTULA INFERIOR C-3", category: "Rotula Inferior", brand: "Peugeot", model: "", stock: 51, minStock: 10, price: 13114.81, status: "active", createdAt: "2026-03-01" },
    { id: "501", name: "EXTREMO DERECHO CITROEN C-3", category: "Extremo", brand: "Peugeot", model: "", stock: 25, minStock: 10, price: 19842.48, status: "active", createdAt: "2026-03-01" },
    { id: "502", name: "EXTREMO IZQUIERDO CITROEN C-3", category: "Extremo", brand: "Peugeot", model: "", stock: 52, minStock: 10, price: 19842.48, status: "active", createdAt: "2026-03-01" },
    { id: "1001", name: "EXTREMO BOXER L 142 mm", category: "Extremo", brand: "Peugeot", model: "BOXER", stock: 50, minStock: 10, price: 15129.66, status: "active", createdAt: "2026-03-01" },
    { id: "1004", name: "ROT. INF. BOXER-DUCATO M 18", category: "Rotula Inferior", brand: "Peugeot", model: "BOXER", stock: 31, minStock: 10, price: 18354.02, status: "active", createdAt: "2026-03-01" },
    { id: "1005", name: "ROTULA INF.BOXER-DUCATO 2002>>", category: "Rotula Inferior", brand: "Peugeot", model: "BOXER", stock: 39, minStock: 10, price: 19346.11, status: "active", createdAt: "2026-03-01" },
    { id: "1006", name: "EXTREMO BOXER-DUCATO M/N 2002¯", category: "Extremo", brand: "Peugeot", model: "BOXER", stock: 14, minStock: 10, price: 16121.74, status: "active", createdAt: "2026-03-01" },
    { id: "1008", name: "ROTULA INFERIOR BOXER 2010¯", category: "Rotula Inferior", brand: "Peugeot", model: "BOXER", stock: 26, minStock: 10, price: 21578.3, status: "active", createdAt: "2026-03-01" },
    { id: "1010", name: "EXTREMO  EXPERT", category: "Extremo", brand: "Peugeot", model: "EXPERT", stock: 73, minStock: 10, price: 13269.45, status: "active", createdAt: "2026-03-01" },
    { id: "1064", name: "ROTULA INF. PEUGEOT 106 í 16mm", category: "Rotula Inferior", brand: "Peugeot", model: "106", stock: 36, minStock: 10, price: 11161.23, status: "active", createdAt: "2026-03-01" },
    { id: "1065", name: "BIELETA BARRA ESTAB. 106", category: "Bieleta", brand: "Peugeot", model: "106", stock: 25, minStock: 10, price: 21950.38, status: "active", createdAt: "2026-03-01" },
    { id: "1802", name: "EXTREMO PEUGEOT PARNERT-2012>>", category: "Extremo", brand: "Peugeot", model: "", stock: 64, minStock: 10, price: 10367.65, status: "active", createdAt: "2026-03-01" },
    { id: "2061", name: "EXTREMO DER.106-206-605", category: "Extremo", brand: "Peugeot", model: "206", stock: 53, minStock: 10, price: 11161.2, status: "active", createdAt: "2026-03-01" },
    { id: "2062", name: "EXTREMO IZQ.106-206-605", category: "Extremo", brand: "Peugeot", model: "206", stock: 39, minStock: 10, price: 11161.2, status: "active", createdAt: "2026-03-01" },
    { id: "2065", name: "BIELETA BARRA ESTAB.206", category: "Bieleta", brand: "Peugeot", model: "206", stock: 76, minStock: 10, price: 18194.26, status: "active", createdAt: "2026-03-01" },
    { id: "206D", name: "PARRILLA DERECHA 206 PEUGEOT", category: "Parrilla", brand: "Peugeot", model: "206", stock: 33, minStock: 10, price: 60152.52, status: "active", createdAt: "2026-03-01" },
    { id: "206I", name: "PARRILLA IZQUIERDA 206 PEUGEOT", category: "Parrilla", brand: "Peugeot", model: "206", stock: 46, minStock: 10, price: 60152.52, status: "active", createdAt: "2026-03-01" },
    { id: "2081", name: "EXTREMO DER.PEUGEOT-208-", category: "Extremo", brand: "Peugeot", model: "208", stock: 12, minStock: 10, price: 21328.97, status: "active", createdAt: "2026-03-01" },
    { id: "2082", name: "EXTREMO IZQ.PEUGEOT -208-", category: "Extremo", brand: "Peugeot", model: "208", stock: 34, minStock: 10, price: 21328.97, status: "active", createdAt: "2026-03-01" },
    { id: "2084", name: "ROTULA INFERIOR PEUGEOT-208", category: "Rotula Inferior", brand: "Peugeot", model: "208", stock: 9, minStock: 10, price: 15778.9, status: "active", createdAt: "2026-03-01" },
    { id: "2085", name: "ROTULA INF.PEUGEOT-208- 2015>>", category: "Rotula Inferior", brand: "Peugeot", model: "208", stock: 45, minStock: 10, price: 16010.34, status: "active", createdAt: "2026-03-01" },
    { id: "3011", name: "EXTREMO DER.PEUGEOT 301", category: "Extremo", brand: "Peugeot", model: "301", stock: 56, minStock: 10, price: 20990.28, status: "active", createdAt: "2026-03-01" },
    { id: "3012", name: "EXTREMO IZQ.PEUGEOT 301", category: "Extremo", brand: "Peugeot", model: "301", stock: 39, minStock: 10, price: 20990.07, status: "active", createdAt: "2026-03-01" },
    { id: "3064", name: "ROTULA INFERIOR 306 o16mm", category: "Rotula Inferior", brand: "Peugeot", model: "306", stock: 13, minStock: 10, price: 13269.43, status: "active", createdAt: "2026-03-01" },
    { id: "3065", name: "BIELETA BARRA ESTAB.306", category: "Bieleta", brand: "Peugeot", model: "306", stock: 32, minStock: 10, price: 15129.63, status: "active", createdAt: "2026-03-01" },
    { id: "3074", name: "ROTULA INFERIOR PEUGEOT 307", category: "Rotula Inferior", brand: "Peugeot", model: "307", stock: 77, minStock: 10, price: 10665.18, status: "active", createdAt: "2026-03-01" },
    { id: "3075", name: "BIELETA BARRA ESTAB.307", category: "Bieleta", brand: "Peugeot", model: "307", stock: 45, minStock: 10, price: 19346.09, status: "active", createdAt: "2026-03-01" },
    { id: "3081", name: "EXTREMO DERECHO 308 PEUGEOT", category: "Extremo", brand: "Peugeot", model: "308", stock: 32, minStock: 10, price: 19842.41, status: "active", createdAt: "2026-03-01" },
    { id: "3082", name: "EXTREMO IZQUIERDO 308 PEUGEOT", category: "Extremo", brand: "Peugeot", model: "308", stock: 68, minStock: 10, price: 19842.41, status: "active", createdAt: "2026-03-01" },
    { id: "4051", name: "EXTREMO DERECHO 405", category: "Extremo", brand: "Peugeot", model: "405", stock: 55, minStock: 10, price: 13021.4, status: "active", createdAt: "2026-03-01" },
    { id: "4052", name: "EXTREMO IZQUIERDO 405", category: "Extremo", brand: "Peugeot", model: "405", stock: 63, minStock: 10, price: 13021.4, status: "active", createdAt: "2026-03-01" },
    { id: "4065", name: "BIEL.EST.DEL.406/HA98", category: "Otro", brand: "Peugeot", model: "406", stock: 23, minStock: 10, price: 21330.3, status: "active", createdAt: "2026-03-01" },
    { id: "4066", name: "BIEL.BARRA EST.DEL.406/98-AD", category: "Bieleta", brand: "Peugeot", model: "406", stock: 38, minStock: 10, price: 21578.33, status: "active", createdAt: "2026-03-01" },
    { id: "4067", name: "BIELETA BARRA EST.TRASERA 406", category: "Bieleta", brand: "Peugeot", model: "406", stock: 22, minStock: 10, price: 19346.09, status: "active", createdAt: "2026-03-01" },
    { id: "4068", name: "BIEL.BARRA EST.TRAS.406 C/B.OS", category: "Bieleta", brand: "Peugeot", model: "406", stock: 36, minStock: 10, price: 25546.76, status: "active", createdAt: "2026-03-01" },
    { id: "5054", name: "ROTULA INF.ROSC.505-504GRII", category: "Rotula Inferior", brand: "Peugeot", model: "505", stock: 76, minStock: 10, price: 9673.04, status: "active", createdAt: "2026-03-01" },
    { id: "6055", name: "BIELETA BARRA ESTAB.DEL.605", category: "Bieleta", brand: "Peugeot", model: "605", stock: 73, minStock: 10, price: 22570.43, status: "active", createdAt: "2026-03-01" },
    { id: "PA01", name: "PARRILLA DERECHA PARTNER", category: "Parrilla", brand: "Peugeot", model: "PARTNER", stock: 38, minStock: 10, price: 64200.5, status: "active", createdAt: "2026-03-01" },
    { id: "PA02", name: "PARRILLA IZQUIERDA PARTNER", category: "Parrilla", brand: "Peugeot", model: "PARTNER", stock: 79, minStock: 10, price: 64200.5, status: "active", createdAt: "2026-03-01" },
    { id: "PA04", name: "ROTULA INFERIOR PARTNER í18mm", category: "Rotula Inferior", brand: "Peugeot", model: "PARTNER", stock: 59, minStock: 10, price: 13269.43, status: "active", createdAt: "2026-03-01" },
    { id: "PA10", name: "BIELETA BARRA EST.PARTNER", category: "Bieleta", brand: "Peugeot", model: "PARTNER", stock: 79, minStock: 10, price: 15129.63, status: "active", createdAt: "2026-03-01" },
    { id: "1004F", name: "ROT. INF. BOXER-DUCATO M 16", category: "Rotula Inferior", brand: "Peugeot", model: "BOXER", stock: 56, minStock: 10, price: 17361.85, status: "active", createdAt: "2026-03-01" },
    { id: "1064F", name: "ROTULA INF. PEUGEOT 106 í 14mm", category: "Rotula Inferior", brand: "Peugeot", model: "106", stock: 51, minStock: 10, price: 10665.18, status: "active", createdAt: "2026-03-01" },
    { id: "1801P", name: "EXT.505-504GRII-205-306PARTNER", category: "Extremo", brand: "Peugeot", model: "306", stock: 33, minStock: 10, price: 9673.01, status: "active", createdAt: "2026-03-01" },
    { id: "206 D", name: "PARRILLA DER.206 PEUGEOT", category: "Parrilla", brand: "Peugeot", model: "206", stock: 22, minStock: 10, price: 60152.52, status: "active", createdAt: "2026-03-01" },
    { id: "206 I", name: "PARRILLA IZQ.206 PEUGEOT", category: "Parrilla", brand: "Peugeot", model: "206", stock: 70, minStock: 10, price: 60152.52, status: "active", createdAt: "2026-03-01" },
    { id: "3064G", name: "ROTULA INFERIOR 306 O18mm", category: "Rotula Inferior", brand: "Peugeot", model: "306", stock: 68, minStock: 10, price: 13269.43, status: "active", createdAt: "2026-03-01" },
    { id: "4054F", name: "ROT.INF.ROSC.405H/94CONO FINO", category: "Rotula Inferior", brand: "Peugeot", model: "405", stock: 16, minStock: 10, price: 9673.04, status: "active", createdAt: "2026-03-01" },
    { id: "4054G", name: "ROT.INF.ROSC.95/ADCONO GRUESO", category: "Rotula Inferior", brand: "Peugeot", model: "", stock: 11, minStock: 10, price: 9673.04, status: "active", createdAt: "2026-03-01" },
    { id: "6055D", name: "BIELETA BARRA EST.DER.605", category: "Bieleta", brand: "Peugeot", model: "605", stock: 19, minStock: 10, price: 21082.27, status: "active", createdAt: "2026-03-01" },
    { id: "6055I", name: "BIELETA BARRA EST.IZQ.605", category: "Bieleta", brand: "Peugeot", model: "605", stock: 24, minStock: 10, price: 21082.27, status: "active", createdAt: "2026-03-01" },
    { id: "PA04F", name: "ROTULA INFERIOR PARTNER í16mm", category: "Rotula Inferior", brand: "Peugeot", model: "PARTNER", stock: 25, minStock: 10, price: 13269.43, status: "active", createdAt: "2026-03-01" },
    { id: "2086", name: "EXT.DER.PEUGEOT-208-2020 AD»", category: "Extremo", brand: "Peugeot", model: "208", stock: 59, minStock: 10, price: 19497.0, status: "active", createdAt: "2026-03-01" },
    { id: "2087", name: "EXT.IZQ.PEUGEOT  -208-2020 AD»", category: "Extremo", brand: "Peugeot", model: "208", stock: 13, minStock: 10, price: 19497.0, status: "active", createdAt: "2026-03-01" },
    { id: "2088", name: "ROTULA INFERIOR  -208-2020AD»", category: "Rotula Inferior", brand: "Peugeot", model: "208", stock: 54, minStock: 10, price: 16010.33, status: "active", createdAt: "2026-03-01" },
    { id: "F01", name: "EXTREMO DERECHO FLUENCE", category: "Extremo", brand: "Renault", model: "FLUENCE", stock: 53, minStock: 10, price: 20608.44, status: "active", createdAt: "2026-03-01" },
    { id: "F02", name: "EXTREMO IZQUIERDO FLUENCE", category: "Extremo", brand: "Renault", model: "FLUENCE", stock: 64, minStock: 10, price: 20608.44, status: "active", createdAt: "2026-03-01" },
    { id: "F04", name: "ROTULA INFERIOR FLUENCE", category: "Rotula Inferior", brand: "Renault", model: "FLUENCE", stock: 72, minStock: 10, price: 15581.99, status: "active", createdAt: "2026-03-01" },
    { id: "0601", name: "EXTREMO DER.R-4S/R-6", category: "Extremo", brand: "Renault", model: "R-4S", stock: 37, minStock: 10, price: 16430.45, status: "active", createdAt: "2026-03-01" },
    { id: "0602", name: "EXTREMO IZQ.R-4S/R-6", category: "Extremo", brand: "Renault", model: "R-4S", stock: 75, minStock: 10, price: 16430.45, status: "active", createdAt: "2026-03-01" },
    { id: "0603", name: "ROTULA SUPERIOR-R4S/R6", category: "Rotula Superior", brand: "Renault", model: "", stock: 6, minStock: 10, price: 9493.15, status: "active", createdAt: "2026-03-01" },
    { id: "1104", name: "ROTULA INF. R-9/R-11", category: "Rotula Inferior", brand: "Renault", model: "R-9", stock: 19, minStock: 10, price: 12535.83, status: "active", createdAt: "2026-03-01" },
    { id: "1105", name: "ROTULA INFERIOR -KWID-", category: "Rotula Inferior", brand: "Renault", model: "KWID", stock: 73, minStock: 10, price: 10530.69, status: "active", createdAt: "2026-03-01" },
    { id: "1201", name: "EXTREMO DER R-12", category: "Extremo", brand: "Renault", model: "R-12", stock: 39, minStock: 10, price: 11940.95, status: "active", createdAt: "2026-03-01" },
    { id: "1202", name: "EXTREMO IZQ R-12", category: "Extremo", brand: "Renault", model: "R-12", stock: 48, minStock: 10, price: 11940.94, status: "active", createdAt: "2026-03-01" },
    { id: "1203", name: "ROTULA SUPERIOR R-12", category: "Rotula Superior", brand: "Renault", model: "R-12", stock: 19, minStock: 10, price: 9493.15, status: "active", createdAt: "2026-03-01" },
    { id: "1204", name: "ROTULA INFERIOR R-12", category: "Rotula Inferior", brand: "Renault", model: "R-12", stock: 42, minStock: 10, price: 9493.15, status: "active", createdAt: "2026-03-01" },
    { id: "1205", name: "ROTULA INFERIOR KOLEOS", category: "Rotula Inferior", brand: "Renault", model: "KOLEOS", stock: 60, minStock: 10, price: 11028.02, status: "active", createdAt: "2026-03-01" },
    { id: "1207", name: "EXTREMO RENAULT -KWID-", category: "Extremo", brand: "Renault", model: "KWID", stock: 25, minStock: 10, price: 10719.3, status: "active", createdAt: "2026-03-01" },
    { id: "1210", name: "BIELETA BARRA ESTAB. R-12", category: "Bieleta", brand: "Renault", model: "R-12", stock: 63, minStock: 10, price: 4868.28, status: "active", createdAt: "2026-03-01" },
    { id: "1801", name: "EXTREMO R-9/R-11/R-18", category: "Extremo", brand: "Renault", model: "R-18", stock: 5, minStock: 10, price: 9673.05, status: "active", createdAt: "2026-03-01" },
    { id: "1803", name: "ROTULA SUP. R-18", category: "Rotula Superior", brand: "Renault", model: "R-18", stock: 38, minStock: 10, price: 10466.81, status: "active", createdAt: "2026-03-01" },
    { id: "1804", name: "ROTULA INF. R-18", category: "Rotula Inferior", brand: "Renault", model: "R-18", stock: 69, minStock: 10, price: 15335.09, status: "active", createdAt: "2026-03-01" },
    { id: "1810", name: "BIELETA BARRA ESTAB.R-18", category: "Bieleta", brand: "Renault", model: "R-18", stock: 27, minStock: 10, price: 4868.28, status: "active", createdAt: "2026-03-01" },
    { id: "1901", name: "EXTREMO DERECHO R-19", category: "Extremo", brand: "Renault", model: "R-19", stock: 69, minStock: 10, price: 10831.93, status: "active", createdAt: "2026-03-01" },
    { id: "1902", name: "EXTREMO IZQUIERDO R-19", category: "Extremo", brand: "Renault", model: "R-19", stock: 18, minStock: 10, price: 10831.93, status: "active", createdAt: "2026-03-01" },
    { id: "1904", name: "ROTULA INFERIOR R-19", category: "Rotula Inferior", brand: "Renault", model: "R-19", stock: 43, minStock: 10, price: 12535.83, status: "active", createdAt: "2026-03-01" },
    { id: "2101", name: "EXTREMO R-21", category: "Extremo", brand: "Renault", model: "R-21", stock: 69, minStock: 10, price: 11927.3, status: "active", createdAt: "2026-03-01" },
    { id: "2104", name: "ROTULA INFERIOR R-21", category: "Rotula Inferior", brand: "Renault", model: "R-21", stock: 30, minStock: 10, price: 14819.92, status: "active", createdAt: "2026-03-01" },
    { id: "CL01", name: "EXTREMO DER. CLIO", category: "Extremo", brand: "Renault", model: "CLIO", stock: 24, minStock: 10, price: 15335.09, status: "active", createdAt: "2026-03-01" },
    { id: "CL02", name: "EXTREMO IZQ. CLIO", category: "Extremo", brand: "Renault", model: "CLIO", stock: 52, minStock: 10, price: 15335.09, status: "active", createdAt: "2026-03-01" },
    { id: "CL04", name: "ROTULA INF. CLIO/CLIO 2", category: "Rotula Inferior", brand: "Renault", model: "CLIO", stock: 25, minStock: 10, price: 12535.83, status: "active", createdAt: "2026-03-01" },
    { id: "DA01", name: "EXTREMO DERECHO DUSTER", category: "Extremo", brand: "Renault", model: "DUSTER", stock: 74, minStock: 10, price: 20105.8, status: "active", createdAt: "2026-03-01" },
    { id: "DA02", name: "EXTREMO IZQUIERDO DUSTER", category: "Extremo", brand: "Renault", model: "DUSTER", stock: 72, minStock: 10, price: 20105.8, status: "active", createdAt: "2026-03-01" },
    { id: "DA04", name: "ROTULA INFERIOR  DUSTER", category: "Rotula Inferior", brand: "Renault", model: "DUSTER", stock: 5, minStock: 10, price: 14381.93, status: "active", createdAt: "2026-03-01" },
    { id: "EX01", name: "EXTREMO EXPRESS", category: "Extremo", brand: "Renault", model: "EXPRESS", stock: 46, minStock: 10, price: 9493.15, status: "active", createdAt: "2026-03-01" },
    { id: "EX04", name: "ROTULA INFERIOR EXPRESS", category: "Rotula Inferior", brand: "Renault", model: "EXPRESS", stock: 67, minStock: 10, price: 12535.83, status: "active", createdAt: "2026-03-01" },
    { id: "KA01", name: "EXTREMO DER.KANGOO /CLIO 2", category: "Extremo", brand: "Renault", model: "KANGOO", stock: 7, minStock: 10, price: 12535.83, status: "active", createdAt: "2026-03-01" },
    { id: "KA02", name: "EXTREMO IZQ.KANGOO/CLIO 2", category: "Extremo", brand: "Renault", model: "KANGOO", stock: 19, minStock: 10, price: 12535.83, status: "active", createdAt: "2026-03-01" },
    { id: "KA04", name: "ROTULA INFERIOR KANGOO", category: "Rotula Inferior", brand: "Renault", model: "KANGOO", stock: 51, minStock: 10, price: 12535.83, status: "active", createdAt: "2026-03-01" },
    { id: "LA03", name: "ROTULA INFERIOR LAGUNA II", category: "Rotula Inferior", brand: "Renault", model: "LAGUNA", stock: 44, minStock: 10, price: 15926.37, status: "active", createdAt: "2026-03-01" },
    { id: "LA04", name: "ROTULA INFERIOR LAGUNA", category: "Rotula Inferior", brand: "Renault", model: "LAGUNA", stock: 35, minStock: 10, price: 9979.98, status: "active", createdAt: "2026-03-01" },
    { id: "LA10", name: "BIELETA BARRA ESTAB.LAGUNA", category: "Bieleta", brand: "Renault", model: "LAGUNA", stock: 12, minStock: 10, price: 21177.03, status: "active", createdAt: "2026-03-01" },
    { id: "MA01", name: "EXTREMO DERECHO MASTER", category: "Extremo", brand: "Renault", model: "MASTER", stock: 35, minStock: 10, price: 21299.58, status: "active", createdAt: "2026-03-01" },
    { id: "MA02", name: "EXTREMO IZQUIERO MASTER", category: "Extremo", brand: "Renault", model: "MASTER", stock: 77, minStock: 10, price: 21299.58, status: "active", createdAt: "2026-03-01" },
    { id: "MA03", name: "ROTULA SUPERIOR MASTER", category: "Rotula Superior", brand: "Renault", model: "MASTER", stock: 15, minStock: 10, price: 17525.82, status: "active", createdAt: "2026-03-01" },
    { id: "MA04", name: "ROTULA INFERIOR MASTER", category: "Rotula Inferior", brand: "Renault", model: "MASTER", stock: 15, minStock: 10, price: 16673.87, status: "active", createdAt: "2026-03-01" },
    { id: "MA05", name: "ROTULA DER.MASTER 2014/ROS.IZQ", category: "Rotula", brand: "Renault", model: "MASTER", stock: 67, minStock: 10, price: 18849.19, status: "active", createdAt: "2026-03-01" },
    { id: "MA06", name: "ROTULA IZQ.MASTER 2014/ROS.DER", category: "Rotula", brand: "Renault", model: "MASTER", stock: 13, minStock: 10, price: 18849.19, status: "active", createdAt: "2026-03-01" },
    { id: "MA07", name: "EXT.MASTER DERECHO-2013>>", category: "Extremo", brand: "Renault", model: "MASTER", stock: 73, minStock: 10, price: 23785.93, status: "active", createdAt: "2026-03-01" },
    { id: "MA08", name: "EXT.MASTER-IZQUIERDO-2013>>", category: "Extremo", brand: "Renault", model: "MASTER", stock: 21, minStock: 10, price: 23785.93, status: "active", createdAt: "2026-03-01" },
    { id: "ME01", name: "EXTREMO DER.MEGANE", category: "Extremo", brand: "Renault", model: "MEGANE", stock: 21, minStock: 10, price: 15335.09, status: "active", createdAt: "2026-03-01" },
    { id: "ME02", name: "EXTREMO IZQ.MEGANE", category: "Extremo", brand: "Renault", model: "MEGANE", stock: 65, minStock: 10, price: 15335.09, status: "active", createdAt: "2026-03-01" },
    { id: "ME04", name: "ROTULA INFERIOR MEGANE", category: "Rotula Inferior", brand: "Renault", model: "MEGANE", stock: 75, minStock: 10, price: 12535.83, status: "active", createdAt: "2026-03-01" },
    { id: "MEF1", name: "EXTREMO DERECHO MEGANE II", category: "Extremo", brand: "Renault", model: "MEGANE", stock: 26, minStock: 10, price: 19471.85, status: "active", createdAt: "2026-03-01" },
    { id: "MEF2", name: "EXTREMO IZQUIERDO MEGANE II", category: "Extremo", brand: "Renault", model: "MEGANE", stock: 38, minStock: 10, price: 19471.85, status: "active", createdAt: "2026-03-01" },
    { id: "TL01", name: "EXTREMO DER. LOGAN", category: "Extremo", brand: "Renault", model: "LOGAN", stock: 72, minStock: 10, price: 19473.13, status: "active", createdAt: "2026-03-01" },
    { id: "TL02", name: "EXTREMO IZQUIERDO LOGAN", category: "Extremo", brand: "Renault", model: "LOGAN", stock: 59, minStock: 10, price: 19473.13, status: "active", createdAt: "2026-03-01" },
    { id: "TR01", name: "EXTREMO TRAFIC", category: "Extremo", brand: "Renault", model: "TRAFIC", stock: 32, minStock: 10, price: 11927.3, status: "active", createdAt: "2026-03-01" },
    { id: "TR04", name: "ROTULA INF. TRAFIC", category: "Rotula Inferior", brand: "Renault", model: "TRAFIC", stock: 74, minStock: 10, price: 15821.92, status: "active", createdAt: "2026-03-01" },
    { id: "TW01", name: "EXTREMO DER. TWINGO", category: "Extremo", brand: "Renault", model: "TWINGO", stock: 30, minStock: 10, price: 14239.73, status: "active", createdAt: "2026-03-01" },
    { id: "TW02", name: "EXTREMO IZQ.TWINGO", category: "Extremo", brand: "Renault", model: "TWINGO", stock: 44, minStock: 10, price: 14239.73, status: "active", createdAt: "2026-03-01" },
    { id: "TW04", name: "ROTULA INF.TWINGO", category: "Rotula Inferior", brand: "Renault", model: "TWINGO", stock: 56, minStock: 10, price: 12535.83, status: "active", createdAt: "2026-03-01" },
    { id: "0604D", name: "ROTULA INF. DER. R-4S/R-6", category: "Rotula Inferior", brand: "Renault", model: "R-4S", stock: 52, minStock: 10, price: 9736.57, status: "active", createdAt: "2026-03-01" },
    { id: "0604I", name: "ROTULA INF. IZQ. R-4S/R-6", category: "Rotula Inferior", brand: "Renault", model: "R-4S", stock: 61, minStock: 10, price: 9736.57, status: "active", createdAt: "2026-03-01" },
    { id: "1104G", name: "ROTULA INFERIOR R9-11 O17mm", category: "Rotula Inferior", brand: "Renault", model: "", stock: 71, minStock: 10, price: 15335.13, status: "active", createdAt: "2026-03-01" },
    { id: "1904G", name: "ROTULA INF.R-19 › 17mm", category: "Rotula Inferior", brand: "Renault", model: "R-19", stock: 62, minStock: 10, price: 15335.09, status: "active", createdAt: "2026-03-01" },
    { id: "CL01/2", name: "EXTREMO DERECHO CLIO 2", category: "Extremo", brand: "Renault", model: "CLIO", stock: 20, minStock: 10, price: 12535.83, status: "active", createdAt: "2026-03-01" },
    { id: "CL02/2", name: "EXTREMO IZQUIERDO CLIO 2", category: "Extremo", brand: "Renault", model: "CLIO", stock: 36, minStock: 10, price: 12535.83, status: "active", createdAt: "2026-03-01" },
    { id: "MA04/2", name: "ROTULA INF.MASTER 09", category: "Rotula Inferior", brand: "Renault", model: "MASTER", stock: 33, minStock: 10, price: 17525.82, status: "active", createdAt: "2026-03-01" },
    { id: "ME04/F2", name: "ROTULA INFERIOR MEGANE FASE 2", category: "Rotula Inferior", brand: "Renault", model: "MEGANE", stock: 13, minStock: 10, price: 9979.98, status: "active", createdAt: "2026-03-01" },
    { id: "CL01/ME01", name: "EXTREMO DER.CLIO/MEGANE", category: "Extremo", brand: "Renault", model: "CLIO", stock: 48, minStock: 10, price: 15335.08, status: "active", createdAt: "2026-03-01" },
    { id: "97", name: "EXTREMO DER. CHERY TIGGO3-2017>>", category: "Extremo", brand: "Chery", model: "TIGGO", stock: 7, minStock: 10, price: 14930.0, status: "active", createdAt: "2026-03-01" },
    { id: "98", name: "EXTREMO IZQ. CHERY TIGGO3-2017>>", category: "Extremo", brand: "Chery", model: "TIGGO", stock: 80, minStock: 10, price: 14930.0, status: "active", createdAt: "2026-03-01" },
    { id: "205", name: "EXTREMO TOYOTA 2005/2015-ROSC.15x1,5mm", category: "Extremo", brand: "Toyota", model: "", stock: 75, minStock: 10, price: 14680.0, status: "active", createdAt: "2026-03-01" },
    { id: "206", name: "EXTREMO TOYOTA 2016/2023-ROSC.16x1,5mm", category: "Extremo", brand: "Toyota", model: "", stock: 34, minStock: 10, price: 14680.0, status: "active", createdAt: "2026-03-01" },
    { id: "207", name: "ROTULA .SUPERIOR TOYOTA 2005/2015", category: "Rotula Superior", brand: "Toyota", model: "", stock: 80, minStock: 10, price: 18500.0, status: "active", createdAt: "2026-03-01" },
    { id: "208", name: "ROTULA  INFERIOR TOYOTA 2005/2015", category: "Rotula Inferior", brand: "Toyota", model: "", stock: 33, minStock: 10, price: 18900.0, status: "active", createdAt: "2026-03-01" },
    { id: "99", name: "EXTREMO DER. CHERY TIGGO 09>>", category: "Extremo", brand: "Chery", model: "TIGGO", stock: 5, minStock: 10, price: 13743.99, status: "active", createdAt: "2026-03-01" },
    { id: "100", name: "EXTREMO IZQ. CHERY TIGGO 09>>", category: "Extremo", brand: "Chery", model: "TIGGO", stock: 14, minStock: 10, price: 13743.99, status: "active", createdAt: "2026-03-01" },
    { id: "SP01", name: "EXTREMO SPRINTER", category: "Extremo", brand: "Mercedes-Benz", model: "SPRINTER", stock: 12, minStock: 10, price: 14725.7, status: "active", createdAt: "2026-03-01" },
    { id: "SP02", name: "EXTREMO SPRINTER 2012>>", category: "Extremo", brand: "Mercedes-Benz", model: "SPRINTER", stock: 34, minStock: 10, price: 15041.0, status: "active", createdAt: "2026-03-01" },
    { id: "61", name: "EXTREMO DERECHO ESCARABAJO", category: "Extremo", brand: "Volkswagen", model: "ESCARABAJO", stock: 13, minStock: 10, price: 9740.69, status: "active", createdAt: "2026-03-01" },
    { id: "62", name: "EXTREMO IZQUIERDO ESCARABAJO", category: "Extremo", brand: "Volkswagen", model: "ESCARABAJO", stock: 9, minStock: 10, price: 9740.69, status: "active", createdAt: "2026-03-01" },
    { id: "74", name: "ROTULA INF. PASSAT 85/92", category: "Rotula Inferior", brand: "Volkswagen", model: "", stock: 47, minStock: 10, price: 15828.62, status: "active", createdAt: "2026-03-01" },
    { id: "84", name: "ROT.INF.VW CARAT-DIREC.MEC.", category: "Rotula Inferior", brand: "Volkswagen", model: "", stock: 14, minStock: 10, price: 15828.62, status: "active", createdAt: "2026-03-01" },
    { id: "101", name: "EXTREMO GACEL/SENDA/SAV./GOL", category: "Extremo", brand: "Volkswagen", model: "GOL", stock: 70, minStock: 10, price: 9673.05, status: "active", createdAt: "2026-03-01" },
    { id: "105", name: "BARRA ESTABILIZADORA-GOL 1000-", category: "Bieleta", brand: "Volkswagen", model: "GOL", stock: 35, minStock: 10, price: 19968.1, status: "active", createdAt: "2026-03-01" },
    { id: "106", name: "BARRA GACEL 83-85 L 515mm", category: "Otro", brand: "Volkswagen", model: "GACEL", stock: 40, minStock: 10, price: 19481.37, status: "active", createdAt: "2026-03-01" },
    { id: "107", name: "BARRA GACEL-SENDA 85/95 L525mm", category: "Otro", brand: "Volkswagen", model: "GACEL", stock: 67, minStock: 10, price: 19481.37, status: "active", createdAt: "2026-03-01" },
    { id: "118", name: "EXT.DER.FOX-SURAN-VOYAGE-TREND", category: "Extremo", brand: "Volkswagen", model: "FOX", stock: 32, minStock: 10, price: 13880.55, status: "active", createdAt: "2026-03-01" },
    { id: "119", name: "EXT.IZQ.FOX-SURAN-VOYAGE-TREND", category: "Extremo", brand: "Volkswagen", model: "FOX", stock: 74, minStock: 10, price: 13880.55, status: "active", createdAt: "2026-03-01" },
    { id: "124", name: "ROT.INF.GOL DIREC.MEC.MOD.NVO", category: "Rotula Inferior", brand: "Volkswagen", model: "GOL", stock: 21, minStock: 10, price: 13028.17, status: "active", createdAt: "2026-03-01" },
    { id: "125", name: "BIELETA ESTABILIZ.-FOX-SURAN-", category: "Bieleta", brand: "Volkswagen", model: "FOX", stock: 78, minStock: 10, price: 14982.65, status: "active", createdAt: "2026-03-01" },
    { id: "126", name: "BARRA DER.SENDA-GOL95-97L540mm", category: "Otro", brand: "Volkswagen", model: "GOL", stock: 78, minStock: 10, price: 19968.41, status: "active", createdAt: "2026-03-01" },
    { id: "127", name: "BARRA IZQ.SENDA-GOL 99 L540mm", category: "Otro", brand: "Volkswagen", model: "GOL", stock: 65, minStock: 10, price: 19968.41, status: "active", createdAt: "2026-03-01" },
    { id: "128", name: "BIELETA ESTABILIZADORA VENTO", category: "Bieleta", brand: "Volkswagen", model: "VENTO", stock: 36, minStock: 10, price: 19376.74, status: "active", createdAt: "2026-03-01" },
    { id: "131", name: "EXTREMO GOL SENDA DIR HID 95", category: "Extremo", brand: "Volkswagen", model: "GOL", stock: 65, minStock: 10, price: 10471.24, status: "active", createdAt: "2026-03-01" },
    { id: "135", name: "ROT.INF.GOL DIR.MEC.MOD.NV7/97", category: "Rotula Inferior", brand: "Volkswagen", model: "GOL", stock: 57, minStock: 10, price: 12983.75, status: "active", createdAt: "2026-03-01" },
    { id: "137", name: "EXTREMO GOL MOD. 2005 AD.", category: "Extremo", brand: "Volkswagen", model: "GOL", stock: 29, minStock: 10, price: 9740.69, status: "active", createdAt: "2026-03-01" },
    { id: "141", name: "EXTREMO DER.VW POLO /GOLF", category: "Extremo", brand: "Volkswagen", model: "GOL", stock: 17, minStock: 10, price: 10471.24, status: "active", createdAt: "2026-03-01" },
    { id: "142", name: "EXTREMO IZQ.VW POLO/GOLF", category: "Extremo", brand: "Volkswagen", model: "GOL", stock: 17, minStock: 10, price: 10471.24, status: "active", createdAt: "2026-03-01" },
    { id: "144", name: "ROTULA INF.VW POLO/GOLF", category: "Rotula Inferior", brand: "Volkswagen", model: "GOL", stock: 60, minStock: 10, price: 12541.13, status: "active", createdAt: "2026-03-01" },
    { id: "145", name: "EXTREMO DER.POLO /CADDY AD/01", category: "Extremo", brand: "Volkswagen", model: "POLO", stock: 50, minStock: 10, price: 14002.24, status: "active", createdAt: "2026-03-01" },
    { id: "146", name: "EXTREMO IZQ.POLO/CADDY AD/01", category: "Extremo", brand: "Volkswagen", model: "POLO", stock: 59, minStock: 10, price: 14002.24, status: "active", createdAt: "2026-03-01" },
    { id: "151", name: "EXTREMO VW 1500", category: "Extremo", brand: "Volkswagen", model: "1500", stock: 57, minStock: 10, price: 9673.05, status: "active", createdAt: "2026-03-01" },
    { id: "154", name: "BRAZO ROTULA DODGE 1500", category: "Brazo", brand: "Volkswagen", model: "1500", stock: 64, minStock: 10, price: 31421.48, status: "active", createdAt: "2026-03-01" },
    { id: "155", name: "BRAZO ROTULA VW 1500 83¯", category: "Brazo", brand: "Volkswagen", model: "1500", stock: 11, minStock: 10, price: 31421.47, status: "active", createdAt: "2026-03-01" },
    { id: "161", name: "EXTREMO DER. TRANSPORTER", category: "Extremo", brand: "Volkswagen", model: "TRANSPORTER", stock: 17, minStock: 10, price: 13880.48, status: "active", createdAt: "2026-03-01" },
    { id: "162", name: "EXTREMO IZQ. TRANSPORTER", category: "Extremo", brand: "Volkswagen", model: "TRANSPORTER", stock: 12, minStock: 10, price: 13880.48, status: "active", createdAt: "2026-03-01" },
    { id: "163", name: "ROTULA SUPERIOR TRANSPORTER", category: "Rotula Superior", brand: "Volkswagen", model: "TRANSPORTER", stock: 56, minStock: 10, price: 14367.51, status: "active", createdAt: "2026-03-01" },
    { id: "164", name: "ROTULA INFERIOR TRANSPORTER", category: "Rotula Inferior", brand: "Volkswagen", model: "TRANSPORTER", stock: 48, minStock: 10, price: 17418.58, status: "active", createdAt: "2026-03-01" },
    { id: "165", name: "EXTREMO DER.AMAROK", category: "Extremo", brand: "Volkswagen", model: "AMAROK", stock: 18, minStock: 10, price: 15177.12, status: "active", createdAt: "2026-03-01" },
    { id: "166", name: "EXTREMO IZQ.AMAROK", category: "Extremo", brand: "Volkswagen", model: "AMAROK", stock: 36, minStock: 10, price: 15177.12, status: "active", createdAt: "2026-03-01" },
    { id: "167", name: "ROTULA INFERIOR AMAROK", category: "Rotula Inferior", brand: "Volkswagen", model: "AMAROK", stock: 29, minStock: 10, price: 17765.31, status: "active", createdAt: "2026-03-01" },
    { id: "168", name: "ROTULA SUPERIOR AMAROK", category: "Rotula Superior", brand: "Volkswagen", model: "AMAROK", stock: 29, minStock: 10, price: 11783.4, status: "active", createdAt: "2026-03-01" },
    { id: "171", name: "EXTREMO DER.POINTER", category: "Extremo", brand: "Volkswagen", model: "POINTER", stock: 73, minStock: 10, price: 10471.24, status: "active", createdAt: "2026-03-01" },
    { id: "172", name: "EXTREMO IZQ. POINTER", category: "Extremo", brand: "Volkswagen", model: "POINTER", stock: 62, minStock: 10, price: 10471.24, status: "active", createdAt: "2026-03-01" },
    { id: "174", name: "ROTULA INFERIOR POINTER", category: "Rotula Inferior", brand: "Volkswagen", model: "POINTER", stock: 22, minStock: 10, price: 12541.13, status: "active", createdAt: "2026-03-01" },
    { id: "175", name: "BIELETA BARRA EST.POINTER", category: "Bieleta", brand: "Volkswagen", model: "POINTER", stock: 59, minStock: 10, price: 13393.45, status: "active", createdAt: "2026-03-01" },
    { id: "181", name: "EXT.DER.GOLF.99AD.EVOLUTION IV", category: "Extremo", brand: "Volkswagen", model: "GOL", stock: 28, minStock: 10, price: 13880.48, status: "active", createdAt: "2026-03-01" },
    { id: "182", name: "EXT.IZQ.GOLF.99AD.EVOLUTION IV", category: "Extremo", brand: "Volkswagen", model: "GOL", stock: 40, minStock: 10, price: 13880.48, status: "active", createdAt: "2026-03-01" },
    { id: "191", name: "EXTREMO DERECHO VENTO-AUDI A3", category: "Extremo", brand: "Volkswagen", model: "VENTO", stock: 64, minStock: 10, price: 15828.62, status: "active", createdAt: "2026-03-01" },
    { id: "192", name: "EXTREMO IZQUIERDO VENTO-AUDIA3", category: "Extremo", brand: "Volkswagen", model: "VENTO", stock: 36, minStock: 10, price: 15828.62, status: "active", createdAt: "2026-03-01" },
    { id: "104D", name: "ROT.INF.DER.GACEL/GOL93", category: "Rotula Inferior", brand: "Volkswagen", model: "GOL", stock: 14, minStock: 10, price: 12541.13, status: "active", createdAt: "2026-03-01" },
    { id: "104I", name: "ROT.INF.IZQ.GACEL/GOL93", category: "Rotula Inferior", brand: "Volkswagen", model: "GOL", stock: 61, minStock: 10, price: 12541.13, status: "active", createdAt: "2026-03-01" },
    { id: "114D", name: "ROT.INF.DER.SENDA/GOL'93", category: "Rotula Inferior", brand: "Volkswagen", model: "GOL", stock: 75, minStock: 10, price: 13028.17, status: "active", createdAt: "2026-03-01" },
    { id: "114I", name: "ROT.INF.IZQ.SENDA/GOL'93", category: "Rotula Inferior", brand: "Volkswagen", model: "GOL", stock: 17, minStock: 10, price: 13028.17, status: "active", createdAt: "2026-03-01" },
    { id: "120D", name: "ROT.INF.DERECHA -FOX-SURAN-", category: "Rotula Inferior", brand: "Volkswagen", model: "FOX", stock: 11, minStock: 10, price: 16644.05, status: "active", createdAt: "2026-03-01" },
    { id: "120I", name: "ROT.INF.IZQUIERDA -FOX-SURAN-", category: "Rotula Inferior", brand: "Volkswagen", model: "FOX", stock: 74, minStock: 10, price: 16644.05, status: "active", createdAt: "2026-03-01" },
    { id: "122D", name: "ROT.INF.GOL DER.VOYAGE-TREND", category: "Rotula Inferior", brand: "Volkswagen", model: "GOL", stock: 6, minStock: 10, price: 16644.05, status: "active", createdAt: "2026-03-01" },
    { id: "122I", name: "ROT.INF.GOL IZQ.VOYAGE-TREND", category: "Rotula Inferior", brand: "Volkswagen", model: "GOL", stock: 16, minStock: 10, price: 16644.05, status: "active", createdAt: "2026-03-01" },
    { id: "134D", name: "ROT.INF.DER.GOL.DIR.HID.MOD/NV", category: "Rotula Inferior", brand: "Volkswagen", model: "GOL", stock: 35, minStock: 10, price: 13028.17, status: "active", createdAt: "2026-03-01" },
    { id: "134I", name: "ROT.INF.IZQ.GOL DIR.HID.MOD.NV", category: "Rotula Inferior", brand: "Volkswagen", model: "GOL", stock: 26, minStock: 10, price: 13028.17, status: "active", createdAt: "2026-03-01" },
    { id: "136D", name: "ROT.INF.DER.GOL DIR.HID.M/7/97", category: "Rotula Inferior", brand: "Volkswagen", model: "GOL", stock: 57, minStock: 10, price: 13028.17, status: "active", createdAt: "2026-03-01" },
    { id: "136I", name: "ROT.INF.IZQ.GOL DIR.HID.M/7/97", category: "Rotula Inferior", brand: "Volkswagen", model: "GOL", stock: 67, minStock: 10, price: 13028.17, status: "active", createdAt: "2026-03-01" },
    { id: "174G", name: "ROTULA INF. ESCORT POINTER 18", category: "Rotula Inferior", brand: "Volkswagen", model: "POINTER", stock: 66, minStock: 10, price: 14586.29, status: "active", createdAt: "2026-03-01" },
    { id: "184D", name: "ROT. INF. DER. GOLF EVOL. IV", category: "Rotula Inferior", brand: "Volkswagen", model: "GOL", stock: 32, minStock: 10, price: 16437.41, status: "active", createdAt: "2026-03-01" },
    { id: "184I", name: "ROT. INF. IZQ. GOLF EVOL.IV", category: "Rotula Inferior", brand: "Volkswagen", model: "GOL", stock: 56, minStock: 10, price: 16437.41, status: "active", createdAt: "2026-03-01" },
    { id: "194D", name: "ROTULA INF.DER.-GOLF V-VENTO-", category: "Rotula Inferior", brand: "Volkswagen", model: "GOL", stock: 12, minStock: 10, price: 14582.88, status: "active", createdAt: "2026-03-01" },
    { id: "194I", name: "ROTULA INF.IZQ.-GOLF V-VENTO-", category: "Rotula Inferior", brand: "Volkswagen", model: "GOL", stock: 26, minStock: 10, price: 14582.88, status: "active", createdAt: "2026-03-01" },
    { id: "437", name: "ROTLA   INF.CHEVROLET-ONIX-TRACKER-MONTANA 2020»", category: "Rotula Inferior", brand: "Chevrolet", model: "ONIX", stock: 53, minStock: 10, price: 18300.0, status: "active", createdAt: "2026-03-01" },
    { id: "438", name: "EXT.DER. CHEVROLET CRUZER-2017>>", category: "Extremo", brand: "Chevrolet", model: "CRUZE", stock: 5, minStock: 10, price: 16224.0, status: "active", createdAt: "2026-03-01" },
    { id: "439", name: "EXT..IZQ. CHEVROLET CRUZER-2017>>", category: "Extremo", brand: "Chevrolet", model: "CRUZE", stock: 54, minStock: 10, price: 16224.0, status: "active", createdAt: "2026-03-01" },
    { id: "466", name: "EXTREMO CHEVRLET S-10 2015 AD>>", category: "Extremo", brand: "Chevrolet", model: "S-10", stock: 38, minStock: 10, price: 14680.0, status: "active", createdAt: "2026-03-01" },
    { id: "401", name: "EXTREMO CORSA 95/98 M12X1.5nn", category: "Extremo", brand: "Chevrolet", model: "CORSA", stock: 63, minStock: 10, price: 10471.24, status: "active", createdAt: "2026-03-01" },
    { id: "402", name: "EXTREMO CORSA 98/99 M14x2nn", category: "Extremo", brand: "Chevrolet", model: "CORSA", stock: 41, minStock: 10, price: 10471.24, status: "active", createdAt: "2026-03-01" },
    { id: "403", name: "EXTREMO CORSA 00 AD M14x1.5mm", category: "Extremo", brand: "Chevrolet", model: "CORSA", stock: 59, minStock: 10, price: 10471.24, status: "active", createdAt: "2026-03-01" },
    { id: "404", name: "ROTULA INF.CORSA HASTA 97", category: "Rotula Inferior", brand: "Chevrolet", model: "CORSA", stock: 76, minStock: 10, price: 13028.18, status: "active", createdAt: "2026-03-01" },
    { id: "405", name: "PARRILLA-DAEWOO-TICO-SPARK/MV", category: "Parrilla", brand: "Chevrolet", model: "", stock: 67, minStock: 10, price: 32634.53, status: "active", createdAt: "2026-03-01" },
    { id: "414", name: "ROTULA INFERIOR CORSA 98/02", category: "Rotula Inferior", brand: "Chevrolet", model: "CORSA", stock: 24, minStock: 10, price: 15621.28, status: "active", createdAt: "2026-03-01" },
    { id: "415", name: "ROTULA INF. CLASSIC-AGILE", category: "Rotula Inferior", brand: "Chevrolet", model: "CLASSIC", stock: 29, minStock: 10, price: 17750.71, status: "active", createdAt: "2026-03-01" },
    { id: "416", name: "ROTULA INFERIOR AGILE", category: "Rotula Inferior", brand: "Chevrolet", model: "AGILE", stock: 42, minStock: 10, price: 20048.93, status: "active", createdAt: "2026-03-01" },
    { id: "417", name: "ROTULA INF.CHEVROLET MONTANA", category: "Rotula Inferior", brand: "Chevrolet", model: "MONTANA", stock: 32, minStock: 10, price: 20048.93, status: "active", createdAt: "2026-03-01" },
    { id: "421", name: "EXTREMO CORSA 03 AD M 14x1.5mm", category: "Extremo", brand: "Chevrolet", model: "CORSA", stock: 12, minStock: 10, price: 13880.49, status: "active", createdAt: "2026-03-01" },
    { id: "424", name: "ROTULA INF.CORSA 03¯", category: "Rotula Inferior", brand: "Chevrolet", model: "CORSA", stock: 79, minStock: 10, price: 13636.97, status: "active", createdAt: "2026-03-01" },
    { id: "430", name: "EXTREMO ASTRA -08 AD-", category: "Extremo", brand: "Chevrolet", model: "ASTRA", stock: 74, minStock: 10, price: 10958.28, status: "active", createdAt: "2026-03-01" },
    { id: "431", name: "EXT.ASTRA/VECTRA 96 AD M14x1.5", category: "Extremo", brand: "Chevrolet", model: "ASTRA", stock: 12, minStock: 10, price: 10958.28, status: "active", createdAt: "2026-03-01" },
    { id: "432", name: "ROTULA INF-ONIX-SONIC-SPIN", category: "Rotula Inferior", brand: "Chevrolet", model: "ONIX", stock: 45, minStock: 10, price: 13637.38, status: "active", createdAt: "2026-03-01" },
    { id: "433", name: "EXT.CHEVROLET SPIN-SONIC 2012", category: "Extremo", brand: "Chevrolet", model: "SPIN", stock: 12, minStock: 10, price: 15337.21, status: "active", createdAt: "2026-03-01" },
    { id: "434", name: "ROTULA INFERIOR ASTRA/VECTRA", category: "Rotula Inferior", brand: "Chevrolet", model: "ASTRA", stock: 11, minStock: 10, price: 13636.97, status: "active", createdAt: "2026-03-01" },
    { id: "435", name: "EXT.CHEVROLET DER.ONIX 2017>>", category: "Extremo", brand: "Chevrolet", model: "ONIX", stock: 79, minStock: 10, price: 17276.78, status: "active", createdAt: "2026-03-01" },
    { id: "436", name: "EXT.CHEVROLET IZQ.ONIX 2017>>", category: "Extremo", brand: "Chevrolet", model: "ONIX", stock: 66, minStock: 10, price: 17276.78, status: "active", createdAt: "2026-03-01" },
    { id: "441", name: "EXTREMO MERIVA M14x1.5mm", category: "Extremo", brand: "Chevrolet", model: "MERIVA", stock: 69, minStock: 10, price: 13880.49, status: "active", createdAt: "2026-03-01" },
    { id: "444", name: "ROTULA INFERIOR MERIVA", category: "Rotula Inferior", brand: "Chevrolet", model: "MERIVA", stock: 72, minStock: 10, price: 15098.07, status: "active", createdAt: "2026-03-01" },
    { id: "451", name: "EXTREMO DERECHO AVEO", category: "Extremo", brand: "Chevrolet", model: "AVEO", stock: 25, minStock: 10, price: 20211.75, status: "active", createdAt: "2026-03-01" },
    { id: "452", name: "EXTREMO IZQUIERDO AVEO", category: "Extremo", brand: "Chevrolet", model: "AVEO", stock: 12, minStock: 10, price: 20211.75, status: "active", createdAt: "2026-03-01" },
    { id: "454", name: "ROTULA INFERIOR AVEO", category: "Rotula Inferior", brand: "Chevrolet", model: "AVEO", stock: 70, minStock: 10, price: 13880.49, status: "active", createdAt: "2026-03-01" },
    { id: "455", name: "EXTREMO LARGO DERECHO OMEGA", category: "Extremo", brand: "Chevrolet", model: "OMEGA", stock: 15, minStock: 10, price: 15585.11, status: "active", createdAt: "2026-03-01" },
    { id: "456", name: "EXTREMO LARGO IZQUIERDO OMEGA", category: "Extremo", brand: "Chevrolet", model: "OMEGA", stock: 28, minStock: 10, price: 15585.11, status: "active", createdAt: "2026-03-01" },
    { id: "457", name: "EXTREMO CORTO DER. OMEGA", category: "Extremo", brand: "Chevrolet", model: "OMEGA", stock: 13, minStock: 10, price: 10475.69, status: "active", createdAt: "2026-03-01" },
    { id: "458", name: "EXTREMO CORTO IZQ.OMEGA", category: "Extremo", brand: "Chevrolet", model: "OMEGA", stock: 13, minStock: 10, price: 10475.69, status: "active", createdAt: "2026-03-01" },
    { id: "461", name: "EXTREMO INTERIOR BLAZER-S10", category: "Extremo", brand: "Chevrolet", model: "BLAZER", stock: 35, minStock: 10, price: 9862.45, status: "active", createdAt: "2026-03-01" },
    { id: "462", name: "EXTREMO EXTERIOR BLAZER-S10", category: "Extremo", brand: "Chevrolet", model: "BLAZER", stock: 56, minStock: 10, price: 10471.24, status: "active", createdAt: "2026-03-01" },
    { id: "463", name: "ROTULA SUPERIOR BLAZER-S10", category: "Rotula Superior", brand: "Chevrolet", model: "BLAZER", stock: 20, minStock: 10, price: 12541.14, status: "active", createdAt: "2026-03-01" },
    { id: "464", name: "ROTULA INFERIOR BLAZER-S10", category: "Rotula Inferior", brand: "Chevrolet", model: "BLAZER", stock: 77, minStock: 10, price: 13149.94, status: "active", createdAt: "2026-03-01" },
    { id: "465", name: "EXTREMO CHEVROLET S-10 2014AD>", category: "Extremo", brand: "Chevrolet", model: "S-10", stock: 36, minStock: 10, price: 15637.38, status: "active", createdAt: "2026-03-01" },
    { id: "470", name: "EXT.CHEVROLET CAPTIVA-2007/09", category: "Extremo", brand: "Chevrolet", model: "CAPTIVA", stock: 79, minStock: 10, price: 15337.17, status: "active", createdAt: "2026-03-01" },
    { id: "471", name: "EXT.CHEVROLET CAPTIVA-2010-AD", category: "Extremo", brand: "Chevrolet", model: "CAPTIVA", stock: 10, minStock: 10, price: 15337.17, status: "active", createdAt: "2026-03-01" },
    { id: "437", name: "ROT. INF.ONIX-TRACKER-NONTANA  2020", category: "Rotula Inferior", brand: "Chevrolet", model: "ONIX", stock: 15, minStock: 10, price: 18300.0, status: "active", createdAt: "2026-03-01" },
    { id: "300", name: "BRAZO ROTULA SUPER EUROPA", category: "Brazo", brand: "Fiat", model: "", stock: 58, minStock: 10, price: 33181.03, status: "active", createdAt: "2026-03-01" },
    { id: "301", name: "EXTREMO UNO-DUNA 12x1,5 L160mm", category: "Extremo", brand: "Fiat", model: "UNO", stock: 79, minStock: 10, price: 9984.21, status: "active", createdAt: "2026-03-01" },
    { id: "302", name: "EXTREMO UNO-DUNA94¯14X1,5L140m", category: "Extremo", brand: "Fiat", model: "UNO", stock: 77, minStock: 10, price: 9984.17, status: "active", createdAt: "2026-03-01" },
    { id: "303", name: "BRAZO ROTULA 147 í10mm", category: "Brazo", brand: "Fiat", model: "147", stock: 71, minStock: 10, price: 24633.95, status: "active", createdAt: "2026-03-01" },
    { id: "304", name: "BRAZO ROTULA DUNA-UNO", category: "Brazo", brand: "Fiat", model: "UNO", stock: 45, minStock: 10, price: 24633.95, status: "active", createdAt: "2026-03-01" },
    { id: "305", name: "BRAZO ROT. REGATTA-128 í10mm", category: "Brazo", brand: "Fiat", model: "REGATTA", stock: 38, minStock: 10, price: 24633.95, status: "active", createdAt: "2026-03-01" },
    { id: "306", name: "EXT.REGATTA L 115mm 12x1.50mm", category: "Extremo", brand: "Fiat", model: "REGATTA", stock: 31, minStock: 10, price: 9862.45, status: "active", createdAt: "2026-03-01" },
    { id: "307", name: "EXT.147 M12x1.5 H 92 L125mm", category: "Extremo", brand: "Fiat", model: "147", stock: 45, minStock: 10, price: 9862.45, status: "active", createdAt: "2026-03-01" },
    { id: "308", name: "EXT.147 M14x1.5 93AD L108mm", category: "Extremo", brand: "Fiat", model: "147", stock: 35, minStock: 10, price: 9862.45, status: "active", createdAt: "2026-03-01" },
    { id: "309", name: "REPARACION DE ROT.DUNA/UNO-147", category: "Kit", brand: "Fiat", model: "UNO", stock: 38, minStock: 10, price: 9910.52, status: "active", createdAt: "2026-03-01" },
    { id: "310", name: "EXT. SUP.EUROPA M12X1,5 L150m", category: "Extremo", brand: "Fiat", model: "", stock: 55, minStock: 10, price: 9862.45, status: "active", createdAt: "2026-03-01" },
    { id: "311", name: "EXT DER PALIO SIENA M14X1.5mm", category: "Extremo", brand: "Fiat", model: "PALIO", stock: 21, minStock: 10, price: 10836.52, status: "active", createdAt: "2026-03-01" },
    { id: "312", name: "EXT.IZQ.PALIO-SIENA M14x1,5mm", category: "Extremo", brand: "Fiat", model: "PALIO", stock: 43, minStock: 10, price: 10836.52, status: "active", createdAt: "2026-03-01" },
    { id: "313", name: "ROTULA FIAT IDEA", category: "Rotula", brand: "Fiat", model: "IDEA", stock: 63, minStock: 10, price: 12186.33, status: "active", createdAt: "2026-03-01" },
    { id: "314", name: "ROTULA PALIO-SIENA H94", category: "Rotula", brand: "Fiat", model: "PALIO", stock: 45, minStock: 10, price: 10471.24, status: "active", createdAt: "2026-03-01" },
    { id: "315", name: "ROTULA PALIO-SIENA 02AD.", category: "Rotula", brand: "Fiat", model: "PALIO", stock: 14, minStock: 10, price: 10836.52, status: "active", createdAt: "2026-03-01" },
    { id: "316", name: "EXTREMO DER.PALIO 14x2", category: "Extremo", brand: "Fiat", model: "PALIO", stock: 6, minStock: 10, price: 13150.74, status: "active", createdAt: "2026-03-01" },
    { id: "317", name: "EXTREMO IZQ.PALIO 14x2", category: "Extremo", brand: "Fiat", model: "PALIO", stock: 63, minStock: 10, price: 13149.93, status: "active", createdAt: "2026-03-01" },
    { id: "318", name: "EXT.BOXER-92/EXT.TENSOR-DUNA", category: "Extremo", brand: "Fiat", model: "DUNA", stock: 77, minStock: 10, price: 13880.97, status: "active", createdAt: "2026-03-01" },
    { id: "319", name: "EXT.BOXER-93/EXT.TENSOR DUNA", category: "Extremo", brand: "Fiat", model: "DUNA", stock: 17, minStock: 10, price: 13880.97, status: "active", createdAt: "2026-03-01" },
    { id: "320", name: "ROTULA FIAT PUNTO", category: "Rotula", brand: "Fiat", model: "PUNTO", stock: 14, minStock: 10, price: 13636.38, status: "active", createdAt: "2026-03-01" },
    { id: "321", name: "EXTREMO DERECHO FIAT PUNTO", category: "Extremo", brand: "Fiat", model: "PUNTO", stock: 73, minStock: 10, price: 11323.55, status: "active", createdAt: "2026-03-01" },
    { id: "322", name: "EXTREMO IZQUIERDO FIAT PUNTO", category: "Extremo", brand: "Fiat", model: "PUNTO", stock: 32, minStock: 10, price: 11323.55, status: "active", createdAt: "2026-03-01" },
    { id: "323", name: "ROTULA FIAT DER.ADVENTUR", category: "Rotula", brand: "Fiat", model: "", stock: 69, minStock: 10, price: 12186.33, status: "active", createdAt: "2026-03-01" },
    { id: "324", name: "ROTULA FIAT IZQ. ADVENTUR", category: "Rotula", brand: "Fiat", model: "", stock: 38, minStock: 10, price: 12186.33, status: "active", createdAt: "2026-03-01" },
    { id: "325", name: "EXTREMO DER. FIAT IDEA", category: "Extremo", brand: "Fiat", model: "IDEA", stock: 21, minStock: 10, price: 11656.35, status: "active", createdAt: "2026-03-01" },
    { id: "326", name: "EXTREMO IZQ. FIAT IDEA", category: "Extremo", brand: "Fiat", model: "IDEA", stock: 49, minStock: 10, price: 11656.35, status: "active", createdAt: "2026-03-01" },
    { id: "327", name: "ROTULA INF.FIAT DOBLO-2010->>", category: "Rotula Inferior", brand: "Fiat", model: "DOBLO", stock: 13, minStock: 10, price: 15637.37, status: "active", createdAt: "2026-03-01" },
    { id: "328", name: "EXT.FIAT DER.ARGO-CRONOS", category: "Extremo", brand: "Fiat", model: "ARGO", stock: 36, minStock: 10, price: 13300.07, status: "active", createdAt: "2026-03-01" },
    { id: "329", name: "EXT.FIAT IZQ. ARGO-CRONOS", category: "Extremo", brand: "Fiat", model: "ARGO", stock: 52, minStock: 10, price: 13300.07, status: "active", createdAt: "2026-03-01" },
    { id: "330", name: "ROTULA INFERIOR FIAT TORO", category: "Rotula Inferior", brand: "Fiat", model: "TORO", stock: 41, minStock: 10, price: 16659.24, status: "active", createdAt: "2026-03-01" },
    { id: "331", name: "ROTULA FIAT DER.ARGO-CRONOS", category: "Rotula", brand: "Fiat", model: "ARGO", stock: 25, minStock: 10, price: 14620.23, status: "active", createdAt: "2026-03-01" },
    { id: "332", name: "ROT.FIAT IZQ. ARGO-CRONOS", category: "Rotula", brand: "Fiat", model: "ARGO", stock: 61, minStock: 10, price: 14620.23, status: "active", createdAt: "2026-03-01" },
    { id: "333", name: "EXT.FIAT TORO ROSC.16X1,50", category: "Extremo", brand: "Fiat", model: "TORO", stock: 74, minStock: 10, price: 10471.24, status: "active", createdAt: "2026-03-01" },
    { id: "334", name: "EXT.FIAT TORO ROSC.16X1,50", category: "Extremo", brand: "Fiat", model: "TORO", stock: 43, minStock: 10, price: 14186.34, status: "active", createdAt: "2026-03-01" },
    { id: "335", name: "EXT.  FIAT TORO ROSC.14X1,50", category: "Extremo", brand: "Fiat", model: "TORO", stock: 72, minStock: 10, price: 14186.34, status: "active", createdAt: "2026-03-01" },
    { id: "336", name: "EXT.FIAT TORO ROSC. 14X150", category: "Extremo", brand: "Fiat", model: "TORO", stock: 6, minStock: 10, price: 14186.34, status: "active", createdAt: "2026-03-01" },
    { id: "314G", name: "ROTULA PALIO-SIENA 00/01", category: "Rotula", brand: "Fiat", model: "PALIO", stock: 75, minStock: 10, price: 10471.24, status: "active", createdAt: "2026-03-01" }
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
