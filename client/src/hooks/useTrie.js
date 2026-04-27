import { useState, useRef, useCallback } from 'react';
import { TrieNode, trieInsert, trieSearch } from '../algorithms/trie';

export function useTrie(speed = 100) {
    const [root, setRoot] = useState(new TrieNode());
    const [wordInput, setWordInput] = useState('');
    const [frame, setFrame] = useState(null);
    const [isRunning, setIsRunning] = useState(false);
    const [isDone, setIsDone] = useState(false);

    const genRef = useRef(null);
    const timerRef = useRef(null);

    const resetState = useCallback(() => {
        setIsRunning(false);
        setIsDone(false);
        setFrame(null);
        genRef.current = null;
        if (timerRef.current) clearTimeout(timerRef.current);
    }, []);

    const handleRun = useCallback((type) => {
        if (!wordInput) return;
        resetState();
        setIsRunning(true);

        const gen = type === 'insert' ? trieInsert(root, wordInput) : trieSearch(root, wordInput);
        genRef.current = gen;

        const run = () => {
            const { value, done } = genRef.current.next();
            if (done) {
                setIsRunning(false);
                setIsDone(true);
                return;
            }
            setFrame(value);
            timerRef.current = setTimeout(run, 1100 - speed);
        };
        run();
    }, [root, wordInput, speed, resetState]);

    const handleStep = useCallback((type) => {
        if (!wordInput) return;
        if (!genRef.current) {
            genRef.current = type === 'insert' ? trieInsert(root, wordInput) : trieSearch(root, wordInput);
        }
        const { value, done } = genRef.current.next();
        if (done) {
            setIsRunning(false);
            setIsDone(true);
            return;
        }
        setFrame(value);
    }, [root, wordInput]);

    return {
        root, setRoot,
        wordInput, setWordInput,
        frame, isRunning, isDone,
        handleRun, handleStep, resetState
    };
}
