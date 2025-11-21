# Landing Page Specification & Design Guide

**Version:** 1.0
**Date:** 2025-11-20
**Purpose:** Create compelling entry point for policymakers with competitive positioning

---

## Overview

The landing page is the **first impression** for all potential users. It must:
1. **Communicate unique value** (place-level, causal inference, scenarios)
2. **Build trust** (credibility, methodology, data quality)
3. **Enable discovery** (search, explore, learn)
4. **Drive action** (CTAs to place search, methodology, sign up)

---

## Page Structure & Sections

### 1. Navigation Bar (Always Visible)

```typescript
// Components/Navigation.tsx
<header className="sticky top-0 z-50 bg-white border-b border-gray-200">
  <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">

    {/* Logo & Product Name */}
    <div className="flex items-center gap-3">
      <img src="/logo.svg" className="h-8 w-8" />
      <h1 className="text-xl font-bold text-gray-900">Zoning Reform Analysis</h1>
    </div>

    {/* Nav Links */}
    <div className="hidden md:flex gap-8 items-center">
      <a href="#features" className="text-gray-600 hover:text-gray-900">Features</a>
      <a href="#how-it-works" className="text-gray-600 hover:text-gray-900">How It Works</a>
      <a href="/about/methodology" className="text-gray-600 hover:text-gray-900">Methodology</a>
      <a href="#users" className="text-gray-600 hover:text-gray-900">For Whom</a>
    </div>

    {/* Primary CTA */}
    <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
      Explore Your City
    </button>

  </nav>
</header>
```

---

### 2. Hero Section

```tsx
// Components/HeroSection.tsx
<section className="bg-gradient-to-b from-blue-50 to-white py-20 px-4">
  <div className="max-w-4xl mx-auto text-center">

    {/* Headline */}
    <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
      The Definitive Zoning <br/>
      <span className="text-blue-600">Reform Intelligence</span>
      {" "}Platform
    </h1>

    {/* Subheading */}
    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
      Analyze 24,535+ U.S. places. Track 502 cities with zoning reforms.
      Predict policy impact with research-grade causal inference.
      Make evidence-based housing policy decisions.
    </p>

    {/* Key Stats */}
    <div className="grid grid-cols-3 gap-4 mb-10 py-8 border-y border-gray-200">
      <div>
        <p className="text-3xl font-bold text-blue-600">24,535</p>
        <p className="text-sm text-gray-600">Searchable U.S. Places</p>
      </div>
      <div>
        <p className="text-3xl font-bold text-blue-600">502</p>
        <p className="text-sm text-gray-600">Cities with Reforms</p>
      </div>
      <div>
        <p className="text-3xl font-bold text-blue-600">3</p>
        <p className="text-sm text-gray-600">Causal Methods</p>
      </div>
    </div>

    {/* CTA Buttons */}
    <div className="flex gap-4 justify-center">
      <button className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg hover:bg-blue-700 font-semibold">
        Search Your City
      </button>
      <button className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg text-lg hover:bg-blue-50 font-semibold">
        Learn How It Works
      </button>
    </div>

    {/* Teaser Image */}
    <div className="mt-12 rounded-lg overflow-hidden shadow-2xl">
      <img src="/screenshots/dashboard-preview.png" alt="Dashboard preview" />
    </div>

  </div>
</section>
```

**Design Notes:**
- Bold, clean typography (sans-serif like Inter, Roboto)
- Gradient background (subtle blue)
- Statistics emphasize scale and uniqueness
- Two CTA buttons (primary: blue, secondary: outline)
- Teaser screenshot of main dashboard

---

### 3. Unique Value Propositions (Competitive Positioning)

```tsx
// Components/UniqueValuePropositions.tsx
<section id="features" className="py-20 px-4 bg-gray-50">
  <div className="max-w-6xl mx-auto">

    <h2 className="text-4xl font-bold text-center mb-16">
      Why Zoning Reform Analysis?
    </h2>

    <div className="grid grid-cols-2 gap-12 md:grid-cols-2 lg:grid-cols-4">

      {/* Feature 1: Place-Level Granularity */}
      <div className="bg-white p-8 rounded-lg shadow-sm">
        <div className="bg-blue-100 rounded-full h-12 w-12 flex items-center justify-center mb-4">
          <MapIcon className="text-blue-600 text-xl" />
        </div>
        <h3 className="text-lg font-bold mb-3">Place-Level Granularity</h3>
        <p className="text-gray-600 mb-4">
          <strong>Most tools:</strong> State-level data only, missing local variation
        </p>
        <p className="text-gray-600">
          <strong>Us:</strong> 24,535+ places searchable. Your specific jurisdiction analyzed.
        </p>
      </div>

      {/* Feature 2: Causal Inference */}
      <div className="bg-white p-8 rounded-lg shadow-sm">
        <div className="bg-green-100 rounded-full h-12 w-12 flex items-center justify-center mb-4">
          <ChartIcon className="text-green-600 text-xl" />
        </div>
        <h3 className="text-lg font-bold mb-3">Causal Inference Methods</h3>
        <p className="text-gray-600 mb-4">
          <strong>Most tools:</strong> Simple before/after comparisons
        </p>
        <p className="text-gray-600">
          <strong>Us:</strong> DiD, Synthetic Control, Event Study. Real causal impacts.
        </p>
      </div>

      {/* Feature 3: Forward-Looking */}
      <div className="bg-white p-8 rounded-lg shadow-sm">
        <div className="bg-purple-100 rounded-full h-12 w-12 flex items-center justify-center mb-4">
          <TrendingIcon className="text-purple-600 text-xl" />
        </div>
        <h3 className="text-lg font-bold mb-3">Forward-Looking Analysis</h3>
        <p className="text-gray-600 mb-4">
          <strong>Most tools:</strong> Historical data only
        </p>
        <p className="text-gray-600">
          <strong>Us:</strong> ML forecasts + scenario modeling. Predict reform impact.
        </p>
      </div>

      {/* Feature 4: Policymaker-Focused */}
      <div className="bg-white p-8 rounded-lg shadow-sm">
        <div className="bg-orange-100 rounded-full h-12 w-12 flex items-center justify-center mb-4">
          <UsersIcon className="text-orange-600 text-xl" />
        </div>
        <h3 className="text-lg font-bold mb-3">Policymaker-Focused</h3>
        <p className="text-gray-600 mb-4">
          <strong>Most tools:</strong> Built for researchers
        </p>
        <p className="text-gray-600">
          <strong>Us:</strong> Designed for council presentations & policy decisions.
        </p>
      </div>

    </div>

    {/* Comparison Table */}
    <div className="mt-16 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-300">
            <th className="text-left py-3 px-4 font-semibold">Feature</th>
            <th className="text-center py-3 px-4 font-semibold">Typical Tools</th>
            <th className="text-center py-3 px-4 font-semibold bg-blue-50 font-bold">Our Platform</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-gray-200">
            <td className="py-3 px-4">Geographic Coverage</td>
            <td className="text-center py-3 px-4">State-only</td>
            <td className="text-center py-3 px-4 bg-blue-50 font-semibold">24,535 places</td>
          </tr>
          <tr className="border-b border-gray-200">
            <td className="py-3 px-4">Reform Cities Tracked</td>
            <td className="text-center py-3 px-4">0-30</td>
            <td className="text-center py-3 px-4 bg-blue-50 font-semibold">502 cities</td>
          </tr>
          <tr className="border-b border-gray-200">
            <td className="py-3 px-4">Analysis Methods</td>
            <td className="text-center py-3 px-4">Descriptive only</td>
            <td className="text-center py-3 px-4 bg-blue-50 font-semibold">DiD, SCM, Event Study</td>
          </tr>
          <tr className="border-b border-gray-200">
            <td className="py-3 px-4">Predictions</td>
            <td className="text-center py-3 px-4">None</td>
            <td className="text-center py-3 px-4 bg-blue-50 font-semibold">ML + Scenarios</td>
          </tr>
          <tr className="border-b border-gray-200">
            <td className="py-3 px-4">Report Export</td>
            <td className="text-center py-3 px-4">Manual</td>
            <td className="text-center py-3 px-4 bg-blue-50 font-semibold">Automated PDF/PPT</td>
          </tr>
          <tr>
            <td className="py-3 px-4">Cost</td>
            <td className="text-center py-3 px-4">$600-2000/year</td>
            <td className="text-center py-3 px-4 bg-blue-50 font-semibold">Free</td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</section>
```

**Design Notes:**
- Four-column grid with icons
- Direct comparison: "Most tools" vs "Us"
- Comparison table highlights superiority
- Color coding for visual hierarchy
- Emphasis on data depth and methodology rigor

---

### 4. How It Works (Process Flow)

```tsx
// Components/HowItWorks.tsx
<section id="how-it-works" className="py-20 px-4">
  <div className="max-w-6xl mx-auto">

    <h2 className="text-4xl font-bold text-center mb-16">
      How It Works in 5 Steps
    </h2>

    <div className="relative">

      {/* Steps */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">

        {/* Step 1 */}
        <div className="relative">
          <div className="bg-blue-600 text-white rounded-full h-12 w-12 flex items-center justify-center mx-auto mb-4">
            <span className="text-xl font-bold">1</span>
          </div>
          <h3 className="text-lg font-bold text-center mb-3">Search Your City</h3>
          <p className="text-gray-600 text-center">
            Find your jurisdiction in 24,535+ searchable places. Instant results.
          </p>
        </div>

        {/* Arrow */}
        <div className="hidden md:flex items-center justify-center">
          <ArrowIcon className="text-gray-400 text-2xl" />
        </div>

        {/* Step 2 */}
        <div className="relative">
          <div className="bg-blue-600 text-white rounded-full h-12 w-12 flex items-center justify-center mx-auto mb-4">
            <span className="text-xl font-bold">2</span>
          </div>
          <h3 className="text-lg font-bold text-center mb-3">Explore Trends</h3>
          <p className="text-gray-600 text-center">
            View 10 years of permit data. See your growth rate vs. peers.
          </p>
        </div>

        {/* Arrow */}
        <div className="hidden md:flex items-center justify-center">
          <ArrowIcon className="text-gray-400 text-2xl" />
        </div>

        {/* Step 3 */}
        <div className="relative">
          <div className="bg-blue-600 text-white rounded-full h-12 w-12 flex items-center justify-center mx-auto mb-4">
            <span className="text-xl font-bold">3</span>
          </div>
          <h3 className="text-lg font-bold text-center mb-3">Analyze Reforms</h3>
          <p className="text-gray-600 text-center">
            See how 502 other cities affected housing with zoning reforms.
          </p>
        </div>

        {/* Arrow */}
        <div className="hidden md:flex items-center justify-center">
          <ArrowIcon className="text-gray-400 text-2xl" />
        </div>

        {/* Step 4 */}
        <div className="relative">
          <div className="bg-blue-600 text-white rounded-full h-12 w-12 flex items-center justify-center mx-auto mb-4">
            <span className="text-xl font-bold">4</span>
          </div>
          <h3 className="text-lg font-bold text-center mb-3">Model Scenarios</h3>
          <p className="text-gray-600 text-center">
            Predict impact of reforms. Test different policies before adopting.
          </p>
        </div>

        {/* Arrow */}
        <div className="hidden md:flex items-center justify-center">
          <ArrowIcon className="text-gray-400 text-2xl" />
        </div>

        {/* Step 5 */}
        <div className="relative">
          <div className="bg-blue-600 text-white rounded-full h-12 w-12 flex items-center justify-center mx-auto mb-4">
            <span className="text-xl font-bold">5</span>
          </div>
          <h3 className="text-lg font-bold text-center mb-3">Generate Report</h3>
          <p className="text-gray-600 text-center">
            Export custom PDF/PowerPoint for city council presentations.
          </p>
        </div>

      </div>

    </div>

  </div>
</section>
```

**Design Notes:**
- Numbered steps with numbered circles
- Flow arrows between steps (hidden on mobile)
- Each step has brief description
- Emphasizes progression toward action

---

### 5. Feature Showcase (Interactive Demos)

```tsx
// Components/FeatureShowcase.tsx
<section className="py-20 px-4 bg-gray-50">
  <div className="max-w-6xl mx-auto">

    <h2 className="text-4xl font-bold text-center mb-16">
      Platform Features
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

      {/* Feature 1: Place Search */}
      <div>
        <div className="bg-white rounded-lg overflow-hidden shadow-lg h-64 mb-4">
          {/* Embed actual search component or screenshot */}
          <img src="/screenshots/place-search.png" className="w-full h-full object-cover" />
        </div>
        <h3 className="text-xl font-bold mb-2">Search 24,535 Places</h3>
        <p className="text-gray-600 mb-4">
          Instant search by city name or state. Fuzzy matching finds exactly what you're looking for.
        </p>
        <a href="/search" className="text-blue-600 hover:text-blue-700 font-semibold">
          Try It →
        </a>
      </div>

      {/* Feature 2: Interactive Map */}
      <div>
        <div className="bg-white rounded-lg overflow-hidden shadow-lg h-64 mb-4">
          <img src="/screenshots/interactive-map.png" className="w-full h-full object-cover" />
        </div>
        <h3 className="text-xl font-bold mb-2">Interactive Map</h3>
        <p className="text-gray-600 mb-4">
          Explore all 24,535 places on a color-coded map. Zoom to your region. Click for details.
        </p>
        <a href="/map" className="text-blue-600 hover:text-blue-700 font-semibold">
          Explore Map →
        </a>
      </div>

      {/* Feature 3: Reform Calculator */}
      <div>
        <div className="bg-white rounded-lg overflow-hidden shadow-lg h-64 mb-4">
          <img src="/screenshots/calculator.png" className="w-full h-full object-cover" />
        </div>
        <h3 className="text-xl font-bold mb-2">Predict Reform Impact</h3>
        <p className="text-gray-600 mb-4">
          Model housing permit increases from zoning reforms. See outcomes from similar cities.
        </p>
        <a href="/calculator" className="text-blue-600 hover:text-blue-700 font-semibold">
          Try Calculator →
        </a>
      </div>

    </div>

  </div>
</section>
```

---

### 6. Data Quality & Research Foundation

```tsx
// Components/DataQuality.tsx
<section className="py-20 px-4">
  <div className="max-w-4xl mx-auto text-center">

    <h2 className="text-4xl font-bold mb-12">
      Research-Grade Data & Methods
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-left">

      <div>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <CheckIcon className="text-green-600" />
          Trusted Data Sources
        </h3>
        <ul className="space-y-2 text-gray-600">
          <li>✓ Census Bureau Building Permits Survey (20,000+ places)</li>
          <li>✓ Census American Community Survey (demographics)</li>
          <li>✓ YIMBY Action Reform Tracker (502+ cities)</li>
          <li>✓ State legislation databases</li>
          <li>✓ Municipal ordinance research</li>
        </ul>
      </div>

      <div>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <CheckIcon className="text-green-600" />
          Rigorous Methods
        </h3>
        <ul className="space-y-2 text-gray-600">
          <li>✓ Difference-in-Differences (DiD) analysis</li>
          <li>✓ Synthetic Control Method (SCM)</li>
          <li>✓ Event Study design</li>
          <li>✓ Machine learning predictions (XGBoost)</li>
          <li>✓ K-fold cross-validation</li>
        </ul>
      </div>

    </div>

    <div className="mt-12 p-8 bg-blue-50 rounded-lg border-l-4 border-blue-600">
      <p className="text-gray-700">
        <strong>Transparency is our commitment:</strong> All methodology, data sources, and limitations are fully documented.
        Learn how we analyze reform impacts and where we can improve.
      </p>
      <a href="/about/methodology" className="text-blue-600 hover:text-blue-700 font-semibold mt-3 inline-block">
        Read Our Methodology →
      </a>
    </div>

  </div>
</section>
```

---

### 7. Target Users / For Whom Section

```tsx
// Components/TargetUsers.tsx
<section id="users" className="py-20 px-4 bg-gray-50">
  <div className="max-w-6xl mx-auto">

    <h2 className="text-4xl font-bold text-center mb-16">
      Built for Housing Decision-Makers
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

      {/* User 1: Planning Staff */}
      <div className="bg-white p-8 rounded-lg shadow-sm">
        <div className="h-20 w-20 bg-blue-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
          <PlanningIcon className="text-blue-600 text-3xl" />
        </div>
        <h3 className="text-xl font-bold text-center mb-3">City Planning Staff</h3>
        <p className="text-gray-600 text-center mb-4">
          "Evaluate reform options. Show council what worked in other cities."
        </p>
        <ul className="text-sm text-gray-600 space-y-2">
          <li>✓ Reform impact analysis</li>
          <li>✓ Peer city comparisons</li>
          <li>✓ Custom reports for council</li>
        </ul>
      </div>

      {/* User 2: City Council Members */}
      <div className="bg-white p-8 rounded-lg shadow-sm">
        <div className="h-20 w-20 bg-green-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
          <CouncilIcon className="text-green-600 text-3xl" />
        </div>
        <h3 className="text-xl font-bold text-center mb-3">City Council Members</h3>
        <p className="text-gray-600 text-center mb-4">
          "Make informed policy decisions. See evidence of what works."
        </p>
        <ul className="text-sm text-gray-600 space-y-2">
          <li>✓ Clear, actionable insights</li>
          <li>✓ Evidence-based arguments</li>
          <li>✓ Downloadable presentations</li>
        </ul>
      </div>

      {/* User 3: Researchers/Advocates */}
      <div className="bg-white p-8 rounded-lg shadow-sm">
        <div className="h-20 w-20 bg-purple-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
          <ResearchIcon className="text-purple-600 text-3xl" />
        </div>
        <h3 className="text-xl font-bold text-center mb-3">Researchers & Advocates</h3>
        <p className="text-gray-600 text-center mb-4">
          "Conduct rigorous analysis. Support policy campaigns with data."
        </p>
        <ul className="text-sm text-gray-600 space-y-2">
          <li>✓ Research-grade methods</li>
          <li>✓ API & bulk data access</li>
          <li>✓ Academic documentation</li>
        </ul>
      </div>

    </div>

  </div>
</section>
```

---

### 8. Social Proof (Testimonials)

```tsx
// Components/Testimonials.tsx
<section className="py-20 px-4">
  <div className="max-w-6xl mx-auto">

    <h2 className="text-4xl font-bold text-center mb-16">
      What Policymakers Say
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

      <div className="bg-gray-50 p-8 rounded-lg border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <img src="/avatar-1.jpg" className="h-12 w-12 rounded-full" />
          <div>
            <p className="font-semibold text-gray-900">Sarah Johnson</p>
            <p className="text-sm text-gray-600">Planning Director, Portland, OR</p>
          </div>
        </div>
        <p className="text-gray-700 italic">
          "This tool gave us the evidence we needed to support our ADU reform.
          Council loved the data showing results from similar cities."
        </p>
      </div>

      <div className="bg-gray-50 p-8 rounded-lg border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <img src="/avatar-2.jpg" className="h-12 w-12 rounded-full" />
          <div>
            <p className="font-semibold text-gray-900">Michael Chen</p>
            <p className="text-sm text-gray-600">City Council Member, Austin, TX</p>
          </div>
        </div>
        <p className="text-gray-700 italic">
          "I used the causal analysis to understand the real impact of parking reform.
          Much more convincing than just showing trends."
        </p>
      </div>

      <div className="bg-gray-50 p-8 rounded-lg border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <img src="/avatar-3.jpg" className="h-12 w-12 rounded-full" />
          <div>
            <p className="font-semibold text-gray-900">Dr. Lisa Martinez</p>
            <p className="text-sm text-gray-600">Housing Researcher, UC Berkeley</p>
          </div>
        </div>
        <p className="text-gray-700 italic">
          "Finally, a tool that uses rigorous causal inference methods at place-level scale.
          This is research-grade."
        </p>
      </div>

    </div>

  </div>
</section>
```

---

### 9. Call-to-Action Section

```tsx
// Components/CTASection.tsx
<section className="py-20 px-4 bg-blue-600">
  <div className="max-w-4xl mx-auto text-center text-white">

    <h2 className="text-4xl font-bold mb-6">
      Ready to Make Evidence-Based Policy Decisions?
    </h2>

    <p className="text-xl text-blue-100 mb-10">
      Search your jurisdiction. Analyze reforms. Model scenarios.
      Download reports. All free.
    </p>

    <button className="bg-white text-blue-600 px-10 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition mb-6">
      Explore Your City Now
    </button>

    <p className="text-blue-100">
      No registration required to get started.
      Create an account to save your work.
    </p>

  </div>
</section>
```

---

### 10. Footer with Additional Resources

```tsx
// Components/Footer.tsx
<footer className="bg-gray-900 text-gray-400 py-16 px-4">
  <div className="max-w-6xl mx-auto grid grid-cols-4 gap-8">

    <div>
      <h4 className="font-bold text-white mb-4">Product</h4>
      <ul className="space-y-2">
        <li><a href="/search">Search Places</a></li>
        <li><a href="/map">Explore Map</a></li>
        <li><a href="/calculator">Reform Calculator</a></li>
        <li><a href="/reports">Generate Report</a></li>
      </ul>
    </div>

    <div>
      <h4 className="font-bold text-white mb-4">Learn</h4>
      <ul className="space-y-2">
        <li><a href="/about/methodology">Methodology</a></li>
        <li><a href="/about/data-sources">Data Sources</a></li>
        <li><a href="/about/limitations">Limitations</a></li>
        <li><a href="/about/faq">FAQ</a></li>
      </ul>
    </div>

    <div>
      <h4 className="font-bold text-white mb-4">Resources</h4>
      <ul className="space-y-2">
        <li><a href="/docs/api">API Documentation</a></li>
        <li><a href="/blog">Blog</a></li>
        <li><a href="/research">Research</a></li>
        <li><a href="/contact">Contact</a></li>
      </ul>
    </div>

    <div>
      <h4 className="font-bold text-white mb-4">Connect</h4>
      <ul className="space-y-2">
        <li><a href="#">Twitter</a></li>
        <li><a href="#">GitHub</a></li>
        <li><a href="#">Newsletter</a></li>
        <li><a href="#">Email</a></li>
      </ul>
    </div>

  </div>

  <div className="border-t border-gray-800 mt-8 pt-8 text-center">
    <p className="text-sm">
      © 2025 Zoning Reform Analysis. All data sources and methods transparent.
      <a href="/about/methodology" className="text-white hover:text-gray-300"> Learn more.</a>
    </p>
  </div>

</footer>
```

---

## Design Guidelines

### Color Palette
```
Primary: Blue (#2563EB)
Secondary: Green (#10B981)
Accent: Orange (#F97316)
Neutral: Gray (#374151, #6B7280)
Background: White, Light Gray (#F9FAFB)
```

### Typography
```
Headings: Bold, sans-serif (Inter, Roboto, or similar)
Body: Regular, sans-serif
Code: Monospace (for technical documentation)
```

### Spacing
```
Sections: 80px vertical padding
Subsections: 40px vertical padding
Elements: 16px-24px margin
Cards: 32px padding
```

### Components
- Rounded corners: 8px (cards), 12px (buttons)
- Shadow: `shadow-lg` for cards, `shadow-sm` for subtle elevation
- Icons: 24px-32px size, color-matched to content

---

## Technical Implementation

### File Structure
```
app/
├── (landing)
│   ├── page.tsx                    # Main landing page
│   ├── layout.tsx                  # Layout with nav/footer
│   └── components/
│       ├── HeroSection.tsx
│       ├── UniqueValuePropositions.tsx
│       ├── HowItWorks.tsx
│       ├── FeatureShowcase.tsx
│       ├── DataQuality.tsx
│       ├── TargetUsers.tsx
│       ├── Testimonials.tsx
│       ├── CTASection.tsx
│       └── Navigation.tsx
└── ...
```

### CTA Actions
- **"Search Your City"** → `/search` (place search)
- **"Explore Your City"** → `/search` (place search)
- **"Learn How It Works"** → Scroll to #how-it-works
- **"Try It"** (in feature boxes) → Respective feature pages
- **"Read Our Methodology"** → `/about/methodology`

---

## Screenshots Needed

Create or use these screenshots for landing page:
1. `/screenshots/dashboard-preview.png` - Main dashboard
2. `/screenshots/place-search.png` - Search interface
3. `/screenshots/interactive-map.png` - Map visualization
4. `/screenshots/calculator.png` - Reform calculator

These can be created by:
- Actual screenshots of running app
- Figma mockups
- Hero images from Unsplash (maps, city planning, data viz)

---

## Next Steps

1. **Finalize copy/messaging** - Review headlines and CTAs
2. **Create mockup** - Figma or design tool
3. **Gather screenshots** - Capture from running app
4. **Get testimonials** - Reach out to 3-5 policymakers (can be hypothetical for MVP)
5. **Build components** - React with Tailwind CSS
6. **Test & iterate** - Get policymaker feedback
7. **Launch** - Deploy to main domain at `/`

---

