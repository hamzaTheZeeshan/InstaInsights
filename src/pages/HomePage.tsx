import DropZone from '../components/Upload/DropZone';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4">
      <div className="mb-10 text-center">
        <h1 className="text-5xl font-bold text-white mb-3">InstaInsights</h1>
        <p className="text-gray-400 text-lg">Upload your Instagram chat export and get deep insights.</p>
        <p className="text-gray-600 text-sm mt-2">🔒 Everything stays on your device. Nothing is uploaded.</p>
      </div>
      <DropZone />
    </div>
  );
}