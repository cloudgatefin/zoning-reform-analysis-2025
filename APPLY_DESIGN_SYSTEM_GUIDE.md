# Apply Design System to All Pages - Implementation Guide

**Status:** Design system components created ✅
**Next:** Apply to all pages for professional appearance
**Effort:** Moderate (updating existing pages)
**Timeline:** Can be done incrementally

---

## Quick Start

All your pages are already working. We just need to replace inline styles with the new professional components.

### What to Change

**Before (inline/basic styling):**
```tsx
<div style={{ padding: '20px', backgroundColor: 'white' }}>
  <h1 style={{ fontSize: '24px' }}>Title</h1>
  <button>Click</button>
</div>
```

**After (using design system):**
```tsx
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui'

<Card variant="elevated">
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    <Button variant="primary">Click</Button>
  </CardContent>
</Card>
```

---

## Pages to Update (Priority Order)

### Priority 1: Core Pages (Visual Impact)

1. **`app/app/page.tsx`** - Landing page
   - Hero section → use Container + Card
   - Buttons → use Button component
   - Sections → use Card containers

2. **`app/app/dashboard/page.tsx`** - Dashboard
   - Header → improve with Card + title styling
   - Cards → replace with Card component
   - Buttons → use Button component
   - Tables → use Table component

3. **`app/app/scenario/page.tsx`** - Scenario builder
   - Form inputs → use Input + Select components
   - Buttons → use Button component
   - Results display → use Card component

### Priority 2: Content Pages

4. **`app/app/timeline/page.tsx`** - Timeline
5. **`app/app/about/methodology/page.tsx`** - About pages

### Priority 3: Components

6. Dashboard components in `app/components/dashboard/`
7. Visualization components in `app/components/visualizations/`

---

## Step-by-Step Example: Update Dashboard Header

### Current Dashboard Header

```tsx
// Current (in DashboardHeader.tsx)
export function DashboardHeader() {
  return (
    <div className="bg-white p-4 border-b">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-gray-600">Explore zoning reform impacts</p>
    </div>
  )
}
```

### Updated with Design System

```tsx
import { Container, Card, CardHeader, CardTitle, CardContent } from '@/components/ui'

export function DashboardHeader() {
  return (
    <Container maxWidth="lg" className="py-6">
      <Card variant="elevated">
        <CardHeader>
          <CardTitle level="h1">Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Explore zoning reform impacts across the United States
          </p>
        </CardContent>
      </Card>
    </Container>
  )
}
```

**Changes:**
- ✅ Container for proper width and padding
- ✅ Card for professional appearance
- ✅ CardTitle for semantic heading
- ✅ Proper spacing with design tokens
- ✅ Professional shadows

---

## Step-by-Step Example: Update a Form

### Current Scenario Form

```tsx
// Current
export function ScenarioForm() {
  return (
    <div className="p-4">
      <div className="mb-4">
        <label>Select City</label>
        <select>
          <option>Select...</option>
        </select>
      </div>
      <button>Generate</button>
    </div>
  )
}
```

### Updated with Design System

```tsx
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui'
import { Select, Button } from '@/components/ui'

export function ScenarioForm() {
  return (
    <Card variant="elevated" className="max-w-2xl">
      <CardHeader>
        <CardTitle>Create Scenario</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select label="Select City" placeholder="Choose a city...">
          <option value="">Select...</option>
          <option value="1">City 1</option>
          <option value="2">City 2</option>
        </Select>
      </CardContent>
      <CardFooter>
        <Button variant="primary">Generate Scenarios</Button>
        <Button variant="ghost">Clear</Button>
      </CardFooter>
    </Card>
  )
}
```

**Changes:**
- ✅ Card for container
- ✅ Select component with label
- ✅ Proper spacing with CardContent
- ✅ CardFooter for button layout
- ✅ Multiple button variants

---

## Component Mapping Reference

| Old Pattern | New Component | Example |
|---|---|---|
| `<div style={{...}}>` | `<Card>` | Container for content |
| `<h1>Title</h1>` | `<CardTitle>Title</CardTitle>` | Semantic heading |
| `<button>Click</button>` | `<Button>Click</Button>` | Better styling |
| `<select>` | `<Select>` | Better UX |
| `<input>` | `<Input>` | Form validation |
| `<table>` | `<Table>` | Professional tables |
| Any label text | `<label className="...">` | Consistent styling |

---

## Tailwind Classes to Use

### Spacing (use consistently)

```tsx
// Padding
<div className="p-4">16px padding all sides</div>
<div className="px-6 py-4">16px x, 16px y</div>

// Margin
<div className="mb-4">16px bottom margin</div>
<div className="mt-6">24px top margin</div>

// Gap (for flex/grid)
<div className="flex gap-4">16px gap between items</div>
```

### Text Colors (predefined)

```tsx
// Primary text (dark gray/black)
<p className="text-gray-900">Main text</p>

// Secondary text
<p className="text-gray-600">Secondary text</p>

// Muted text
<p className="text-gray-500">Muted/hint text</p>

// Semantic colors
<span className="text-red-600">Error</span>
<span className="text-green-600">Success</span>
<span className="text-orange-600">Warning</span>
<span className="text-blue-600">Info</span>
```

### Layouts (responsive)

```tsx
// Vertical stack with spacing
<div className="space-y-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

// Horizontal layout
<div className="flex gap-4">
  <div>Left</div>
  <div>Right</div>
</div>

// Grid layout (1 col on mobile, 2 on tablet, 3 on desktop)
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

---

## Checklist: How to Update a Page

Use this checklist for each page you update:

- [ ] Import components from `@/components/ui`
- [ ] Wrap content in `<Container>`
- [ ] Use `<Card>` for card-like sections
- [ ] Use `<CardHeader>` + `<CardTitle>` for titles
- [ ] Use `<Button>` for all buttons
- [ ] Use `<Select>` for dropdowns
- [ ] Use `<Input>` for text inputs
- [ ] Use `<Table>` for data tables
- [ ] Apply spacing with Tailwind classes (gap, p, m, etc.)
- [ ] Test on mobile (responsive)
- [ ] Verify all buttons are clickable
- [ ] Check text readability (contrast)
- [ ] Build and verify no errors (`npm run build`)

---

## Example Page: Update Landing Page

Current landing page might look like:

```tsx
// app/app/page.tsx
export default function Home() {
  return (
    <div>
      <div className="bg-white p-8">
        <h1 className="text-4xl font-bold mb-4">
          Zoning Reform Analysis
        </h1>
        <p className="text-xl mb-6">
          Explore the impact of zoning reforms
        </p>
        <button className="bg-blue-600 text-white px-6 py-3 rounded">
          Get Started
        </button>
      </div>
    </div>
  )
}
```

Updated version:

```tsx
import { Container, Card, CardHeader, CardTitle, CardContent, CardFooter, Button } from '@/components/ui'

export default function Home() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <Container maxWidth="lg" className="py-12">
        <Card variant="elevated" className="text-center">
          <CardHeader>
            <CardTitle level="h1" className="text-5xl">
              Zoning Reform Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explore the impact of zoning reforms on housing development across the United States
            </p>
          </CardContent>
          <CardFooter className="justify-center gap-4">
            <Button variant="primary" size="lg">
              Get Started
            </Button>
            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </CardFooter>
        </Card>
      </Container>
    </div>
  )
}
```

**Improvements:**
- Professional Card layout
- Better typography hierarchy
- Consistent spacing
- Multiple button styles
- Responsive design
- Accessible focus states

---

## How to Test Updates

After updating a page:

1. **Build**
   ```bash
   npm run build
   ```
   Should show zero errors

2. **Run locally**
   ```bash
   npm run dev
   ```

3. **Check in browser**
   - Visit `http://localhost:3000/dashboard` (or your page)
   - Verify it looks professional
   - Check mobile view (F12, toggle device toolbar)
   - Click all buttons
   - Test form inputs

4. **Verify accessibility**
   - Press Tab to navigate (focus ring should be visible)
   - Can you read all text clearly?
   - Colors have good contrast?

---

## Common Patterns

### Card with Title and Button
```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content here</CardContent>
  <CardFooter>
    <Button variant="primary">Action</Button>
  </CardFooter>
</Card>
```

### Form with Multiple Inputs
```tsx
<Card>
  <CardHeader>
    <CardTitle>Form</CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    <Input label="Name" placeholder="Enter name" />
    <Select label="Category">
      <option>Select...</option>
    </Select>
  </CardContent>
  <CardFooter>
    <Button variant="primary">Submit</Button>
  </CardFooter>
</Card>
```

### Data Display Table
```tsx
<Card>
  <CardHeader>
    <CardTitle>Results</CardTitle>
  </CardHeader>
  <CardContent>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Column 1</TableHead>
          <TableHead>Column 2</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Data 1</TableCell>
          <TableCell>Data 2</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </CardContent>
</Card>
```

---

## Status & Next Steps

✅ Design system components created
✅ All components tested and compiling
⏳ **Next: Update pages to use these components**

### Which Pages Should I Update First?

**For Maximum Impact, Update These First:**

1. **Landing Page** (`app/app/page.tsx`) - Most visible
2. **Dashboard** (`app/app/dashboard/page.tsx`) - Core feature
3. **Scenario** (`app/app/scenario/page.tsx`) - User interaction

These three updates will transform the entire app's appearance.

---

## Documentation References

- **Component Library:** `app/components/ui/README.md`
- **Design System:** `DESIGN_SYSTEM_ZERO_COST.md`
- **Component Imports:** `app/components/ui/index.ts`

---

## Questions?

All components are in `app/components/ui/`
All use only Tailwind CSS - no external dependencies
All are responsive and accessible by default

Ready to update pages? Start with the example above!

