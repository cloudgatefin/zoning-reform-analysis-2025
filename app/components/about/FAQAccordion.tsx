"use client"

import { useState } from "react"

interface FAQItem {
  question: string
  answer: string
}

interface FAQCategory {
  title: string
  items: FAQItem[]
}

interface FAQAccordionProps {
  categories: FAQCategory[]
}

export function FAQAccordion({ categories }: FAQAccordionProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")

  const toggleItem = (id: string) => {
    const newOpenItems = new Set(openItems)
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id)
    } else {
      newOpenItems.add(id)
    }
    setOpenItems(newOpenItems)
  }

  const filteredCategories = categories.map(category => ({
    ...category,
    items: category.items.filter(item =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.items.length > 0)

  return (
    <div className="space-y-6">
      <div className="relative">
        <input
          type="text"
          placeholder="Search questions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-md text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-blue)]"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            ×
          </button>
        )}
      </div>

      {filteredCategories.map((category, categoryIndex) => (
        <div key={categoryIndex} className="space-y-3">
          <h3 className="text-md font-semibold text-[var(--text-primary)]">
            {category.title}
          </h3>
          <div className="space-y-2">
            {category.items.map((item, itemIndex) => {
              const itemId = `${categoryIndex}-${itemIndex}`
              const isOpen = openItems.has(itemId)
              return (
                <div
                  key={itemIndex}
                  className="border border-[var(--border-default)] rounded-md overflow-hidden"
                >
                  <button
                    onClick={() => toggleItem(itemId)}
                    className="w-full px-4 py-3 flex items-center justify-between text-left bg-[var(--bg-card)] hover:bg-[var(--bg-card-soft)] transition-colors"
                  >
                    <span className="text-sm font-medium text-[var(--text-primary)]">
                      {item.question}
                    </span>
                    <span className="text-[var(--text-muted)] ml-2 flex-shrink-0">
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-4 py-3 bg-[var(--bg-card-soft)] border-t border-[var(--border-default)]">
                      <p className="text-sm text-[var(--text-muted)] whitespace-pre-line">
                        {item.answer}
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {filteredCategories.length === 0 && (
        <p className="text-center text-[var(--text-muted)] py-8">
          No questions found matching &quot;{searchQuery}&quot;
        </p>
      )}
    </div>
  )
}
