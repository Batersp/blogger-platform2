import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { CreateSecurityDeviceDomainDto } from './dto/create-securityDevice.domain.dto';
import { UpdateSecurityDeviceDomainDto } from './dto/update-securityDevice.domain.dto';

@Schema({ timestamps: true })
export class SecurityDevice {
  @Prop({ type: String, required: true, minlength: 1, maxlength: 100 })
  userId: string;

  @Prop({
    type: String,
    required: true,
    unique: true,
    minlength: 1,
    maxlength: 1000,
  })
  deviceId: string;

  @Prop({
    type: Number,
    required: true,
    minlength: 1,
    maxlength: 100,
  })
  iat: number;

  @Prop({
    type: Number,
    required: true,
    minlength: 1,
    maxlength: 100,
  })
  exp: number;

  @Prop({
    type: String,
    required: true,
    minlength: 1,
    maxlength: 1000,
  })
  deviceName: string;

  @Prop({
    type: String,
    required: true,
    minlength: 1,
    maxlength: 100,
  })
  ip: string;

  createdAt: Date;
  updatedAt: Date;

  static createInstance(
    dto: CreateSecurityDeviceDomainDto,
  ): SecurityDeviceDocument {
    const { userId, deviceId, iat, exp, deviceName, ip } = dto;
    const securityDevice = new this();
    securityDevice.userId = userId;
    securityDevice.deviceId = deviceId;
    securityDevice.iat = iat;
    securityDevice.exp = exp;
    securityDevice.deviceName = deviceName;
    securityDevice.ip = ip;

    return securityDevice as SecurityDeviceDocument;
  }

  update(dto: UpdateSecurityDeviceDomainDto) {
    const { iat, exp, ip } = dto;
    this.iat = iat;
    this.exp = exp;
    this.ip = ip;
  }
}

export const SecurityDeviceSchema =
  SchemaFactory.createForClass(SecurityDevice);
SecurityDeviceSchema.loadClass(SecurityDevice);
export type SecurityDeviceDocument = HydratedDocument<SecurityDevice>;
export type SecurityDeviceModelType = Model<SecurityDeviceDocument> &
  typeof SecurityDevice;
