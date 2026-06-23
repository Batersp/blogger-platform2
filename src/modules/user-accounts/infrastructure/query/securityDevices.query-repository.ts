import { Injectable } from '@nestjs/common';
import { SessionsViewDto } from '../../api/view-dto/sessions.view-dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SecurityDevice } from '../../domain/securityDevice.entity';

@Injectable()
export class SecurityDevicesQueryRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async findActiveSessionsById(userId: string): Promise<SessionsViewDto[]> {
    const sessions: SecurityDevice[] = await this.dataSource.query(
      `SELECT * FROM "securityDevices"
       WHERE "userId" = $1 AND exp > $2`,
      [userId, Math.floor(Date.now() / 1000)],
    );

    return sessions.map((session) => SessionsViewDto.mapToView(session));
  }
}
