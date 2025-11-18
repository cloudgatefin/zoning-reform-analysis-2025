import React from "react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
  className?: string;
}

export function Select({ children, className = "", ...props }: SelectProps) {
  return (
    <select
      className={`bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[var(--radius-md)] px-3 py-2 text-base text-[var(--text-primary)] cursor-pointer hover:border-[var(--border-hover)] focus:outline-none focus:border-[var(--accent-blue)] ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

interface SelectOptionProps extends React.OptionHTMLAttributes<HTMLOptionElement> {
  children: React.ReactNode;
}

export function SelectOption({ children, ...props }: SelectOptionProps) {
  return <option {...props}>{children}</option>;
}
