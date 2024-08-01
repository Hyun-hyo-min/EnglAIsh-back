import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.conversations)
  user: User;

  @Column()
  title: string;

  @Column('json')
  messages: string[];

  @Column()
  language: string;

  @Column({ type: 'int', default: 0 })
  messageCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: false })
  isCompleted: boolean;

  @Column({ nullable: true })
  completedAt: Date;

  @Column({ type: 'float', default: 0 })
  userScore: number;
}
