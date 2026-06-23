import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SecurityDevice } from '../domain/securityDevice.entity';

@Injectable()
export class SecurityDevicesRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  private mapToDomain(device: SecurityDevice): SecurityDevice {
    const securityDevice = new SecurityDevice();
    securityDevice.userId = device.userId;
    securityDevice.deviceId = device.deviceId;
    securityDevice.iat = device.iat;
    securityDevice.exp = device.exp;
    securityDevice.deviceName = device.deviceName;
    securityDevice.ip = device.ip;
    securityDevice.createdAt = device.createdAt;
    securityDevice.updatedAt = device.updatedAt;
    return securityDevice;
  }

  async create(device: SecurityDevice): Promise<void> {
    await this.dataSource.query(
      `INSERT INTO "securityDevices" ("userId", "deviceId", iat, exp, "deviceName", ip, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
      [
        device.userId,
        device.deviceId,
        device.iat,
        device.exp,
        device.deviceName,
        device.ip,
      ],
    );
  }

  async save(device: SecurityDevice): Promise<void> {
    await this.dataSource.query(
      `UPDATE "securityDevices" SET
        iat = $1, exp = $2, ip = $3, "updatedAt" = NOW()
       WHERE "deviceId" = $4`,
      [device.iat, device.exp, device.ip, device.deviceId],
    );
  }

  async findCurrentSession(
    deviceId: string,
    iat: number,
  ): Promise<SecurityDevice | null> {
    const [row]: [SecurityDevice | null] = await this.dataSource.query(
      `SELECT * FROM "securityDevices" WHERE "deviceId" = $1 AND iat = $2`,
      [deviceId, iat],
    );
    return row ? this.mapToDomain(row) : null;
  }

  async findSessionByDeviceId(
    deviceId: string,
  ): Promise<SecurityDevice | null> {
    const [row]: [SecurityDevice | null] = await this.dataSource.query(
      `SELECT * FROM "securityDevices" WHERE "deviceId" = $1`,
      [deviceId],
    );
    return row ? this.mapToDomain(row) : null;
  }

  async deleteSession(deviceId: string): Promise<void> {
    await this.dataSource.query(
      `DELETE FROM "securityDevices" WHERE "deviceId" = $1`,
      [deviceId],
    );
  }

  async deleteAllSessionsExcludeCurrent(
    userId: string,
    deviceId: string,
  ): Promise<void> {
    await this.dataSource.query(
      `DELETE FROM "securityDevices" WHERE "userId" = $1 AND "deviceId" != $2`,
      [userId, deviceId],
    );
  }
}
