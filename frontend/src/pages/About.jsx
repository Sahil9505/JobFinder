const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-dark-900 via-dark-900 to-dark-950">
      {/* Hero Section */}
      <section className="py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          About <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 text-transparent bg-clip-text">JobNest</span>
        </h1>
        <p className="max-w-2xl mx-auto text-base text-gray-400">
          Your trusted platform to discover real jobs and internships across India —
          built for students, freshers, and professionals.
        </p>
      </section>

      {/* Content Section */}
      <section className="max-w-6xl mx-auto px-4 pb-20 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="bg-dark-850/50 backdrop-blur-xl rounded-xl shadow-card p-5 hover:shadow-card-hover transition border border-white/5 group">
          <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 text-2xl mb-4 group-hover:scale-110 transition-transform">
            🎯
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Our Mission
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            To simplify the job and internship search process by providing
            verified, India-based opportunities in one place.
          </p>
        </div>

        {/* Card 2 */}
        <div className="bg-dark-850/50 backdrop-blur-xl rounded-xl shadow-card p-5 hover:shadow-card-hover transition border border-white/5 group">
          <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-2xl mb-4 group-hover:scale-110 transition-transform">
            🚀
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            What We Offer
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            A real-world job portal experience with apply, cancel, tracking,
            and verified company listings — just like top platforms.
          </p>
        </div>

        {/* Card 3 */}
        <div className="bg-dark-850/50 backdrop-blur-xl rounded-xl shadow-card p-5 hover:shadow-card-hover transition border border-white/5 group">
          <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/20 text-2xl mb-4 group-hover:scale-110 transition-transform">
            🇮🇳
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            India-Focused
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            All jobs and internships are tailored for Indian cities, colleges,
            and students — no fake or foreign listings.
          </p>
        </div>
      </section>

      {/* Footer Note */}
      <div className="text-center pb-10">
        <p className="text-gray-500">
          Built with ❤️ using MERN Stack to help you build your future.
        </p>
      </div>
    </div>
  );
};

export default About;

