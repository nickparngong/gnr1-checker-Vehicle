var SPREADSHEET_ID = "1XV_ETbWJFCrAPuYv59KVzq7vGbMVDBAWBweTf2QjGGE";

function doGet(e) {

  var plate = "";

  if (e && e.parameter && e.parameter.plate) {
    plate = e.parameter.plate;
  }

  try {

    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheets = ss.getSheets();

    var searchPlate = normalizePlate(plate);

    if (searchPlate === "") {
      return jsonResponse({
        found: false,
        error: "กรุณาระบุทะเบียนรถ"
      });
    }

    // ค้นหาจากทุก Sheet
    for (var s = 0; s < sheets.length; s++) {

      var sheet = sheets[s];
      var data = sheet.getDataRange().getDisplayValues();

      if (data.length < 2) {
        continue;
      }

      var headers = data[0];

      // หาคอลัมน์ทะเบียนรถ
      var plateColumn = -1;

      for (var h = 0; h < headers.length; h++) {

        var header = String(headers[h]).trim();

        if (
          header === "ทะเบียนรถ" ||
          header.indexOf("ทะเบียน") !== -1
        ) {
          plateColumn = h;
          break;
        }
      }

      // ถ้าไม่พบคอลัมน์ทะเบียน ให้ข้าม Sheet นี้
      if (plateColumn === -1) {
        continue;
      }

      // ค้นหาทะเบียน
      for (var r = 1; r < data.length; r++) {

        var currentPlate = normalizePlate(
          data[r][plateColumn]
        );

        if (currentPlate === searchPlate) {

          var vehicle = {
            found: true,
            sheet: sheet.getName()
          };

          // ส่งข้อมูลทุกคอลัมน์กลับไป
          for (var c = 0; c < headers.length; c++) {

            var key = String(headers[c]).trim();

            if (key !== "") {
              vehicle[key] = data[r][c];
            }
          }

          // รองรับโครงสร้างเดิม
          // J = เบอร์โทรประกัน
          if (
            !vehicle["เบอร์โทรประกัน"] &&
            data[r].length > 9 &&
            data[r][9]
          ) {
            vehicle["เบอร์โทรประกัน"] = data[r][9];
          }

          // K = ลิงก์แจ้งซ่อม
          if (
            !vehicle["ลิงก์แจ้งซ่อม"] &&
            data[r].length > 10 &&
            data[r][10]
          ) {
            vehicle["ลิงก์แจ้งซ่อม"] = data[r][10];
          }

          return jsonResponse(vehicle);
        }
      }
    }

    return jsonResponse({
      found: false,
      searched: plate,
      error: "ไม่พบทะเบียนนี้ในทุก Sheet"
    });

  } catch (error) {

    return jsonResponse({
      found: false,
      error: String(error)
    });

  }
}


/**
 * ทำให้รูปแบบทะเบียนเหมือนกันก่อนเปรียบเทียบ
 */
function normalizePlate(value) {

  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .replace(/\s+/g, "")
    .replace(/-/g, "")
    .trim()
    .toUpperCase();

}


/**
 * ส่ง JSON กลับไปยังหน้าเว็บ
 */
function jsonResponse(data) {

  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);

}
