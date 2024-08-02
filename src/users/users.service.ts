import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) { }

  async getUserById(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  async getUserByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }

  async findByEmailOrSave(email: string, username: string, providerId: string): Promise<User> {
    try {
      const foundUser = await this.getUserByEmail(email);
      return foundUser;
    } catch (error) {
      if (error instanceof NotFoundException) {
        const newUser = this.usersRepository.create({ email, username, providerId });
        return this.usersRepository.save(newUser);
      }
      throw error;
    }
  }
}