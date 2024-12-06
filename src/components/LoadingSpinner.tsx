export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2EC4B6]"></div>
    </div>
  );
}