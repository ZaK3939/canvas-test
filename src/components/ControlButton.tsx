import React from "react";

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

export default ControlButton;
