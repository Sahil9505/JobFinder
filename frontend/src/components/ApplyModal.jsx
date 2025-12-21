import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { submitApplication } from '../services/api';

const ApplyModal = ({ job, open, onClose, onSuccess, isApplied = false, existingApplication = null }) => {
  // Props: isApplied and existingApplication are provided by parent to prevent duplicate applies
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [college, setCollege] = useState('');
  const [degree, setDegree] = useState('');
  const [currentYear, setCurrentYear] = useState('');
  const [skills, setSkills] = useState(''); // comma-separated
  const [message, setMessage] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (user) {
      setFullName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  useEffect(() => {
    if (!open) {
      // reset form when closed
      setPhone('');
      setCollege('');
      setDegree('');
      setCurrentYear('');
      setSkills('');
      setMessage('');
      setResumeFile(null);
      setLoading(false);
      setProgress(0);
      setError('');
      setSuccess('');
    }
  }, [open]);

  if (!open || !job) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Accept PDF only
    if (!file.name.toLowerCase().match(/\.(pdf)$/)) {
      setError('Only PDF resumes are allowed');
      return;
    }
    setError('');
    setResumeFile(file);
  };

  // Ensure user is authenticated before submitting/uploading
  const requireAuth = () => {
    if (!isAuthenticated) {
      setError('Please sign in to apply. Redirecting to login...');
      setTimeout(() => navigate('/login', { state: { from: `/jobs/${job._id || job.id}` } }), 900);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!requireAuth()) return;

    if (!fullName || !email || !phone || !resumeFile) {
      setError('Please fill required fields and upload your resume (PDF)');
      return;
    }

    const formData = new FormData();
    formData.append('jobId', job._id || job.id);
    formData.append('fullName', fullName);
    formData.append('email', email);
    if (phone) formData.append('phone', phone);
    if (college) formData.append('college', college);
    if (degree) formData.append('degree', degree);
    if (currentYear) formData.append('currentYear', currentYear);
    if (skills) formData.append('skills', skills);
    if (message) formData.append('message', message);
    formData.append('resume', resumeFile);

    try {
      setLoading(true);
      console.log('ApplyModal: submitting application for job', job._id || job.id);
      const response = await submitApplication(formData, (progressEvent) => {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setProgress(percent);
      });

      if (response.success) {
        setSuccess('✅ Application submitted successfully!');
        // Notify parent and other pages through an event and global toast
        const application = response.application;
        const jobId = application.jobId?._id || application.jobId;
        if (onSuccess) onSuccess(application);
        window.dispatchEvent(new CustomEvent('applicationSubmitted', { detail: { jobId, application, apps: response.data } }));
        window.dispatchEvent(new CustomEvent('appToast', { detail: { message: 'Application submitted successfully', type: 'success' } }));

        // close after short delay
        setTimeout(() => {
          setLoading(false);
          onClose(true);
        }, 1200);
      } else {
        setError(response.message || 'Failed to submit application');
        setLoading(false);
      }
    } catch (err) {
      const status = err.response?.status;
      if (status === 401) {
        setError('Session expired or not signed in. Redirecting to login...');
        setTimeout(() => navigate('/login', { state: { from: `/jobs/${job._id || job.id}` } }), 900);
      } else {
        const msg = err.response?.data?.message || 'Failed to submit application';
        setError(msg);
      }
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-dark-850/95 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-2xl border border-white/10 overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-violet-600/10 to-fuchsia-600/10 border-b border-white/10 p-5">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-white mb-1">Apply for {job.title}</h2>
              <div className="text-xs text-gray-400 flex items-center gap-2">
                <span className="font-medium text-gray-300">{job.company}</span>
                <span className="text-white/30">•</span>
                <span>{job.city || job.location}</span>
                <span className="text-white/30">•</span>
                <span className="text-violet-300">{job.salaryDisplay || 'Competitive'}</span>
              </div>
            </div>
            <button 
              onClick={() => onClose(false)} 
              className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-white/5 rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Form Content */}
        <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Full Name *</label>
              <input 
                type="text" 
                placeholder="User1" 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)} 
                className="w-full px-3 py-2.5 text-sm bg-dark-800/80 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-white transition-all placeholder:text-gray-600"
                required 
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Email *</label>
              <input 
                type="email" 
                placeholder="user1@gmail.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full px-3 py-2.5 text-sm bg-dark-800/80 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-white transition-all placeholder:text-gray-600"
                required 
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Phone Number *</label>
              <input 
                type="text" 
                placeholder="Phone Number" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                className="w-full px-3 py-2.5 text-sm bg-dark-800/80 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-white transition-all placeholder:text-gray-600"
                required 
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">College / University</label>
              <input 
                type="text" 
                placeholder="College / University" 
                value={college} 
                onChange={(e) => setCollege(e.target.value)} 
                className="w-full px-3 py-2.5 text-sm bg-dark-800/80 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-white transition-all placeholder:text-gray-600"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Degree</label>
              <input 
                type="text" 
                placeholder="Degree" 
                value={degree} 
                onChange={(e) => setDegree(e.target.value)} 
                className="w-full px-3 py-2.5 text-sm bg-dark-800/80 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-white transition-all placeholder:text-gray-600"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Current Year</label>
              <input 
                type="text" 
                placeholder="Current Year" 
                value={currentYear} 
                onChange={(e) => setCurrentYear(e.target.value)} 
                className="w-full px-3 py-2.5 text-sm bg-dark-800/80 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-white transition-all placeholder:text-gray-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Skills (comma separated)</label>
            <input 
              type="text" 
              placeholder="e.g. React, Node, SQL" 
              value={skills} 
              onChange={(e) => setSkills(e.target.value)} 
              className="w-full px-3 py-2.5 text-sm bg-dark-800/80 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-white transition-all placeholder:text-gray-600"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Why should we hire you?</label>
            <textarea 
              placeholder="A short note about yourself" 
              value={message} 
              onChange={(e) => setMessage(e.target.value)} 
              className="w-full px-3 py-2.5 text-sm bg-dark-800/80 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-white transition-all placeholder:text-gray-600 resize-none"
              rows="4"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Upload Resume (PDF) *</label>
            <div className="relative">
              <input 
                type="file" 
                accept=".pdf" 
                onChange={handleFileChange} 
                className="hidden" 
                id="resume-upload"
                disabled={!isAuthenticated}
              />
              <label 
                htmlFor="resume-upload" 
                className={`flex items-center justify-center w-full px-4 py-3 text-sm border-2 border-dashed rounded-lg transition-all cursor-pointer ${
                  resumeFile 
                    ? 'border-emerald-500/50 bg-emerald-500/5 text-emerald-300' 
                    : 'border-white/20 bg-dark-800/50 text-gray-400 hover:border-purple-500/50 hover:bg-dark-800/80'
                } ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {resumeFile ? (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">{resumeFile.name}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span>Choose file</span>
                  </div>
                )}
              </label>
            </div>
            {progress > 0 && (
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Uploading...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-dark-800 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-violet-500 to-fuchsia-500 h-full transition-all duration-300" 
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
            {!isAuthenticated && (
              <div className="mt-2 px-3 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-xs text-yellow-300">
                  You must <button onClick={() => navigate('/login', { state: { from: `/jobs/${job._id || job.id}` } })} className="underline font-medium hover:text-yellow-200">sign in</button> to upload a resume and apply.
                </p>
              </div>
            )}
          </div>

          {error && (
            <div className="px-3 py-2.5 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-xs text-red-300">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="px-3 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <p className="text-xs text-emerald-300">{success}</p>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button 
              type="button" 
              onClick={() => onClose(false)} 
              className="px-5 py-2.5 text-sm font-medium text-gray-300 hover:text-white border border-white/10 hover:border-white/20 rounded-lg hover:bg-dark-800/50 transition-all"
            >
              Cancel
            </button>
            {!isAuthenticated ? (
              <button 
                type="button" 
                onClick={() => navigate('/login', { state: { from: `/jobs/${job._id || job.id}` } })} 
                className="relative group px-5 py-2.5 text-sm font-medium text-white rounded-lg overflow-hidden transition-all hover:shadow-glow"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 transition-all group-hover:from-violet-500 group-hover:to-fuchsia-500" />
                <span className="relative">Sign in to Apply</span>
              </button>
            ) : (
              <button 
                type="submit" 
                disabled={loading || isApplied} 
                className={`relative group px-5 py-2.5 text-sm font-medium text-white rounded-lg overflow-hidden transition-all ${
                  loading || isApplied 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:shadow-glow'
                }`}
              >
                <div className={`absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 transition-all ${
                  !(loading || isApplied) && 'group-hover:from-violet-500 group-hover:to-fuchsia-500'
                }`} />
                <span className="relative">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Submitting...
                    </span>
                  ) : (isApplied ? 'Already Applied' : 'Submit Application')}
                </span>
              </button>
            )}
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};

export default ApplyModal;
