import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  Phone, 
  Calendar, 
  Briefcase, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertCircle, 
  KeyRound, 
  Train, 
  ShieldAlert, 
  HeartHandshake, 
  Sparkles,
  ArrowRight,
  Stethoscope,
  Users
} from 'lucide-react';
import { OCCUPATIONS } from '../data/mockData';

export default function LandingPage({ 
  onLoginSuccess, 
  registeredUsers, 
  onRegisterUser 
}) {
  const [authMode, setAuthMode] = useState('welcome'); // 'welcome', 'signup', 'pin_setup', 'login'
  
  // Registration Form State
  const [regForm, setRegForm] = useState({
    fullName: '',
    mobile: '',
    age: '',
    gender: 'female',
    occupation: 'Engineer',
    password: '',
    confirmPassword: '',
    professionalId: '',
    professionalIdType: '',
  });

  // Pending user awaiting PIN setup
  const [pendingUser, setPendingUser] = useState(null);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  // Login Form State
  const [loginMobile, setLoginMobile] = useState('');
  const [loginMethod, setLoginMethod] = useState('pin'); // 'pin' or 'password'
  const [loginPin, setLoginPin] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Error & Show Password states
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Handle Signup Submit
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Validations
    if (!regForm.fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    const cleanMobile = regForm.mobile.trim().replace(/\D/g, '');
    if (cleanMobile.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }
    const ageNum = parseInt(regForm.age, 10);
    if (!ageNum || ageNum < 1 || ageNum > 120) {
      setErrorMsg('Please enter a valid age between 1 and 120.');
      return;
    }
    if (!regForm.password || regForm.password.length < 4) {
      setErrorMsg('Password must be at least 4 characters.');
      return;
    }
    if (regForm.password !== regForm.confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify.');
      return;
    }

    const medicalOccupation = ['Doctor', 'Nurse'].includes(regForm.occupation);
    if (medicalOccupation && !regForm.professionalId.trim()) {
      setErrorMsg(`Please enter your ${regForm.occupation === 'Doctor' ? 'medical registration / ABHA ID' : 'hospital or institute ID'}.`);
      return;
    }

    setPendingUser({
      fullName: regForm.fullName,
      age: ageNum,
      gender: regForm.gender,
      occupation: regForm.occupation,
      password: regForm.password,
      mobile: cleanMobile,
      professionalIdLast4: regForm.professionalId.replace(/\s/g, '').slice(-4) || undefined,
      professionalVerificationStatus: medicalOccupation ? 'pending_review' : undefined,
      verificationStatus: medicalOccupation ? 'pending_review' : 'unverified_identity',
    });
    setAuthMode('pin_setup');
  };

  // Handle PIN Setup Submit
  const handlePinSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      setErrorMsg('Security PIN must be exactly 4 digits (0-9).');
      return;
    }
    if (pin !== confirmPin) {
      setErrorMsg('PIN and Confirm PIN do not match.');
      return;
    }

    const completeUser = {
      ...pendingUser,
      pin: pin,
      createdAt: new Date().toISOString(),
    };

    try {
      const backendUser = await onRegisterUser(completeUser);
      setSuccessMsg('Account created successfully! Logging you in...');
      setTimeout(() => onLoginSuccess(backendUser || completeUser), 800);
    } catch (error) {
      setErrorMsg(error.message || 'Unable to create account.');
    }
  };

  // Handle Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanMobile = loginMobile.trim().replace(/\D/g, '');
    if (cleanMobile.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    const user = registeredUsers.find(u => u.mobile === cleanMobile);

    try {
      const backendUser = await onLoginSuccess({
        ...(user || { mobile: cleanMobile }),
        loginPassword: loginMethod === 'password' ? loginPassword : undefined,
        loginPin: loginMethod === 'pin' ? loginPin : undefined,
      });
      setSuccessMsg('Login successful! Redirecting...');
      if (backendUser || user) {
        return;
      }
    } catch (error) {
      setErrorMsg(error.message || 'Unable to login.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100 to-railway-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-railway-950/40 text-slate-800 dark:text-slate-100 flex flex-col justify-between">
      
      {/* Top Notification Strip */}
      <div className="bg-railway-900 text-white text-xs py-2 px-4 text-center font-medium border-b border-railway-800 flex items-center justify-center gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <span>Official RailRaksha Portal • Ministry of Railways Women Safety & On-Board Emergency Ecosystem</span>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* Brand Header */}
        <div className="flex items-center justify-between pb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-railway-900 to-emerald-600 flex items-center justify-center text-white shadow-xl shadow-railway-900/30">
              <Train className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-railway-900 dark:text-white">
                Rail<span className="text-emerald-600 dark:text-emerald-400">Raksha</span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Next-Gen Secure Passenger Journey & Safety Portal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => { setAuthMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                authMode === 'login'
                  ? 'bg-railway-900 text-white dark:bg-emerald-600'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              Sign In (PIN / Password)
            </button>
            <button
              onClick={() => { setAuthMode('signup'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-md transition-all ${
                authMode === 'signup' || authMode === 'pin_setup'
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-railway-600 text-white hover:bg-railway-700'
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Hero Showcase & Key Features */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-300 dark:border-emerald-800">
                <Sparkles className="w-3.5 h-3.5" />
                Intelligent Women Safety Berth Allocation Active
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                Travel with Dignity, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-railway-700 via-railway-600 to-emerald-600 dark:from-railway-400 dark:to-emerald-400">
                  Total Safety & Care.
                </span>
              </h2>

              <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
                RailRaksha safeguards your journey with an automated seat allocation algorithm ensuring solo women and female travelers are seated alongside families and verified female co-passengers. Equipped with real-time on-board doctor alerts, police escort dispatch, official refund processing, coolie help, and upcoming station ambulance assistance.
              </p>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm hover:border-pink-300 transition-all">
                <div className="w-10 h-10 rounded-xl bg-pink-100 dark:bg-pink-950/60 text-pinkFemale flex items-center justify-center mb-3">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Women Safety Seat Engine
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Solo females are guaranteed berths near verified families or female travelers. Isolated male bays & empty coaches strictly bypassed.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm hover:border-emerald-300 transition-all">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mb-3">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  On-Board Doctor Network
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Instant SOS alert dispatches emergency medical calls to verified doctors traveling on your train + ambulance booking at upcoming stations.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm hover:border-amber-300 transition-all">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center mb-3">
                  <Users className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Visual Coach Demographics
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Interactive coach layout showing Yellow (Males), Pink (Females), Dot (Families), and Dotted Line (Available Seats).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm hover:border-railway-300 transition-all">
                <div className="w-10 h-10 rounded-xl bg-railway-100 dark:bg-railway-950/60 text-railway-600 flex items-center justify-center mb-3">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Luggage & Station Assistance
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Official Coolie booking at ₹80 per bag, wheelchair & stretcher support, plus station hotel meal delivery to your berth.
                </p>
              </div>
            </div>

          </div>

          {/* Right Column: Interactive Registration & PIN Setup or Login Card */}
          <div className="lg:col-span-5">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 transition-all">
              
              {/* Notifications / Error display */}
              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs font-semibold flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}
              {successMsg && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* 1. SIGNUP FORM */}
              {authMode === 'signup' && (
                <div>
                  <div className="mb-6">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      New Passenger Registration
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                      Create Your RailRaksha Account
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Enter your details below. You will be prompted to set your 4-digit Security PIN next.
                    </p>
                  </div>

                  <form onSubmit={handleSignupSubmit} className="space-y-4">
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Full Name *
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          required
                          placeholder="e.g. Ananya Sharma"
                          value={regForm.fullName}
                          onChange={(e) => setRegForm({ ...regForm, fullName: e.target.value })}
                          className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-railway-500"
                        />
                      </div>
                    </div>

                    {/* Mobile & Age */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Mobile Number *
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                          <input
                            type="tel"
                            required
                            maxLength="10"
                            placeholder="10-digit mobile"
                            value={regForm.mobile}
                            onChange={(e) => setRegForm({ ...regForm, mobile: e.target.value })}
                            className="w-full pl-9 pr-3 py-2 text-sm font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-railway-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Age *
                        </label>
                        <div className="relative">
                          <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                          <input
                            type="number"
                            required
                            min="1"
                            max="120"
                            placeholder="Age"
                            value={regForm.age}
                            onChange={(e) => setRegForm({ ...regForm, age: e.target.value })}
                            className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-railway-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Gender & Occupation */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Gender *
                        </label>
                        <select
                          value={regForm.gender}
                          onChange={(e) => setRegForm({ ...regForm, gender: e.target.value })}
                          className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-railway-500 capitalize"
                        >
                          <option value="female">Female 🌸</option>
                          <option value="male">Male</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Occupation *
                        </label>
                        <select
                          value={regForm.occupation}
                          onChange={(e) => setRegForm({ ...regForm, occupation: e.target.value })}
                          className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-railway-500"
                        >
                          {OCCUPATIONS.map((occ) => (
                            <option key={occ} value={occ}>
                              {occ}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {['Doctor', 'Nurse'].includes(regForm.occupation) && (
                      <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60">
                        <label className="block text-xs font-bold text-blue-900 dark:text-blue-200 mb-1">
                          {regForm.occupation === 'Doctor' ? 'Medical registration / ABHA ID *' : 'Hospital or institute ID *'}
                        </label>
                        <input
                          type="text"
                          required
                          placeholder={regForm.occupation === 'Doctor' ? 'e.g. State medical registration ID' : 'e.g. Hospital employee ID'}
                          value={regForm.professionalId}
                          onChange={(e) => setRegForm({ ...regForm, professionalId: e.target.value })}
                          className="w-full px-3 py-2 text-sm rounded-xl border border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-[10px] text-blue-800/80 dark:text-blue-300/80 mt-1">
                          Your credential is marked for review and is not shown to other passengers.
                        </p>
                      </div>
                    )}

                    {/* Password & Confirm Password */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Password *
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            placeholder="Password"
                            value={regForm.password}
                            onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                            className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-railway-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Confirm Password *
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            placeholder="Confirm"
                            value={regForm.confirmPassword}
                            onChange={(e) => setRegForm({ ...regForm, confirmPassword: e.target.value })}
                            className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-railway-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="hover:underline flex items-center gap-1"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        {showPassword ? 'Hide Passwords' : 'Show Passwords'}
                      </button>
                      <span>All fields required</span>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-railway-900 to-railway-700 hover:from-railway-800 hover:to-railway-600 text-white font-bold text-sm shadow-lg shadow-railway-900/20 flex items-center justify-center gap-2 transition-all mt-4"
                    >
                      <span>Create My Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>

                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
                    <p className="text-xs text-slate-500">
                      Already have an account?{' '}
                      <button
                        onClick={() => { setAuthMode('login'); setErrorMsg(''); }}
                        className="text-railway-600 dark:text-railway-400 font-bold hover:underline"
                      >
                        Sign In with PIN / Password
                      </button>
                    </p>
                  </div>
                </div>
              )}

              {/* 2. PIN CREATION FORM */}
              {authMode === 'pin_setup' && pendingUser && (
                <div>
                  <div className="text-center mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 mx-auto flex items-center justify-center mb-3 shadow-inner">
                      <KeyRound className="w-7 h-7" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      Step 2: Security PIN Setup
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                      Create Your 4-Digit PIN
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                      Hello <span className="font-semibold text-slate-800 dark:text-slate-200">{pendingUser.fullName}</span>, this PIN will be stored in our database so you can quickly log in next time!
                    </p>
                  </div>

                  <form onSubmit={handlePinSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 text-center">
                        Set 4-Digit Security PIN
                      </label>
                      <input
                        type="password"
                        maxLength="4"
                        pattern="\d{4}"
                        placeholder="••••"
                        value={pin}
                        onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                        className="w-48 mx-auto block text-center tracking-[1em] text-2xl font-mono py-2 rounded-xl border-2 border-railway-300 dark:border-railway-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 text-center">
                        Confirm 4-Digit Security PIN
                      </label>
                      <input
                        type="password"
                        required
                        maxLength="4"
                        pattern="\d{4}"
                        placeholder="••••"
                        value={confirmPin}
                        onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                        className="w-48 mx-auto block text-center tracking-[1em] text-2xl font-mono py-2 rounded-xl border-2 border-railway-300 dark:border-railway-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 text-center">
                      🔒 Your PIN is stored in your secure RailRaksha database session for rapid access.
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Save PIN & Access Portal</span>
                    </button>
                  </form>
                </div>
              )}

              {/* 3. LOGIN FORM (Prompt Requirement: "so the existing users can login using their pin next time they login") */}
              {(authMode === 'login' || authMode === 'welcome') && (
                <div>
                  <div className="mb-6">
                    <span className="text-xs font-bold uppercase tracking-wider text-railway-600 dark:text-railway-400">
                      Existing User Portal Access
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                      Welcome to RailRaksha
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Log in using your registered mobile number and your 4-digit PIN.
                    </p>
                  </div>

                  {/* Login Method Toggle */}
                  <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 mb-4">
                    <button
                      type="button"
                      onClick={() => setLoginMethod('pin')}
                      className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                        loginMethod === 'pin'
                          ? 'bg-white dark:bg-slate-700 text-railway-900 dark:text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Login with PIN (Fast)
                    </button>
                    <button
                      type="button"
                      onClick={() => setLoginMethod('password')}
                      className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                        loginMethod === 'password'
                          ? 'bg-white dark:bg-slate-700 text-railway-900 dark:text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Login with Password
                    </button>
                  </div>

                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Registered Mobile Number
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="tel"
                          required
                          maxLength="10"
                          placeholder="e.g. 9876543210"
                          value={loginMobile}
                          onChange={(e) => setLoginMobile(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-sm font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-railway-500"
                        />
                      </div>
                    </div>

                    {loginMethod === 'pin' ? (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                            4-Digit Security PIN
                          </label>
                          <span className="text-[11px] text-slate-400">Default: 1234</span>
                        </div>
                        <div className="relative">
                          <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                          <input
                            type="password"
                            required
                            maxLength="4"
                            pattern="\d{4}"
                            placeholder="Enter 4-digit PIN"
                            value={loginPin}
                            onChange={(e) => setLoginPin(e.target.value.replace(/\D/g, ''))}
                            className="w-full pl-9 pr-3 py-2 text-sm font-mono tracking-widest rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-railway-500"
                          />
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Account Password
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                          <input
                            type="password"
                            required
                            placeholder="Enter password"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-railway-500"
                          />
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full py-3 px-4 rounded-xl bg-railway-900 hover:bg-railway-800 text-white font-bold text-sm shadow-lg shadow-railway-900/20 flex items-center justify-center gap-2 transition-all mt-2"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Authenticate & Sign In</span>
                    </button>
                  </form>

                  <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
                    <p className="text-xs text-slate-500">
                      Don't have an account yet?{' '}
                      <button
                        onClick={() => { setAuthMode('signup'); setErrorMsg(''); }}
                        className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                      >
                        Create New Account
                      </button>
                    </p>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>

      </div>

      {/* Footer Branding */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-4 px-6 text-center text-xs text-slate-500 dark:text-slate-400">
        RailRaksha Official Safe Travel Ecosystem • Powered by Center for Railway Information Systems & Women Safety Directorate
      </footer>

    </div>
  );
}
