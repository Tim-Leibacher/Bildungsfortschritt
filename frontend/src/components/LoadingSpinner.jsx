import React from "react";

const LoadingSpinner = ({
  size = "lg",
  text = null,
  className = "",
  fullScreen = false,
  variant = "primary",
}) => {
  const sizeClasses = {
    xs: "loading-xs",
    sm: "loading-sm",
    md: "loading-md",
    lg: "loading-lg",
  };

  const variantClasses = {
    primary: "text-primary",
    secondary: "text-secondary",
    accent: "text-accent",
    neutral: "text-neutral",
    base: "text-base-content",
  };

  const spinner = (
    <div className={`text-center ${className}`}>
      <span
        className={`loading loading-spinner ${sizeClasses[size]} ${variantClasses[variant]}`}
      ></span>
      {text && (
        <div
          className={`mt-${
            size === "xs" || size === "sm" ? "2" : "4"
          } text-base-content`}
        >
          {text}
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
