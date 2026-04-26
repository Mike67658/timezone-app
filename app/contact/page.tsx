"use client";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#050814] text-white flex items-center justify-center px-6">

      <div className="w-full max-w-2xl space-y-6">

        {/* HEADER */}
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-bold text-cyan-300 drop-shadow-[0_0_18px_rgba(34,211,238,0.6)]">
            Contact
          </h1>
          <p className="text-gray-400">
            Send feedback, report issues, or suggest improvements.
          </p>
        </div>

        {/* FORM CARD */}
        <div className="p-6 bg-black/40 border border-cyan-500/20 rounded-xl shadow-[0_0_25px_rgba(34,211,238,0.08)] space-y-4">

          <form
            className="space-y-4"
            onSubmit={(e) => e.preventDefault()}
          >

            {/* NAME */}
            <div>
              <label className="text-sm text-gray-300">Name</label>
              <input
                type="text"
                placeholder="Your name"
                className="w-full mt-1 p-3 rounded-lg bg-black/60 border border-blue-500/20 focus:border-cyan-400 outline-none"
              />
            </div>

            {/* EMAIL */}
            <div>
              <label className="text-sm text-gray-300">Email (optional)</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full mt-1 p-3 rounded-lg bg-black/60 border border-blue-500/20 focus:border-cyan-400 outline-none"
              />
            </div>

            {/* MESSAGE */}
            <div>
              <label className="text-sm text-gray-300">Message</label>
              <textarea
                rows={5}
                placeholder="Tell us what you'd like improved..."
                className="w-full mt-1 p-3 rounded-lg bg-black/60 border border-blue-500/20 focus:border-cyan-400 outline-none"
              />
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              className="w-full py-3 rounded-lg font-semibold text-black bg-cyan-300 hover:bg-cyan-200 transition shadow-[0_0_20px_rgba(34,211,238,0.4)]"
            >
              Send Message
            </button>

          </form>
        </div>

        {/* FOOTER NOTE */}
        <div className="text-center text-xs text-gray-500">
          We do not guarantee replies to all messages.
        </div>

      </div>
    </div>
  );
}
