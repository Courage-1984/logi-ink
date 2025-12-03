/**
 * Helper script to add SEO, security, and accessibility to HTML files
 * This is a reference - actual updates should be done manually to each file
 */

// SEO configurations for each page
const seoConfig = {
  services: {
    title: 'Our Services - Logi-Ink',
    description:
      'Discover our comprehensive range of digital services including web development, design, branding, and digital strategy. We deliver solutions that exceed expectations.',
    keywords:
      'web development services, digital design, branding services, web design, digital strategy',
    url: 'https://logi-ink.co.za/logi-ink/services.html',
  },
  projects: {
    title: 'Our Projects - Logi-Ink Portfolio',
    description:
      'Explore our portfolio of successful digital projects. See how we transform ideas into exceptional digital experiences that drive results.',
    keywords: 'portfolio, web projects, digital projects, case studies, web design examples',
    url: 'https://logi-ink.co.za/logi-ink/projects.html',
  },
  contact: {
    title: 'Contact Us - Logi-Ink',
    description:
      'Get in touch with Logi-Ink to discuss your digital project. We are here to help bring your vision to life with innovative solutions.',
    keywords: 'contact logi-ink, get in touch, digital agency contact, project inquiry',
    url: 'https://logi-ink.co.za/logi-ink/contact.html',
  },
};

// Template for security headers
const securityHeaders = `    <!-- Security Headers -->
    <meta http-equiv="X-Content-Type-Options" content="nosniff" />
    <meta http-equiv="X-Frame-Options" content="DENY" />
    <meta http-equiv="X-XSS-Protection" content="1; mode=block" />
    <meta http-equiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
    <meta
      http-equiv="Permissions-Policy"
      content="geolocation=(), microphone=(), camera=()"
    />`;

// Template for SEO meta tags
function generateSEOTags(config) {
  return `    <!-- SEO Meta Tags -->
    <meta
      name="description"
      content="${config.description}"
    />
    <meta
      name="keywords"
      content="${config.keywords}"
    />
    <meta name="author" content="Logi-Ink" />
    <meta name="robots" content="index, follow" />
    <meta name="language" content="English" />
    <meta name="revisit-after" content="7 days" />

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${config.url}" />
    <meta property="og:title" content="${config.title}" />
    <meta
      property="og:description"
      content="${config.description}"
    />
    <meta
      property="og:image"
      content="https://logi-ink.co.za/logi-ink/assets/images/banners/banner_home.webp"
    />
    <meta property="og:site_name" content="Logi-Ink" />
    <meta property="og:locale" content="en_US" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${config.url}" />
    <meta name="twitter:title" content="${config.title}" />
    <meta
      name="twitter:description"
      content="${config.description}"
    />
    <meta
      name="twitter:image"
      content="https://logi-ink.co.za/logi-ink/assets/images/banners/banner_home.webp"
    />
    <meta name="twitter:site" content="@logiink" />
    <meta name="twitter:creator" content="@logiink" />`;
}

// Template for structured data
function generateStructuredData(config, pageType) {
  const breadcrumb = {
    services: [
      { name: 'Home', item: 'https://logi-ink.co.za/logi-ink/' },
      { name: 'Services', item: config.url },
    ],
    projects: [
      { name: 'Home', item: 'https://logi-ink.co.za/logi-ink/' },
      { name: 'Projects', item: config.url },
    ],
    contact: [
      { name: 'Home', item: 'https://logi-ink.co.za/logi-ink/' },
      { name: 'Contact', item: config.url },
    ],
  };

  const breadcrumbList = breadcrumb[pageType] || [];

  return `    <!-- Structured Data (JSON-LD) -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "${config.title}",
      "url": "${config.url}",
      "description": "${config.description}",
      "publisher": {
        "@type": "Organization",
        "name": "Logi-Ink"
      },
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": ${JSON.stringify(
          breadcrumbList.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.item,
          }))
        )}
      }
    }
    </script>`;
}

// Template for accessibility
const accessibilityHTML = `    <!-- Accessibility: Skip to Content Link -->
    <a href="#main-content" class="skip-link">Skip to main content</a>

    <!-- ARIA Live Region for announcements -->
    <div id="aria-live-region" aria-live="polite" aria-atomic="true" class="sr-only"></div>`;

console.log('This is a reference script. Use the templates above to update HTML files manually.');
