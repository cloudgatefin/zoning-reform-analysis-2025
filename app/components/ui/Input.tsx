import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({
  className = "",
  label,
  error,
  helperText,
  disabled = false,
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label}
        </label>
      )}
      <input
        disabled={disabled}
        className={`w-full bg-white border-2 border-gray-300 rounded-lg px-4 py-2.5 text-base text-gray-900 placeholder-gray-500 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
          error ? 'border-red-500 focus:ring-red-500' : ''
        } ${disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
}

export default Input;
