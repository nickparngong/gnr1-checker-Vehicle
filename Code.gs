// Vehicle Check V2 - Google Apps Script
// อ่านข้อมูลจาก Google Sheet โดยตรงด้วย Spreadsheet ID
const SPREADSHEET_ID = "1XV_ETbWJFCrAPuYv59KVzq7vGbMVDBAWBweTf2QjGGE";
const SHEET_NAME = "Vehicle_Master";

function doGet(e) {
  try {
    const plate = (e && e.parameter && e.parameter.plate) ? e.parameter.plate : "";
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
  const plateColumn = headers.indexOf("ทะเบียนรถ");
  if (plateColumn < 0) return {found:false, error:"ไม่พบคอลัมน์ ทะเบียนรถ"};

  const target = normalize_(plate);
  if (!target) return {found:false, error:"ไม่ได้ระบุทะเบียนรถ"};

  for (let i = 1; i < data.length; i++) {
    if (normalize_(data[i][plateColumn]) === target) {
      const vehicle = {};
      headers.forEach((h,j) => vehicle[h] = data[i][j]);
      vehicle.found = true;
      return vehicle;
    }
  }
  return {found:false, searched:plate};
}

function normalize_(value) {
  return String(value || "")
    .replace(/\s/g,"")
    .replace(/-/g,"")
    .trim()
    .toUpperCase();
}

function jsonResponse_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
