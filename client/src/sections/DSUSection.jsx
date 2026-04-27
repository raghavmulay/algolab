import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DSUSection({
    parent, rank,
    frame, isRunning, isDone,
    onUnion, onFind, onReset,
    speed, onSpeedChange
}) {
    const [uInput, setUInput] = useState(0);
    const [vInput, setVInput] = useState(1);
    const { phase, message, currentNode, nodes, roots, parent: frameParent } = frame || {};

    const currentParent = frameParent || parent;

    return (
        <div className="flex flex-col h-full p-6 text-zinc-100 overflow-y-auto custom-scrollbar">
            {/* Header & Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Union-Find (DSU)</h2>
                    <p className="text-zinc-400 text-sm">{message || 'Perform Union and Find operations on disjoint sets.'}</p>
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

                    <div className="flex items-center gap-2 ml-2 px-4 border-l border-zinc-800/50">
                        <input
                            type="number" min="0" max="9" value={uInput} onChange={(e) => setUInput(Number(e.target.value))}
                            className="w-12 bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-sm outline-none"
                        />
                        <input
                            type="number" min="0" max="9" value={vInput} onChange={(e) => setVInput(Number(e.target.value))}
                            className="w-12 bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-sm outline-none"
                        />
                        <button
                            onClick={() => onUnion(uInput, vInput)}
                            disabled={isRunning || uInput === vInput}
                            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-bold transition-all disabled:opacity-30"
                        >
                            Union
                        </button>
                        <button
                            onClick={() => onFind(uInput)}
                            disabled={isRunning}
                            className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs font-bold transition-all disabled:opacity-30 border border-zinc-700"
                        >
                            Find({uInput})
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {/* Parent Array Visualization */}
                <div className="p-8 bg-zinc-900/50 rounded-2xl border border-zinc-800/50 shadow-xl overflow-hidden relative">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-8 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        Parent Array & Rank
                    </h3>

                    <div className="flex flex-wrap gap-4 justify-center">
                        {currentParent.map((p, i) => {
                            const isHighlight = i === currentNode || nodes?.includes(i) || roots?.includes(i);
                            return (
                                <motion.div
                                    key={i}
                                    animate={isHighlight ? { scale: [1, 1.1, 1] } : {}}
                                    className={`flex flex-col items-center group`}
                                >
                                    <div className="text-[10px] text-zinc-600 mb-1 font-mono">Index {i} (Rank {rank[i]})</div>
                                    <div className={`w-16 h-16 flex flex-col items-center justify-center rounded-xl border-2 transition-all duration-300
                    ${isHighlight ? 'bg-blue-600/20 border-blue-400 text-blue-100 shadow-lg shadow-blue-500/10' : 'bg-zinc-950 border-zinc-800 text-zinc-400 opacity-60'}`}
                                    >
                                        <span className="text-lg font-bold">{p}</span>
                                        <span className="text-[9px] uppercase tracking-tighter text-zinc-500 mt-1">Parent</span>
                                    </div>
                                    {p === i && (
                                        <div className="mt-2 px-2 py-0.5 bg-zinc-800 rounded text-[9px] font-bold text-zinc-500 uppercase tracking-tighter">Root</div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Forest Visualization (Conceptual) */}
                <div className="p-8 bg-zinc-950/50 rounded-2xl border border-zinc-800/50 min-h-[300px]">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-8">Forest Structure (Relationships)</h3>
                    <div className="flex flex-wrap gap-12 justify-center">
                        {currentParent.map((p, i) => {
                            // Only show roots or direct children to keep it simple without full SVG graph
                            if (p === i) {
                                const children = currentParent.map((val, idx) => val === i && idx !== i ? idx : null).filter(val => val !== null);
                                return (
                                    <div key={i} className="flex flex-col items-center p-4 bg-zinc-900/20 rounded-xl border border-white/5">
                                        <div className="w-12 h-12 rounded-full bg-blue-600/10 border border-blue-500/50 flex items-center justify-center font-bold text-blue-400">
                                            {i}
                                        </div>
                                        {children.length > 0 && (
                                            <div className="mt-4 flex gap-4">
                                                {children.map(child => (
                                                    <div key={child} className="flex flex-col items-center">
                                                        <div className="w-1 h-4 bg-zinc-800 mb-1"></div>
                                                        <div className="w-8 h-8 rounded-full border border-zinc-700 bg-zinc-900 flex items-center justify-center text-xs text-zinc-400">
                                                            {child}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            }
                            return null;
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
