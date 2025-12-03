/**
 * SEO Meta Tags Generator
 * Generates meta tags for all HTML pages
 * This is a helper script - meta tags should be added directly to HTML files
 */

// SEO configuration for each page
export const seoConfig = {
  home: {
    title: 'Logi-Ink - Digital Innovation & Creative Solutions',
    description:
      'Logi-Ink is a digital innovation agency specializing in creative solutions, web development, and digital transformation. We bring your vision to life with cutting-edge technology and stunning design.',
    keywords:
      'digital agency, web development, creative solutions, digital innovation, web design, branding, digital transformation',
    ogType: 'website',
    ogImage: '/assets/images/banners/banner_home.webp',
  },
  about: {
    title: 'About Us - Logi-Ink',
    description:
      'Learn about Logi-Ink, our mission, values, and approach to digital innovation. We are passionate about creating exceptional digital experiences that drive business growth.',
    keywords: 'about logi-ink, digital agency team, company mission, digital innovation team',
    ogType: 'website',
    ogImage: '/assets/images/banners/banner_home.webp',
  },
  services: {
    title: 'Our Services - Logi-Ink',
    description:
      'Discover our comprehensive range of digital services including web development, design, branding, and digital strategy. We deliver solutions that exceed expectations.',
    keywords:
      'web development services, digital design, branding services, web design, digital strategy',
    ogType: 'website',
    ogImage: '/assets/images/banners/banner_home.webp',
  },
  projects: {
    title: 'Our Projects - Logi-Ink Portfolio',
    description:
      'Explore our portfolio of successful digital projects. See how we transform ideas into exceptional digital experiences that drive results.',
    keywords: 'portfolio, web projects, digital projects, case studies, web design examples',
    ogType: 'website',
    ogImage: '/assets/images/banners/banner_home.webp',
  },
  contact: {
    title: 'Contact Us - Logi-Ink',
    description:
      'Get in touch with Logi-Ink to discuss your digital project. We are here to help bring your vision to life with innovative solutions.',
    keywords: 'contact logi-ink, get in touch, digital agency contact, project inquiry',
    ogType: 'website',
    ogImage: '/assets/images/banners/banner_home.webp',
  },
};

// Base URL configuration
export const baseUrl = process.env.VITE_BASE_URL || 'https://logi-ink.co.za';
export const basePath = process.env.VITE_BASE_PATH || '/logi-ink/';

// Generate meta tags HTML
export function generateMetaTags(pageKey) {
  const config = seoConfig[pageKey];
  if (!config) return '';

  const fullUrl = `${baseUrl}${basePath === '/' ? '' : basePath.replace(/\/$/, '')}`;
  const imageUrl = `${fullUrl}${config.ogImage}`;

  return `
    <!-- Primary Meta Tags -->
    <meta name="title" content="${config.title}" />
    <meta name="description" content="${config.description}" />
    <meta name="keywords" content="${config.keywords}" />
    <meta name="author" content="Logi-Ink" />
    <meta name="robots" content="index, follow" />
    <meta name="language" content="English" />
    <meta name="revisit-after" content="7 days" />

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="${config.ogType}" />
    <meta property="og:url" content="${fullUrl}" />
    <meta property="og:title" content="${config.title}" />
    <meta property="og:description" content="${config.description}" />
    <meta property="og:image" content="${imageUrl}" />
    <meta property="og:site_name" content="Logi-Ink" />
    <meta property="og:locale" content="en_US" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${fullUrl}" />
    <meta name="twitter:title" content="${config.title}" />
    <meta name="twitter:description" content="${config.description}" />
    <meta name="twitter:image" content="${imageUrl}" />
    <meta name="twitter:site" content="@logiink" />
    <meta name="twitter:creator" content="@logiink" />
  `;
}
