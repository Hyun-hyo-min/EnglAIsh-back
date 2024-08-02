import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Conversation } from 'src/conversations/conversation.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  username: string;

  @Column({ type: 'int', default: 0 })
  messageCount: number;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ nullable: true })
  providerId?: string;

  @OneToMany(() => Conversation, conversation => conversation.user)
  conversations: Conversation[];
}
