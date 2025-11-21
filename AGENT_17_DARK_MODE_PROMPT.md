# Agent 17: Dark Mode & Theme Customization

**Objective:** Provide theme options that let users control their experience
**Timeline:** 6-8 hours
**Status:** Ready to launch
**Budget:** $15-20 API cost

---

## Executive Summary

Add professional dark mode and theme customization to the app. Users want control over their visual experience, and this feature dramatically improves user satisfaction and reduces eye strain.

---

## Deliverables

### 1. Professional Dark Theme
- Create beautiful dark theme (not just inverted colors)
- Dark backgrounds: #1a1a1a (slightly lighter than pure black)
- Light text: #f0f0f0 (slightly less bright than pure white)
- Proper contrast ratios (meet WCAG AAA)
- All components styled for dark mode

**Implementation:**
- Create dark theme CSS in `app/styles/dark-theme.css`
- Add Tailwind dark mode configuration
- Update `tailwind.config.ts` to support dark mode
- Apply `dark:` prefix classes throughout app

**Dark Color Palette:**
```
Dark backgrounds: #1a1a1a, #242424, #2d2d2d
Dark text: #f0f0f0, #e0e0e0, #d0d0d0
Dark cards: #242424 with subtle borders
Dark borders: #3d3d3d
Accent blue (dark mode): #4a9eff (brighter than light mode)
Success: #4ade80 (brighter)
Warning: #facc15 (brighter)
Error: #f87171 (brighter)
```

---

### 2. Theme Toggle Component
- Easy-to-access toggle in header/navbar
- Toggle button with moon/sun icons
- Smooth transition between themes (0.3s fade)
- System preference detection (respects OS dark mode setting)
- Visual feedback on toggle

**Implementation:**
- Create `app/components/ui/ThemeToggle.tsx`
- Add to navigation header
- Use `next-themes` library (install if needed) or custom context
- Detect system preference on first load

**Features:**
- Icon changes (sun ☀️ → moon 🌙)
- Color transition animation
- Tooltip "Toggle dark mode"
- Keyboard shortcut (Alt+T)

---

### 3. Settings Page for Theme Preferences
- New `/settings` page
- User preferences panel
- Theme selection cards:
  - Light Mode (preview)
  - Dark Mode (preview)
  - Auto (matches system)
- High Contrast mode option
- Color scheme customization (if advanced)

**Implementation:**
- Create `app/app/settings/page.tsx`
- Create `app/components/settings/ThemeSelector.tsx`
- Create `app/components/settings/PreferencePanel.tsx`
- Add settings link to navigation

**Settings Panel Should Include:**
- Theme selection (Light, Dark, Auto)
- High contrast toggle
- Color accent selector (blue, green, purple, etc.)
- Preview of selected theme
- "Apply" button
- "Reset to Defaults" option

---

### 4. localStorage Persistence
- Save user preferences to browser storage
- Persist across sessions
- No need for login/backend (nice UX)
- Override system preference when user chooses

**Implementation:**
- Create `app/lib/hooks/useTheme.ts` custom hook
- Store in localStorage with key `zoning-theme-preference`
- JSON structure:
  ```json
  {
    "theme": "dark",
    "accentColor": "blue",
    "highContrast": false
  }
  ```
- Load preferences on app startup
- Apply before first render (no flash)

---

### 5. High Contrast Mode
- Extra-readable option for accessibility
- Maximum contrast for all elements
- Available alongside light/dark
- Meets WCAG AAA+ standards

**Implementation:**
- Create separate CSS with maximum contrast
- Thicker borders
- Larger text
- Bigger touch targets
- Clearer visual separation

**High Contrast Colors:**
```
Background: #ffffff or #000000
Text: #000000 or #ffffff
Borders: Solid, thick, high contrast
Focus rings: Extra visible
```

---

### 6. Color Customization
- Let users change accent colors
- 6-8 predefined accent options:
  - Blue (default)
  - Green (nature)
  - Purple (tech)
  - Orange (warm)
  - Red (bold)
  - Indigo (professional)
- Live preview before applying
- Save preference

**Implementation:**
- Update Tailwind config to support color variants
- Create `app/components/settings/ColorPicker.tsx`
- Generate CSS variables for accent colors
- Update all interactive elements to use accent color

---

## Technical Requirements

### Design System Compliance
- Use existing components throughout
- All components must work in dark mode
- Test all interactive elements
- Ensure form inputs are visible in all themes

### Accessibility
- WCAG AAA compliant in all themes
- High Contrast mode available
- Keyboard navigation works in all themes
- No color-only indicators

### Performance
- Theme switch happens instantly (< 100ms)
- No flickering or flash of wrong theme
- Lazy load theme CSS if needed
- No layout shifts

### Browser Support
- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers

---

## Quality Criteria

✅ Dark mode looks professional and polished
✅ All components visible in all themes
✅ Theme toggle works smoothly
✅ Preferences persist across sessions
✅ System preference detection works
✅ High contrast mode passes WCAG AAA
✅ No console errors
✅ Mobile theme toggle is accessible

---

## Success Definition

After Agent 17 completes, users should be able to:
1. ✅ Toggle between light and dark mode easily
2. ✅ Dark mode should look professional (not just inverted)
3. ✅ Theme preference persists when they return
4. ✅ Choose custom accent colors
5. ✅ Access high contrast mode for accessibility
6. ✅ See live preview before applying themes

---

## Files to Create

```
NEW FILES:
  app/components/ui/ThemeToggle.tsx
  app/components/settings/ThemeSelector.tsx
  app/components/settings/PreferencePanel.tsx
  app/app/settings/page.tsx
  app/lib/hooks/useTheme.ts
  app/styles/dark-theme.css
  app/styles/high-contrast-theme.css
  app/context/ThemeContext.tsx
  app/providers/ThemeProvider.tsx

MODIFIED FILES:
  app/components/landing/Navigation.tsx - Add theme toggle
  app/styles/globals.css - Add dark mode colors
  tailwind.config.ts - Configure dark mode
  app/app/layout.tsx - Add ThemeProvider
  app/components/landing/Footer.tsx - Add settings link
```

---

## Estimated Effort

| Task | Hours |
|------|-------|
| Dark theme CSS | 1.5 |
| Theme toggle component | 1 |
| Settings page | 1.5 |
| localStorage persistence | 0.75 |
| System preference detection | 0.5 |
| High contrast mode | 1 |
| Color customization | 1 |
| Testing & polish | 0.75 |
| **Total** | **8** |

---

## Dark Mode Color Values

```css
/* Dark backgrounds */
--dark-bg-primary: #1a1a1a;
--dark-bg-secondary: #242424;
--dark-bg-tertiary: #2d2d2d;

/* Dark text */
--dark-text-primary: #f0f0f0;
--dark-text-secondary: #d0d0d0;
--dark-text-muted: #a0a0a0;

/* Dark accents (brighter for visibility) */
--dark-accent-blue: #4a9eff;
--dark-accent-green: #4ade80;
--dark-accent-purple: #a78bfa;
--dark-accent-orange: #fb923c;
--dark-accent-red: #f87171;

/* Dark borders */
--dark-border-light: #3d3d3d;
--dark-border-medium: #4d4d4d;
--dark-border-dark: #5d5d5d;

/* Dark shadows (more subtle) */
--dark-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.5);
--dark-shadow-md: 0 4px 6px rgba(0, 0, 0, 0.4);
--dark-shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.3);
```

---

## When Done, Commit With

```
Agent 17: Dark Mode & Theme Customization

- Implemented professional dark theme with proper contrast
- Created theme toggle in navigation header
- Added settings page for theme preferences
- Implemented localStorage persistence
- Added system preference detection
- Created high contrast accessibility mode
- Added color customization (6 accent options)
- Live preview for theme changes
- All components work in all themes

Build: ✅ Zero errors
Accessibility: ✅ WCAG AAA compliant in all themes
Performance: ✅ Theme switch < 100ms
```

---

## Launch Instructions

When ready to launch this agent:

1. Copy this entire prompt
2. Go to Claude Code on web (claude.com/claude-code)
3. Paste prompt in new agent conversation
4. Add context: "App is in c:\Users\bakay\zoning-reform-analysis-2025, uses Tailwind CSS"
5. Agent will work autonomously
6. Check progress daily

---

**Ready to add beautiful dark mode!** 🌙

