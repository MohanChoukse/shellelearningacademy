import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import skillBridgeLogo from 'figma:asset/cd12bfb4f77c3986715b08d851b34fa45144098e.png';

export function AuthModal({ isOpen, onClose, type, userType }) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState('userTypeSelection');
  const [selectedUserType, setSelectedUserType] = useState('volunteer');
  const [currentType, setCurrentType] = useState(type);
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    skills: '',
    location: '',
    organizationName: '',
    organizationDescription: '',
    websiteUrl: ''
  });

  useEffect(() => {
    if (isOpen) {
      if (userType) {
        setSelectedUserType(userType);
        setCurrentStep('form');
      } else {
        setCurrentStep('userTypeSelection');
      }
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setFormData({
        fullName: '',
        username: '',
        email: '',
        password: '',
        skills: '',
        location: '',
        organizationName: '',
        organizationDescription: '',
        websiteUrl: ''
      });
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, userType]);

  useEffect(() => {
    setCurrentType(type);
    if (type === 'login') {
      setCurrentStep('userTypeSelection');
    }
  }, [type]);

  const handleUserTypeSelect = (userType) => {
    setSelectedUserType(userType);
    setCurrentStep('form');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentType === 'signup') {
        const payload = {
          ...formData,
          userType: selectedUserType,
        };
        const res = await axios.post('http://localhost:5000/api/auth/register', payload);
        toast.success(res.data?.message || 'Registered successfully');
        setFormData({
          fullName: '',
          username: '',
          email: '',
          password: '',
          skills: '',
          location: '',
          organizationName: '',
          organizationDescription: '',
          websiteUrl: ''
        });
        setCurrentType('login');
        setCurrentStep('userTypeSelection');
        navigate('/');
      } else {
        const emailNormalized = typeof formData.email === 'string' ? formData.email.trim().toLowerCase() : formData.email;
        const usernameNormalized = typeof formData.username === 'string' ? formData.username.trim() : formData.username;
        const passwordNormalized = typeof formData.password === 'string' ? formData.password.trim() : formData.password;

        const loginBody = {
          // backend supports either username or email
          username: usernameNormalized || undefined,
          email: emailNormalized || undefined,
          password: passwordNormalized,
        };
        const res = await axios.post('http://localhost:5000/api/auth/login', loginBody);
        const { token, user } = res.data || {};
        if (token) {
          localStorage.setItem('sb_token', token);
          localStorage.setItem('sb_user', JSON.stringify(user));
          window.dispatchEvent(new Event('sb_auth_change'));
        }
        toast.success(res.data?.message || 'Login successful');
        onClose();
        navigate('/');
      }
    } catch (error) {
      const msg = error?.response?.data?.message || 'Request failed';
      toast.error(msg);
    }
  };

  const handleGoogleSignup = () => {
    console.log('Google signup clicked');
    // Handle Google OAuth here
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      const email = (formData.email || '').trim().toLowerCase();
      if (!email) {
        return toast.error('Please enter your email');
      }
      await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      toast.success('Reset link sent to your email');
      setCurrentStep('userTypeSelection');
    } catch (error) {
      const msg = error?.response?.data?.message || 'Failed to send reset link';
      toast.error(msg);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (!isOpen) return null;

  const renderUserTypeSelection = () => (
    <div className="text-center">
      <div className="flex items-center justify-center mb-6">
        <img 
          src={skillBridgeLogo}
          alt="SkillBridge Logo" 
          className="h-10 w-auto object-contain"
        />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        {currentType === 'login' ? 'Welcome Back' : 'Create an Account'}
      </h2>
      <p className="text-gray-500 mb-8">
        {currentType === 'login' 
          ? 'Choose how you want to sign in' 
          : 'Join SkillBridge - An App that connects skills and opportunities'
        }
      </p>
      <div className="space-y-4">
        <button
          onClick={() => handleUserTypeSelect('volunteer')}
          className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 text-left cursor-pointer"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <span className="text-blue-600 text-xl">🙋‍♂️</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Volunteer</h3>
              <p className="text-gray-500 text-sm">Contribute your skills to meaningful causes</p>
            </div>
          </div>
        </button>
        <button
          onClick={() => handleUserTypeSelect('ngo')}
          className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 text-left cursor-pointer"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
              <span className="text-green-600 text-xl">🏢</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">NGO / Organization</h3>
              <p className="text-gray-500 text-sm">Find skilled volunteers for your projects</p>
            </div>
          </div>
        </button>
      </div>
      <div>
        <p className="text-gray-400 text-xs mt-6">
          © 2025 All rights reserved.
        </p>
      </div>
      {/* <div className="mt-8 pt-6 border-t border-gray-200">
        <p className="text-gray-600 text-sm">
          {currentType === 'login' ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setCurrentType(currentType === 'login' ? 'signup' : 'login')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            {currentType === 'login' ? 'Sign up here' : 'Log in'}
          </button>
        </p>
      </div> */}
    </div>
  );

  const renderForm = () => (
    <div>
      <div className="text-center mb-6">
        <div className="flex items-center justify-center mb-4">
          <img 
            src={skillBridgeLogo}
            alt="SkillBridge Logo" 
            className="h-8 w-auto object-contain"
          />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {currentType === 'login' ? 'Welcome Back' : 'Create an Account'}
        </h2>
        <p className="text-gray-500">
          {currentType === 'login' 
            ? `Sign in as ${selectedUserType === 'volunteer' ? 'Volunteer' : 'Organization'}`
            : 'Join SkillBridge - An App that connects skills and opportunities'
          }
        </p>
      </div>
      {currentType === 'signup' && (
        <button
          onClick={handleGoogleSignup}
          className="w-full mb-6 p-3 border-2 border-gray-200 rounded-xl hover:border-gray-300 transition-colors flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Sign up with Google
        </button>
      )}
      <div className="text-center text-gray-400 text-sm mb-6">
        {currentType === 'signup' && 'OR'}
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {currentType === 'signup' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username (required)
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Choose a username"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>
          </>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder={currentType === 'login' ? 'Enter your email' : 'Enter you E-mail'}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder={currentType === 'login' ? 'Enter your password' : 'Create a password'}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
            required
          />
          {currentType === 'login' && (
            <div className="mt-2 text-right">
              <button
                type="button"
                onClick={() => setCurrentStep('forgotPassword')}
                className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
          )}
        </div>
        {currentType === 'signup' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Joining as
              </label>
              <select
                value={selectedUserType}
                onChange={(e) => setSelectedUserType(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="volunteer">Volunteer</option>
                <option value="ngo">Organization</option>
              </select>
            </div>
            {selectedUserType === 'volunteer' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skills (optional)
                  </label>
                  <input
                    type="text"
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    placeholder="e.g. content writing, teaching"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location (optional)
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. Delhi, Mumbai"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization name
                  </label>
                  <input
                    type="text"
                    name="organizationName"
                    value={formData.organizationName}
                    onChange={handleChange}
                    placeholder="Enter your organization name"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization description
                  </label>
                  <textarea
                    name="organizationDescription"
                    value={formData.organizationDescription}
                    onChange={handleChange}
                    placeholder="Describe your organization and mission"
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors resize-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website URL (optional)
                  </label>
                  <input
                    type="url"
                    name="websiteUrl"
                    value={formData.websiteUrl}
                    onChange={handleChange}
                    placeholder="https://your-website.com"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location (required)
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. Delhi, Mumbai"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                    required
                  />
                </div>
              </>
            )}
          </>
        )}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white p-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center justify-center cursor-pointer"
        >
          {currentType === 'login' ? 'Sign In' : 'Create Account'}
        </button>
      </form>
      <div className="text-center mt-6">
        {/* <p className="text-gray-600 text-sm">
          {currentType === 'login' ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setCurrentType(currentType === 'login' ? 'signup' : 'login')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            {currentType === 'login' ? 'Sign up' : 'Log in'}
          </button>
        </p> */}
        <p className="text-gray-400 text-xs mt-2">
          © 2025 All rights reserved.
        </p>
      </div>
      <button
        onClick={() => setCurrentStep('userTypeSelection')}
        className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    </div>
  );

  const renderForgotPassword = () => (
    <div>
      <div className="text-center mb-6 cursor-pointer">
        <div className="flex items-center justify-center mb-4">
          <img 
            src={skillBridgeLogo}
            alt="SkillBridge Logo" 
            className="h-8 w-auto object-contain"
          />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Forgot Password
        </h2>
        <p className="text-gray-500">
          Enter your email address and we'll send you a link to reset your password
        </p>
      </div>
      <form onSubmit={handleForgotPassword} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email address"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white p-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200 cursor-pointer"
        >
          Send Reset Link
        </button>
      </form>
      <div className="text-center mt-6">
        <button
          onClick={() => setCurrentStep('form')}
          className="text-blue-600 hover:text-blue-700 font-medium text-sm cursor-pointer"
        >
          Back to sign in
        </button>
      </div>
      <button
        onClick={() => setCurrentStep('form')}
        className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[2000] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md relative animate-modal-slide-in shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          {currentStep === 'userTypeSelection' && renderUserTypeSelection()}
          {currentStep === 'form' && renderForm()}
          {currentStep === 'forgotPassword' && renderForgotPassword()}
        </div>
      </div>
    </div>
  );
}