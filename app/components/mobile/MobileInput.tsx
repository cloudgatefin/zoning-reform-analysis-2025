"use client";

import { forwardRef, InputHTMLAttributes } from 'react';

interface MobileInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const MobileInput = forwardRef<HTMLInputElement, MobileInputProps>(
  ({ label, error, helperText, className = '', type = 'text', ...props }, ref) => {
    // Determine keyboard type based on input type
    const getInputMode = () => {
      switch (type) {
        case 'number':
          return 'numeric';
        case 'email':
          return 'email';
        case 'tel':
          return 'tel';
        case 'url':
          return 'url';
        case 'search':
          return 'search';
        default:
          return 'text';
      }
    };

    // Auto-capitalize settings
    const getAutoCapitalize = () => {
      switch (type) {
        case 'email':
        case 'url':
        case 'password':
          return 'none';
        default:
          return 'sentences';
      }
    };

    // Auto-correct settings
    const getAutoCorrect = () => {
      switch (type) {
        case 'email':
        case 'password':
        case 'url':
          return 'off';
        default:
          return 'on';
      }
    };

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={props.id}
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          inputMode={getInputMode()}
          autoCapitalize={getAutoCapitalize()}
          autoCorrect={getAutoCorrect()}
          spellCheck={type === 'email' || type === 'url' || type === 'password' ? 'false' : 'true'}
          className={`
            w-full min-h-[48px] px-4 py-3
            text-base text-gray-900 placeholder-gray-500
            bg-white border rounded-lg
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${error
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300 hover:border-gray-400'
            }
            ${className}
          `}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={
            error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined
          }
          {...props}
        />
        {error && (
          <p
            id={`${props.id}-error`}
            className="mt-1.5 text-sm text-red-600"
            role="alert"
          >
            {error}
          </p>
        )}
        {helperText && !error && (
          <p
            id={`${props.id}-helper`}
            className="mt-1.5 text-sm text-gray-500"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

MobileInput.displayName = 'MobileInput';

export default MobileInput;

// Mobile-optimized select component
interface MobileSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function MobileSelect({
  label,
  error,
  options,
  className = '',
  ...props
}: MobileSelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={props.id}
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          {label}
        </label>
      )}
      <select
        className={`
          w-full min-h-[48px] px-4 py-3 pr-10
          text-base text-gray-900
          bg-white border rounded-lg
          transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${error
            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
            : 'border-gray-300 hover:border-gray-400'
          }
          ${className}
        `}
        aria-invalid={error ? 'true' : 'false'}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1.5 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

// Mobile-optimized textarea
interface MobileTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function MobileTextarea({
  label,
  error,
  className = '',
  ...props
}: MobileTextareaProps) {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={props.id}
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          {label}
        </label>
      )}
      <textarea
        className={`
          w-full min-h-[120px] px-4 py-3
          text-base text-gray-900 placeholder-gray-500
          bg-white border rounded-lg
          transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:bg-gray-100 disabled:cursor-not-allowed
          resize-y
          ${error
            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
            : 'border-gray-300 hover:border-gray-400'
          }
          ${className}
        `}
        aria-invalid={error ? 'true' : 'false'}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
