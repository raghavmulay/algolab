import React from 'react';
import { motion } from 'framer-motion';

const TrieNodeViz = ({ node, isCurrent, charIndex, activeCharIndex }) => {
    return (
        <div className="flex flex-col items-center">
            <div
                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold transition-all duration-500
          ${isCurrent ? 'bg-blue-600 border-blue-300 text-white scale-110 shadow-[0_0_20px_rgba(37,99,235,0.4)]' :
                        node.isEndOfWord ? 'bg-zinc-900 border-green-500 text-green-500' : 'bg-zinc-950 border-zinc-800 text-zinc-500'}`}
            >
                {node.char || 'root'}
            </div>

            <div className="flex gap-8 mt-8 relative">
                {Object.entries(node.children).map(([char, child]) => (
                    <div key={child.id} className="relative">
                        {/* Simple line placeholder (CSS would be better but this works for basic viz) */}
                        <div className="absolute -top-8 left-1/2 w-[1px] h-8 bg-zinc-800" />
                        <TrieNodeViz
                            node={child}
                            isCurrent={child.id === isCurrent}
                            charIndex={charIndex + 1}
                            activeCharIndex={activeCharIndex}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default function TrieSection({
    root, wordInput, setWordInput,
    frame, isRunning, isDone,
    onRun, onStep, onReset,
    speed, onSpeedChange
}) {
    const { phase, message, currentNodeId, charIndex } = frame || {};

    return (
        <div className="flex flex-col h-full p-6 text-zinc-100 overflow-y-auto custom-scrollbar">
            {/* Header & Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Trie (Prefix Tree)</h2>
                    <p className="text-zinc-400 text-sm">{message || 'Insert or search for words in the Trie.'}</p>
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
                    <button onClick={onReset} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 transition-colors" title="Reset Animation">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    </button>
                    <div className="flex gap-2 ml-2">
                        <button
                            onClick={() => onRun('insert')} disabled={isRunning || !wordInput}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-all disabled:opacity-30 shadow-lg shadow-blue-500/10"
                        >
                            Insert
                        </button>
                        <button
                            onClick={() => onRun('search')} disabled={isRunning || !wordInput}
                            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-medium transition-all disabled:opacity-30 border border-zinc-700"
                        >
                            Search
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                {/* Left Column: Input & Trace */}
                <div className="xl:col-span-1 space-y-6">
                    <div className="p-5 bg-zinc-900/50 rounded-2xl border border-zinc-800/50">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-4">Input</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-zinc-500 block mb-1">Word</label>
                                <input
                                    type="text" value={wordInput}
                                    onChange={(e) => setWordInput(e.target.value.toLowerCase().replace(/[^a-z]/g, ''))}
                                    placeholder="apple"
                                    disabled={isRunning}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors uppercase tracking-widest"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-1 bg-zinc-900/50 rounded-2xl border border-zinc-800/50 overflow-hidden">
                        <div className="p-4 border-b border-zinc-800/50 bg-zinc-900/30">
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Operation Status</h3>
                        </div>
                        <div className="p-4 min-h-[100px] flex flex-col justify-center items-center text-center">
                            {frame ? (
                                <>
                                    <div className="text-xs text-zinc-500 mb-2">Processing character index: {charIndex}</div>
                                    <div className="flex gap-1 mb-4">
                                        {wordInput.split('').map((c, i) => (
                                            <span key={i} className={`w-6 h-6 flex items-center justify-center rounded border font-bold text-xs ${i === charIndex ? 'bg-blue-600 border-blue-400 text-white animate-pulse' : i < charIndex ? 'bg-zinc-800 border-zinc-700 text-zinc-400' : 'bg-zinc-950 border-zinc-800 text-zinc-600'}`}>
                                                {c}
                                            </span>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="text-zinc-600 text-sm italic">Ready to process...</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Visualization */}
                <div className="xl:col-span-3">
                    <div className="p-8 bg-zinc-900/50 rounded-3xl border border-zinc-800/50 min-h-[500px] flex justify-center items-start overflow-auto custom-scrollbar">
                        <div className="pt-10 scroll-mt-20">
                            <TrieNodeViz
                                node={root}
                                isCurrent={currentNodeId}
                                charIndex={-1}
                                activeCharIndex={charIndex}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
