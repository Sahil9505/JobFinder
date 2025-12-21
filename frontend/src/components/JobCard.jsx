// Import React hooks
import { useState } from 'react';
import { cancelApplication as cancelByJob } from '../services/applicationService';
import ConfirmModal from './ConfirmModal';
import CompanyLogo from './CompanyLogo';
// Import auth hook
import { useAuth } from '../context/AuthContext';
// Import React Router for navigation (used as a fallback)
import { useNavigate, Link } from 'react-router-dom';

// JobCard Component - Enhanced with better styling and animations
const JobCard = ({ job, onApplySuccess, onOpenApply, isApplied = false, application = null }) => {
  // Get authentication state
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // State for loading and messages
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  // Handle apply button click - different behavior for internal vs external jobs
  const handleApply = async () => {
    // Only true 'external' applyType should redirect to other site
    const isExternalJob = (job.applyType && job.applyType === 'external');

    if (isExternalJob) {
      const applyTarget = job.applyUrl || job.applyLink || job.applyTarget || '#';
      if (applyTarget && applyTarget !== '#') {
        window.open(applyTarget, '_blank', 'noopener,noreferrer');
        setMessage('Opening application page...');
        setTimeout(() => setMessage(''), 2000);
      } else {
        setMessage('Application link not available');
        setTimeout(() => setMessage(''), 3000);
      }
      return;
    }

    // For external jobs open external link
    if (isExternalJob) return; // handled above

    // Open the apply modal through parent handler if provided
    if (onOpenApply) {
      onOpenApply(job);
      return;
    }

    // Fallback: navigate to job detail with request to open apply modal
    try {
      const id = job._id || job.id || job.externalId;
      if (id) navigate(`/jobs/${id}`, { state: { openApply: true } });
    } catch (err) {
      // swallow navigation error quietly (no console logs in production)
    };
  };

  // Get company initial for logo placeholder with gradient background
  const getCompanyInitial = (companyName) => {
    return companyName ? companyName.charAt(0).toUpperCase() : '?';
  };

  // Get gradient color based on company initial
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

  // Determine badge color and text based on job type
  const getJobTypeInfo = () => {
    if (job.type === 'Job') {
      return { text: 'Full-Time', color: 'bg-gradient-to-r from-green-400 to-green-600 text-white' };
    } else {
      return { text: 'Internship', color: 'bg-gradient-to-r from-purple-400 to-purple-600 text-white' };
    }
  };

  const jobTypeInfo = getJobTypeInfo();
  const gradientColor = getGradientColor(getCompanyInitial(job.company));

  // Compute button text/content outside JSX to avoid nested ternaries and JSX syntax errors
  const platformName = job.applyPlatform || job.platform || null;
  // Treat only explicit external applyType as external; Platform jobs should use internal apply flow (open modal)
  const isExternalJob = (job.applyType && job.applyType === 'external');

  const buttonText = (() => {
    if (loading) {
      return (
        <span className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Applying...
        </span>
      );
    }

    if (isExternalJob) {     return platformName ? `Apply on ${platformName}` : 'Apply on External Site →';
    }

    return message || 'Apply Now';
  })();

  return (
    <div className="group relative rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col h-full bg-dark-850/95 backdrop-blur-xl border border-white/10 hover:border-white/20">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-fuchsia-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Decorative glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-fuchsia-500/5 rounded-full blur-3xl" />
      
      <div className="relative z-10 p-5 flex flex-col h-full">
        {/* Header: Badges and Logo */}
        <div className="flex items-start justify-between mb-4">
          {/* Left: Badges */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="inline-block px-2.5 py-1.5 rounded-md text-xs font-semibold bg-slate-700/60 border border-slate-600/40 text-slate-200 shadow-sm">
              {job.city || job.location}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold bg-violet-500/20 border border-violet-500/30 text-violet-300 shadow-sm">
              ⚡ {jobTypeInfo.text}
            </span>
          </div>
          
          {/* Right: Company Logo */}
          <div className="flex-shrink-0">
            <CompanyLogo companyName={job.company} size="md" />
          </div>
        </div>

        {/* Job Details */}
        <div className="flex-1 flex flex-col">

          {/* Job Title */}
          <h3 className="text-xl font-bold text-white leading-tight mb-2 line-clamp-2 drop-shadow-sm">
            <Link to={`/jobs/${job._id || job.id}`}>{job.title}</Link>
          </h3>
          
          {/* Company Name */}
          <p className="text-sm text-white/90 font-semibold mb-4">{job.company}</p>

          {/* Metadata Icons */}
          <div className="flex items-center gap-4 mb-4 text-gray-300 text-sm">
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span className="font-medium">{job.applicants || 0} Applied</span>
            </div>
            {job.salaryDisplay && (
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-semibold">{job.salaryDisplay}</span>
              </div>
            )}
          </div>

          {/* Description (truncated) */}
          <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-2">
            {job.description}
          </p>

          {/* Apply / Applied Actions - Fixed at bottom */}
          <div className="mt-auto pt-4">
          {isApplied ? (
            <div className="flex items-center justify-between gap-3">
              <button className="flex-1 py-2.5 px-4 rounded-lg font-bold bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 shadow-lg flex items-center justify-center gap-2" disabled>
                ✅ Applied
              </button>
              <>
                <button
                  onClick={() => setShowConfirm(true)}
                  disabled={loading}
                  className="py-2.5 px-4 rounded-lg font-semibold bg-dark-800/80 border border-red-500/30 text-red-300 shadow-md hover:bg-red-500/20 hover:border-red-500/50 disabled:opacity-60 transition-all duration-200"
                >
                  Cancel
                </button>

                <ConfirmModal
                  open={showConfirm}
                  title="Cancel Application"
                  message="Are you sure you want to cancel this application?"
                  confirmText="Yes, cancel"
                  cancelText="No"
                  onCancel={() => setShowConfirm(false)}
                  onConfirm={async () => {
                    setShowConfirm(false);
                    setMessage('');
                    setLoading(true);
                    try {
                      const jobId = job._id || job.id;
                      if (!jobId) {
                        setMessage('Job id not available');
                        return;
                      }
                      const res = await cancelByJob(jobId);
                      if (res && res.success) {
                        window.dispatchEvent(new CustomEvent('applicationCancelled', { detail: { jobId } }));
                        window.dispatchEvent(new CustomEvent('appToast', { detail: { message: 'Application cancelled successfully', type: 'success' } }));
                        if (onApplySuccess) onApplySuccess();
                      } else {
                        window.dispatchEvent(new CustomEvent('appToast', { detail: { message: res?.message || 'Failed to cancel', type: 'error' } }));
                      }
                    } catch (err) {
                      setMessage(err.response?.data?.message || 'Failed to cancel');
                    } finally {
                      setLoading(false);
                      setTimeout(() => setMessage(''), 2200);
                    }
                  }}
                />
              </>
            </div>
          ) : (
            <button
              onClick={handleApply}
              disabled={loading || (job.applyType === 'internal' && !!message)}
              className="relative w-full group/btn overflow-hidden rounded-lg disabled:opacity-60"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 opacity-100 group-hover/btn:opacity-90 transition-opacity duration-300" />
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 blur-lg opacity-0 group-hover/btn:opacity-50 transition-opacity duration-300" />
              <span className="relative flex items-center justify-center py-2.5 px-6 text-sm font-bold text-white">
                {buttonText}
                {!loading && (
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                )}
              </span>
            </button>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
