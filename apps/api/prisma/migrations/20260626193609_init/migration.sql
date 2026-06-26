-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'MENTOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('PENDING', 'ACTIVE', 'PAST_DUE', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('SUBSCRIPTION', 'RESUME_REVIEW', 'MOCK_INTERVIEW', 'CAREER_CALL', 'LINKEDIN_REVIEW');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "ContestType" AS ENUM ('DSA', 'COMPETITIVE_PROGRAMMING', 'SYSTEM_DESIGN', 'QUIZ');

-- CreateEnum
CREATE TYPE "ContestStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'LIVE', 'ENDED');

-- CreateEnum
CREATE TYPE "ParticipantStatus" AS ENUM ('REGISTERED', 'IN_PROGRESS', 'SUBMITTED', 'DISQUALIFIED');

-- CreateEnum
CREATE TYPE "LeaderboardPeriod" AS ENUM ('CONTEST', 'WEEKLY', 'MONTHLY', 'ALL_TIME');

-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('REMOTE', 'HYBRID', 'ONSITE');

-- CreateEnum
CREATE TYPE "ReferralStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "ServiceStatus" AS ENUM ('PENDING', 'SCHEDULED', 'IN_REVIEW', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('CONTEST_REMINDER', 'CONTEST_RESULT', 'SUBSCRIPTION', 'PAYMENT', 'SERVICE_UPDATE', 'SYSTEM');

-- CreateEnum
CREATE TYPE "ProblemDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "CodeLanguage" AS ENUM ('PYTHON', 'CPP', 'JAVA', 'JAVASCRIPT');

-- CreateEnum
CREATE TYPE "RatingType" AS ENUM ('DSA', 'CP');

-- CreateEnum
CREATE TYPE "SubmissionVerdict" AS ENUM ('PENDING', 'ACCEPTED', 'WRONG_ANSWER', 'RUNTIME_ERROR', 'TIME_LIMIT_EXCEEDED', 'COMPILATION_ERROR');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatar_url" TEXT,
    "password_hash" TEXT,
    "google_id" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "bio" TEXT,
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "github_url" TEXT,
    "linkedin_url" TEXT,
    "twitter_url" TEXT,
    "website_url" TEXT,
    "dsa_rating" INTEGER NOT NULL DEFAULT 1200,
    "cp_rating" INTEGER NOT NULL DEFAULT 1200,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'PENDING',
    "razorpay_subscription_id" TEXT,
    "razorpay_plan_id" TEXT,
    "current_period_start" TIMESTAMP(3) NOT NULL,
    "current_period_end" TIMESTAMP(3) NOT NULL,
    "cancelled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "subscription_id" TEXT,
    "type" "PaymentType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "razorpay_order_id" TEXT,
    "razorpay_payment_id" TEXT,
    "razorpay_signature" TEXT,
    "metadata" JSONB,
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_events" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "processed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contests" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "ContestType" NOT NULL,
    "status" "ContestStatus" NOT NULL DEFAULT 'DRAFT',
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "duration_minutes" INTEGER NOT NULL,
    "max_participants" INTEGER,
    "created_by_id" TEXT NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contest_participants" (
    "id" TEXT NOT NULL,
    "contest_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" "ParticipantStatus" NOT NULL DEFAULT 'REGISTERED',
    "is_virtual" BOOLEAN NOT NULL DEFAULT false,
    "score" INTEGER NOT NULL DEFAULT 0,
    "rank" INTEGER,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submitted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contest_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_questions" (
    "id" TEXT NOT NULL,
    "contest_id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 1,
    "order_index" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quiz_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_options" (
    "id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "is_correct" BOOLEAN NOT NULL DEFAULT false,
    "order_index" INTEGER NOT NULL,

    CONSTRAINT "quiz_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_answers" (
    "id" TEXT NOT NULL,
    "participant_id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "option_id" TEXT NOT NULL,
    "is_correct" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quiz_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leaderboard_entries" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "contest_id" TEXT,
    "period" "LeaderboardPeriod" NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "rank" INTEGER NOT NULL,
    "period_start" TIMESTAMP(3),
    "period_end" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leaderboard_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobs" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT,
    "job_type" "JobType" NOT NULL,
    "salary_min" INTEGER,
    "salary_max" INTEGER,
    "apply_url" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "posted_by_id" TEXT NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referrals" (
    "id" TEXT NOT NULL,
    "referrer_id" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "role_title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requirements" TEXT,
    "status" "ReferralStatus" NOT NULL DEFAULT 'OPEN',
    "contact_email" TEXT,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "referrals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_design_submissions" (
    "id" TEXT NOT NULL,
    "contest_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "solution" TEXT NOT NULL,
    "diagram_url" TEXT,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_design_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "problems" (
    "id" TEXT NOT NULL,
    "contest_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "input_format" TEXT NOT NULL,
    "output_format" TEXT NOT NULL,
    "difficulty" "ProblemDifficulty" NOT NULL DEFAULT 'EASY',
    "points" INTEGER NOT NULL DEFAULT 100,
    "time_limit_ms" INTEGER NOT NULL DEFAULT 2000,
    "memory_mb" INTEGER NOT NULL DEFAULT 256,
    "starter_code" JSONB NOT NULL,
    "order_index" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "problems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "problem_test_cases" (
    "id" TEXT NOT NULL,
    "problem_id" TEXT NOT NULL,
    "input" TEXT NOT NULL,
    "output" TEXT NOT NULL,
    "is_sample" BOOLEAN NOT NULL DEFAULT false,
    "order_index" INTEGER NOT NULL,

    CONSTRAINT "problem_test_cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "code_submissions" (
    "id" TEXT NOT NULL,
    "problem_id" TEXT NOT NULL,
    "contest_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "language" "CodeLanguage" NOT NULL,
    "source_code" TEXT NOT NULL,
    "verdict" "SubmissionVerdict" NOT NULL DEFAULT 'PENDING',
    "score" INTEGER NOT NULL DEFAULT 0,
    "runtime_ms" INTEGER,
    "verdict_details" JSONB,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "code_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rating_history" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "RatingType" NOT NULL,
    "rating" INTEGER NOT NULL,
    "delta" INTEGER NOT NULL DEFAULT 0,
    "contest_id" TEXT,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rating_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resume_reviews" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "payment_id" TEXT NOT NULL,
    "reviewer_id" TEXT,
    "status" "ServiceStatus" NOT NULL DEFAULT 'PENDING',
    "resume_url" TEXT NOT NULL,
    "feedback" TEXT,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resume_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mock_interviews" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "payment_id" TEXT NOT NULL,
    "mentor_id" TEXT,
    "status" "ServiceStatus" NOT NULL DEFAULT 'PENDING',
    "scheduled_at" TIMESTAMP(3),
    "duration_minutes" INTEGER NOT NULL DEFAULT 60,
    "meeting_link" TEXT,
    "feedback" TEXT,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mock_interviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "career_calls" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "payment_id" TEXT NOT NULL,
    "mentor_id" TEXT,
    "status" "ServiceStatus" NOT NULL DEFAULT 'PENDING',
    "scheduled_at" TIMESTAMP(3),
    "duration_minutes" INTEGER NOT NULL DEFAULT 30,
    "meeting_link" TEXT,
    "notes" TEXT,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "career_calls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "linkedin_reviews" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "payment_id" TEXT NOT NULL,
    "reviewer_id" TEXT,
    "status" "ServiceStatus" NOT NULL DEFAULT 'PENDING',
    "linkedin_url" TEXT NOT NULL,
    "feedback" TEXT,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "linkedin_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "metadata" JSONB,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "action" TEXT NOT NULL,
    "entity_type" TEXT,
    "entity_id" TEXT,
    "metadata" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_google_id_key" ON "users"("google_id");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_token_hash_idx" ON "refresh_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "password_reset_tokens_user_id_idx" ON "password_reset_tokens"("user_id");

-- CreateIndex
CREATE INDEX "password_reset_tokens_token_hash_idx" ON "password_reset_tokens"("token_hash");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_user_id_key" ON "profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_user_id_key" ON "subscriptions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_razorpay_subscription_id_key" ON "subscriptions"("razorpay_subscription_id");

-- CreateIndex
CREATE INDEX "subscriptions_user_id_idx" ON "subscriptions"("user_id");

-- CreateIndex
CREATE INDEX "subscriptions_status_idx" ON "subscriptions"("status");

-- CreateIndex
CREATE INDEX "subscriptions_razorpay_subscription_id_idx" ON "subscriptions"("razorpay_subscription_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_razorpay_order_id_key" ON "payments"("razorpay_order_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_razorpay_payment_id_key" ON "payments"("razorpay_payment_id");

-- CreateIndex
CREATE INDEX "payments_user_id_idx" ON "payments"("user_id");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE INDEX "payments_razorpay_order_id_idx" ON "payments"("razorpay_order_id");

-- CreateIndex
CREATE INDEX "payments_type_idx" ON "payments"("type");

-- CreateIndex
CREATE UNIQUE INDEX "webhook_events_event_id_key" ON "webhook_events"("event_id");

-- CreateIndex
CREATE INDEX "webhook_events_provider_idx" ON "webhook_events"("provider");

-- CreateIndex
CREATE UNIQUE INDEX "contests_slug_key" ON "contests"("slug");

-- CreateIndex
CREATE INDEX "contests_slug_idx" ON "contests"("slug");

-- CreateIndex
CREATE INDEX "contests_type_status_idx" ON "contests"("type", "status");

-- CreateIndex
CREATE INDEX "contests_start_time_idx" ON "contests"("start_time");

-- CreateIndex
CREATE INDEX "contest_participants_contest_id_idx" ON "contest_participants"("contest_id");

-- CreateIndex
CREATE INDEX "contest_participants_user_id_idx" ON "contest_participants"("user_id");

-- CreateIndex
CREATE INDEX "contest_participants_contest_id_score_idx" ON "contest_participants"("contest_id", "score" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "contest_participants_contest_id_user_id_key" ON "contest_participants"("contest_id", "user_id");

-- CreateIndex
CREATE INDEX "quiz_questions_contest_id_order_index_idx" ON "quiz_questions"("contest_id", "order_index");

-- CreateIndex
CREATE INDEX "quiz_options_question_id_order_index_idx" ON "quiz_options"("question_id", "order_index");

-- CreateIndex
CREATE UNIQUE INDEX "quiz_answers_participant_id_question_id_key" ON "quiz_answers"("participant_id", "question_id");

-- CreateIndex
CREATE INDEX "leaderboard_entries_period_rank_idx" ON "leaderboard_entries"("period", "rank");

-- CreateIndex
CREATE INDEX "leaderboard_entries_contest_id_rank_idx" ON "leaderboard_entries"("contest_id", "rank");

-- CreateIndex
CREATE INDEX "leaderboard_entries_user_id_idx" ON "leaderboard_entries"("user_id");

-- CreateIndex
CREATE INDEX "jobs_is_active_idx" ON "jobs"("is_active");

-- CreateIndex
CREATE INDEX "jobs_company_idx" ON "jobs"("company");

-- CreateIndex
CREATE INDEX "referrals_status_idx" ON "referrals"("status");

-- CreateIndex
CREATE INDEX "referrals_referrer_id_idx" ON "referrals"("referrer_id");

-- CreateIndex
CREATE INDEX "referrals_company_idx" ON "referrals"("company");

-- CreateIndex
CREATE INDEX "system_design_submissions_contest_id_idx" ON "system_design_submissions"("contest_id");

-- CreateIndex
CREATE UNIQUE INDEX "system_design_submissions_contest_id_user_id_key" ON "system_design_submissions"("contest_id", "user_id");

-- CreateIndex
CREATE INDEX "problems_contest_id_order_index_idx" ON "problems"("contest_id", "order_index");

-- CreateIndex
CREATE UNIQUE INDEX "problems_contest_id_slug_key" ON "problems"("contest_id", "slug");

-- CreateIndex
CREATE INDEX "problem_test_cases_problem_id_order_index_idx" ON "problem_test_cases"("problem_id", "order_index");

-- CreateIndex
CREATE INDEX "code_submissions_problem_id_user_id_idx" ON "code_submissions"("problem_id", "user_id");

-- CreateIndex
CREATE INDEX "code_submissions_contest_id_user_id_idx" ON "code_submissions"("contest_id", "user_id");

-- CreateIndex
CREATE INDEX "rating_history_user_id_type_created_at_idx" ON "rating_history"("user_id", "type", "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "resume_reviews_payment_id_key" ON "resume_reviews"("payment_id");

-- CreateIndex
CREATE UNIQUE INDEX "mock_interviews_payment_id_key" ON "mock_interviews"("payment_id");

-- CreateIndex
CREATE UNIQUE INDEX "career_calls_payment_id_key" ON "career_calls"("payment_id");

-- CreateIndex
CREATE UNIQUE INDEX "linkedin_reviews_payment_id_key" ON "linkedin_reviews"("payment_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_read_at_idx" ON "notifications"("user_id", "read_at");

-- CreateIndex
CREATE INDEX "notifications_user_id_created_at_idx" ON "notifications"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "activity_logs_user_id_idx" ON "activity_logs"("user_id");

-- CreateIndex
CREATE INDEX "activity_logs_action_idx" ON "activity_logs"("action");

-- CreateIndex
CREATE INDEX "activity_logs_created_at_idx" ON "activity_logs"("created_at" DESC);

-- CreateIndex
CREATE INDEX "activity_logs_entity_type_entity_id_idx" ON "activity_logs"("entity_type", "entity_id");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contests" ADD CONSTRAINT "contests_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contest_participants" ADD CONSTRAINT "contest_participants_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "contests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contest_participants" ADD CONSTRAINT "contest_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "contests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_options" ADD CONSTRAINT "quiz_options_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "quiz_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_answers" ADD CONSTRAINT "quiz_answers_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "contest_participants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_answers" ADD CONSTRAINT "quiz_answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "quiz_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_answers" ADD CONSTRAINT "quiz_answers_option_id_fkey" FOREIGN KEY ("option_id") REFERENCES "quiz_options"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leaderboard_entries" ADD CONSTRAINT "leaderboard_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leaderboard_entries" ADD CONSTRAINT "leaderboard_entries_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "contests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_posted_by_id_fkey" FOREIGN KEY ("posted_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referrer_id_fkey" FOREIGN KEY ("referrer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system_design_submissions" ADD CONSTRAINT "system_design_submissions_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "contests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system_design_submissions" ADD CONSTRAINT "system_design_submissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "problems" ADD CONSTRAINT "problems_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "contests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "problem_test_cases" ADD CONSTRAINT "problem_test_cases_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "code_submissions" ADD CONSTRAINT "code_submissions_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "code_submissions" ADD CONSTRAINT "code_submissions_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "contests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "code_submissions" ADD CONSTRAINT "code_submissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rating_history" ADD CONSTRAINT "rating_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resume_reviews" ADD CONSTRAINT "resume_reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resume_reviews" ADD CONSTRAINT "resume_reviews_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resume_reviews" ADD CONSTRAINT "resume_reviews_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mock_interviews" ADD CONSTRAINT "mock_interviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mock_interviews" ADD CONSTRAINT "mock_interviews_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mock_interviews" ADD CONSTRAINT "mock_interviews_mentor_id_fkey" FOREIGN KEY ("mentor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_calls" ADD CONSTRAINT "career_calls_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_calls" ADD CONSTRAINT "career_calls_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_calls" ADD CONSTRAINT "career_calls_mentor_id_fkey" FOREIGN KEY ("mentor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "linkedin_reviews" ADD CONSTRAINT "linkedin_reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "linkedin_reviews" ADD CONSTRAINT "linkedin_reviews_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "linkedin_reviews" ADD CONSTRAINT "linkedin_reviews_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
