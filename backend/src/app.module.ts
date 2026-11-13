import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import {
  Admin,
  AdminSchema,
  Project,
  ProjectSchema,
  Experience,
  ExperienceSchema,
  Skill,
  SkillSchema,
  Profile,
  ProfileSchema,
  SocialLink,
  SocialLinkSchema,
  ContactMessage,
  ContactMessageSchema,
  Testimonial,
  TestimonialSchema,
} from './schemas';
import { AuthController, AuthGuard, AuthService } from './auth';
import {
  ProjectsService,
  ProjectsController,
  AdminProjectsController,
  AdminExperienceController,
  ExperienceService,
  ExperienceController,
  SkillsService,
  SkillsController,
  SocialService,
  SocialController,
  AdminSocialController,
  ProfileService,
  ProfileController,
  ContactService,
  ContactController,
  PortfolioController,
  TestimonialsService,
  TestimonialsController,
  AdminTestimonialsController,
} from './resources';
import { UploadController } from './upload';
import { HealthController } from './health';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', 'backend/.env'],
    }),
    MongooseModule.forRootAsync({
      useFactory: () => {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
          if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
            const errorMsg = '[CRITICAL] MONGODB_URI is not defined in production environment variables! Set it in Vercel Project Settings.';
            console.error(errorMsg);
            throw new Error(errorMsg);
          }
          console.warn('[DB] Warning: MONGODB_URI not found, using local fallback for development.');
        }

        return {
          uri: uri || 'mongodb://127.0.0.1:27017/portfolio',
          connectionFactory: (connection) => {
            if (connection.readyState === 1) {
              console.log('[DB] MongoDB connected successfully');
            }
            connection.on('connected', () => console.log('[DB] MongoDB connected'));
            connection.on('error', (err: unknown) => console.error('[DB] MongoDB connection error:', err));
            return connection;
          },
          serverSelectionTimeoutMS: 5000,
          maxPoolSize: 10,
        };
      },
    }),
    MongooseModule.forFeature([
      { name: Admin.name, schema: AdminSchema },
      { name: Project.name, schema: ProjectSchema },
      { name: Experience.name, schema: ExperienceSchema },
      { name: Skill.name, schema: SkillSchema },
      { name: Profile.name, schema: ProfileSchema },
      { name: SocialLink.name, schema: SocialLinkSchema },
      { name: ContactMessage.name, schema: ContactMessageSchema },
      { name: Testimonial.name, schema: TestimonialSchema },
    ]),
    JwtModule.registerAsync({
      useFactory: () => {
        const secret = process.env.JWT_SECRET;
        if (!secret && (process.env.NODE_ENV === 'production' || process.env.VERCEL)) {
          const errorMsg = '[CRITICAL] JWT_SECRET is not set in production! Set it in Vercel Project Settings.';
          console.error(errorMsg);
          throw new Error(errorMsg);
        }
        return {
          global: true,
          secret: secret || 'development-only-secret-change-me-please',
          signOptions: { expiresIn: '8h' },
        };
      },
    }),
  ],
  controllers: [
    AuthController,
    ProjectsController,
    AdminProjectsController,
    AdminExperienceController,
    ExperienceController,
    SkillsController,
    SocialController,
    AdminSocialController,
    ProfileController,
    ContactController,
    PortfolioController,
    TestimonialsController,
    AdminTestimonialsController,
    UploadController,
    HealthController,
  ],
  providers: [
    AuthService,
    AuthGuard,
    ProjectsService,
    ExperienceService,
    SkillsService,
    SocialService,
    ProfileService,
    ContactService,
    TestimonialsService,
  ],
})
export class AppModule {}
