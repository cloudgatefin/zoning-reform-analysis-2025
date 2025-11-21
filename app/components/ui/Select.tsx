import React from "react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
  className?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
}

export function Select({
  children,
  className = "",
  label,
  error,
  disabled = false,
  ...props
}: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label}
        </label>
      )}
      <select
        disabled={disabled}
        className={`w-full bg-white border-2 border-gray-300 rounded-lg px-4 py-2.5 text-base text-gray-900 cursor-pointer hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
          error ? 'border-red-500 focus:ring-red-500' : ''
        } ${disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''} ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

interface SelectOptionProps extends React.OptionHTMLAttributes<HTMLOptionElement> {
  children: React.ReactNode;
}

export function SelectOption({ children, ...props }: SelectOptionProps) {
  return (
    <option {...props} className="text-gray-900">
      {children}
    </option>
  );
}

export default Select;
