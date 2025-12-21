// CompanyCard Component - Premium SaaS design with glassmorphism
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import CompanyLogo from './CompanyLogo';

const CompanyCard = ({ company }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  // Get company initial for logo
  const getCompanyInitial = (companyName) => {
    return companyName ? companyName.charAt(0).toUpperCase() : '?';
  };

  // Premium gradient combinations
  const getGradientColor = (initial) => {
    const gradients = [
      'from-violet-500 via-purple-500 to-fuchsia-500',
      'from-blue-500 via-cyan-500 to-teal-500',
      'from-pink-500 via-rose-500 to-red-500',
      'from-orange-500 via-amber-500 to-yellow-500',
      'from-emerald-500 via-green-500 to-lime-500',
      'from-indigo-500 via-purple-500 to-pink-500',
      'from-cyan-500 via-blue-500 to-indigo-500',
      'from-fuchsia-500 via-pink-500 to-rose-500',
    ];
    const index = (initial.charCodeAt(0) || 65) % gradients.length;
    return gradients[index];
  };

  // Handle View Jobs button click
  const handleViewJobs = () => {
    navigate(`/jobs?company=${encodeURIComponent(company.name)}`);
  };

  const gradientColor = getGradientColor(getCompanyInitial(company.name));

  return (
    <div 
      className="group relative rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:-translate-y-2 bg-dark-850/95 backdrop-blur-xl border border-white/10 hover:border-white/20"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-fuchsia-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Decorative glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-fuchsia-500/5 rounded-full blur-3xl" />
      
      <div className="relative z-10 p-6 flex flex-col h-full">
        {/* Header: Job Count and Logo */}
        <div className="flex items-start justify-between mb-6">
          {/* Left: Job Count Badge */}
          <div className="px-3.5 py-2 rounded-lg bg-violet-500/20 border border-violet-500/30 shadow-md">
            <span className="text-sm font-bold text-violet-300">
              {company.totalJobs} {company.totalJobs === 1 ? 'Job' : 'Jobs'}
            </span>
          </div>
          
          {/* Right: Company Logo */}
          <CompanyLogo companyName={company.name} size="lg" />
        </div>

        {/* Company Name */}
        <h3 className="text-2xl font-bold text-white leading-tight mb-4 drop-shadow-sm">
          {company.name}
        </h3>

        {/* Location */}
        <div className="flex items-center text-gray-300 mb-6 text-sm">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="font-semibold">{company.city || company.location || 'Location not specified'}</span>
        </div>

        {/* View Jobs Button */}
        <button
          onClick={handleViewJobs}
          className="relative w-full mt-auto group/btn overflow-hidden rounded-lg"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 opacity-100 group-hover/btn:opacity-90 transition-opacity duration-300" />
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 blur-lg opacity-0 group-hover/btn:opacity-50 transition-opacity duration-300" />
          <span className="relative flex items-center justify-center py-3 px-4 text-sm font-bold text-white">
            View Jobs
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
        </button>
      </div>
    </div>
  );
};

export default CompanyCard;
