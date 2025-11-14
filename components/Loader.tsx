
import React from 'react';

interface LoaderProps {
  large?: boolean;
}

export const Loader: React.FC<LoaderProps> = ({ large = false }) => {
  const sizeClasses = large ? 'h-12 w-12' : 'h-5 w-5';
  const borderClasses = large ? 'border-4' : 'border-2';

  return (
    <div
      className={`${sizeClasses} ${borderClasses} border-t-purple-400 border-r-purple-400 border-b-gray-600 border-l-gray-600 rounded-full animate-spin`}
    ></div>
  );
};
