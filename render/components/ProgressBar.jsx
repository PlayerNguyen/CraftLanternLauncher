export function ProgressBar({ value }) {
  return (
    <div className="progressBar-outer border-2 border-b-primary-black relative h-4">
      <div
        className="absolute bg-primary h-full"
        style={{ width: value + "%" }}
      ></div>
    </div>
  );
}
