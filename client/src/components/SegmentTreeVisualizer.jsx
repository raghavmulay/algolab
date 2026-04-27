import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const NODE_R = 20;
const LEVEL_H = 72;

// Compute positions for all nodes in the segment tree
// node indices are 1-based; we lay out levels top-down
function layoutSegTree(n, containerWidth) {
  const positions = new Map(); // nodeIdx -> {x, y, start, end}

  function place(node, start, end, level, left, right) {
    const x = (left + right) / 2;
    const y = level * LEVEL_H + NODE_R + 16;
    positions.set(node, { x, y, start, end });
    if (start === end) return;
    const mid = Math.floor((start + end) / 2);
    place(2 * node, start, mid, level + 1, left, (left + right) / 2);
    place(2 * node + 1, mid + 1, end, level + 1, (left + right) / 2, right);
  }

  place(1, 0, n - 1, 0, 0, containerWidth);
  return positions;
}

function nodeColor(nodeIdx, frame) {
  const { highlightedNodes = [], resultNode, phase } = frame || {};

  if (resultNode === nodeIdx && (phase === 'full_overlap' || phase === 'done' || phase === 'combining')) {
    return { fill: '#14532d', stroke: '#22c55e', text: '#86efac' };
  }
  if (phase === 'no_overlap' && highlightedNodes.includes(nodeIdx)) {
    return { fill: '#1c1917', stroke: '#78716c', text: '#57534e' };
  }
  if (phase === 'full_overlap' && highlightedNodes.includes(nodeIdx)) {
    return { fill: '#14532d', stroke: '#22c55e', text: '#86efac' };
  }
  if ((phase === 'leaf' || phase === 'leaf_update') && highlightedNodes.includes(nodeIdx)) {
    return { fill: '#1e1b4b', stroke: '#818cf8', text: '#c7d2fe' };
  }
  if ((phase === 'merge' || phase === 'recalculate') && highlightedNodes.includes(nodeIdx)) {
    return { fill: '#1c1917', stroke: '#f59e0b', text: '#fde68a' };
  }
  if (highlightedNodes.includes(nodeIdx)) {
    return { fill: '#27272a', stroke: '#a1a1aa', text: '#fafafa' };
  }
  return { fill: '#18181b', stroke: '#3f3f46', text: '#71717a' };
}

function phaseIcon(phase) {
  const icons = {
    start: '🚀', building: '🏗️', leaf: '🍃', merge: '🔗',
    querying: '🔍', no_overlap: '✗', full_overlap: '✅', partial_overlap: '↔️',
    combining: '➕', updating: '✏️', leaf_update: '📝', recalculate: '🔄',
    done: '✅', idle: '',
  };
  return icons[phase] || '';
}

export default function SegmentTreeVisualizer({ frame, arr, tree, n, containerWidth = 720 }) {
  const positions = useMemo(
    () => (n > 0 ? layoutSegTree(n, containerWidth) : new Map()),
    [n, containerWidth]
  );

  const { highlightedNodes = [], activeRange, queryRange, phase, message, queryResult } = frame || {};

  // Compute SVG height from tree depth
  const depth = n > 0 ? Math.ceil(Math.log2(n)) : 0;
  const svgHeight = (depth + 1) * LEVEL_H + NODE_R + 40;

  // Collect all valid node indices to render
  const nodeEntries = [...positions.entries()];

  if (n === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-zinc-500 text-sm">Enter an array and press Build to begin</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Status banner */}
      <AnimatePresence mode="wait">
        {message && (
          <motion.div
            key={message}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="shrink-0 text-center py-2 px-4"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-md text-[11px] font-semibold bg-zinc-800/50 border border-zinc-700/50 text-zinc-300 shadow-sm uppercase tracking-wider">
              {phaseIcon(phase)} {message}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Query result badge */}
      <AnimatePresence>
        {queryResult !== undefined && queryResult !== null && phase === 'done' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="shrink-0 text-center pb-1"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full text-sm font-bold bg-emerald-900/40 border border-emerald-700/50 text-emerald-300">
              Result = {queryResult}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tree SVG */}
      <div className="flex-1 flex justify-center overflow-auto min-h-0 px-2">
        <svg width={containerWidth} height={svgHeight} className="overflow-visible shrink-0">
          {/* Edges */}
          {nodeEntries.map(([nodeIdx, { x, y }]) => {
            if (nodeIdx === 1) return null;
            const parentIdx = Math.floor(nodeIdx / 2);
            const parent = positions.get(parentIdx);
            if (!parent) return null;
            const isHighlighted =
              highlightedNodes.includes(nodeIdx) && highlightedNodes.includes(parentIdx);
            return (
              <line
                key={`e-${nodeIdx}`}
                x1={parent.x} y1={parent.y}
                x2={x} y2={y}
                stroke={isHighlighted ? '#a1a1aa' : '#27272a'}
                strokeWidth={isHighlighted ? 2 : 1.5}
              />
            );
          })}

          {/* Nodes */}
          {nodeEntries.map(([nodeIdx, { x, y, start, end }]) => {
            const colors = nodeColor(nodeIdx, frame);
            const val = tree?.[nodeIdx] ?? 0;
            const isInQuery =
              queryRange &&
              !(queryRange[1] < start || end < queryRange[0]);

            return (
              <motion.g
                key={nodeIdx}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 280, damping: 22, delay: nodeIdx * 0.01 }}
                style={{ originX: `${x}px`, originY: `${y}px` }}
              >
                {/* Query range highlight ring */}
                {isInQuery && queryRange && (
                  <circle
                    cx={x} cy={y} r={NODE_R + 5}
                    fill="none"
                    stroke="#7c3aed"
                    strokeWidth={1}
                    strokeDasharray="3 2"
                    opacity={0.5}
                  />
                )}

                <motion.circle
                  cx={x} cy={y} r={NODE_R}
                  animate={{ fill: colors.fill, stroke: colors.stroke }}
                  strokeWidth={2}
                  transition={{ duration: 0.25 }}
                />

                {/* Node value */}
                <text
                  x={x} y={y + 4}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="700"
                  fontFamily="monospace"
                  fill={colors.text}
                >
                  {val}
                </text>

                {/* Range label below node */}
                <text
                  x={x} y={y + NODE_R + 12}
                  textAnchor="middle"
                  fontSize="8"
                  fontFamily="monospace"
                  fill="#52525b"
                >
                  [{start},{end}]
                </text>
              </motion.g>
            );
          })}
        </svg>
      </div>

      {/* Array view */}
      <div className="shrink-0 border-t border-zinc-800/50 px-4 pt-3 pb-2">
        <div className="text-[10px] uppercase tracking-wider font-semibold text-zinc-600 mb-2">
          Array View
        </div>
        <div className="flex items-end gap-1 flex-wrap">
          {arr.map((val, idx) => {
            const inQuery = queryRange && idx >= queryRange[0] && idx <= queryRange[1];
            return (
              <motion.div
                key={idx}
                className="flex flex-col items-center"
                animate={{ scale: inQuery ? 1.1 : 1 }}
                transition={{ duration: 0.2 }}
              >
                <div
                  className="w-9 h-9 flex items-center justify-center rounded-md border text-xs font-mono font-bold transition-colors"
                  style={{
                    background: inQuery ? '#1e1b4b' : '#18181b',
                    borderColor: inQuery ? '#818cf8' : '#3f3f46',
                    color: inQuery ? '#c7d2fe' : '#a1a1aa',
                  }}
                >
                  {val}
                </div>
                <span className="text-[9px] font-mono text-zinc-600 mt-0.5">[{idx}]</span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 py-2 shrink-0 border-t border-zinc-800/50 flex-wrap">
        <LegendDot color="#a1a1aa" label="Active" />
        <LegendDot color="#22c55e" label="Full Overlap / Result" />
        <LegendDot color="#78716c" label="No Overlap" />
        <LegendDot color="#f59e0b" label="Merge / Recalc" />
        <LegendDot color="#818cf8" label="Leaf" />
      </div>
    </div>
  );
}

function LegendDot({ color, label }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-2.5 h-2.5 rounded-sm" style={{ background: color }} />
      <span className="text-[10px] uppercase font-semibold tracking-wider text-zinc-500">{label}</span>
    </div>
  );
}
