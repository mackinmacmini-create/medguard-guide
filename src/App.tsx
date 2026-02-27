import React, { useState, useEffect } from 'react';
import {
  Search,
  AlertTriangle,
  Info,
  Activity,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Stethoscope,
  Clock,
  Droplets,
  Syringe,
  HeartPulse,
  History,
  Users,
  AlertCircle,
  Calculator,
  Save,
  FolderOpen,
  MessageSquare,
  ClipboardList,
  Send,
  User,
  CheckCircle2,
  XCircle,
  Sun,
  Moon
} from 'lucide-react';

// MedGuard custom logo mark
function MedGuardLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="MedGuard logo">
      <rect width="40" height="40" rx="10" fill="url(#mg-grad)" />
      {/* Shield outline */}
      <path d="M20 6L8 11V20.5C8 26.6 13.3 32.3 20 34C26.7 32.3 32 26.6 32 20.5V11L20 6Z" fill="white" fillOpacity="0.15" />
      <path d="M20 6L8 11V20.5C8 26.6 13.3 32.3 20 34C26.7 32.3 32 26.6 32 20.5V11L20 6Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" strokeOpacity="0.8" />
      {/* Pulse line across middle */}
      <polyline points="11,20 14,20 16,15 18,25 20,18 22,22 24,20 29,20" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <defs>
        <linearGradient id="mg-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1e40af" />
          <stop offset="1" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
    </svg>
  );
}
import { motion, AnimatePresence } from 'motion/react';
import { getDrugAnalysis, DrugInfo, PatientProfile, getMedicationFeedback, FeedbackResult } from './services/geminiService';
import { ConversionTool } from './components/ConversionTool';
import Markdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const stored = localStorage.getItem('medguard_darkmode');
    return stored ? JSON.parse(stored) : false;
  });

  useEffect(() => {
    localStorage.setItem('medguard_darkmode', JSON.stringify(darkMode));
  }, [darkMode]);
  const [searchQuery, setSearchQuery] = useState('');
  const [patientProfile, setPatientProfile] = useState<PatientProfile>({
    age: '',
    weight: '',
    ethnicity: '',
    allergies: '',
    medicalHistory: '',
    currentMedications: '',
    bloodPressure: '',
    heartRate: '',
    respiratoryRate: '',
    spo2: '',
    temperature: '',
    standingCondition: ''
  });
  const [loading, setLoading] = useState(false);
  const [drugData, setDrugData] = useState<DrugInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'guide' | 'tools' | 'emergency' | 'self-check' | 'communication'>('guide');

  // Profile Management State
  const [savedProfiles, setSavedProfiles] = useState<PatientProfile[]>([]);
  const [showLoadModal, setShowLoadModal] = useState(false);

  // Self-Check State
  const [checkDrugName, setCheckDrugName] = useState('');
  const [checkDetails, setCheckDetails] = useState('');
  const [feedbackResult, setFeedbackResult] = useState<FeedbackResult | null>(null);
  const [checking, setChecking] = useState(false);

  // Communication State
  const [logs, setLogs] = useState<{ id: string; date: string; text: string; type: 'progress' | 'medication' | 'vital' }[]>([]);
  const [messages, setMessages] = useState<{ id: string; sender: 'patient' | 'provider'; text: string; time: string }[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [newLog, setNewLog] = useState('');

  useEffect(() => {
    // Load saved data from localStorage
    const profiles = localStorage.getItem('medguard_profiles');
    if (profiles) setSavedProfiles(JSON.parse(profiles));

    const savedLogs = localStorage.getItem('medguard_logs');
    if (savedLogs) setLogs(JSON.parse(savedLogs));

    const savedMessages = localStorage.getItem('medguard_messages');
    if (savedMessages) setMessages(JSON.parse(savedMessages));
  }, []);

  const saveProfile = () => {
    const name = prompt("Enter a name for this profile:");
    if (!name) return;

    const newProfile = { ...patientProfile, id: Date.now().toString(), profileName: name };
    const updated = [...savedProfiles, newProfile];
    setSavedProfiles(updated);
    localStorage.setItem('medguard_profiles', JSON.stringify(updated));
    setPatientProfile(newProfile);
    alert("Profile saved successfully.");
  };

  const loadProfile = (profile: PatientProfile) => {
    setPatientProfile(profile);
    setShowLoadModal(false);
  };

  const deleteProfile = (id: string) => {
    const updated = savedProfiles.filter(p => p.id !== id);
    setSavedProfiles(updated);
    localStorage.setItem('medguard_profiles', JSON.stringify(updated));
  };

  const handleSelfCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkDrugName || !checkDetails) return;

    setChecking(true);
    try {
      const result = await getMedicationFeedback(checkDrugName, checkDetails, patientProfile);
      setFeedbackResult(result);
    } catch (err) {
      setError("Failed to get feedback.");
    } finally {
      setChecking(false);
    }
  };

  const addLogEntry = () => {
    if (!newLog.trim()) return;
    const entry = {
      id: Date.now().toString(),
      date: new Date().toLocaleString(),
      text: newLog,
      type: 'progress' as const
    };
    const updated = [entry, ...logs];
    setLogs(updated);
    localStorage.setItem('medguard_logs', JSON.stringify(updated));
    setNewLog('');
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    const msg = {
      id: Date.now().toString(),
      sender: 'patient' as const,
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    const updated = [...messages, msg];
    setMessages(updated);
    localStorage.setItem('medguard_messages', JSON.stringify(updated));
    setNewMessage('');

    // Simulate provider response
    setTimeout(() => {
      const providerMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'provider' as const,
        text: "Thank you for your message. A medical professional will review your progress shortly. Is there anything specific about your symptoms you'd like to note?",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => {
        const next = [...prev, providerMsg];
        localStorage.setItem('medguard_messages', JSON.stringify(next));
        return next;
      });
    }, 1500);
  };

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!searchQuery.trim()) {
      setError("Please enter a medication name.");
      return;
    }

    // Validation for mandatory fields
    const missingFields = Object.entries(patientProfile)
      .filter(([_, value]) => !value.trim())
      .map(([key]) => key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'));

    if (missingFields.length > 0) {
      setError(`The following patient factors are mandatory: ${missingFields.join(', ')}. Use "None" or "Unknown" if applicable.`);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await getDrugAnalysis(searchQuery, patientProfile);
      if (result) {
        setDrugData(result);
      } else {
        setError("Could not find information for this drug. Please check the spelling.");
      }
    } catch (err) {
      setError("An error occurred while fetching data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("min-h-screen pb-20 transition-colors duration-300", darkMode ? 'dark' : '')}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700/60 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <MedGuardLogo size={36} />
            <div>
              <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-white leading-tight">MedGuard</h1>
              <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Drug &amp; Contraindication</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => setActiveTab('guide')}
              className={cn("text-sm font-medium transition-colors", activeTab === 'guide' ? "text-brand-600 dark:text-brand-400" : "text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400")}
            >
              Drug Guide
            </button>
            <button
              onClick={() => setActiveTab('self-check')}
              className={cn("text-sm font-medium transition-colors", activeTab === 'self-check' ? "text-brand-600 dark:text-brand-400" : "text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400")}
            >
              Self-Check
            </button>
            <button
              onClick={() => setActiveTab('communication')}
              className={cn("text-sm font-medium transition-colors", activeTab === 'communication' ? "text-brand-600 dark:text-brand-400" : "text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400")}
            >
              Comm Hub
            </button>
            <button
              onClick={() => setActiveTab('tools')}
              className={cn("text-sm font-medium transition-colors", activeTab === 'tools' ? "text-brand-600 dark:text-brand-400" : "text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400")}
            >
              Calculators
            </button>
            <button
              onClick={() => setActiveTab('emergency')}
              className={cn("text-sm font-medium transition-colors", activeTab === 'emergency' ? "text-brand-600 dark:text-brand-400" : "text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400")}
            >
              Emergency
            </button>
          </nav>
          {/* Dark mode toggle */}
          <button
            onClick={() => setDarkMode((d: boolean) => !d)}
            className="ml-4 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:border-brand-300 dark:hover:border-brand-600 transition-all shadow-sm"
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            title={darkMode ? 'Light Mode' : 'Dark Mode'}
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {activeTab === 'guide' && (
          <div className="space-y-8">
            {/* Search Section */}
            <section className="space-y-4">
              <div className="text-center space-y-2 mb-8">
                <h2 className="text-3xl font-bold text-slate-900">Drug Contraindication Guide</h2>
                <p className="text-slate-500">Quick reference for safe medication administration and reactions.</p>
              </div>

              <form onSubmit={handleSearch} className="space-y-8">
                {/* Patient Section (Input) */}
                <div className="glass-card p-6 space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-brand-600" />
                      <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Patient Section (Input)</h3>
                      {patientProfile.profileName && (
                        <span className="ml-2 px-2 py-0.5 bg-brand-50 text-brand-600 text-[10px] font-bold rounded border border-brand-200">
                          {patientProfile.profileName}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowLoadModal(true)}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500 hover:text-brand-600"
                        title="Load Profile"
                      >
                        <FolderOpen className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={saveProfile}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500 hover:text-brand-600"
                        title="Save Profile"
                      >
                        <Save className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Demographics */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Demographics</h4>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500">Age <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          value={patientProfile.age}
                          onChange={(e) => setPatientProfile({ ...patientProfile, age: e.target.value })}
                          placeholder="e.g. 65"
                          className="input-field w-full"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500">Weight <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          value={patientProfile.weight}
                          onChange={(e) => setPatientProfile({ ...patientProfile, weight: e.target.value })}
                          placeholder="e.g. 80kg / 176lb"
                          className="input-field w-full"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500">Ethnicity <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          value={patientProfile.ethnicity}
                          onChange={(e) => setPatientProfile({ ...patientProfile, ethnicity: e.target.value })}
                          placeholder="Genetic background"
                          className="input-field w-full"
                          required
                        />
                      </div>
                    </div>

                    {/* Vitals Checklist */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Vital Checklist</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-slate-500">BP <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            value={patientProfile.bloodPressure}
                            onChange={(e) => setPatientProfile({ ...patientProfile, bloodPressure: e.target.value })}
                            placeholder="120/80"
                            className="input-field w-full"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-slate-500">HR <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            value={patientProfile.heartRate}
                            onChange={(e) => setPatientProfile({ ...patientProfile, heartRate: e.target.value })}
                            placeholder="72 bpm"
                            className="input-field w-full"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-slate-500">RR <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            value={patientProfile.respiratoryRate}
                            onChange={(e) => setPatientProfile({ ...patientProfile, respiratoryRate: e.target.value })}
                            placeholder="16/min"
                            className="input-field w-full"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-slate-500">SpO2 <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            value={patientProfile.spo2}
                            onChange={(e) => setPatientProfile({ ...patientProfile, spo2: e.target.value })}
                            placeholder="98%"
                            className="input-field w-full"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500">Temp <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          value={patientProfile.temperature}
                          onChange={(e) => setPatientProfile({ ...patientProfile, temperature: e.target.value })}
                          placeholder="37°C / 98.6°F"
                          className="input-field w-full"
                          required
                        />
                      </div>
                    </div>

                    {/* Clinical Status */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Clinical Status</h4>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500">Standing Condition <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          value={patientProfile.standingCondition}
                          onChange={(e) => setPatientProfile({ ...patientProfile, standingCondition: e.target.value })}
                          placeholder="Current health status"
                          className="input-field w-full"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500">Allergies <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          value={patientProfile.allergies}
                          onChange={(e) => setPatientProfile({ ...patientProfile, allergies: e.target.value })}
                          placeholder="Drug/Food allergies"
                          className="input-field w-full"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <History className="w-3 h-3" /> Medical History <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={patientProfile.medicalHistory}
                        onChange={(e) => setPatientProfile({ ...patientProfile, medicalHistory: e.target.value })}
                        placeholder="Past medical history, chronic conditions..."
                        className="input-field w-full min-h-[80px] py-2"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <Activity className="w-3 h-3" /> Current Medications <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={patientProfile.currentMedications}
                        onChange={(e) => setPatientProfile({ ...patientProfile, currentMedications: e.target.value })}
                        placeholder="List all current meds, OTCs, supplements..."
                        className="input-field w-full min-h-[80px] py-2"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Medication Search */}
                <div className="glass-card p-6 space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-4">
                    <Stethoscope className="w-5 h-5 text-brand-600" />
                    <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Medication Analysis</h3>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Drug to Analyze <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="e.g. Warfarin, Lisinopril, OTC Ibuprofen..."
                        className="input-field w-full pl-12"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>Generate Safety & Contraindication Checklist</>
                    )}
                  </button>
                </div>
              </form>
            </section>

            {/* Results Section */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-600"
                >
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  <p>{error}</p>
                </motion.div>
              )}

              {drugData && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Drug Header */}
                  <div className="glass-card p-8 border-l-4 border-l-brand-600">
                    <div className="flex flex-wrap justify-between items-start gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">{drugData.class}</span>
                          <span className="text-[10px] px-2 py-0.5 bg-brand-50 text-brand-700 rounded border border-brand-200 uppercase font-bold">Safety Verified</span>
                        </div>
                        <h3 className="text-4xl font-bold text-slate-900 mt-1">{drugData.name}</h3>
                        <p className="text-slate-500 text-sm max-w-2xl">Safety analysis based on patient vitals, demographics, and clinical background.</p>
                      </div>
                      <div className="flex gap-2">
                        {drugData.administration.routes.map(route => (
                          <span key={route} className="px-3 py-1 bg-slate-100 rounded-full text-xs font-medium text-slate-600 border border-slate-200">
                            {route}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Contraindications */}
                    <div className="lg:col-span-2 space-y-6">
                      <div className="glass-card overflow-hidden">
                        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-amber-500" />
                            <h4 className="font-bold">Contraindication Checklist (Output)</h4>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Patient-Specific Factors Applied</span>
                        </div>
                        <div className="p-6 space-y-8">
                          {/* Vital Alerts Section */}
                          {drugData.vitalAlerts.length > 0 && (
                            <div className="space-y-3">
                              <h5 className="text-xs font-bold text-red-500 uppercase flex items-center gap-2">
                                <Activity className="w-3 h-3" /> Vital-Based Safety Alerts
                              </h5>
                              <div className="grid grid-cols-1 gap-2">
                                {drugData.vitalAlerts.map((alert, i) => (
                                  <div key={i} className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                                    <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-red-200/80">{alert}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Clinical Checklist Section */}
                          <div className="space-y-3">
                            <h5 className="text-xs font-bold text-brand-600 uppercase flex items-center gap-2">
                              <ShieldAlert className="w-3 h-3" /> Pre-Administration Checklist
                            </h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {drugData.clinicalChecklist.map((item, i) => (
                                <div key={i} className="p-3 bg-brand-50 border border-brand-200 rounded-lg flex items-start gap-3">
                                  <div className="w-4 h-4 rounded border border-brand-300 mt-0.5 flex-shrink-0 flex items-center justify-center">
                                    <div className="w-2 h-2 rounded-sm bg-brand-100" />
                                  </div>
                                  <p className="text-sm text-slate-600">{item}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-200">
                            <div className="space-y-3">
                              <h5 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                                <HeartPulse className="w-3 h-3" /> Medical History
                              </h5>
                              <ul className="space-y-2">
                                {drugData.contraindications.medicalHistory.map((item, i) => (
                                  <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="space-y-3">
                              <h5 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                                <ShieldAlert className="w-3 h-3" /> Allergies
                              </h5>
                              <ul className="space-y-2">
                                {drugData.contraindications.allergies.map((item, i) => (
                                  <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="space-y-3">
                              <h5 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                                <Activity className="w-3 h-3" /> Current Health Status
                              </h5>
                              <ul className="space-y-2">
                                {drugData.contraindications.healthStatus.map((item, i) => (
                                  <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="space-y-3">
                              <h5 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                                <Users className="w-3 h-3" /> Ethnic/Genetic Factors
                              </h5>
                              <ul className="space-y-2">
                                {drugData.contraindications.ethnicFactors.map((item, i) => (
                                  <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="glass-card overflow-hidden">
                        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
                          <Droplets className="w-5 h-5 text-brand-500" />
                          <h4 className="font-bold">Administration & Care</h4>
                        </div>
                        <div className="p-6 space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <p className="text-xs font-bold text-slate-400 uppercase">Frequency</p>
                              <p className="text-slate-700">{drugData.administration.frequency}</p>
                            </div>
                            {drugData.administration.ivProcedures && (
                              <div className="space-y-2">
                                <p className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                                  <Syringe className="w-3 h-3" /> IV Procedures
                                </p>
                                <p className="text-slate-700 text-sm">{drugData.administration.ivProcedures}</p>
                              </div>
                            )}
                          </div>
                          {drugData.administration.liquidNotes && (
                            <div className="p-4 bg-brand-50 border border-brand-100 rounded-xl">
                              <p className="text-xs font-bold text-brand-500 uppercase mb-1">Liquid Medication Notes</p>
                              <p className="text-sm text-slate-600">{drugData.administration.liquidNotes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Reactions & Emergency */}
                    <div className="space-y-6">
                      <div className="glass-card p-6 space-y-4">
                        <h4 className="font-bold flex items-center gap-2">
                          <History className="w-5 h-5 text-slate-500" /> Reactions
                        </h4>
                        <div className="space-y-4">
                          <div>
                            <p className="text-xs font-bold text-slate-400 uppercase mb-2">Common</p>
                            <div className="flex flex-wrap gap-2">
                              {drugData.reactions.common.map(r => (
                                <span key={r} className="px-2 py-1 bg-slate-100 rounded text-[10px] text-slate-500 border border-slate-200">
                                  {r}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-red-500 uppercase mb-2">Adverse Events</p>
                            <ul className="space-y-2">
                              {drugData.reactions.adverse.map((item, i) => (
                                <li key={i} className="text-sm text-red-700 flex items-start gap-2">
                                  <AlertCircle className="w-3 h-3 mt-1 flex-shrink-0" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="glass-card bg-red-50 border-red-200 p-6 space-y-4">
                        <h4 className="font-bold text-red-600 flex items-center gap-2">
                          <ShieldAlert className="w-5 h-5" /> Emergency Protocol
                        </h4>
                        <div className="prose  prose-sm max-w-none text-slate-600">
                          <Markdown>{drugData.emergencyProtocols}</Markdown>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {activeTab === 'self-check' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-3xl font-bold text-slate-900">Medication Self-Check</h2>
              <p className="text-slate-500">Verify if your medication administration was correct and safe.</p>
            </div>

            <form onSubmit={handleSelfCheck} className="glass-card p-6 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Medication Name</label>
                  <input
                    type="text"
                    value={checkDrugName}
                    onChange={(e) => setCheckDrugName(e.target.value)}
                    placeholder="e.g. Warfarin"
                    className="input-field w-full"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Administration Details</label>
                  <textarea
                    value={checkDetails}
                    onChange={(e) => setCheckDetails(e.target.value)}
                    placeholder="Describe what happened: e.g. 'I took 10mg orally at 8am, but I usually take it at 8pm. I also had a grapefruit for breakfast.'"
                    className="input-field w-full min-h-[120px] py-3"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={checking}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {checking ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Analyze for Mistakes</>
                )}
              </button>
            </form>

            <AnimatePresence>
              {feedbackResult && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={cn(
                    "glass-card p-6 border-l-4",
                    feedbackResult.isError ? "border-l-red-500 bg-red-50" : "border-l-brand-600 bg-brand-50"
                  )}
                >
                  <div className="flex items-center gap-3 mb-4">
                    {feedbackResult.isError ? (
                      <XCircle className="w-6 h-6 text-red-500" />
                    ) : (
                      <CheckCircle2 className="w-6 h-6 text-brand-600" />
                    )}
                    <h3 className="text-xl font-bold">
                      {feedbackResult.isError ? "Potential Error Detected" : "Administration Appears Safe"}
                    </h3>
                    <span className={cn(
                      "ml-auto px-2 py-1 rounded text-[10px] font-bold uppercase",
                      feedbackResult.severity === 'critical' ? "bg-red-500 text-slate-900" :
                        feedbackResult.severity === 'high' ? "bg-orange-500 text-slate-900" :
                          feedbackResult.severity === 'medium' ? "bg-amber-500 text-slate-900" : "bg-emerald-500 text-slate-900"
                    )}>
                      Severity: {feedbackResult.severity}
                    </span>
                  </div>

                  <div className="space-y-6">
                    <div className="prose  prose-sm max-w-none">
                      <p className="text-slate-600 leading-relaxed">{feedbackResult.analysis}</p>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Recommendations</h4>
                      <ul className="space-y-2">
                        {feedbackResult.recommendations.map((rec, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 mt-1.5 flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {activeTab === 'communication' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* Patient Log */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-brand-600" /> Patient Progress Log
                </h3>
              </div>

              <div className="glass-card p-4 space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newLog}
                    onChange={(e) => setNewLog(e.target.value)}
                    placeholder="Log a symptom, medication taken, or vital..."
                    className="input-field flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && addLogEntry()}
                  />
                  <button onClick={addLogEntry} className="btn-primary px-4">
                    Log
                  </button>
                </div>

                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                  {logs.length === 0 ? (
                    <p className="text-center py-8 text-slate-400 text-sm">No log entries yet.</p>
                  ) : (
                    logs.map(log => (
                      <div key={log.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-slate-400 font-mono">{log.date}</span>
                          <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 rounded text-slate-500 uppercase font-bold">Progress</span>
                        </div>
                        <p className="text-sm text-slate-700">{log.text}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Provider Chat */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-brand-600" /> Provider Communication
              </h3>

              <div className="glass-card flex flex-col h-[600px]">
                <div className="p-4 border-b border-slate-200 flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-600 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-slate-900" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Medical Assistant</p>
                    <p className="text-[10px] text-brand-600 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Online
                    </p>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-12 space-y-2">
                      <MessageSquare className="w-12 h-12 text-zinc-800 mx-auto" />
                      <p className="text-slate-400 text-sm">Start a conversation with your care provider.</p>
                    </div>
                  ) : (
                    messages.map(msg => (
                      <div key={msg.id} className={cn(
                        "flex flex-col max-w-[80%]",
                        msg.sender === 'patient' ? "ml-auto items-end" : "items-start"
                      )}>
                        <div className={cn(
                          "px-4 py-2 rounded-2xl text-sm",
                          msg.sender === 'patient' ? "bg-brand-600 text-slate-900 rounded-tr-none" : "bg-slate-100 text-slate-700 rounded-tl-none"
                        )}>
                          {msg.text}
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1">{msg.time}</span>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-4 border-t border-slate-200 flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="input-field flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <button onClick={sendMessage} className="btn-primary px-4">
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'tools' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-3xl font-bold text-slate-900">Medical Calculators</h2>
              <p className="text-slate-500">Essential tools for dosage and metric conversions.</p>
            </div>
            <ConversionTool />

            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4">Common Reference Points</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <h4 className="text-sm font-bold text-slate-500 uppercase mb-2">Weight Conversions</h4>
                  <ul className="text-sm space-y-1 text-slate-600">
                    <li>1 kg = 2.20462 lbs</li>
                    <li>1 lb = 0.45359 kg</li>
                    <li>1 oz = 28.3495 g</li>
                  </ul>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <h4 className="text-sm font-bold text-slate-500 uppercase mb-2">Volume Conversions</h4>
                  <ul className="text-sm space-y-1 text-slate-600">
                    <li>1 tsp = 5 ml (approx)</li>
                    <li>1 tbsp = 15 ml (approx)</li>
                    <li>1 fl oz = 29.57 ml</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'emergency' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-3xl font-bold text-slate-900">Emergency Protocols</h2>
              <p className="text-slate-500">Standard procedures for adverse drug reactions and complications.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-6 border-l-4 border-l-red-500">
                <h3 className="text-xl font-bold text-red-500 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6" /> Anaphylaxis Protocol
                </h3>
                <ol className="space-y-4 text-slate-600">
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                    <p><strong>Stop Administration:</strong> Immediately cease the medication causing the reaction.</p>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                    <p><strong>Call for Help:</strong> Activate the rapid response team or emergency services.</p>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                    <p><strong>Assess Airway:</strong> Maintain airway patency; administer high-flow oxygen.</p>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">4</span>
                    <p><strong>Epinephrine:</strong> Administer IM Epinephrine (0.3mg - 0.5mg) as per facility protocol.</p>
                  </li>
                </ol>
              </div>

              <div className="glass-card p-6 border-l-4 border-l-amber-500">
                <h3 className="text-xl font-bold text-amber-500 mb-4 flex items-center gap-2">
                  <Info className="w-6 h-6" /> Adverse Event Reporting
                </h3>
                <div className="space-y-4 text-slate-600">
                  <p>All adverse drug events (ADEs) must be documented and reported through the appropriate channels:</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Document vital signs and patient status immediately.</li>
                    <li>Notify the prescribing physician and pharmacy.</li>
                    <li>Complete an internal incident/variance report.</li>
                    <li>Report to FDA MedWatch for significant unexpected reactions.</li>
                  </ul>
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mt-4">
                    <p className="text-xs font-bold text-amber-500 uppercase mb-1">Nursing Tip</p>
                    <p className="text-sm italic">"Always keep the medication vial/bag for analysis if a severe reaction occurs."</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-50 border-t border-slate-200 px-6 py-3 flex justify-between items-center z-50">
        <button
          onClick={() => setActiveTab('guide')}
          className={cn("flex flex-col items-center gap-1", activeTab === 'guide' ? "text-brand-600" : "text-slate-400")}
        >
          <Search className="w-6 h-6" />
          <span className="text-[10px] font-medium uppercase">Guide</span>
        </button>
        <button
          onClick={() => setActiveTab('self-check')}
          className={cn("flex flex-col items-center gap-1", activeTab === 'self-check' ? "text-brand-600" : "text-slate-400")}
        >
          <CheckCircle2 className="w-6 h-6" />
          <span className="text-[10px] font-medium uppercase">Check</span>
        </button>
        <button
          onClick={() => setActiveTab('communication')}
          className={cn("flex flex-col items-center gap-1", activeTab === 'communication' ? "text-brand-600" : "text-slate-400")}
        >
          <MessageSquare className="w-6 h-6" />
          <span className="text-[10px] font-medium uppercase">Comm</span>
        </button>
        <button
          onClick={() => setActiveTab('tools')}
          className={cn("flex flex-col items-center gap-1", activeTab === 'tools' ? "text-brand-600" : "text-slate-400")}
        >
          <Calculator className="w-6 h-6" />
          <span className="text-[10px] font-medium uppercase">Tools</span>
        </button>
        <button
          onClick={() => setActiveTab('emergency')}
          className={cn("flex flex-col items-center gap-1", activeTab === 'emergency' ? "text-brand-600" : "text-slate-400")}
        >
          <ShieldAlert className="w-6 h-6" />
          <span className="text-[10px] font-medium uppercase">Emergency</span>
        </button>
      </div>

      {/* Load Profile Modal */}
      <AnimatePresence>
        {showLoadModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLoadModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden"
            >
              <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-lg font-bold">Saved Profiles</h3>
                <button onClick={() => setShowLoadModal(false)} className="text-slate-400 hover:text-slate-900">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              <div className="p-4 max-h-[400px] overflow-y-auto space-y-2">
                {savedProfiles.length === 0 ? (
                  <p className="text-center py-8 text-slate-400">No saved profiles found.</p>
                ) : (
                  savedProfiles.map(profile => (
                    <div key={profile.id} className="flex items-center gap-2 p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors group">
                      <button
                        onClick={() => loadProfile(profile)}
                        className="flex-1 text-left"
                      >
                        <p className="font-bold text-sm">{profile.profileName}</p>
                        <p className="text-[10px] text-slate-400">{profile.age}y • {profile.weight} • {profile.bloodPressure}</p>
                      </button>
                      <button
                        onClick={() => deleteProfile(profile.id!)}
                        className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
