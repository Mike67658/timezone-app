export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#050814] text-white px-6 py-10">

      <div className="max-w-3xl mx-auto space-y-6">

        {/* TITLE */}
        <h1 className="text-4xl font-bold text-cyan-300 drop-shadow-[0_0_12px_rgba(34,211,238,0.6)]">
          Terms of Use
        </h1>

        {/* LAST UPDATED */}
        <p className="text-sm text-gray-400">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        {/* SECTION */}
        <div className="space-y-4 text-gray-300 leading-relaxed">

          <p>
            By using this website, you agree to the following terms. If you do not agree, please do not use the site.
          </p>

          <h2 className="text-xl font-semibold text-cyan-200">Use of the Service</h2>
          <p>
            This website provides city time and weather information for informational purposes only. Data accuracy is not guaranteed.
          </p>

          <h2 className="text-xl font-semibold text-cyan-200">No Warranties</h2>
          <p>
            All information is provided “as is” without warranties of any kind. We do not guarantee accuracy, completeness, or availability.
          </p>

          <h2 className="text-xl font-semibold text-cyan-200">External Data</h2>
          <p>
            Weather data is provided by third-party APIs. We are not responsible for outages, delays, or inaccuracies from external services.
          </p>

          <h2 className="text-xl font-semibold text-cyan-200">User Data</h2>
          <p>
            We do not require accounts and do not store personal user data.
          </p>

          <h2 className="text-xl font-semibold text-cyan-200">Changes</h2>
          <p>
            These terms may be updated at any time. Continued use of the site means you accept any changes.
          </p>

          <h2 className="text-xl font-semibold text-cyan-200">Contact</h2>
          <p>
            If you have questions, please use the contact page.
          </p>

        </div>

        {/* FOOTER NOTE */}
        <div className="pt-6 border-t border-blue-500/10 text-xs text-gray-500">
          Built for informational use. Not financial, legal, or emergency advice.
        </div>

      </div>
    </div>
  );
}

