import { useState, useRef, useCallback } from 'react';
import { kmp } from '../algorithms/kmp';

export function useKMP(speed = 100) {
    const [text, setText] = useState('ABABDABACDABABC');
    const [pattern, setPattern] = useState('ABABC');
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

    const handleStep = useCallback(() => {
        if (!genRef.current) {
            genRef.current = kmp(text, pattern);
        }
        const { value, done } = genRef.current.next();
        if (done) {
            setIsRunning(false);
            setIsDone(true);
            return;
        }
        setFrame(value);
    }, [text, pattern]);

    const handleStart = useCallback(() => {
        if (isDone) resetState();
        setIsRunning(true);

        const run = () => {
            if (!genRef.current) genRef.current = kmp(text, pattern);
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
    }, [text, pattern, speed, isDone, resetState]);

    const handlePause = useCallback(() => {
        setIsRunning(false);
        if (timerRef.current) clearTimeout(timerRef.current);
    }, []);

    return {
        text, setText,
        pattern, setPattern,
        frame, isRunning, isDone,
        handleStart, handlePause, handleStep, resetState
    };
}
