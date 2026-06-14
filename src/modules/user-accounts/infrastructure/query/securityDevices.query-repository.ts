import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  SecurityDevice,
  type SecurityDeviceModelType,
} from '../../domain/securityDevice.entity';
import { SessionsViewDto } from '../../api/view-dto/sessions.view-dto';

@Injectable()
export class SecurityDevicesQueryRepository {
  constructor(
    @InjectModel(SecurityDevice.name)
    private SecurityDeviceModel: SecurityDeviceModelType,
  ) {}

  async findActiveSessionsById(userId: string): Promise<SessionsViewDto[]> {
    const sessions = await this.SecurityDeviceModel.find({
      userId,
      exp: { $gt: Math.floor(Date.now() / 1000) },
    });

    return sessions.map((session) => SessionsViewDto.mapToView(session));
  }
}
