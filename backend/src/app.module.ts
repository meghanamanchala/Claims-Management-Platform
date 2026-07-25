import { Module, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { join } from 'path';
import { ClaimsModule } from './claims/claims.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [join(__dirname, '..', '.env'), '.env.local', '.env'],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const logger = new Logger('Database');
        const uri =
          configService.get<string>('MONGODB_URI') ||
          process.env.MONGODB_URI ||
          'mongodb://localhost:27017/claims_db';

        const maskedUri = uri.replace(/:([^@]+)@/, ':***@');
        logger.log(`Initializing MongoDB connection to ${maskedUri}...`);

        return {
          uri,
          connectionFactory: (connection) => {
            if (connection.readyState === 1) {
              logger.log(`Connected to MongoDB database successfully (${connection.name}).`);
            } else {
              connection.on('connected', () => {
                logger.log(`Connected to MongoDB database successfully (${connection.name}).`);
              });
            }
            connection.on('error', (err) => {
              logger.error(`MongoDB connection error: ${err.message}`);
            });
            return connection;
          },
        };
      },
    }),
    ClaimsModule,
    AuthModule,
  ],
})
export class AppModule {}
