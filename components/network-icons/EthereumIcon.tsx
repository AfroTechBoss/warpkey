import React from 'react';

interface EthereumIconProps {
  className?: string;
  size?: number;
}

export const EthereumIcon: React.FC<EthereumIconProps> = ({ className = '', size = 24 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="12" cy="12" r="12" fill="#627EEA"/>
      <path
        d="M12 3L12.0025 9.6525L17.25 12L12 3Z"
        fill="white"
        fillOpacity="0.602"
      />
      <path
        d="M12 3L6.75 12L12 9.6525V3Z"
        fill="white"
      />
      <path
        d="M12 16.476L12.0025 21L17.2537 13.044L12 16.476Z"
        fill="white"
        fillOpacity="0.602"
      />
      <path
        d="M12 21V16.476L6.75 13.044L12 21Z"
        fill="white"
      />
      <path
        d="M12 15.432L17.25 12L12 9.6525V15.432Z"
        fill="white"
        fillOpacity="0.2"
      />
      <path
        d="M6.75 12L12 15.432V9.6525L6.75 12Z"
        fill="white"
        fillOpacity="0.602"
      />
    </svg>
  );
};