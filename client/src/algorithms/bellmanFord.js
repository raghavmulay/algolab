import { DEFAULT_GRAPH_NODES, DEFAULT_GRAPH_EDGES } from './dijkstra';

// ─── Bellman-Ford Generator ───────────────────────────────────────────────────
export function* bellmanFord(
  nodes = DEFAULT_GRAPH_NODES,
  edges = DEFAULT_GRAPH_EDGES,
  source = 'A'
) {
  const INF = Infinity;
  const dist = {};
  const prev = {};
  nodes.forEach(n => { dist[n.id] = INF; prev[n.id] = null; });
  dist[source] = 0;

  const V = nodes.length;

  yield {
    nodes, edges,
    distances: { ...dist },
    prev: { ...prev },
    currentEdge: null,
    relaxedEdge: null,
    negativeCycle: false,
    iteration: 0,
    phase: 'init',
    message: `Starting Bellman-Ford from ${source}. dist[${source}]=0, all others=∞. Will run ${V - 1} relaxation passes.`,
    activeLine: 8,
  };

  // V-1 relaxation passes
  for (let i = 1; i <= V - 1; i++) {
    let anyRelaxed = false;

    yield {
      nodes, edges,
      distances: { ...dist },
      prev: { ...prev },
      currentEdge: null,
      relaxedEdge: null,
      negativeCycle: false,
      iteration: i,
      phase: 'iteration',
      message: `Pass ${i} of ${V - 1}: relaxing all ${edges.length} edges…`,
      activeLine: 11,
    };

    for (const edge of edges) {
      // Bellman-Ford works on directed edges; treat undirected as two directed
      const pairs = [
        { from: edge.from, to: edge.to, weight: edge.weight },
        { from: edge.to, to: edge.from, weight: edge.weight },
      ];

      for (const { from: u, to: v, weight } of pairs) {
        if (dist[u] === INF) continue;

        yield {
          nodes, edges,
          distances: { ...dist },
          prev: { ...prev },
          currentEdge: { from: u, to: v },
          relaxedEdge: null,
          negativeCycle: false,
          iteration: i,
          phase: 'relaxing',
          message: `Pass ${i} — Edge ${u}→${v} (w=${weight}): dist[${u}]=${dist[u]} + ${weight} = ${dist[u] + weight} vs dist[${v}]=${dist[v] === INF ? '∞' : dist[v]}.`,
          activeLine: 13,
        };

        if (dist[u] + weight < dist[v]) {
          dist[v] = dist[u] + weight;
          prev[v] = u;
          anyRelaxed = true;

          yield {
            nodes, edges,
            distances: { ...dist },
            prev: { ...prev },
            currentEdge: { from: u, to: v },
            relaxedEdge: { from: u, to: v },
            negativeCycle: false,
            iteration: i,
            phase: 'updated',
            message: `✅ Relaxed! dist[${v}] = ${dist[v]} (via ${u}).`,
            activeLine: 14,
          };
        }
      }
    }

    // Early exit if no relaxation happened
    if (!anyRelaxed) {
      yield {
        nodes, edges,
        distances: { ...dist },
        prev: { ...prev },
        currentEdge: null,
        relaxedEdge: null,
        negativeCycle: false,
        iteration: i,
        phase: 'early_exit',
        message: `Pass ${i}: No relaxations — converged early! Skipping remaining passes.`,
        activeLine: 26,
      };
      break;
    }
  }

  // Check for negative-weight cycles (extra pass)
  let hasNegCycle = false;
  for (const edge of edges) {
    const pairs = [
      { from: edge.from, to: edge.to, weight: edge.weight },
      { from: edge.to, to: edge.from, weight: edge.weight },
    ];
    for (const { from: u, to: v, weight } of pairs) {
      if (dist[u] !== INF && dist[u] + weight < dist[v]) {
        hasNegCycle = true;
        break;
      }
    }
    if (hasNegCycle) break;
  }

  // Build shortest-path edges for highlighting
  const pathEdges = [];
  nodes.forEach(n => {
    if (prev[n.id]) pathEdges.push({ from: prev[n.id], to: n.id });
  });

  yield {
    nodes, edges,
    distances: { ...dist },
    prev: { ...prev },
    currentEdge: null,
    relaxedEdge: null,
    pathEdges,
    negativeCycle: hasNegCycle,
    iteration: V - 1,
    phase: 'done',
    message: hasNegCycle
      ? `⚠️ Negative-weight cycle detected! Shortest paths are undefined.`
      : `🎉 Done! Shortest distances from ${source}: ${nodes.map(n => `${n.id}=${dist[n.id] === INF ? '∞' : dist[n.id]}`).join(', ')}.`,
    activeLine: 26,
  };
}

// ─── Info & Code ──────────────────────────────────────────────────────────────
export const bellmanFordInfo = {
  name: 'Bellman-Ford Algorithm',
  description: 'Find shortest paths from a source to all vertices, handling negative edge weights. Detects negative-weight cycles by running one extra relaxation pass.',
  timeComplexity: 'O(V × E)',
  spaceComplexity: 'O(V)',
};

export const bellmanFordCode = `function bellmanFord(graph, source) {
  const dist = {};
  const prev = {};
  for (const v of graph.nodes) {
    dist[v] = Infinity;
    prev[v] = null;
  }
  dist[source] = 0;

  // Relax all edges V-1 times
  for (let i = 0; i < V - 1; i++) {
    for (const { u, v, w } of graph.edges) {
      if (dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
        prev[v] = u;
      }
    }
  }

  // Check for negative-weight cycle
  for (const { u, v, w } of graph.edges) {
    if (dist[u] + w < dist[v])
      throw new Error('Negative cycle detected!');
  }

  return { dist, prev };
}`;
