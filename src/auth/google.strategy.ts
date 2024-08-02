import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';

require('dotenv').config();

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
    constructor(private usersService: UsersService) {

        super({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: 'http://localhost:3000/auth/google',
            scope: ['email', 'profile'],
        });
    }

    async validate(accessToken: string, refreshToken: string, profile: Profile) {
        const { id, name, emails } = profile;
        console.log(profile);
        console.log(accessToken);
        console.log(refreshToken);

        const email = emails[0].value;
        const username = name.familyName + name.givenName
        const providerId = id;

        const user: User = await this.usersService.findByEmailOrSave(
            email,
            username,
            providerId,
        );

        return user;
    }
}