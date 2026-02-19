# FEMI (Final Package)

แพ็กเกจนี้คือชุดเริ่มต้นสำหรับสร้างเว็บแอป **FEMI – Intelligent Health Platform for Women** แบบใช้งานได้จริงด้วย:
- **Frontend:** Static Web (Cloudflare Pages หรือโฮสติ้งแบบ Static อื่น ๆ)
- **Backend:** Google Apps Script Web App
- **Database:** Google Sheets

---

## 1) โครงสร้างในแพ็กเกจ

- `docs/` เอกสารสรุประบบ (อ่านเพื่อเริ่มต้นได้ทันที)
- `starter/frontend/` โค้ดหน้าเว็บ (Static)
- `starter/backend/` โค้ด Google Apps Script (API)
- `starter/sheets/` เทมเพลตหัวตาราง CSV สำหรับสร้างชีทฐานข้อมูล
- `starter/cloudflare/` ตัวอย่าง Proxy API สำหรับ Cloudflare Pages Functions (แนะนำ)

---

## 2) Quick Start (เริ่มต้นแบบเร็ว)

### 2.1 เตรียม Google Sheets
1. สร้าง Google Spreadsheet ใหม่ 1 ไฟล์
2. ตั้งชื่อไฟล์ เช่น `FEMI-DB`
3. (ทางเลือก A) สร้างชีทตามเทมเพลต CSV ใน `starter/sheets/`
4. (ทางเลือก B) ให้ระบบสร้างชีทให้อัตโนมัติด้วย `bootstrapFEMI()` (แนะนำ)

### 2.2 ติดตั้ง Backend (Google Apps Script)
1. เข้า **Extensions → Apps Script**
2. สร้างไฟล์และคัดลอกโค้ดจากโฟลเดอร์ `starter/backend/` ไปวางให้ครบ
3. ไปที่ **Project Settings → Script Properties** แล้วเพิ่มค่า:
   - `SPREADSHEET_ID` = ไอดีของ Google Sheets (ตัวอักษร/ตัวเลขหลัง `/d/` ใน URL)
   - `APP_NAME` = `FEMI` (หรือชื่อที่ต้องการ)
4. รันฟังก์ชัน `bootstrapFEMI()` 1 ครั้ง (อนุญาตสิทธิ์ให้เรียบร้อย)
5. Deploy เป็น Web App:
   - **Deploy → New deployment → Web app**
   - Execute as: **Me**
   - Who has access: **Anyone** (ถ้าใช้ Proxy แนะนำให้ยังเป็น Anyone แล้วคุมด้วย token/role)

> หลัง Deploy จะได้ URL ของ Web App (นำไปใส่ใน Proxy)

### 2.3 ติดตั้ง Proxy (Cloudflare Pages Functions) — แนะนำ
เพื่อให้ Frontend เรียก API ได้เสถียรและไม่ติดปัญหา CORS แนะนำให้ใช้ Proxy (อยู่ใน `starter/cloudflare/`)

1. นำโฟลเดอร์ `starter/frontend/` ไปเป็นโปรเจกต์ Cloudflare Pages
2. คัดลอก `starter/cloudflare/functions/api.js` ไปไว้ที่ `functions/api.js` ในโปรเจกต์
3. ตั้งค่า Environment Variable ใน Cloudflare Pages:
   - `GAS_WEBAPP_URL` = URL ของ Google Apps Script Web App
4. Frontend จะเรียก API ที่ `/api` อัตโนมัติ (ไม่ต้องแก้โค้ด)

### 2.4 รัน Frontend
- ถ้าใช้ Local: เปิดด้วย Live Server (แนะนำ) เพื่อหลีกเลี่ยงปัญหา module/paths
- ถ้า Deploy: อัปขึ้น Cloudflare Pages ได้เลย

---

## 3) บัญชีแอดมินเริ่มต้น (หลังรัน bootstrap)
- Email: `admin@femi.local`
- Password: `Admin@12345`

> เปลี่ยนรหัสผ่านทันทีหลังเริ่มใช้งานจริง

---

## 4) เอกสารระบบ
อ่านตามลำดับนี้:
1. `docs/01_Project_Overview.md`
2. `docs/02_UI_Design_System.md`
3. `docs/03_Sheets_Schema.md`
4. `docs/04_Backend_API.md`
5. `docs/06_Deployment.md`
