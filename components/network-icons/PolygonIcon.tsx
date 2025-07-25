import React from 'react';

interface PolygonIconProps {
  className?: string;
  size?: number;
}

export const PolygonIcon: React.FC<PolygonIconProps> = ({ className = '', size = 24 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="12" cy="12" r="12" fill="#8247E5"/>
      <path
        d="M15.5 7.5L12 5.5L8.5 7.5V11.5L12 13.5L15.5 11.5V7.5Z"
        fill="white"
      />
      <path
        d="M8.5 12.5V16.5L12 18.5L15.5 16.5V12.5L12 14.5L8.5 12.5Z"
        fill="white"
        fillOpacity="0.8"
      />
      <path
        d="M16.5 8V12L20 10V6L16.5 8Z"
        fill="white"
        fillOpacity="0.6"
      />
      <path
        d="M4 6V10L7.5 12V8L4 6Z"
        fill="white"
        fillOpacity="0.6"
      />
      <path
        d="M16.5 13V17L20 15V11L16.5 13Z"
        fill="white"
        fillOpacity="0.4"
      />
      <path
        d="M4 11V15L7.5 17V13L4 11Z"
        fill="white"
        fillOpacity="0.4"
      />
    </svg>
  );
};