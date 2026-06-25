import Link from 'next/link';

const footerLinks = {
  Product: [
    { href: '/#features', label: 'Features' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/login', label: 'Sign In' },
  ],
  Company: [
    { href: '/faq', label: 'FAQ' },
    { href: 'mailto:hello@codentra.com', label: 'Contact' },
  ],
  Legal: [
    { href: '/terms', label: 'Terms of Service' },
    { href: '/privacy', label: 'Privacy Policy' },
  ],
};

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div className="sm:col-span-1">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
                C
              </span>
              <span className="text-lg font-bold">Codentra</span>
            </div>
            <p className="mt-2 text-sm font-medium">Learn. Compete. Grow.</p>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              The platform for developers to practice, compete, and advance
              their careers.
            </p>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold">{title}</h4>
              <ul className="mt-3 space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t pt-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Codentra. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
