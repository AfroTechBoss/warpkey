import React from 'react';

interface ArbitrumIconProps {
  className?: string;
  size?: number;
}

export const ArbitrumIcon: React.FC<ArbitrumIconProps> = ({ className = '', size = 24 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="12" cy="12" r="12" fill="#2D374B"/>
      <path
        d="M12 4L18.5 16H5.5L12 4Z"
        fill="#96BEDC"
      />
      <path
        d="M12 4L15.25 10H8.75L12 4Z"
        fill="#28A0F0"
      />
      <path
        d="M8.75 10L12 16L15.25 10H8.75Z"
        fill="#96BEDC"
      />
      <path
        d="M5.5 16L8.75 10L12 16H5.5Z"
        fill="#28A0F0"
      />
      <path
        d="M15.25 10L18.5 16H12L15.25 10Z"
        fill="#28A0F0"
      />
    </svg>
  );
};