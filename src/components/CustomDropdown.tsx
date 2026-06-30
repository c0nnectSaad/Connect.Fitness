'use client';

import React, { useState, useEffect, useRef } from 'react';

interface DropdownOption {
  value: string;
  label: string;
}

interface CustomDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: any) => void;
  placeholder?: string;
  style?: React.CSSProperties;
}

export default function CustomDropdown({ options, value, onChange, placeholder = 'Select option...', style }: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', ...style }}>
      {/* Dropdown Header */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'rgba(20, 20, 20, 0.85)',
          border: isOpen ? '1px solid var(--primary)' : '1px solid rgba(255, 255, 255, 0.1)',
          color: '#ffffff',
          padding: '12px 16px',
          borderRadius: '8px',
          fontFamily: 'var(--font-body)',
          fontSize: '14.5px',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          transition: 'var(--transition)',
          boxShadow: isOpen ? '0 0 10px var(--primary-glow)' : 'none',
          userSelect: 'none'
        }}
      >
        <span style={{ fontWeight: 500, color: selectedOption ? '#ffffff' : 'var(--muted)' }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span style={{
          color: 'var(--primary)',
          fontSize: '10px',
          transition: 'transform 0.3s ease',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
        }}>
          ▼
        </span>
      </div>

      {/* Dropdown Options List */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          left: 0,
          right: 0,
          background: 'var(--glass-bg)',
          border: '1px solid var(--glass-border)',
          borderRadius: '10px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6), 0 0 15px rgba(212, 175, 55, 0.05)',
          zIndex: 1000,
          maxHeight: '260px',
          overflowY: 'auto',
          backdropFilter: 'blur(16px)',
          animation: 'slideDown 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          transformOrigin: 'top center'
        }}>
          <style>{`
            @keyframes slideDown {
              from { opacity: 0; transform: translateY(-10px) scale(0.98); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }
          `}</style>
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <div
                key={option.value}
                onClick={() => handleSelect(option.value)}
                style={{
                  padding: '12px 16px',
                  fontSize: '14px',
                  fontFamily: 'var(--font-body)',
                  color: isSelected ? 'var(--primary)' : '#e5e7eb',
                  background: isSelected ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
                className="dropdown-item-hover"
              >
                <span>{option.label}</span>
                {isSelected && <span style={{ color: 'var(--primary)', fontSize: '12px' }}>✓</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
