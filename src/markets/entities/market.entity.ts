import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Market {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  address!: string;

  @Column()
  city!: string;

  @Column()
  state!: string;

  @Column()
  country!: string;

  @Column({ type: 'jsonb' })
  location!: {
    lat: number;
    long: number;
  };

  @Column()
  zip!: string;

  @Column('text', { array: true, default: [] })
  products!: string[];
}
