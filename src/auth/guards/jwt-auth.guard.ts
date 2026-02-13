import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  /**
   * Optional: Override handleRequest to provide custom error handling
   * or logic before the request proceeds to the controller.
   */
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const hasToken = request.cookies?.token || request.headers?.authorization;

    if (err || !user) {
      console.log(`[JwtAuthGuard] Auth failed. URL: ${request.method} ${request.url}, Has token: ${!!hasToken}, Error: ${err?.message || 'None'}, Info: ${info?.message || 'None'}`);
      throw err || new UnauthorizedException('Please log in to access this resource');
    }
    return user;
  }
}