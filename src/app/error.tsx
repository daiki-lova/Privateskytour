'use client';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">エラー</h1>
        <p className="mb-4">問題が発生しました</p>
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-primary text-white rounded"
        >
          もう一度試す
        </button>
      </div>
    </div>
  );
}
