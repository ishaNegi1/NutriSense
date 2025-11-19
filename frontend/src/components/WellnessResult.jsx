export default function WellnessResult({ result, onBack }) {
  return (
    <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6 shadow-md">
      <h2 className="text-2xl font-bold text-green-700 mb-4">
        Wellness Summary
      </h2>

      <p className="mb-2">
        <b>Wellness Score:</b> {result.wellness_score}
      </p>

      <p className="mb-2">
        <b>Status:</b> {result.prediction}
      </p>

      <h3 className="text-lg font-semibold text-green-700 mt-4">
        Recommendations:
      </h3>

      <ul className="list-disc ml-6 mt-2 text-gray-700">
        {result.recommendations.map((rec, i) => (
          <li key={i}>{rec}</li>
        ))}
      </ul>

      <button
        onClick={onBack}
        className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg"
      >
        Back
      </button>
    </div>
  );
}
