(Installation Guide)

1. ดาวน์โหลดโปรเจกต์จาก GitHub

วิธีที่ 1: ดาวน์โหลดแบบไฟล์ ZIP
1. ไปที่หน้า Repository ของโปรเจกต์ตามลิงก์ด้านล่าง:
   [https://github.com/maxTH987/pos-mini-project](https://github.com/maxTH987/pos-mini-project)
2. กดปุ่มสีเขียว Code แล้วเลือก Download ZIP
3. เมื่อดาวน์โหลดเสร็จแล้ว ให้แตกไฟล์ ZIP

วิธีที่ 2: ดาวน์โหลดผ่าน Git Command
เปิด Terminal หรือ Command Prompt แล้วใช้คำสั่ง:
git clone [https://github.com/maxTH987/pos-mini-project.git](https://github.com/maxTH987/pos-mini-project.git)

2.สร้างไฟล์ชื่อ .env แล้วเพิ่มโค้ดชุดนี้เพื่อเชื่อมต่อกับฐานข้อมูล

  PORT=3000
  MONGODB_URI=mongodb://localhost:27017/pos_db

3.การเข้าใช้งานและล็อกอิน
  ลิงค์ที่ใช้ในการเทส Run http://localhost:3000 
  จะขึ้นหน้าล็อกอินให้ใส่ Username: admin  ,  Password: 1234 เพื่อที่เริ่มใช้งาน
  หรือนำเอา Database ที่แนบไว้เพื่อเทสใช้งาน

