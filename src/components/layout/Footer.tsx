import type { SiteSettings } from "@/types/contentstack";

interface Props {
  settings: SiteSettings;
}

export default function Footer({ settings }: Props) {
  const footer = settings.footer;

  return (
    <footer className="border-t border-gray-200 bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-7xl flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
        {/* Copyright */}
        <p className="text-sm text-gray-500" {...footer?.$?.copyright_text}>
          {footer?.copyright_text ?? `\u00a9 ${new Date().getFullYear()} ${settings.site_name}`}
        </p>

        {/* Social links */}
        {footer?.social_links && footer.social_links.length > 0 && (
          <ul className="flex items-center gap-4">
            {footer.social_links.map((link) => (
              <li key={link.platform}>
                <a
                  href={link.url.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {link.platform}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </footer>
  );
}
