import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Conversation } from 'src/conversations/conversation.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  username: string;

  @Column({ type: 'int', default: 0 })
  messageCount: number;

  @Column({ type: 'timestamp', nullable: true })
  countResetAt: Date | null;

  @Column({ type: 'int', default: 1 })
  conversationLevel: number;

  @Column({ type: 'int', default: 1 })
  grammarLevel: number;

  @Column({ type: 'int', default: 1 })
  vocabularyLevel: number;

  @Column({ type: 'int', default: 0 })
  totalConversations: number;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ nullable: true })
  providerId?: string;

  @OneToMany(() => Conversation, (conversation) => conversation.user)
  conversations: Conversation[];
}
