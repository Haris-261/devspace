import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Injectable,
  InternalServerErrorException,
  Patch,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { Response } from 'express';
import { Admin } from './schemas';
import { IsEmail, IsString, Length, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'A valid email address is required' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;
}

export class PasswordDto {
  @IsString()
  currentPassword: string;

  @IsString()
  @Length(10, 128, { message: 'New password must be between 10 and 128 characters' })
  newPassword: string;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwt: JwtService) {}

  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    const cookieName = process.env.COOKIE_NAME || 'portfolio_admin';
    let token = req.cookies?.[cookieName];

    // Dual support: Read from Authorization header if cookie was blocked in cross-origin
    if (!token && req.headers?.authorization) {
      const parts = req.headers.authorization.split(' ');
      if (parts.length === 2 && (parts[0] === 'Bearer' || parts[0] === 'bearer')) {
        token = parts[1];
      }
    }

    if (!token) {
      throw new UnauthorizedException('Authentication required');
    }

    try {
      req.admin = this.jwt.verify(token);
      return true;
    } catch (err: any) {
      console.error('[AuthGuard] Token verification failed:', err.message);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Admin.name) private admins: Model<Admin>,
    private jwt: JwtService,
  ) {}

  async login(dto: LoginDto) {
    try {
      const email = dto.email?.trim().toLowerCase();
      if (!email || !dto.password) {
        throw new BadRequestException('Email and password are required');
      }

      const admin = await this.admins.findOne({ email }).select('+passwordHash');
      if (!admin) {
        console.error(`[Auth] Login failed: No admin account found with email: ${email}`);
        throw new UnauthorizedException('Invalid email or password');
      }

      const isMatch = await bcrypt.compare(dto.password, admin.passwordHash);
      if (!isMatch) {
        console.error(`[Auth] Login failed: Password mismatch for email: ${email}`);
        throw new UnauthorizedException('Invalid email or password');
      }

      admin.lastLoginAt = new Date();
      await admin.save();

      const token = this.jwt.sign({ sub: admin.id, email: admin.email });
      return {
        token,
        admin: { id: admin.id, email: admin.email },
      };
    } catch (err: any) {
      if (
        err instanceof UnauthorizedException ||
        err instanceof BadRequestException
      ) {
        throw err;
      }
      console.error('[Auth] Login error encountered:', err.message || err);
      throw new InternalServerErrorException(
        'Login failed due to a server error. Check database connection and Vercel logs.',
      );
    }
  }

  async me(id: string) {
    const admin = await this.admins.findById(id);
    if (!admin) {
      console.error(`[Auth] Admin user with ID ${id} not found`);
      throw new UnauthorizedException('Admin user not found');
    }
    return { id: admin.id, email: admin.email };
  }

  async change(id: string, dto: PasswordDto) {
    const admin = await this.admins.findById(id).select('+passwordHash');
    if (!admin) {
      throw new UnauthorizedException('Admin user not found');
    }

    const isMatch = await bcrypt.compare(dto.currentPassword, admin.passwordHash);
    if (!isMatch) {
      throw new BadRequestException('Current password is incorrect');
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(dto.newPassword)) {
      throw new BadRequestException(
        'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      );
    }

    admin.passwordHash = await bcrypt.hash(dto.newPassword, 12);
    await admin.save();
    return { message: 'Password changed successfully' };
  }
}

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.auth.login(dto);
    const isProd = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;
    const cookieName = process.env.COOKIE_NAME || 'portfolio_admin';

    // In production cross-site contexts, sameSite MUST be 'none' and secure MUST be true
    res.cookie(cookieName, result.token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 8 * 60 * 60 * 1000,
      path: '/',
    });

    return {
      ...result.admin,
      token: result.token,
    };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    const isProd = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;
    const cookieName = process.env.COOKIE_NAME || 'portfolio_admin';

    res.clearCookie(cookieName, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      path: '/',
    });

    return { message: 'Logged out' };
  }

  @Get('me')
  @UseGuards(AuthGuard)
  me(@Req() req: any) {
    return this.auth.me(req.admin.sub);
  }

  @Patch('change-password')
  @UseGuards(AuthGuard)
  change(@Req() req: any, @Body() dto: PasswordDto) {
    return this.auth.change(req.admin.sub, dto);
  }
}
