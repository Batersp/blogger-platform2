import { CreateSecurityDeviceDomainDto } from './dto/create-securityDevice.domain.dto';
import { UpdateSecurityDeviceDomainDto } from './dto/update-securityDevice.domain.dto';

export class SecurityDevice {
  userId: string;
  deviceId: string;
  iat: number;
  exp: number;
  deviceName: string;
  ip: string;
  createdAt: Date;
  updatedAt: Date;

  static createInstance(dto: CreateSecurityDeviceDomainDto): SecurityDevice {
    const { userId, deviceId, iat, exp, deviceName, ip } = dto;
    const securityDevice = new this();
    securityDevice.userId = userId;
    securityDevice.deviceId = deviceId;
    securityDevice.iat = iat;
    securityDevice.exp = exp;
    securityDevice.deviceName = deviceName;
    securityDevice.ip = ip;

    return securityDevice;
  }

  update(dto: UpdateSecurityDeviceDomainDto) {
    const { iat, exp, ip } = dto;
    this.iat = iat;
    this.exp = exp;
    this.ip = ip;
  }
}
