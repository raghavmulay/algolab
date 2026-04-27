import { useState, useRef, useCallback } from 'react';
import { dsuFind, dsuUnion } from '../algorithms/dsu';

export function useDSU(speed = 100) {
    const [parent, setParent] = useState(Array.from({ length: 10 }, (_, i) => i));
    const [rank, setRank] = useState(Array(10).fill(0));
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

    const handleUnion = useCallback((i, j) => {
        resetState();
        setIsRunning(true);

        // We clone to avoid direct mutation during gen
        const pClone = [...parent];
        const rClone = [...rank];
        genRef.current = dsuUnion(pClone, rClone, i, j);

        const run = () => {
            const { value, done } = genRef.current.next();
            if (done) {
                setIsRunning(false);
                setIsDone(true);
                setParent(pClone);
                setRank(rClone);
                return;
            }
            setFrame(value);
            timerRef.current = setTimeout(run, 1100 - speed);
        };
        run();
    }, [parent, rank, speed, resetState]);

    const handleFind = useCallback((i) => {
        resetState();
        setIsRunning(true);

        const pClone = [...parent];
        genRef.current = dsuFind(pClone, i);

        const run = () => {
            const { value, done } = genRef.current.next();
            if (done) {
                setIsRunning(false);
                setIsDone(true);
                // Note: Find might update parents via path compression logic in generator
                setParent(pClone);
                return;
            }
            setFrame(value);
            timerRef.current = setTimeout(run, 1100 - speed);
        };
        run();
    }, [parent, speed, resetState]);

    return {
        parent, rank,
        frame, isRunning, isDone,
        handleUnion, handleFind, resetState
    };
}
