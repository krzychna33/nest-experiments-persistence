import { Global, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CognitoUserPool } from 'amazon-cognito-identity-js';
import { CognitoIdentityServiceProvider } from 'aws-sdk';
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [HttpModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: 'COGNITO_USER_POOL',
      useFactory: (config: ConfigService) => {
        return new CognitoUserPool({
          UserPoolId: config.get('COGNITO_USER_POOL_ID'),
          ClientId: config.get('COGNITO_CLIENT_ID'),
        });
      },
      inject: [ConfigService],
    },
    {
      provide: 'COGNITO_IDENTITY_PROVIDER',
      useFactory: (config: ConfigService) => {
        return new CognitoIdentityServiceProvider({
          region: config.get('AWS_REGION'),
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: ['COGNITO_IDENTITY_PROVIDER'],
})
export class AuthModule {}
