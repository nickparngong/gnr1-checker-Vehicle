VEHICLE CHECK V2 – MOBILE / PWA
=================================

ไฟล์ชุดนี้เป็นเวอร์ชัน Mobile/PWA สำหรับระบบ Vehicle Check GNR1

สิ่งที่เพิ่มใน V2
- Responsive สำหรับมือถือ
- PWA ติดตั้งเป็นไอคอนบนหน้าจอมือถือ
- ปุ่มโทรประกันภัย
- ปุ่มโทร GNR1 3282 / 3283 / 3286
- ค้นหาทะเบียนแบบมี/ไม่มีเว้นวรรค
- แสดงข้อความ error จาก Backend ชัดเจน
- Code.gs อ่าน Google Sheet ด้วย Spreadsheet ID โดยตรง
  ลดปัญหา Script ไม่ได้ผูกกับ Spreadsheet ที่ถูกต้อง
- Service Worker สำหรับโหลดหน้าเว็บได้เร็วขึ้นและรองรับ PWA

Google Sheet
https://docs.google.com/spreadsheets/d/1XV_ETbWJFCrAPuYv59KVzq7vGbMVDBAWBweTf2QjGGE/edit

Web App API
https://script.google.com/macros/s/AKfycbxvGqGlvJ7vkq7r-trUFCGVTJx5BxrhuaSoEX-odnUvrtO6W7JkUFq3x75K0fW8nA6w/exec

ขั้นตอน Backend
1. Google Sheets > Extensions > Apps Script
2. เปิด Code.gs
3. ลบโค้ดเดิมทั้งหมด แล้ววาง Code.gs จากชุด V2
4. Save
5. Deploy > Manage deployments
6. Edit Web app
7. New version
8. Execute as: Me
9. Who has access: Anyone with the link
10. Deploy

ขั้นตอนนำเว็บขึ้น GitHub Pages
1. สร้าง Repository เช่น Vehicle-Check
2. Upload ทุกไฟล์ใน ZIP โดยให้ index.html อยู่ที่ root
3. Settings > Pages
4. Source: Deploy from a branch
5. Branch: main / root
6. เปิด URL GitHub Pages ที่ระบบสร้างให้

การติดตั้งบนมือถือ Android
- เปิด URL ด้วย Chrome
- กดปุ่ม "＋ ติดตั้ง" ถ้ามี
- หรือ Chrome > ⋮ > ติดตั้งแอป / เพิ่มลงในหน้าจอหลัก

การติดตั้งบน iPhone
- เปิด URL ด้วย Safari
- กด Share
- เลือก "เพิ่มไปยังหน้าจอโฮม"
- กดเพิ่ม

หมายเหตุด้านความปลอดภัย
- ผู้ใช้งานไม่จำเป็นต้องเปิด Google Sheets
- ข้อมูลที่หน้าเว็บแสดงขึ้นอยู่กับข้อมูลใน Google Sheets
- ควรใช้บัญชี/โดเมนของบริษัทและกำหนดสิทธิ์ Web App ให้เหมาะสมก่อนใช้งานจริง
