import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CognitoIdentityServiceProvider } from 'aws-sdk';
import { Request } from 'express';

export type RequestWithUser = Request & { user: { id: string; email: string } };

@Injectable()
export class CognitoAccessTokenCheckGuard implements CanActivate {
  constructor(
    @Inject('COGNITO_IDENTITY_PROVIDER')
    private readonly cognitoIdentityProvider: CognitoIdentityServiceProvider,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const accessToken = request.headers.authorization?.split(' ')[1];
    if (!accessToken) {
      throw new UnauthorizedException();
    }

    const rawUser = await this.cognitoIdentityProvider
      .getUser({ AccessToken: accessToken })
      .promise();

    request.user = {
      id: rawUser.UserAttributes.find((attr) => attr.Name === 'sub')?.Value,
      email: rawUser.UserAttributes.find((attr) => attr.Name === 'email')
        ?.Value,
    };

    if (request.user.email && request.user.id) {
      return true;
    }

    return false;
  }
}
