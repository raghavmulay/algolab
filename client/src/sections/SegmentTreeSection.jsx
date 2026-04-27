import SegmentTreeVisualizer from '../components/SegmentTreeVisualizer';

export default function SegmentTreeSection({
  selectedAlgo,
  stArr, stTree, stFrame,
  stRunning, stDone, stGenRef,
  stArrInput, setStArrInput,
  stQueryL, setStQueryL,
  stQueryR, setStQueryR,
  stUpdateIdx, setStUpdateIdx,
  stUpdateVal, setStUpdateVal,
  speed, onSpeedChange,
  onRun, onStart, onPause, onStep, onReset,
}) {
  const n = stArr.length;

  return (
    <>
      <SegmentTreeVisualizer
        frame={stFrame}
        arr={stArr}
        tree={stTree}
        n={n}
      />

      <div className="shrink-0 bg-zinc-900 border-t border-zinc-800/50 px-5 py-3 flex flex-wrap items-center gap-3">

        {/* Build inputs */}
        {selectedAlgo === 'segTreeBuild' && (
          <input
            type="text"
            value={stArrInput}
            onChange={(e) => setStArrInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onRun()}
            placeholder="e.g. 1, 3, 5, 7, 9, 11"
            disabled={stRunning}
            className="w-52 px-3 py-1.5 rounded-md bg-zinc-800/50 border border-zinc-700 text-zinc-200 text-sm placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 font-mono"
          />
        )}

        {/* Query inputs */}
        {selectedAlgo === 'segTreeQuery' && (
          <>
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500">L</span>
              <input
                type="number"
                value={stQueryL}
                onChange={(e) => setStQueryL(e.target.value)}
                min={0} max={n - 1}
                disabled={stRunning}
                className="w-16 px-2 py-1.5 rounded-md bg-zinc-800/50 border border-zinc-700 text-zinc-200 text-sm focus:outline-none focus:border-zinc-500 font-mono text-center"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500">R</span>
              <input
                type="number"
                value={stQueryR}
                onChange={(e) => setStQueryR(e.target.value)}
                min={0} max={n - 1}
                disabled={stRunning}
                className="w-16 px-2 py-1.5 rounded-md bg-zinc-800/50 border border-zinc-700 text-zinc-200 text-sm focus:outline-none focus:border-zinc-500 font-mono text-center"
              />
            </div>
            <span className="text-[11px] text-zinc-600 font-mono">
              (valid: 0 – {n - 1})
            </span>
          </>
        )}

        {/* Update inputs */}
        {selectedAlgo === 'segTreeUpdate' && (
          <>
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500">Index</span>
              <input
                type="number"
                value={stUpdateIdx}
                onChange={(e) => setStUpdateIdx(e.target.value)}
                min={0} max={n - 1}
                disabled={stRunning}
                className="w-16 px-2 py-1.5 rounded-md bg-zinc-800/50 border border-zinc-700 text-zinc-200 text-sm focus:outline-none focus:border-zinc-500 font-mono text-center"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500">Value</span>
              <input
                type="number"
                value={stUpdateVal}
                onChange={(e) => setStUpdateVal(e.target.value)}
                disabled={stRunning}
                className="w-20 px-2 py-1.5 rounded-md bg-zinc-800/50 border border-zinc-700 text-zinc-200 text-sm focus:outline-none focus:border-zinc-500 font-mono text-center"
              />
            </div>
          </>
        )}

        {/* Run button */}
        <button
          onClick={onRun}
          disabled={stRunning}
          className="px-4 py-1.5 rounded-md bg-zinc-100 hover:bg-white disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed text-zinc-900 text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21" /></svg>
          {selectedAlgo === 'segTreeBuild' ? 'Build' : selectedAlgo === 'segTreeQuery' ? 'Query' : 'Update'}
        </button>

        {/* Pause / Resume */}
        {stRunning ? (
          <button
            onClick={onPause}
            className="px-4 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-100 text-sm font-medium transition-colors flex items-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="3" width="4" height="18" /><rect x="15" y="3" width="4" height="18" /></svg>
            Pause
          </button>
        ) : stGenRef.current && !stDone ? (
          <button
            onClick={onStart}
            className="px-4 py-1.5 rounded-md bg-zinc-100 hover:bg-white text-zinc-900 text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21" /></svg>
            Resume
          </button>
        ) : null}

        {/* Step */}
        <button
          onClick={onStep}
          disabled={stRunning || stDone}
          className="px-3 py-1.5 rounded-md bg-transparent hover:bg-zinc-800 border border-zinc-700 disabled:border-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-300 hover:text-zinc-100 text-sm font-medium transition-colors flex items-center gap-2"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 15,12 5,21" /><rect x="17" y="3" width="3" height="18" /></svg>
          Step
        </button>

        {/* Reset */}
        <button
          onClick={onReset}
          className="px-3 py-1.5 rounded-md bg-transparent hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-zinc-100 text-sm font-medium transition-colors flex items-center gap-2"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1,4 1,10 7,10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" /></svg>
          Reset
        </button>

        <div className="w-px h-6 bg-zinc-800 mx-2" />

        {/* Speed */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500 whitespace-nowrap">Speed</span>
          <input
            type="range" min="10" max="500"
            value={510 - speed}
            onChange={(e) => onSpeedChange(510 - Number(e.target.value))}
            className="w-24 accent-zinc-400"
          />
          <span className="text-xs text-zinc-500 font-mono w-10">{speed}ms</span>
        </div>

        <div className="ml-auto text-[11px] text-zinc-500 uppercase tracking-wider font-semibold">
          Size: <span className="text-zinc-300 font-mono font-medium">{n}</span>
        </div>
      </div>
    </>
  );
}
