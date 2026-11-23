import { LINKS } from './facts';
import type { LocalizedContent } from './types';

export const en: LocalizedContent = {
  profile: {
    name: 'Yaman Diab',
    role: 'Flutter Developer',
    location: 'Damascus, Syria',
    positioning:
      'Flutter developer. I build Arabic‑first, offline‑first mobile apps, and the architecture, tests and documentation that keep them maintainable.',
    facts: [
      'Two years building Flutter apps for clients',
      'Wafir is live on Google Play with 1K+ downloads',
      'Open to mid-level roles in Syria and abroad',
    ],
    aboutTitle: 'An app starts before the first line of code.',
    about: [
      'I am a Flutter developer based in Damascus. For two years I have built mobile apps for clients from start to finish: requirements, architecture, the app itself, its tests and the store release.',
      'Most of my work is Arabic-first. Right-to-left is where my layouts begin, and I test them in both directions.',
      'I care about what happens after version one. I write decisions down, keep the layers apart, and automate the checks that stop a codebase from drifting.',
    ],
    principles: [
      {
        title: 'Understand, then build',
        body: 'Half an hour on the problem often removes features nobody needs. For my latest client I wrote the requirements and the backend guide before the app.',
      },
      {
        title: 'Structure for the tenth update',
        body: 'Feature-first Clean Architecture, dependencies that point one way, and each big decision recorded with its reasons.',
      },
      {
        title: 'Prove it with tests',
        body: 'Unit, Cubit, widget and layout tests, in both text directions, run on every push.',
      },
    ],
    contactTitle: 'Have an app to build, or a team that needs a Flutter developer?',
    contactBody: 'Write to me in Arabic or English.',
    metaDescription:
      'Yaman Diab is a Flutter developer in Damascus who builds Arabic‑first, offline‑first mobile apps with tested, documented architecture.',
  },

  statusLabels: {
    live: 'Live on Google Play',
    'in-development': 'In development',
    'source-available': 'Code on GitHub',
    paused: 'Paused',
  },

  linkLabels: {
    store: 'View on Google Play',
    source: 'View the code on GitHub',
  },

  projects: {
    engleazia: {
      name: 'Engleazia',
      altName: 'إنجليزيا',
      tagline: 'English-learning app for Arabic speakers',
      teaser: 'Encrypted offline lessons and an answer queue that never counts twice',
      summary:
        'One learning engine for three audiences: kids, general English from Pre-A1 to B2, and a school curriculum. Arabic-first, built for a client against a .NET API owned by a separate backend team.',
      screens: [
        { title: 'Home map', alt: 'Engleazia home screen with the map of lessons' },
        { title: 'Lesson', alt: 'A lesson screen in Engleazia' },
        { title: 'Offline downloads', alt: 'Engleazia screen for lessons saved offline' },
      ],
      role: 'Sole mobile developer. Author of the product requirements and the backend guide.',
      platforms: 'Android and iOS',
      problem: [
        'Learners need their lessons where the connection is weak or missing. Video, audio and text have to work offline, and an answer given offline has to count exactly once when the phone reconnects.',
        'The client also needed paid lesson content protected from copying, and new tracks and levels added from a control panel without shipping a new app.',
      ],
      responsibilities: [
        'Wrote the requirements for the student app and the control panel, then a full guide for the backend team covering the data model, the API and the server rules.',
        'Designed the app architecture and built thirteen feature modules, from onboarding and a placement test to lessons, practice, conversation, notifications and offline downloads.',
        'Agreed the API contract with the backend team through OpenAPI, and recorded 22 architecture decisions as ADRs.',
      ],
      challenges: [
        {
          title: 'Lessons that work offline and stay protected',
          body: 'Downloaded lessons are sealed with AES-256-GCM. The key is generated on the phone and kept in the Keystore or Keychain. Video stays encrypted on disk and plays through a small server inside the app, bound to 127.0.0.1 behind a secret path. Native code blocks screen capture while a lesson video is on screen.',
          flow: {
            nodes: [
              { label: 'Download', detail: 'Limits set by the server' },
              { label: 'Vault', detail: 'AES-256-GCM on disk' },
              { label: 'Local server', detail: '127.0.0.1, secret path' },
              { label: 'Player', detail: 'Screen capture blocked' },
            ],
            caption: 'The path of a lesson video. It is never written to disk unencrypted.',
          },
        },
        {
          title: 'Answers that are never lost and never counted twice',
          body: 'Every attempt gets a stable ID on the phone. Answers wait in a queue while the phone is offline and sync when it reconnects. If a request is repeated, the server recognises the ID and counts the answer once.',
          demo: 'sync-queue',
        },
        {
          title: 'One session across many requests',
          body: 'When a token expires, several requests can fail at the same moment. A Dio interceptor runs a single refresh while the other requests wait, then retries them. Guests get a real server account that is upgraded in place to email or Google sign-in, so no progress is lost. If the server answers HTTP 426, the app stops and asks for an update.',
          flow: {
            nodes: [
              { label: 'Requests', detail: 'Token has expired' },
              { label: '401', detail: 'Several at once' },
              { label: 'One refresh', detail: 'The others wait' },
              { label: 'Retry', detail: 'With the new token' },
            ],
            caption: 'One refresh serves every request that was waiting on it.',
          },
        },
        {
          title: 'New content without a new release',
          body: 'Tracks, levels and download limits come from the server configuration. Adding a track in the control panel needs no change to the app code.',
        },
      ],
      architecture:
        'Feature-first Clean Architecture with Cubit. Architecture tests fail the build when a layer imports what it should not. Layout tests run each screen at 320dp and 375dp, in Arabic and English, in light and dark.',
      outcome: [
        'In active development for the client. Not released yet.',
        '3,100+ automated tests, all passing (November 2026).',
        'Formatting, static analysis and tests run in GitHub Actions on every push.',
      ],
    },

    wafir: {
      name: 'Wafir',
      altName: 'وافر',
      tagline: 'Delivery app for ordering from nearby stores',
      teaser: 'A cart that survives guests, sign-ins and restarts',
      summary:
        'A delivery app built for a client. People browse the stores in their area, fill a cart, check out and follow the order until it arrives.',
      screens: [
        { title: 'Stores near you', alt: 'Wafir screen listing the stores in the customer’s area' },
        { title: 'Cart', alt: 'Wafir cart screen' },
        { title: 'Order tracking', alt: 'Wafir screen following an order to delivery' },
      ],
      role: 'Sole Flutter developer of the customer app',
      platforms: 'Android, on Google Play',
      problem: [
        'Ordering had to be fast. People can browse and fill a cart without an account, and only give a phone number when they place the order.',
        'That makes the cart the hard part. It has to survive a restart, a sign-in halfway through and a weak connection, without the customer noticing any of it.',
      ],
      responsibilities: [
        'Built the customer app alone, from the project structure to the Google Play release.',
        'Integrated the REST API built by the client’s backend team.',
        'Delivered the app in Arabic and English.',
      ],
      challenges: [
        {
          title: 'Guest first, account later',
          body: 'A guest gets an identity the API recognises, so the cart works before sign-up. At checkout the phone number is verified with a one-time code through Firebase Authentication, and the cart carries over. The cart is saved on the phone and restored after a restart.',
          flow: {
            nodes: [
              { label: 'Browse', detail: 'No account needed' },
              { label: 'Cart', detail: 'Saved on the phone' },
              { label: 'Verify phone', detail: 'One-time code' },
              { label: 'Order', detail: 'Wallet or cash on delivery' },
              { label: 'Track', detail: 'Received to delivered' },
            ],
            caption: 'The order journey. An account is only needed at the third step.',
          },
        },
        {
          title: 'One place for every network failure',
          body: 'All requests pass through Dio interceptors. They attach the token or the guest identity, recover or end an expired session from one place, retry short network failures, and turn errors into clear messages.',
          flow: {
            nodes: [
              { label: 'Request' },
              { label: 'Interceptors', detail: 'Token or guest identity' },
              { label: 'API' },
              { label: 'Recovery', detail: 'Retry, or end the session' },
              { label: 'Result', detail: 'Data or a clear message' },
            ],
          },
        },
        {
          title: 'Location and order updates',
          body: 'Delivery addresses use OpenStreetMap with cached map tiles and the phone’s location. Order updates arrive as push notifications, with local notifications and in-app banners when the app is open.',
        },
      ],
      architecture:
        'Feature-based modules with BLoC and Cubit, a Dio networking layer, and secure storage for the session.',
      outcome: ['Live on Google Play since 2025.', '1K+ downloads on Google Play (November 2026).'],
    },

    maan: {
      name: 'Maan',
      altName: 'معاً',
      tagline: 'Civic services app for citizens and their municipality',
      teaser: 'Identity verification on a single screen, driven by its state',
      summary:
        'Maan puts a citizen’s dealings with the municipality in one place: complaints with a location and photos, voting on municipal projects, volunteering, donations and identity verification.',
      screens: [
        { title: 'Complaints', alt: 'Maan screen listing complaints and their status' },
        { title: 'Identity verification', alt: 'Maan identity verification screen' },
        { title: 'Project voting', alt: 'Maan screen for voting on municipal projects' },
      ],
      role: 'Sole Flutter developer',
      platforms: 'Android and iOS',
      problem: [
        'Most contact between a citizen and the municipality still happens by phone call, on paper or in person. A complaint is filed and nobody knows where it went. There is no clear place to give an opinion on a municipal project.',
        'Maan gives those exchanges one digital channel that both sides can follow.',
      ],
      responsibilities: [
        'Designed the architecture and built the whole Flutter app.',
        'Worked against a Laravel REST API built by the backend developers, and read its source when the documentation left a question open.',
        'Built the design system, with light and dark themes, adjustable text size, and Arabic and English.',
      ],
      challenges: [
        {
          title: 'One verification screen, driven by its state',
          body: 'To verify an identity, a citizen sends a national ID number and photos of a document, then waits for a reviewer. The same screen shows the form, the waiting state, a rejection with a way back, or the approval. A Cubit decides which one, so the screen can never show two at once.',
          demo: 'verification-states',
        },
        {
          title: 'An API that reports failure with HTTP 200',
          body: 'Some errors came back as successful responses with a failure flag inside. One parser reads every response envelope, and one mapper turns each failure into a typed result: network, sign-in, validation, one-time code, rate limit or server. Screens only ever see those types.',
          flow: {
            nodes: [
              { label: 'Response', detail: 'HTTP 200' },
              { label: 'Envelope check', detail: 'A failure flag inside?' },
              { label: 'Failure mapper', detail: 'One typed result' },
              { label: 'Screen', detail: 'A localised message' },
            ],
          },
        },
        {
          title: 'Photos that upload without making people wait',
          body: 'Avatars and documents go through pick, crop, compress and upload. The new photo appears at once and is rolled back if the upload fails. Votes on complaints work the same way.',
          flow: {
            nodes: [
              { label: 'Pick' },
              { label: 'Crop' },
              { label: 'Compress' },
              { label: 'Upload', detail: 'Shown at once, undone on failure' },
            ],
          },
        },
        {
          title: 'Access that follows the account',
          body: 'Sign-in uses JWT, with a refresh and a retry when the token expires. Route guards read the account status, so a visitor, a verified citizen and a closed account each reach only what they should.',
        },
      ],
      architecture:
        'Feature-first Clean Architecture with Cubit, GetIt and GoRouter. Unit, Cubit, repository and localisation tests cover the app.',
      outcome: ['The citizen app is built and tested.', 'The code is public on GitHub.'],
    },

    mishwar: {
      name: 'Mishwar',
      altName: 'مشوار',
      tagline: 'Booking platform for farms and rural retreats in Syria',
      teaser: 'My own product, from requirements and brand to a working booking flow',
      summary:
        'Mishwar is my own product: a booking platform for farms and rural retreats in Syria. I took it from an idea to requirements, a brand and a working customer app.',
      screens: [
        { title: 'Farm details', alt: 'Mishwar farm details screen' },
        { title: 'Booking', alt: 'Mishwar booking screen with the hold countdown' },
        { title: 'My bookings', alt: 'Mishwar screen listing the customer’s bookings' },
      ],
      role: 'Founder and sole developer',
      platforms: 'Flutter customer app. Owner app and admin panel planned.',
      problem: [
        'Farms are booked today through Facebook and Instagram posts and WhatsApp messages. Photos are often old or misleading, quality is hard to judge, and owners track bookings by hand, which leads to double bookings.',
        'Mishwar answers with verified listings, real photos and video, reviews, and a booking flow that keeps two people from reserving the same dates.',
      ],
      responsibilities: [
        'Wrote the requirements document: three apps and fourteen functional modules.',
        'Compared three brand directions, chose “The Verified Seal”, and drew its mark in code.',
        'Wrote a 90-day growth plan for a pilot in Damascus.',
        'Designed the monorepo and built the customer app.',
      ],
      challenges: [
        {
          title: 'Two people, one weekend',
          body: 'A booking request places a ten-minute hold on the dates, and the app shows the time left as a countdown. The request is designed to run as a single database transaction, so two holds cannot overlap. The app side is built. The database function exists in the design documents and is not deployed yet.',
          flow: {
            nodes: [
              { label: 'Pick dates' },
              { label: 'Request', detail: 'One atomic call' },
              { label: 'Hold', detail: 'Ten minutes, with a countdown' },
              { label: 'Booking' },
            ],
            caption: 'The booking flow as designed. The backend part is not deployed yet.',
          },
        },
        {
          title: 'One repository, three apps',
          body: 'The customer, owner and admin apps share a core package for the theme, error types and common widgets. The rule is strict: code moves into the shared package only when a second app needs it. Routing and dependency injection stay inside each app.',
        },
        {
          title: 'Errors people can read',
          body: 'Supabase errors are mapped in one place to localised messages, in Arabic and English.',
        },
      ],
      architecture:
        'A Flutter monorepo. Clean Architecture with Cubit inside each app, GetIt with injectable for dependency injection, and Supabase for sign-in, data and storage.',
      outcome: [
        'Paused for now.',
        'Built so far in the customer app: sign-in, onboarding, the booking flow, favourites, the bookings list and reviews.',
        'Still ahead: the production backend, the owner app and the admin panel.',
      ],
    },
  },

  career: {
    title: 'Experience',
    entry: {
      title: 'Freelance Flutter Developer',
      mode: 'Remote',
      duration: 'two years',
      summary:
        'I build mobile apps for clients as the only mobile developer on the project, working with their backend teams and taking the app through to release.',
      highlights: [
        'Requirements and delivery agreed directly with clients',
        'Architecture, state management, API integration and local storage',
        'Push notifications, sign-in, maps and store release',
        'Arabic and English in every app',
      ],
    },
    education: {
      school: 'Damascus University',
      degree: 'Information Technology Engineering, Software Engineering',
      note: 'Graduation expected in 2027',
    },
    milestones: [
      {
        year: '2026',
        title: 'Engleazia',
        body: 'Client project. Sole mobile developer and author of the requirements. In development.',
        projectSlug: 'engleazia',
      },
      {
        year: '2026',
        title: 'Mishwar',
        body: 'My own product: requirements, brand and customer app. Paused.',
        projectSlug: 'mishwar',
      },
      {
        year: '2026',
        title: 'Maan',
        body: 'Civic services app. Sole Flutter developer.',
        projectSlug: 'maan',
      },
      {
        year: '2025',
        title: 'Wafir',
        body: 'Client project. Published on Google Play.',
        projectSlug: 'wafir',
      },
      {
        year: '2025',
        title: 'Freak It competition',
        body: 'First place, with a cable car booking app built in five days.',
      },
      {
        year: '2024',
        title: 'Flutter Specialization',
        body: '160 hours of training with Sanad Youth for Development.',
      },
    ],
  },

  recognitions: [
    {
      title: 'First place, Freak It competition',
      body: 'Also named Best Team and Best Developer. Our team built a cable car booking and tourist guide app in five days, in Arabic and English.',
      year: '2025',
    },
    {
      title: 'Wafir, live on Google Play',
      body: '1K+ downloads. I was the sole Flutter developer of the customer app.',
      year: '2025',
      link: { label: 'View on Google Play', url: LINKS.wafirPlay },
    },
    {
      title: 'Flutter Specialization, 160 hours',
      body: 'Freelancers Hub project at Sanad Youth for Development. Clean Architecture, state management, REST APIs, performance and production apps.',
      year: '2024–2025',
    },
  ],

  expertise: {
    architecture: {
      title: 'Architecture',
      body: 'Feature-first Clean Architecture, dependencies that point one way, guarded routes, and decisions recorded as ADRs.',
    },
    networking: {
      title: 'Networking and sessions',
      body: 'Interceptors, a single shared token refresh, guest accounts that upgrade in place, forced-update gates, and error mapping for APIs that break convention.',
    },
    offline: {
      title: 'Offline and security',
      body: 'Encrypted content on disk, protected video playback, sync queues that are safe to retry, and secrets kept in secure storage.',
    },
    arabic: {
      title: 'Arabic-first interfaces',
      body: 'Right-to-left from the first layout, full Arabic and English, design systems built on semantic tokens, and motion that respects reduced-motion settings.',
    },
    platform: {
      title: 'Platform and services',
      body: 'Kotlin and Swift method channels, push notifications with deep links, Google and one-time-code sign-in, maps, audio, video and speech recognition.',
    },
    quality: {
      title: 'Testing and CI',
      body: 'Unit, Cubit, widget and layout tests, tests that enforce the architecture rules, and a pipeline that runs them on every push.',
    },
    product: {
      title: 'Product and documentation',
      body: 'Requirements documents, API contracts agreed with backend teams, backend developer guides and brand strategy.',
    },
  },

  writing: {
    title: 'Notes on building apps',
    intro: 'I write on LinkedIn, in Arabic, about what I learn while building.',
    topics: [
      {
        title: 'The flow behind “Add to cart”',
        body: 'Guest carts, a sign-in halfway through, changed prices and failed requests in a delivery app.',
      },
      {
        title: 'Push notifications are a whole flow',
        body: 'Foreground, background and closed states, token refresh and in-app banners.',
      },
      {
        title: 'Five signs a networking layer needs a rethink',
        body: 'Repeated token logic, scattered error handling and sessions that expire in ten places.',
      },
      {
        title: 'Automated testing in Flutter',
        body: 'Unit, widget and integration tests, and where each one earns its place.',
      },
    ],
    link: { label: 'Read on LinkedIn', url: LINKS.linkedinPosts },
  },
};
