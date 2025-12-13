/**
 * Generate sitemap.xml for the website with image and video support
 * Run with: node scripts/generate-sitemap.js
 */

import { writeFileSync } from 'fs';
import { resolve } from 'path';

const baseUrl = process.env.VITE_BASE_URL || 'https://logi-ink.co.za';
const basePath = process.env.VITE_BASE_PATH || '/';

// Normalize basePath - remove trailing slash and ensure leading slash
const normalizedBasePath = basePath === '/' ? '' : basePath.replace(/\/$/, '');

// Helper function to build full URL
function buildUrl(pageUrl) {
  let url = baseUrl + normalizedBasePath;
  if (pageUrl) {
    url += '/' + pageUrl;
  } else {
    url += '/';
  }
  return url;
}

// Pages configuration with images and videos
const pages = [
  {
    url: '',
    changefreq: 'weekly',
    priority: 1.0,
    lastmod: new Date().toISOString().split('T')[0],
    images: [
      {
        loc: `${baseUrl}/assets/images/og-image.png`,
        title: 'Logi-Ink - Digital Innovation & Creative Solutions',
        caption: 'Professional web design and development services in Pretoria, South Africa',
      },
      {
        loc: `${baseUrl}/assets/images/responsive/banners/banner_home-1280w.webp`,
        title: 'Web Development Transforming Digital Experiences',
        caption: 'Modern web development and digital solutions',
      },
    ],
  },
  {
    url: 'about',
    changefreq: 'monthly',
    priority: 0.8,
    lastmod: new Date().toISOString().split('T')[0],
    images: [
      {
        loc: `${baseUrl}/assets/images/og-image.png`,
        title: 'About Logi-Ink',
        caption: 'Learn about our team and mission',
      },
    ],
  },
  {
    url: 'services',
    changefreq: 'monthly',
    priority: 0.9,
    lastmod: new Date().toISOString().split('T')[0],
    images: [
      {
        loc: `${baseUrl}/assets/images/og-image.png`,
        title: 'Services - Logi-Ink',
        caption: 'Comprehensive digital services including web design, development, SEO & branding',
      },
    ],
  },
  {
    url: 'projects',
    changefreq: 'weekly',
    priority: 0.9,
    lastmod: new Date().toISOString().split('T')[0],
    images: [
      {
        loc: `${baseUrl}/assets/images/og-image.png`,
        title: 'Projects - Logi-Ink',
        caption: 'Our portfolio of digital projects and case studies',
      },
      {
        loc: `${baseUrl}/assets/images/portfolio/image-corporate-website.png`,
        title: 'Corporate Website Project',
        caption: 'Professional corporate website design',
      },
      {
        loc: `${baseUrl}/assets/images/portfolio/image-e-commerce-platform.png`,
        title: 'E-Commerce Platform Project',
        caption: 'E-commerce platform development',
      },
      {
        loc: `${baseUrl}/assets/images/portfolio/image-fintech-mobile-app.png`,
        title: 'Fintech Mobile App Project',
        caption: 'Fintech mobile application design',
      },
      {
        loc: `${baseUrl}/assets/images/portfolio/image-fitness-tracking-app.png`,
        title: 'Fitness Tracking App Project',
        caption: 'Fitness tracking application',
      },
      {
        loc: `${baseUrl}/assets/images/portfolio/image-marketing-campaign.png`,
        title: 'Marketing Campaign Project',
        caption: 'Digital marketing campaign design',
      },
      {
        loc: `${baseUrl}/assets/images/portfolio/image-tech-startup-rebrand.png`,
        title: 'Tech Startup Rebrand Project',
        caption: 'Tech startup rebranding and design',
      },
    ],
    videos: [
      {
        thumbnail_loc: `${baseUrl}/assets/video/optimized/video-corporate-website-poster.jpg`,
        title: 'Corporate Website Video',
        description: 'Video showcase of corporate website project',
        content_loc: `${baseUrl}/assets/video/optimized/video-corporate-website-hq.mp4`,
        duration: 30,
      },
      {
        thumbnail_loc: `${baseUrl}/assets/video/optimized/video-e-commerce-platform-poster.jpg`,
        title: 'E-Commerce Platform Video',
        description: 'Video showcase of e-commerce platform project',
        content_loc: `${baseUrl}/assets/video/optimized/video-e-commerce-platform-hq.mp4`,
        duration: 30,
      },
      {
        thumbnail_loc: `${baseUrl}/assets/video/optimized/video-fintech-mobile-app-poster.jpg`,
        title: 'Fintech Mobile App Video',
        description: 'Video showcase of fintech mobile app project',
        content_loc: `${baseUrl}/assets/video/optimized/video-fintech-mobile-app-hq.mp4`,
        duration: 30,
      },
      {
        thumbnail_loc: `${baseUrl}/assets/video/optimized/video-fitness-tracking-app-poster.jpg`,
        title: 'Fitness Tracking App Video',
        description: 'Video showcase of fitness tracking app project',
        content_loc: `${baseUrl}/assets/video/optimized/video-fitness-tracking-app-hq.mp4`,
        duration: 30,
      },
      {
        thumbnail_loc: `${baseUrl}/assets/video/optimized/video-marketing-campaign-poster.jpg`,
        title: 'Marketing Campaign Video',
        description: 'Video showcase of marketing campaign project',
        content_loc: `${baseUrl}/assets/video/optimized/video-marketing-campaign-hq.mp4`,
        duration: 30,
      },
      {
        thumbnail_loc: `${baseUrl}/assets/video/optimized/video-tech-startup-rebrand-poster.jpg`,
        title: 'Tech Startup Rebrand Video',
        description: 'Video showcase of tech startup rebrand project',
        content_loc: `${baseUrl}/assets/video/optimized/video-tech-startup-rebrand-hq.mp4`,
        duration: 30,
      },
    ],
  },
  {
    url: 'contact',
    changefreq: 'monthly',
    priority: 0.7,
    lastmod: new Date().toISOString().split('T')[0],
    images: [
      {
        loc: `${baseUrl}/assets/images/og-image.png`,
        title: 'Contact - Logi-Ink',
        caption: 'Get in touch with Logi-Ink for your digital needs',
      },
    ],
  },
  {
    url: 'pricing',
    changefreq: 'monthly',
    priority: 0.8,
    lastmod: new Date().toISOString().split('T')[0],
    images: [
      {
        loc: `${baseUrl}/assets/images/og-image.png`,
        title: 'Pricing - Logi-Ink',
        caption: 'Affordable web design and development packages',
      },
    ],
  },
  {
    url: 'seo-services',
    changefreq: 'monthly',
    priority: 0.9,
    lastmod: new Date().toISOString().split('T')[0],
    images: [
      {
        loc: `${baseUrl}/assets/images/og-image.png`,
        title: 'SEO Services - Logi-Ink',
        caption: 'Professional SEO services for South African businesses',
      },
    ],
  },
  // Reports page excluded - secret/internal page (noindex, nofollow)
  {
    url: 'privacy-policy',
    changefreq: 'yearly',
    priority: 0.3,
    lastmod: new Date().toISOString().split('T')[0],
  },
  {
    url: 'terms-of-service',
    changefreq: 'yearly',
    priority: 0.3,
    lastmod: new Date().toISOString().split('T')[0],
  },
];

// Helper function to escape XML special characters
function escapeXml(unsafe) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Generate sitemap XML with image and video support
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd
        http://www.google.com/schemas/sitemap-image/1.1
        http://www.google.com/schemas/sitemap-image/1.1/sitemap-image.xsd
        http://www.google.com/schemas/sitemap-video/1.1
        http://www.google.com/schemas/sitemap-video/1.1/sitemap-video.xsd">
${pages
  .map(page => {
    const url = buildUrl(page.url);
    let urlBlock = `  <url>
    <loc>${url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>`;

    // Add images if present
    if (page.images && page.images.length > 0) {
      urlBlock += '\n' + page.images
        .map(image => {
          let imageBlock = `    <image:image>
      <image:loc>${image.loc}</image:loc>`;
          if (image.title) {
            imageBlock += `\n      <image:title>${escapeXml(image.title)}</image:title>`;
          }
          if (image.caption) {
            imageBlock += `\n      <image:caption>${escapeXml(image.caption)}</image:caption>`;
          }
          imageBlock += '\n    </image:image>';
          return imageBlock;
        })
        .join('\n');
    }

    // Add videos if present
    if (page.videos && page.videos.length > 0) {
      urlBlock += '\n' + page.videos
        .map(video => {
          let videoBlock = `    <video:video>
      <video:thumbnail_loc>${video.thumbnail_loc}</video:thumbnail_loc>
      <video:title>${escapeXml(video.title)}</video:title>
      <video:description>${escapeXml(video.description)}</video:description>
      <video:content_loc>${video.content_loc}</video:content_loc>`;
          if (video.duration) {
            videoBlock += `\n      <video:duration>${video.duration}</video:duration>`;
          }
          videoBlock += '\n    </video:video>';
          return videoBlock;
        })
        .join('\n');
    }

    urlBlock += '\n  </url>';
    return urlBlock;
  })
  .join('\n')}
</urlset>`;

// Write sitemap.xml to root
const outputPath = resolve(process.cwd(), 'sitemap.xml');
writeFileSync(outputPath, sitemap, 'utf8');

console.log(`✅ Sitemap generated: ${outputPath}`);
console.log(`   Base URL: ${baseUrl}${normalizedBasePath}`);
