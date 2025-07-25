import React from 'react';

interface ZoraIconProps {
  className?: string;
  size?: number;
}

export const ZoraIcon: React.FC<ZoraIconProps> = ({ className = '', size = 24 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="12" cy="12" r="12" fill="#000000"/>
      <path
        d="M6 6H18V8H8V16H18V18H6V6Z"
        fill="white"
      />
      <path
        d="M10 10H16V12H12V14H16V16H10V10Z"
        fill="white"
      />
    </svg>
  );
};