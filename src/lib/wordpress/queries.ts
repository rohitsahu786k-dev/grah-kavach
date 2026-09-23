const mediaFields = `
  id
  url
  alt
  width
  height
  mime
`;

const titleTextFields = `
  title
  text
`;

const faqFields = `
  id
  title
  slug
  answer
  group
`;

const kitItemFields = `
  id
  title
  slug
  summary
  role
  quantity
  image { ${mediaFields} }
  specs {
    label
    value
  }
`;

const certificationFields = `
  id
  title
  slug
  issuer
  number
  summary
  image { ${mediaFields} }
  document { ${mediaFields} }
`;

export const GLOBAL_SETTINGS_QUERY = `
  query GlobalSiteSettings {
    grahaKavachSettings {
      logoPrimary { ${mediaFields} }
      phonePrimary
      phoneAlternate
      emailPrimary
      emailSupport
      whatsappNumber
      whatsappMessage
      address
      mapsUrl
      facebook
      instagram
      linkedin
      youtube
      x
      announcementEnabled
      announcementText
      announcementLink
      ctaLabel
      ctaUrl
      description
      navGroups {
        group
        label
        url
      }
      legalLinks {
        label
        url
      }
      copyright
    }
  }
`;

const yoastSeoFields = `
  seo {
    title
    metaDesc
    canonical
    metaRobotsNoindex
    metaRobotsNofollow
    opengraphTitle
    opengraphDescription
    opengraphImage {
      sourceUrl
    }
  }
`;

export const PAGE_BY_SLUG_QUERY = `
  query PageBySlug($slug: ID!) {
    page(id: $slug, idType: URI) {
      id
      databaseId
      title
      slug
      uri
      frontendUri
      excerpt
      content
      ${yoastSeoFields}
    }
  }
`;

export const POSTS_QUERY = `
  query Posts($first: Int!) {
    posts(first: $first, where: { status: PUBLISH }) {
      nodes {
        id
        databaseId
        title
        slug
        uri
        frontendUri
        excerpt
        content
        date
        categories {
          nodes {
            name
            slug
          }
        }
        featuredImage {
          node {
            sourceUrl
            altText
            mediaDetails {
              width
              height
            }
          }
        }
        ${yoastSeoFields}
      }
    }
  }
`;

export const POST_BY_SLUG_QUERY = `
  query PostBySlug($slug: ID!) {
    post(id: $slug, idType: SLUG) {
      id
      databaseId
      title
      slug
      uri
      frontendUri
      excerpt
      content
      date
      categories {
        nodes {
          name
          slug
        }
      }
      featuredImage {
        node {
          sourceUrl
          altText
          mediaDetails {
            width
            height
          }
        }
      }
      ${yoastSeoFields}
    }
  }
`;

export const FAQS_QUERY = `
  query Faqs($limit: Int!) {
    grahaKavachFaqs(limit: $limit) {
      ${faqFields}
    }
  }
`;

export const SAFETY_GUIDES_QUERY = `
  query SafetyGuides($limit: Int!) {
    grahaKavachSafetyGuides(limit: $limit) {
      id
      title
      slug
      summary
      body
      order
      image { ${mediaFields} }
    }
  }
`;

export const HOMEPAGE_QUERY = `
  query Homepage {
    grahaKavachHomepage {
      heroBannersDesktop { ${mediaFields} }
      heroBannersMobile { ${mediaFields} }
      heroBannerLinks { label url }
      heroBannerAutoplay
      featureCarouselTitle
      featureCarouselIntro
      featureCarouselImages { ${mediaFields} }
      featureCarouselAutoplay
      heroEyebrow
      heroTitle
      heroDescription
      heroCtaPrimaryLabel
      heroCtaPrimaryUrl
      heroCtaSecondaryLabel
      heroCtaSecondaryUrl
      heroVisualDesktop { ${mediaFields} }
      trustItems { ${titleTextFields} }
      faqTitle
      faqs { ${faqFields} }
    }
  }
`;

export const PRODUCT_CONTENT_QUERY = `
  query ProductContent($slug: String) {
    grahaKavachProductContent(slug: $slug) {
      tagline
      headline
      heroSupportingText
      heroMedia { ${mediaFields} }
      galleryAdditions { ${mediaFields} }
      videoUrl
      kitContents { ${kitItemFields} }
      keyBenefits { ${titleTextFields} }
      riskLocations { ${titleTextFields} }
      roleCards {
        title
        role
        text
      }
      specifications {
        group
        label
        value
      }
      installation
      usage
      warnings {
        level
        title
        text
      }
      faqs { ${faqFields} }
      certifications { ${certificationFields} }
      brochure { ${mediaFields} }
      manufacturerNotes
      supportCtaLabel
      supportCtaUrl
    }
  }
`;

export const ABOUT_QUERY = `
  query AboutPage {
    grahaKavachAbout {
      intro
      story
      mission
      vision
      manufacturer
      timeline {
        year
        title
        text
      }
      experience
      quality
      certifications {
        ${certificationFields}
      }
      facilityImages {
        ${mediaFields}
      }
      ctaTitle
      ctaText
      ctaLabel
      ctaUrl
    }
  }
`;

export const CATEGORIES_QUERY = `
  query Categories {
    categories(first: 20, where: { hideEmpty: true }) {
      nodes {
        id
        databaseId
        name
        slug
        count
      }
    }
  }
`;


/**
 * Customer testimonials, managed as a CPT in WordPress.
 *
 * Separate from WooCommerce product reviews on purpose: a review is tied to a
 * verified purchase of one product, a testimonial is editorial. The storefront
 * prefers reviews and falls back to these, and shows neither when both are
 * empty rather than inventing social proof.
 */
export const TESTIMONIALS_QUERY = `
  query Testimonials($limit: Int) {
    grahaKavachTestimonials(limit: $limit) {
      id
      title
      quote
      author
      location
      rating
      image { ${mediaFields} }
    }
  }
`;

/**
 * Published pages, used to build the policy routes.
 *
 * The storefront does not hard-code which legal pages exist. Whatever is
 * published in WordPress is what gets a URL and a footer link, so adding a
 * "Cancellation Policy" page in wp-admin is all it takes for one to appear.
 */
export const PAGES_INDEX_QUERY = `
  query PagesIndex($first: Int) {
    pages(first: $first, where: { status: PUBLISH }) {
      nodes {
        databaseId
        slug
        title
        menuOrder
      }
    }
  }
`;
