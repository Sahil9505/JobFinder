import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { getJobById } from '../services/api';
import ApplyModal from '../components/ApplyModal';
import { useAuth } from '../context/AuthContext';

const JobDetail = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applyOpen, setApplyOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  useEffect(() => {
    fetchJob();
  }, [id]);

  useEffect(() => {
    // If navigation set state to openApply, open modal when job loaded
    if (location?.state?.openApply && job) {
      setApplyOpen(true);
    }
  }, [location, job]);

  const fetchJob = async () => {
    try {
      setLoading(true);
      const res = await getJobById(id);
      if (res.success) {
        setJob(res.data);
      } else {
        setError(res.message || 'Job not found');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load job');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!job) return null;

  const isExternal = (job.applyType && job.applyType === 'external') || (job.jobType && job.jobType === 'Platform');

  return (
    <div className="min-h-screen bg-dark-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-dark-850/50 backdrop-blur-xl border border-white/5 shadow-card p-5 rounded-xl">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-semibold mb-1 text-white">{job.title}</h1>
              <div className="text-gray-300 font-medium mb-2">{job.company}</div>
              <div className="text-sm text-gray-400 mb-3 flex items-center gap-2">
                <span>{job.city || job.location}</span>
                <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-violet-500/10 to-purple-500/10 text-violet-300 text-xs border border-violet-500/20">{job.type}</span>
                <span className="text-xs text-gray-500">{job.experience || '0-2 yrs'}</span>
              </div>
            </div>
            <div className="space-y-2 text-right">
              <div className="mb-2">
                <div className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-300 text-sm font-medium border border-yellow-500/30">{job.salaryDisplay || 'Competitive'}</div>
              </div>
              {isExternal ? (
                <a href={job.applyUrl || '#'} target="_blank" rel="noreferrer" className="inline-block px-4 py-2 bg-gradient-to-r from-orange-600 to-violet-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-orange-500/25 transition-all">Apply on External Site</a>
              ) : (
                <button onClick={() => setApplyOpen(true)} className="inline-block px-4 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-violet-500/25 transition-all">Apply Now</button>
              )}
            </div>
          </div>

          <div className="my-4 border-t border-white/5"></div>

          {/* Summary row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <div>
              <h3 className="text-xs font-medium text-gray-400 uppercase mb-1">Posted</h3>
              <div className="text-gray-300">{new Date(job.createdAt).toLocaleDateString()}</div>
            </div>
            <div>
              <h3 className="text-xs font-medium text-gray-400 uppercase mb-1">Location & Role</h3>
              <div className="text-gray-300">{job.location} • {job.type}</div>
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-5">
            <section>
              <h4 className="text-xs font-medium text-gray-400 uppercase mb-2">Job Description</h4>
              <div className="bg-dark-800/50 rounded-lg p-4 text-gray-300 text-sm leading-relaxed">{job.description}</div>
            </section>

            <section>
              <h4 className="text-xs font-medium text-gray-400 uppercase mb-2">Responsibilities</h4>
              <div className="bg-dark-800/50 rounded-lg p-4">
                <ul className="list-disc pl-5 text-gray-300 text-sm space-y-1">
                  {(job.responsibilities && job.responsibilities.length) ? job.responsibilities.map((r, i) => (
                    <li key={i}>{r}</li>
                  )) : (
                    <li>Responsibilities will be shared by the employer.</li>
                  )}
                </ul>
              </div>
            </section>

            <section>
              <h4 className="text-xs font-medium text-gray-400 uppercase mb-2">Skills Required</h4>
              <div className="flex flex-wrap gap-2">
                {(job.skills && job.skills.length) ? job.skills.map((s, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 text-blue-300 text-xs border border-blue-500/20">{s}</span>
                )) : (
                  <span className="text-gray-400 text-sm">Skills will be added by employer.</span>
                )}
              </div>
            </section>

            <section>
              <h4 className="text-xs font-medium text-gray-400 uppercase mb-2">Eligibility</h4>
              <div className="bg-dark-800/50 rounded-lg p-4 text-gray-300 text-sm">{job.eligibility || 'Open to all eligible candidates. Please check the role requirements.'}</div>
            </section>

            <section>
              <h4 className="text-xs font-medium text-gray-400 uppercase mb-2">Perks</h4>
              <div className="flex flex-wrap gap-2">
                {(job.perks && job.perks.length) ? job.perks.map((p, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-full bg-gradient-to-r from-green-500/10 to-emerald-500/10 text-green-300 text-xs border border-green-500/20">{p}</span>
                )) : (
                  <span className="text-gray-400 text-sm">Standard company perks</span>
                )}
              </div>
            </section>

            <section>
              <h4 className="text-xs font-medium text-gray-400 uppercase mb-2">About Company</h4>
              <div className="bg-dark-800/50 rounded-lg p-4 text-gray-300 text-sm">{job.aboutCompany || `${job.company || 'This company'} is a growing organisation based in India.`}</div>
            </section>
          </div>
        </div>
      </div>

      <ApplyModal job={job} open={applyOpen} onClose={() => setApplyOpen(false)} onSuccess={() => { setApplyOpen(false); }} />
    </div>
  );
};

export default JobDetail;
