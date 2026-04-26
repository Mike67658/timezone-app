export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#050814] text-white flex items-center justify-center px-6">
      <div className="max-w-2xl w-full p-8 bg-black/40 border border-cyan-500/20 rounded-xl shadow-[0_0_25px_rgba(0,255,255,0.08)]">
        <h1 className="text-4xl font-bold text-cyan-300 mb-6">Privacy Policy</h1>

        <p className="text-gray-300 mb-4">
          We respect your privacy. This website does not require user accounts and does not store personal user information.
        </p>

        <p className="text-gray-300 mb-4">
          Any city searches you perform are processed in real-time to display timezone and weather information. We do not sell, share, or store your search history.
        </p>

        <p className="text-gray-300 mb-4">
          We may use basic analytics to understand general traffic patterns, but this data is anonymous and cannot be used to identify individual users.
        </p>

        <p className="text-gray-300 mb-4">
          Weather data is provided by third-party services and may be subject to their own privacy policies.
        </p>

        <p className="text-gray-400 text-sm mt-6">
          By using this site, you agree that no personal data is stored or tracked beyond standard anonymous analytics.
        </p>
      </div>
    </div>
  );
}

