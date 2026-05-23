# Fix All Issues - Requirements

## Problem 1: Vercel Build Status
**Status**: ✅ RESOLVED
- Build works locally (npm run build succeeds)
- No TypeScript errors
- Ready to deploy

## Problem 2: Video Tutorial Not Loading in Mini-Ligas
**Status**: ❌ BLOCKED
- URL: `https://hyperframes-mini-video.vercel.app/`
- Issue: URL not responding (checked with web_fetch)
- Impact: Users can't see the tutorial video when clicking "Video tutorial" button
- Current iframe config: Correct (has allow, sandbox, allowFullScreen attributes)
- Root cause: HyperFrames deployment may be down or URL is incorrect

**Requirements**:
- Verify HyperFrames deployment is running
- If down, redeploy or use fallback video URL
- If URL is wrong, update iframe src in PrivateLeague.tsx
- Test video loads on mobile

## Problem 3: Matches Display Shows Only One Country
**Status**: ❌ NEEDS INVESTIGATION
- Issue: When viewing matches to make predictions, only one country is visible
- Expected: Both home and away teams should be visible with flags and names
- Data: WC_MATCHES has 72 matches with complete data (12 groups x 6 matches)
- UI: Properly configured to show both teams
- Possible causes:
  1. Filter is active (selectedTeam, selectedDate, or selectedGroup)
  2. CSS issue hiding one team
  3. Mobile layout issue (only showing one team on small screens)
  4. Data loading issue (away team data not loading)

**Requirements**:
- Verify both teams render on desktop
- Verify both teams render on mobile
- Check if filters are being applied unexpectedly
- Ensure responsive layout shows both teams on all screen sizes
- Test with different groups/dates

## Problem 4: Dashboard Errors (if still present)
**Status**: ⚠️ UNKNOWN
- Previous errors: Scraping and sync errors
- Status: May be fixed after removing hermesAnimationOptimizer.ts
- Need to verify after deployment

**Requirements**:
- Test Admin dashboard after deployment
- Verify scraping works (or shows proper error message)
- Verify sync works (or shows proper error message)

## Deployment Plan
1. ✅ Verify build works locally
2. ❌ Fix video tutorial (HyperFrames issue)
3. ❌ Fix matches display (investigate filter/layout)
4. ⏳ Deploy to Vercel
5. ⏳ Test from mobile device

