// src/components/common/DatePicker.jsx
import React, { forwardRef } from 'react';
import { Calendar } from 'lucide-react';

const DatePicker = forwardRef(
  (
    {
      label,
      name,
      value,
      onChange,
      onBlur,
      error,
      helperText,
      required = false,
      disabled = false,
      min,
      max,
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={name}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>

          <input
            ref={ref}
            id={name}
            name={name}
            type="date"
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            required={required}
            disabled={disabled}
            min={min}
            max={max}
            className={`block w-full pl-10 pr-3 py-2 rounded-lg border 
              ${
                error
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              }
              text-gray-900
              focus:outline-none focus:ring-2
              disabled:bg-gray-100 disabled:cursor-not-allowed
              ${className}`}
            {...props}
          />
        </div>

        {(error || helperText) && (
          <p
            className={`mt-1 text-sm ${
              error ? 'text-red-500' : 'text-gray-500'
            }`}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

DatePicker.displayName = 'DatePicker';

export default DatePicker;