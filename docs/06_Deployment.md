# Deployment Guide

## 1) เตรียม Google Sheets
1. สร้าง Google Sheets ใหม่ (ว่าง ๆ)
2. คัดลอก Spreadsheet ID (ส่วนที่อยู่ระหว่าง `/d/` และ `/edit`)

## 2) ติดตั้ง Backend (Google Apps Script)
1. เข้า https://script.google.com → New project
2. อัปโหลดไฟล์จากโฟลเดอร์ `starter/backend/` ทั้งหมด
3. ไปที่ **Project Settings → Script properties**
   - เพิ่มค่า `SPREADSHEET_ID` = Spreadsheet ID ที่ได้จากข้อ 1
4. Run ฟังก์ชัน `bootstrapFEMI()` ครั้งแรก เพื่อสร้างชีตและ seed ข้อมูล
5. Deploy → **New deployment → Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
   - คัดลอก URL (Web app URL) เก็บไว้เป็น API URL

> หมายเหตุ: หากคุณโฮสต์ Frontend คนละโดเมน อาจเจอปัญหา CORS (เบราว์เซอร์บล็อก)
> วิธีแก้แนะนำคือใช้ Cloudflare Worker Proxy (ฟรี)

## 3) Cloudflare Worker Proxy (แนะนำ เพื่อแก้ CORS)
สร้าง Worker ใหม่ แล้วใส่โค้ดนี้:

```js
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    }

    const target = env.APPS_SCRIPT_URL; // ตั้งเป็น Web App URL
    const body = request.method === "POST" ? await request.text() : null;

    const res = await fetch(target, {
      method: request.method,
      headers: { "Content-Type": "application/json" },
      body,
    });

    const headers = new Headers(res.headers);
    headers.set("Access-Control-Allow-Origin", "*");
    return new Response(await res.text(), { status: res.status, headers });
  },
};
```

ใน Worker → **Settings → Variables**
- `APPS_SCRIPT_URL` = Web App URL

จากนั้นใช้ Worker URL เป็น `API_URL` ฝั่ง Frontend

## 4) ติดตั้ง Frontend (Static)
1. นำโฟลเดอร์ `starter/frontend/` ไปโฮสต์บน Cloudflare Pages (หรือ GitHub Pages)
2. ตั้งค่า API URL:
   - เปิดไฟล์ `starter/frontend/assets/config.js`
   - แก้ `CONFIG.API_URL` เป็น Worker URL (หรือ Web App URL หากไม่ใช้ Worker)

ตัวอย่าง:
```js
window.CONFIG = { API_URL: "https://<your-worker>.workers.dev" };
```

## 5) ทดสอบ
- เปิด `/login.html` → ล็อกอินด้วยแอดมินเริ่มต้น
- ไป `/admin/index.html` ดูสถิติ/เพิ่มข่าว/เพิ่มควิซ
- ไป `/app/dashboard.html` ฝั่งผู้ใช้
