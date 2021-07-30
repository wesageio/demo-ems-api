import {
    Body,
    Controller,
    Post,
    Request,
    UseGuards,
    ValidationPipe,
    Res,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('/signup')
    async signUp(
        @Res() res,
        @Body(ValidationPipe) authCredentialsDto: AuthCredentialsDto,
    ): Promise<void> {
        const user = await this.authService.signUp(authCredentialsDto);
        if (user) {
            return res.status(200).json({
                message: 'User has been successfully created',
                user,
            });
        } else {
            return res.status(200).json({
                message: 'User exist',
            });
        }
    }

    @UseGuards(LocalAuthGuard)
    @Post('signin')
    async signIn(@Request() req) {
        return this.authService.signIn(req.user);
    }
}
