export const PLATFORM_FEATURES = [
  {
    title: 'DSA Contests',
    description:
      'Timed algorithmic challenges with auto-grading to sharpen your problem-solving skills.',
    icon: 'code',
  },
  {
    title: 'CP Contests',
    description:
      'Competitive programming contests with ratings to track your growth over time.',
    icon: 'trophy',
  },
  {
    title: 'System Design',
    description:
      'Architecture challenges that prepare you for senior engineering interviews.',
    icon: 'layers',
  },
  {
    title: 'Tech Quizzes',
    description:
      'MCQ-based assessments across frontend, backend, databases, and more.',
    icon: 'quiz',
  },
  {
    title: 'Jobs Board',
    description:
      'Curated job listings from top startups and product companies in India.',
    icon: 'briefcase',
  },
  {
    title: 'Referral Board',
    description:
      'Community-driven referrals to help you land interviews faster.',
    icon: 'users',
  },
  {
    title: 'Leaderboards',
    description:
      'Global, weekly, and contest-specific rankings to fuel healthy competition.',
    icon: 'chart',
  },
  {
    title: 'Premium Services',
    description:
      'Resume reviews, mock interviews, and career guidance from experts.',
    icon: 'star',
  },
] as const;

export const MEMBERSHIP_FEATURES = [
  'DSA & CP Contests',
  'System Design Challenges',
  'Tech Quizzes',
  'Jobs & Referral Board',
  'Leaderboards',
] as const;

export const PREMIUM_SERVICES = [
  'Resume Review',
  'Mock Interview',
  'Career Guidance Call',
  'LinkedIn Review',
] as const;

export const PREMIUM_SERVICE_PRICES = [
  { name: 'Resume Review', price: '₹499' },
  { name: 'Mock Interview', price: '₹999' },
  { name: 'Career Guidance Call', price: '₹799' },
  { name: 'LinkedIn Review', price: '₹399' },
] as const;

export const SERVICE_CATALOG = [
  {
    id: 'RESUME_REVIEW',
    title: 'Resume Review',
    description:
      'Expert review with detailed written feedback on structure, content, and ATS fit.',
    price: 49900,
    durationMinutes: null,
  },
  {
    id: 'MOCK_INTERVIEW',
    title: 'Mock Interview',
    description:
      'Live 1:1 technical, behavioral, or system design mock interview with a mentor.',
    price: 99900,
    durationMinutes: 60,
  },
  {
    id: 'CAREER_CALL',
    title: 'Career Guidance Call',
    description:
      '45-minute career strategy session with a personalized action plan.',
    price: 79900,
    durationMinutes: 45,
  },
  {
    id: 'LINKEDIN_REVIEW',
    title: 'LinkedIn Review',
    description:
      'Profile optimization review to improve recruiter visibility and positioning.',
    price: 39900,
    durationMinutes: null,
  },
] as const;
