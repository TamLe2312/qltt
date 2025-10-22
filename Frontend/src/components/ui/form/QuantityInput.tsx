import React, { useState, useEffect } from 'react';

/**
 * Props interface cho QuantityInput
 */
interface QuantityInputProps {
  /** Giá trị hiện tại */
  value: number;
  /** Callback khi giá trị thay đổi */
  onChange: (value: number) => void;
  /** Giá trị tối thiểu */
  min?: number;
  /** Giá trị tối đa */
  max?: number;
  /** Có disabled không */
  disabled?: boolean;
  /** Có hiển thị nút +/- không */
  showButtons?: boolean;
  /** Kích thước component */
  size?: 'sm' | 'md' | 'lg';
  /** Class name tùy chỉnh */
  className?: string;
  /** Placeholder text */
  placeholder?: string;
}

/**
 * Component QuantityInput - Input số lượng với validation và controls
 * 
 * Tính năng:
 * - Input trực tiếp với validation
 * - Nút +/- để điều chỉnh
 * - Validation min/max values
 * - Auto-format số
 * - onBlur validation
 */
const QuantityInput: React.FC<QuantityInputProps> = ({
  value,
  onChange,
  min = 0,
  max = 9999,
  disabled = false,
  showButtons = true,
  size = 'md',
  className = '',
  placeholder = '0',
}) => {
  const [inputValue, setInputValue] = useState<string>(value.toString());
  const [isFocused, setIsFocused] = useState(false);

  // Sync input value when prop value changes
  useEffect(() => {
    if (!isFocused) {
      setInputValue(value.toString());
    }
  }, [value, isFocused]);

  // Size classes
  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base',
  };

  const buttonSizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  };

  /**
   * Validate và clamp giá trị
   */
  const validateAndClamp = (val: number): number => {
    return Math.max(min, Math.min(max, val));
  };

  /**
   * Xử lý thay đổi input
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;

    // Allow empty string for user to clear input
    if (rawValue === '') {
      setInputValue('');
      return;
    }

    // Only allow numbers
    const numericValue = rawValue.replace(/[^0-9]/g, '');
    setInputValue(numericValue);
  };

  /**
   * Xử lý khi blur input
   */
  const handleBlur = () => {
    setIsFocused(false);

    // Parse và validate giá trị
    const numericValue = parseInt(inputValue) || min;
    const clampedValue = validateAndClamp(numericValue);

    setInputValue(clampedValue.toString());
    onChange(clampedValue);
  };

  /**
   * Xử lý khi focus input
   */
  const handleFocus = () => {
    setIsFocused(true);
  };

  /**
   * Xử lý khi nhấn phím
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow: backspace, delete, tab, escape, enter
    if ([8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
      // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
      (e.keyCode === 65 && e.ctrlKey === true) ||
      (e.keyCode === 67 && e.ctrlKey === true) ||
      (e.keyCode === 86 && e.ctrlKey === true) ||
      (e.keyCode === 88 && e.ctrlKey === true)) {
      return;
    }

    // Ensure that it is a number and stop the keypress
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
      e.preventDefault();
    }
  };

  /**
   * Tăng giá trị
   */
  const handleIncrement = () => {
    if (disabled) return;
    const newValue = validateAndClamp(value + 1);
    onChange(newValue);
  };

  /**
   * Giảm giá trị
   */
  const handleDecrement = () => {
    if (disabled) return;
    const newValue = validateAndClamp(value - 1);
    onChange(newValue);
  };

  return (
    <div className={`flex items-center ${className}`}>
      {/* Decrement Button */}
      {showButtons && (
        <button
          type="button"
          onClick={handleDecrement}
          disabled={disabled || value <= min}
          className={`
            ${buttonSizeClasses[size]}
            flex items-center justify-center
            border border-gray-300 rounded-l-md
            bg-white hover:bg-gray-50
            disabled:opacity-50 disabled:cursor-not-allowed
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1
            transition-colors duration-200
          `}
          title="Giảm số lượng"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
      )}

      {/* Input Field */}
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={placeholder}
        className={`
          ${sizeClasses[size]}
          ${showButtons ? 'rounded-none border-l-0 border-r-0' : 'rounded-md border'}
          border-gray-300 text-center font-medium w-7
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
          disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
          transition-colors duration-200
        `}
        style={{ minWidth: showButtons ? 'w-7' : 'w-8' }}
      />

      {/* Increment Button */}
      {showButtons && (
        <button
          type="button"
          onClick={handleIncrement}
          disabled={disabled || value >= max}
          className={`
            ${buttonSizeClasses[size]}
            flex items-center justify-center
            border border-gray-300 rounded-r-md
            bg-white hover:bg-gray-50
            disabled:opacity-50 disabled:cursor-not-allowed
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1
            transition-colors duration-200
          `}
          title="Tăng số lượng"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default QuantityInput;
