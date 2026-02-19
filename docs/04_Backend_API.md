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
