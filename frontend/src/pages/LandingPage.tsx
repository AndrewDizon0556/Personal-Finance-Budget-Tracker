import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <span className="text-5xl">🐷</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-3">Ipon Challenge</h1>
        <p className="text-gray-500 mb-2 text-base">
          Track your allowance. Control your spending.
        </p>
        <p className="text-gray-400 text-sm mb-10">Survive the semester.</p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/register"
            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors text-sm"
          >
            Get Started
          </Link>
          <Link
            to="/login"
            className="border border-gray-200 text-gray-600 px-8 py-3 rounded-xl font-medium hover:bg-gray-100 transition-colors text-sm"
          >
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}
