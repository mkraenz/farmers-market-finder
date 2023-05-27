import { Column, Entity, Point, PrimaryGeneratedColumn } from 'typeorm';

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

  @Column('geometry', { nullable: true })
  point: Point | null = null;

  @Column()
  zip!: string;

  @Column('text', { array: true, default: [] })
  products!: string[];
}
