export type ApiSuccessResponse<T> = {
  success: true;
  data: T;
  meta?: PaginationMeta;
};

export type ApiErrorResponse = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown[];
  };
};

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
};

export type PaginationParams = {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
};

export type Role = 'USER' | 'MENTOR' | 'ADMIN';

export type UserProfile = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: Role;
  emailVerified: boolean;
  bio: string | null;
  skills: string[];
  githubUrl: string | null;
  linkedinUrl: string | null;
  twitterUrl: string | null;
  websiteUrl: string | null;
  subscription: {
    status: string;
    currentPeriodEnd: string;
  } | null;
  createdAt: string;
};

export type UserStats = {
  contestsJoined: number;
  contestsWon: number;
  quizzesCompleted: number;
  currentStreak: number;
  dsaRating: number;
  cpRating: number;
  dsaTitle: string;
  cpTitle: string;
  globalRank: number | null;
  subscriptionStatus: string | null;
};

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: Role;
  emailVerified: boolean;
  subscription: {
    status: string;
    currentPeriodEnd: string;
  } | null;
  createdAt: string;
};

export type AuthResponse = {
  user: AuthUser;
  accessToken: string;
  expiresIn: number;
};

export type Subscription = {
  id: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelledAt: string | null;
  createdAt: string;
};

export type CheckoutResponse = {
  subscriptionId: string;
  razorpaySubscriptionId: string;
  razorpayKeyId: string;
  amount: number;
  currency: string;
};

export type Payment = {
  id: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  paidAt: string | null;
  createdAt: string;
};

export type ContestListItem = {
  id: string;
  title: string;
  slug: string;
  type: string;
  status: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  participantCount: number;
  isRegistered?: boolean;
};

export type ContestDetail = ContestListItem & {
  description: string;
  maxParticipants: number | null;
  createdBy?: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
  registration: { status: string; joinedAt: string; isVirtual: boolean } | null;
};

export type ContestParticipant = {
  rank: number;
  userId: string;
  userName: string;
  avatarUrl: string | null;
  score: number;
  status: string;
  joinedAt: string;
};

export type QuizOption = {
  id: string;
  text: string;
  orderIndex: number;
};

export type QuizQuestion = {
  id: string;
  text: string;
  points: number;
  orderIndex: number;
  options: QuizOption[];
};

export type QuizSession = {
  contestId: string;
  title: string;
  slug: string;
  status: string;
  durationMinutes: number;
  endTime: string;
  participantStatus: string;
  questions: QuizQuestion[];
};

export type QuizResultOption = {
  id: string;
  text: string;
  isCorrect: boolean;
};

export type QuizResultQuestion = {
  id: string;
  text: string;
  points: number;
  selectedOptionId: string | null;
  correctOptionId: string | null;
  isCorrect: boolean;
  options: QuizResultOption[];
};

export type QuizResult = {
  contestId: string;
  title: string;
  slug: string;
  score: number;
  totalPoints: number;
  rank: number | null;
  submittedAt: string | null;
  questions: QuizResultQuestion[];
};

export type LeaderboardEntry = {
  rank: number;
  userId: string;
  userName: string;
  avatarUrl: string | null;
  score: number;
};

export type LeaderboardRanking = {
  period: string;
  rank: number | null;
  score: number;
  totalParticipants: number;
};

export type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
};

export type AdminDashboardMetrics = {
  totalUsers: number;
  activeSubscribers: number;
  monthlyRevenue: number;
  newUsersThisMonth: number;
  churnRate: number;
};

export type AdminUserListItem = {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  subscriptionStatus: string | null;
  createdAt: string;
  lastLoginAt: string | null;
};

export type AdminUserDetail = AdminUserListItem & {
  emailVerified: boolean;
  avatarUrl: string | null;
  profile: unknown;
  subscription: {
    id: string;
    status: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    cancelledAt: string | null;
  } | null;
  payments: Payment[];
};

export type AdminSubscriptionListItem = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelledAt: string | null;
  createdAt: string;
};

export type AdminPaymentListItem = Payment & {
  userId: string;
  userName: string;
  userEmail: string;
};

export type ActivityLogItem = {
  id: string;
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  action: string;
  entityType: string | null;
  entityId: string | null;
  metadata: unknown;
  ipAddress: string | null;
  createdAt: string;
};

export type JobListItem = {
  id: string;
  title: string;
  company: string;
  description: string;
  location: string | null;
  jobType: string;
  salaryMin: number | null;
  salaryMax: number | null;
  applyUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ReferralListItem = {
  id: string;
  company: string;
  roleTitle: string;
  description: string;
  requirements: string | null;
  status: string;
  contactEmail: string | null;
  referrer: { id: string; name: string; avatarUrl: string | null };
  isOwner: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SystemDesignChallenge = {
  contestId: string;
  title: string;
  slug: string;
  description: string;
  status: string;
  endTime: string;
  hasSubmitted: boolean;
  submission: {
    solution: string;
    diagramUrl: string | null;
    submittedAt: string;
  } | null;
};

export type HealthCheck = {
  status: 'ok';
  timestamp: string;
  version: string;
};

export type ProblemListItem = {
  id: string;
  title: string;
  slug: string;
  difficulty: string;
  points: number;
  orderIndex: number;
};

export type ProblemDetail = {
  id: string;
  contestId: string;
  contestSlug: string;
  contestStatus: string;
  contestEnded: boolean;
  title: string;
  slug: string;
  description: string;
  inputFormat: string;
  outputFormat: string;
  difficulty: string;
  points: number;
  timeLimitMs: number;
  memoryMb: number;
  starterCode: Record<string, string>;
  sampleTestCases: Array<{
    id: string;
    input: string;
    output: string;
    isSample: boolean;
  }>;
  hiddenTestCaseCount: number;
  allTestCases?: Array<{
    id: string;
    label: string;
    input: string;
    output: string;
    isSample: boolean;
  }>;
  isRegistered: boolean;
  isVirtual: boolean;
  isSolved: boolean;
  scoreAwarded: number;
};

export type VerdictDetails = {
  failedTestIndex?: number;
  isHidden?: boolean;
  input?: string;
  expectedOutput?: string;
  actualOutput?: string;
  message?: string;
  passedCount?: number;
  totalCount?: number;
};

export type ContestHistoryEntry = {
  id: string;
  contestId: string;
  contestTitle: string;
  contestSlug: string;
  contestType: string;
  contestStatus: string;
  startTime: string;
  participantStatus: string;
  score: number;
  rank: number | null;
  joinedAt: string;
};

export type CodeSubmission = {
  id: string;
  language: string;
  sourceCode: string;
  verdict: string;
  score: number;
  runtimeMs: number | null;
  verdictDetails: VerdictDetails | null;
  submittedAt: string;
};

export type RunCodeResult =
  | {
      mode: 'custom';
      verdict: string;
      output: string;
      expectedOutput: string;
      runtimeMs: number;
      isSampleInput: boolean;
    }
  | {
      mode: 'samples';
      verdict: string;
      results: Array<{
        index: number;
        input: string;
        verdict: string;
        output: string;
        expectedOutput: string;
        runtimeMs: number;
      }>;
    };

export type RatingHistoryEntry = {
  id: string;
  type: string;
  rating: number;
  delta: number;
  reason: string | null;
  createdAt: string;
};

export type ServiceCatalogItem = {
  type: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  durationMinutes: number | null;
};

export type ServiceBooking = {
  id: string;
  type: string;
  title: string;
  status: string;
  amount: number;
  scheduledAt?: string | null;
  createdAt: string;
};

export type MentorAssignment = {
  id: string;
  type: string;
  title: string;
  status: string;
  user: { id: string; name: string; email: string };
  scheduledAt?: string | null;
  createdAt: string;
};

export * from './ratings';
