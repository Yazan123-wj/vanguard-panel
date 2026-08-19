export const SITE = {
  name: 'Vanguard',
  title: 'Vanguard — Marketing & Technology Agency | Amman, MENA',
  description:
    'Full-service marketing and technology agency in Amman. Strategy, creative, performance media, and AI-driven solutions for businesses across MENA. Forward is a decision.',
  url: 'https://www.vanguardmena.com',
  logo: '/brand/vanguard-logo.png',
  mark: '/brand/vanguard-mark.png',
  email: 'Info@vanguardmena.com',
  phone: '+962 79 2624 250',
  phoneWhatsApp: 'https://wa.me/962792624250',
  location: 'Amman, Jordan — operating across MENA.',
} as const;

export const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services' },
  { label: 'Projects', href: '/projects' },
  { label: 'Signals', href: '/blogs' },
  { label: 'Contact', href: '/contact' },
] as const;

// Rendered height of the navbar pill (py-3 + 40px avatar). The hero derives
// its top padding from this — no magic numbers in sections.
export const NAVBAR_HEIGHT = 64;

/** Session flag for the home CTA → /projects curtain handoff. */
export const PROJECTS_TRANSITION_KEY = 'vanguard-projects-transition';

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;
