import type { ProjectLink, ProjectSlug, ProjectStatus } from '@/domain/entities/project';

/**
 * Facts that are the same in every language: links, years, statuses and
 * technology names. The translated text lives in en.ts and ar.ts.
 *
 * To change a link or a contact detail, change it here and nowhere else.
 */
export const LINKS = {
  email: 'yamandiab7@gmail.com',
  phone: '+963938920500',
  phoneDisplay: '+963 938 920 500',
  github: 'https://github.com/Yaman-Diab',
  linkedin: 'https://www.linkedin.com/in/yaman-diab/',
  linkedinPosts: 'https://www.linkedin.com/in/yaman-diab/recent-activity/all/',
  siteRepository: 'https://github.com/Yaman-Diab/yaman-portfolio',
  wafirPlay: 'https://play.google.com/store/apps/details?id=com.wafir',
  maanRepository: 'https://github.com/Yaman-Diab/Maan',
  mishwarRepository: 'https://github.com/Yaman-Diab/Mishwar',
} as const;

export const NAMES = {
  latin: 'Yaman Diab',
  arabic: 'يمان دياب',
} as const;

export interface ProjectFacts {
  slug: ProjectSlug;
  year: string;
  status: ProjectStatus;
  stack: string[];
  links: Pick<ProjectLink, 'kind' | 'url'>[];
}

/** The order here is the order on the site. */
export const PROJECT_FACTS: ProjectFacts[] = [
  {
    slug: 'engleazia',
    year: '2026',
    status: 'in-development',
    stack: [
      'Flutter',
      'Dart',
      'flutter_bloc (Cubit)',
      'Dio',
      'GetIt',
      'GoRouter',
      'easy_localization',
      'Firebase Cloud Messaging',
      'Google Sign-In',
      'video_player',
      'just_audio',
      'speech_to_text',
      'cryptography',
      'flutter_secure_storage',
      'flutter_animate',
      'Kotlin and Swift method channels',
      'bloc_test',
      'mocktail',
      'GitHub Actions',
    ],
    // The client's repository is not linked on purpose.
    links: [],
  },
  {
    slug: 'wafir',
    year: '2025',
    status: 'live',
    stack: [
      'Flutter',
      'Dart',
      'BLoC and Cubit',
      'Dio',
      'Firebase Authentication (OTP)',
      'Firebase Cloud Messaging',
      'Flutter Map (OpenStreetMap)',
      'Geolocator',
      'flutter_secure_storage',
      'SharedPreferences',
    ],
    links: [{ kind: 'store', url: LINKS.wafirPlay }],
  },
  {
    slug: 'maan',
    year: '2026',
    status: 'source-available',
    stack: [
      'Flutter',
      'Dart',
      'flutter_bloc (Cubit)',
      'Dio',
      'GetIt',
      'GoRouter',
      'easy_localization',
      'image_picker',
      'image_cropper',
      'flutter_image_compress',
      'Geolocator',
      'Skeletonizer',
      'bloc_test',
      'mocktail',
    ],
    links: [{ kind: 'source', url: LINKS.maanRepository }],
  },
  {
    slug: 'mishwar',
    year: '2026',
    status: 'paused',
    stack: [
      'Flutter',
      'Dart',
      'flutter_bloc (Cubit)',
      'Supabase (Auth, Postgres, Storage)',
      'GetIt and injectable',
      'GoRouter',
      'dartz',
      'easy_localization',
      'flutter_screenutil',
    ],
    links: [{ kind: 'source', url: LINKS.mishwarRepository }],
  },
];

export const EXPERTISE_IDS = [
  'architecture',
  'networking',
  'offline',
  'arabic',
  'platform',
  'quality',
  'product',
] as const;

export type ExpertiseId = (typeof EXPERTISE_IDS)[number];

export const EXPERTISE_TOOLS: Record<ExpertiseId, string[]> = {
  architecture: ['Clean Architecture', 'flutter_bloc', 'Cubit', 'GetIt', 'injectable', 'GoRouter', 'ADRs'],
  networking: ['Dio', 'REST', 'JWT', 'OpenAPI', 'Interceptors'],
  offline: ['AES-256-GCM', 'cryptography', 'flutter_secure_storage', 'Sync queues', 'SharedPreferences'],
  arabic: ['easy_localization', 'RTL layouts', 'flutter_screenutil', 'ThemeExtension', 'flutter_animate'],
  platform: [
    'Kotlin and Swift channels',
    'Firebase Auth',
    'FCM',
    'Google Sign-In',
    'Supabase',
    'Maps and Geolocator',
    'video_player',
    'just_audio',
    'speech_to_text',
  ],
  quality: ['flutter_test', 'bloc_test', 'mocktail', 'Architecture tests', 'GitHub Actions'],
  product: ['Requirements (SRS)', 'API contracts', 'Backend guides', 'Brand strategy'],
};
