'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, Check, Search, X } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
  searchable?: boolean;
  clearable?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, hint, options, placeholder, searchable, clearable, id, disabled, required, ...props }, ref) => {
    const selectId = id || `select-${Math.random().toString(36).substring(2, 9)}`;
    const errorId = error ? `${selectId}-error` : undefined;
    const hintId = hint ? `${selectId}-hint` : undefined;

    if (searchable) {
      // For searchable selects, we'd use a combobox pattern
      // This is a simplified version - a full combobox would be more complex
      return (
        <div className="w-full">
          {label && (
            <label htmlFor={selectId} className="block text-sm font-medium text-text mb-1.5">
              {label}
              {required && <span className="text-danger ml-0.5" aria-hidden="true">*</span>}
            </label>
          )}
          <div className="relative">
            <select
              ref={ref}
              id={selectId}
              className={cn(
                'w-full appearance-none bg-surface border border-border-input rounded-md text-text',
                'transition-colors duration-fast',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:border-transparent',
                'disabled:bg-surface-elevated disabled:text-text-muted disabled:cursor-not-allowed',
                'aria-invalid:border-danger aria-invalid:focus-visible:ring-danger',
                'pl-4 pr-10 py-2.5 text-sm',
                error && 'border-danger focus-visible:ring-danger',
                className
              )}
              disabled={disabled}
              required={required}
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? errorId : hint ? hintId : undefined}
              {...props}
            >
              {placeholder && <option value="" disabled>{placeholder}</option>}
              {options.map((opt) => (
                <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
          {error && <p id={errorId} className="mt-1.5 text-sm text-danger" role="alert">{error}</p>}
          {hint && !error && <p id={hintId} className="mt-1.5 text-sm text-text-muted">{hint}</p>}
        </div>
      );
    }

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-text mb-1.5">
            {label}
            {required && <span className="text-danger ml-0.5" aria-hidden="true">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'w-full appearance-none bg-surface border border-border-input rounded-md text-text',
              'transition-colors duration-fast',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:border-transparent',
              'disabled:bg-surface-elevated disabled:text-text-muted disabled:cursor-not-allowed',
              'aria-invalid:border-danger aria-invalid:focus-visible:ring-danger',
              'pl-4 pr-10 py-2.5 text-sm',
              error && 'border-danger focus-visible:ring-danger',
              className
            )}
            disabled={disabled}
            required={required}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? errorId : hint ? hintId : undefined}
            {...props}
          >
            {placeholder && <option value="" disabled>{placeholder}</option>}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
        {error && <p id={errorId} className="mt-1.5 text-sm text-danger" role="alert">{error}</p>}
        {hint && !error && <p id={hintId} className="mt-1.5 text-sm text-text-muted">{hint}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

// Combobox for searchable, multi-select, async options
export interface ComboboxProps {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  placeholder?: string;
  searchable?: boolean;
  multiple?: boolean;
  clearable?: boolean;
  disabled?: boolean;
  required?: boolean;
  loading?: boolean;
  className?: string;
}

export function Combobox({
  label,
  error,
  hint,
  options,
  value,
  onChange,
  placeholder,
  searchable = true,
  multiple = false,
  clearable = true,
  disabled = false,
  required = false,
  loading = false,
  className,
}: ComboboxProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [highlightedIndex, setHighlightedIndex] = React.useState(-1);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLUListElement>(null);
  const id = React.useId();

  const values = Array.isArray(value) ? value : value ? [value] : [];
  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (option: SelectOption) => {
    if (multiple) {
      const newValues = values.includes(option.value)
        ? values.filter((v) => v !== option.value)
        : [...values, option.value];
      onChange(newValues);
    } else {
      onChange(option.value);
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => Math.min(prev + 1, filteredOptions.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => Math.max(prev - 1, -1));
        break;
      case 'Enter':
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          e.preventDefault();
          handleSelect(filteredOptions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSearchQuery('');
        setHighlightedIndex(-1);
        break;
      case 'Backspace':
        if (!searchQuery && values.length > 0 && multiple) {
          onChange(values.slice(0, -1));
        }
        break;
    }
  };

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        if (listRef.current && !listRef.current.contains(e.target as Node)) {
          setIsOpen(false);
          setSearchQuery('');
          setHighlightedIndex(-1);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="block text-sm font-medium text-text mb-1.5">
          {label}
          {required && <span className="text-danger ml-0.5" aria-hidden="true">*</span>}
        </label>
      )}
      <div className="relative" ref={inputRef}>
        <div
          className={cn(
            'w-full bg-surface border border-border-input rounded-md text-text',
            'transition-colors duration-fast',
            'focus-within:ring-2 focus-within:ring-border-focus focus-within:border-transparent',
            'disabled:opacity-50 disabled:pointer-events-none',
            error && 'border-danger',
            loading && 'opacity-75',
            className
          )}
          onClick={() => !disabled && setIsOpen(true)}
        >
          <div className="flex flex-wrap items-center gap-1.5 px-3 py-2 min-h-[40px]">
            {multiple && values.length > 0 && (
              <>
                {values.map((v) => {
                  const opt = options.find((o) => o.value === v);
                  return (
                    <span key={v} className="inline-flex items-center gap-1 px-2 py-0.5 bg-accent-light text-accent-text rounded-full text-xs font-medium">
                      {opt?.label || v}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelect({ value: v, label: opt?.label || v });
                        }}
                        className="hover:text-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded"
                        aria-label={`Remove ${opt?.label || v}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  );
                })}
              </>
            )}
            {!multiple && values.length > 0 && (
              <span className="flex-1 text-sm text-text">{options.find((o) => o.value === values[0])?.label}</span>
            )}
            {(values.length === 0 || multiple) && (
              <Input
                ref={(el) => inputRef.current = el as unknown as HTMLInputElement}
                type="text"
                placeholder={placeholder || 'Select...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                onClick={(e) => e.stopPropagation()}
                onFocus={(e) => { e.stopPropagation(); setIsOpen(true); }}
                className="flex-1 min-w-[120px] bg-transparent border-0 focus-visible:ring-0 py-0"
                disabled={disabled || (!multiple && values.length > 0)}
                aria-autocomplete="list"
                aria-controls={isOpen ? `${id}-listbox` : undefined}
                aria-expanded={isOpen}
                aria-activedescendant={highlightedIndex >= 0 ? `${id}-option-${highlightedIndex}` : undefined}
              />
            )}
            {clearable && values.length > 0 && (
              <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onChange(multiple ? [] : ''); }} aria-label="Clear selection">
                <X className="h-4 w-4" />
              </Button>
            )}
            <div className={cn('ml-auto flex items-center text-text-muted', loading && 'animate-spin')}>
              {loading ? <span className="h-4 w-4 animate-spin border-2 border-accent border-t-transparent rounded-full" /> : <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />}
            </div>
          </div>
        </div>

        {isOpen && (
          <ul
            ref={listRef}
            id={`${id}-listbox`}
            role="listbox"
            aria-multiselectable={multiple}
            className="absolute z-[500] mt-1 w-full max-h-60 overflow-auto bg-surface border border-border rounded-md shadow-lg"
          >
            {filteredOptions.length === 0 ? (
              <li className="px-4 py-3 text-sm text-text-muted text-center" role="option" aria-disabled="true">
                {searchQuery ? 'No matches found' : 'No options available'}
              </li>
            ) : (
              filteredOptions.map((opt, index) => (
                <li
                  key={opt.value}
                  id={`${id}-option-${index}`}
                  role="option"
                  aria-selected={values.includes(opt.value)}
                  aria-disabled={opt.disabled}
                  className={cn(
                    'px-4 py-2.5 text-sm cursor-pointer',
                    'hover:bg-surface-elevated',
                    values.includes(opt.value) && 'bg-accent-light text-accent-text',
                    highlightedIndex === index && 'bg-surface-elevated',
                    opt.disabled && 'opacity-50 pointer-events-none text-text-muted'
                  )}
                  onClick={() => !opt.disabled && handleSelect(opt)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  {opt.label}
                </li>
              ))
            )}
          </ul>
        )}
        {error && <p className="mt-1.5 text-sm text-danger" role="alert">{error}</p>}
        {hint && !error && <p className="mt-1.5 text-sm text-text-muted">{hint}</p>}
      </div>
    </div>
  );
}