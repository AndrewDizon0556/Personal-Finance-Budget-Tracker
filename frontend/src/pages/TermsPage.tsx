import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <Link to="/" className="mb-6 flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink">
        <ArrowLeft size={15} /> Back
      </Link>

      <div className="mb-6 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-nu-blue-100 text-nu-blue-700">
          <FileText size={18} />
        </span>
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Terms of Service</h1>
          <p className="text-xs text-ink-faint">Last updated: June 3, 2026</p>
        </div>
      </div>

      <div className="prose prose-sm max-w-none text-ink-soft space-y-6">
        <Section title="1. About Ipon Challenge">
          <p>
            Ipon Challenge is a student personal finance tracker developed as an educational portfolio
            project by Vic Andrew A. Dizon at National University Laguna. The app is provided free of
            charge and is intended for educational and personal use only.
          </p>
        </Section>

        <Section title="2. Acceptance of Terms">
          <p>
            By accessing or using Ipon Challenge, you agree to be bound by these Terms of Service. If
            you do not agree, please do not use the app.
          </p>
        </Section>

        <Section title="3. Use of the Service">
          <ul className="list-disc pl-5 space-y-1">
            <li>You must be a student or individual using the app for personal budgeting purposes.</li>
            <li>You are responsible for maintaining the security of your account credentials.</li>
            <li>You agree not to use the app for any unlawful purpose.</li>
            <li>You agree not to attempt to reverse-engineer or compromise the application's security.</li>
          </ul>
        </Section>

        <Section title="4. Financial Disclaimer">
          <p>
            Ipon Challenge is a budgeting aid — not financial advice. All financial decisions you make
            based on the app's data are your own responsibility. We are not licensed financial advisors.
            Consult a qualified professional for financial guidance.
          </p>
        </Section>

        <Section title="5. Data & Privacy">
          <p>
            Your financial data is stored securely in our database. We do not sell, share, or disclose
            your personal data to third parties. See our <Link to="/privacy" className="text-nu-blue-600 underline">Privacy Policy</Link> for
            full details.
          </p>
        </Section>

        <Section title="6. Intellectual Property">
          <p>
            The Ipon Challenge application code is released under the MIT License. NU Laguna branding
            elements are used for educational, non-commercial purposes only and remain the property of
            National University Laguna.
          </p>
        </Section>

        <Section title="7. Limitation of Liability">
          <p>
            Ipon Challenge is provided "as is" without warranty of any kind. We are not liable for any
            data loss, financial loss, or damages arising from the use of this application.
          </p>
        </Section>

        <Section title="8. Changes to Terms">
          <p>
            We may update these terms at any time. Continued use of the app after changes constitutes
            acceptance of the new terms.
          </p>
        </Section>

        <Section title="9. Contact">
          <p>
            Questions? Reach us at{' '}
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
