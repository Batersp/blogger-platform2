import { Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';

@Injectable()
export class BcryptService {
  createHash(value: string): string {
    return bcrypt.hashSync(value, 12);
  }

  compareSync(value1: string, value2: string): boolean {
    return bcrypt.compareSync(value1, value2);
  }
}
