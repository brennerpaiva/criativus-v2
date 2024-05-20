import React from 'react';

interface ErrorMessageProps {
  message?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <span className="text-red-700 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
      {message}
    </span>
  );
};

export default ErrorMessage;
