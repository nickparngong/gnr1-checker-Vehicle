# Vehicle Check V4.2 VERIFIED

จุดสำคัญที่แก้:
- ใช้ Sheet จริงชื่อ Vehicle_Master_Template
- ใช้คอลัมน์ A เป็นทะเบียนรถโดยตรง
- ใช้ I = บริษัทประกันภัย, J = เบอร์โทรประกัน, K = Linkแจ้งซ่อม
- normalize ทะเบียนด้วย NFKC + ลบช่องว่าง/ขีด/zero-width
- มี testVehicle() สำหรับตรวจข้อมูลจริงจาก Apps Script
- มี debug endpoint: ?debug=1 เพื่อดูชื่อ Sheet, headers และทะเบียนตัวอย่าง
- หน้าเว็บแสดงปุ่มโทรประกันและแจ้งซ่อมทุกครั้งที่พบรถ
- หน้าแรกใช้ตัวอย่างทะเบียนที่มีอยู่จริง: 3ฒก 4281

ขั้นตอน:
1) แทน Code.gs ทั้งไฟล์
2) Save
3) Deploy > Manage deployments > Edit > New version > Deploy
4) แทน index.html ใน GitHub Pages ด้วยไฟล์นี้
5) เปิดเว็บแบบ hard refresh (Ctrl+F5)
6) ค้นหา 3ฒก 4281

ทดสอบ Backend ก่อนใช้งาน:
- ใน Apps Script เลือกฟังก์ชัน testVehicle แล้วกด Run
- ผลที่ถูกต้องต้องมี PASS: true, plate: 3ฒก 4281, vendor: Southeast,
  insurancePhone: 02-636-5656 และ repairLink เป็นลิงก์จากคอลัมน์ K
