export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <h1 className="text-3xl font-bold text-ink">Privacy Policy</h1>
      <div className="space-y-4 text-sm leading-6 text-slate-700">
        <p>Course Planner is an independent student-created platform. This page outlines how we handle your information.</p>
        <h2 className="text-lg font-bold text-ink">Data Collection</h2>
        <p>Course Planner does not collect, store, or transmit personal data to any external server. All planning data (saved courses, student profile, completed courses) is stored locally in your browser using localStorage and never leaves your device.</p>
        <h2 className="text-lg font-bold text-ink">Cookies</h2>
        <p>This website does not use tracking cookies or analytics services.</p>
        <h2 className="text-lg font-bold text-ink">Third-Party Services</h2>
        <p>Course information is sourced from publicly available University of Auckland catalogue pages. No personal data is shared with any third party.</p>
        <h2 className="text-lg font-bold text-ink">Contact</h2>
        <p>This is a student project. For questions about this privacy policy, please contact the project maintainer.</p>
      </div>
    </main>
  );
}
