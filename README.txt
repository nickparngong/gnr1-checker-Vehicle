VEHICLE CHECK V3.1 FINAL
========================
- Vendor ใหญ่และเด่นชัด
- ปุ่มโทรบริษัทประกันภัยสีฟ้า
- ปุ่ม “แจ้งเช็คระยะและรายการอื่นๆ” สีเขียว
- ปุ่มแจ้งงานอ่าน Link จากคอลัมน์ K “ลิงก์แจ้งซ่อม” ของรถแต่ละคัน
- แก้ปัญหา /undefined โดยใช้ repairLink จาก Backend โดยตรง
- เปลี่ยน Service Worker cache เป็น V3.1 เพื่อไม่ให้หน้าเก่าค้าง
- Backend อ่าน Spreadsheet ID โดยตรง
- หากไม่มี Link ใน K จะไม่แสดงปุ่มแจ้งงาน

GitHub: อัปโหลดทั้งชุดได้ หากต้องการอัปเดตให้สมบูรณ์
Google Apps Script: ต้อง Deploy Code.gs เป็น New version หลังเปลี่ยน Backend
