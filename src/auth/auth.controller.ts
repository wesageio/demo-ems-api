import {
    Body,
    Controller,
    Post,
    Request,
    UseGuards,
    ValidationPipe,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('/signup')
    async signUp(
        @Body(ValidationPipe) authCredentialsDto: AuthCredentialsDto,
    ): Promise<void> {
        return await this.authService.signUp(authCredentialsDto);
    }

    @UseGuards(LocalAuthGuard)
    @Post('signin')
    async signIn(@Request() req) {
        return this.authService.signIn(req.user);
    }
}
