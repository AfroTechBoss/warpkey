import React from 'react';

interface BaseIconProps {
  className?: string;
  size?: number;
}

export const BaseIcon: React.FC<BaseIconProps> = ({ className = '', size = 24 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="12" cy="12" r="12" fill="#0052FF"/>
      <path
        d="M12.75 6.75V17.25H11.25V8.25H6.75V6.75H12.75Z"
        fill="white"
      />
    </svg>
  );
};