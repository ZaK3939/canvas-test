import { useState } from "react";
import type { ReactSketchCanvasRef } from "react-sketch-canvas";
import { FaPen, FaEraser, FaUndo, FaRedo, FaTrash } from "react-icons/fa";
import ControlButton from "./ControlButton";
import ColorTile from "./ColorTile";

interface CanvasControlsProps {
  canvasRef: React.RefObject<ReactSketchCanvasRef>;
  setStrokeColor: (color: string) => void;
  onReset: () => void;
}

const CanvasControls: React.FC<CanvasControlsProps> = ({
  canvasRef,
  setStrokeColor,
  onReset,
}) => {
  const [activeToolIndex, setActiveToolIndex] = useState(0);
  const [activeColorIndex, setActiveColorIndex] = useState(0);

  const tools = [
    { icon: <FaPen />, action: () => canvasRef.current?.eraseMode(false) },
    { icon: <FaEraser />, action: () => canvasRef.current?.eraseMode(true) },
  ];

  const colors = [
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#FFFF00",
    "#FF00FF",
    "#00FFFF",
  ];

  return (
    <div className="ml-2 flex flex-col">
      {tools.map((tool, index) => (
        <ControlButton
          key={index}
          icon={tool.icon}
          isActive={index === activeToolIndex}
          onClick={() => {
            setActiveToolIndex(index);
            tool.action();
          }}
        />
      ))}
      <ControlButton
        icon={<FaUndo />}
        onClick={() => canvasRef.current?.undo()}
      />
      <ControlButton
        icon={<FaRedo />}
        onClick={() => canvasRef.current?.redo()}
      />
      <ControlButton
        icon={<FaTrash />}
        onClick={onReset} // 新しいリセットボタン
      />
      {colors.map((color, index) => (
        <ColorTile
          key={color}
          color={color}
          isActive={index === activeColorIndex}
          onClick={() => {
            setActiveColorIndex(index);
            setStrokeColor(color);
          }}
        />
      ))}
    </div>
  );
};

export default CanvasControls;
