import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MarketExtraSchema } from './market.validator';

@Entity()
export class Market {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column()
  teaser!: string;

  @Column()
  address!: string;

  @Column()
  city!: string;

  @Column()
  state!: string;

  @Column()
  country!: string;

  @Column('jsonb')
  location!: {
    lat: number;
    long: number;
  };

  @Column()
  zip!: string;

  @Column('text', { array: true, default: [] })
  products!: string[];

  @Column('jsonb', { default: [] })
  images!: { url: string; description: string; key: string }[];

  /*
   * When querying the nearest markets for a given geo-coordinate,
   * this will be the distance in kilometers from the
   * given geo-coordinate. Typically not set otherwise. */
  @Column({
    type: 'float',
    select: false,
    update: false,
    insert: false,
    nullable: true,
  })
  distance?: number | null;

  @BeforeUpdate()
  @BeforeInsert()
  validateExtraData() {
    const result = MarketExtraSchema.safeParse(this);
    if (!result.success)
      throw new Error(
        `Invalid extra data in market entity. This is most likely a programming issue. Fix the code. zod error: ${JSON.stringify(
          result.error,
        )}`,
      );
  }
}
