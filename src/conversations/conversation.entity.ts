import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.conversations)
  user: User;

  @Column()
  title: string;

  @Column()
  userMessage: string;

  @Column()
  aiMessage: string;

  @Column()
  language: string;

  @CreateDateColumn()
  createdAt: Date;
}
