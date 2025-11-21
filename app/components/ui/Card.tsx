import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "elevated" | "outlined";
}

export function Card({ children, className = "", variant = "default" }: CardProps) {
  const variantStyles = {
    default: "bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow",
    elevated: "bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100",
    outlined: "bg-transparent border-2 border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors",
  };

  return (
    <div className={`${variantStyles[variant]} ${className}`}>
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className = "" }: CardHeaderProps) {
  return (
    <div className={`mb-4 pb-4 border-b border-gray-200 ${className}`}>
      {children}
    </div>
  );
}

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
  level?: "h2" | "h3" | "h4";
}

export function CardTitle({ children, className = "", level = "h3" }: CardTitleProps) {
  const Tag = level;
  const titleStyles = {
    h2: "text-2xl",
    h3: "text-xl",
    h4: "text-lg",
  };

  return (
    <Tag className={`${titleStyles[level]} font-bold text-gray-900 ${className}`}>
      {children}
    </Tag>
  );
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className = "" }: CardContentProps) {
  return <div className={`text-gray-700 ${className}`}>{children}</div>;
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function CardFooter({ children, className = "" }: CardFooterProps) {
  return (
    <div className={`mt-6 pt-4 border-t border-gray-200 flex gap-3 ${className}`}>
      {children}
    </div>
  );
}

export default Card;
