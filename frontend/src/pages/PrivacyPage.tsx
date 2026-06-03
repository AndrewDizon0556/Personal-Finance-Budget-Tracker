import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <Link to="/" className="mb-6 flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink">
        <ArrowLeft size={15} /> Back
      </Link>

      <div className="mb-6 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-100 text-emerald-700">
          <Shield size={18} />
        </span>
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Privacy Policy</h1>
          <p className="text-xs text-ink-faint">Last updated: June 3, 2026</p>
        </div>
      </div>

      <div className="prose prose-sm max-w-none text-ink-soft space-y-6">
        <Section title="1. What We Collect">
          <p>When you create an account, we collect:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Full name</strong> — for personalizing your experience</li>
            <li><strong>School name</strong> — optional, used for context</li>
            <li><strong>Email address</strong> — for authentication only</li>
            <li><strong>Password</strong> — stored as a bcrypt hash; we never store plain-text passwords</li>
            <li><strong>Financial data</strong> — expenses, budgets, savings goals you enter</li>
          </ul>
        </Section>

        <Section title="2. What We Do NOT Collect">
          <ul className="list-disc pl-5 space-y-1">
            <li>We do not collect your real name from a national ID or any government document</li>
            <li>We do not collect payment card or bank account information</li>
            <li>We do not use advertising trackers or third-party analytics</li>
            <li>We do not sell your data to any third party</li>
          </ul>
        </Section>

        <Section title="3. How We Use Your Data">
          <ul className="list-disc pl-5 space-y-1">
            <li>To provide the budgeting and expense tracking features</li>
            <li>To authenticate your account securely using JWT tokens</li>
            <li>To compute analytics (done on the server, not shared externally)</li>
            <li>To generate gamification data (XP, streaks) based on your activity</li>
          </ul>
        </Section>

        <Section title="4. Data Storage & Security">
          <ul className="list-disc pl-5 space-y-1">
            <li>Data is stored in a PostgreSQL database hosted on Railway (US region)</li>
            <li>All API traffic is encrypted via HTTPS</li>
            <li>Passwords are hashed with BCrypt (minimum 12-character policy enforced)</li>
            <li>JWT tokens expire after 2 hours; you can revoke all sessions at any time</li>
            <li>Offline data is stored locally in your browser's IndexedDB — it never leaves your device until synced</li>
          </ul>
        </Section>

        <Section title="5. Data Retention">
          <p>
            Your data is retained for as long as your account is active. You may delete your account
            at any time by contacting us. Upon deletion, all your financial records are permanently
            removed from our database.
          </p>
        </Section>

        <Section title="6. Cookies & Local Storage">
          <p>
            We store your authentication token in localStorage for session persistence. We do not use
            advertising cookies or third-party tracking cookies. Offline data is stored in IndexedDB
            on your device.
          </p>
        </Section>

        <Section title="7. Third-Party Services">
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Railway</strong> — hosts the backend API and PostgreSQL database</li>
            <li><strong>Vercel</strong> — hosts the frontend application</li>
            <li>Neither platform receives your individual financial records</li>
          </ul>
        </Section>

        <Section title="8. Your Rights">
          <ul className="list-disc pl-5 space-y-1">
            <li>Access: you can export your data by contacting us</li>
            <li>Correction: update your profile anytime inside the app</li>
            <li>Deletion: request full account deletion by email</li>
          </ul>
        </Section>

        <Section title="9. Contact">
          <p>
            For privacy concerns, contact:{' '}
            <a href="mailto:dizonva@students.nu-laguna.edu.ph" className="text-nu-blue-600 underline">
              dizonva@students.nu-laguna.edu.ph
            </a>
          </p>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-2 font-display text-base font-bold text-ink">{title}</h2>
      {children}
    </div>
  );
}
