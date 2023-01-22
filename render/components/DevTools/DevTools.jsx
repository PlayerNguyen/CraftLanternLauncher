import { Button } from "../Button/Button";

export function DevTools() {
  const handleDownloadLatest = () => {
    alert(`Downloading latest version`);

    
  };
  return (
    <div className="px-6 py-12">
      {/* Header */}
      <div className="text-3xl">Dev Tools</div>
      <div className="flex flex-col gap-4 px-12 py-4">
        <div>Download from client test</div>
        <div className="flex flex-row gap-3">
          <button
            className="btn btn-primary btn-md"
            onClick={handleDownloadLatest}
          >
            Download latest asset
          </button>

          <button className="btn btn-primary btn-md">Clean asset</button>
        </div>
      </div>
    </div>
  );
}
