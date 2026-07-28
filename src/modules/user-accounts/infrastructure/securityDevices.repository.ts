import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SecurityDevice } from '../domain/securityDevice.entity';

@Injectable()
export class SecurityDevicesRepository {
  constructor(
    @InjectRepository(SecurityDevice)
    private securityDeviceRepo: Repository<SecurityDevice>,
  ) {}

  async save(device: SecurityDevice): Promise<void> {
    await this.securityDeviceRepo.save(device);
  }

  async findCurrentSession(
    deviceId: string,
    iat: number,
  ): Promise<SecurityDevice | null> {
    return this.securityDeviceRepo.findOne({
      where: { deviceId, iat },
    });
  }

  async findSessionByDeviceId(
    deviceId: string,
  ): Promise<SecurityDevice | null> {
    return this.securityDeviceRepo.findOne({
      where: { deviceId },
    });
  }

  async deleteSession(deviceId: string): Promise<void> {
    await this.securityDeviceRepo.delete({ deviceId });
  }

  async deleteAllSessionsExcludeCurrent(
    userId: string,
    deviceId: string,
  ): Promise<void> {
    await this.securityDeviceRepo
      .createQueryBuilder()
      .delete()
      .where('userId = :userId', { userId })
      .andWhere('deviceId != :deviceId', { deviceId })
      .execute();
  }

  async deleteAllByUserId(userId: string): Promise<void> {
    await this.securityDeviceRepo.delete({ userId });
  }
}
