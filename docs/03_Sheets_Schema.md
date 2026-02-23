# Google Sheets Schema

ระบบใช้ชีตตามชื่อต่อไปนี้ (สร้างอัตโนมัติด้วย `bootstrapFEMI()`)

- users
- sessions
- news
- knowledge_base
- quiz_questions
- quiz_choices
- quiz_results
- notifications
- notification_logs
- system_config
- activity_logs
- health_records
- pregnancy

หัวคอลัมน์จะถูกกำหนดตามไฟล์ `starter/backend/Config.gs`

## Family Planning

ระบบ Family Planning ใช้ 3 ชีตหลักดังนี้ (ชื่อชีตต้องตรงตามนี้)

### period_cycles
**Primary key:** `cycleId`  
**Index:** `userId`, `periodStartDate`

คอลัมน์:
- `cycleId` (string) รหัสรอบเดือน
- `userId` (string) เจ้าของข้อมูล
- `periodStartDate` (YYYY-MM-DD) วันที่เริ่มมีประจำเดือน
- `periodEndDate` (YYYY-MM-DD|blank) วันที่สิ้นสุด (ถ้ายังไม่จบให้ว่าง)
- `cycleLengthDays` (number|blank) ความยาวรอบเดือน (ถ้ามี)
- `periodLengthDays` (number|blank) ความยาววันมีประจำเดือน
- `flowLevel` (string|blank) ระดับเลือด
- `painLevel` (string|blank) ระดับปวด
- `notes` (string|blank) หมายเหตุ
- `status` (string) `Active|Inactive`
- `createdAt` (ISO) เวลาสร้าง
- `updatedAt` (ISO) เวลาอัปเดต

### ovulation_predictions
**Primary key:** `predId`  
**Index:** `userId`, `cycleId`

คอลัมน์:
- `predId` (string) รหัสผลคาดการณ์
- `userId` (string)
- `cycleId` (string)
- `fertileStartDate` (YYYY-MM-DD)
- `fertileEndDate` (YYYY-MM-DD)
- `ovulationDate` (YYYY-MM-DD)
- `nextPeriodExpectedDate` (YYYY-MM-DD)
- `method` (string) วิธีคำนวณ
- `confidence` (number|blank) ความมั่นใจ
- `createdAt` (ISO)

### period_daily_logs
**Primary key:** `logId`  
**Unique (recommended):** `userId + logDate`

คอลัมน์:
- `logId` (string) รหัสบันทึกประจำวัน
- `userId` (string)
- `logDate` (YYYY-MM-DD)
- `bleeding` (string|blank)
- `symptoms` (string|blank)
- `mood` (string|blank)
- `dischargeType` (string|blank)
- `hadSex` (boolean|string) true/false
- `sexProtection` (string|blank)
- `pillTaken` (boolean|string) true/false
- `notes` (string|blank)
- `createdAt` (ISO)

> หมายเหตุ: ระบบมี **migration guard** ผ่าน `fpEnsureSheets_()` ที่จะสร้างชีต + เติมหัวตารางที่ขาดให้อัตโนมัติเมื่อมีการเรียกใช้งาน API
