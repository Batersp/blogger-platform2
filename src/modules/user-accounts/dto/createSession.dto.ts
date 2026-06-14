export class CreateSessionDto {
  userId: string;
  deviceId: string;
  iat: number;
  exp: number;
  deviceName: string;
  ip: string;
}
