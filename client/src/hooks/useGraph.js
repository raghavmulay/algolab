import { useState, useRef, useCallback } from 'react';
import { dijkstra, dijkstraInfo, dijkstraCode, DEFAULT_GRAPH_NODES, DEFAULT_GRAPH_EDGES } from '../algorithms/dijkstra';
import { kruskal, kruskalInfo, kruskalCode } from '../algorithms/kruskal';
import { topoSort, topoSortInfo, topoSortCode, TOPO_NODES, TOPO_EDGES } from '../algorithms/topoSort';
import { prim, primInfo, primCode } from '../algorithms/prim';
import { bellmanFord, bellmanFordInfo, bellmanFordCode } from '../algorithms/bellmanFord';

export const GRAPH_IDS = new Set(['dijkstra', 'kruskal', 'topoSort', 'prim', 'bellmanFord']);

export const graphInfoMap = {
  dijkstra: dijkstraInfo,
  kruskal: kruskalInfo,
  topoSort: topoSortInfo,
  prim: primInfo,
  bellmanFord: bellmanFordInfo,
};

export const graphCodeMap = {
  dijkstra: dijkstraCode,
  kruskal: kruskalCode,
  topoSort: topoSortCode,
  prim: primCode,
  bellmanFord: bellmanFordCode,
};

function makeGen(algoId) {
  if (algoId === 'dijkstra')    return dijkstra(DEFAULT_GRAPH_NODES, DEFAULT_GRAPH_EDGES, 'A');
  if (algoId === 'kruskal')     return kruskal(DEFAULT_GRAPH_NODES, DEFAULT_GRAPH_EDGES);
  if (algoId === 'topoSort')    return topoSort(TOPO_NODES, TOPO_EDGES);
  if (algoId === 'prim')        return prim(DEFAULT_GRAPH_NODES, DEFAULT_GRAPH_EDGES, 'A');
  if (algoId === 'bellmanFord') return bellmanFord(DEFAULT_GRAPH_NODES, DEFAULT_GRAPH_EDGES, 'A');
  return null;
}

export function useGraph(selectedAlgo, speed) {
  const [graphFrame, setGraphFrame] = useState(null);
  const [graphRunning, setGraphRunning] = useState(false);
  const [graphDone, setGraphDone] = useState(false);
  const graphGenRef = useRef(null);
  const timerRef = useRef(null);

  const resetState = useCallback(() => {
    clearInterval(timerRef.current);
    graphGenRef.current = null;
    setGraphFrame(null);
    setGraphRunning(false);
    setGraphDone(false);
  }, []);

  const step = useCallback(() => {
    if (!graphGenRef.current) graphGenRef.current = makeGen(selectedAlgo);
    const { value, done } = graphGenRef.current.next();
    if (value) setGraphFrame(value);
    if (done) { setGraphRunning(false); setGraphDone(true); }
    return done;
  }, [selectedAlgo]);

  const handleStart = useCallback(() => {
    if (graphDone) return;
    if (!graphGenRef.current) graphGenRef.current = makeGen(selectedAlgo);
    setGraphRunning(true);
    timerRef.current = setInterval(() => {
      const { value, done } = graphGenRef.current.next();
      if (value) setGraphFrame(value);
      if (done) { clearInterval(timerRef.current); setGraphRunning(false); setGraphDone(true); }
    }, speed);
  }, [selectedAlgo, speed, graphDone]);

  const handlePause = useCallback(() => {
    clearInterval(timerRef.current);
    setGraphRunning(false);
  }, []);

  const handleStep = useCallback(() => { if (!graphRunning) step(); }, [graphRunning, step]);

  const handleReset = useCallback(() => resetState(), [resetState]);

  return { graphFrame, graphRunning, graphDone, graphGenRef, handleStart, handlePause, handleStep, handleReset, resetState };
}
