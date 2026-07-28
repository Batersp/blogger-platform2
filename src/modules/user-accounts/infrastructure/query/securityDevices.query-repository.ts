import { Injectable } from '@nestjs/common';
import { SessionsViewDto } from '../../api/view-dto/sessions.view-dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { SecurityDevice } from '../../domain/securityDevice.entity';

@Injectable()
export class SecurityDevicesQueryRepository {
  constructor(
    @InjectRepository(SecurityDevice)
    private securityDeviceRepo: Repository<SecurityDevice>,
  ) {}

  async findActiveSessionsById(userId: string): Promise<SessionsViewDto[]> {
    const sessions = await this.securityDeviceRepo.find({
      where: {
        userId,
        exp: MoreThan(Math.floor(Date.now() / 1000)),
      },
    });

    return sessions.map((session) => SessionsViewDto.mapToView(session));
  }
}
