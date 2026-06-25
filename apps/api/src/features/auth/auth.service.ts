import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Response } from 'express';
import { PrismaService } from '../../common/database/prisma.service';
import { BusinessException } from '../../common/exceptions/business.exception';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import {
  comparePassword,
  generateToken,
  hashPassword,
  hashToken,
} from '../../common/utils/hash.util';
import type {
  RegisterDto,
  LoginDto,
  GoogleAuthDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto/auth.dto';
import type { JwtPayload } from './strategies/jwt.strategy';
import type { User } from '@prisma/client';

const REFRESH_COOKIE = 'refresh_token';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly activityLogs: ActivityLogsService,
  ) {}

  async register(dto: RegisterDto, res: Response) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) {
      throw new ConflictException('CONFLICT');
    }

    const passwordHash = await hashPassword(dto.password);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        name: dto.name,
        passwordHash,
      },
    });

    void this.activityLogs.log({
      userId: user.id,
      action: 'user.register',
      entityType: 'user',
      entityId: user.id,
    });

    return this.issueTokens(user, res);
  }

  async login(dto: LoginDto, res: Response) {
    const user = await this.prisma.user.findFirst({
      where: {
        email: dto.email.toLowerCase(),
        isActive: true,
        deletedAt: null,
      },
    });

    if (!user?.passwordHash) {
      throw new UnauthorizedException('UNAUTHORIZED');
    }

    const valid = await comparePassword(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('UNAUTHORIZED');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    void this.activityLogs.log({
      userId: user.id,
      action: 'user.login',
      entityType: 'user',
      entityId: user.id,
    });

    return this.issueTokens(user, res);
  }

  async googleAuth(dto: GoogleAuthDto, res: Response) {
    const clientId = this.config.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.config.get<string>('GOOGLE_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      throw new BusinessException(
        'GOOGLE_AUTH_NOT_CONFIGURED',
        'Google OAuth is not configured',
      );
    }

    const redirectUri = `${this.config.get('FRONTEND_URL')}/callback/google`;

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: dto.code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      throw new UnauthorizedException('UNAUTHORIZED');
    }

    const tokens = (await tokenRes.json()) as { access_token: string };

    const profileRes = await fetch(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      { headers: { Authorization: `Bearer ${tokens.access_token}` } },
    );

    if (!profileRes.ok) {
      throw new UnauthorizedException('UNAUTHORIZED');
    }

    const profile = (await profileRes.json()) as {
      id: string;
      email: string;
      name: string;
      picture?: string;
    };

    let user = await this.prisma.user.findFirst({
      where: {
        OR: [{ googleId: profile.id }, { email: profile.email.toLowerCase() }],
        deletedAt: null,
      },
    });

    if (user) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: profile.id,
          emailVerified: true,
          avatarUrl: user.avatarUrl ?? profile.picture,
          lastLoginAt: new Date(),
        },
      });
    } else {
      user = await this.prisma.user.create({
        data: {
          email: profile.email.toLowerCase(),
          name: profile.name,
          googleId: profile.id,
          avatarUrl: profile.picture,
          emailVerified: true,
        },
      });
    }

    return this.issueTokens(user, res);
  }

  async refresh(refreshToken: string | undefined, res: Response) {
    if (!refreshToken) {
      throw new UnauthorizedException('UNAUTHORIZED');
    }

    const tokenHash = hashToken(refreshToken);
    const stored = await this.prisma.refreshToken.findFirst({
      where: {
        tokenHash,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!stored || !stored.user.isActive || stored.user.deletedAt) {
      throw new UnauthorizedException('UNAUTHORIZED');
    }

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    return this.issueTokens(stored.user, res);
  }

  async logout(refreshToken: string | undefined) {
    if (refreshToken) {
      const tokenHash = hashToken(refreshToken);
      await this.prisma.refreshToken.updateMany({
        where: { tokenHash, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (user) {
      const token = generateToken();
      const tokenHash = hashToken(token);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      await this.prisma.passwordResetToken.create({
        data: { userId: user.id, tokenHash, expiresAt },
      });

      if (process.env.NODE_ENV === 'development') {
        console.info(`[dev] Password reset token for ${user.email}: ${token}`);
      }
    }

    return {
      message: 'If the email exists, a reset link has been sent.',
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const tokenHash = hashToken(dto.token);
    const resetToken = await this.prisma.passwordResetToken.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!resetToken) {
      throw new BusinessException('INVALID_TOKEN', 'Invalid or expired token');
    }

    const passwordHash = await hashPassword(dto.password);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
      this.prisma.refreshToken.updateMany({
        where: { userId: resetToken.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);

    return { message: 'Password reset successful.' };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      include: { subscription: true },
    });

    if (!user) {
      throw new UnauthorizedException('UNAUTHORIZED');
    }

    return this.sanitizeUser(user);
  }

  private async issueTokens(user: User, res: Response) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.getOrThrow('JWT_SECRET'),
      expiresIn: this.config.get('JWT_ACCESS_EXPIRES_IN', '15m'),
    });

    const refreshToken = generateToken();
    const refreshExpires = this.config.get('JWT_REFRESH_EXPIRES_IN', '7d');
    const expiresAt = this.addDuration(new Date(), refreshExpires);

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(refreshToken),
        expiresAt,
      },
    });

    this.setRefreshCookie(res, refreshToken, expiresAt);

    return {
      user: this.sanitizeUser(user),
      accessToken,
      expiresIn: 900,
    };
  }

  private setRefreshCookie(res: Response, token: string, expires: Date) {
    res.cookie(REFRESH_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires,
      path: '/api/v1/auth',
    });
  }

  clearRefreshCookie(res: Response) {
    res.clearCookie(REFRESH_COOKIE, { path: '/api/v1/auth' });
  }

  private sanitizeUser(
    user: User & { subscription?: { status: string; currentPeriodEnd: Date } | null },
  ) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      role: user.role,
      emailVerified: user.emailVerified,
      subscription: user.subscription
        ? {
            status: user.subscription.status,
            currentPeriodEnd: user.subscription.currentPeriodEnd,
          }
        : null,
      createdAt: user.createdAt,
    };
  }

  private addDuration(date: Date, duration: string): Date {
    const match = duration.match(/^(\d+)([dhms])$/);
    if (!match) return new Date(date.getTime() + 7 * 24 * 60 * 60 * 1000);
    const value = parseInt(match[1] ?? '7', 10);
    const unit = match[2];
    const ms: Record<string, number> = {
      d: 86400000,
      h: 3600000,
      m: 60000,
      s: 1000,
    };
    return new Date(date.getTime() + value * (ms[unit ?? 'd'] ?? 86400000));
  }
}
