import { CreateSecurityDeviceDomainDto } from './dto/create-securityDevice.domain.dto';
import { UpdateSecurityDeviceDomainDto } from './dto/update-securityDevice.domain.dto';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { BaseEntity } from '../../../core/entities/base.entity';
import { User } from './user.entity';

@Entity()
export class SecurityDevice extends BaseEntity {
  @PrimaryColumn({ type: 'varchar', unique: true })
  deviceId: string;

  @Column({ type: 'int' })
  iat: number;

  @Column({ type: 'int' })
  exp: number;

  @Column({ type: 'varchar' })
  deviceName: string;

  @Column({ type: 'varchar' })
  ip: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, (user) => user.securityDevices, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  static createInstance(dto: CreateSecurityDeviceDomainDto): SecurityDevice {
    const { userId, deviceId, iat, exp, deviceName, ip } = dto;
    const securityDevice = new SecurityDevice();
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
