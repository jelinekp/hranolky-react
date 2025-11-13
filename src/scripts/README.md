# Weekly Report Generation

This directory contains a one-time script to populate historical weekly reports for warehouse inventory tracking.

## Overview

The script generates weekly reports for both **Beams** and **Jointers** by analyzing historical slot actions and calculating:
- Total quantity of items per week
- Total volume in dm³ (cubic decimeters) per week

## Data Structure

Reports are stored in two Firestore collections:
- `WeeklyBeamReports` - Reports for Beam inventory
- `WeeklyJointerReports` - Reports for Jointer inventory

Each document has:
- **Document ID**: `YYYY_WW` (e.g., `2025_26` for week 26 of 2025)
- **Data**:
  ```typescript
  {
    totalQuantity: number,  // Total number of items
    totalVolumeDm: number   // Total volume in dm³
  }
  ```

## Time Ranges

- **Beams**: Generates reports from week `2025_26` to current week
- **Jointers**: Generates reports from week `2025_40` to current week

## How It Works

1. For each week, the script calculates the inventory state at **Sunday 23:59:59**
2. For each warehouse slot:
   - Finds the latest `SlotAction` before the week's end
   - Uses `newQuantity` from that action (or current quantity if no actions exist)
   - Calculates volume using: `quantity × length × thickness × width / 1,000,000`
3. Sums all quantities and volumes across all slots of the same type
4. Saves the aggregated data to Firestore

## Running the Script

### Option 1: Direct execution (Recommended)
```bash
npx tsx src/scripts/runWeeklyReportGeneration.ts
```

### Option 2: Uncomment in source file
In `src/hooks/generateVolumeWeeklyReport.ts`, uncomment the last line:
```typescript
generateAllWeeklyReports().catch(console.error);
```

Then import and run it from your app or console.

## Important Notes

⚠️ **This is a one-time script** - Only run it once to populate historical data.

⚠️ **Firestore costs** - The script reads ~300 slots × up to 20 actions each, which may incur Firestore read costs.

⚠️ **Execution time** - Processing all historical data may take several minutes.

## Output Example

```
🚀 Starting weekly report generation...

📊 Generating Beam reports from 2025_26 to current...
Generating Beam report for week 2025_26 (ending 2025-06-29T23:59:59.999Z)
✅ Beam report for 2025_26: 1250 units, 45.678 dm³
Generating Beam report for week 2025_27 (ending 2025-07-06T23:59:59.999Z)
✅ Beam report for 2025_27: 1300 units, 47.234 dm³
...

📊 Generating Jointer reports from 2025_40 to current...
Generating Jointer report for week 2025_40 (ending 2025-10-05T23:59:59.999Z)
✅ Jointer report for 2025_40: 850 units, 32.145 dm³
...

✅ All weekly reports generated successfully!
```

## Verification

After running, you can verify the data in Firebase Console:
1. Go to Firestore Database
2. Check `WeeklyBeamReports` and `WeeklyJointerReports` collections
3. Verify documents exist for each week in the expected range

