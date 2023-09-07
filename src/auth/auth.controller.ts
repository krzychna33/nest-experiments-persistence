import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  CognitoAccessTokenCheckGuard,
  RequestWithUser,
} from './cognito-access-token-check.guard';

export class SignUpDto {
  email: string;
  password: string;
}

export class ConfirmSignUpDto {
  email: string;
  code: string;
}

export class SignInDto {
  email: string;
  password: string;
}

export class GetTokenDto {
  code: string;
  clientId: string;
  redirectUri: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  async signUp(@Body() signUpDto: SignUpDto) {
    const createdUser = await this.authService.signUp({ ...signUpDto });
    return { user: createdUser };
  }

  @Post('sign-up-confirm')
  async confirmSignUp(@Body() confirmSignUpDto: ConfirmSignUpDto) {
    const confirmationMessage = await this.authService.confirmSignUp({
      ...confirmSignUpDto,
    });
    return { message: confirmationMessage };
  }

  @Post('sign-in')
  async signIn(@Body() signInDto: SignInDto) {
    const signInResult = await this.authService.signIn({ ...signInDto });
    if ('userConfirmationNecessary' in signInResult) {
      return { message: 'MFA: User confirmation necessary' };
    }
    return { ...signInResult };
  }

  @Post('token')
  async getToken(@Body() dto: GetTokenDto) {
    return this.authService.getTokenUsingCode(dto);
  }

  @Get('profile')
  @UseGuards(CognitoAccessTokenCheckGuard)
  getProfile(@Req() req: RequestWithUser) {
    return req.user;
  }
}
