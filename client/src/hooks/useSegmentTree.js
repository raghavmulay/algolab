import { useState, useRef, useEffect } from 'react';
import {
  segTreeBuild, segTreeQuery, segTreeUpdate,
  buildSegTreeSync, segTreeInfo, segTreeCodeMap,
} from '../algorithms/segmentTree';

const DEFAULT_ARR = [1, 3, 5, 7, 9, 11];

export const SEG_TREE_IDS = new Set(['segTreeBuild', 'segTreeQuery', 'segTreeUpdate']);
export { segTreeInfo, segTreeCodeMap };

export function useSegmentTree(selectedAlgo, speed) {
  const [stArr, setStArr] = useState([...DEFAULT_ARR]);
  const [stTree, setStTree] = useState(() => buildSegTreeSync(DEFAULT_ARR));
  const [stFrame, setStFrame] = useState(null);
  const [stRunning, setStRunning] = useState(false);
  const [stDone, setStDone] = useState(false);

  // inputs
  const [stArrInput, setStArrInput] = useState(DEFAULT_ARR.join(', '));
  const [stQueryL, setStQueryL] = useState('1');
  const [stQueryR, setStQueryR] = useState('4');
  const [stUpdateIdx, setStUpdateIdx] = useState('2');
  const [stUpdateVal, setStUpdateVal] = useState('10');

  const stGenRef      = useRef(null);
  const stIntervalRef = useRef(null);

  useEffect(() => () => clearInterval(stIntervalRef.current), []);

  function stop() {
    setStRunning(false);
    clearInterval(stIntervalRef.current);
    stGenRef.current = null;
  }

  function runAnimation(gen, onDone) {
    stop();
    stGenRef.current = gen;
    setStRunning(true);
    setStDone(false);
    setStFrame(null);
    stIntervalRef.current = setInterval(() => {
      if (!stGenRef.current) return;
      const { value, done } = stGenRef.current.next();
      if (done) {
        clearInterval(stIntervalRef.current);
        setStRunning(false);
        setStDone(true);
        stGenRef.current = null;
        if (value && onDone) onDone(value);
        return;
      }
      setStFrame(value);
      if (value?.tree) setStTree(value.tree);
      if (value?.arr)  setStArr(value.arr);
    }, speed);
  }

  function handleRun() {
    if (selectedAlgo === 'segTreeBuild') {
      const parsed = stArrInput.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
      if (parsed.length < 2 || parsed.length > 16) return;
      runAnimation(segTreeBuild(parsed), ({ tree, arr }) => {
        setStTree(tree);
        setStArr(arr);
      });
      return;
    }

    if (selectedAlgo === 'segTreeQuery') {
      const l = parseInt(stQueryL, 10);
      const r = parseInt(stQueryR, 10);
      if (isNaN(l) || isNaN(r) || l < 0 || r >= stArr.length || l > r) return;
      runAnimation(segTreeQuery(stTree, stArr, l, r), null);
      return;
    }

    if (selectedAlgo === 'segTreeUpdate') {
      const idx = parseInt(stUpdateIdx, 10);
      const val = parseInt(stUpdateVal, 10);
      if (isNaN(idx) || isNaN(val) || idx < 0 || idx >= stArr.length) return;
      runAnimation(segTreeUpdate(stTree, stArr, idx, val), ({ tree, arr }) => {
        setStTree(tree);
        setStArr(arr);
      });
      return;
    }
  }

  function handleStep() {
    if (!stGenRef.current) { handleRun(); return; }
    const { value, done } = stGenRef.current.next();
    if (done) {
      setStRunning(false);
      setStDone(true);
      clearInterval(stIntervalRef.current);
      stGenRef.current = null;
      return;
    }
    setStFrame(value);
    if (value?.tree) setStTree(value.tree);
    if (value?.arr)  setStArr(value.arr);
  }

  function handleStart() {
    if (!stGenRef.current) { handleRun(); return; }
    setStRunning(true);
    stIntervalRef.current = setInterval(() => {
      if (!stGenRef.current) { clearInterval(stIntervalRef.current); return; }
      const { value, done } = stGenRef.current.next();
      if (done) {
        clearInterval(stIntervalRef.current);
        setStRunning(false);
        setStDone(true);
        stGenRef.current = null;
        return;
      }
      setStFrame(value);
      if (value?.tree) setStTree(value.tree);
      if (value?.arr)  setStArr(value.arr);
    }, speed);
  }

  function handlePause() {
    setStRunning(false);
    clearInterval(stIntervalRef.current);
  }

  function handleReset() {
    stop();
    const arr = [...DEFAULT_ARR];
    setStArr(arr);
    setStTree(buildSegTreeSync(arr));
    setStFrame(null);
    setStDone(false);
    setStArrInput(DEFAULT_ARR.join(', '));
    setStQueryL('1');
    setStQueryR('4');
    setStUpdateIdx('2');
    setStUpdateVal('10');
  }

  function resetState() {
    stop();
    setStFrame(null);
    setStDone(false);
  }

  return {
    stArr, stTree, stFrame,
    stRunning, stDone, stGenRef,
    stArrInput, setStArrInput,
    stQueryL, setStQueryL,
    stQueryR, setStQueryR,
    stUpdateIdx, setStUpdateIdx,
    stUpdateVal, setStUpdateVal,
    handleRun, handleStep, handleStart, handlePause, handleReset, resetState,
  };
}
