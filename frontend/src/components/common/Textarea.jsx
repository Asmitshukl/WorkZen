import React, { forwardRef } from 'react';

const Textarea = forwardRef(
  (
    {
      label,
      name,
      value,
      onChange,
      onBlur,
      placeholder,
      error,
      helperText,
      required = false,
      disabled = false,
      rows = 4,
      maxLength,
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

        <textarea
          ref={ref}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          rows={rows}
          maxLength={maxLength}
          className={`block w-full rounded-lg border px-3 py-2 text-gray-900 placeholder-gray-400
            ${
              error
                ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
            }
            focus:outline-none focus:ring-2
            disabled:bg-gray-100 disabled:cursor-not-allowed
            resize-none
            ${className}`}
          {...props}
        />

        <div className="flex justify-between mt-1">
          <div>
            {(error || helperText) && (
              <p className={`text-sm ${error ? 'text-red-500' : 'text-gray-500'}`}>
                {error || helperText}
              </p>
            )}
          </div>
          {maxLength && (
            <p className="text-sm text-gray-500">
              {value?.length || 0} / {maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;