import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function KMPSection({
    text, setText,
    pattern, setPattern,
    frame, isRunning, isDone,
    onStart, onPause, onStep, onReset,
    speed, onSpeedChange
}) {
    const { phase, message, lps, txtIdx, patIdx, matches } = frame || {};

    return (
        <div className="flex flex-col h-full p-6 text-zinc-100 overflow-y-auto custom-scrollbar">
            {/* Header & Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-1">KMP String Matching</h2>
                    <p className="text-zinc-400 text-sm">{message || 'Enter text and pattern to begin matching.'}</p>
                </div>

                <div className="flex items-center gap-3 p-2 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
                    <div className="flex flex-col px-2 mr-2 border-r border-zinc-800/50">
                        <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Speed</span>
                        <input
                            type="range" min="10" max="1000" step="10"
                            value={speed} onChange={(e) => onSpeedChange(Number(e.target.value))}
                            className="w-24 accent-blue-500"
                        />
                    </div>
                    <button onClick={onReset} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 transition-colors" title="Reset">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    </button>
                    <button onClick={onStep} disabled={isRunning || isDone} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 transition-colors disabled:opacity-30" title="Step">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                    </button>
                    <button
                        onClick={isRunning ? onPause : onStart} disabled={isDone}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${isRunning ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500'}`}
                    >
                        {isRunning ? (
                            <><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg> Pause</>
                        ) : (
                            <><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg> {isDone ? 'Finished' : 'Start Animation'}</>
                        )}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input & LPS Table */}
                <div className="space-y-6">
                    <div className="p-5 bg-zinc-900/50 rounded-2xl border border-zinc-800/50">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-4">Input</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-zinc-500 block mb-1">Main Text</label>
                                <input
                                    type="text" value={text} onChange={(e) => setText(e.target.value.toUpperCase())}
                                    disabled={isRunning}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-zinc-500 block mb-1">Pattern</label>
                                <input
                                    type="text" value={pattern} onChange={(e) => setPattern(e.target.value.toUpperCase())}
                                    disabled={isRunning}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-5 bg-zinc-900/50 rounded-2xl border border-zinc-800/50">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-4">LPS Table (Longest Prefix Suffix)</h3>
                        <div className="flex gap-1 overflow-x-auto pb-2">
                            {pattern.split('').map((char, i) => (
                                <div key={i} className="flex flex-col items-center">
                                    <div className={`w-10 h-10 flex items-center justify-center border border-zinc-800 rounded-t-lg font-bold ${frame?.i === i ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-zinc-950'}`}>
                                        {char}
                                    </div>
                                    <div className={`w-10 h-10 flex items-center justify-center border-x border-b border-zinc-800 rounded-b-lg text-xs font-mono ${frame?.i === i ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-zinc-900'}`}>
                                        {lps ? lps[i] : 0}
                                    </div>
                                    <span className="text-[10px] text-zinc-600 mt-1 font-mono">{i}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Search Visualization */}
                <div className="space-y-6">
                    <div className="p-5 bg-zinc-900/50 rounded-2xl border border-zinc-800/50 min-h-[200px]">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-6">Search Visualization</h3>

                        {/* Main Text visualization */}
                        <div className="flex flex-wrap gap-1 mb-10">
                            {text.split('').map((char, i) => {
                                const isMatch = matches?.some(m => i >= m && i < m + pattern.length);
                                const isComparing = i === txtIdx;
                                return (
                                    <div key={i} className="flex flex-col items-center relative">
                                        <div className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-all duration-300 font-bold
                       ${isMatch ? 'bg-green-500/20 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.2)] text-green-400' :
                                                isComparing ? 'bg-blue-600 border-blue-400 text-white scale-110' : 'bg-zinc-950 border-zinc-800 text-zinc-400'}`}
                                        >
                                            {char}
                                        </div>
                                        <span className="text-[9px] text-zinc-600 mt-1 font-mono">{i}</span>
                                        {isComparing && (
                                            <motion.div layoutId="arrow" className="absolute -top-6 text-blue-500">
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
                                            </motion.div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pattern visualization aligned */}
                        <div className="relative pl-1">
                            <motion.div
                                animate={{ x: (txtIdx - patIdx) * 40 }} // Approximate alignment
                                transition={{ type: 'spring', stiffness: 100 }}
                                className="flex gap-1"
                            >
                                {pattern.split('').map((char, i) => (
                                    <div key={i} className={`w-9 h-9 flex items-center justify-center rounded-lg border border-blue-500/30 font-bold bg-blue-500/10 text-blue-400
                     ${i === patIdx ? 'bg-blue-500 border-blue-300 text-white' : ''}`}
                                    >
                                        {char}
                                    </div>
                                ))}
                            </motion.div>
                        </div>
                    </div>

                    {/* Matches Found */}
                    {matches && matches.length > 0 && (
                        <div className="p-5 bg-green-500/5 rounded-2xl border border-green-500/20 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <h3 className="text-sm font-bold text-green-500 uppercase tracking-widest mb-3">Matches Found</h3>
                            <div className="flex flex-wrap gap-2">
                                {matches.map((m, idx) => (
                                    <span key={idx} className="px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-xs font-mono">
                                        Index {m}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
