export default function GraphVisualizer({ frame, algoId }) {
  if (!frame) {
    return (
      <div className="flex-1 flex items-center justify-center text-zinc-500 text-sm">
        Press Start to begin visualization
      </div>
    );
  }

  const {
    nodes, edges,
    currentNode, relaxedEdge, currentEdge,
    visited = [], inMST = [],
    mstEdges = [], rejectedEdges = [], pathEdges = [],
    distances, result = [], color,
    negativeCycle = false, iteration,
  } = frame;

  const getEdgeState = (from, to) => {
    const match = (e) => (e.from === from && e.to === to) || (e.from === to && e.to === from);
    if (relaxedEdge && match(relaxedEdge)) return 'relaxed';
    if (currentEdge && match(currentEdge)) return 'current';
    if (pathEdges?.some(match)) return 'path';
    if (mstEdges?.some(match)) return 'mst';
    if (rejectedEdges?.some(match)) return 'rejected';
    return 'default';
  };

  const edgeColor = {
    relaxed:  '#a78bfa',
    current:  '#facc15',
    path:     '#34d399',
    mst:      '#34d399',
    rejected: '#f87171',
    default:  '#3f3f46',
  };

  const getNodeColor = (id) => {
    if (algoId === 'topoSort') {
      if (color?.[id] === 'inStack') return '#facc15';
      if (color?.[id] === 'visited') return '#34d399';
      return '#27272a';
    }
    if (algoId === 'prim') {
      if (id === currentNode) return '#a78bfa';
      if (inMST.includes(id)) return '#34d399';
      return '#27272a';
    }
    if (id === currentNode) return '#a78bfa';
    if (visited.includes(id)) return '#34d399';
    return '#27272a';
  };

  const isDirected = algoId === 'topoSort';

  // For Prim: show key[] values like Dijkstra shows dist[]
  const keyValues = algoId === 'prim' ? frame.key : null;

  // For Bellman-Ford: show dist[] and iteration badge
  const showDistances = (algoId === 'dijkstra' || algoId === 'bellmanFord') && distances;

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Message bar */}
      <div className={`px-4 py-2 border-b border-zinc-800/50 text-xs min-h-[36px] flex items-center gap-3 ${negativeCycle ? 'bg-red-950/40 text-red-300' : 'bg-zinc-900 text-zinc-300'}`}>
        <span className="flex-1">{frame.message}</span>
        {algoId === 'bellmanFord' && iteration !== undefined && iteration > 0 && (
          <span className="shrink-0 px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-400 font-mono text-[11px]">
            Pass {iteration}
          </span>
        )}
        {negativeCycle && (
          <span className="shrink-0 px-2 py-0.5 rounded bg-red-900/60 border border-red-700/50 text-red-300 font-semibold text-[11px]">
            ⚠ Negative Cycle
          </span>
        )}
      </div>

      {/* SVG canvas */}
      <div className="flex-1 overflow-hidden bg-zinc-950 relative">
        <svg
          viewBox="0 0 900 480"
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-full"
        >
          <defs>
            <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill="#3f3f46" />
            </marker>
            <marker id="arrow-current" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill="#facc15" />
            </marker>
            <marker id="arrow-mst" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill="#34d399" />
            </marker>
            <marker id="arrow-relaxed" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill="#a78bfa" />
            </marker>
          </defs>

          {/* Edges */}
          {edges.map((edge, i) => {
            const fromNode = nodes.find(n => n.id === edge.from);
            const toNode   = nodes.find(n => n.id === edge.to);
            if (!fromNode || !toNode) return null;

            const state = getEdgeState(edge.from, edge.to);
            const stroke = edgeColor[state];
            const strokeW = state === 'default' ? 1.5 : 2.5;

            const dx = toNode.x - fromNode.x;
            const dy = toNode.y - fromNode.y;
            const len = Math.sqrt(dx * dx + dy * dy);
            const r = 22;
            const x1 = fromNode.x + (dx / len) * r;
            const y1 = fromNode.y + (dy / len) * r;
            const x2 = toNode.x   - (dx / len) * r;
            const y2 = toNode.y   - (dy / len) * r;

            const markerId = state === 'current' ? 'arrow-current'
              : (state === 'mst' || state === 'path') ? 'arrow-mst'
              : state === 'relaxed' ? 'arrow-relaxed'
              : 'arrow';

            // Bellman-Ford shows directed arrows on all edges during relaxation
            const showArrow = isDirected || algoId === 'bellmanFord';

            return (
              <g key={i}>
                <line
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={stroke} strokeWidth={strokeW}
                  strokeOpacity={state === 'default' ? 0.4 : 1}
                  markerEnd={showArrow ? `url(#${markerId})` : undefined}
                />
                {edge.weight !== undefined && (
                  <text
                    x={(fromNode.x + toNode.x) / 2}
                    y={(fromNode.y + toNode.y) / 2 - 6}
                    fill={state === 'default' ? '#52525b' : stroke}
                    fontSize="11" textAnchor="middle" fontFamily="monospace"
                  >
                    {edge.weight}
                  </text>
                )}
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map((node) => {
            const fill = getNodeColor(node.id);
            const isActive = node.id === currentNode;
            const label = node.label.split('\n');

            // Value shown below node: dist for Dijkstra/BF, key for Prim
            const subValue = showDistances
              ? (distances[node.id] === Infinity ? '∞' : distances[node.id])
              : keyValues
              ? (keyValues[node.id] === Infinity ? '∞' : keyValues[node.id])
              : null;

            return (
              <g key={node.id}>
                <circle
                  cx={node.x} cy={node.y} r={22}
                  fill={fill}
                  stroke={isActive ? '#a78bfa' : '#52525b'}
                  strokeWidth={isActive ? 2.5 : 1.5}
                />
                <text x={node.x} y={node.y + (label.length > 1 ? -4 : 5)}
                  fill="#e4e4e7" fontSize="13" fontWeight="600"
                  textAnchor="middle" fontFamily="monospace">
                  {label[0]}
                </text>
                {label[1] && (
                  <text x={node.x} y={node.y + 10}
                    fill="#a1a1aa" fontSize="9"
                    textAnchor="middle" fontFamily="sans-serif">
                    {label[1]}
                  </text>
                )}
                {subValue !== null && (
                  <text x={node.x} y={node.y + 36}
                    fill={isActive ? '#a78bfa' : '#71717a'}
                    fontSize="10" textAnchor="middle" fontFamily="monospace">
                    {subValue}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Topo result bar */}
      {algoId === 'topoSort' && result.length > 0 && (
        <div className="px-4 py-2 bg-zinc-900 border-t border-zinc-800/50 flex items-center gap-2 flex-wrap">
          <span className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold">Order:</span>
          {result.map((id, i) => (
            <span key={id} className="flex items-center gap-1">
              <span className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-mono">
                {nodes.find(n => n.id === id)?.label.split('\n')[0]}
              </span>
              {i < result.length - 1 && <span className="text-zinc-600 text-xs">→</span>}
            </span>
          ))}
        </div>
      )}

      {/* Kruskal MST bar */}
      {algoId === 'kruskal' && mstEdges.length > 0 && (
        <div className="px-4 py-2 bg-zinc-900 border-t border-zinc-800/50 flex items-center gap-3 text-xs">
          <span className="text-zinc-500 uppercase tracking-wider font-semibold">MST Edges:</span>
          <span className="text-zinc-300 font-mono">
            {mstEdges.map(e => `${e.from}-${e.to}(${e.weight})`).join('  ')}
          </span>
          <span className="ml-auto text-zinc-400 font-mono">
            Total: {mstEdges.reduce((s, e) => s + e.weight, 0)}
          </span>
        </div>
      )}

      {/* Prim MST bar */}
      {algoId === 'prim' && mstEdges.length > 0 && (
        <div className="px-4 py-2 bg-zinc-900 border-t border-zinc-800/50 flex items-center gap-3 text-xs">
          <span className="text-zinc-500 uppercase tracking-wider font-semibold">MST Edges:</span>
          <span className="text-zinc-300 font-mono">
            {mstEdges.map(e => `${e.from}-${e.to}(${e.weight})`).join('  ')}
          </span>
          <span className="ml-auto text-zinc-400 font-mono">
            Total: {mstEdges.reduce((s, e) => s + e.weight, 0)}
          </span>
        </div>
      )}

      {/* Bellman-Ford distances bar (final) */}
      {algoId === 'bellmanFord' && frame.phase === 'done' && distances && (
        <div className="px-4 py-2 bg-zinc-900 border-t border-zinc-800/50 flex items-center gap-3 text-xs flex-wrap">
          <span className="text-zinc-500 uppercase tracking-wider font-semibold shrink-0">
            {negativeCycle ? '⚠ Neg. Cycle' : 'Distances:'}
          </span>
          {!negativeCycle && nodes.map(n => (
            <span key={n.id} className="flex items-center gap-1">
              <span className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-200 font-mono">
                {n.id}: {distances[n.id] === Infinity ? '∞' : distances[n.id]}
              </span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
