/**
 * Structured Data (JSON-LD) Generator
 * Generates JSON-LD structured data for SEO
 */

// Base URL configuration
const baseUrl = process.env.VITE_BASE_URL || 'https://logi-ink.co.za';
const basePath = process.env.VITE_BASE_PATH || '/logi-ink/';

const fullUrl = `${baseUrl}${basePath === '/' ? '' : basePath.replace(/\/$/, '')}`;

// Organization Schema
export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Logi-Ink',
  alternateName: 'Logi Ink',
  url: fullUrl,
  logo: `${fullUrl}/logo.png`,
  description:
    'Digital Innovation & Creative Solutions - A digital agency specializing in web development, design, and digital transformation.',
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'ZA',
  },
  sameAs: [
    // Add social media links here
    // 'https://www.facebook.com/logiink',
    // 'https://www.twitter.com/logiink',
    // 'https://www.linkedin.com/company/logiink',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'Customer Service',
    email: 'info@logi-ink.co.za',
  },
};

// WebSite Schema
export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Logi-Ink',
  url: fullUrl,
  description:
    'Digital Innovation & Creative Solutions - A digital agency specializing in web development, design, and digital transformation.',
  publisher: {
    '@type': 'Organization',
    name: 'Logi-Ink',
  },
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${fullUrl}/search?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

// Service Schema
export const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  serviceType: 'Digital Agency Services',
  provider: {
    '@type': 'Organization',
    name: 'Logi-Ink',
  },
  areaServed: {
    '@type': 'Country',
    name: 'South Africa',
  },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Digital Services',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Web Development',
          description: 'Custom web development and web applications',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Web Design',
          description: 'Modern, responsive web design and UI/UX',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Digital Branding',
          description: 'Brand identity and digital branding solutions',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Digital Strategy',
          description: 'Digital transformation and strategy consulting',
        },
      },
    ],
  },
};

// BreadcrumbList Schema Generator
export function generateBreadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${fullUrl}${item.url}`,
    })),
  };
}

// Generate all schemas as JSON-LD script tags
export function generateStructuredDataScripts(pageType, breadcrumbs = null) {
  const scripts = [];

  // Organization schema (always included)
  scripts.push(
    `<script type="application/ld+json">${JSON.stringify(organizationSchema, null, 2)}</script>`
  );

  // WebSite schema (always included)
  scripts.push(
    `<script type="application/ld+json">${JSON.stringify(websiteSchema, null, 2)}</script>`
  );

  // Service schema (for services page)
  if (pageType === 'services') {
    scripts.push(
      `<script type="application/ld+json">${JSON.stringify(serviceSchema, null, 2)}</script>`
    );
  }

  // Breadcrumb schema (if provided)
  if (breadcrumbs && breadcrumbs.length > 0) {
    scripts.push(
      `<script type="application/ld+json">${JSON.stringify(
        generateBreadcrumbSchema(breadcrumbs),
        null,
        2
      )}</script>`
    );
  }

  return scripts.join('\n    ');
}
