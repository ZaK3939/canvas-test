import { type NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { ReactSketchCanvas, ReactSketchCanvasRef } from "react-sketch-canvas";
import { useState, useRef, useEffect } from "react";
import { FaPen, FaEraser, FaUndo, FaRedo } from "react-icons/fa";
import "react-resizable/css/styles.css";

const ControlButton: React.FC<{
  icon: React.ReactNode;
  isActive?: boolean;
  onClick: () => void;
}> = ({ icon, isActive, onClick }) => (
  <button
    className={`rounded-full p-2 ${
      isActive ? "bg-blue-500 text-white" : "bg-gray-700 text-gray-300"
    } mb-2 transition-colors duration-200 hover:bg-blue-600`}
    onClick={onClick}
  >
    {icon}
  </button>
);

const ColorTile: React.FC<{
  color: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ color, isActive, onClick }) => (
  <button
    className={`mb-2 h-8 w-8 rounded-full ${isActive ? "ring-2 ring-white" : ""}`}
    style={{ backgroundColor: color }}
    onClick={onClick}
  />
);

const CanvasControls: React.FC<{
  canvasRef: React.RefObject<ReactSketchCanvasRef>;
  setStrokeColor: (color: string) => void;
}> = ({ canvasRef, setStrokeColor }) => {
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

const SketchPage: NextPage = () => {
  const [backgroundImage, setBackgroundImage] = useState("");
  const [inputUrl, setInputUrl] = useState("");
  const [strokeColor, setStrokeColor] = useState("red");
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 512, height: 512 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<ReactSketchCanvasRef>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 512, height: 512 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateCanvasSize = () => {
      if (canvasRef.current) {
        const canvas = canvasRef.current as unknown as HTMLDivElement;
        setCanvasSize({
          width: canvas.offsetWidth,
          height: canvas.offsetHeight,
        });
      }
    };
    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    return () => window.removeEventListener("resize", updateCanvasSize);
  }, []);

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setBackgroundImage(inputUrl);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === "string") {
          setBackgroundImage(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExportPng = async () => {
    if (canvasRef.current) {
      try {
        const dataUrl = await canvasRef.current.exportImage("png");
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = "sketch.png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error("Failed to export PNG:", error);
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - imagePosition.x,
      y: e.clientY - imagePosition.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      setImagePosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const newScale = scale - e.deltaY * 0.001;
    setScale(Math.max(0.1, Math.min(newScale, 3)));
  };

  return (
    <>
      <Head>
        <title>Sketch Test</title>
        <meta name="description" content="Test React Sketch Canvas" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center p-4">
        <h1 className="mb-4 text-4xl font-bold">Sketch Test</h1>
        <div className="mb-4 flex">
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="Enter image URL"
            className="mr-2 rounded border p-2"
          />
          <button
            onClick={handleSubmit}
            className="mr-2 rounded bg-blue-500 p-2 text-white"
          >
            Set Background
          </button>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            ref={fileInputRef}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="rounded bg-green-500 p-2 text-white"
          >
            Upload Image
          </button>
        </div>
        <div className="relative flex">
          <div
            style={{
              width: "512px",
              height: "512px",
              position: "relative",
              overflow: "hidden",
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          >
            {backgroundImage && (
              <div
                style={{
                  position: "absolute",
                  left: `${imagePosition.x}px`,
                  top: `${imagePosition.y}px`,
                  transform: `scale(${scale})`,
                  transformOrigin: "top left",
                }}
              >
                <Image
                  src={backgroundImage}
                  alt="Background"
                  width={imageSize.width}
                  height={imageSize.height}
                  draggable={false}
                  style={{
                    pointerEvents: isDragging ? "none" : "auto",
                  }}
                />
              </div>
            )}
            <ReactSketchCanvas
              ref={canvasRef}
              style={{
                border: "0.0625rem solid #9c9c9c",
                borderRadius: "0.25rem",
              }}
              width="512px"
              height="512px"
              strokeWidth={4}
              strokeColor={strokeColor}
              preserveBackgroundImageAspectRatio="xMidYMid meet"
            />
          </div>
          <CanvasControls
            canvasRef={canvasRef}
            setStrokeColor={setStrokeColor}
          />
        </div>
        <button
          onClick={handleExportPng}
          className="mt-4 rounded bg-purple-500 p-2 text-white"
        >
          Export PNG
        </button>
      </main>
    </>
  );
};

export default SketchPage;
