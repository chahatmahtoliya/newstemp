import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  isLoading, 
  variant = 'primary', 
  className = '', 
  disabled,
  ...props 
}) => {
  const baseStyles = "flex items-center justify-center px-6 py-3 rounded-md font-bold transition-all duration-200 uppercase tracking-wider text-sm disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-news-red hover:bg-red-700 text-white shadow-lg shadow-red-900/20",
    secondary: "bg-news-gray hover:bg-gray-700 text-white border border-gray-600",
    danger: "bg-red-900/50 hover:bg-red-900 text-red-200 border border-red-800"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
};

export default Button;