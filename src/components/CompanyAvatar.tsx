import React from "react";

export function CompanyAvatar({ name, className = "" }: { name: string; className?: string }) {
  // Generate a consistent color based on the name
  const getBackgroundColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 70%, 15%)`; // Dark rich colors matching the design (black, dark green, dark blue)
  };

  const initial = name.charAt(0).toUpperCase();
  const bgColor = name === "Apple" || name === "Amazon" ? "#000" : getBackgroundColor(name);

  return (
    <div 
      className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0 shadow-sm ${className}`}
      style={{ backgroundColor: bgColor }}
    >
      {initial}
    </div>
  );
}
