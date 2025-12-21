// Import React hooks
import { useState, useEffect } from 'react';
// Import API function
import { getCompanies } from '../services/api';
// Import CompanyCard component
import CompanyCard from '../components/CompanyCard';
// Import CompanyCardSkeleton for loading state
import CompanyCardSkeleton from '../components/CompanyCardSkeleton';

// Companies Page Component - Modern professional design
const Companies = () => {
  // State for companies data
  const [companies, setCompanies] = useState([]);
  // State for filtered companies
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  // State for loading
  const [loading, setLoading] = useState(true);
  // State for filters
  const [searchName, setSearchName] = useState('');
  const [filterIndustry, setFilterIndustry] = useState('All');
  const [filterLocation, setFilterLocation] = useState('All');
  // State for pagination
  const [displayCount, setDisplayCount] = useState(12); // Show 12 companies initially

  // Fixed industry options (student-friendly)
  const industries = ['All', 'IT & Software', 'FinTech', 'EdTech', 'E-commerce'];
  // Fixed Indian city options
  const locations = ['All', 'Mumbai','Delhi','Bangalore','Hyderabad','Chennai','Pune','Noida','Gurugram','Kolkata','Ahmedabad','Jaipur','Indore','Remote India'];

  // Fetch companies when component mounts
  useEffect(() => {
    fetchCompanies();
  }, []);

  // Filter companies when filters change
  useEffect(() => {
    filterCompanies();
  }, [companies, searchName, filterIndustry, filterLocation]);

  // Function to fetch companies from API
  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await getCompanies();
      if (response.success) {
        setCompanies(response.data);
        setFilteredCompanies(response.data);
      } else {
        console.error('Failed to fetch companies:', response.message);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to filter companies
  const filterCompanies = () => {
    let filtered = [...companies];

    // Filter by company name (case-insensitive)
    if (searchName) {
      filtered = filtered.filter((company) =>
        company.name.toLowerCase().includes(searchName.toLowerCase())
      );
    }

    // Filter by industry
    if (filterIndustry !== 'All') {
      filtered = filtered.filter((company) => company.industry === filterIndustry);
    }

    // Filter by location (city)
    if (filterLocation !== 'All') {
      filtered = filtered.filter((company) => company.city === filterLocation);
    }

    setFilteredCompanies(filtered);
  };

  // Get displayed companies (for pagination/load more)
  const displayedCompanies = filteredCompanies.slice(0, displayCount);
  const hasMore = filteredCompanies.length > displayCount;

  // Handle Load More
  const handleLoadMore = () => {
    setDisplayCount(prev => prev + 12);
  };

  return (
    <div className="min-h-screen bg-dark-950 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header - Premium typography */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-violet-200 via-purple-200 to-fuchsia-200 bg-clip-text text-transparent mb-4">
            Companies Hiring Now
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Discover leading companies offering exciting opportunities in tech and beyond
          </p>
        </div>

        {/* Filters Section - Glassmorphic design */}
        <div className="relative bg-dark-850/50 backdrop-blur-xl rounded-2xl shadow-card p-8 mb-10 border border-white/10">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-transparent to-fuchsia-500/5 rounded-2xl pointer-events-none" />
          
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Search by Company Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2.5">
                Search Company
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by company name..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-dark-800/80 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-white placeholder-gray-500 transition-all"
                />
                <svg className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Filter by Industry */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2.5">
                Industry
              </label>
              <select
                value={filterIndustry}
                onChange={(e) => setFilterIndustry(e.target.value)}
                className="w-full px-4 py-3 bg-dark-800/80 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-white transition-all appearance-none cursor-pointer"
              >
                {industries.map((industry) => (
                  <option key={industry} value={industry} className="bg-dark-850">
                    {industry}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Location */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2.5">
                Location
              </label>
              <select
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                className="w-full px-4 py-3 bg-dark-800/80 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-white transition-all appearance-none cursor-pointer"
              >
                {locations.map((location) => (
                  <option key={location} value={location} className="bg-dark-850">
                    {location}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Count and Clear Filters */}
          <div className="relative z-10 mt-6 flex justify-between items-center pt-6 border-t border-white/5">
            <div className="text-sm text-gray-400">
              Showing <span className="font-semibold text-violet-300">{displayedCompanies.length}</span> of{' '}
              <span className="font-semibold text-white">{filteredCompanies.length}</span> companies
            </div>
            {(searchName || filterIndustry !== 'All' || filterLocation !== 'All') && (
              <button
                onClick={() => {
                  setSearchName('');
                  setFilterIndustry('All');
                  setFilterLocation('All');
                }}
                className="text-sm font-medium text-violet-300 hover:text-violet-200 transition-colors flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Loading State - Using Skeletons */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
              <CompanyCardSkeleton key={index} />
            ))}
          </div>
        ) : filteredCompanies.length === 0 ? (
          // Empty State - Premium design
          <div className="text-center py-24 bg-dark-850/50 backdrop-blur-xl rounded-2xl shadow-card border border-white/10">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 rounded-2xl flex items-center justify-center">
                <svg className="w-10 h-10 text-violet-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="text-2xl font-bold text-white mb-4">
                No companies found
              </div>
              <div className="text-base text-gray-400 mb-8 leading-relaxed">
                {searchName || filterIndustry !== 'All' || filterLocation !== 'All'
                  ? 'Try adjusting your filters to discover more companies.'
                  : 'No companies available at the moment.'}
              </div>
              {(searchName || filterIndustry !== 'All' || filterLocation !== 'All') ? (
                <button
                  onClick={() => {
                    setSearchName('');
                    setFilterIndustry('All');
                    setFilterLocation('All');
                  }}
                  className="relative inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl font-bold text-white hover:shadow-glow transition-all duration-300 transform hover:scale-105"
                >
                  Clear All Filters
                </button>
              ) : (
                <button
                  onClick={fetchCompanies}
                  className="relative inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl font-bold text-white hover:shadow-glow transition-all duration-300 transform hover:scale-105"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Retry Loading
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Companies Grid - Improved spacing */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {displayedCompanies.map((company) => (
                <CompanyCard key={company.id} company={company} />
              ))}
            </div>

            {/* Load More Button - Premium style */}
            {hasMore && (
              <div className="text-center mt-12">
                <button
                  onClick={handleLoadMore}
                  className="group relative inline-flex items-center gap-2 px-8 py-3.5 overflow-hidden rounded-xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 transition-opacity duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-300" />
                  <span className="relative font-semibold text-white">Load More Companies</span>
                  <svg className="relative w-4 h-4 text-white group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Companies;
