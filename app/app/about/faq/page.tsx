"use client"

import { Metadata } from "next"
import { FAQAccordion } from "@/components/about"

const faqCategories = [
  {
    title: "About the Tool",
    items: [
      {
        question: "What is this platform and who built it?",
        answer: "The Zoning Reform Analysis Dashboard is an open-source tool that helps policymakers analyze how zoning reforms affect housing production. It was built using Census data and academic methods. We believe housing policy should be evidence-based and transparent."
      },
      {
        question: "Why would I use this instead of other tools?",
        answer: "Other tools focus on state-level analysis. We analyze 24,535+ places so you can find YOUR jurisdiction. We also use research-grade causal inference methods coming in Phase 4. And it's free with no paywalls."
      },
      {
        question: "Who should use this tool?",
        answer: "City planning staff evaluating reforms, city council members voting on housing policy, state legislators tracking state trends, researchers studying zoning, and housing advocates supporting policy campaigns."
      },
      {
        question: "Is this tool available for my jurisdiction?",
        answer: "We have data for 24,535 U.S. places (cities, towns, CDPs). Search by name to see if your jurisdiction is included. Even if not listed separately, you can explore your county or region."
      }
    ]
  },
  {
    title: "Data Quality",
    items: [
      {
        question: "How recent is the permit data?",
        answer: "Census Building Permits Survey is released monthly with a 1-2 month lag. So in November, you can see September data. We update our platform monthly."
      },
      {
        question: "Is Census permit data accurate?",
        answer: "Yes, Census data is high-quality government statistics. However, some small places report inconsistently. We flag these issues. Permits are what's issued, not what's actually built."
      },
      {
        question: "How complete is your reforms database?",
        answer: "We've documented 502 cities with zoning reforms. This is likely incomplete - there are probably more. We continue adding reforms as we identify them. Submit your city's reform if it's missing."
      },
      {
        question: "Why is economic data from 5 years ago?",
        answer: "Census American Community Survey releases annual data with a 1-year lag. So 2024 data comes out in late 2025. Older data is fine for characteristics like median income (don't change quickly)."
      }
    ]
  },
  {
    title: "Using the Platform",
    items: [
      {
        question: "How do I search for my city?",
        answer: "Use the Search feature at /explore. Start typing your city name. If it's in Census data, it will appear. Results include current permits, growth rate, state/national rank."
      },
      {
        question: "What does 'Growth Rate (5-year)' mean?",
        answer: "Average permits 2020-2024 divided by average permits 2015-2019. So if 2.0x, you doubled permits in the recent period vs. the previous 5 years. 0.5x means you're at half the historical rate."
      },
      {
        question: "How do I use the calculator?",
        answer: "Go to /calculator. Select a reform type, then your city. The tool predicts how many additional permits you might expect. Remember: this is a starting point, not a guarantee."
      },
      {
        question: "Can I download data for my analysis?",
        answer: "Yes, we plan to offer bulk data downloads. For now, you can screenshot charts or request data directly."
      }
    ]
  },
  {
    title: "Interpreting Results",
    items: [
      {
        question: "Why is my city's prediction so uncertain?",
        answer: "Reforms work differently in different cities. The wider the band, the more uncertain. Use this to plan scenarios: optimistic, realistic, pessimistic. Pick the scenario that fits your expectations."
      },
      {
        question: "My city is really different from the comparables. Should I trust the prediction?",
        answer: "No, not completely. If your city is unique (tiny town, shrinking, unusual market), our average prediction probably doesn't fit. Use this as a starting point. Supplement with local expertise."
      },
      {
        question: "The calculator says X% increase, but we had Y% after reform. Why the difference?",
        answer: "Multiple reasons: (1) We're predicting average, your city is unique, (2) Other factors besides reform affected permits (economy, regulations), (3) Time since reform is short, effects grow over time. Good feedback - share it!"
      }
    ]
  },
  {
    title: "Reforms & Predictions",
    items: [
      {
        question: "What reform types do you track?",
        answer: "ADU legalization, parking minimum elimination, height/density limits, upzoning, lot splits, duplex legalization, and others. We're continuously expanding. Submit your reform type if it's missing."
      },
      {
        question: "Can you predict combined reforms (e.g., ADU + parking)?",
        answer: "Not yet. Current tool predicts individual reforms. Phase 4 will add scenario modeling for combined reforms. For now, use the single-reform predictions as building blocks."
      },
      {
        question: "How long does it take to see reform effects?",
        answer: "Effects vary. Some reforms show up immediately in permits. Others take 2-3 years as developers understand new opportunities. Very few show effects after 5+ years."
      },
      {
        question: "We adopted a reform but didn't get more permits. What went wrong?",
        answer: "Many possible reasons: (1) Zoning wasn't actually the bottleneck (cost, land supply, local opposition), (2) Too soon (effects need 1-3 years), (3) Implementation barriers (hard to build, parking still required), (4) Market conditions changed. This is normal. Case studies help."
      }
    ]
  },
  {
    title: "Technical Details",
    items: [
      {
        question: "What's the R² of your model?",
        answer: "About 0.2-0.4 (estimated). Not great, but better than random guessing. Means model explains 20-40% of variation in permit increases. Remaining variation is due to local factors we can't measure."
      },
      {
        question: "How do you handle seasonality?",
        answer: "We use annual aggregates, so seasonal variation averages out. Permits are counted by year issued, not by season. Some cities have boom/bust cycles, which our yearly data smooths."
      },
      {
        question: "Do you use machine learning?",
        answer: "Yes, Random Forest regression. Non-parametric, finds non-linear patterns, provides feature importance. In Phase 4, we'll add more rigorous causal methods (DiD, SCM) alongside ML."
      }
    ]
  }
]

export default function FAQPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
          Frequently Asked Questions
        </h1>
        <p className="text-[var(--text-muted)]">
          Common questions from policymakers about the platform, data, and predictions.
          Can&apos;t find your answer? Check our{" "}
          <a href="/about/methodology" className="text-[var(--accent-blue)] hover:underline">
            Methodology
          </a>{" "}
          page.
        </p>
      </div>

      {/* FAQ Accordion */}
      <FAQAccordion categories={faqCategories} />

      {/* Footer */}
      <div className="border-t border-[var(--border-default)] pt-6 mt-8">
        <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg p-4">
          <h3 className="font-semibold text-[var(--text-primary)] mb-2">Still have questions?</h3>
          <p className="text-sm text-[var(--text-muted)]">
            For technical details, see our{" "}
            <a href="/about/methodology" className="text-[var(--accent-blue)] hover:underline">
              Methodology
            </a>{" "}
            and{" "}
            <a href="/about/data-sources" className="text-[var(--accent-blue)] hover:underline">
              Data Sources
            </a>{" "}
            pages. For known issues, check our{" "}
            <a href="/about/limitations" className="text-[var(--accent-blue)] hover:underline">
              Limitations
            </a>{" "}
            page.
          </p>
        </div>
      </div>
    </div>
  )
}
