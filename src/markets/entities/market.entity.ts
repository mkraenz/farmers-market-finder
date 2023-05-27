import { Column, Entity, Index, Point, PrimaryGeneratedColumn } from 'typeorm';

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

  @Column('geometry', {
    spatialFeatureType: 'Point',
  })
  @Index({ spatial: true })
  location!: Point;

  @Column()
  zip!: string;

  @Column('text', { array: true, default: [] })
  products!: string[];

  // distance?: number;

  // TODO somehow make this work https://pietrzakadrian.com/blog/virtual-column-solutions-for-typeorm
  //
  // .addSelect(
  //   'ST_DistanceSphere(point, ST_MakePoint(:long, :lat))',
  //   'distance',
  // )
  /**
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
}
