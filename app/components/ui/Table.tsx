import React from "react";

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export function Table({ children, className = "" }: TableProps) {
  return (
    <div className={`overflow-x-auto border border-gray-200 rounded-lg shadow-sm ${className}`}>
      <table className="w-full border-collapse">
        {children}
      </table>
    </div>
  );
}

interface TableHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function TableHeader({ children, className = "" }: TableHeaderProps) {
  return (
    <thead className={`bg-gray-50 border-b border-gray-200 ${className}`}>
      {children}
    </thead>
  );
}

interface TableBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function TableBody({ children, className = "" }: TableBodyProps) {
  return <tbody className={`divide-y divide-gray-200 ${className}`}>{children}</tbody>;
}

interface TableRowProps {
  children: React.ReactNode;
  className?: string;
  isHoverable?: boolean;
}

export function TableRow({ children, className = "", isHoverable = true }: TableRowProps) {
  return (
    <tr className={`${isHoverable ? 'hover:bg-gray-50 transition-colors' : ''} ${className}`}>
      {children}
    </tr>
  );
}

interface TableHeadProps {
  children: React.ReactNode;
  className?: string;
}

export function TableHead({ children, className = "" }: TableHeadProps) {
  return (
    <th className={`px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide ${className}`}>
      {children}
    </th>
  );
}

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
}

export function TableCell({ children, className = "" }: TableCellProps) {
  return (
    <td className={`px-6 py-4 text-sm text-gray-700 ${className}`}>
      {children}
    </td>
  );
}

export default Table;
