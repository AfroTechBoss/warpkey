import React from 'react';

interface OptimismIconProps {
  className?: string;
  size?: number;
}

export const OptimismIcon: React.FC<OptimismIconProps> = ({ className = '', size = 24 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="12" cy="12" r="12" fill="#FF0420"/>
      <path
        d="M8.5 8.5C7.11929 8.5 6 9.61929 6 11C6 12.3807 7.11929 13.5 8.5 13.5C9.88071 13.5 11 12.3807 11 11C11 9.61929 9.88071 8.5 8.5 8.5Z"
        fill="white"
      />
      <path
        d="M15.5 8.5C14.1193 8.5 13 9.61929 13 11C13 12.3807 14.1193 13.5 15.5 13.5C16.8807 13.5 18 12.3807 18 11C18 9.61929 16.8807 8.5 15.5 8.5Z"
        fill="white"
      />
      <path
        d="M8.5 14.5C7.11929 14.5 6 15.6193 6 17C6 18.3807 7.11929 19.5 8.5 19.5H15.5C16.8807 19.5 18 18.3807 18 17C18 15.6193 16.8807 14.5 15.5 14.5H8.5Z"
        fill="white"
      />
    </svg>
  );
};