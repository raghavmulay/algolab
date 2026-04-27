import GraphVisualizer from '../components/GraphVisualizer';
import Controls from '../components/Controls';

export default function GraphSection({
  selectedAlgo, graphFrame, graphRunning, graphDone,
  speed, onSpeedChange, onStart, onPause, onStep, onReset,
}) {
  return (
    <>
      <GraphVisualizer frame={graphFrame} algoId={selectedAlgo} />
      <Controls
        isRunning={graphRunning}
        onStart={onStart}
        onPause={onPause}
        onReset={onReset}
        onStep={onStep}
        speed={speed}
        onSpeedChange={onSpeedChange}
        disabled={graphDone}
      />
    </>
  );
}
