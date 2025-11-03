import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const sessionId = request.cookies?.sessionId;
    
    if (!sessionId) {
      throw new UnauthorizedException('Session required');
    }

    const session = await this.prisma.userSession.findUnique({
      where: { id: sessionId },
      include: { user: true },
    });

    if (!session || !session.isVerified || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired session');
    }

    request.user = session.user;
    return true;
  }
}
