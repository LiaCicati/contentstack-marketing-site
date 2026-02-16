import Link from "next/link";

export default function NotFound() {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <main className="flex flex-1 flex-col items-center justify-center px-6 py-32 text-center">
          <h1 className="text-6xl font-bold text-gray-900">404</h1>
          <p className="mt-4 text-lg text-gray-600">
            The page you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link
            href="/"
            className="mt-8 rounded-lg bg-brand-600 px-6 py-3 text-base font-semibold text-white hover:bg-brand-700 transition-colors"
          >
            Back to Home
          </Link>
        </main>
      </body>
    </html>
  );
}
