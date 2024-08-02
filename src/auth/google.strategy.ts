import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';

require('dotenv').config();

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
    constructor(
        private usersService: UsersService,
    ) {
        super({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: `${process.env.HOST}/auth/google`,
            scope: ['email', 'profile'],
        });
    }

    async validate(accessToken: string, refreshToken: string, profile: Profile) {
        const { id, name, emails } = profile;

        if (!emails || emails.length === 0) {
            throw new UnauthorizedException('Google profile does not contain an email');
        }

        const providerId = id;
        const email = emails[0].value;

        const user: User = await this.usersService.findByEmailOrSave(
            email,
            name?.familyName + name?.givenName,
            providerId,
        );

        return user;
    }
}
