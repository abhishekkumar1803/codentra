# Codentra — Backend Architecture

**Version:** 1.0  
**Framework:** NestJS  
**Last Updated:** 2025-06-25

---

## 1. Overview

The Codentra backend is a modular monolith built with NestJS. It follows Clean Architecture principles with feature-based modules, dependency injection, and clear separation between HTTP layer (controllers), business logic (services), and data access (Prisma).

### 1.1 Design Goals

- **Scalability:** Stateless API servers; horizontal scaling on Railway.
- **Maintainability:** Feature modules with single responsibility.
- **Type Safety:** Strict TypeScript; Prisma-generated types.
- **Security:** JWT auth, role guards, rate limiting, input validation.
- **Testability:** Injectable services with mockable dependencies.

### 1.2 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        HTTP Layer                            │
│  Controllers → DTOs → Guards → Interceptors → Pipes         │
├─────────────────────────────────────────────────────────────┤
│                     Business Layer                           │
│  Services → Domain Logic → Event Handlers                   │
├─────────────────────────────────────────────────────────────┤
│                      Data Layer                              │
│  PrismaService → PostgreSQL (Neon)                          │
├─────────────────────────────────────────────────────────────┤
│                   External Services                          │
│  Razorpay │ Resend │ Cloudinary │ Google OAuth              │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Folder Structure

```
backend/
├── src/
│   ├── main.ts                          # Bootstrap, global config
│   ├── app.module.ts                    # Root module
│   │
│   ├── common/                          # Shared infrastructure
│   │   ├── config/
│   │   │   ├── config.module.ts
│   │   │   ├── app.config.ts
│   │   │   ├── database.config.ts
│   │   │   ├── auth.config.ts
│   │   │   ├── razorpay.config.ts
│   │   │   └── cloudinary.config.ts
│   │   ├── database/
│   │   │   ├── prisma.module.ts
│   │   │   └── prisma.service.ts
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts
│   │   │   ├── roles.decorator.ts
│   │   │   └── public.decorator.ts
│   │   ├── dto/
│   │   │   ├── pagination.dto.ts
│   │   │   └── api-response.dto.ts
│   │   ├── exceptions/
│   │   │   ├── business.exception.ts
│   │   │   └── error-codes.ts
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   ├── roles.guard.ts
│   │   │   └── subscription.guard.ts
│   │   ├── interceptors/
│   │   │   ├── logging.interceptor.ts
│   │   │   ├── transform.interceptor.ts
│   │   │   └── timeout.interceptor.ts
│   │   ├── middleware/
│   │   │   ├── correlation-id.middleware.ts
│   │   │   └── request-logger.middleware.ts
│   │   ├── pipes/
│   │   │   └── validation.pipe.ts
│   │   ├── interfaces/
│   │   │   ├── paginated-result.interface.ts
│   │   │   └── jwt-payload.interface.ts
│   │   └── utils/
│   │       ├── hash.util.ts
│   │       └── pagination.util.ts
│   │
│   ├── features/                        # Feature modules
│   │   ├── auth/
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── strategies/
│   │   │   │   ├── jwt.strategy.ts
│   │   │   │   └── google.strategy.ts
│   │   │   └── dto/
│   │   │       ├── register.dto.ts
│   │   │       ├── login.dto.ts
│   │   │       ├── google-auth.dto.ts
│   │   │       ├── forgot-password.dto.ts
│   │   │       └── reset-password.dto.ts
│   │   │
│   │   ├── users/
│   │   │   ├── users.module.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   └── dto/
│   │   │       └── update-user.dto.ts
│   │   │
│   │   ├── subscriptions/
│   │   │   ├── subscriptions.module.ts
│   │   │   ├── subscriptions.controller.ts
│   │   │   ├── subscriptions.service.ts
│   │   │   └── dto/
│   │   │       ├── create-subscription.dto.ts
│   │   │       └── verify-subscription.dto.ts
│   │   │
│   │   ├── payments/
│   │   │   ├── payments.module.ts
│   │   │   ├── payments.controller.ts
│   │   │   ├── payments.service.ts
│   │   │   ├── webhooks.controller.ts
│   │   │   └── dto/
│   │   │       └── razorpay-webhook.dto.ts
│   │   │
│   │   ├── contests/
│   │   │   ├── contests.module.ts
│   │   │   ├── contests.controller.ts
│   │   │   ├── contests.service.ts
│   │   │   └── dto/
│   │   │       ├── create-contest.dto.ts
│   │   │       └── join-contest.dto.ts
│   │   │
│   │   ├── leaderboards/
│   │   │   ├── leaderboards.module.ts
│   │   │   ├── leaderboards.controller.ts
│   │   │   └── leaderboards.service.ts
│   │   │
│   │   ├── jobs/
│   │   │   ├── jobs.module.ts
│   │   │   ├── jobs.controller.ts
│   │   │   ├── jobs.service.ts
│   │   │   └── dto/
│   │   │       └── create-job.dto.ts
│   │   │
│   │   ├── referrals/
│   │   │   ├── referrals.module.ts
│   │   │   ├── referrals.controller.ts
│   │   │   ├── referrals.service.ts
│   │   │   └── dto/
│   │   │       └── create-referral.dto.ts
│   │   │
│   │   ├── services/                    # Premium services
│   │   │   ├── services.module.ts
│   │   │   ├── services.controller.ts
│   │   │   ├── resume-review.service.ts
│   │   │   ├── mock-interview.service.ts
│   │   │   ├── career-call.service.ts
│   │   │   └── linkedin-review.service.ts
│   │   │
│   │   ├── notifications/
│   │   │   ├── notifications.module.ts
│   │   │   ├── notifications.controller.ts
│   │   │   └── notifications.service.ts
│   │   │
│   │   ├── admin/
│   │   │   ├── admin.module.ts
│   │   │   ├── admin.controller.ts
│   │   │   ├── admin.service.ts
│   │   │   └── dto/
│   │   │       └── update-user-admin.dto.ts
│   │   │
│   │   └── activity-logs/
│   │       ├── activity-logs.module.ts
│   │       └── activity-logs.service.ts
│   │
│   └── integrations/                    # External service adapters
│       ├── razorpay/
│       │   ├── razorpay.module.ts
│       │   └── razorpay.service.ts
│       ├── resend/
│       │   ├── resend.module.ts
│       │   └── resend.service.ts
│       ├── cloudinary/
│       │   ├── cloudinary.module.ts
│       │   └── cloudinary.service.ts
│       └── google/
│           ├── google.module.ts
│           └── google-oauth.service.ts
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── test/
│   ├── app.e2e-spec.ts
│   ├── auth.e2e-spec.ts
│   └── subscription.e2e-spec.ts
│
├── .env.example
├── nest-cli.json
├── package.json
├── tsconfig.json
└── tsconfig.build.json
```

---

## 3. Module Architecture

### 3.1 Root Module (`app.module.ts`)

```typescript
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    PrismaModule,
    AuthModule,
    UsersModule,
    SubscriptionsModule,
    PaymentsModule,
    AdminModule,
    ActivityLogsModule,
    // Phase 2+
    // ContestsModule,
    // LeaderboardsModule,
    // NotificationsModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CorrelationIdMiddleware, RequestLoggerMiddleware)
      .forRoutes('*');
  }
}
```

### 3.2 Feature Module Pattern

Each feature module follows this structure:

```
feature/
├── feature.module.ts      # Imports, providers, exports
├── feature.controller.ts  # HTTP endpoints
├── feature.service.ts     # Business logic
└── dto/                   # Request/response DTOs
```

**Example: SubscriptionsModule**

```typescript
@Module({
  imports: [RazorpayModule, ActivityLogsModule],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
```

---

## 4. Controllers

### 4.1 Conventions

- One controller per feature.
- Route prefix matches feature name: `@Controller('subscriptions')`.
- Global prefix: `/api/v1` set in `main.ts`.
- Use `@ApiTags()` for Swagger documentation.
- Return typed responses via `TransformInterceptor`.

### 4.2 Phase 1 Controllers

| Controller | Route Prefix | Auth |
|------------|-------------|------|
| `AuthController` | `/auth` | Mixed |
| `UsersController` | `/users` | JWT |
| `SubscriptionsController` | `/subscriptions` | JWT |
| `PaymentsController` | `/payments` | JWT |
| `WebhooksController` | `/webhooks` | Signature |
| `AdminController` | `/admin` | JWT + ADMIN |

### 4.3 Controller Example

```typescript
@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('me')
  async getMySubscription(@CurrentUser() user: User) {
    return this.subscriptionsService.findByUserId(user.id);
  }

  @Post()
  async create(@CurrentUser() user: User, @Body() dto: CreateSubscriptionDto) {
    return this.subscriptionsService.create(user.id, dto);
  }

  @Post('cancel')
  async cancel(@CurrentUser() user: User) {
    return this.subscriptionsService.cancel(user.id);
  }
}
```

---

## 5. Services

### 5.1 Conventions

- All business logic lives in services.
- Services are `@Injectable()` and injected via constructor.
- Services access database via `PrismaService`.
- External services accessed via integration modules.
- Services throw `BusinessException` for domain errors.

### 5.2 Service Responsibilities

| Service | Responsibility |
|---------|---------------|
| `AuthService` | Registration, login, token management, password reset |
| `UsersService` | Profile CRUD, avatar upload |
| `SubscriptionsService` | Create, verify, cancel subscriptions |
| `PaymentsService` | Payment records, history |
| `RazorpayService` | Razorpay API calls, webhook verification |
| `AdminService` | Metrics, user management |
| `ActivityLogsService` | Audit trail logging |
| `ResendService` | Transactional emails |
| `CloudinaryService` | File uploads |

### 5.3 Service Example

```typescript
@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly razorpay: RazorpayService,
    private readonly activityLogs: ActivityLogsService,
  ) {}

  async create(userId: string, dto: CreateSubscriptionDto) {
    const existing = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (existing?.status === 'ACTIVE') {
      throw new BusinessException('SUBSCRIPTION_ALREADY_ACTIVE');
    }

    const razorpaySub = await this.razorpay.createSubscription(dto.planId);

    const subscription = await this.prisma.subscription.create({
      data: {
        userId,
        razorpaySubscriptionId: razorpaySub.id,
        razorpayPlanId: dto.planId,
        status: 'ACTIVE',
        currentPeriodStart: new Date(),
        currentPeriodEnd: addMonths(new Date(), 1),
      },
    });

    await this.activityLogs.log({
      userId,
      action: 'subscription.created',
      entityType: 'subscription',
      entityId: subscription.id,
    });

    return subscription;
  }
}
```

---

## 6. DTOs (Data Transfer Objects)

### 6.1 Conventions

- One DTO per request shape.
- Use `class-validator` decorators for validation.
- Use `class-transformer` for serialization.
- Suffix: `CreateXDto`, `UpdateXDto`, `XQueryDto`.

### 6.2 Example DTOs

```typescript
// register.dto.ts
export class RegisterDto {
  @IsEmail()
  @MaxLength(255)
  email: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
  password: string;

  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name: string;
}

// pagination.dto.ts
export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
```

---

## 7. Guards

### 7.1 JwtAuthGuard

Validates JWT access token from `Authorization` header.

```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;
    return super.canActivate(context);
  }
}
```

Applied globally; use `@Public()` decorator to skip.

### 7.2 RolesGuard

Checks user role against `@Roles()` decorator.

```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user.role);
  }
}
```

Usage: `@Roles('ADMIN')` on admin endpoints.

### 7.3 SubscriptionGuard (Phase 2+)

Checks active subscription for membership features.

```typescript
@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(private subscriptionsService: SubscriptionsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { user } = context.switchToHttp().getRequest();
    const subscription = await this.subscriptionsService.findByUserId(user.id);
    if (!subscription || subscription.status !== 'ACTIVE') {
      throw new ForbiddenException('SUBSCRIPTION_REQUIRED');
    }
    return true;
  }
}
```

---

## 8. Interceptors

### 8.1 TransformInterceptor

Wraps all responses in standard envelope.

```typescript
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => ({
        success: true,
        data: data?.data ?? data,
        meta: data?.meta,
      })),
    );
  }
}
```

### 8.2 LoggingInterceptor

Logs request duration and status.

```typescript
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const correlationId = request.headers['x-correlation-id'];
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        this.logger.log({
          correlationId,
          method,
          url,
          duration,
          status: context.switchToHttp().getResponse().statusCode,
        });
      }),
    );
  }
}
```

### 8.3 TimeoutInterceptor

Enforces 30-second request timeout.

---

## 9. Middleware

### 9.1 CorrelationIdMiddleware

Generates or propagates `x-correlation-id` header for request tracing.

### 9.2 RequestLoggerMiddleware

Logs incoming request metadata (method, path, IP, user-agent).

---

## 10. Exception Handling

### 10.1 Global Exception Filter

```typescript
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : 500;

    const errorResponse = {
      success: false,
      error: {
        code: exception instanceof BusinessException
          ? exception.code
          : 'INTERNAL_ERROR',
        message: exception instanceof HttpException
          ? exception.message
          : 'Internal server error',
        details: exception instanceof BadRequestException
          ? exception.getResponse()
          : [],
      },
    };

    response.status(status).json(errorResponse);
  }
}
```

### 10.2 Business Exceptions

```typescript
export class BusinessException extends HttpException {
  constructor(
    public readonly code: string,
    message?: string,
    status: number = HttpStatus.BAD_REQUEST,
  ) {
    super(message ?? code, status);
  }
}
```

---

## 11. Authentication Flow

```
┌────────┐    POST /auth/login     ┌─────────┐
│ Client │ ─────────────────────▶ │  Auth   │
│        │                        │ Service │
│        │ ◀───────────────────── │         │
│        │   accessToken (15min)  └─────────┘
│        │   refreshToken (cookie)
│        │
│        │    GET /protected      ┌─────────┐
│        │ ─────────────────────▶ │  JWT    │
│        │  Authorization: Bearer  │  Guard  │
│        │                        └─────────┘
│        │
│        │   POST /auth/refresh   ┌─────────┐
│        │ ─────────────────────▶ │  Auth   │
│        │   (refresh cookie)     │ Service │
│        │ ◀───────────────────── │         │
│        │   new accessToken       └─────────┘
└────────┘
```

### Token Configuration

| Token | Expiry | Storage |
|-------|--------|---------|
| Access | 15 minutes | Memory / Authorization header |
| Refresh | 7 days | httpOnly secure cookie |

---

## 12. External Integrations

### 12.1 Razorpay

```typescript
@Injectable()
export class RazorpayService {
  private razorpay: Razorpay;

  async createSubscription(planId: string) { ... }
  async cancelSubscription(subscriptionId: string) { ... }
  verifyWebhookSignature(body: string, signature: string): boolean { ... }
}
```

### 12.2 Resend

```typescript
@Injectable()
export class ResendService {
  async sendWelcomeEmail(to: string, name: string) { ... }
  async sendPasswordResetEmail(to: string, token: string) { ... }
  async sendSubscriptionConfirmation(to: string) { ... }
}
```

### 12.3 Cloudinary

```typescript
@Injectable()
export class CloudinaryService {
  async uploadImage(file: Express.Multer.File, folder: string): Promise<string> { ... }
  async deleteImage(publicId: string): Promise<void> { ... }
}
```

---

## 13. Database Access

### 13.1 PrismaService

```typescript
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

### 13.2 Query Patterns

- Use `select` to fetch only needed fields.
- Use `include` sparingly; prefer explicit joins.
- Paginate with `skip` and `take`.
- Use transactions for multi-table writes.

---

## 14. Rate Limiting

```typescript
ThrottlerModule.forRoot([
  { name: 'default', ttl: 60000, limit: 100 },
  { name: 'auth', ttl: 60000, limit: 10 },
])
```

Apply stricter limits on auth endpoints:

```typescript
@Throttle({ auth: { ttl: 60000, limit: 5 } })
@Post('login')
async login(@Body() dto: LoginDto) { ... }
```

---

## 15. Logging Strategy

- **Development:** Pretty-printed console logs.
- **Production:** Structured JSON logs to stdout (Railway captures).
- **Correlation ID:** Propagated through all log entries.
- **Levels:** error, warn, info, debug.

---

## 16. Testing Strategy

| Type | Location | Tool |
|------|----------|------|
| Unit | `*.service.spec.ts` | Jest |
| Integration | `test/*.e2e-spec.ts` | Jest + Supertest |
| Coverage target | Services: 80%+ | |

### Test Database

Use separate Neon database branch for e2e tests.

---

## 17. Deployment (Railway)

### 17.1 Environment Variables

```
DATABASE_URL=
JWT_SECRET=
JWT_REFRESH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
RESEND_API_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
FRONTEND_URL=
NODE_ENV=production
PORT=3001
```

### 17.2 Build & Start

```bash
npm run build
npx prisma migrate deploy
node dist/main.js
```

### 17.3 Health Check

Railway health check: `GET /api/v1/health`

---

## 18. API Versioning

- Current version: `v1`
- Version in URL path: `/api/v1/...`
- Breaking changes require new version (`v2`).
- Deprecation notice: 3 months before removal.

---

## 19. Security Checklist

- [x] Global validation pipe (`whitelist: true, forbidNonWhitelisted: true`)
- [x] JWT with short expiry
- [x] Refresh token rotation
- [x] bcrypt password hashing
- [x] Rate limiting
- [x] CORS restricted to frontend domain
- [x] Helmet security headers
- [x] Razorpay webhook signature verification
- [x] No secrets in code
- [x] Input sanitization via class-validator

---

## 20. Scaling Path

| Users | Action |
|-------|--------|
| 0–1k | Single Railway instance |
| 1k–10k | Scale Railway instances (2–3) |
| 10k–50k | Neon read replicas; Redis cache |
| 50k–100k | Consider service extraction (payments, notifications) |

Current architecture supports scaling to 100k users without rewrite.
