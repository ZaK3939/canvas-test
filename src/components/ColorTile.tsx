import React from "react";

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

export default ColorTile;
