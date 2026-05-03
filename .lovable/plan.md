

## Button and Navigation Audit -- Full Fix Plan

### Issues Found

1. **Route mismatch: `/projects` goes to BrandPage instead of ProjectsPage**
   - In `App.tsx` line 51: `<Route path="/projects" element={<BrandPage />} />` -- should be `ProjectsPage`
   - This means the "Discover Collection" hero button and footer "Projects" link take users to the Brand page instead of a projects listing

2. **Header missing "projects" route mapping**
   - In `Header.tsx` the `viewToPath` map (line 203-210) has no `"projects"` key
   - The `getViewFromPath` function (line 211-219) has no mapping for `/projects`
   - This means navigating to `/projects` shows the header in "home" state

3. **Footer "modifications" route goes to wrong path**
   - In `Footer.tsx` line 38: `viewToPath` maps `"modifications"` to `/modifications`, but the actual route is `/commission` (App.tsx line 52)
   - Footer's "Modifications" link navigates to `/modifications` which also works (both routes point to same component), so this is minor but inconsistent

4. **HeroSection "projects" button navigates to `/projects`** which currently shows BrandPage (ties to issue #1)

5. **BrandSection uses `window.location.href` for project clicks** (line 82)
   - `handleProjectClick` uses `window.location.href` instead of `navigate()`, causing a full page reload instead of SPA navigation
   - This hurts performance and breaks the smooth user experience

6. **ContactBookingSection form doesn't actually send data**
   - The submit handler (line 116-123) just does a `setTimeout` and shows "Sent!" without actually sending any data anywhere (no WhatsApp, no API, nothing)
   - This is potentially misleading to users

7. **MissionStatement removed its CTA buttons**
   - The component accepts `onNavigateToProjects` and `onNavigateToBrand` props but the buttons that use them have been removed (the JSX ends before any buttons)
   - The props are passed from HomePage but never used

8. **ContactSection uses placeholder phone number**
   - `whatsappNumber = "971501234567"` and `phoneNumber = "+971 50 123 4567"` are placeholders, while the real numbers are in `ContactBookingSection` and `VinBanner` (e.g., +971 54 507 7707)

9. **BookingForm uses placeholder WhatsApp number**
   - `whatsappNumber = "971501234567"` is a placeholder, not the real business number

10. **Footer copyright year is hardcoded to 2025** (line 181) -- should be 2026 or dynamic

---

### Technical Fix Plan

**File 1: `src/App.tsx`**
- Line 51: Change `<Route path="/projects" element={<BrandPage />} />` to `<Route path="/projects" element={<ProjectsPage />} />`

**File 2: `src/components/Header.tsx`**
- Add `"projects": "/projects"` to `viewToPath` (around line 209)
- Add `if (path === "/projects") return "projects";` to `getViewFromPath`

**File 3: `src/components/Footer.tsx`**
- Change `"modifications": "/modifications"` to `"modifications": "/commission"` in `viewToPath` for consistency with actual routes

**File 4: `src/components/BrandSection.tsx`**
- Line 82: Replace `window.location.href = ...` with proper `useNavigate()` call

**File 5: `src/components/ContactSection.tsx`**
- Update placeholder phone numbers to real ones: `971545077707` for WhatsApp, `+971 54 507 7707` for display

**File 6: `src/components/BookingForm.tsx`**
- Update `whatsappNumber` from `"971501234567"` to `"971545077707"`

**File 7: `src/components/Footer.tsx`**
- Update copyright year from 2025 to 2026

