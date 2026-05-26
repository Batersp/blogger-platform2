import { Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';

@Injectable()
export class BcryptService {
  async createHash(value: string): Promise<string> {
    return bcrypt.hashSync(value, 12);
  }

  async compareSync(value1: string, value2: string): Promise<boolean> {
    return bcrypt.compareSync(value1, value2);
  }
}
