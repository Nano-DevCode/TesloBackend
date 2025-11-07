import { Controller, Get, Post, Body, UseGuards, Req, Headers, SetMetadata } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { Auth, GetUser, RawHeaders } from './decorators';
import { User } from './entities/user.entity';
import { IncomingHttpHeaders } from 'http';
import { UserRoleGuard } from './guards/user-role.guard';
import { RoleProtected } from './decorators/role-protected.decorator';
import { ValidRoles } from './interfaces';

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
    @Req() request: Express.Request,
    @GetUser() user:User,
    @GetUser('email') userEmail:string,
    @RawHeaders() rawHeader: string[],
    @Headers() headers: IncomingHttpHeaders[],
    ){
      
    return {
      ok: true,
      message: 'Hola Mundo Private',
      user,
      userEmail,
      headers
    }
  }

  @Get('private2')
  @RoleProtected( ValidRoles.admin)
  @UseGuards(AuthGuard(), UserRoleGuard)
  privateRoute2(
    @GetUser() user:User
  ){
    return {
      ok: true,
      user
    }
  }

  @Get('private3')
  @Auth(ValidRoles.admin)
  privateRoute3(
    @GetUser() user:User
  ){
    return {
      ok: true,
      user
    }
  }
  
}
