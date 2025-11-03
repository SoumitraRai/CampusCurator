import React from 'react';

export function Card({ children, className = '', variant = 'default' }) {
  const variants = {
    default: 'bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200',
    elevated: 'bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200',
    flat: 'bg-white rounded-lg border border-gray-100'
  };

  return (
    <div className={`${variants[variant]} ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={`px-6 py-4 border-b border-gray-100 bg-gray-50 rounded-t-lg ${className}`}>
      {children}
    </div>
  );
}

export function CardBody({ children, className = '' }) {
  return (
    <div className={`px-6 py-5 ${className}`}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '' }) {
  return (
    <div className={`px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-lg flex gap-2 ${className}`}>
      {children}
    </div>
  );
}

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false,
  onClick,
  className = '',
  type = 'button'
}) {
  const variants = {
    primary: 'bg-orange-500 hover:bg-orange-600 text-white border border-orange-600',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300',
    success: 'bg-green-600 hover:bg-green-700 text-white border border-green-700',
    danger: 'bg-red-600 hover:bg-red-700 text-white border border-red-700',
    outline: 'border-2 border-orange-500 text-orange-600 hover:bg-orange-50 bg-white',
    ghost: 'text-gray-700 hover:bg-gray-100 border border-transparent'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-md',
    md: 'px-4 py-2 text-sm rounded-lg',
    lg: 'px-6 py-2.5 text-base rounded-lg'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`font-medium transition-colors duration-150 ${variants[variant]} ${sizes[size]} disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
}

export function Badge({ children, variant = 'info', size = 'md', className = '' }) {
  const variants = {
    info: 'bg-blue-100 text-blue-800 border border-blue-200',
    success: 'bg-green-100 text-green-800 border border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    danger: 'bg-red-100 text-red-800 border border-red-200',
    primary: 'bg-purple-100 text-purple-800 border border-purple-200',
    gray: 'bg-gray-100 text-gray-800 border border-gray-200',
    'success-solid': 'bg-green-600 text-white',
    'warning-solid': 'bg-yellow-600 text-white',
    'danger-solid': 'bg-red-600 text-white'
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <span className={`inline-block rounded-full font-semibold ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
}

export function Alert({ children, variant = 'info', title = '' }) {
  const variants = {
    info: 'bg-blue-50 border border-blue-200 text-blue-900',
    success: 'bg-green-50 border border-green-200 text-green-900',
    warning: 'bg-yellow-50 border border-yellow-200 text-yellow-900',
    danger: 'bg-red-50 border border-red-200 text-red-900'
  };

  return (
    <div className={`p-4 rounded-lg ${variants[variant]}`}>
      {title && <h4 className="font-semibold mb-1">{title}</h4>}
      <div className="text-sm">{children}</div>
    </div>
  );
}export function LoadingSpinner({ size = 'md' }) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className="flex items-center justify-center">
      <div className={`${sizes[size]} border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin`} />
    </div>
  );
}

export function StatCard({ label, value, color = 'blue' }) {
  const colorStyles = {
    blue: 'border-l-4 border-blue-500',
    green: 'border-l-4 border-green-500',
    purple: 'border-l-4 border-purple-500',
    orange: 'border-l-4 border-orange-500'
  };

  return (
    <Card className={`${colorStyles[color]} p-6`}>
      <div className="text-gray-600 text-sm font-medium mb-2">{label}</div>
      <div className="text-3xl font-bold text-gray-900">{value}</div>
    </Card>
  );
}export function FormInput({ label, type = 'text', required = false, error = '', ...props }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        required={required}
        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
        {...props}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}

export function FormSelect({ label, options = [], required = false, error = '', ...props }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        required={required}
        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
        {...props}
      >
        <option value="">Select {label}</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}

export function EmptyState({ title = 'No data', message = '' }) {
  return (
    <div className="py-12 px-4 text-center">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      {message && <p className="text-gray-600 text-sm">{message}</p>}
    </div>
  );
}

export function Timeline({ items = [] }) {
  return (
    <div className="space-y-4">
      {items.map((item, idx) => (
        <div key={idx} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
              item.status === 'completed' ? 'bg-green-600' :
              item.status === 'active' ? 'bg-blue-600' :
              'bg-gray-400'
            }`}>
              {item.status === 'completed' ? 'Done' : item.number}
            </div>
            {idx < items.length - 1 && <div className="w-1 h-12 bg-gray-300 mt-2" />}
          </div>
          <div className="pt-1">
            <div className="font-medium">{item.title}</div>
            <div className="text-sm text-gray-600">{item.description}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
