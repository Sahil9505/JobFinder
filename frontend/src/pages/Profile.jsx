import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { updateProfile, changePassword, sendVerificationEmail, getAccountActivity, getMyApplications, getServerURL } from '../services/api';
import PasswordStrengthIndicator, { validatePassword } from '../components/PasswordStrengthIndicator';

const Profile = () => {
  const { user, isAuthenticated, updateUser } = useAuth();
  const navigate = useNavigate();
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    username: '',
  });
  
  const [fieldErrors, setFieldErrors] = useState({
    name: '',
    email: '',
    phone: '',
    username: '',
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('profile'); // profile, password, account
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [accountActivity, setAccountActivity] = useState(null);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [applicationCount, setApplicationCount] = useState(0);
  const [statsLoading, setStatsLoading] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        username: user.username || user.email?.split('@')[0] || '',
      });
    }
  }, [user]);

  // Calculate profile completion percentage
  const calculateProfileCompletion = (userData) => {
    if (!userData) return 0;
    
    let completed = 0;
    const totalFields = 6;
    
    // Required fields (count more)
    if (userData.name && userData.name.trim()) completed += 1;
    if (userData.email && userData.email.trim()) completed += 1;
    if (userData.username && userData.username.trim()) completed += 1;
    
    // Optional but important fields
    if (userData.phone && userData.phone.trim()) completed += 1;
    if (userData.profileImage) completed += 1;
    if (userData.isVerified || userData.emailVerified) completed += 1;
    
    return Math.round((completed / totalFields) * 100);
  };

  // Fetch account activity and application count
  useEffect(() => {
    const fetchStats = async () => {
      if (user && isAuthenticated) {
        setStatsLoading(true);
        try {
          // Fetch account activity
          const activityResponse = await getAccountActivity();
          if (activityResponse.success) {
            setAccountActivity(activityResponse.data);
          }
          
          // Fetch applications count
          const appsResponse = await getMyApplications();
          if (appsResponse.success && appsResponse.data) {
            setApplicationCount(appsResponse.data.length);
          }
        } catch (error) {
          console.error('Failed to fetch stats:', error);
        } finally {
          setStatsLoading(false);
        }
      }
    };
    fetchStats();
  }, [user, isAuthenticated]);

  // Update profile completion when user data changes
  useEffect(() => {
    if (user) {
      const completion = calculateProfileCompletion(user);
      setProfileCompletion(completion);
    }
  }, [user]);

  // Handle send verification email
  const handleSendVerification = async () => {
    setVerificationLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const response = await sendVerificationEmail();
      if (response.success) {
        setMessage({ type: 'success', text: response.message });
      } else {
        setMessage({ type: 'error', text: response.message });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to send verification email';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setVerificationLoading(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    }
  };

  // Validate individual field
  const validateField = (name, value) => {
    let error = '';
    
    switch(name) {
      case 'name':
        if (!value.trim()) {
          error = 'Name is required';
        } else if (value.trim().length < 2) {
          error = 'Name must be at least 2 characters';
        } else if (value.trim().length > 50) {
          error = 'Name must not exceed 50 characters';
        }
        break;
      
      case 'email':
        if (!value.trim()) {
          error = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Please enter a valid email address';
        }
        break;
      
      case 'phone':
        if (value && !/^[+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/.test(value)) {
          error = 'Please enter a valid phone number';
        }
        break;
      
      case 'username':
        if (!value.trim()) {
          error = 'Username is required';
        } else if (value.trim().length < 3) {
          error = 'Username must be at least 3 characters';
        } else if (value.trim().length > 20) {
          error = 'Username must not exceed 20 characters';
        } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
          error = 'Username can only contain letters, numbers, and underscores';
        }
        break;
      
      default:
        break;
    }
    
    return error;
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear field error and validate on change
    const error = validateField(name, value);
    setFieldErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setMessage({ 
          type: 'error', 
          text: 'Please upload a valid image file (JPG, PNG, GIF, or WebP)' 
        });
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ 
          type: 'error', 
          text: 'Image size must be less than 5MB' 
        });
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
        return;
      }
      
      setProfileImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle profile update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    // Validate all fields
    const errors = {
      name: validateField('name', formData.name),
      email: validateField('email', formData.email),
      phone: validateField('phone', formData.phone),
      username: validateField('username', formData.username),
    };
    
    setFieldErrors(errors);
    
    // Check if there are any errors
    const hasErrors = Object.values(errors).some(error => error !== '');
    if (hasErrors) {
      setMessage({ 
        type: 'error', 
        text: 'Please fix the errors in the form before submitting' 
      });
      setLoading(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('email', formData.email.trim());
      formDataToSend.append('phone', formData.phone.trim() || '');
      formDataToSend.append('username', formData.username.trim());
      if (profileImage) {
        formDataToSend.append('profileImage', profileImage);
      }

      console.log('Updating profile with data:', {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || '',
        username: formData.username.trim()
      });

      const response = await updateProfile(formDataToSend);

      if (response.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        if (updateUser && response.user) {
          updateUser(response.user);
          // Recalculate profile completion
          const newCompletion = calculateProfileCompletion(response.user);
          setProfileCompletion(newCompletion);
        }
        setProfileImage(null);
        setImagePreview(null);
      } else {
        setMessage({ type: 'error', text: response.message || 'Failed to update profile' });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred. Please try again.';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    }
  };

  // Handle password update
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    // Validation
    if (!validatePassword(passwordData.newPassword)) {
      setMessage({ type: 'error', text: 'Password does not meet all requirements. Please ensure it includes at least 8 characters, uppercase, lowercase, number, and special character.' });
      setLoading(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      setLoading(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
      return;
    }

    try {
      console.log('Attempting to change password...');
      const response = await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      console.log('Password change response:', response);

      if (response.success) {
        setMessage({ type: 'success', text: 'Password changed successfully!' });
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        setMessage({ type: 'error', text: response.message || 'Failed to change password' });
      }
    } catch (error) {
      console.error('Password change error:', error);
      console.error('Error response:', error.response);
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred. Please try again.';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-dark-950 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Message Banner */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl border backdrop-blur-sm ${
            message.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          } animate-in fade-in slide-in-from-top duration-300`}>
            <div className="flex items-center">
              {message.type === 'success' ? (
                <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <p className="font-semibold text-sm">{message.text}</p>
            </div>
          </div>
        )}

        {/* Profile Header Section */}
        <div className="mb-6">
          <div className="bg-dark-850/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
            {/* Gradient Banner */}
            <div className="h-32 bg-gradient-to-r from-violet-600/20 via-purple-600/20 to-fuchsia-600/20 relative">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50" />
            </div>

            {/* Profile Content */}
            <div className="px-6 sm:px-8 pb-6 relative">
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 -mt-16 relative z-10">
                {/* Avatar with Upload */}
                <div className="relative group">
                  <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 p-1 shadow-2xl shadow-violet-500/50 ring-4 ring-dark-850">
                    <div className="w-full h-full rounded-xl overflow-hidden bg-dark-800">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : user.profileImage ? (
                        <img src={`${getServerURL()}${user.profileImage}`} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-5xl font-bold bg-gradient-to-br from-violet-500 to-fuchsia-500">
                          {user.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                    </div>
                  </div>
                  <label className="absolute -bottom-2 -right-2 w-12 h-12 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 rounded-xl flex items-center justify-center cursor-pointer shadow-xl transition-all duration-300 group-hover:scale-110">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                  {imagePreview && (
                    <div className="absolute -bottom-10 left-0 right-0 text-center">
                      <p className="text-xs text-emerald-400 bg-dark-850/80 backdrop-blur-sm px-3 py-1 rounded-lg inline-block">
                        ✓ New image selected
                      </p>
                    </div>
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h1 className="text-3xl font-bold text-white mb-2 truncate">{user.name || 'User'}</h1>
                      <p className="text-gray-400 text-sm mb-3">@{user.username || user.email?.split('@')[0] || 'username'}</p>
                      <div className="flex flex-wrap gap-2">
                        <div className="inline-flex items-center px-3 py-1.5 bg-dark-800/80 rounded-lg border border-white/10 text-sm">
                          <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span className="text-gray-300 truncate max-w-[200px]">{user.email}</span>
                        </div>
                        {user.phone && (
                          <div className="inline-flex items-center px-3 py-1.5 bg-dark-800/80 rounded-lg border border-white/10 text-sm">
                            <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <span className="text-gray-300">{user.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Stats Cards - Horizontal on Desktop */}
                    <div className="flex gap-3">
                      <div className="bg-dark-800/60 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3 text-center min-w-[90px] transition-all duration-300 hover:bg-dark-800/80">
                        {statsLoading ? (
                          <div className="flex justify-center">
                            <div className="w-5 h-5 border-2 border-violet-400 border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        ) : (
                          <p className="text-2xl font-bold text-white mb-0.5 transition-all duration-500">{applicationCount}</p>
                        )}
                        <p className="text-xs text-gray-400 font-medium">Applications</p>
                      </div>
                      <div className="bg-dark-800/60 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3 text-center min-w-[90px]">
                        <p className="text-2xl font-bold mb-0.5">
                          {user.emailVerified || user.isVerified ? (
                            <span className="text-emerald-400">✓</span>
                          ) : (
                            <span className="text-yellow-400">!</span>
                          )}
                        </p>
                        <p className="text-xs text-gray-400 font-medium">Verified</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="bg-dark-850/80 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
            <nav className="flex overflow-x-auto scrollbar-hide" aria-label="Profile sections">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex-1 min-w-[140px] px-6 py-4 text-sm font-semibold transition-all duration-200 border-b-2 ${
                  activeTab === 'profile'
                    ? 'text-white bg-dark-800/50 border-violet-500'
                    : 'text-gray-400 hover:text-white hover:bg-dark-800/30 border-transparent'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Personal Info</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`flex-1 min-w-[140px] px-6 py-4 text-sm font-semibold transition-all duration-200 border-b-2 ${
                  activeTab === 'password'
                    ? 'text-white bg-dark-800/50 border-violet-500'
                    : 'text-gray-400 hover:text-white hover:bg-dark-800/30 border-transparent'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Security</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('account')}
                className={`flex-1 min-w-[140px] px-6 py-4 text-sm font-semibold transition-all duration-200 border-b-2 ${
                  activeTab === 'account'
                    ? 'text-white bg-dark-800/50 border-violet-500'
                    : 'text-gray-400 hover:text-white hover:bg-dark-800/30 border-transparent'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Account</span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Profile Information Tab */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Profile Form - 2/3 width */}
            <div className="lg:col-span-2">
              <div className="bg-dark-850/80 backdrop-blur-xl rounded-xl border border-white/10 p-8">
                {/* Section Header */}
                <div className="flex items-center mb-8 pb-4 border-b border-white/10">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Edit Profile</h2>
                    <p className="text-sm text-gray-400 mt-0.5">Update your personal information</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Full Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-200 mb-2">
                      Full Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3.5 text-base bg-dark-800/50 border rounded-xl focus:outline-none focus:ring-2 text-white transition-all placeholder:text-gray-500 ${
                        fieldErrors.name 
                          ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50' 
                          : 'border-white/10 focus:ring-violet-500/50 focus:border-violet-500/50'
                      }`}
                      placeholder="Enter your full name"
                    />
                    {fieldErrors.name && (
                      <p className="mt-2 text-sm text-red-400 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {fieldErrors.name}
                      </p>
                    )}
                  </div>

                  {/* Username */}
                  <div>
                    <label htmlFor="username" className="block text-sm font-semibold text-gray-200 mb-2">
                      Username <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">@</span>
                      <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                        className={`w-full pl-9 pr-4 py-3.5 text-base bg-dark-800/50 border rounded-xl focus:outline-none focus:ring-2 text-white transition-all placeholder:text-gray-500 ${
                          fieldErrors.username 
                            ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50' 
                            : 'border-white/10 focus:ring-violet-500/50 focus:border-violet-500/50'
                        }`}
                        placeholder="username"
                      />
                    </div>
                    {fieldErrors.username && (
                      <p className="mt-2 text-sm text-red-400 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {fieldErrors.username}
                      </p>
                    )}
                  </div>

                  {/* Email Address */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-200 mb-2">
                      Email Address <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3.5 text-base bg-dark-800/50 border rounded-xl focus:outline-none focus:ring-2 text-white transition-all placeholder:text-gray-500 ${
                        fieldErrors.email 
                          ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50' 
                          : 'border-white/10 focus:ring-violet-500/50 focus:border-violet-500/50'
                      }`}
                      placeholder="your.email@example.com"
                    />
                    {fieldErrors.email && (
                      <p className="mt-2 text-sm text-red-400 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {fieldErrors.email}
                      </p>
                    )}
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-gray-200 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full px-4 py-3.5 text-base bg-dark-800/50 border rounded-xl focus:outline-none focus:ring-2 text-white transition-all placeholder:text-gray-500 ${
                        fieldErrors.phone 
                          ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50' 
                          : 'border-white/10 focus:ring-violet-500/50 focus:border-violet-500/50'
                      }`}
                      placeholder="+91 1234567890"
                    />
                    {fieldErrors.phone && (
                      <p className="mt-2 text-sm text-red-400 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {fieldErrors.phone}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({
                          name: user.name || '',
                          email: user.email || '',
                          phone: user.phone || '',
                          username: user.username || user.email?.split('@')[0] || '',
                        });
                        setFieldErrors({
                          name: '',
                          email: '',
                          phone: '',
                          username: '',
                        });
                        setImagePreview(null);
                        setProfileImage(null);
                        setMessage({ type: '', text: '' });
                      }}
                      className="px-6 py-3 bg-dark-800/80 hover:bg-dark-800 border border-white/10 text-gray-300 hover:text-white rounded-xl font-semibold text-sm transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Sidebar - Stats & Info - 1/3 width */}
            <div className="lg:col-span-1 space-y-6">
              {/* Profile Completion */}
              <div className="bg-gradient-to-br from-violet-500/10 via-purple-500/10 to-fuchsia-500/10 backdrop-blur-xl rounded-xl border border-violet-500/20 p-6 transition-all duration-300 hover:border-violet-500/30">
                <div className="text-center mb-6">
                  <div className="relative inline-flex items-center justify-center">
                    <svg className="w-28 h-28 transform -rotate-90">
                      <circle cx="56" cy="56" r="48" stroke="currentColor" strokeWidth="8" fill="none" className="text-dark-800/50" />
                      <circle 
                        cx="56" 
                        cy="56" 
                        r="48" 
                        stroke="url(#gradient)" 
                        strokeWidth="8" 
                        fill="none" 
                        strokeDasharray="301.6" 
                        strokeDashoffset={301.6 - (301.6 * profileCompletion) / 100} 
                        className="transition-all duration-1000 ease-out" 
                        strokeLinecap="round" 
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#d946ef" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute">
                      <span className="text-3xl font-bold text-white transition-all duration-500">{profileCompletion}%</span>
                    </div>
                  </div>
                </div>
                <h3 className="text-center font-bold text-white text-lg mb-2">Profile Completion</h3>
                <p className="text-center text-xs text-gray-400 mb-6">Complete your profile to increase visibility</p>
                <div className="space-y-3">
                  {/* Basic Info */}
                  <div className="flex items-start gap-3 transition-all duration-300">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-300 ${
                      user.name && user.email && user.username 
                        ? 'bg-emerald-500/20' 
                        : 'bg-gray-700/50'
                    }`}>
                      {user.name && user.email && user.username ? (
                        <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-gray-500" />
                      )}
                    </div>
                    <span className={`text-sm transition-colors duration-300 ${
                      user.name && user.email && user.username ? 'text-gray-300' : 'text-gray-500'
                    }`}>Basic info added</span>
                  </div>
                  
                  {/* Phone Number */}
                  <div className="flex items-start gap-3 transition-all duration-300">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-300 ${
                      user.phone 
                        ? 'bg-emerald-500/20' 
                        : 'bg-gray-700/50'
                    }`}>
                      {user.phone ? (
                        <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-gray-500" />
                      )}
                    </div>
                    <span className={`text-sm transition-colors duration-300 ${
                      user.phone ? 'text-gray-300' : 'text-gray-500'
                    }`}>Add phone number</span>
                  </div>
                  
                  {/* Profile Picture */}
                  <div className="flex items-start gap-3 transition-all duration-300">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-300 ${
                      user.profileImage 
                        ? 'bg-emerald-500/20' 
                        : 'bg-gray-700/50'
                    }`}>
                      {user.profileImage ? (
                        <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-gray-500" />
                      )}
                    </div>
                    <span className={`text-sm transition-colors duration-300 ${
                      user.profileImage ? 'text-gray-300' : 'text-gray-500'
                    }`}>Upload profile picture</span>
                  </div>
                  
                  {/* Email Verification */}
                  <div className="flex items-start gap-3 transition-all duration-300">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-300 ${
                      user.isVerified || user.emailVerified 
                        ? 'bg-emerald-500/20' 
                        : 'bg-gray-700/50'
                    }`}>
                      {user.isVerified || user.emailVerified ? (
                        <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-gray-500" />
                      )}
                    </div>
                    <span className={`text-sm transition-colors duration-300 ${
                      user.isVerified || user.emailVerified ? 'text-gray-300' : 'text-gray-500'
                    }`}>Verify email address</span>
                  </div>
                </div>
              </div>

              {/* Activity Summary */}
              <div className="bg-dark-850/80 backdrop-blur-xl rounded-xl border border-white/10 p-6 transition-all duration-300 hover:border-white/20">
                <div className="flex items-center mb-5">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-white text-lg">Activity</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center group">
                    <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">Applications</span>
                    <span className="text-sm font-bold text-white px-3 py-1 bg-dark-800/50 rounded-lg transition-all duration-300 group-hover:bg-dark-800/70 group-hover:scale-105">
                      {statsLoading ? (
                        <div className="w-4 h-4 border-2 border-violet-400 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <span className="transition-all duration-500">{applicationCount}</span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center group">
                    <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">Profile views</span>
                    <span className="text-sm font-bold text-white px-3 py-1 bg-dark-800/50 rounded-lg transition-all duration-300 group-hover:bg-dark-800/70">-</span>
                  </div>
                  <div className="flex justify-between items-center group">
                    <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">Member for</span>
                    <span className="text-sm font-bold text-white px-3 py-1 bg-dark-800/50 rounded-lg transition-all duration-300 group-hover:bg-dark-800/70">
                      {accountActivity?.accountAge !== undefined ? (
                        <span className="transition-all duration-500">{accountActivity.accountAge} days</span>
                      ) : user.createdAt ? (
                        Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)) + ' days'
                      ) : 'New'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security/Password Tab */}
        {activeTab === 'password' && (
          <div className="bg-dark-850/50 backdrop-blur-xl rounded-xl shadow-card border border-white/10 p-4 max-w-2xl mx-auto">
            <div className="flex items-start mb-4">
              <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center mr-2.5">
                <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-0.5">Change Password</h3>
                <p className="text-xs text-gray-400">Ensure your account is using a strong password to stay secure.</p>
              </div>
            </div>
            
            <form onSubmit={handlePasswordSubmit} className="space-y-3.5">
              {/* Current Password */}
              <div>
                <label htmlFor="currentPassword" className="block text-xs font-semibold text-gray-200 mb-1.5">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    id="currentPassword"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                    className="w-full px-3 py-2 pr-10 text-sm bg-dark-800/80 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 text-white transition-all placeholder:text-gray-500"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 focus:outline-none transition-colors"
                  >
                    {showCurrentPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label htmlFor="newPassword" className="block text-xs font-semibold text-gray-200 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    id="newPassword"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                    className="w-full px-3 py-2 pr-10 text-sm bg-dark-800/80 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 text-white transition-all placeholder:text-gray-500"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 focus:outline-none transition-colors"
                  >
                    {showNewPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                <PasswordStrengthIndicator password={passwordData.newPassword} />
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-xs font-semibold text-gray-200 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    className="w-full px-3 py-2 pr-10 text-sm bg-dark-800/80 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 text-white transition-all placeholder:text-gray-500"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 focus:outline-none transition-colors"
                  >
                    {showConfirmPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Password Match Warning */}
              {passwordData.newPassword && passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-2 flex items-start">
                  <svg className="w-4 h-4 text-amber-400 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-xs text-amber-300 font-medium">Both passwords must be the same</p>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={loading || !validatePassword(passwordData.newPassword) || passwordData.newPassword !== passwordData.confirmPassword}
                  className="relative px-5 py-2 group/btn overflow-hidden rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 opacity-100 group-hover/btn:opacity-0 transition-opacity duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-violet-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 blur-lg opacity-0 group-hover/btn:opacity-50 transition-opacity duration-300" />
                  <span className="relative flex items-center text-sm font-bold text-white">
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Updating...
                      </>
                    ) : (
                      'Update Password'
                    )}
                  </span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Account Details Tab */}
        {activeTab === 'account' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Account Information Card */}
            <div className="bg-dark-850/50 backdrop-blur-xl rounded-xl shadow-card border border-white/10 p-6">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Account Details</h3>
                  <p className="text-sm text-gray-400">Your account information</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {/* Account ID */}
                <div className="p-4 bg-dark-800/50 rounded-lg border border-white/5">
                  <p className="text-xs font-bold text-gray-400 mb-2">ACCOUNT ID</p>
                  <p className="text-sm font-mono text-white break-all">
                    {user._id || user.id || 'N/A'}
                  </p>
                </div>

                {/* Role Badge */}
                <div className="flex items-center justify-between p-4 bg-dark-800/50 rounded-lg border border-white/5">
                  <div>
                    <p className="text-xs font-bold text-gray-400 mb-1">ROLE</p>
                    <p className="text-sm text-gray-300">Account type</p>
                  </div>
                  <span className="px-4 py-2 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 border border-violet-500/30 text-violet-300 rounded-lg text-sm font-bold">
                    {user.role || 'User'}
                  </span>
                </div>

                {/* Member Since */}
                <div className="p-4 bg-dark-800/50 rounded-lg border border-white/5">
                  <p className="text-xs font-bold text-gray-400 mb-2">MEMBER SINCE</p>
                  <p className="text-sm text-white font-medium">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    }) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Status & Activity Card */}
            <div className="bg-dark-850/50 backdrop-blur-xl rounded-xl shadow-card border border-white/10 p-6">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Status & Activity</h3>
                  <p className="text-sm text-gray-400">Account verification status</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Email Status */}
                <div className="p-4 bg-dark-800/50 rounded-lg border border-white/5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-xs font-bold text-gray-400 mb-1">EMAIL STATUS</p>
                      <p className="text-sm text-gray-300">Verification status</p>
                    </div>
                    {user.emailVerified || user.isVerified ? (
                      <span className="inline-flex items-center px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-lg text-sm font-bold">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-4 py-2 bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 rounded-lg text-sm font-bold">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Unverified
                      </span>
                    )}
                  </div>
                  {!(user.emailVerified || user.isVerified) && (
                    <button
                      onClick={handleSendVerification}
                      disabled={verificationLoading}
                      className="w-full mt-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {verificationLoading ? (
                        <>
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          Send Verification Email
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Last Login */}
                <div className="p-4 bg-dark-800/50 rounded-lg border border-white/5">
                  <p className="text-xs font-bold text-gray-400 mb-2">LAST LOGIN</p>
                  <p className="text-sm text-white font-medium">
                    {accountActivity?.lastLogin ? new Date(accountActivity.lastLogin).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : user.lastLogin ? new Date(user.lastLogin).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'Just now'}
                  </p>
                </div>

                {/* Account Status */}
                <div className="p-4 bg-dark-800/50 rounded-lg border border-white/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-400 mb-1">ACCOUNT STATUS</p>
                      <p className="text-sm text-gray-300">Current state</p>
                    </div>
                    <span className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-lg text-sm font-bold flex items-center">
                      <span className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse"></span>
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Summary Card */}
            <div className="bg-dark-850/50 backdrop-blur-xl rounded-xl shadow-card border border-white/10 p-6 md:col-span-2">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Security Summary</h3>
                  <p className="text-sm text-gray-400">Your account security at a glance</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Security Score */}
                <div className="p-4 bg-dark-800/50 rounded-lg border border-white/5 transition-all duration-300 hover:bg-dark-800/70 hover:border-white/10 hover:scale-105 group">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-gray-400 group-hover:text-gray-300 transition-colors">SECURITY SCORE</p>
                    <svg className="w-5 h-5 text-violet-400 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <p className="text-2xl font-bold text-white mb-1 transition-all duration-500">
                    {profileCompletion}%
                  </p>
                  <p className="text-xs text-gray-400 transition-colors">
                    {profileCompletion >= 85 ? 'Excellent' : profileCompletion >= 70 ? 'Good' : profileCompletion >= 50 ? 'Fair' : 'Needs improvement'}
                  </p>
                </div>

                {/* Password Strength */}
                <div className="p-4 bg-dark-800/50 rounded-lg border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-gray-400">PASSWORD</p>
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <p className="text-2xl font-bold text-white mb-1">
                    {accountActivity?.accountAge > 30 ? '★★★' : '★★☆'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {accountActivity?.accountAge > 30 ? 'Strong' : 'Medium'}
                  </p>
                </div>

                {/* Email Verification */}
                <div className="p-4 bg-dark-800/50 rounded-lg border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-gray-400">EMAIL</p>
                    <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-2xl font-bold text-white mb-1">
                    {user.isVerified ? '✓' : '✗'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {user.isVerified ? 'Verified' : 'Unverified'}
                  </p>
                </div>

                {/* Account Age */}
                <div className="p-4 bg-dark-800/50 rounded-lg border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-gray-400">ACCOUNT AGE</p>
                    <svg className="w-5 h-5 text-fuchsia-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-2xl font-bold text-white mb-1">
                    {accountActivity?.accountAge || 0}
                  </p>
                  <p className="text-xs text-gray-400">Days</p>
                </div>
              </div>

              {/* Security Recommendations */}
              {!(user.isVerified || user.emailVerified) && (
                <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <p className="text-sm font-bold text-amber-300 mb-1">Security Recommendation</p>
                      <p className="text-xs text-amber-200/80">
                        Verify your email address to improve account security and unlock all features.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
