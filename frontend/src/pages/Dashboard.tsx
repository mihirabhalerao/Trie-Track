import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuthStore } from '../store/authStore';

interface Problem {
  id: number;
  title: string;
  leetcodeUrl: string;
  difficulty: string;
  topic: string;
  displayOrder: number;
  isSolved?: boolean;
  isStarred?: boolean;
  notes?: string;
}

export default function Dashboard() {
  const [currentSheet, setCurrentSheet] = useState<'NEETCODE_150' | 'STRIVER_A2Z'>('NEETCODE_150');
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [expandedTopics, setExpandedTopics] = useState<{ [key: string]: boolean }>({});
  const [activeNotesDropdown, setActiveNotesDropdown] = useState<{ [key: number]: boolean }>({});

  // --- 2.3 Interactive Modal State Hooks ---
  const [activeLogProblem, setActiveLogProblem] = useState<Problem | null>(null);
  const [helpLevel, setHelpLevel] = useState('SOLO');
  const [bottleneck, setBottleneck] = useState('NONE');
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  const navigate = useNavigate();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const userEmail = useAuthStore((state) => state.email);

  // Fetch initial problem datasets
  // Fetch initial problem datasets with persistent state attributes
  const fetchSheetData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/api/v1/problems/sheet/${currentSheet}`);
      
      // Explicitly map the incoming array data to preserve backend database values
      const mappedProblems = response.data.map((p: any) => ({
        id: p.id,
        title: p.title,
        leetcodeUrl: p.leetcodeUrl,
        difficulty: p.difficulty,
        topic: p.topic,
        displayOrder: p.displayOrder,
        isSolved: p.solved ?? p.isSolved ?? false,   // Prevents loss of state mapping on payload conversion
        isStarred: p.starred ?? p.isStarred ?? false, // Maps the user's saved favorites
        notes: p.notes ?? ""                         // Hydrates the notes text panel content
      }));
      
      setProblems(mappedProblems);
      setExpandedTopics({});
      setActiveNotesDropdown({});
    } catch (err: any) {
      setError('Failed to pull problem list data rows from server backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSheetData();
  }, [currentSheet]);

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const toggleStar = async (problemId: number) => {
    // 1. Optimistic UI update: Toggle the star locally right away so the user experiences zero lag
    setProblems((prev) =>
      prev.map((p) => (p.id === problemId ? { ...p, isStarred: !p.isStarred } : p))
    );

    try {
      // 2. Sync the update down to your live database container endpoint
      const response = await api.put(`/api/v1/problems/${problemId}/star`);
      
      // 3. Confirm local state matches the exact boolean returned by Spring Boot
      const serverStarredState = response.data.isStarred;
      setProblems((prev) =>
        prev.map((p) => (p.id === problemId ? { ...p, isStarred: serverStarredState } : p))
      );
    } catch (err) {
      console.error("Failed to sync star status down to database. Reverting state change.");
      // Rollback local state if the network call fails
      setProblems((prev) =>
        prev.map((p) => (p.id === problemId ? { ...p, isStarred: !p.isStarred } : p))
      );
    }
  };

  const toggleNotesTray = (problemId: number) => {
    setActiveNotesDropdown((prev) => ({ ...prev, [problemId]: !prev[problemId] }));
  };

  const toggleTopicDropdown = (topicKey: string) => {
    setExpandedTopics((prev) => ({ ...prev, [topicKey]: !prev[topicKey] }));
  };

  // --- 2.3 Form Submission Ingestion Dispatcher ---
  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLogProblem) return;

    setModalSubmitting(true);
    setModalError('');

    try {
      // Dispatch structural payload down to our Spring Boot backend /api/v1/problems/submit route
      await api.post('/api/v1/problems/submit', {
        problemId: activeLogProblem.id,
        helpLevel,
        bottleneck,
        notes: activeLogProblem.notes || ""
      });

      // Update local state smoothly to reflect instant completion without needing a full screen refresh
      setProblems(prev => 
        prev.map(p => p.id === activeLogProblem.id ? { ...p, isSolved: true } : p)
      );

      // Clean up modal states
      setActiveLogProblem(null);
      setHelpLevel('SOLO');
      setBottleneck('NONE');
    } catch (err: any) {
      setModalError(err.response?.data?.error || 'Failed to submit revision progress data.');
    } finally {
      setModalSubmitting(false);
    }
  };

  const groupedProblems = problems.reduce((groups: { [key: string]: Problem[] }, problem) => {
    const sectionTopic = problem.topic || 'UNASSIGNED_PATTERNS';
    if (!groups[sectionTopic]) groups[sectionTopic] = [];
    groups[sectionTopic].push(problem);
    return groups;
  }, {});

  const formatTopicTitle = (rawEnum: string) => {
    return rawEnum
      .toLowerCase()
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const totalProblems = problems.length;
  const totalSolved = problems.filter((p) => p.isSolved).length;

  const easyProblems = problems.filter((p) => p.difficulty === 'EASY');
  const easySolved = easyProblems.filter((p) => p.isSolved).length;

  const medProblems = problems.filter((p) => p.difficulty === 'MEDIUM');
  const medSolved = medProblems.filter((p) => p.isSolved).length;

  const hardProblems = problems.filter((p) => p.difficulty === 'HARD');
  const hardSolved = hardProblems.filter((p) => p.isSolved).length;

  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const semiCircumference = circumference / 2;
  const solvePercentage = totalProblems > 0 ? totalSolved / totalProblems : 0;
  const strokeDashoffset = semiCircumference - solvePercentage * semiCircumference;

  return (
    <div className="min-h-screen bg-black text-slate-200 font-sans selection:bg-sky-500/30 selection:text-sky-300 antialiased">
      
      {/* Account Header Strip */}
      <header className="border-b border-neutral-900 bg-neutral-950/20 backdrop-blur-md sticky top-0 z-50 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 bg-sky-500 rounded-md flex items-center justify-center font-black text-black text-xs">𝞃</div>
          <span className="font-bold text-white text-sm tracking-tight">Trie-Track</span>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-xs text-neutral-500 hidden sm:inline truncate max-w-[180px] font-medium">
            {userEmail || 'developer@trie-track.com'}
          </span>
          <button 
            onClick={handleLogout}
            className="text-xs bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 px-3 py-1 rounded-md transition-colors cursor-pointer font-medium"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Two-Column Viewport Wrapper Grid */}
      <main className="max-w-7xl mx-auto p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side Dashboard Progress Panel */}
        <section className="lg:col-span-4 bg-neutral-950 border border-neutral-900 rounded-2xl p-6 sticky top-20 flex flex-col items-center">
          <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-6 self-start">Progress Profile</h2>
          
          <div className="relative w-44 h-24 flex justify-center items-end mb-6">
            <svg className="w-44 h-44 absolute top-0 -rotate-180" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r={radius} className="stroke-neutral-900 fill-none" strokeWidth="7" strokeDasharray={semiCircumference} />
              <circle cx="60" cy="60" r={radius} className="stroke-sky-500 fill-none transition-all duration-700 ease-out" strokeWidth="7" strokeDasharray={semiCircumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" />
            </svg>
            <div className="text-center z-10 pb-1">
              <div className="text-3xl font-black text-white tracking-tight">{totalSolved}<span className="text-neutral-500 text-base font-normal"> / {totalProblems}</span></div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-neutral-500 mt-0.5">Solved</div>
            </div>
          </div>

          <div className="w-full space-y-2.5 border-t border-neutral-900/60 pt-5 text-xs font-medium">
            <div className="flex items-center justify-between"><span className="text-emerald-400 font-semibold">Easy</span><span className="text-neutral-400 font-mono font-bold">{easySolved} / {easyProblems.length}</span></div>
            <div className="flex items-center justify-between"><span className="text-amber-400 font-semibold">Medium</span><span className="text-neutral-400 font-mono font-bold">{medSolved} / {medProblems.length}</span></div>
            <div className="flex items-center justify-between"><span className="text-rose-400 font-semibold">Hard</span><span className="text-neutral-400 font-mono font-bold">{hardSolved} / {hardProblems.length}</span></div>
          </div>
        </section>

        {/* Right Arena Table View */}
        <section className="lg:col-span-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-neutral-900 pb-5 gap-4">
            <div>
              <h1 className="text-xl font-black text-white tracking-tight">DSA Core Arena</h1>
              <p className="text-xs text-neutral-500 mt-0.5 font-medium">Track completion patterns, target bottlenecks, and defeat memory decay curves.</p>
            </div>
            <div className="flex items-center gap-2.5 bg-neutral-950 border border-neutral-900 px-3 py-1.5 rounded-xl">
              <span className="text-[10px] uppercase font-black tracking-widest text-neutral-500">Sheet:</span>
              <select value={currentSheet} onChange={(e) => setCurrentSheet(e.target.value as any)} className="bg-neutral-950 text-sky-400 text-xs font-bold focus:outline-none cursor-pointer pr-1">
                <option value="NEETCODE_150">NeetCode 150</option>
                <option value="STRIVER_A2Z">Striver A2Z</option>
              </select>
            </div>
          </div>

          {error && <div className="p-3 bg-red-950/20 border border-red-900/30 text-red-400 rounded-xl text-xs font-bold">{error}</div>}

          <div className="space-y-2">
            {Object.keys(groupedProblems).map((topicKey) => {
              const items = groupedProblems[topicKey];
              const solvedCount = items.filter(p => p.isSolved).length;
              const totalCount = items.length;
              const isSectionOpen = !!expandedTopics[topicKey];

              return (
                <div key={topicKey} className="bg-neutral-950 border border-neutral-900/80 rounded-xl overflow-hidden">
                  <div onClick={() => toggleTopicDropdown(topicKey)} className="px-4 py-3 bg-neutral-950 hover:bg-neutral-900/20 flex items-center justify-between cursor-pointer transition-colors select-none group">
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] text-neutral-600 group-hover:text-neutral-400 transition-transform duration-150 ${isSectionOpen ? 'rotate-90' : ''}`}>▶</span>
                      <h3 className="text-xs font-bold text-neutral-300 tracking-tight">{formatTopicTitle(topicKey)}</h3>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-neutral-500">[{solvedCount}/{totalCount}]</span>
                  </div>

                  <div className={isSectionOpen ? 'block' : 'hidden'}>
                    <div className="overflow-x-auto border-t border-neutral-900">
                      <table className="w-full text-left border-collapse">
                        <tbody className="divide-y divide-neutral-900/60 text-xs">
                          {items.map((problem) => {
                            const isNotesOpen = !!activeNotesDropdown[problem.id];
                            return (
                              <React.Fragment key={problem.id}>
                                <tr className="hover:bg-neutral-900/20 transition-colors group">
                                  
                                  {/* Status Checkbox opens modal too if not solved yet */}
                                  <td className="py-2 px-4 w-12 text-center align-middle">
                                    <div 
                                      onClick={() => !problem.isSolved && setActiveLogProblem(problem)}
                                      className={`w-4 h-4 border rounded mx-auto flex items-center justify-center transition-all cursor-pointer ${
                                        problem.isSolved 
                                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' 
                                          : 'border-neutral-800 hover:border-sky-500 bg-neutral-900/50'
                                      }`}
                                    >
                                      {problem.isSolved && <span className="text-[10px] font-black">✓</span>}
                                    </div>
                                  </td>

                                  <td className="py-2 px-1 w-8 text-center align-middle">
                                    <button 
                                      onClick={() => toggleStar(problem.id)} 
                                      className={`text-sm font-bold transition-all transform hover:scale-110 cursor-pointer focus:outline-none ${
                                        problem.isStarred 
                                          ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]' 
                                          : 'text-neutral-600 hover:text-neutral-400'
                                      }`}
                                    >
                                      ★
                                    </button>
                                  </td>

                                  <td className="py-2 px-3 font-medium text-neutral-300 align-middle">
                                    <a href={problem.leetcodeUrl} target="_blank" rel="noreferrer" className="hover:text-sky-400 transition-colors tracking-tight block w-full">{problem.title}</a>
                                  </td>

                                  <td className="py-2 px-3 w-24 text-center align-middle">
                                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded tracking-tight ${problem.difficulty === 'EASY' ? 'text-emerald-400 bg-emerald-950/30' : problem.difficulty === 'MEDIUM' ? 'text-amber-400 bg-amber-950/30' : 'text-rose-400 bg-rose-950/30'}`}>{problem.difficulty}</span>
                                  </td>

                                  {/* Log Button triggers Modal popup state */}
                                  <td className="py-2 px-4 w-24 text-right align-middle space-x-3.5">
                                    <button onClick={() => toggleNotesTray(problem.id)} className={`text-[11px] font-bold transition-colors cursor-pointer ${isNotesOpen || problem.notes ? 'text-sky-400' : 'text-neutral-600 hover:text-neutral-400'}`}>Note</button>
                                    <button 
                                      onClick={() => setActiveLogProblem(problem)}
                                      className={`text-[11px] font-bold transition-colors cursor-pointer ${problem.isSolved ? 'text-emerald-400' : 'text-neutral-600 hover:text-sky-400'}`}
                                    >
                                      {problem.isSolved ? 'Log +' : 'Log'}
                                    </button>
                                  </td>
                                </tr>

                                {isNotesOpen && (
                                  <tr className="bg-neutral-950/50">
                                    <td colSpan={5} className="py-2.5 px-6 border-b border-neutral-900">
                                      <div className="flex flex-col gap-1.5 max-w-2xl">
                                        <label className="text-[9px] uppercase tracking-wider font-black text-neutral-500">Analysis Summary:</label>
                                        <textarea
                                          defaultValue={problem.notes || ''}
                                          placeholder="Insights or time/space complexities..."
                                          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-neutral-300 focus:outline-none focus:border-neutral-700 min-h-[55px] resize-y"
                                          onBlur={async (e) => {
                                            const val = e.target.value;
                                            try {
                                              // Fire PUT request to save notes to PostgreSQL
                                              await api.put(`/api/v1/problems/${problem.id}/notes`, { notes: val });
                                              
                                              // Update local storage state
                                              setProblems(prev => prev.map(p => p.id === problem.id ? { ...p, notes: val } : p));
                                            } catch (err) {
                                              console.error("Failed to sync notes down to database.");
                                            }
                                          }}
                                        />
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* --- 2.3 Interactive Overlay Completion Modal DOM Block --- */}
      {activeLogProblem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-neutral-950 border border-neutral-900 rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-[10px] text-sky-400 font-bold uppercase tracking-wider">Log Attempt Metric</span>
                <h2 className="text-base font-black text-white truncate max-w-[280px] mt-0.5">{activeLogProblem.title}</h2>
              </div>
              <button 
                onClick={() => setActiveLogProblem(null)}
                className="text-neutral-500 hover:text-neutral-300 text-lg font-bold cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {modalError && <div className="p-2.5 bg-red-950/30 border border-red-900/40 text-red-400 rounded-lg text-xs font-bold mb-4">{modalError}</div>}

            <form onSubmit={handleLogSubmit} className="space-y-4 text-xs font-medium">
              
              {/* Help Level Selection Menu */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-neutral-500 font-bold uppercase tracking-wide">How independently did you solve this?</label>
                <select 
                  value={helpLevel} 
                  onChange={(e) => setHelpLevel(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-neutral-200 focus:outline-none focus:border-neutral-700 font-bold cursor-pointer"
                >
                  <option value="SOLO">Solo (No solution manuals or external lookups)</option>
                  <option value="HINT">Hint (Looked at a conceptual overview or video description)</option>
                  <option value="SOLUTION">Solution (Direct code read/complete manual bypass)</option>
                </select>
              </div>

              {/* Bottleneck Pattern Classification Selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-neutral-500 font-bold uppercase tracking-wide">Primary friction bottleneck encountered?</label>
                <select 
                  value={bottleneck} 
                  onChange={(e) => setBottleneck(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-neutral-200 focus:outline-none focus:border-neutral-700 font-bold cursor-pointer"
                >
                  <option value="NONE">None (Smooth conceptual execution layout flow)</option>
                  <option value="CONCEPT">Concept (Struggled to discover correct algorithmic pattern)</option>
                  <option value="OPTIMIZATION">Optimization (Solved with nested loops but failed TLE bounds)</option>
                  <option value="TRANSLATION">Translation (Understood math logic but hit syntax compilation block)</option>
                  <option value="EDGE_CASES">Edge Cases (Passed initial paths but failed bounds/null checks)</option>
                </select>
              </div>

              {/* Action Operations Execution Buttons Footer Bar */}
              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setActiveLogProblem(null)}
                  className="w-1/3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 py-2.5 rounded-lg font-bold transition-colors cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={modalSubmitting}
                  className="w-2/3 bg-sky-500 hover:bg-sky-600 disabled:bg-sky-800 text-black py-2.5 rounded-lg font-black transition-colors shadow-lg shadow-sky-500/10 cursor-pointer text-center"
                >
                  {modalSubmitting ? 'Recalibrating Memory...' : 'Commit Attempt Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}