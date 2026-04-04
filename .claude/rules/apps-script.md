# Google Apps Script Rules

## API Pattern
- Single Web App deployment, routed by `action` query parameter
- All endpoints validate operator authentication and authorization
- Every mutation logs to the activity's audit-log sheet

## Data Access
- Google Sheets are the database — accessed via SpreadsheetApp
- Each activity has its own folder with separate sheets (snapshot, transactions, incidents, audit-log)
- master-inventory is the permanent source of truth

## Validation
- Check operator role before allowing write operations
- Validate stock sufficiency before issuing equipment
- Prevent duplicate transaction IDs (idempotency)
- Required fields: personal_id, signatures, items on transactions

## Rate Limits
- 300 req/min project-wide, 60/user — well within expected usage
- 6-minute execution timeout per invocation — keep operations fast (single appends)
