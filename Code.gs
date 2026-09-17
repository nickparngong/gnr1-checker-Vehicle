// Vehicle Check V3.1 - FINAL
const SPREADSHEET_ID = "1XV_ETbWJFCrAPuYv59KVzq7vGbMVDBAWBweTf2QjGGE";
const SHEET_NAME = "Vehicle_Master";

function doGet(e) {
  try {
    const plate = e && e.parameter && e.parameter.plate ? e.parameter.plate : "";
    return jsonResponse_(findVehicle_(plate));
  } catch (err) {
    return jsonResponse_({found:false, error:"เกิดข้อผิดพลาด: " + err.message});
  }
}

function findVehicle_(plate) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.getSheets()[0];
  if (!sh) return {found:false, error:"ไม่พบ Sheet"};

  const data = sh.getDataRange().getDisplayValues();
  if (data.length < 2) return {found:false, error:"ไม่พบข้อมูลใน Sheet"};

  const headers = data[0].map(h => String(h).trim());
  const plateColumn = headers.findIndex(h => normalizeHeader_(h) === normalizeHeader_("ทะเบียนรถ"));
  if (plateColumn < 0) return {found:false, error:"ไม่พบคอลัมน์ ทะเบียนรถ"};

  let repairColumn = headers.findIndex(h => normalizeHeader_(h) === normalizeHeader_("ลิงก์แจ้งซ่อม"));
  if (repairColumn < 0 && data[0].length >= 11) repairColumn = 10;

  const target = normalizePlate_(plate);
  if (!target) return {found:false, error:"ไม่ได้ระบุทะเบียนรถ"};

  for (let i=1;i<data.length;i++) {
    if (normalizePlate_(data[i][plateColumn]) === target) {
      const vehicle = {};
      headers.forEach((h,j) => vehicle[h] = data[i][j]);
      vehicle.repairLink = repairColumn >= 0 ? String(data[i][repairColumn] || "").trim() : "";
      vehicle.found = true;
      return vehicle;
    }
  }
  return {found:false, searched:plate};
}

function normalizePlate_(v) {
  return String(v || "").replace(/\s/g,"").replace(/-/g,"").trim().toUpperCase();
}
function normalizeHeader_(v) {
  return String(v || "").replace(/\s/g,"").trim().toLowerCase();
}
function jsonResponse_(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
