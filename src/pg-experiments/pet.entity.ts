import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class PetEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  ownerId: string;
}
