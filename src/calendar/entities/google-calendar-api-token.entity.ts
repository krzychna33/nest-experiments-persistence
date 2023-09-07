import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('google_api_token')
export class GoogleCalendarApiTokenEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  authorizationId: string;

  @Column({ nullable: true })
  access_token?: string;

  @Column({ nullable: true })
  refresh_token?: string;

  @Column({ nullable: true })
  id_token?: string;

  @Column({ nullable: true })
  scope?: string;

  @Column({ nullable: true, type: 'bigint' })
  expiry_date?: number;

  @Column({ nullable: true })
  token_type?: string;
}
