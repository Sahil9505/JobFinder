// Import React hooks
import { useState, useEffect } from 'react';
// Import API functions - both platform and external jobs
import { getJobs, getExternalJobs } from '../services/api';
// Import JobCard component
import JobCard from '../components/JobCard';
// Import JobCardSkeleton for loading state
import JobCardSkeleton from '../components/JobCardSkeleton';
// Import React Router for navigation
import { useNavigate } from 'react-router-dom';

// Home Page Component - matches the reference design
const Home = () => {
  // State for jobs data
  const [jobs, setJobs] = useState([]);
  // State for loading
  const [loading, setLoading] = useState(true);
  // State for search inputs
  const [searchTitle, setSearchTitle] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const navigate = useNavigate();

  // Tag buttons data
  const tags = [
    'Software Engineer',
    'Developer',
    'Full-Stack Developer',
    'Data Scientist',
    'Remote',
    'Full-Time',
    'Sales',
    'Office Assistant',
  ];

  // Fetch jobs when component mounts
  useEffect(() => {
    fetchJobs();
  }, []);

  // Function to fetch jobs from both sources (Platform + External APIs)
  const fetchJobs = async () => {
    try {
      setLoading(true);
      
      // Fetch platform jobs from MongoDB (our database)
      const platformResponse = await getJobs();
      let platformJobs = [];
      if (platformResponse.success) {
        platformJobs = platformResponse.data.map(job => ({
          ...job,
          source: 'platform' // Mark as platform job
        }));
      }

      // Fetch external jobs from public APIs (Remotive, etc.)
      let externalJobs = [];
      try {
        const externalResponse = await getExternalJobs();
        if (externalResponse.success && externalResponse.data) {
          externalJobs = externalResponse.data.map(job => ({
            ...job,
            source: 'external' // Already marked in backend
          }));
        }
      } catch (externalError) {
        // If external API fails, continue with platform jobs only
        console.error('Error fetching external jobs:', externalError);
      }

      // Merge both job sources and show latest 9 jobs
      const allJobs = [...platformJobs, ...externalJobs];
      setJobs(allJobs.slice(0, 9));
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    // Navigate to jobs page with search parameters
    navigate('/jobs', {
      state: { title: searchTitle, location: searchLocation },
    });
  };

  // Handle tag click - filter by tag
  const handleTagClick = (tag) => {
    navigate('/jobs', {
      state: { title: tag, location: searchLocation },
    });
  };

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-dark-800 to-dark-900 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            {/* Main Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
              Find Your Dream Job with Ease
            </h1>
            <p className="text-gray-400 text-sm md:text-base mb-8">
              Search through thousands of opportunities from top companies
            </p>

            {/* Compact Search Bar */}
            <form
              onSubmit={handleSearch}
              className="max-w-3xl mx-auto bg-dark-850/80 backdrop-blur-sm rounded-2xl shadow-2xl p-1.5 flex flex-col md:flex-row gap-1.5 border border-white/5"
            >
              <div className="flex-1 relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Job title / keyword"
                  value={searchTitle}
                  onChange={(e) => setSearchTitle(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-dark-800/50 border border-white/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 text-white placeholder-gray-500 text-sm transition-all"
                />
              </div>
              <div className="flex-1 relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Location"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-dark-800/50 border border-white/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 text-white placeholder-gray-500 text-sm transition-all"
                />
              </div>
              <button
                type="submit"
                className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 hover:from-violet-700 hover:via-purple-700 hover:to-fuchsia-700 text-white px-8 py-3 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search
              </button>
            </form>

            {/* Compact Tag Buttons */}
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  className="px-3.5 py-1.5 bg-dark-850/60 hover:bg-dark-800 text-gray-400 hover:text-white border border-white/5 hover:border-violet-500/30 rounded-lg text-xs font-medium transition-all hover:shadow-lg hover:shadow-violet-500/10"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Latest Jobs Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-white">Latest Job Opportunities</h2>
          <button
            onClick={() => navigate('/jobs')}
            className="text-primary hover:text-primary-light font-semibold"
          >
            View All →
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((index) => (
              <JobCardSkeleton key={index} />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          // Empty State
          <div className="text-center py-20 bg-dark-850/50 backdrop-blur-xl rounded-xl shadow-card border border-white/5">
            <div className="text-2xl font-bold text-white mb-3">No jobs available</div>
            <div className="text-base text-gray-400">Check back soon for new opportunities</div>
          </div>
        ) : (
          // Jobs Grid - Consistent spacing
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {jobs.map((job) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
