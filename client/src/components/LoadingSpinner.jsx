const LoadingSpinner = ({ fullScreen = false }) => {
  const spinner = (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4" />
      <p className="text-sm font-medium text-gray-500 animate-pulse">Loading...</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
