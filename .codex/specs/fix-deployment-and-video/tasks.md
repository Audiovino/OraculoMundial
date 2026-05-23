# Fix Deployment & Video Tutorial Issues

## Task 1: Fix Match Display on Mobile (Away Team Not Showing)
**Priority**: HIGH
**Issue**: In mobile view, only the home team is visible. The away team section is not displaying.
**File**: `src/components/MundialGame.tsx` (lines ~1200-1250)
**Root Cause**: Layout issue in mobile - the away team section may be hidden or pushed off-screen

**Steps**:
- [ ] Check the flex layout for the match card container
- [ ] Verify the away team section has proper `flex-col` or `flex-row` classes for mobile
- [ ] Ensure the away team div is not hidden with `hidden` or `display: none`
- [ ] Test on mobile that both teams are visible
- [ ] Verify the score inputs are centered between both teams

## Task 2: Fix Video Tutorial in Mini-Ligas
**Priority**: MEDIUM
**Issue**: Video iframe not loading from HyperFrames
**File**: `src/components/PrivateLeague.tsx` (lines ~100-130)
**URL**: `https://hyperframes-mini-video.vercel.app/`

**Steps**:
- [ ] Verify HyperFrames deployment is active
- [ ] Add fallback error handling for iframe
- [ ] Test iframe loads in browser console
- [ ] Add loading state while iframe loads
- [ ] Test on mobile device

## Task 3: Deploy & Test from Mobile
**Priority**: HIGH
**Depends on**: Task 1, Task 2

**Steps**:
- [ ] Commit all fixes to GitHub
- [ ] Wait for Vercel build to complete
- [ ] Test from mobile at https://oraculo-mundial.vercel.app
- [ ] Verify both teams show in match prediction screen
- [ ] Verify video tutorial loads in Mini-Ligas
- [ ] Verify animations load in 1-2 seconds (not 8 seconds)

