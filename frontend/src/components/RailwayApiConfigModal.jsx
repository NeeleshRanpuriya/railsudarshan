import React, { useState } from 'react';
import { 
  Key, 
  CheckCircle, 
  AlertCircle, 
  X, 
  Server, 
  Radio, 
  ExternalLink, 
  Copy, 
  Eye, 
  EyeOff,
  Sparkles,
  Zap
} from 'lucide-react';
import { RAILWAY_API_CONFIG, setRuntimeRailwayApiKey, isLiveRailwayApiActive } from '../config/railwayApi';

export default function RailwayApiConfigModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [apiKey, setApiKey] = useState(RAILWAY_API_CONFIG.API_KEY || '');
  const [apiHost, setApiHost] = useState(RAILWAY_API_CONFIG.API_HOST || 'irctc1.p.rapidapi.com');
  const [showKey, setShowKey] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [copiedPath, setCopiedPath] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setRuntimeRailwayApiKey(apiKey, apiHost);
    setStatusMsg('API Configuration updated successfully! Using ' + (apiKey ? 'Live Railways API with Mock Fallback.' : 'Verified Mock Dataset.'));
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  const handleClearKey = () => {
    setApiKey('');
    setRuntimeRailwayApiKey('', apiHost);
    setStatusMsg('Switched to RailRaksha Verified Mock Dataset.');
  };

  const handleTestKey = async () => {
    if (!apiKey.trim()) {
      setStatusMsg('Please enter an API Key first to test.');
      return;
    }
    setIsTesting(true);
    setStatusMsg('Testing connection to Railways API gateway...');
    try {
      // Test train between NDLS and CNB
      const testUrl = `${RAILWAY_API_CONFIG.BASE_URL}/trainBetweenStations?fromStationCode=NDLS&toStationCode=CNB&dateOfJourney=2026-11-05`;
      const res = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'x-rapidapi-key': apiKey.trim(),
          'x-rapidapi-host': apiHost.trim(),
          'Accept': 'application/json',
        }
      });
      if (res.ok) {
        setStatusMsg('✅ Live Railways API Connected! Valid key verified.');
      } else {
        setStatusMsg(`⚠️ API Gateway responded with HTTP ${res.status}. Falling back to mock dataset safely.`);
      }
    } catch (err) {
      setStatusMsg('⚠️ Network check failed. Mock fallback will be used automatically.');
    } finally {
      setIsTesting(false);
    }
  };

  const handleCopyPath = () => {
    navigator.clipboard.writeText('src/config/railwayApi.js');
    setCopiedPath(true);
    setTimeout(() => setCopiedPath(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-railway-100 dark:bg-railway-950/60 text-railway-700 dark:text-railway-300 flex items-center justify-center">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Railways API Key & Data Engine
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Switch between Live Indian Railways API and Verified Mock Data
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Message Alert */}
        {statusMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{statusMsg}</span>
          </div>
        )}

        {/* Where to Paste API Key in Code Notice */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-amber-500" /> In-Code Location
            </span>
            <button
              onClick={handleCopyPath}
              className="text-[11px] text-railway-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1"
            >
              <Copy className="w-3 h-3" />
              <span>{copiedPath ? 'Copied!' : 'Copy File Path'}</span>
            </button>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Module to paste API key in code: <code className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-mono text-[11px] font-bold">src/config/railwayApi.js</code>
          </p>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Inside that file, paste your key into <code className="font-mono text-railway-700 dark:text-emerald-300">API_KEY: 'YOUR_KEY_HERE'</code>. Alternatively, paste it in the form below to test immediately!
          </p>
        </div>

        {/* Active Engine Badge */}
        <div className="p-3 rounded-2xl bg-gradient-to-r from-railway-900 to-railway-800 text-white flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isLiveRailwayApiActive() ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span>Active Engine: <strong>{isLiveRailwayApiActive() ? 'Live Indian Railways API' : 'Verified Mock Dataset'}</strong></span>
          </div>
          <span className="text-[10px] text-slate-300">Mock Fallback Guaranteed</span>
        </div>

        {/* Form to Update/Paste API Key Live */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Railways API Key
              </label>
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="text-[11px] text-slate-400 hover:text-slate-600 flex items-center gap-1"
              >
                {showKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                <span>{showKey ? 'Hide' : 'Show'}</span>
              </button>
            </div>
            <input
              type={showKey ? 'text' : 'password'}
              placeholder="e.g. 5f8a92b3c4d1e0..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              API Host (RapidAPI Header)
            </label>
            <input
              type="text"
              placeholder="irctc1.p.rapidapi.com"
              value={apiHost}
              onChange={(e) => setApiHost(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTestKey}
                disabled={isTesting}
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Radio className={`w-3.5 h-3.5 text-emerald-500 ${isTesting ? 'animate-pulse' : ''}`} />
                <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
              </button>

              {apiKey && (
                <button
                  type="button"
                  onClick={handleClearKey}
                  className="px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-bold transition-all"
                >
                  Use Mock Data Only
                </button>
              )}
            </div>

            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-railway-900 hover:bg-railway-800 text-white font-bold text-xs shadow-md shadow-railway-900/20"
            >
              Save Configuration
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
