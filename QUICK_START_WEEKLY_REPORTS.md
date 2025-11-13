# Quick Start Guide - Weekly Report Generation

## 🚀 Ready to Run!

Everything is implemented and ready. Here's what you need to do:

## Step 1: Run the Generation Script

Execute this command in your terminal:

```bash
npx tsx src/scripts/runWeeklyReportGeneration.ts
```

This will:
- Generate Beam reports for weeks 26-46 (2025)
- Generate Jointer reports for weeks 40-46 (2025)
- Create ~21 Beam reports and ~7 Jointer reports
- Take approximately 2-5 minutes to complete

## Step 2: Verify in Firebase Console

1. Open [Firebase Console](https://console.firebase.google.com/project/hranolky-firestore/firestore)
2. Navigate to Firestore Database
3. Check these collections:
   - `WeeklyBeamReports` - Should have ~21 documents (2025_26 to 2025_46)
   - `WeeklyJointerReports` - Should have ~7 documents (2025_40 to 2025_46)

## Step 3: Update VolumeInTimeChart (Optional)

To use real data instead of mock data:

### Option A: Update the component to fetch by SlotType

```typescript
// In VolumeInTimeChart.tsx
import { useFetchVolumeHistory } from "../hooks/useFetchVolumeHistory";

// Replace mock data generation
const { volumeData, loading: historyLoading } = useFetchVolumeHistory(SlotType.Beam, 12);
```

### Option B: Pass SlotType from parent

```typescript
// In ContentLayoutContainer.tsx
<VolumeInTimeChart currentVolume={volumeSum} slotType={SlotType.Beam} />
```

## 📊 Expected Output

When you run the script, you should see:

```
========================================
Weekly Report Generation Script
========================================
This will generate historical weekly reports for:
- Beams: from week 2025_26 to current
- Jointers: from week 2025_40 to current
========================================

🚀 Starting weekly report generation...

📊 Generating Beam reports from 2025_26 to current...
Generating Beam report for week 2025_26 (ending 2025-06-29T23:59:59.999Z)
✅ Beam report for 2025_26: 1234 units, 45.678 dm³
Generating Beam report for week 2025_27 (ending 2025-07-06T23:59:59.999Z)
✅ Beam report for 2025_27: 1256 units, 46.234 dm³
...
(continues for all weeks)
...

📊 Generating Jointer reports from 2025_40 to current...
Generating Jointer report for week 2025_40 (ending 2025-10-05T23:59:59.999Z)
✅ Jointer report for 2025_40: 890 units, 33.456 dm³
...
(continues for all weeks)
...

✅ All weekly reports generated successfully!

========================================
Script completed successfully! 🎉
========================================
```

## ⚠️ Important Notes

- **Run only once**: This is a one-time population script
- **Firestore costs**: ~6,000+ document reads (check Firebase pricing)
- **Execution time**: 2-5 minutes depending on your data volume
- **Network**: Requires stable internet connection to Firebase

## 🔧 Troubleshooting

### Error: "Cannot find module 'tsx'"
Run: `npm install --save-dev tsx --legacy-peer-deps`

### Error: Firebase permission denied
Check your Firebase security rules for the collections

### Script hangs or times out
- Check your internet connection
- Verify Firebase project is accessible
- Check if you have too many slots/actions (script processes sequentially)

## 📚 Documentation

For more details, see:
- `src/scripts/README.md` - Detailed script documentation
- `WEEKLY_REPORT_IMPLEMENTATION.md` - Technical implementation details
- `src/hooks/generateVolumeWeeklyReport.ts` - Source code with comments

## 🎯 Next Steps After Generation

1. ✅ Verify data in Firebase Console
2. 📊 Update `VolumeInTimeChart` to use real data
3. 🗑️ Remove mock data generation from `VolumeInTimeChart.tsx`
4. 🔄 Set up automated weekly report generation (optional, future enhancement)

---

**Ready?** Just run: `npx tsx src/scripts/runWeeklyReportGeneration.ts` 🚀

