import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getServerURL } from '../services/api';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinkClass = (path) => `
    relative px-4 py-2 text-sm font-semibold transition-all duration-300
    ${isActive(path) 
      ? 'text-white' 
      : 'text-gray-300 hover:text-white'
    }
    after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 
    after:h-0.5 after:bg-gradient-to-r after:from-violet-500 after:to-fuchsia-500
    after:transform after:transition-transform after:duration-300
    ${isActive(path) ? 'after:scale-x-100' : 'after:scale-x-0 hover:after:scale-x-100'}
  `;

  return (
    <nav className="bg-dark-900/95 backdrop-blur-lg border-b border-white/5 sticky top-0 z-50 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo with gradient */}
          <Link to="/" className="flex items-center group flex-shrink-0 space-x-3">
            <div className="bg-white/95 rounded-lg p-2 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <img 
                src="/logos/JobNest.png" 
                alt="JobNest" 
                className="h-8 w-8 object-contain"
              />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-violet-400 via-fuchsia-400 to-violet-400 bg-clip-text text-transparent hover:from-violet-300 hover:via-fuchsia-300 hover:to-violet-300 transition-all duration-300">
              JobNest
            </span>
          </Link>

          {/* Desktop Navigation - Centered */}
          <div className="hidden md:flex items-center space-x-1 flex-1 justify-center">
            <Link to="/jobs" className={navLinkClass('/jobs')}>
              Find Jobs
            </Link>
            <Link to="/companies" className={navLinkClass('/companies')}>
              Companies
            </Link>
            <Link to="/upload-job" className={navLinkClass('/upload-job')}>
              Post Job
            </Link>
            <Link to="/about" className={navLinkClass('/about')}>
              About
            </Link>
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center space-x-4 flex-shrink-0">
            {isAuthenticated ? (
              <>
                <Link
                  to="/my-applications"
                  className="px-4 py-2 text-sm font-semibold text-gray-300 hover:text-white transition-colors duration-300"
                >
                  My Applications
                </Link>
                
                {/* User Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg overflow-hidden">
                      {user?.profileImage ? (
                        <img 
                          src={`${getServerURL()}${user.profileImage}`} 
                          alt={user.name} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <span className={`text-white text-sm font-bold ${user?.profileImage ? 'hidden' : 'flex'}`}>
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <span className="text-gray-200 text-sm font-semibold">
                      {user?.name}
                    </span>
                    <svg className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${profileDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-dark-850/95 backdrop-blur-xl rounded-xl shadow-card border border-white/10 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-4 py-3 border-b border-white/10">
                        <p className="text-sm font-semibold text-white">{user?.name}</p>
                        <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors duration-200"
                      >
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        My Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors duration-200"
                      >
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link
                to="/login"
                className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-lg text-sm font-bold transition-all duration-300 shadow-lg hover:shadow-violet-500/50 transform hover:scale-105"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-300 flex-shrink-0"
            aria-label="Toggle mobile menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/5 bg-dark-900/98 backdrop-blur-lg animate-in slide-in-from-top duration-200">
          <div className="px-4 py-4 space-y-2">
            <Link
              to="/jobs"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-300 ${
                isActive('/jobs')
                  ? 'bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 text-white border border-violet-500/30'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Find Jobs
            </Link>
            <Link
              to="/companies"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-300 ${
                isActive('/companies')
                  ? 'bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 text-white border border-violet-500/30'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Companies
            </Link>
            <Link
              to="/upload-job"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-300 ${
                isActive('/upload-job')
                  ? 'bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 text-white border border-violet-500/30'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Post Job
            </Link>
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-300 ${
                isActive('/about')
                  ? 'bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 text-white border border-violet-500/30'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              About
            </Link>

            {/* Mobile Auth Section */}
            <div className="pt-4 mt-4 border-t border-white/10 space-y-2">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center space-x-3 px-4 py-3 mb-2 rounded-lg bg-white/5 border border-white/10">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg overflow-hidden">
                      {user?.profileImage ? (
                        <img 
                          src={`${getServerURL()}${user.profileImage}`} 
                          alt={user.name} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <span className={`text-white font-bold ${user?.profileImage ? 'hidden' : 'flex'}`}>
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm truncate">{user?.name}</p>
                      <p className="text-gray-400 text-xs truncate">{user?.email}</p>
                    </div>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center px-4 py-3 rounded-lg text-sm font-semibold text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-300"
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    My Profile
                  </Link>
                  <Link
                    to="/my-applications"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center px-4 py-3 rounded-lg text-sm font-semibold text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-300"
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    My Applications
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-lg text-sm font-bold transition-all duration-300 shadow-lg"
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full px-4 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-lg text-sm font-bold text-center transition-all duration-300 shadow-lg"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
