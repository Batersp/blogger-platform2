import {
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  VersionColumn,
} from 'typeorm';

export class BaseEntity {
  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;

  @VersionColumn()
  version: number;
}

export class BaseDBEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
}
