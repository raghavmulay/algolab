import { DEFAULT_GRAPH_NODES, DEFAULT_GRAPH_EDGES } from './dijkstra';

// ─── Prim's MST Generator ─────────────────────────────────────────────────────
export function* prim(
  nodes = DEFAULT_GRAPH_NODES,
  edges = DEFAULT_GRAPH_EDGES,
  source = 'A'
) {
  // Build adjacency list (undirected)
  const adj = {};
  nodes.forEach(n => { adj[n.id] = []; });
  edges.forEach(({ from, to, weight }) => {
    adj[from].push({ node: to, weight });
    adj[to].push({ node: from, weight });
  });

  const inMST = new Set();
  const key = {};       // min edge weight to connect node to MST
  const parent = {};    // which MST node connects to this node
  nodes.forEach(n => { key[n.id] = Infinity; parent[n.id] = null; });
  key[source] = 0;

  const mstEdges = [];

  yield {
    nodes, edges,
    inMST: [...inMST],
    mstEdges: [],
    currentNode: null,
    currentEdge: null,
    key: { ...key },
    parent: { ...parent },
    phase: 'init',
    message: `Starting Prim's MST from node ${source}. key[${source}] = 0, all others = ∞.`,
    activeLine: 10,
  };

  for (let i = 0; i < nodes.length; i++) {
    // Pick node with minimum key not yet in MST
    let u = null;
    nodes.forEach(n => {
      if (!inMST.has(n.id) && (u === null || key[n.id] < key[u])) u = n.id;
    });

    if (u === null || key[u] === Infinity) break;

    inMST.add(u);

    if (parent[u] !== null) {
      mstEdges.push({ from: parent[u], to: u, weight: key[u] });
    }

    yield {
      nodes, edges,
      inMST: [...inMST],
      mstEdges: [...mstEdges],
      currentNode: u,
      currentEdge: null,
      key: { ...key },
      parent: { ...parent },
      phase: 'visiting',
      message: `Added node ${u} to MST (key=${key[u] === 0 ? 0 : key[u]}).${parent[u] ? ` Edge ${parent[u]}–${u} (w=${key[u]}) added.` : ''} Updating neighbors…`,
      activeLine: 15,
    };

    // Update keys of adjacent nodes
    for (const { node: v, weight } of adj[u]) {
      if (inMST.has(v)) continue;

      yield {
        nodes, edges,
        inMST: [...inMST],
        mstEdges: [...mstEdges],
        currentNode: u,
        currentEdge: { from: u, to: v },
        key: { ...key },
        parent: { ...parent },
        phase: 'relaxing',
        message: `Edge ${u}–${v} (w=${weight}): current key[${v}]=${key[v] === Infinity ? '∞' : key[v]}, new candidate=${weight}.`,
        activeLine: 18,
      };

      if (weight < key[v]) {
        key[v] = weight;
        parent[v] = u;

        yield {
          nodes, edges,
          inMST: [...inMST],
          mstEdges: [...mstEdges],
          currentNode: u,
          currentEdge: { from: u, to: v },
          key: { ...key },
          parent: { ...parent },
          phase: 'updated',
          message: `✅ key[${v}] updated to ${weight} via ${u}.`,
          activeLine: 19,
        };
      }
    }
  }

  const totalWeight = mstEdges.reduce((s, e) => s + e.weight, 0);

  yield {
    nodes, edges,
    inMST: [...inMST],
    mstEdges: [...mstEdges],
    currentNode: null,
    currentEdge: null,
    key: { ...key },
    parent: { ...parent },
    phase: 'done',
    message: `🎉 MST complete! ${mstEdges.length} edges, total weight = ${totalWeight}. Edges: ${mstEdges.map(e => `${e.from}-${e.to}(${e.weight})`).join(', ')}.`,
    activeLine: 24,
  };
}

// ─── Info & Code ──────────────────────────────────────────────────────────────
export const primInfo = {
  name: "Prim's MST",
  description: "Build a Minimum Spanning Tree by greedily growing it one vertex at a time — always picking the cheapest edge that connects a new vertex to the current MST.",
  timeComplexity: 'O(V²) / O(E log V)',
  spaceComplexity: 'O(V)',
};

export const primCode = `function prim(graph, source) {
  const inMST = new Set();
  const key = {};    // min edge weight to reach node
  const parent = {}; // MST parent of each node

  for (const v of graph.nodes) {
    key[v] = Infinity;
    parent[v] = null;
  }
  key[source] = 0;

  while (inMST.size < graph.nodes.length) {
    // Pick min-key node not in MST
    const u = minKeyNode(key, inMST);
    inMST.add(u);

    for (const { node: v, weight } of graph.adj[u]) {
      if (!inMST.has(v) && weight < key[v]) {
        key[v] = weight;    // cheaper edge found
        parent[v] = u;
      }
    }
  }
  return parent; // reconstruct MST edges from parent[]
}`;
