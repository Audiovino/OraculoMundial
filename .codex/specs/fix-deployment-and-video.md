# Fix Deployment & Video Tutorial Issues

## Overview
Fix the Vercel build error and get the video tutorial working in Mini-Ligas.

## Tasks

### Task 1: Fix Vercel Build Error
**Status**: not_started
**Description**: Remove or fix `hermesAnimationOptimizer.ts` which is causing build failure due to missing imports from `hermesAgents.ts`

**Details**:
- Error: `Module '"./hermesAgents"' has no exported member 'callOllamaLocal'` and `callGLMCloud`
- File: `src/services/hermesAnimationOptimizer.ts`
- Solution: Delete the file since it's not being used anywhere

**Acceptance Criteria**:
- ✅ Build succeeds on Vercel
- ✅ No TypeScript errors
- ✅ Deployment completes

---

### Task 2: Fix Video Tutorial in Mini-Ligas
**Status**: not_started
**Depends on**: Task 1
**Description**: Ensure the video iframe loads correctly from HyperFrames deployment

**Details**:
- Current URL: `https://hyperframes-mini-video.vercel.app/`
- Issue: Video not displaying in mobile
- The iframe is already configured with proper attributes
- May need CORS headers or fallback handling

**Acceptance Criteria**:
- ✅ Video loads when clicking "Video tutorial" button
- ✅ Works on mobile (tested from phone)
- ✅ No console errors related to iframe

---

### Task 3: Verify Deployment & Test from Mobile
**Status**: not_started
**Depends on**: Task 1, Task 2
**Description**: Deploy to Vercel and test all fixes from mobile device

**Details**:
- URL: `https://oraculo-mundial.vercel.app`
- Test animations load in 1-2 seconds (not 8 seconds)
- Test video tutorial loads in Mini-Ligas
- Test dashboard (if accessible)

**Acceptance Criteria**:
- ✅ Vercel deployment successful
- ✅ Animations load quickly
- ✅ Video tutorial visible and playable
- ✅ No errors in browser console

