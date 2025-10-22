import React, { forwardRef } from 'react';

/**
 * Props interface cho Checkbox
 */
interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'onChange'> {
  /** Label text */
  label?: string;
  /** Error message */
  error?: string;
  /** Helper text */
  helperText?: string;
  /** Kích thước checkbox */
  size?: 'sm' | 'md' | 'lg';
  /** Có disabled không */
  disabled?: boolean;
  /** Có indeterminate state không */
  indeterminate?: boolean;
  /** Class name tùy chỉnh */
  className?: string;
  /** Callback khi thay đổi */
  onChange?: (checked: boolean) => void;
}

/**
 * Component Checkbox - Checkbox với styling và validation
 * 
 * Tính năng:
 * - Custom styling với Tailwind
 * - Indeterminate state support
 * - Error và helper text
 * - Size variants
 * - Accessibility support
 */
const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      error,
      helperText,
      size = 'md',
      disabled = false,
      indeterminate = false,
      className = '',
      onChange,
      ...props
    },
    ref
  ) => {
    // Size classes
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
    };

    const labelSizeClasses = {
      sm: 'text-sm',
      md: 'text-sm',
      lg: 'text-base',
    };

    /**
     * Xử lý thay đổi checkbox
     */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.checked);
    };

    return (
      <div className={`flex flex-col ${className}`}>
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              ref={ref}
              type="checkbox"
              disabled={disabled}
              onChange={handleChange}
              className={`
                ${sizeClasses[size]}
                rounded border-gray-300
                text-primary-600 focus:ring-primary-500
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors duration-200
              `}
              style={{
                // Set indeterminate state
                ...(indeterminate && {
                  backgroundColor: 'rgb(59 130 246)',
                  borderColor: 'rgb(59 130 246)',
                }),
              }}
              {...props}
            />
          </div>

          {label && (
            <div className="ml-3">
              <label
                className={`
                  ${labelSizeClasses[size]}
                  font-medium text-gray-700
                  ${disabled ? 'text-gray-400' : 'text-gray-700'}
                  cursor-pointer
                `}
                onClick={() => {
                  if (!disabled) {
                    const checkbox = ref as React.RefObject<HTMLInputElement>;
                    checkbox.current?.click();
                  }
                }}
              >
                {label}
              </label>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}

        {/* Helper Text */}
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
