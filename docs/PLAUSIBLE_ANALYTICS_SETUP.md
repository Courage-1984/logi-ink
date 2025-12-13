# Plausible Analytics: Custom Properties & Funnels Setup Guide

**Last Updated:** 2025-01-30  
**Status:** ✅ Implemented

This guide explains how to set up and use Custom Properties, Goals, and Funnels in Plausible Analytics for the Logi-Ink website.

**⚠️ Important Setup Order:**
1. **Custom Properties** (optional but recommended)
2. **Goals** (required before funnels)
   - Custom Event Goals
   - Pageview Goals
   - Scroll Depth Goals
3. **Funnels** (requires goals to be set up first)

---

## Table of Contents

1. [Overview](#overview)
2. [Custom Properties Implementation](#custom-properties-implementation)
3. [Setting Up Custom Properties in Plausible Dashboard](#setting-up-custom-properties-in-plausible-dashboard)
4. [Setting Up Goals in Plausible Dashboard](#setting-up-goals-in-plausible-dashboard) ⚠️ **Required before Funnels**
   - [Custom Event Goals](#step-2-create-custom-event-goals)
   - [Pageview Goals](#step-3-create-pageview-goals-recommended)
   - [Scroll Depth Goals](#step-4-create-scroll-depth-goals-recommended)
5. [Funnels Setup Guide](#funnels-setup-guide)
6. [Tracked Events Reference](#tracked-events-reference)
7. [Testing & Verification](#testing--verification)
8. [Troubleshooting](#troubleshooting)

---

## Overview

### What Are Custom Properties?

Custom Properties (also known as custom dimensions in Google Analytics) allow you to attach additional metadata to pageviews and custom events. This enables you to:

- Filter and segment your analytics data
- Track page types, user actions, and conversion sources
- Analyze user behavior across different sections of your site
- Create more detailed reports and insights

### What Are Funnels?

Funnels track the user journey through specific conversion paths. They help you:

- Identify where users drop off in the conversion process
- Measure conversion rates at each step
- Optimize your site to improve conversions
- Understand the complete user flow from landing to conversion

---

## Custom Properties Implementation

### Important: Property Limits & Validation

Our implementation includes automatic validation to ensure compliance with Plausible's requirements:

- **Maximum 30 properties per event** - Excess properties are automatically truncated
- **Property names limited to 300 characters** - Names exceeding this are truncated
- **Property values limited to 2000 characters** - Values exceeding this are truncated
- **PII Protection** - Automatically blocks potentially personally identifiable information (emails, phone numbers, etc.)
- **Type Conversion** - All values are automatically converted to strings (Plausible requirement)

**PII Detection:** The system automatically detects and blocks:
- Email addresses (patterns containing `@` and `.`)
- Phone numbers (various formats)
- Common PII keywords (email, phone, address, ssn, passport, credit, card)

### Page-Level Custom Properties

All pages automatically track the following custom properties with every pageview:

- **`pageType`**: Type of page (e.g., 'home', 'services', 'contact', 'about', 'projects', 'pricing', 'seo-services', 'legal')
- **`pageName`**: Human-readable page name (e.g., 'Home', 'Services', 'Contact')
- **`path`**: Current page pathname

**Implementation Location:** All HTML files (`index.html`, `about.html`, `contact.html`, etc.)

**Code Example:**
```javascript
plausible.init({
  customProperties: function(eventName) {
    // This function is called for every event (pageviews and custom events)
    // eventName parameter allows conditional property assignment if needed
    const path = window.location.pathname;
    return {
      pageType: 'contact',
      pageName: 'Contact',
      path: path
    };
  }
});
```

**Note:** The `customProperties` function receives `eventName` as a parameter. You can use it to conditionally return properties (e.g., only for pageviews), but in our implementation, we return page-level properties for all events to maintain consistent tracking.

### Event-Level Custom Properties

Custom events track additional properties specific to each action. These are sent using the manual JavaScript method:

```javascript
plausible('Event Name', {
  props: {
    property1: 'value1',
    property2: 'value2'
  }
});
```

**Implementation Details:**
- Properties are automatically validated for PII (Personally Identifiable Information)
- Property names are limited to 300 characters
- Property values are limited to 2000 characters
- Maximum 30 properties per event
- All values are converted to strings (Plausible requirement)

**Tracked Events:**

#### Contact Form Submission
- **Event:** `Contact Form Submit`
- **Properties:**
  - `subject`: Form subject field value
  - `source`: Where form was submitted from (e.g., 'contact-page')
  - `page`: Current page pathname

**Implementation:** `js/pages/contact.js`

#### Service Modal Open
- **Event:** `Service Modal Open`
- **Properties:**
  - `service`: Name of the service
  - `source`: Where modal was opened from (e.g., 'services-page')
  - `page`: Current page pathname

**Implementation:** `js/pages/services.js`

#### Project View
- **Event:** `Project View`
- **Properties:**
  - `project`: Name of the project
  - `source`: Where project was viewed from (e.g., 'projects-page')
  - `page`: Current page pathname

**Implementation:** `js/pages/projects.js`

#### CTA Click
- **Event:** `CTA Click`
- **Properties:**
  - `text`: Button text
  - `location`: Where CTA is located (e.g., 'hero', 'cta-section', 'section')
  - `destination`: Where CTA leads (href value)
  - `page`: Current page pathname

**Implementation:** `js/utils/analytics.js` (automatic tracking)

---

## Setting Up Custom Properties in Plausible Dashboard

### Step 1: Access Site Settings

1. Log in to your Plausible Analytics dashboard
2. Select your site (`logi-ink.co.za`)
3. Click on **Settings** in the left sidebar
4. Navigate to **Properties** tab

### Step 2: Add Custom Properties

For each custom property you want to track, click **"Add property"** and enter:

#### Required Properties (Already Implemented)

1. **`pageType`**
   - **Description:** Type of page being viewed
   - **Values:** home, services, contact, about, projects, pricing, seo-services, legal, other

2. **`pageName`**
   - **Description:** Human-readable page name
   - **Values:** Home, Services, Contact, About, Projects, Pricing, SEO Services, Terms of Service, Privacy Policy, Other

3. **`subject`** (for Contact Form Submit events)
   - **Description:** Subject of contact form submission
   - **Values:** Dynamic (user input)

4. **`service`** (for Service Modal Open events)
   - **Description:** Name of service viewed
   - **Values:** Dynamic (service names from your site)

5. **`project`** (for Project View events)
   - **Description:** Name of project viewed
   - **Values:** Dynamic (project names from your site)

6. **`location`** (for CTA Click events)
   - **Description:** Location of CTA button
   - **Values:** hero, cta-section, section, unknown

7. **`source`** (for various events)
   - **Description:** Source of the action
   - **Values:** contact-page, services-page, projects-page, etc.

### Step 3: Verify Properties Are Tracking

1. Navigate to your Plausible dashboard
2. Go to **Goal Conversions** section
3. Click on **Properties** tab
4. You should see your custom properties listed
5. Click on a property to see its values and associated metrics

**Note:** Properties will only appear after they've been tracked at least once. Visit your site and trigger some events to generate data.

---

## Setting Up Goals in Plausible Dashboard

**⚠️ IMPORTANT: You must set up Goals before creating Funnels. Funnels require goals to be configured first.**

### What Are Goals?

Goals allow you to track specific actions that visitors take on your site. In Plausible, goals can be:
- **Custom Event Goals** - Track button clicks, form submissions, modal opens, etc.
- **Pageview Goals** - Track visits to specific pages (e.g., `/contact`, `/thank-you`)

Goals must be configured in your Plausible dashboard before they appear in your analytics. Once set up, you can use these goals to create funnels.

### Step 1: Access Goals Settings

1. Log in to your Plausible Analytics dashboard
2. Select your site (`logi-ink.co.za`)
3. Click on **Settings** in the left sidebar
4. Navigate to **Goals** section

### Step 2: Create Custom Event Goals

For each custom event you're tracking, you need to create a goal. Click **"+ Add goal"** and follow these steps:

#### Required Custom Event Goals

Based on our implementation, you need to create goals for these events:

1. **`Contact Form Submit`**
   - **Goal Type:** Custom event
   - **Event Name:** `Contact Form Submit` (must match exactly, including spaces and capitalization)
   - **Description:** Tracks successful contact form submissions

2. **`Service Modal Open`**
   - **Goal Type:** Custom event
   - **Event Name:** `Service Modal Open` (must match exactly)
   - **Description:** Tracks when users open service detail modals

3. **`Project View`**
   - **Goal Type:** Custom event
   - **Event Name:** `Project View` (must match exactly)
   - **Description:** Tracks when users view project details

4. **`CTA Click`**
   - **Goal Type:** Custom event
   - **Event Name:** `CTA Click` (must match exactly)
   - **Description:** Tracks clicks on call-to-action buttons

5. **`Pricing Interaction`** (Optional)
   - **Goal Type:** Custom event
   - **Event Name:** `Pricing Interaction` (must match exactly)
   - **Description:** Tracks interactions on pricing page

6. **`External Link Click`** (Optional)
   - **Goal Type:** Custom event
   - **Event Name:** `External Link Click` (must match exactly)
   - **Description:** Tracks clicks on external links

### Step 3: Create Pageview Goals (Recommended)

Pageview goals track visits to specific pages. They're useful for measuring engagement and can be used in funnels. Here are recommended pageview goals for Logi-Ink:

#### Essential Pageview Goals

1. **Contact Page Visit**
   - **Goal Type:** Pageview
   - **Page Path:** `/contact`
   - **Use Case:** Track how many visitors reach the contact page (conversion indicator)

2. **Services Page Visit**
   - **Goal Type:** Pageview
   - **Page Path:** `/services`
   - **Use Case:** Measure interest in service offerings

3. **Pricing Page Visit**
   - **Goal Type:** Pageview
   - **Page Path:** `/pricing`
   - **Use Case:** Track visitors researching pricing (high-intent traffic)

4. **Projects/Portfolio Page Visit**
   - **Goal Type:** Pageview
   - **Page Path:** `/projects`
   - **Use Case:** Measure interest in viewing portfolio work

5. **SEO Services Page Visit**
   - **Goal Type:** Pageview
   - **Page Path:** `/seo-services`
   - **Use Case:** Track interest in SEO services specifically

#### Optional Pageview Goals

6. **About Page Visit**
   - **Goal Type:** Pageview
   - **Page Path:** `/about`
   - **Use Case:** Measure brand/company interest

7. **Homepage Visit** (if you want to track it separately)
   - **Goal Type:** Pageview
   - **Page Path:** `/` or `/index.html`
   - **Use Case:** Track landing page visits

#### Grouping Pages with Wildcards

You can use wildcards (`*`) to group similar pages:

- **All Service Pages:** `/services*` (if you have sub-pages like `/services/web-design`)
- **All Legal Pages:** `/privacy-policy` and `/terms-of-service` (create separate goals or group if needed)

**Note:** Pageview goals don't require any code changes - Plausible automatically tracks pageviews. Just create the goals in your dashboard.

### Step 4: Create Scroll Depth Goals (Recommended)

Scroll depth tracking is **built into Plausible by default** - no code changes needed! You can see scroll depth data in your dashboard automatically. However, you can also create **Scroll Depth Goals** to track specific thresholds.

Scroll depth goals help you understand:
- How engaged visitors are with your content
- Which pages have high engagement
- Where visitors might be losing interest

#### Recommended Scroll Depth Thresholds

Common thresholds to track:
- **25%** - Initial engagement (visitor is reading)
- **50%** - Good engagement (visitor is interested)
- **75%** - High engagement (visitor is very interested)
- **100%** - Complete engagement (visitor read entire page)

#### Essential Scroll Depth Goals

Create scroll depth goals for your most important pages:

1. **Homepage - 50% Scroll Depth**
   - **Goal Type:** Scroll Depth
   - **Threshold:** 50%
   - **Page Path:** `/` or `/index.html`
   - **Use Case:** Measure if visitors are engaging with hero and key sections

2. **Homepage - 100% Scroll Depth**
   - **Goal Type:** Scroll Depth
   - **Threshold:** 100%
   - **Page Path:** `/` or `/index.html`
   - **Use Case:** Track visitors who read the entire homepage

3. **Services Page - 75% Scroll Depth**
   - **Goal Type:** Scroll Depth
   - **Threshold:** 75%
   - **Page Path:** `/services`
   - **Use Case:** Measure engagement with service details

4. **Pricing Page - 50% Scroll Depth**
   - **Goal Type:** Scroll Depth
   - **Threshold:** 50%
   - **Page Path:** `/pricing`
   - **Use Case:** Track if visitors are reading pricing information

5. **Pricing Page - 100% Scroll Depth**
   - **Goal Type:** Scroll Depth
   - **Threshold:** 100%
   - **Page Path:** `/pricing`
   - **Use Case:** Measure complete pricing page engagement (high-intent indicator)

6. **Contact Page - 50% Scroll Depth**
   - **Goal Type:** Scroll Depth
   - **Threshold:** 50%
   - **Page Path:** `/contact`
   - **Use Case:** Track if visitors are reading contact information before submitting

7. **About Page - 75% Scroll Depth**
   - **Goal Type:** Scroll Depth
   - **Threshold:** 75%
   - **Page Path:** `/about`
   - **Use Case:** Measure brand story engagement

#### Optional Scroll Depth Goals

8. **Projects Page - 50% Scroll Depth**
   - **Goal Type:** Scroll Depth
   - **Threshold:** 50%
   - **Page Path:** `/projects`
   - **Use Case:** Track portfolio engagement

9. **SEO Services Page - 75% Scroll Depth**
   - **Goal Type:** Scroll Depth
   - **Threshold:** 75%
   - **Page Path:** `/seo-services`
   - **Use Case:** Measure SEO services page engagement

#### How to Create Scroll Depth Goals

1. Go to **Settings** → **Goals**
2. Click **"+ Add goal"**
3. Select **"Scroll Depth"** as the goal trigger
4. Choose scroll depth percentage (1% to 100%)
5. Enter the page pathname (e.g., `/contact`)
6. Click **"Add goal"**

**Note:** Scroll depth goals only show "Uniques" and "CR (conversion rate)" metrics, not "Total" like pageview goals. This is because scrolling is measured continuously during a pageview.

**Pro Tip:** Start with 50% and 100% thresholds for your most important pages. You can always add more granular thresholds (25%, 75%) later if needed.

### Step 5: Verify Goals Are Tracking

1. After creating goals, navigate back to your Plausible dashboard
2. Scroll to the **Goal Conversions** section (bottom of dashboard)
3. Goals will appear as soon as the first conversion has been tracked
4. If you've already been sending events, you might see a link to "Add all custom event goals" - click it to automatically add all goals you've been tracking

**For Scroll Depth:**
- Scroll depth data is automatically available in the Top Pages report
- Scroll depth goals will appear in Goal Conversions once visitors reach the threshold
- You can see scroll depth percentage in the top row of metrics when filtering by a page

### Important Notes

- **Event names must match exactly** - The event name in your goal must match the event name in your code exactly (including spaces, capitalization, and punctuation)
- **Goals appear after first conversion** - Goals won't show up until at least one conversion has been tracked
- **You can edit goals later** - Click the "Edit goal" button next to any goal to modify it
- **Goals are required for funnels** - You cannot create funnels without first setting up the goals that will be used as funnel steps

### Quick Reference: Event Names

Make sure these exact event names are used when creating goals:

| Event Name (Use in Goal) | Code Implementation |
|-------------------------|-------------------|
| `Contact Form Submit` | `trackContactFormSubmission()` |
| `Service Modal Open` | `trackServiceModalOpen()` |
| `Project View` | `trackProjectView()` |
| `CTA Click` | `trackCTAClick()` |
| `Pricing Interaction` | `trackPricingInteraction()` |
| `External Link Click` | `trackExternalLink()` |

### Quick Reference: Pageview Goals

Recommended pageview goals for Logi-Ink:

| Goal Name | Page Path | Priority |
|-----------|-----------|----------|
| Contact Page Visit | `/contact` | Essential |
| Services Page Visit | `/services` | Essential |
| Pricing Page Visit | `/pricing` | Essential |
| Projects Page Visit | `/projects` | Essential |
| SEO Services Page Visit | `/seo-services` | Essential |
| About Page Visit | `/about` | Optional |

### Quick Reference: Scroll Depth Goals

Recommended scroll depth goals (start with these):

| Goal Name | Page Path | Threshold | Priority |
|-----------|-----------|-----------|----------|
| Homepage 50% Scroll | `/` | 50% | Essential |
| Homepage 100% Scroll | `/` | 100% | Essential |
| Services 75% Scroll | `/services` | 75% | Essential |
| Pricing 50% Scroll | `/pricing` | 50% | Essential |
| Pricing 100% Scroll | `/pricing` | 100% | Essential |
| Contact 50% Scroll | `/contact` | 50% | Essential |
| About 75% Scroll | `/about` | 75% | Optional |
| Projects 50% Scroll | `/projects` | 50% | Optional |

---

## Funnels Setup Guide

**⚠️ PREREQUISITE: Complete the Goals setup above before creating funnels.**

### Understanding Funnels

Funnels track a sequence of steps that users take before converting. Each step must be:
- A **pageview goal** (visiting a specific page) - must be set up as a goal first
- A **custom event goal** (triggering a specific action) - must be set up as a goal first

### Recommended Funnels for Logi-Ink

#### Funnel 1: Contact Form Conversion

**Purpose:** Track users from landing to contact form submission

**Required Goals (set up first):**
- Pageview goal for `/contact` (optional, or use pageview directly)
- Custom event goal: `Contact Form Submit`

**Steps:**
1. **Step 1:** Pageview → `/` (Home page) - No goal needed, just use pageview
2. **Step 2:** Pageview → `/services` OR `/pricing` OR `/about` (Engagement) - No goal needed
3. **Step 3:** Pageview → `/contact` (Contact page visit) - Can use pageview directly or create pageview goal
4. **Step 4:** Custom Event → `Contact Form Submit` (Conversion) - **Requires goal setup**

**Use Case:** Measure how many visitors start on homepage, engage with content, visit contact page, and actually submit the form.

#### Funnel 2: Service Discovery to Contact

**Purpose:** Track users who discover services and then contact

**Required Goals (set up first):**
- Custom event goal: `Service Modal Open`
- Custom event goal: `Contact Form Submit`
- Pageview goal for `/contact` (optional)

**Steps:**
1. **Step 1:** Pageview → `/services` (Services page) - No goal needed
2. **Step 2:** Custom Event → `Service Modal Open` (Service interest) - **Requires goal setup**
3. **Step 3:** Pageview → `/contact` (Contact page visit) - Can use pageview directly
4. **Step 4:** Custom Event → `Contact Form Submit` (Conversion) - **Requires goal setup**

**Use Case:** Measure service discovery → interest → contact → conversion flow.

#### Funnel 3: Project Portfolio to Contact

**Purpose:** Track users viewing portfolio and converting

**Required Goals (set up first):**
- Custom event goal: `Project View`
- Custom event goal: `CTA Click`
- Custom event goal: `Contact Form Submit`

**Steps:**
1. **Step 1:** Pageview → `/projects` (Projects page) - No goal needed
2. **Step 2:** Custom Event → `Project View` (Project interest) - **Requires goal setup**
3. **Step 3:** Custom Event → `CTA Click` (Call-to-action engagement) - **Requires goal setup**
4. **Step 4:** Custom Event → `Contact Form Submit` (Conversion) - **Requires goal setup**

**Use Case:** Measure portfolio engagement → CTA click → form submission.

#### Funnel 4: Pricing Page to Contact

**Purpose:** Track pricing page visitors to conversions

**Required Goals (set up first):**
- Custom event goal: `CTA Click`
- Custom event goal: `Contact Form Submit`
- Pageview goal for `/contact` (optional)

**Steps:**
1. **Step 1:** Pageview → `/pricing` (Pricing page) - No goal needed
2. **Step 2:** Custom Event → `CTA Click` (Pricing CTA click) - **Requires goal setup**
3. **Step 3:** Pageview → `/contact` (Contact page visit) - Can use pageview directly
4. **Step 4:** Custom Event → `Contact Form Submit` (Conversion) - **Requires goal setup**

**Use Case:** Measure pricing page effectiveness in driving conversions.

### How to Create a Funnel

**⚠️ IMPORTANT: Make sure you've set up all required goals first (see Goals Setup section above).**

1. **Access Funnel Settings:**
   - Log in to Plausible Analytics
   - Select your site
   - Go to **Settings** → **Funnels**

2. **Create New Funnel:**
   - Click **"Add funnel"** button
   - Enter a descriptive name (e.g., "Contact Form Conversion")

3. **Define Funnel Steps:**
   - Click **"Add step"** for each step in your funnel
   - **For pageviews:** Select "Pageview" and enter the path (e.g., `/contact`)
     - You can use pageviews directly without creating a goal, OR use a pageview goal if you've created one
   - **For custom events:** Select "Custom Event" and choose from the dropdown of goals you've created
     - The dropdown will only show goals you've already set up
     - Event names must match exactly (e.g., `Contact Form Submit`)
   - Add steps in the order users should complete them
   - Minimum 2 steps, maximum 8 steps per funnel

4. **Save Funnel:**
   - Click **"Save"** button
   - Funnel will appear at the bottom of your dashboard once the first visit has been tracked on the funnel steps

### Funnel Best Practices

- **Start Simple:** Begin with 2-3 step funnels, then expand
- **Use Clear Names:** Name funnels descriptively (e.g., "Homepage to Contact")
- **Test Regularly:** Verify funnels are tracking correctly after setup
- **Monitor Drop-offs:** Focus on steps with high drop-off rates
- **Segment by Properties:** Use custom properties to filter funnel data (e.g., by `pageType` or `source`)

---

## Tracked Events Reference

### Automatic Events

These events are tracked automatically without additional code:

| Event Name | Trigger | Custom Properties |
|------------|---------|-------------------|
| Pageview | Every page load | `pageType`, `pageName`, `path` |
| CTA Click | Click on CTA buttons | `text`, `location`, `destination`, `page` |

### Manual Events

These events require specific user actions:

| Event Name | Trigger | Custom Properties | Implementation |
|------------|---------|-------------------|----------------|
| Contact Form Submit | Form submission success | `subject`, `source`, `page` | `js/pages/contact.js` |
| Service Modal Open | Service modal opened | `service`, `source`, `page` | `js/pages/services.js` |
| Project View | Project modal opened | `project`, `source`, `page` | `js/pages/projects.js` |

### Performance Events (Already Implemented)

These events are tracked by `js/utils/performance.js`:

| Event Name | Trigger | Custom Properties |
|------------|---------|-------------------|
| Web Vital - LCP | Largest Contentful Paint | `value`, `rating`, `navigationType`, `id`, `path` |
| Web Vital - CLS | Cumulative Layout Shift | `value`, `rating`, `navigationType`, `id`, `path` |
| Web Vital - INP | Interaction to Next Paint | `value`, `rating`, `navigationType`, `id`, `path` |
| Page Load Metrics | Page load complete | `path`, `dns`, `tcp`, `request`, `response`, `domProcessing`, `loadTime` |

---

## Testing & Verification

### Testing Custom Properties

1. **Open Browser DevTools Console**
2. **Manually trigger an event:**
   ```javascript
   // Test contact form submission tracking
   window.plausible('Contact Form Submit', {
     props: {
       subject: 'Test Subject',
       source: 'contact-page',
       page: '/contact'
     }
   });
   ```

3. **Check Plausible Dashboard:**
   - Go to **Goal Conversions** → **Properties** tab
   - Look for your custom property values
   - Verify events are appearing with correct properties

### Testing Funnels

1. **Complete the Funnel Steps:**
   - Manually navigate through your funnel steps
   - Trigger each event in sequence
   - Wait a few minutes for data to sync

2. **Verify in Dashboard:**
   - Go to your Plausible dashboard
   - Scroll to **Funnels** section (bottom of dashboard)
   - Check that your funnel appears and shows data
   - Verify conversion rates and drop-off percentages

### Development Mode

In development mode (`NODE_ENV !== 'production'`), analytics events are logged to the console instead of being sent to Plausible. This helps with debugging without polluting production data.

**Example Console Output:**
```
[Analytics] Would track: Contact Form Submit {props: {subject: "Test", source: "contact-page", page: "/contact"}}
```

---

## Troubleshooting

### Custom Properties Not Appearing

**Problem:** Custom properties don't show up in Plausible dashboard

**Solutions:**
1. **Verify Property Setup:**
   - Ensure properties are added in Plausible Settings → Properties
   - Check that property names match exactly (case-sensitive)

2. **Check Event Tracking:**
   - Verify events are being triggered (check browser console)
   - Ensure Plausible script is loaded correctly
   - Check for JavaScript errors in console

3. **Wait for Data:**
   - Properties only appear after at least one event with that property
   - Wait a few minutes for data to sync

4. **Verify Property Values:**
   - Ensure values are strings (not objects or arrays) - automatically handled by our implementation
   - Check that values don't exceed 2000 characters - automatically truncated
   - Verify no PII (personally identifiable information) is included - automatically blocked
   - Check browser console for validation warnings in development mode

### Funnels Not Tracking

**Problem:** Funnels show no data or incorrect data

**Solutions:**
1. **Verify Step Definitions:**
   - Check that pageview paths match exactly (including leading slash)
   - Verify custom event names match exactly (case-sensitive)
   - Ensure steps are in the correct order

2. **Check Event Names:**
   - Custom event names must match exactly (including spaces and capitalization)
   - Use the exact event names from the [Tracked Events Reference](#tracked-events-reference)

3. **Test Each Step:**
   - Manually trigger each step and verify it appears in Goals
   - Check that events are being tracked correctly

4. **Wait for Data:**
   - Funnels require at least one complete conversion to appear
   - Wait a few minutes for data to sync

### Events Not Firing

**Problem:** Custom events aren't being tracked

**Solutions:**
1. **Check Plausible Script:**
   - Verify Plausible script is loaded: `typeof window.plausible === 'function'`
   - Check for script loading errors in Network tab

2. **Verify Event Code:**
   - Check that `trackEvent()` or specific tracking functions are called
   - Verify no JavaScript errors in console
   - Ensure elements exist before tracking (check for null/undefined)

3. **Development Mode:**
   - In development, events log to console instead of sending
   - Check console for `[Analytics]` messages

4. **Ad Blockers:**
   - Some ad blockers may block Plausible
   - Test in incognito mode or disable ad blockers

---

## Additional Resources

- [Plausible Custom Properties Documentation](https://plausible.io/docs/custom-props/introduction)
- [Plausible Funnels Documentation](https://plausible.io/docs/funnel-analysis)
- [Plausible Custom Events Guide](https://plausible.io/docs/custom-event-goals)

---

## Implementation Files

- **Analytics Utility:** `js/utils/analytics.js`
- **Contact Form Tracking:** `js/pages/contact.js`
- **Service Modal Tracking:** `js/pages/services.js`
- **Project View Tracking:** `js/pages/projects.js`
- **CTA Tracking:** `js/utils/analytics.js` (automatic)
- **Page-Level Properties:** All HTML files (`index.html`, `about.html`, `contact.html`, etc.)

---

**Questions or Issues?** Check the [Troubleshooting](#troubleshooting) section or review the implementation files listed above.

