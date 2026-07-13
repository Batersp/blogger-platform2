import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class TestingService {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async deleteAllData(): Promise<void> {
    await this.dataSource.query(`
      TRUNCATE TABLE
        "commentLikes",
        "postLikes",
        comments,
        posts,
        blogs,
        "userEmailConfirmationInfo",
        "userPasswordRecoveryInfo",
        "securityDevices",
        users
      RESTART IDENTITY CASCADE
    `);
  }
}
