    // jwt.strategy.ts
    import { PassportStrategy } from '@nestjs/passport';
    import { ExtractJwt, Strategy } from 'passport-jwt';
    import { Injectable } from '@nestjs/common';
    import { JwtPayload } from '../interfaces/job-data.interface';

    interface JwtStrategyPayload extends JwtPayload {
      iat?: number;
      exp?: number;
    }

    @Injectable()
    export class JwtStrategy extends PassportStrategy(Strategy) {
      constructor() {
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
          throw new Error('JWT_SECRET environment variable is not defined');
        }
        super({
          jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
          ignoreExpiration: false,
          secretOrKey: jwtSecret, // PASTI string, tidak undefined
        });
      }

      async validate(payload: JwtStrategyPayload) {
        // Return payload sesuai kebutuhan aplikasi
        return { id: payload.sub, ...payload };
      }
    }