import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() createUserDto:CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  loginUser(@Body() loginUserDto:LoginUserDto){
    return this.authService.login(loginUserDto);
  }

  @Get('private')
  @UseGuards( AuthGuard())
  testingPrivateRoute(
    @Req() request: Express.Request
  ){
    return {
      ok: true,
      message: 'Hola Mundo Private',
      user: {name:'Manuel'}
    }
  }
  
}
