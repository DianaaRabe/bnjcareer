import {
  IconBrandLinkedin,
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandX,
  IconMail,
} from "@tabler/icons-react";

const footerLinks = [
  { label: "Fonctionnalités", href: "/#features" },
  { label: "Tarifs", href: "/tarifs" },
  { label: "Contact", href: "mailto:contact@collectif9559.com" },
  { label: "Confidentialité", href: "/privacy" },
  { label: "Conditions", href: "/terms" },
];

const socialLinks = [
  {
    icon: IconBrandFacebook,
    href: "https://facebook.com/collectif9559",
    label: "Facebook",
  },
  {
    icon: IconBrandLinkedin,
    href: "https://linkedin.com/company/collectif9559",
    label: "LinkedIn",
  },
  {
    icon: IconBrandInstagram,
    href: "https://instagram.com/collectif9559",
    label: "Instagram",
  },
  { icon: IconBrandX, href: "https://x.com/collectif9559", label: "X" },
  { icon: IconMail, href: "mailto:contact@collectif9559.com", label: "Email" },
];

// Thin decorative horizontal grid line
function GridLine() {
  return (
    <div className="mx-auto my-8 h-px w-full max-w-3xl bg-gradient-to-r from-transparent via-neutral-700 to-transparent" />
  );
}

export function Footer() {
  return (
    <footer className="bg-black pb-8 pt-16">
      <div className="mx-auto max-w-7xl px-6 sm:px-12 lg:px-20">
        {/* Centered logo */}
        <div className="flex justify-center">
          <a href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-400 text-xs font-black text-black">
              95
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              Collectif <span className="text-yellow-400">95:59</span>
            </span>
          </a>
        </div>

        {/* Nav links */}
        <nav className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-6">
          {footerLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm text-neutral-400 transition-colors hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <GridLine />

        {/* Bottom: copyright + socials */}
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          <p className="text-xs text-neutral-500">
            &copy; {new Date().getFullYear()} Collectif 95:59. Tous droits
            réservés.
          </p>
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="text-neutral-500 transition-colors hover:text-white"
              >
                <social.icon size={18} stroke={1.5} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
