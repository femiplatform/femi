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

> ระบบนี้ใช้ 3 ชีต: `period_cycles`, `ovulation_predictions`, `period_daily_logs`
> หมายเหตุ: ระบบจะ auto-create ชีตและ **เติมหัวตารางที่ขาดโดยการ append ต่อท้าย** (ไม่เขียนทับหัวคอลัมน์เดิม)

### period_cycles
Key: `cycleId`

Columns:
- cycleId (string)
- userId (string)
- periodStartDate (YYYY-MM-DD)
- periodEndDate (YYYY-MM-DD or empty)
- cycleLengthDays (number or empty)
- periodLengthDays (number or empty)
- flowLevel (string)
- painLevel (string)
- notes (string)
- status (string)
- createdAt (ISO datetime)
- updatedAt (ISO datetime)

### ovulation_predictions
Key: `predId`

Columns:
- predId
- userId
- cycleId
- fertileStartDate
- fertileEndDate
- ovulationDate
- nextPeriodExpectedDate
- method
- confidence
- createdAt

### period_daily_logs
Key: `logId` (unique) / logical key: (userId, logDate)

Columns:
- logId
- userId
- logDate
- bleeding
- symptoms
- mood
- dischargeType
- hadSex
- sexProtection
- pillTaken
- notes
- createdAt