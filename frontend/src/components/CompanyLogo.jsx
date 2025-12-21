/**
 * CompanyLogo Component
 * 
 * Displays company logo with fallback to gradient initial
 * Handles both local logos and fallback gracefully
 * 
 * Props:
 * - companyName: string (required) - Company name
 * - size: 'sm' | 'md' | 'lg' (default: 'md') - Logo size
 * - className: string (optional) - Additional CSS classes
 */

import { useState } from 'react';
import { getCompanyLogo } from '../utils/companyLogoMap';

const CompanyLogo = ({ companyName, size = 'md', className = '' }) => {
  const [imageError, setImageError] = useState(false);
  
  // Get logo URL
  const logoUrl = getCompanyLogo(companyName);
  
  // Get company initial
  const getCompanyInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };
  
  // Get gradient color based on initial
  const getGradientColor = (initial) => {
    const gradients = [
      'from-blue-500 to-purple-600',
      'from-purple-500 to-pink-600',
      'from-pink-500 to-red-600',
      'from-red-500 to-orange-600',
      'from-orange-500 to-yellow-600',
      'from-green-500 to-teal-600',
      'from-teal-500 to-cyan-600',
      'from-cyan-500 to-blue-600',
    ];
    const index = (initial.charCodeAt(0) || 65) % gradients.length;
    return gradients[index];
  };
  
  const initial = getCompanyInitial(companyName);
  const gradientColor = getGradientColor(initial);
  
  // Size configurations
  const sizeClasses = {
    sm: 'w-10 h-10 text-base',
    md: 'w-14 h-14 text-xl',
    lg: 'w-20 h-20 text-3xl',
  };
  
  const logoSizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  };
  
  const containerSize = sizeClasses[size] || sizeClasses.md;
  const imageSize = logoSizeClasses[size] || logoSizeClasses.md;
  
  // Show logo if available and no error
  const shouldShowLogo = logoUrl && !imageError;
  
  return (
    <div
      className={`${containerSize} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300 overflow-hidden ${
        shouldShowLogo ? 'bg-white' : `bg-gradient-to-br ${gradientColor}`
      } ${className}`}
    >
      {shouldShowLogo ? (
        <div className="w-full h-full p-2 flex items-center justify-center">
          <img
            src={logoUrl}
            alt={`${companyName} logo`}
            className={`${imageSize} object-contain`}
            onError={() => setImageError(true)}
            loading="lazy"
          />
        </div>
      ) : (
        <span className="font-bold text-white drop-shadow-sm">
          {initial}
        </span>
      )}
    </div>
  );
};

export default CompanyLogo;
