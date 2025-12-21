// Import React hooks
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMyApplications } from '../services/api';
// Import API functions - both platform and external jobs
import { getJobs, getExternalJobs } from '../services/api';
// Import JobCard component
import JobCard from '../components/JobCard';
import ApplyModal from '../components/ApplyModal';
// Import JobCardSkeleton for loading state
import JobCardSkeleton from '../components/JobCardSkeleton';
// Import React Router for location state and URL params
import { useLocation, useSearchParams } from 'react-router-dom';

// Jobs Page Component - matches the reference design with sidebar filters
const Jobs = () => {
  // State for jobs data
  const [jobs, setJobs] = useState([]);
  // State for filtered jobs
  const [filteredJobs, setFilteredJobs] = useState([]);
  // State for loading
  const [loading, setLoading] = useState(true);
  // State for filters
  const [filterType, setFilterType] = useState('All'); // All, Job, Internship
  const [filterExperience, setFilterExperience] = useState('All'); // All, Entry, Mid, Senior
  const [filterPlatform, setFilterPlatform] = useState('All'); // All, Internal, External or specific platform
  const [searchTitle, setSearchTitle] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [filterCity, setFilterCity] = useState('All');
  const [filterCompany, setFilterCompany] = useState(''); // Filter by company name
  const [sortBy, setSortBy] = useState('Newest'); // Newest, Oldest
  const [toast, setToast] = useState('');
  
  // Get location state for search parameters from Home page
  const location = useLocation();
  // Get URL search params (for company filter from Companies page)
  const [searchParams] = useSearchParams();

  // Fetch jobs when component mounts
  useEffect(() => {
    fetchJobs();
  }, []);

  // Track user's applications to show 'Applied' state on job cards
  const { isAuthenticated } = useAuth();
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());
  const [appliedApplications, setAppliedApplications] = useState({});

  const fetchMyApplications = async () => {
    try {
      const res = await getMyApplications();
      if (res.success && Array.isArray(res.data)) {
        // Consider only active applications
        const active = res.data.filter(a => a.status === 'Applied');
        const ids = active.map((a) => (a.jobId?._id || a.jobId));
        const map = {};
        active.forEach((a) => {
          const jobId = a.jobId?._id || a.jobId;
          map[jobId] = a; // store full application object
        });
        setAppliedJobIds(new Set(ids));
        setAppliedApplications(map);
      }
    } catch (err) {
      // ignore - user may not be logged in or token expired
      setAppliedJobIds(new Set());
      setAppliedApplications({});
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchMyApplications();

    // Listen for global cancellation events coming from MyApplications
    const onCancelled = (e) => {
      const jobId = e.detail?.jobId;
      if (!jobId) return;
      setAppliedJobIds((prev) => {
        const s = new Set(prev);
        s.delete(jobId);
        return s;
      });
      setAppliedApplications((prev) => {
        const copy = { ...prev };
        delete copy[jobId];
        return copy;
      });
    };

    // Listen for new application events
    const onSubmitted = (e) => {
      const jobId = e.detail?.jobId;
      const application = e.detail?.application;
      if (!jobId) return;
      setAppliedJobIds((prev) => new Set(prev).add(jobId));
      setAppliedApplications((prev) => ({ ...(prev || {}), [jobId]: application }));
      // show brief toast via global toast system
      window.dispatchEvent(new CustomEvent('appToast', { detail: { message: 'Application submitted successfully', type: 'success' } }));
    };

    window.addEventListener('applicationCancelled', onCancelled);
    window.addEventListener('applicationSubmitted', onSubmitted);
    return () => {
      window.removeEventListener('applicationCancelled', onCancelled);
      window.removeEventListener('applicationSubmitted', onSubmitted);
    };
  }, [isAuthenticated]);

  // Set search values from location state (if coming from Home page search)
  useEffect(() => {
    if (location.state) {
      setSearchTitle(location.state.title || '');
      setSearchLocation(location.state.location || '');
    }
  }, [location.state]);

  // Set company filter from URL parameter (if coming from Companies page)
  useEffect(() => {
    const companyParam = searchParams.get('company');
    if (companyParam) {
      setFilterCompany(decodeURIComponent(companyParam));
    }
  }, [searchParams]);

  // Filter and sort jobs when filters change
  useEffect(() => {
    filterAndSortJobs();
  }, [jobs, filterType, filterExperience, searchTitle, searchLocation, filterCompany, sortBy, filterCity]);

  useEffect(() => {
    filterAndSortJobs();
  }, [filterPlatform]);

  // Function to fetch jobs from both sources (Platform + External APIs)
  const fetchJobs = async () => {
    try {
      setLoading(true);
      
      // Fetch platform jobs from MongoDB (our database) - request India-only
      const platformResponse = await getJobs({ country: 'India' });
      console.log('Platform response:', platformResponse);
      
      let platformJobs = [];
      if (platformResponse.success) {
        // Add source field to platform jobs
        platformJobs = platformResponse.data.map(job => ({
          ...job,
          source: 'platform' // Mark as platform job
        }));
        console.log(`Fetched ${platformJobs.length} platform jobs`);
      } else {
        console.warn('Platform jobs fetch unsuccessful:', platformResponse);
      }

      // Fetch external jobs from public APIs (Remotive, etc.)
      let externalJobs = [];
      try {
        const externalResponse = await getExternalJobs();
        if (externalResponse.success && externalResponse.data) {
          externalJobs = externalResponse.data.map(job => ({
            ...job,
            source: 'external' // Already marked in backend, but ensure it's there
          }));
          console.log(`Fetched ${externalJobs.length} external jobs`);
        }
      } catch (externalError) {
        // If external API fails, continue with platform jobs only
        console.error('Error fetching external jobs:', externalError);
        // Graceful degradation - show platform jobs even if external fails
      }

      // Merge both job sources into one array
      const allJobs = [...platformJobs, ...externalJobs];
      console.log(`Total jobs: ${allJobs.length}`);
      
      setJobs(allJobs);
      setFilteredJobs(allJobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      console.error('Error details:', error.response?.data || error.message);
      // Even on error, try to show what we have
      setJobs([]);
      setFilteredJobs([]);
    } finally {
      setLoading(false);
    }
  };

  // Function to filter and sort jobs
  const filterAndSortJobs = () => {
    let filtered = [...jobs];

    // Filter by type
    if (filterType !== 'All') {
      filtered = filtered.filter((job) => job.type === filterType);
    }

    // Filter by platform (internal / external / specific platform name)
    if (filterPlatform !== 'All') {
      if (filterPlatform === 'Internal') {
        filtered = filtered.filter((job) => (job.applyType || job.jobType || '').toLowerCase() === 'internal' || (job.jobType || '').toLowerCase() === 'internal');
      } else if (filterPlatform === 'External') {
        filtered = filtered.filter((job) => (job.applyType || '').toLowerCase() === 'external' || (job.jobType || '').toLowerCase() === 'platform');
      } else {
        // Specific platform name (Internshala, Unstop, Microsoft, etc.)
        filtered = filtered.filter((job) => ((job.platform || job.applyPlatform) || '').toLowerCase().includes(filterPlatform.toLowerCase()));
      }
    }

    // Filter by experience (if needed - currently not in backend, but keeping for UI)
    // This can be extended when experience field is added to backend

    // Filter by title (case-insensitive)
    if (searchTitle) {
      filtered = filtered.filter((job) =>
        job.title.toLowerCase().includes(searchTitle.toLowerCase())
      );
    }

    // Filter by location (case-insensitive)
    if (searchLocation) {
      filtered = filtered.filter((job) =>
        job.location.toLowerCase().includes(searchLocation.toLowerCase())
      );
    }

    // Filter by selected city (India only)
    if (filterCity && filterCity !== 'All') {
      filtered = filtered.filter((job) => {
        // Some jobs use `city`, some use `location`
        const cityVal = (job.city || job.location || '').toLowerCase();
        return cityVal.includes(filterCity.toLowerCase());
      });
    }

    // Filter by company name (case-insensitive)
    if (filterCompany) {
      filtered = filtered.filter((job) =>
        job.company.toLowerCase().includes(filterCompany.toLowerCase())
      );
    }

    // Sort jobs (handle both platform and external jobs)
    filtered.sort((a, b) => {
      if (sortBy === 'Newest') {
        // Platform jobs have createdAt, external jobs have publishedDate
        const dateA = new Date(a.createdAt || a.publishedDate || 0);
        const dateB = new Date(b.createdAt || b.publishedDate || 0);
        return dateB - dateA;
      } else if (sortBy === 'Oldest') {
        const dateA = new Date(a.createdAt || a.publishedDate || 0);
        const dateB = new Date(b.createdAt || b.publishedDate || 0);
        return dateA - dateB;
      }
      return 0;
    });

    setFilteredJobs(filtered);
  };

  // Selected job for internal apply modal
  const [selectedJob, setSelectedJob] = useState(null);

  // Handle apply success (refresh if needed)
  const handleApplySuccess = () => {
    // Refresh job lists to reflect applied state or newly created applications
    fetchJobs();
    // Refresh applications list too
    if (isAuthenticated) fetchMyApplications();
  };

  // Open apply: open the modal inline (do not redirect)
  const openApplyModal = (job) => {
    setSelectedJob(job);
  };

  // Close apply modal (kept for backward compat)
  const closeApplyModal = (didApply = false) => {
    setSelectedJob(null);
    if (didApply) {
      handleApplySuccess();
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header - Clear hierarchy */}
        <div className="mb-10">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-violet-200 via-purple-200 to-fuchsia-200 bg-clip-text text-transparent mb-3 leading-tight">
            Find Your Perfect Job
          </h1>
          <p className="text-gray-300 text-base">
            Browse through <span className="font-bold text-violet-300">{jobs.length}</span> opportunities
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar - Standardized filters */}
          <aside className="w-full lg:w-72 flex-shrink-0">
            <div className="bg-dark-850/50 backdrop-blur-xl rounded-2xl shadow-card p-6 sticky top-20 border border-white/10">
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-transparent to-fuchsia-500/5 rounded-2xl pointer-events-none" />
              
              <div className="relative z-10">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                  <svg className="w-5 h-5 mr-2.5 text-violet-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filters
                </h2>
              
              {/* Job Type Filter - Standardized */}
              <div className="mb-5">
                <label className="block text-sm font-bold text-gray-200 mb-2.5">
                  Job Type
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-3 py-2.5 text-base bg-dark-800/80 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-white transition-all appearance-none cursor-pointer font-medium"
                >
                  <option value="All" className="bg-dark-850">All Types</option>
                  <option value="Job" className="bg-dark-850">Full-Time Jobs</option>
                  <option value="Internship" className="bg-dark-850">Internships</option>
                </select>
              </div>

              {/* Platform Filter - Standardized */}
              <div className="mb-5">
                <label className="block text-sm font-bold text-gray-200 mb-2.5">
                  Platform
                </label>
                <select
                  value={filterPlatform}
                  onChange={(e) => setFilterPlatform(e.target.value)}
                  className="w-full px-3 py-2.5 text-base bg-dark-800/80 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-white transition-all appearance-none cursor-pointer font-medium"
                >
                  <option value="All" className="bg-dark-850">All Platforms</option>
                  <option value="Internal" className="bg-dark-850">Platform (Internal)</option>
                  <option value="External" className="bg-dark-850">External Jobs</option>
                  <option value="Internshala" className="bg-dark-850">Internshala</option>
                  <option value="Unstop" className="bg-dark-850">Unstop</option>
                  <option value="Microsoft" className="bg-dark-850">Microsoft</option>
                  <option value="Amazon" className="bg-dark-850">Amazon</option>
                  <option value="Google" className="bg-dark-850">Google</option>
                </select>
              </div>

              {/* Experience Filter - Standardized */}
              <div className="mb-5">
                <label className="block text-sm font-bold text-gray-200 mb-2.5">
                  Experience Level
                </label>
                <select
                  value={filterExperience}
                  onChange={(e) => setFilterExperience(e.target.value)}
                  className="w-full px-3 py-2.5 text-base bg-dark-800/80 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-white transition-all appearance-none cursor-pointer font-medium"
                >
                  <option value="All" className="bg-dark-850">All Levels</option>
                  <option value="Entry" className="bg-dark-850">Entry Level</option>
                  <option value="Mid" className="bg-dark-850">Mid Level</option>
                  <option value="Senior">Senior Level</option>
                </select>
              </div>

              {/* Search by Title */}
              <div className="mb-5">
                <label className="block text-sm font-bold text-gray-200 mb-2.5">
                  Job Title
                </label>
                <input
                  type="text"
                  placeholder="Search by title..."
                  value={searchTitle}
                  onChange={(e) => setSearchTitle(e.target.value)}
                  className="w-full px-3 py-2.5 text-base bg-dark-800/80 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-white transition-all placeholder:text-gray-500 font-medium"
                />
              </div>

              {/* Search by Location */}
              <div className="mb-5">
                <label className="block text-sm font-bold text-gray-200 mb-2.5">
                  Location
                </label>
                <input
                  type="text"
                  placeholder="Search by location..."
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="w-full px-3 py-2.5 text-base bg-dark-800/80 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-white transition-all placeholder:text-gray-500 font-medium"
                />
              </div>
              
              {/* City Filter Dropdown (India only) */}
              <div>
                <label className="block text-sm font-bold text-gray-200 mb-2.5">City</label>
                <select
                  value={filterCity}
                  onChange={(e) => setFilterCity(e.target.value)}
                  className="w-full px-3 py-2.5 text-base bg-dark-800/80 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-white transition-all appearance-none cursor-pointer font-medium"
                >
                  <option value="All" className="bg-dark-850">All Cities</option>
                  {['Mumbai','Delhi','Bangalore','Hyderabad','Chennai','Pune','Noida','Gurugram','Kolkata','Ahmedabad','Jaipur','Indore','Remote India'].map(city => (
                    <option key={city} value={city} className="bg-dark-850">{city}</option>
                  ))}
                </select>
              </div>
              
              {/* Clear Filters Button */}
              {(filterType !== 'All' || filterExperience !== 'All' || searchTitle || searchLocation) && (
                <button
                  onClick={() => {
                    setFilterType('All');
                    setFilterExperience('All');
                    setSearchTitle('');
                    setSearchLocation('');
                  }}
                  className="mt-8 w-full px-3 py-2.5 text-sm font-bold text-white/70 hover:text-white border border-white/10 hover:border-white/30 rounded-lg hover:bg-dark-800/70 transition-all duration-200"
                >
                  Clear Filters
                </button>
              )}
              </div>
            </div>
          </aside>

          {/* Main Content - Job Listings */}
          <div className="flex-1">
            {/* Sort and Results Count */}
            <div className="bg-dark-850/50 backdrop-blur-xl rounded-xl shadow-card p-5 mb-8 flex flex-col sm:flex-row justify-between items-center gap-4 border border-white/5">
              <div className="text-sm text-gray-300 font-medium">
                Showing <span className="font-bold text-violet-300">{filteredJobs.length}</span> of{' '}
                <span className="font-bold text-white">{jobs.length}</span> jobs
              </div>
              {toast && (
                <div className="text-sm text-emerald-400 font-medium">{toast}</div>
              )}
              <div className="flex items-center space-x-3">
                <label className="text-sm font-bold text-gray-300">Sort:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 text-base border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-white bg-dark-800/80 transition-all appearance-none cursor-pointer font-medium"
                >
                  <option value="Newest" className="bg-dark-850">Newest First</option>
                  <option value="Oldest" className="bg-dark-850">Oldest First</option>
                </select>
              </div>
            </div>

            {/* Loading State - Using Skeletons */}
            {loading ? (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {[1, 2, 3, 4, 5, 6].map((index) => (
                  <JobCardSkeleton key={index} />
                ))}
              </div>
            ) : filteredJobs.length === 0 ? (
              // Empty State
              <div className="text-center py-24 bg-dark-850/50 backdrop-blur-xl rounded-xl shadow-card border border-white/5">
                <svg className="mx-auto h-16 w-16 text-gray-500 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-2xl font-bold text-white mb-3">
                  No jobs found
                </div>
                <div className="text-base text-gray-400 mb-8">
                  Try adjusting your filters or search terms
                </div>
                {(filterType !== 'All' || filterExperience !== 'All' || searchTitle || searchLocation) && (
                  <button
                    onClick={() => {
                      setFilterType('All');
                      setFilterExperience('All');
                      setSearchTitle('');
                      setSearchLocation('');
                    }}
                    className="relative group px-6 py-3 text-base font-bold text-white rounded-lg overflow-hidden transition-all hover:shadow-lg"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 transition-all group-hover:from-violet-500 group-hover:to-fuchsia-500"></div>
                    <span className="relative">Clear All Filters</span>
                  </button>
                )}
              </div>
            ) : (
              // Jobs Grid - Consistent alignment
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {filteredJobs.map((job) => (
                  <JobCard
                    key={job._id || job.id || job.externalId}
                    job={job}
                    onApplySuccess={handleApplySuccess}
                    onOpenApply={openApplyModal}
                    isApplied={appliedJobIds.has(job._id || job.id)}
                    application={appliedApplications[job._id || job.id]}
                  />
                ))}
                {/* Apply modal for internal jobs */}
                <ApplyModal
                  job={selectedJob}
                  open={!!selectedJob}
                  onClose={closeApplyModal}
                  onSuccess={handleApplySuccess}
                  isApplied={selectedJob ? appliedJobIds.has(selectedJob._id || selectedJob.id) : false}
                  existingApplication={selectedJob ? appliedApplications[selectedJob._id || selectedJob.id] : null}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Jobs;
