export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#050814] text-white flex items-center justify-center px-6">
      <div className="max-w-3xl w-full space-y-6">

        <div className="text-center space-y-3">
          <h1 className="text-5xl font-bold text-cyan-300 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">
            About This App
          </h1>
          <p className="text-gray-400">
            Real-time city time, weather, and global search in one place.
          </p>
        </div>

        <div className="p-6 bg-black/40 border border-cyan-500/20 rounded-xl space-y-4">
          <h2 className="text-xl font-semibold text-cyan-200">
            What this does
          </h2>

          <p className="text-gray-300">
            This platform lets you instantly search any city worldwide and see
            its current local time, weather conditions, latitude, and longitude.
            Everything updates in real-time without requiring an account.
          </p>

          <p className="text-gray-300">
            The goal is simple: make global time and city data fast, accurate,
            and accessible from a single search bar.
          </p>
        </div>

        <div className="p-6 bg-black/40 border border-blue-500/20 rounded-xl space-y-3">
          <h2 className="text-xl font-semibold text-blue-300">
            Key Features
          </h2>

          <ul className="list-disc list-inside text-gray-300 space-y-1">
            <li>Search any city worldwide instantly</li>
            <li>Accurate timezone + live clock</li>
            <li>Real-time weather data</li>
            <li>No login required</li>
            <li>Fast global city database lookup</li>
          </ul>
        </div>

        <div className="p-6 bg-black/40 border border-cyan-500/20 rounded-xl space-y-3">
          <h2 className="text-xl font-semibold text-cyan-200">
            Data Sources
          </h2>

          <p className="text-gray-300">
            Weather data is provided via Open-Meteo. City and timezone data is
            derived from structured public geolocation datasets.
          </p>

          <p className="text-gray-400 text-sm">
            This app does not store personal user data or track individual searches.
          </p>
        </div>

        <div className="text-center text-xs text-gray-500 pt-6">
          Built for speed, simplicity, and global accessibility.
        </div>

      </div>
    </div>
  );
}

