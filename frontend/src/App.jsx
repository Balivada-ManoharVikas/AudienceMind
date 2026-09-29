import React, { useState, useEffect } from 'react';
import {
  Brain, Sparkles, Database, BarChart3, Plus, Trash2, RefreshCw, 
  Layers, MessageSquare, Clock, Zap, Lightbulb, CheckCircle2, 
  AlertCircle, ChevronRight, TrendingUp, ThumbsUp, Activity, HelpCircle
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [status, setStatus] = useState(null);
  const [overview, setOverview] = useState(null);
  const [posts, setPosts] = useState([]);
  const [recommendation, setRecommendation] = useState(null);
  const [loadingRec, setLoadingRec] = useState(false);
  const [loadingDemo, setLoadingDemo] = useState(false);
  const [userPrompt, setUserPrompt] = useState('What should I post next?');
  const [showAddModal, setShowAddModal] = useState(false);
  
  // New Post Form State
  const [newPost, setNewPost] = useState({
    post_text: '',
    topic: 'Python Development',
    content_format: 'Code Snippet Carousel',
    tone: 'Practical & Educational',
    posting_time: 'Morning (09:00 AM)',
    likes: 120,
    comments: 15,
    shares: 25,
    engagement_level: 'High',
    feedback_sentiment: 'Positive'
  });

  const fetchAllData = async () => {
    try {
      const [resStatus, resOverview, resPosts] = await Promise.all([
        fetch('/api/status'),
        fetch('/api/overview'),
        fetch('/api/posts')
      ]);
      const dataStatus = await resStatus.json();
      const dataOverview = await resOverview.json();
      const dataPosts = await resPosts.json();

      setStatus(dataStatus);
      setOverview(dataOverview);
      setPosts(dataPosts);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleLoadDemo = async () => {
    setLoadingDemo(true);
    try {
      const res = await fetch('/api/demo/load', { method: 'POST' });
      const data = await res.json();
      await fetchAllData();
      // Auto generate recommendation to demonstrate Hindsight memory effect!
      handleAnalyze('What should I post next?');
    } catch (err) {
      console.error('Failed to load demo data', err);
    } finally {
      setLoadingDemo(false);
    }
  };

  const handleClearMemory = async () => {
    try {
      await fetch('/api/memory', { method: 'DELETE' });
      setRecommendation(null);
      await fetchAllData();
    } catch (err) {
      console.error('Failed to clear memory', err);
    }
  };

  const handleAnalyze = async (promptToUse = userPrompt) => {
    setLoadingRec(true);
    try {
      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_prompt: promptToUse, bank_id: 'audience_mind_demo' })
      });
      const data = await res.json();
      setRecommendation(data);
    } catch (err) {
      console.error('Error getting recommendation:', err);
    } finally {
      setLoadingRec(false);
    }
  };

  const handleAddPost = async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPost)
      });
      setShowAddModal(false);
      setNewPost({
        post_text: '',
        topic: 'Python Development',
        content_format: 'Code Snippet Carousel',
        tone: 'Practical & Educational',
        posting_time: 'Morning (09:00 AM)',
        likes: 100,
        comments: 10,
        shares: 20,
        engagement_level: 'High',
        feedback_sentiment: 'Positive'
      });
      await fetchAllData();
    } catch (err) {
      console.error('Error adding post:', err);
    }
  };

  const isColdStart = status?.is_cold_start ?? true;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* HEADER */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-emerald-500 p-0.5 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Brain className="h-5 w-5 text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
                AudienceMind
              </h1>
              <span className="text-[10px] uppercase tracking-widest font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Hindsight Memory Powered
              </span>
            </div>
            <p className="text-xs text-slate-400">"Your audience. Your memory."</p>
          </div>
        </div>

        {/* DEMO CONTROLS & MEMORY STATUS */}
        <div className="flex items-center space-x-3">
          <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border text-xs font-medium ${
            isColdStart 
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' 
              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
          }`}>
            <span className={`h-2 w-2 rounded-full ${isColdStart ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`}></span>
            <span>{isColdStart ? 'STATE 1: Cold Start (No Memory)' : `STATE 2/3: Hindsight Active (${status?.total_hindsight_memories || 0} Memories)`}</span>
          </div>

          <button
            onClick={handleLoadDemo}
            disabled={loadingDemo}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-indigo-500/25 transition duration-150 disabled:opacity-50"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>{loadingDemo ? 'Loading Hindsight...' : 'Load Demo Audience'}</span>
          </button>

          <button
            onClick={handleClearMemory}
            title="Reset to Cold Start state"
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR */}
        <aside className="w-64 border-r border-slate-800 bg-slate-900/40 p-4 flex flex-col justify-between hidden md:flex">
          <div className="space-y-6">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3">Main Menu</span>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-medium transition ${
                  activeTab === 'dashboard' ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                <span>Dashboard Overview</span>
              </button>
              
              <button
                onClick={() => setActiveTab('memory')}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-medium transition ${
                  activeTab === 'memory' ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <Brain className="h-4 w-4" />
                <span>Audience Memory</span>
                <span className="ml-auto px-1.5 py-0.5 text-[10px] rounded-full bg-slate-800 text-slate-300">
                  {status?.total_hindsight_memories || 0}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('history')}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-medium transition ${
                  activeTab === 'history' ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <Database className="h-4 w-4" />
                <span>Content History</span>
                <span className="ml-auto px-1.5 py-0.5 text-[10px] rounded-full bg-slate-800 text-slate-300">
                  {posts.length}
                </span>
              </button>
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-800/60">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3">Hindsight Config</span>
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span>SDK Status:</span>
                  <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${status?.hindsight_sdk_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-300'}`}>
                    {status?.hindsight_sdk_active ? 'Connected' : 'Active Engine'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 truncate" title={status?.hindsight_base_url}>
                  Endpoint: {status?.hindsight_base_url || 'Default'}
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-indigo-950/30 border border-indigo-500/20 rounded-xl space-y-2">
            <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-xs">
              <Zap className="h-3.5 w-3.5" />
              <span>Hindsight Hackathon MVP</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Demonstrating persistent memory recall over audience interactions to guide next post creation.
            </p>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* TOP DEMO BANNER / INSTRUCTIONS */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/20 rounded-2xl p-5 shadow-xl relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-4 w-4 text-indigo-400" />
                  <h2 className="text-base font-semibold text-white">How to Demo AudienceMind</h2>
                </div>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  1. <strong className="text-amber-300">State 1 (Cold Start):</strong> Click "Analyze Audience" with empty memory to see the generic baseline recommendation.
                  <br />
                  2. <strong className="text-emerald-300">State 2 & 3 (Memory Active):</strong> Click <span className="underline decoration-indigo-400">"Load Demo Audience"</span> to save historical technical & motivational posts into Hindsight memory, then analyze again to experience personalized AI recommendations!
                </p>
              </div>

              <div className="flex items-center space-x-3 shrink-0">
                {isColdStart ? (
                  <button
                    onClick={handleLoadDemo}
                    disabled={loadingDemo}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-indigo-600/30 transition"
                  >
                    Click to Load Demo Memories
                  </button>
                ) : (
                  <button
                    onClick={() => handleAnalyze('What should I post next?')}
                    disabled={loadingRec}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-emerald-600/30 transition flex items-center space-x-1.5"
                  >
                    <Brain className="h-3.5 w-3.5" />
                    <span>Run Memory Analysis</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 1: AUDIENCE OVERVIEW */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-indigo-400" />
                <h2 className="text-base font-bold tracking-tight text-white">Section 1: Audience Overview</h2>
              </div>
              <span className="text-xs text-slate-400">{overview?.total_posts || 0} Interactions Recorded</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="text-xs text-slate-400 font-medium">Top Audience Topics</div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {overview?.top_topics?.length ? (
                    overview.top_topics.map((t, idx) => (
                      <span key={idx} className="px-2 py-1 rounded-md bg-indigo-500/10 text-indigo-300 text-xs font-medium border border-indigo-500/20">
                        {t.name} ({t.count})
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500 italic">No topics recorded yet</span>
                  )}
                </div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="text-xs text-slate-400 font-medium">Preferred Content Formats</div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {overview?.preferred_formats?.length ? (
                    overview.preferred_formats.slice(0, 3).map((f, idx) => (
                      <span key={idx} className="px-2 py-1 rounded-md bg-purple-500/10 text-purple-300 text-xs font-medium border border-purple-500/20">
                        {f.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500 italic">No formats recorded</span>
                  )}
                </div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="text-xs text-slate-400 font-medium">Preferred Tone</div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {overview?.preferred_tones?.length ? (
                    overview.preferred_tones.slice(0, 3).map((tn, idx) => (
                      <span key={idx} className="px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-300 text-xs font-medium border border-emerald-500/20">
                        {tn.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500 italic">No tones recorded</span>
                  )}
                </div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="text-xs text-slate-400 font-medium">Best Performing Themes</div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {overview?.best_performing_themes?.length ? (
                    overview.best_performing_themes.map((thm, idx) => (
                      <span key={idx} className="px-2 py-1 rounded-md bg-sky-500/10 text-sky-300 text-xs font-medium border border-sky-500/20 flex items-center space-x-1">
                        <TrendingUp className="h-3 w-3 text-sky-400" />
                        <span>{thm}</span>
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500 italic">No themes identified</span>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 3: ASK AUDIENCEMIND & SECTION 4: RECOMMENDATION */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* INPUT PANEL */}
            <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5 flex flex-col justify-between shadow-lg">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-indigo-400" />
                  <h3 className="text-base font-bold text-white">Section 3: Ask AudienceMind</h3>
                </div>
                <p className="text-xs text-slate-400">
                  Ask AudienceMind to query Hindsight memory and determine the optimal next content strategy.
                </p>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-300">Prompt / Question:</label>
                  <textarea
                    rows={3}
                    value={userPrompt}
                    onChange={(e) => setUserPrompt(e.target.value)}
                    placeholder="e.g. What should I post next?"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 transition resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] text-slate-500 font-medium">Quick Prompts:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "What should I post next?",
                      "Which technical topics get high engagement?",
                      "What content format works best?"
                    ].map((qp, idx) => (
                      <button
                        key={idx}
                        onClick={() => { setUserPrompt(qp); handleAnalyze(qp); }}
                        className="text-[11px] px-2.5 py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700/60 transition"
                      >
                        {qp}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleAnalyze(userPrompt)}
                disabled={loadingRec}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:opacity-95 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition"
              >
                {loadingRec ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin text-white" />
                    <span>Recalling Hindsight Memory...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 text-amber-300" />
                    <span>Analyze Audience & Generate Recommendation</span>
                  </>
                )}
              </button>
            </div>

            {/* RECOMMENDATION OUTPUT CARD */}
            <div className="lg:col-span-7 bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-6 space-y-6 shadow-xl relative">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center space-x-2">
                  <Lightbulb className="h-5 w-5 text-amber-400" />
                  <h3 className="text-base font-bold text-white">Section 4: Recommendation</h3>
                </div>

                {recommendation && (
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide border ${
                    recommendation.is_cold_start 
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' 
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  }`}>
                    {recommendation.is_cold_start ? 'COLD START BASELINE' : 'HINDSIGHT RECALL ACTIVE'}
                  </span>
                )}
              </div>

              {recommendation ? (
                <div className="space-y-5">
                  
                  {/* NEXT CONTENT IDEA */}
                  <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-4">
                    <span className="text-[10px] uppercase tracking-widest font-semibold text-indigo-400">NEXT CONTENT IDEA</span>
                    
                    <h4 className="text-lg font-bold text-white leading-snug">
                      "{recommendation.recommended_post_idea}"
                    </h4>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                      <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-500 block font-medium">Topic</span>
                        <span className="text-xs font-semibold text-indigo-300 truncate block">{recommendation.recommended_topic}</span>
                      </div>
                      <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-500 block font-medium">Format</span>
                        <span className="text-xs font-semibold text-purple-300 truncate block">{recommendation.recommended_format}</span>
                      </div>
                      <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-500 block font-medium">Tone</span>
                        <span className="text-xs font-semibold text-emerald-300 truncate block">{recommendation.recommended_tone}</span>
                      </div>
                      <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-500 block font-medium">Timing</span>
                        <span className="text-xs font-semibold text-amber-300 truncate block">{recommendation.recommended_posting_time}</span>
                      </div>
                    </div>
                  </div>

                  {/* AUDIENCE INSIGHT */}
                  <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-xl p-4 space-y-1">
                    <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">Audience Insight</span>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {recommendation.audience_insight}
                    </p>
                  </div>

                  {/* SECTION 5: WHY THIS RECOMMENDATION */}
                  <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2">
                    <div className="flex items-center space-x-2 text-xs font-bold text-amber-300">
                      <HelpCircle className="h-4 w-4" />
                      <span>Section 5: WHY THIS RECOMMENDATION?</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-mono bg-slate-900 p-3 rounded-lg border border-slate-800/80">
                      {recommendation.why_explanation}
                    </p>
                  </div>

                </div>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="p-4 bg-slate-800/50 rounded-full">
                    <Brain className="h-8 w-8 text-indigo-400" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-300">No recommendation generated yet</p>
                    <p className="text-xs text-slate-500 max-w-sm">
                      Click "Analyze Audience" or "Load Demo Audience" to see AudienceMind's Hindsight memory in action.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* SECTION 6: MEMORY ACTIVITY */}
          {recommendation?.memory_activity && (
            <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-indigo-400" />
                  <h3 className="text-base font-bold text-white">Section 6: MEMORY ACTIVITY</h3>
                </div>
                <span className="text-xs text-slate-400 font-mono">Bank ID: {recommendation.memory_activity.memory_bank_id}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-400">Memories Recalled</span>
                  <div className="text-xl font-bold text-indigo-400">{recommendation.memory_activity.memories_recalled_count} Records</div>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-400">Historical Interactions Used</span>
                  <div className="text-xl font-bold text-emerald-400">{recommendation.memory_activity.historical_interactions_used} Posts</div>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-400">Engine Executed</span>
                  <div className="text-xs font-semibold text-purple-300 pt-1.5">{recommendation.memory_activity.engine_used}</div>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <span className="text-xs font-semibold text-slate-300">Identified Hindsight Signals:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {recommendation.memory_activity.signals_identified.map((sig, idx) => (
                    <div key={idx} className="flex items-start space-x-2 p-2.5 bg-slate-950/70 border border-slate-800 rounded-lg text-xs text-slate-300">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                      <span>{sig}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* SECTION 2: HISTORICAL LEARNING */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Layers className="h-5 w-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Section 2: Historical Learning ({posts.length} Posts)</h3>
              </div>

              <button
                onClick={() => setShowAddModal(true)}
                className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Historical Post</span>
              </button>
            </div>

            {posts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {posts.map((post) => (
                  <div key={post.id} className="bg-slate-900/60 border border-slate-800 hover:border-slate-700 rounded-xl p-4 space-y-3 flex flex-col justify-between transition">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-indigo-300">{post.topic}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          post.engagement_level === 'High' 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                            : post.engagement_level === 'Medium'
                            ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}>
                          {post.engagement_level} Engagement
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                        "{post.post_text}"
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-800/80">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                        <span>Format: {post.content_format}</span>
                        <span>Tone: {post.tone}</span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="flex items-center space-x-1">
                          <ThumbsUp className="h-3 w-3 text-indigo-400" />
                          <span>{post.likes} Likes</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <MessageSquare className="h-3 w-3 text-purple-400" />
                          <span>{post.comments} Comments</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="h-3 w-3 text-amber-400" />
                          <span>{post.posting_time}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-xl space-y-3">
                <AlertCircle className="h-8 w-8 text-amber-400 mx-auto" />
                <p className="text-xs text-slate-400">No historical posts loaded into Hindsight memory. Click "Load Demo Audience" to populate synthetic training data.</p>
              </div>
            )}
          </section>

        </main>
      </div>

      {/* ADD HISTORICAL POST MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Add Historical Social Media Post</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white text-sm">✕</button>
            </div>

            <form onSubmit={handleAddPost} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Post Text Content:</label>
                <textarea
                  required
                  rows={3}
                  value={newPost.post_text}
                  onChange={(e) => setNewPost({ ...newPost, post_text: e.target.value })}
                  placeholder="e.g. 5 Python Tips Every Developer Should Know..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Topic:</label>
                  <input
                    type="text"
                    required
                    value={newPost.topic}
                    onChange={(e) => setNewPost({ ...newPost, topic: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Content Format:</label>
                  <input
                    type="text"
                    required
                    value={newPost.content_format}
                    onChange={(e) => setNewPost({ ...newPost, content_format: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Tone:</label>
                  <input
                    type="text"
                    required
                    value={newPost.tone}
                    onChange={(e) => setNewPost({ ...newPost, tone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Engagement Level:</label>
                  <select
                    value={newPost.engagement_level}
                    onChange={(e) => setNewPost({ ...newPost, engagement_level: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-slate-400">Likes:</label>
                  <input
                    type="number"
                    value={newPost.likes}
                    onChange={(e) => setNewPost({ ...newPost, likes: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-slate-400">Comments:</label>
                  <input
                    type="number"
                    value={newPost.comments}
                    onChange={(e) => setNewPost({ ...newPost, comments: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-slate-400">Shares:</label>
                  <input
                    type="number"
                    value={newPost.shares}
                    onChange={(e) => setNewPost({ ...newPost, shares: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-lg shadow-indigo-600/30"
                >
                  Save & Retain in Hindsight
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
