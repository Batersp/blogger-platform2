import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  SecurityDevice,
  SecurityDeviceDocument,
  type SecurityDeviceModelType,
} from '../domain/securityDevice.entity';
import { DeleteResult } from 'mongoose';

@Injectable()
export class SecurityDevicesRepository {
  constructor(
    @InjectModel(SecurityDevice.name)
    private SecurityDeviceModel: SecurityDeviceModelType,
  ) {}

  async save(securityDevice: SecurityDeviceDocument) {
    await securityDevice.save();
  }

  async findCurrentSession(
    deviceId: string,
    iat: number,
  ): Promise<SecurityDeviceDocument | null> {
    return this.SecurityDeviceModel.findOne({ deviceId, iat });
  }

  async findSessionByDeviceId(
    deviceId: string,
  ): Promise<SecurityDeviceDocument | null> {
    return this.SecurityDeviceModel.findOne({ deviceId });
  }

  async deleteSession(deviceId: string): Promise<DeleteResult> {
    return this.SecurityDeviceModel.deleteOne({ deviceId });
  }

  async deleteAllSessionsExcludeCurrent(
    userId: string,
    deviceId: string,
  ): Promise<DeleteResult> {
    return this.SecurityDeviceModel.deleteMany({
      userId,
      deviceId: { $ne: deviceId },
    });
  }
}
