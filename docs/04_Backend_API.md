# Backend API (Apps Script)

Endpoint
- ใช้ URL จากการ Deploy Web App ของ Apps Script

รูปแบบ request
- Method: `POST`
- Body JSON:
```json
{
  "action": "auth.login",
  "payload": { "email": "...", "password": "..." }
}
```

รูปแบบ response
```json
{ "success": true, "data": {...}, "message": "OK" }
```
หรือ
```json
{ "success": false, "error": { "code": "...", "message": "..." } }
```

Action สำคัญ
- `auth.login`, `auth.register`, `auth.me`, `auth.logout`
- `users.list/get/create/update/delete` (admin)
- `news.list/get` (public), `news.*` (admin)
- `knowledge.list/get` (public), `knowledge.*` (admin)
- `quiz.questions.list` (public), `quiz.submit`, `quiz.results.my`
- `admin.stats`
- `notifications.*` (admin)
- `settings.get`, `settings.set` (admin)

### fp.cycles.update
อัปเดตรอบเดือน (แก้ไขข้อมูลเดิม)

Payload:
- `token` (string)
- `cycleId` (string)
- `patch` (object) ฟิลด์ที่ต้องการแก้ไข (เช่น `periodStartDate`, `periodEndDate`, `cycleLengthDays`, `notes`)

Response:
- `{ items }` รายการรอบเดือนล่าสุดของผู้ใช้ (หรือผลสำเร็จ)

### fp.cycles.delete
ลบรอบเดือน (และลบ prediction ที่ผูกกับ cycle นั้นแบบ best-effort)

Payload:
- `token` (string)
- `cycleId` (string)
