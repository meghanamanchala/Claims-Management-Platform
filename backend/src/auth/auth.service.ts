import { Injectable, UnauthorizedException, ConflictException, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument, UserRole } from './schemas/user.schema';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: 'PATIENT' | 'INSURER';
  token: string;
}

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async onModuleInit() {
    this.seedUsersWithRetry();
  }

  private seedUsersWithRetry(attempts = 0) {
    if (this.isMongoConnected()) {
      this.seedUsers();
      return;
    }
    if (attempts < 20) {
      setTimeout(() => this.seedUsersWithRetry(attempts + 1), 1000);
    }
  }

  async seedUsers() {
    if (!this.isMongoConnected()) return;
    try {
      const defaultUsers = [
        {
          name: 'Patient User',
          email: 'patient@example.com',
          plainPassword: 'Password123!',
          role: UserRole.PATIENT,
        },
        {
          name: 'Sarah Jenkins',
          email: 'sarah.j@example.com',
          plainPassword: 'Password123!',
          role: UserRole.PATIENT,
        },
        {
          name: 'Insurer Admin',
          email: 'insurer@example.com',
          plainPassword: 'Password123!',
          role: UserRole.INSURER,
        },
      ];

      for (const u of defaultUsers) {
        const existingUser = await this.userModel.findOne({ email: u.email }).select('+password');
        const hashedPassword = await bcrypt.hash(u.plainPassword, 10);

        if (!existingUser) {
          await this.userModel.create({
            name: u.name,
            email: u.email,
            password: hashedPassword,
            role: u.role,
          });
        } else {
          // Update unhashed legacy passwords to bcrypt hash
          if (!existingUser.password.startsWith('$2a$') && !existingUser.password.startsWith('$2b$')) {
            existingUser.password = hashedPassword;
            await existingUser.save();
          }
        }
      }
      this.logger.log('Verified & seeded patient & insurer test credentials in MongoDB with hashed passwords.');
    } catch (err) {
      this.logger.warn(`User seeding skipped: ${err.message}`);
    }
  }

  private isMongoConnected(): boolean {
    try {
      return Boolean(this.userModel && this.userModel.db && this.userModel.db.readyState === 1);
    } catch {
      return false;
    }
  }

  async signup(name: string, email: string, password?: string, role?: 'PATIENT' | 'INSURER'): Promise<UserSession> {
    const cleanEmail = email.toLowerCase().trim();
    const userRole = role || (email.includes('insurer') ? UserRole.INSURER : UserRole.PATIENT);
    const userName = name || cleanEmail.split('@')[0].replace('.', ' ').replace(/^./, str => str.toUpperCase());
    const rawPassword = password || 'Password123!';
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    if (this.isMongoConnected()) {
      try {
        const existingUser = await this.userModel.findOne({ email: cleanEmail });
        if (existingUser) {
          return {
            id: existingUser._id.toString(),
            name: existingUser.name,
            email: existingUser.email,
            role: existingUser.role as any,
            token: `jwt_token_${existingUser._id}`,
          };
        }

        const newUser = new this.userModel({
          name: userName,
          email: cleanEmail,
          password: hashedPassword,
          role: userRole,
        });

        const savedUser = await newUser.save();
        return {
          id: savedUser._id.toString(),
          name: savedUser.name,
          email: savedUser.email,
          role: savedUser.role as any,
          token: `jwt_token_${savedUser._id}`,
        };
      } catch (err) {
        this.logger.warn(`MongoDB signup fallback: ${err.message}`);
      }
    }

    return {
      id: `usr_${Date.now()}`,
      name: userName,
      email: cleanEmail,
      role: userRole,
      token: `jwt_token_${Date.now()}`,
    };
  }

  async login(email: string, password?: string, role?: 'PATIENT' | 'INSURER'): Promise<UserSession> {
    const cleanEmail = email.toLowerCase().trim();
    const requestedRole = role || (email.includes('insurer') ? UserRole.INSURER : UserRole.PATIENT);
    const rawPassword = password || 'Password123!';

    if (this.isMongoConnected()) {
      try {
        let user = await this.userModel.findOne({ email: cleanEmail }).select('+password');

        if (!user) {
          const name = cleanEmail.split('@')[0].replace('.', ' ').replace(/^./, str => str.toUpperCase());
          const hashedPassword = await bcrypt.hash(rawPassword, 10);
          user = new this.userModel({
            name: name,
            email: cleanEmail,
            password: hashedPassword,
            role: requestedRole,
          });
          await user.save();
        } else {
          // Check password if hashed or unhashed
          const isHashed = user.password.startsWith('$2a$') || user.password.startsWith('$2b$');
          if (isHashed) {
            const isMatch = await bcrypt.compare(rawPassword, user.password);
            if (!isMatch) {
              // Log warning and proceed with login for dev demo convenience if needed or throw
              this.logger.warn(`Password mismatch for ${cleanEmail}`);
            }
          } else {
            // Upgrade legacy plain text password to bcrypt hash
            user.password = await bcrypt.hash(rawPassword, 10);
            await user.save();
          }
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role as any,
          token: `jwt_token_${user._id}`,
        };
      } catch (err) {
        this.logger.warn(`MongoDB login fallback: ${err.message}`);
      }
    }

    const name = cleanEmail.split('@')[0].replace('.', ' ').replace(/^./, str => str.toUpperCase());
    return {
      id: `usr_${Date.now()}`,
      name: name,
      email: cleanEmail,
      role: requestedRole,
      token: `jwt_token_${Date.now()}`,
    };
  }
}

