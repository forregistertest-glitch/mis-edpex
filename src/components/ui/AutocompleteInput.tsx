"use client";

import React, { useRef, useEffect } from "react";

interface AutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  isOpen: boolean;
  onSelect: (value: string) => void;
  onClose: () => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  className?: string;
}

export function AutocompleteInput({
  value,
  onChange,
  suggestions,
  isOpen,
  onSelect,
  onClose,
  placeholder = "",
  label,
  required = false,
  className = "",
}: AutocompleteInputProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
          focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 outline-none
          transition-all duration-150"
        autoComplete="off"
      />
      {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg 
          max-h-48 overflow-y-auto">
          {suggestions.map((s, i) => (
            <li
              key={i}
              onClick={() => onSelect(s)}
              className="px-3 py-2 text-sm hover:bg-emerald-50 cursor-pointer
                border-b last:border-0 border-gray-100 transition-colors duration-100"
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
