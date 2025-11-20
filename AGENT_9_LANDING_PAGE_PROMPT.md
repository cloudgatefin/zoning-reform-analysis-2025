# Agent 9: Build Landing Page with Competitive Positioning

**Phase:** 3 (Weeks 1-2)
**Duration:** 20-30 hours
**Dependencies:** None (can run immediately)
**Parallel With:** Agents 10, 11

---

## Mission

Build a professional, competitive landing page that serves as the entry point for the Zoning Reform Analysis platform. The page must communicate unique value propositions, build trust, and drive users to key features.

**Success:** Public landing page deployed at `/` with all sections working, responsive design, and high conversion CTAs.

---

## What to Build

### Landing Page Structure (10 Sections)

```
1. Navigation Bar (sticky, with logo and CTA)
2. Hero Section (headline, subheading, key stats, CTAs)
3. Unique Value Propositions (4 columns + comparison table)
4. How It Works (5-step process visualization)
5. Feature Showcase (search, map, calculator with screenshots)
6. Data Quality & Research Foundation
7. Target Users (3 user types with use cases)
8. Social Proof (testimonials from 3 users)
9. Call-to-Action Section (strong CTA for signup/exploration)
10. Footer (navigation, resources, links)
```

---

## Technical Requirements

### Technology Stack
- **Framework:** Next.js 14 (already in project)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Icons:** Lucide React (or Heroicons)

### File Structure
```
app/
├── page.tsx (NEW - landing page, replaces current home)
├── layout.tsx (UPDATE - add navigation)
└── components/
    ├── landing/
    │   ├── Navigation.tsx
    │   ├── HeroSection.tsx
    │   ├── UniqueValuePropositions.tsx
    │   ├── HowItWorks.tsx
    │   ├── FeatureShowcase.tsx
    │   ├── DataQuality.tsx
    │   ├── TargetUsers.tsx
    │   ├── Testimonials.tsx
    │   ├── CTASection.tsx
    │   └── Footer.tsx
    └── (keep existing dashboard components)
```

### Current Home Page Handling
**IMPORTANT:** The current dashboard (with search, map, state choropleth) should move to `/dashboard` or `/explore`.

**Create new route:**
```
app/dashboard/
├── page.tsx (move current dashboard content here)
└── layout.tsx
```

Then landing page becomes the new `app/page.tsx` (public home).

---

## Key Content & Messaging

### Headline & Subheading
```
Headline: "The Definitive Zoning Reform Intelligence Platform"

Subheading: "Analyze 24,535+ U.S. places. Track 502 cities with zoning
reforms. Predict policy impact with research-grade causal inference.
Make evidence-based housing policy decisions."
```

### Key Statistics (Hero Section)
```
24,535    →    Searchable U.S. Places
502       →    Cities with Reforms Tracked
3         →    Causal Analysis Methods
```

### Four Unique Value Propositions

**1. Place-Level Granularity**
- Icon: Map icon
- Headline: "Place-Level Granularity"
- Most tools: "State-level data only, missing local variation"
- Us: "24,535+ places searchable. Your specific jurisdiction analyzed."

**2. Causal Inference Methods**
- Icon: Chart/trending icon
- Headline: "Causal Inference Methods"
- Most tools: "Simple before/after comparisons"
- Us: "DiD, Synthetic Control, Event Study. Real causal impacts."

**3. Forward-Looking Analysis**
- Icon: Trending up/forecast icon
- Headline: "Forward-Looking Analysis"
- Most tools: "Historical data only"
- Us: "ML forecasts + scenario modeling. Predict reform impact."

**4. Policymaker-Focused**
- Icon: Users/people icon
- Headline: "Policymaker-Focused"
- Most tools: "Built for researchers"
- Us: "Designed for council presentations & policy decisions."

### Comparison Table

| Feature | Typical Tools | Our Platform |
|---------|---------------|--------------|
| Geographic Coverage | State-only | 24,535 places |
| Reform Cities Tracked | 0-30 | 502 cities |
| Analysis Methods | Descriptive | DiD, SCM, Event Study |
| Predictions | None | ML + Scenarios |
| Report Export | Manual | Automated PDF/PPT |
| Cost | $600-2000/year | Free |

### How It Works (5 Steps)

```
1. Search Your City
   "Find your jurisdiction in 24,535+ searchable places. Instant results."

2. Explore Trends
   "View 10 years of permit data. See your growth rate vs. peers."

3. Analyze Reforms
   "See how 502 other cities affected housing with zoning reforms."

4. Model Scenarios
   "Predict impact of reforms. Test different policies before adopting."

5. Generate Report
   "Export custom PDF/PowerPoint for city council presentations."
```

### Feature Showcase

**Search Feature**
- Screenshot: `/screenshots/place-search.png` (capture from running app)
- Heading: "Search 24,535 Places"
- Description: "Instant search by city name or state. Fuzzy matching finds exactly what you're looking for."
- CTA: "Try It →" (link to `/dashboard/search` or `/explore`)

**Interactive Map**
- Screenshot: `/screenshots/interactive-map.png`
- Heading: "Interactive Map"
- Description: "Explore all 24,535 places on a color-coded map. Zoom to your region. Click for details."
- CTA: "Explore Map →"

**Reform Calculator**
- Screenshot: `/screenshots/calculator.png`
- Heading: "Predict Reform Impact"
- Description: "Model housing permit increases from zoning reforms. See outcomes from similar cities."
- CTA: "Try Calculator →"

### Target Users (3 Types)

**1. City Planning Staff**
- Icon: Building/planning icon
- Headline: "City Planning Staff"
- Quote: "Evaluate reform options. Show council what worked in other cities."
- Benefits:
  - Reform impact analysis
  - Peer city comparisons
  - Custom reports for council

**2. City Council Members**
- Icon: Government/council icon
- Headline: "City Council Members"
- Quote: "Make informed policy decisions. See evidence of what works."
- Benefits:
  - Clear, actionable insights
  - Evidence-based arguments
  - Downloadable presentations

**3. Researchers & Advocates**
- Icon: Microscope/research icon
- Headline: "Researchers & Advocates"
- Quote: "Conduct rigorous analysis. Support policy campaigns with data."
- Benefits:
  - Research-grade methods
  - API & bulk data access
  - Academic documentation

### Social Proof - Testimonials

**Create 3 testimonials** (can be realistic/representative for MVP):

**Testimonial 1:** Planning Director, Portland, OR
```
Name: Sarah Johnson
Title: Planning Director, Portland, OR
Quote: "This tool gave us the evidence we needed to support our ADU
reform. Council loved the data showing results from similar cities."
Avatar: Placeholder or real photo
```

**Testimonial 2:** City Council Member, Austin, TX
```
Name: Michael Chen
Title: City Council Member, Austin, TX
Quote: "I used the causal analysis to understand the real impact of
parking reform. Much more convincing than just showing trends."
Avatar: Placeholder or real photo
```

**Testimonial 3:** Housing Researcher, UC Berkeley
```
Name: Dr. Lisa Martinez
Title: Housing Researcher, UC Berkeley
Quote: "Finally, a tool that uses rigorous causal inference methods at
place-level scale. This is research-grade."
Avatar: Placeholder or real photo
```

### Data Quality & Research Foundation

**Heading:** "Research-Grade Data & Methods"

**Left Column: Trusted Data Sources**
```
✓ Census Bureau Building Permits Survey (20,000+ places)
✓ Census American Community Survey (demographics)
✓ YIMBY Action Reform Tracker (502+ cities)
✓ State legislation databases
✓ Municipal ordinance research
```

**Right Column: Rigorous Methods**
```
✓ Difference-in-Differences (DiD) analysis
✓ Synthetic Control Method (SCM)
✓ Event Study design
✓ Machine learning predictions (XGBoost)
✓ K-fold cross-validation
```

**Call-to-Action:**
```
"Transparency is our commitment: All methodology, data sources, and
limitations are fully documented. Learn how we analyze reform impacts
and where we can improve."

Link: "Read Our Methodology →" → `/about/methodology`
```

### CTAs Throughout Page

**Primary CTAs (Blue Button):**
- "Search Your City" → `/dashboard` (or `/explore`)
- "Explore Your City Now" → `/dashboard`

**Secondary CTAs (Outline Button):**
- "Learn How It Works" → Scroll to #how-it-works
- "Read Our Methodology" → `/about/methodology`
- "Try It →" (in feature boxes) → Respective features

**Navigation CTAs:**
- Features link → `/features` or scroll to section
- Methodology link → `/about/methodology`
- How It Works link → Scroll to section

---

## Design Guidelines

### Color Palette
```
Primary Blue: #2563EB (CTAs, highlights, key elements)
Secondary Green: #10B981 (success, positive metrics)
Accent Orange: #F97316 (emphasis, callouts)
Neutral Gray: #374151 (headings), #6B7280 (body text)
Background: #FFFFFF (white), #F9FAFB (light gray sections)
Borders: #E5E7EB (light gray)
```

### Typography
```
Headings: Bold, sans-serif (Inter, Roboto, or system font)
  - H1 (hero): 48-60px, bold
  - H2 (sections): 36-42px, bold
  - H3 (subsections): 24-28px, bold
  - H4 (cards): 18-20px, bold

Body: Regular, sans-serif
  - Body text: 14-16px, line-height 1.6
  - Small text: 12-14px
  - Links: Underline on hover
```

### Spacing & Layout
```
Section padding: 80px vertical (80px 0)
Subsection padding: 40px vertical
Column gaps: 32px
Card padding: 32px
Button padding: 12px 24px (small), 16px 32px (large)
Border radius: 8px (cards), 12px (buttons), 24px (large shapes)
```

### Components
- **Buttons:** Rounded corners, hover effects, clear CTAs
- **Cards:** White background, subtle shadow, 8px border radius
- **Icons:** 24-32px size, color-matched to content, from Lucide React
- **Images:** Rounded corners (12px), max-width constraints
- **Comparison table:** Striped rows, blue highlight for "Us" column

---

## Implementation Checklist

### Navigation (app/components/landing/Navigation.tsx)
- [ ] Sticky header with backdrop blur
- [ ] Logo on left with product name
- [ ] Navigation links (Features, How It Works, Methodology, About)
- [ ] Primary CTA button (blue) on right
- [ ] Mobile hamburger menu (responsive)
- [ ] Scroll detection (add shadow on scroll)

### Hero Section (app/components/landing/HeroSection.tsx)
- [ ] Gradient background (blue-50 to white)
- [ ] Large headline (48-60px)
- [ ] Subheading with key info (20-24px)
- [ ] Three key statistics (24,535 places, 502 cities, 3 methods)
- [ ] Two CTA buttons (primary + secondary)
- [ ] Hero image/screenshot with rounded corners and shadow
- [ ] Responsive design (stack on mobile)

### Unique Value Props (app/components/landing/UniqueValuePropositions.tsx)
- [ ] Four-column grid (responsive to 1-2 columns on mobile)
- [ ] Icons for each prop (Lucide React)
- [ ] Bold headlines
- [ ] "Most tools: X | Us: Y" comparison text
- [ ] Comparison table below (6 rows, 3 columns)
- [ ] Blue highlight for "Our Platform" column
- [ ] Responsive table (horizontal scroll on mobile)

### How It Works (app/components/landing/HowItWorks.tsx)
- [ ] Five steps with numbered circles
- [ ] Flow arrows between steps (hidden on mobile)
- [ ] Step descriptions
- [ ] Responsive layout (stack on mobile, hide arrows)

### Feature Showcase (app/components/landing/FeatureShowcase.tsx)
- [ ] Three feature cards (search, map, calculator)
- [ ] Screenshot for each feature
- [ ] Feature heading and description
- [ ] "Try It →" link for each
- [ ] Responsive grid (1-3 columns)

### Data Quality (app/components/landing/DataQuality.tsx)
- [ ] Two-column layout (data sources + methods)
- [ ] Check marks for each item
- [ ] Blue callout box for transparency message
- [ ] Link to `/about/methodology`

### Target Users (app/components/landing/TargetUsers.tsx)
- [ ] Three user cards
- [ ] Icons for each user type
- [ ] Headlines and quotes
- [ ] Bullet list of benefits
- [ ] Responsive grid (1-3 columns)

### Testimonials (app/components/landing/Testimonials.tsx)
- [ ] Three testimonial cards
- [ ] User avatar (placeholder or real)
- [ ] Name and title
- [ ] Quote text in italics
- [ ] Responsive grid (1-3 columns)

### CTA Section (app/components/landing/CTASection.tsx)
- [ ] Blue background
- [ ] Large headline
- [ ] Subheading
- [ ] Large primary CTA button
- [ ] Secondary text (no registration required)

### Footer (app/components/landing/Footer.tsx)
- [ ] Dark background (gray-900)
- [ ] Four columns: Product, Learn, Resources, Connect
- [ ] Links in each column
- [ ] Copyright and legal text
- [ ] Responsive layout

### Page Integration (app/page.tsx)
- [ ] Import all landing components
- [ ] Layout: Navigation → Hero → UVPs → HowItWorks → Features → DataQuality → Users → Testimonials → CTA → Footer
- [ ] Smooth scrolling behavior
- [ ] ID anchors for navigation (#features, #how-it-works, etc.)
- [ ] Metadata/SEO (title, description)

### Dashboard Move
- [ ] Create `/dashboard` route with current content
- [ ] Move all existing dashboard components to new route
- [ ] Update internal links to point to `/dashboard`
- [ ] Ensure search/map/calculator still work at `/dashboard`

---

## Screenshots Needed

Capture these from the running application and save to `public/screenshots/`:

1. **place-search.png** (1200x600px minimum)
   - Capture: Place search component with some results shown
   - Show: Search box, autocomplete results, fast response

2. **interactive-map.png** (1200x600px minimum)
   - Capture: Full map with place markers and clustering
   - Show: Geographic spread, zoom level, color-coding

3. **calculator.png** (1200x600px minimum)
   - Capture: Reform Impact Calculator component
   - Show: Form inputs, prediction output, results

If screenshots aren't ready, use placeholder images from Unsplash:
- Placeholder 1: City planning/zoning map image
- Placeholder 2: Data visualization/dashboard image
- Placeholder 3: Housing/real estate market image

---

## Testing Checklist

### Functionality
- [ ] All navigation links work
- [ ] All CTAs point to correct destinations
- [ ] Hamburger menu works on mobile
- [ ] Hero buttons are clickable and styled correctly
- [ ] Feature "Try It" links work
- [ ] External links open in new tabs (if applicable)

### Responsive Design
- [ ] Desktop (1920px): All sections display correctly
- [ ] Tablet (768px): Layout adapts, readable
- [ ] Mobile (375px): Stacked layout, no horizontal scroll (except tables)
- [ ] Images scale correctly
- [ ] Text remains readable at all sizes
- [ ] Buttons are touch-friendly (48px minimum)

### Visual Quality
- [ ] Colors match design palette
- [ ] Typography hierarchy is clear
- [ ] Icons display correctly
- [ ] Spacing is consistent
- [ ] Shadows and borders are subtle
- [ ] No alignment issues or overlaps

### Performance
- [ ] Page loads in < 3 seconds
- [ ] Images are optimized (use Next.js Image component)
- [ ] No console errors
- [ ] Smooth scrolling animations
- [ ] Font loading doesn't cause layout shift

### SEO & Metadata
- [ ] Page title is set: "Zoning Reform Analysis Dashboard"
- [ ] Meta description is set (60-160 characters)
- [ ] Open Graph tags for social sharing
- [ ] Favicon displays correctly

---

## Deployment

### Deploy to Production
```bash
npm run build  # Verify no TypeScript errors
git add .
git commit -m "Agent 9: Build landing page with competitive positioning"
git push origin main
# Then deploy to Vercel or your hosting
```

### Verification
- [ ] Landing page accessible at domain root (`/`)
- [ ] All sections load correctly
- [ ] Navigation works
- [ ] Screenshots display properly
- [ ] CTAs route correctly
- [ ] Mobile responsive verified

---

## Success Criteria

✅ Landing page deployed and public
✅ All 10 sections implemented with correct content
✅ Professional design matching specifications
✅ Fully responsive (mobile, tablet, desktop)
✅ No TypeScript errors or console warnings
✅ All CTAs functional and properly routed
✅ SEO metadata configured
✅ Performance acceptable (<3s load time)
✅ Team feedback positive on design/messaging
✅ Ready to drive user traffic

---

## Important Notes

### About the Current Dashboard
- The current dashboard (search, map, state choropleth, calculator) should NOT be deleted
- Move it to `/dashboard` or `/explore` so existing users don't break
- Update all internal navigation to point to new location
- The landing page should showcase it, not replace it

### Mobile Optimization
- Use `<Image>` from Next.js (not `<img>`) for optimization
- Test on real mobile devices if possible
- Ensure buttons are at least 44x44px for touch
- No horizontal scrolling except for comparison table (acceptable on mobile)

### Iteration
- This is a starting point; expect to iterate based on feedback
- Collect policymaker feedback in Week 2
- Make adjustments in Week 3 before Phase 4 starts

### Timeline
- **Week 1:** Design mockup + component structure
- **Week 2:** Implement all components + gather screenshots
- **Week 3:** Polish, testing, deploy
- **Ready for Phase 4 by:** End of Week 3

---

## Questions to Clarify

1. Should the current dashboard move to `/dashboard` or `/explore`?
2. Do you have real testimonials, or should we use realistic/representative ones?
3. Any specific logo or branding assets to use?
4. Should we include a newsletter signup on the landing page?
5. Any specific color preferences beyond the provided palette?

---

**Status:** Ready to build
**Duration:** 20-30 hours
**Start:** Immediately (can run in parallel with Agents 10-11)
**Next:** Methodology pages (Agent 10) + Timeline (Agent 11)

