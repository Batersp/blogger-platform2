import { Injectable } from '@nestjs/common';
import { CreateSessionDto } from '../dto/createSession.dto';
import { InjectModel } from '@nestjs/mongoose';
import {
  SecurityDevice,
  type SecurityDeviceModelType,
} from '../domain/securityDevice.entity';
import { SecurityDevicesRepository } from '../infrastructure/securityDevices.repository';

@Injectable()
export class SecurityDeviceService {
  constructor(
    @InjectModel(SecurityDevice.name)
    private SecurityDeviceModel: SecurityDeviceModelType,
    private securityDevicesRepository: SecurityDevicesRepository,
  ) {}

  async createSession(dto: CreateSessionDto) {
    const session = this.SecurityDeviceModel.createInstance(dto);
    await this.securityDevicesRepository.save(session);
  }
}
