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

export type HealthCheck = {
  status: 'ok';
  timestamp: string;
  version: string;
};
