export function ProgressBar({ value }) {
  return (
    <div className="progressBar-outer border-2 border-b-primary-black relative h-4 animate-pulse">
      <div className="absolute bg-[#23a323] w-full h-full"></div>
    </div>
  );
}
