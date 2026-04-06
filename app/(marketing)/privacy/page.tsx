export const metadata = { title: "Privacy", description: "Privacy policy." };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <div className="font-[var(--font-ocr)] text-[rgb(var(--neon))] text-sm tracking-wider mb-2">{"// PRIVACY"}</div>
          <h1 className="font-[var(--font-ibm)] text-3xl text-[rgb(var(--text-color))] mb-4">Privacy Policy</h1>
          <p className="text-[rgb(var(--text-secondary))] text-sm">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
        <div className="surface-panel p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-[rgb(var(--text-color))] font-[var(--font-ibm)] text-lg mb-2">Data Collection</h2>
            <p className="text-[rgb(var(--text-secondary))] text-sm">This site collects minimal analytics data through Vercel Analytics. Contact form submissions are sent via email and not stored. No personal data is sold or shared with third parties.</p>
          </div>
          <div>
            <h2 className="text-[rgb(var(--text-color))] font-[var(--font-ibm)] text-lg mb-2">Cookies</h2>
            <p className="text-[rgb(var(--text-secondary))] text-sm">Theme preference is stored in localStorage only. No tracking cookies are used.</p>
          </div>
          <div>
            <h2 className="text-[rgb(var(--text-color))] font-[var(--font-ibm)] text-lg mb-2">AI Chat</h2>
            <p className="text-[rgb(var(--text-secondary))] text-sm">Chat messages are sent to AI providers (Groq or OpenAI) for processing. Conversations are not persisted on the server.</p>
          </div>
          <div>
            <h2 className="text-[rgb(var(--text-color))] font-[var(--font-ibm)] text-lg mb-2">Contact</h2>
            <p className="text-[rgb(var(--text-secondary))] text-sm">For privacy inquiries, contact <a href="mailto:hello@stepweaver.dev" className="text-[rgb(var(--neon))]">hello@stepweaver.dev</a>.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
