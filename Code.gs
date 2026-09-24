var SPREADSHEET_ID = "1XV_ETbWJFCrAPuYv59KVzq7vGbMVDBAWBweTf2QjGGE";
var SHEET_NAME = "Vehicle_Master_Template";
var VERSION = "V4.2-VERIFIED";

function doGet(e) {
  var plate = "";
  var debug = false;

  if (e && e.parameter) {
    plate = e.parameter.plate || "";
    debug = e.parameter.debug === "1";
  }

  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      sheet = ss.getSheets()[0];
    }

    var data = sheet.getDataRange().getDisplayValues();

    if (data.length < 2) {
      return jsonResponse({
        found: false,
        version: VERSION,
        error: "Sheet ไม่มีข้อมูลอย่างน้อย 2 แถว",
        sheet: sheet.getName()
      });
    }

    var headers = data[0];
    var searchPlate = normalizePlate(plate);

    if (debug) {
      return jsonResponse({
        found: false,
        debug: true,
        version: VERSION,
        sheet: sheet.getName(),
        rows: data.length,
        headers: headers,
        samplePlates: data.slice(1, Math.min(data.length, 11)).map(function(row) {
          return row[0];
        })
      });
    }

    if (searchPlate === "") {
      return jsonResponse({
        found: false,
        version: VERSION,
        error: "กรุณาระบุทะเบียนรถ"
      });
    }

    // จาก Sheet จริง: คอลัมน์ A คือ ทะเบียนรถ
    // ใช้ตำแหน่งคอลัมน์โดยตรง เพื่อไม่ให้ชื่อหัวตาราง/ช่องว่างมีผลต่อการค้นหา
    var plateColumn = 0;

    for (var r = 1; r < data.length; r++) {
      var currentPlate = normalizePlate(data[r][plateColumn]);

      if (currentPlate === searchPlate) {
        var vehicle = {
          found: true,
          version: VERSION,
          sheet: sheet.getName()
        };

        // ส่งทุกคอลัมน์ตามหัวตารางจริง
        for (var c = 0; c < headers.length; c++) {
          var key = cleanHeader(headers[c]);

          if (key !== "") {
            vehicle[key] = data[r][c];
          }
        }

        // ยืนยันตำแหน่งตาม Sheet ที่ผู้ใช้ให้มา
        // I = บริษัทประกันภัย
        // J = เบอร์โทรประกัน
        // K = Linkแจ้งซ่อม
        if (data[r].length > 8 && !vehicle["บริษัทประกันภัย"]) {
          vehicle["บริษัทประกันภัย"] = data[r][8];
        }

        if (data[r].length > 9) {
          vehicle["เบอร์โทรประกัน"] = data[r][9];
        }

        if (data[r].length > 10) {
          vehicle["ลิงก์แจ้งซ่อม"] = data[r][10];
          vehicle["Linkแจ้งซ่อม"] = data[r][10];
        }

        return jsonResponse(vehicle);
      }
    }

    return jsonResponse({
      found: false,
      version: VERSION,
      searched: plate,
      normalized: searchPlate,
      sheet: sheet.getName(),
      error: "ไม่พบทะเบียนนี้ใน Sheet"
    });

  } catch (err) {
    return jsonResponse({
      found: false,
      version: VERSION,
      error: String(err && err.message ? err.message : err)
    });
  }
}

function testVehicle() {
  var result = findVehicleForTest("3ฒก 4281");
  Logger.log(JSON.stringify(result, null, 2));
  return result;
}

function findVehicleForTest(plate) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
  var data = sheet.getDataRange().getDisplayValues();
  var headers = data[0];
  var target = normalizePlate(plate);

  for (var r = 1; r < data.length; r++) {
    if (normalizePlate(data[r][0]) === target) {
      return {
        PASS: true,
        version: VERSION,
        sheet: sheet.getName(),
        plate: data[r][0],
        vendor: data[r][2],
        insurance: data[r][8],
        insurancePhone: data[r][9],
        repairLink: data[r][10]
      };
    }
  }

  return {
    PASS: false,
    version: VERSION,
    sheet: sheet.getName(),
    searched: plate
  };
}

function cleanHeader(value) {
  return String(value || "")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .trim();
}

function normalizePlate(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .normalize("NFKC")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/[\s\u00A0\-]/g, "")
    .trim()
    .toUpperCase();
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
