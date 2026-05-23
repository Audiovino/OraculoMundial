# Fix All Issues - Tasks

## Task 1: Investigate Matches Display Issue
**Description**: Determine why only one country is visible when viewing matches for predictions

**Sub-tasks**:
- [ ] Check if filters (selectedTeam, selectedDate, selectedGroup) are being applied
- [ ] Verify both home and away team data are loading from WC_MATCHES
- [ ] Test on desktop browser - both teams should be visible
- [ ] Test on mobile browser - both teams should be visible
- [ ] Check CSS for any hidden elements
- [ ] Verify responsive layout works correctly on all screen sizes
- [ ] Check browser console for JavaScript errors

**Acceptance Criteria**:
- ✅ Both home and away teams visible on desktop
- ✅ Both home and away teams visible on mobile
- ✅ No console errors
- ✅ Filters work correctly (can filter by team/date/group)
- ✅ All 72 matches display correctly

---

## Task 2: Fix Video Tutorial in Mini-Ligas
**Description**: Get the video tutorial working in the Mini-Ligas section

**Sub-tasks**:
- [ ] Verify HyperFrames deployment status at https://hyperframes-mini-video.vercel.app/
- [ ] If down, redeploy HyperFrames or find alternative video URL
- [ ] Update iframe src in PrivateLeague.tsx if URL changed
- [ ] Add error handling for iframe load failures
- [ ] Test video loads when clicking "Video tutorial" button
- [ ] Test on mobile device

**Acceptance Criteria**:
- ✅ Video loads when clicking "Video tutorial" button
- ✅ Works on desktop and mobile
- ✅ No console errors
- ✅ Graceful error message if video fails to load

---

## Task 3: Deploy to Vercel and Test
**Description**: Deploy the fixed code to Vercel and verify everything works from mobile

**Sub-tasks**:
- [ ] Push changes to GitHub (main branch)
- [ ] Wait for Vercel build to complete
- [ ] Verify build succeeds (no errors)
- [ ] Test animations load in 1-2 seconds (not 8 seconds)
- [ ] Test matches display correctly
- [ ] Test video tutorial loads
- [ ] Test from mobile device at https://oraculo-mundial.vercel.app
- [ ] Check browser console for errors

**Acceptance Criteria**:
- ✅ Vercel deployment successful
- ✅ Animations load quickly (1-2 seconds)
- ✅ Matches display both teams correctly
- ✅ Video tutorial loads
- ✅ No console errors on mobile
- ✅ All features work from mobile device

