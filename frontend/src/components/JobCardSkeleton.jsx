// Loading Skeleton Component for Job Cards
// Shows animated placeholder while jobs are loading

const JobCardSkeleton = () => {
  return (
    <div className="bg-dark-850/50 backdrop-blur-xl rounded-xl shadow-card p-5 border border-white/5 animate-pulse h-full flex flex-col">
      <div className="flex items-start space-x-4">
        {/* Company Logo Skeleton */}
        <div className="flex-shrink-0">
          <div className="w-14 h-14 bg-gray-700/50 rounded-xl"></div>
        </div>

        {/* Content Skeleton */}
        <div className="flex-1 min-w-0 flex flex-col space-y-3">
          {/* Badges Skeleton */}
          <div className="flex gap-2">
            <div className="h-7 w-24 bg-gray-700/50 rounded-full"></div>
            <div className="h-7 w-20 bg-gray-700/50 rounded-full"></div>
          </div>

          {/* Title Skeleton */}
          <div className="h-7 bg-gray-700/50 rounded w-3/4"></div>

          {/* Company Skeleton */}
          <div className="h-5 bg-gray-700/50 rounded w-1/2"></div>

          {/* Skills Skeleton */}
          <div className="flex gap-2">
            <div className="h-6 w-16 bg-gray-700/50 rounded-md"></div>
            <div className="h-6 w-20 bg-gray-700/50 rounded-md"></div>
            <div className="h-6 w-18 bg-gray-700/50 rounded-md"></div>
          </div>

          {/* Location Skeleton */}
          <div className="h-5 bg-gray-700/50 rounded w-1/3"></div>

          {/* Description Skeleton */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-700/50 rounded"></div>
            <div className="h-4 bg-gray-700/50 rounded w-4/5"></div>
          </div>

          {/* Spacer for button at bottom */}
          <div className="flex-grow"></div>

          {/* Button Skeleton */}
          <div className="mt-auto pt-4">
            <div className="h-12 bg-gradient-to-r from-violet-600/50 to-fuchsia-600/50 rounded-lg"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobCardSkeleton;


