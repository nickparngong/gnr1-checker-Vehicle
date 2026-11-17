/**
 * Vehicle Check GNR1 - Backend (Google Apps Script)
 * อ่านข้อมูลจาก Google Sheets จริงทุกครั้งที่เรียก (ไม่เก็บ Cache ข้อมูล)
 */
var SPREADSHEET_ID = '1XV_ETbWJFCrAPuYv59KVzq7vGbMVDBAWBweTf2QjGGE';
var PLATE_FIELD = 'ทะเบียนรถ';
var LINK_FIELD = 'Linkแจ้งซ่อม';
var FIELDS = ['ทะเบียนรถ', 'รุ่นรถ', 'Vendor', 'สังกัด', 'ฝ่าย(ตัวย่อ)', 'แผนก',
  'ID Branch', 'Branch Name', 'บริษัทประกันภัย', 'เบอร์โทรประกัน', LINK_FIELD];
var HEADER_SCAN_ROWS = 20;

/** ตัดช่องว่าง ขีด จุด อักขระแฝง และทำเป็นรูปแบบเดียวกันก่อนเปรียบเทียบ */
function normalizePlate(plate) {
  if (plate === null || plate === undefined) return '';
  var s = String(plate);
  if (s.normalize) s = s.normalize('NFC');
  return s.replace(/[\u200B-\u200D\u2060\uFEFF\u00A0\u202F]/g, '')
          .replace(/[\s\-_.]/g, '').toUpperCase();
}

function cell_(v) {
  return (v === null || v === undefined) ? '' : String(v).replace(/[\u200B-\u200D\u2060\uFEFF]/g, '').trim();
}

/** หาแถว Header และ map ชื่อฟิลด์ -> index คอลัมน์ (อ่านจาก Header จริง) */
function mapHeader_(values) {
  var plateKey = normalizePlate(PLATE_FIELD);
  var limit = Math.min(values.length, HEADER_SCAN_ROWS);
  for (var r = 0; r < limit; r++) {
    var keys = values[r].map(normalizePlate);
    if (keys.indexOf(plateKey) === -1) continue;
    var map = {};
    FIELDS.forEach(function (f) {
      var i = keys.indexOf(normalizePlate(f));
      if (i === -1 && f === LINK_FIELD) { // Header เขียนต่างเล็กน้อย เช่น "ลิงก์แจ้งซ่อม"
        var part = normalizePlate('แจ้งซ่อม');
        for (var c = 0; c < keys.length; c++) { if (keys[c].indexOf(part) !== -1) { i = c; break; } }
      }
      map[f] = i;
    });
    return { row: r, map: map };
  }
  return null;
}

/** อ่านข้อมูลรถทุก Sheet ที่มี Header "ทะเบียนรถ" */
function getVehicleData() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var rows = [], sheetsUsed = [];
  ss.getSheets().forEach(function (sh) {
    if (sh.getLastRow() < 1 || sh.getLastColumn() < 1) return;
    var values = sh.getDataRange().getDisplayValues();
    var h = mapHeader_(values);
    if (!h) return;
    sheetsUsed.push(sh.getName());
    for (var r = h.row + 1; r < values.length; r++) {
      var plate = cell_(values[r][h.map[PLATE_FIELD]]);
      if (!plate) continue;
      var obj = {};
      FIELDS.forEach(function (f) { obj[f] = h.map[f] === -1 ? '' : cell_(values[r][h.map[f]]); });
      obj._sheet = sh.getName();
      rows.push(obj);
    }
  });
  return { rows: rows, sheets: sheetsUsed };
}

/** คืน object รถ หรือ null ถ้าไม่พบ */
function findVehicle(plate) {
  var key = normalizePlate(plate);
  if (!key) return null;
  var data = getVehicleData();
  for (var i = 0; i < data.rows.length; i++) {
    if (normalizePlate(data.rows[i][PLATE_FIELD]) === key) {
      var out = { found: true };
      FIELDS.forEach(function (f) { out[f] = data.rows[i][f]; });
      return out;
    }
  }
  return null;
}


function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  try {
    var p = (e && e.parameter) || {};
    if (p.ping) return json_({ ok: true, time: new Date().toISOString() });
    var plate = p.plate;
    if (!normalizePlate(plate)) return json_({ found: false, error: 'กรุณากรอกทะเบียนรถ' });
    var v = findVehicle(plate);
    return json_(v || { found: false, error: 'ไม่พบข้อมูลรถ' });
  } catch (err) {
    // ข้อผิดพลาดของระบบ ต้องไม่ถูกรายงานเป็น found:true และไม่ใช่ "ไม่พบข้อมูล"
    console.error(err);
    return json_({ found: false, systemError: true, error: 'ระบบขัดข้อง ไม่สามารถอ่านฐานข้อมูลได้' });
  }
}

/** ทดสอบการเชื่อมต่อ Spreadsheet และการ map Header (ดูผลที่ Execution log) */
function testSystem() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  Logger.log('Spreadsheet: ' + ss.getName());
  var found = 0;
  ss.getSheets().forEach(function (sh) {
    var h = sh.getLastRow() ? mapHeader_(sh.getDataRange().getDisplayValues()) : null;
    if (!h) { Logger.log('ข้าม Sheet "' + sh.getName() + '" (ไม่พบ Header ทะเบียนรถ)'); return; }
    found++;
    Logger.log('Sheet "' + sh.getName() + '" Header แถวที่ ' + (h.row + 1));
    FIELDS.forEach(function (f) {
      Logger.log('  ' + f + ' -> ' + (h.map[f] === -1 ? '*** ไม่พบคอลัมน์ ***' : 'คอลัมน์ ' + (h.map[f] + 1)));
    });
  });
  var d = getVehicleData();
  Logger.log('Sheet ที่ใช้ได้: ' + found + ' | จำนวนรถทั้งหมด: ' + d.rows.length);
  return found > 0 && d.rows.length > 0 ? 'PASS' : 'FAIL';
}

/** ทดสอบค้นหาทะเบียนตัวอย่าง 3ฒก 4281 (มี/ไม่มีช่องว่าง/ไม่มีจริง) */
function testVehicle() {
  ['3ฒก 4281', '3ฒก4281', ' 3ฒก  4281 ', '0ZZ 0000'].forEach(function (t) {
    var v = findVehicle(t);
    Logger.log('"' + t + '" -> ' + (v ? 'พบ | ประกัน=' + v['บริษัทประกันภัย'] + ' | โทร=' + v['เบอร์โทรประกัน'] + ' | Link=' + v[LINK_FIELD] : 'ไม่พบ'));
  });
}
