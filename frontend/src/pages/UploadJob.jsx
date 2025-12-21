// Import React hooks
import { useState } from 'react';
// Import auth hook
import { useAuth } from '../context/AuthContext';
// Import API function
import { addJob } from '../services/api';
// Import React Router for navigation
import { useNavigate } from 'react-router-dom';

// UploadJob Page Component - Full functionality to add new jobs
const UploadJob = () => {
  // Get authentication state
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    type: 'Job', // Default to Job
    description: '',
    requirements: '',
    salary: '',
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear errors when user types
    setError('');
    setSuccess('');
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.title || !formData.company || !formData.location || !formData.description) {
      setError('Please fill in all required fields (Title, Company, Location, Description)');
      return;
    }

    // If not logged in, redirect to login
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setLoading(true);

    try {
      // Prepare job data (requirements and salary are optional)
      const jobData = {
        title: formData.title,
        company: formData.company,
        location: formData.location,
        type: formData.type,
        description: formData.description + (formData.requirements ? `\n\nRequirements:\n${formData.requirements}` : '') + (formData.salary ? `\n\nSalary: ${formData.salary}` : ''),
      };

      // Call API to add job
      const response = await addJob(jobData);

      if (response.success) {
        setSuccess('Job posted successfully! Redirecting to jobs page...');
        // Clear form
        setFormData({
          title: '',
          company: '',
          location: '',
          type: 'Job',
          description: '',
          requirements: '',
          salary: '',
        });
        // Redirect to jobs page after 2 seconds
        setTimeout(() => {
          navigate('/jobs');
        }, 2000);
      } else {
        setError(response.message || 'Failed to post job');
      }
    } catch (error) {
      setError(
        error.response?.data?.message || 'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // If not authenticated, show message
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-dark-900 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-dark-850/50 backdrop-blur-xl border border-white/5 rounded-xl shadow-card p-6 text-center">
            <h2 className="text-2xl font-bold text-white mb-3">Login Required</h2>
            <p className="text-gray-400 text-sm mb-6">
              You need to be logged in to post a job.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 text-transparent bg-clip-text mb-2">
            Post a New Job
          </h1>
          <p className="text-gray-400 text-sm">
            Add your job opening to reach thousands of job seekers
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-dark-850/50 backdrop-blur-xl border border-white/5 rounded-xl shadow-card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Message */}
            {error && (
              <div className="bg-red-950/30 backdrop-blur-sm border border-red-500/20 text-red-400 px-4 py-3 rounded-lg">
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-green-950/30 backdrop-blur-sm border border-green-500/20 text-green-400 px-4 py-3 rounded-lg">
                <p className="text-sm font-medium">{success}</p>
              </div>
            )}

            {/* Job Title */}
            <div>
              <label htmlFor="title" className="block text-xs font-medium text-gray-400 mb-2">
                Job Title <span className="text-red-400">*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Full Stack Developer"
                className="w-full px-3 py-2 text-sm bg-dark-800/80 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-white placeholder:text-gray-500 transition-all"
              />
            </div>

            {/* Company Name */}
            <div>
              <label htmlFor="company" className="block text-xs font-medium text-gray-400 mb-2">
                Company Name <span className="text-red-400">*</span>
              </label>
              <input
                id="company"
                name="company"
                type="text"
                required
                value={formData.company}
                onChange={handleChange}
                placeholder="e.g., Tech Solutions Inc"
                className="w-full px-3 py-2 text-sm bg-dark-800/80 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-white placeholder:text-gray-500 transition-all"
              />
            </div>

            {/* Location and Type in same row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Location */}
              <div>
                <label htmlFor="location" className="block text-xs font-medium text-gray-400 mb-2">
                  Location <span className="text-red-400">*</span>
                </label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  required
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., Mumbai, Remote"
                  className="w-full px-3 py-2 text-sm bg-dark-800/80 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-white placeholder:text-gray-500 transition-all"
                />
              </div>

              {/* Job Type */}
              <div>
                <label htmlFor="type" className="block text-xs font-medium text-gray-400 mb-2">
                  Job Type <span className="text-red-400">*</span>
                </label>
                <select
                  id="type"
                  name="type"
                  required
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm bg-dark-800/80 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-white transition-all"
                >
                  <option value="Job">Full-Time Job</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-xs font-medium text-gray-400 mb-2">
                Job Description <span className="text-red-400">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={5}
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the role, responsibilities, and what you're looking for..."
                className="w-full px-3 py-2 text-sm bg-dark-800/80 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-white placeholder:text-gray-500 transition-all resize-none min-h-32"
              />
            </div>

            {/* Requirements */}
            <div>
              <label htmlFor="requirements" className="block text-xs font-medium text-gray-400 mb-2">
                Requirements (Optional)
              </label>
              <textarea
                id="requirements"
                name="requirements"
                rows={4}
                value={formData.requirements}
                onChange={handleChange}
                placeholder="Skills, experience, education requirements..."
                className="w-full px-3 py-2 text-sm bg-dark-800/80 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-white placeholder:text-gray-500 transition-all resize-none min-h-24"
              />
            </div>

            {/* Salary */}
            <div>
              <label htmlFor="salary" className="block text-xs font-medium text-gray-400 mb-2">
                Salary (Optional)
              </label>
              <input
                id="salary"
                name="salary"
                type="text"
                value={formData.salary}
                onChange={handleChange}
                placeholder="e.g., ₹5-10 LPA, $50k-80k, Competitive"
                className="w-full px-3 py-2 text-sm bg-dark-800/80 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-white placeholder:text-gray-500 transition-all"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2.5 px-6 rounded-lg text-sm font-semibold text-white transition-all duration-200 shadow-lg hover:shadow-xl ${
                  loading
                    ? 'bg-gray-600/50 cursor-not-allowed'
                    : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Posting Job...
                  </span>
                ) : (
                  'Post Job'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadJob;
