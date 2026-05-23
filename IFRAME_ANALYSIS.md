# 🔍 Iframe Loading Analysis - HyperFrames Video Tutorial

**Date**: 2025-01-XX  
**Component**: `src/components/PrivateLeague.tsx`  
**URL**: `https://hyperframes-mini-video.vercel.app/`  
**Status**: ⚠️ ISSUES IDENTIFIED

---

## ✅ What's Working

1. **HyperFrames Deployment Active**
   - URL is accessible and serving content
   - Returns HTML with tutorial steps and images
   - No 404 or server errors

2. **Proper Event Handlers**
   - `onLoad` handler sets loading state to false
   - `onError` handler shows error UI
   - Loading spinner displays while iframe loads

3. **Responsive Container**
   - `aspect-video` class maintains 16:9 ratio
   - Absolute positioning for iframe fills container
   - Proper overflow handling

---

## ⚠️ Issues Identified

### 1. **Sandbox Attribute Security Risk**
**Location**: Line ~260 in `PrivateLeague.tsx`

```tsx
sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
```

**Problem**: 
- Combining `allow-scripts` + `allow-same-origin` defeats the purpose of sandboxing
- This combination allows the iframe to access the parent's origin
- Security best practice: Never use both together unless absolutely necessary

**Recommendation**:
```tsx
// Option A: Remove allow-same-origin (safer)
sandbox="allow-scripts allow-popups allow-forms"

// Option B: If same-origin is needed, be explicit about why
sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
// Add comment explaining why same-origin is required
```

---

### 2. **Invalid CSS Property on Iframe**
**Location**: Line ~265 in `PrivateLeague.tsx`

```tsx
style={{ 
  border: 'none', 
  background: '#0A0D18',
  opacity: iframeLoading ? 0 : 1,
  transition: 'opacity 0.3s ease-in-out',
  objectFit: 'contain',  // ❌ INVALID for iframe
  display: 'block'
}}
```

**Problem**:
- `objectFit` is only valid for `<img>`, `<video>`, and replaced elements
- Does NOT work on `<iframe>` elements
- This is likely causing the "corrido" (off-center) issue on PC

**Fix**:
```tsx
style={{ 
  border: 'none', 
  background: '#0A0D18',
  opacity: iframeLoading ? 0 : 1,
  transition: 'opacity 0.3s ease-in-out',
  display: 'block'
  // Remove objectFit - not applicable to iframes
}}
```

---

### 3. **Unused Variable**
**Location**: Line 30 in `PrivateLeague.tsx`

```tsx
const videoUrl = import.meta.env.VITE_SUPABASE_VIDEO_URL || '/videos/futbolm.mp4';
```

**Problem**: Variable declared but never used

**Fix**: Remove the line or use it as a fallback:
```tsx
// Option 1: Remove if not needed
// const videoUrl = import.meta.env.VITE_SUPABASE_VIDEO_URL || '/videos/futbolm.mp4';

// Option 2: Use as fallback
const videoUrl = import.meta.env.VITE_HYPERFRAMES_URL || 'https://hyperframes-mini-video.vercel.app/';
```

---

### 4. **Potential CORS/X-Frame-Options Issues**
**Status**: ⚠️ NEEDS VERIFICATION

**Potential Problems**:
- If HyperFrames sets `X-Frame-Options: DENY` or `SAMEORIGIN`, iframe will fail
- If HyperFrames sets `Content-Security-Policy: frame-ancestors 'none'`, iframe will fail
- CORS errors may prevent iframe from loading

**How to Check**:
1. Open browser DevTools (F12)
2. Go to Network tab
3. Load the page with iframe
4. Check response headers for:
   - `X-Frame-Options`
   - `Content-Security-Policy`
   - Any CORS-related headers

**Expected Headers for Iframe to Work**:
```
X-Frame-Options: ALLOWALL
# OR
Content-Security-Policy: frame-ancestors *
# OR no frame restrictions at all
```

---

### 5. **Mobile Display Issue**
**User Report**: Video appears "corrido" (off-center) on PC

**Likely Causes**:
1. Invalid `objectFit: 'contain'` on iframe (see Issue #2)
2. Aspect ratio container may not match iframe content
3. HyperFrames content may have fixed dimensions

**Testing Needed**:
- Test on actual mobile device
- Test on different screen sizes (320px, 375px, 768px, 1024px)
- Check if HyperFrames content is responsive

---

## 🧪 Testing Checklist

### Browser Console Tests
- [ ] Open `test-iframe.html` in browser
- [ ] Check console for errors (F12 → Console)
- [ ] Verify which sandbox configuration works
- [ ] Check Network tab for failed requests
- [ ] Look for CORS errors
- [ ] Check for X-Frame-Options errors

### Mobile Tests
- [ ] Test on actual mobile device (not just DevTools)
- [ ] Test in portrait orientation
- [ ] Test in landscape orientation
- [ ] Verify video is centered
- [ ] Check if video is playable
- [ ] Verify touch controls work

### Desktop Tests
- [ ] Test on Chrome
- [ ] Test on Firefox
- [ ] Test on Safari (if available)
- [ ] Test on Edge
- [ ] Verify video is not "corrido" (off-center)

---

## 🔧 Recommended Fixes

### Priority 1: Remove Invalid CSS
```tsx
// Remove objectFit from iframe style
style={{ 
  border: 'none', 
  background: '#0A0D18',
  opacity: iframeLoading ? 0 : 1,
  transition: 'opacity 0.3s ease-in-out',
  display: 'block'
}}
```

### Priority 2: Review Sandbox Attributes
```tsx
// If same-origin is not needed:
sandbox="allow-scripts allow-popups allow-forms"

// If same-origin IS needed, add comment explaining why:
sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
// Note: allow-same-origin needed for [specific reason]
```

### Priority 3: Add Better Error Logging
```tsx
onError={(e) => {
  setIframeLoading(false);
  setIframeError(true);
  console.error('[PrivateLeague] Iframe failed to load from HyperFrames');
  console.error('[PrivateLeague] Error details:', e);
  console.error('[PrivateLeague] Check for X-Frame-Options or CSP restrictions');
}}
```

### Priority 4: Add Fallback Content
```tsx
{iframeError && (
  <div className="absolute inset-0 flex items-center justify-center bg-[#0A0D18] z-10">
    <div className="flex flex-col items-center gap-3 text-center px-4">
      <div className="text-3xl">⚠️</div>
      <p className="text-sm text-gray-300">No se pudo cargar el video</p>
      <p className="text-xs text-gray-500">
        Intenta recargar la página o verifica tu conexión
      </p>
      <a
        href="https://hyperframes-mini-video.vercel.app/"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
        style={{
          backgroundColor: 'rgba(168,85,247,0.2)',
          color: '#c084fc',
          border: '1px solid rgba(168,85,247,0.3)'
        }}
      >
        Abrir en nueva pestaña
      </a>
    </div>
  </div>
)}
```

---

## 📊 Test Results

### Test File Created
- **Location**: `c:\Proyectos\OraculoMundial\test-iframe.html`
- **Purpose**: Test different iframe configurations
- **Tests**:
  1. Current implementation (with sandbox)
  2. Without sandbox attribute
  3. Minimal sandbox (allow-scripts only)

### How to Use Test File
1. Open `test-iframe.html` in browser
2. Check which test loads successfully
3. Open DevTools Console (F12)
4. Look for error messages
5. Check Network tab for failed requests

---

## 🎯 Next Steps

1. **Run Test File**
   - Open `test-iframe.html` in browser
   - Document which configuration works
   - Check console for specific errors

2. **Fix Invalid CSS**
   - Remove `objectFit: 'contain'` from iframe style
   - Test on desktop to verify "corrido" issue is fixed

3. **Verify HyperFrames Headers**
   - Check if X-Frame-Options allows embedding
   - Verify CSP frame-ancestors policy
   - Contact HyperFrames team if headers block embedding

4. **Test on Mobile**
   - Deploy fixes to Vercel
   - Test on actual mobile device
   - Verify video loads and displays correctly

5. **Add Fallback**
   - Add "Open in new tab" button if iframe fails
   - Improve error messaging
   - Consider alternative video hosting if needed

---

## 📝 Notes

- HyperFrames deployment is confirmed active
- Content is being served (HTML with tutorial steps)
- Main issues are CSS-related and sandbox configuration
- No evidence of server-side errors
- CORS/X-Frame-Options need verification via browser DevTools

---

## 🔗 Resources

- **HyperFrames URL**: https://hyperframes-mini-video.vercel.app/
- **Component**: `src/components/PrivateLeague.tsx`
- **Test File**: `test-iframe.html`
- **MDN iframe**: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe
- **MDN sandbox**: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe#attr-sandbox
