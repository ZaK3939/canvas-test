import Image from "next/image";
import { ReactSketchCanvas } from "react-sketch-canvas";
import type { ReactSketchCanvasRef } from "react-sketch-canvas";
import { useState, useRef, useEffect } from "react";
import CanvasControls from "./CanvasControls";

interface ImageObject {
  id: string;
  url: string;
  position: { x: number; y: number };
  scale: number;
  rotation: number;
  stickerMode: boolean;
  shadowStrength: number;
}

const SketchPage: React.FC = () => {
  const [images, setImages] = useState<ImageObject[]>([]);
  const [inputUrl, setInputUrl] = useState("");
  const [strokeColor, setStrokeColor] = useState("red");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<ReactSketchCanvasRef>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 512, height: 512 });
  const [activeImageId, setActiveImageId] = useState<string | null>(null);
  const [stickerMode, setStickerMode] = useState(false);

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
    if (inputUrl) {
      const newImage: ImageObject = {
        id: Date.now().toString(),
        url: inputUrl,
        position: { x: 0, y: 0 },
        scale: 1,
        rotation: 0,
        stickerMode: false,
        shadowStrength: 0,
      };
      setImages([...images, newImage]);
      setInputUrl("");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (typeof event.target?.result === "string") {
            const newImage: ImageObject = {
              id: Date.now().toString(),
              url: event.target.result,
              position: { x: 0, y: 0 },
              scale: 1,
              rotation: 0,
              stickerMode: false,
              shadowStrength: 0,
            };
            setImages((prevImages) => [...prevImages, newImage]);
          }
        };
        reader.readAsDataURL(file);
      });
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

  const handleImageChange = (id: string, changes: Partial<ImageObject>) => {
    setImages(
      images.map((img) => (img.id === id ? { ...img, ...changes } : img)),
    );
  };

  const handleReset = () => {
    if (canvasRef.current) {
      canvasRef.current.clearCanvas();
    }
    setImages([]);
    setInputUrl("");
  };

  const handleImageDragStart = (
    e: React.MouseEvent<HTMLDivElement>,
    id: string,
  ) => {
    const img = images.find((img) => img.id === id);
    if (img) {
      const startX = e.clientX - img.position.x;
      const startY = e.clientY - img.position.y;

      const handleMouseMove = (e: MouseEvent) => {
        handleImageChange(id, {
          position: {
            x: e.clientX - startX,
            y: e.clientY - startY,
          },
        });
      };

      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }
  };

  const handleScaleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (activeImageId) {
      handleImageChange(activeImageId, { scale: parseFloat(e.target.value) });
    }
  };

  const handleRotationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (activeImageId) {
      handleImageChange(activeImageId, { rotation: parseInt(e.target.value) });
    }
  };
  const toggleStickerMode = () => {
    if (activeImageId) {
      const activeImage = images.find((img) => img.id === activeImageId);
      if (activeImage) {
        handleImageChange(activeImageId, {
          stickerMode: !activeImage.stickerMode,
        });
      }
    }
  };
  const handleShadowStrengthChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (activeImageId) {
      handleImageChange(activeImageId, {
        shadowStrength: parseFloat(e.target.value),
      });
    }
  };

  const handleExportJson = () => {
    const imageDataToExport = images.map((img) => ({
      id: img.id,
      //   url: img.url,
      position: img.position,
      scale: img.scale,
      rotation: img.rotation,
      stickerMode: img.stickerMode,
      shadowStrength: img.shadowStrength,
    }));

    const jsonData = JSON.stringify(imageDataToExport, null, 2);
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "sketch_images.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h1 className="mb-4 text-4xl font-bold text-white">Sketch Test</h1>
      <div className="mb-4 flex flex-col items-center">
        <div className="mb-2 flex">
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="Enter image URL"
            className="mr-2 rounded border p-2"
          />
          <button
            onClick={handleSubmit}
            className="rounded bg-blue-500 p-2 text-white"
          >
            Add Image
          </button>
        </div>
        <div className="flex">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            ref={fileInputRef}
            className="hidden"
            multiple
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="mr-2 rounded bg-green-500 p-2 text-white"
          >
            Upload Images
          </button>
          <button
            onClick={handleExportPng}
            className="rounded bg-purple-500 p-2 text-white"
          >
            Export PNG
          </button>
          <button
            onClick={handleExportJson}
            className="rounded bg-yellow-500 p-2 text-white"
          >
            Export JSON
          </button>
        </div>
      </div>
      <div className="relative flex">
        <div
          style={{
            width: "512px",
            height: "512px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {images.map((image) => (
            <div
              key={image.id}
              style={{
                position: "absolute",
                left: `${image.position.x}px`,
                top: `${image.position.y}px`,
                transform: `scale(${image.scale}) rotate(${image.rotation}deg)`,
                transformOrigin: "center center",
                cursor: "move",
                filter: `drop-shadow(0 0 ${image.shadowStrength * 10}px rgba(0,0,0,${image.shadowStrength * 0.5}))`,
              }}
              onMouseDown={(e) => {
                setActiveImageId(image.id);
                handleImageDragStart(e, image.id);
              }}
            >
              <div className={image.stickerMode ? "sticker-container" : ""}>
                <Image
                  src={image.url}
                  alt="Uploaded"
                  width={200}
                  height={200}
                  draggable={false}
                  className={image.stickerMode ? "sticker-image" : ""}
                />
              </div>
            </div>
          ))}
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
          onReset={handleReset}
        />
      </div>
      {activeImageId && (
        <div className="mt-4 flex flex-col items-center">
          <h3 className="mb-2 text-white">Active Image Controls</h3>
          <div className="mb-2 flex items-center">
            <label htmlFor="scale" className="mr-2 text-white">
              Scale:
            </label>
            <input
              type="range"
              id="scale"
              min="0.1"
              max="3"
              step="0.1"
              value={images.find((img) => img.id === activeImageId)?.scale ?? 1}
              onChange={handleScaleChange}
              className="w-40"
            />
            <span className="ml-2 text-white">
              {(
                images.find((img) => img.id === activeImageId)?.scale ?? 1
              ).toFixed(1)}
            </span>
          </div>
          <div className="flex items-center">
            <label htmlFor="rotation" className="mr-2 text-white">
              Rotation:
            </label>
            <input
              type="range"
              id="rotation"
              min="0"
              max="360"
              value={
                images.find((img) => img.id === activeImageId)?.rotation ?? 0
              }
              onChange={handleRotationChange}
              className="w-40"
            />
            <span className="ml-2 text-white">
              {images.find((img) => img.id === activeImageId)?.rotation ?? 0}°
            </span>
          </div>
          <div className="mb-2 flex items-center">
            <label htmlFor="shadowStrength" className="mr-2 text-white">
              Shadow:
            </label>
            <input
              type="range"
              id="shadow"
              min="0"
              max="1"
              step="0.1"
              value={
                images.find((img) => img.id === activeImageId)
                  ?.shadowStrength ?? 0
              }
              onChange={handleShadowStrengthChange}
              className="w-40"
            />
            <span className="ml-2 text-white">
              {(
                images.find((img) => img.id === activeImageId)
                  ?.shadowStrength ?? 0
              ).toFixed(1)}
            </span>
          </div>
          <div className="mt-2 flex space-x-2">
            <button
              onClick={toggleStickerMode}
              className={`rounded p-2 ${
                images.find((img) => img.id === activeImageId)?.stickerMode
                  ? "bg-green-500"
                  : "bg-gray-500"
              } text-white`}
            >
              Sticker Mode:{" "}
              {images.find((img) => img.id === activeImageId)?.stickerMode
                ? "ON"
                : "OFF"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SketchPage;
