import { SecurityDeviceDocument } from '../../domain/securityDevice.entity';
import { Utils } from '../../../../core/utils/utils';

export class SessionsViewDto {
  ip: string;
  title: string;
  lastActiveDate: string;
  deviceId: string;

  static mapToView(session: SecurityDeviceDocument): SessionsViewDto {
    const dto = new SessionsViewDto();

    dto.ip = session.ip;
    dto.title = session.deviceName;
    dto.lastActiveDate = Utils.convertJwtDateToISO(session.iat);
    dto.deviceId = session.deviceId;

    return dto;
  }
}
