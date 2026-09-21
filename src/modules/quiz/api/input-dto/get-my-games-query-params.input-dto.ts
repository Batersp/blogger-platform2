import { IsOptional, IsIn } from 'class-validator';
import { BaseQueryParams } from '../../../../core/dto/base.query-params.input-dto';

export enum MyGamesSortBy {
  PairCreatedDate = 'pairCreatedDate',
  Status = 'status',
}

export class GetMyGamesQueryParams extends BaseQueryParams {
  @IsOptional()
  @IsIn(Object.values(MyGamesSortBy))
  sortBy: MyGamesSortBy = MyGamesSortBy.PairCreatedDate;
}
