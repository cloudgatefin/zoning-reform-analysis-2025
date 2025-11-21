# UI Component Library

Professional design system built with Tailwind CSS (zero cost, no external dependencies).

## Design Principles

- **Accessibility First:** WCAG AAA compliant (high contrast, semantic HTML)
- **Responsive:** Mobile-first design, works on all screen sizes
- **Consistent:** Unified spacing, typography, colors
- **Professional:** Enterprise-grade appearance
- **Fast:** Pure Tailwind, no runtime overhead

## Color Palette

### Backgrounds
- Primary: `#ffffff` (white)
- Cards: `#f9fafb` (light gray)
- Hover: `#f3f4f6` (medium gray)

### Text
- Primary: `#111827` (dark gray/black)
- Secondary: `#4b5563` (medium gray)
- Muted: `#6b7280` (light gray)

### Semantic Colors
- Success: `#059669` (green)
- Warning: `#d97706` (orange)
- Error: `#dc2626` (red)
- Info: `#2563eb` (blue)

## Spacing System

- xs: 4px
- sm: 8px
- md: 12px
- lg: 16px
- xl: 24px
- 2xl: 32px

All based on 4px grid for consistency.

## Components Included

- Button - Primary, secondary, danger variants
- Card - Container with shadows
- Table - Organized data display
- Select - Dropdown inputs
- Input - Text inputs
- Badge - Labels and tags
- Alert - Notifications

## Using Components

```tsx
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

export default function Example() {
  return (
    <Card className="p-6">
      <h1 className="text-xl font-semibold mb-4">Title</h1>
      <p className="text-gray-600 mb-6">Description</p>
      <Button variant="primary">Action</Button>
    </Card>
  )
}
```

## Tailwind Classes Reference

### Spacing
- `p-4` = padding 16px
- `m-4` = margin 16px
- `gap-4` = grid gap 16px

### Text
- `text-sm` = 14px
- `text-base` = 16px
- `text-lg` = 18px
- `text-xl` = 20px
- `text-2xl` = 24px
- `font-semibold` = 600 weight
- `text-gray-600` = secondary color

### Layout
- `flex` = flexbox
- `grid` = grid layout
- `w-full` = 100% width
- `max-w-6xl` = max-width container

## All Components are Pure Tailwind

No CSS files needed. All styling is done with Tailwind utility classes in JSX.

Example:
```tsx
// Just Tailwind classes - no external dependencies
<div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
  Content
</div>
```
