import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserAttribute,
  CognitoUserPool,
} from 'amazon-cognito-identity-js';
import { GetTokenDto } from './auth.controller';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

export interface IUserToken {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    @Inject('COGNITO_USER_POOL')
    private readonly cognitoUserPool: CognitoUserPool,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  public signUp({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<string> {
    return new Promise((resolve, reject) => {
      const attributeList: CognitoUserAttribute[] = [
        new CognitoUserAttribute({
          Name: 'email',
          Value: email,
        }),
        new CognitoUserAttribute({
          Name: 'gender',
          Value: 'male',
        }),
        new CognitoUserAttribute({
          Name: 'name',
          Value: email,
        }),
      ];

      this.cognitoUserPool.signUp(
        email,
        password,
        attributeList,
        [],
        (err, result) => {
          if (err) {
            return reject(err);
          }

          resolve(result?.user.getUsername() || '');
        },
      );
    });
  }

  public confirmSignUp({
    email,
    code,
  }: {
    email: string;
    code: string;
  }): Promise<string> {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: this.cognitoUserPool,
      });

      cognitoUser.confirmRegistration(code, true, (err, result) => {
        if (err) {
          return reject(err);
        }

        resolve(result);
      });
    });
  }

  public signIn({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<IUserToken | { userConfirmationNecessary: boolean }> {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: this.cognitoUserPool,
      });

      const authenticationDetails = new AuthenticationDetails({
        Username: email,
        Password: password,
      });
      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (session, userConfirmationNecessary) => {
          if (userConfirmationNecessary) {
            return resolve({ userConfirmationNecessary });
          }

          resolve({
            accessToken: session.getAccessToken().getJwtToken(),
            refreshToken: session.getRefreshToken().getToken(),
          });
        },
        onFailure: (err) => {
          reject(err);
        },
      });
    });
  }

  public async getTokenUsingCode(dto: GetTokenDto) {
    const queryParams = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: dto.clientId,
      client_secret: this.configService.get(
        'COGNITO_AUTHORIZATION_CODE_FLOW_CLIENT_SECRET',
      ),
      redirect_uri: dto.redirectUri,
      code: dto.code,
    }).toString();

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `https://nest-experiments.auth.eu-central-1.amazoncognito.com/oauth2/token?${queryParams}`,
        ),
      );

      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
      };
    } catch (e) {
      console.error(e);
      throw new UnauthorizedException();
    }
  }
}
