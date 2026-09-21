import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class TestingService {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async deleteAllData(): Promise<void> {
    await this.dataSource.query(`
      TRUNCATE TABLE
        "comment_like",
        "post_like",
        comments,
        posts,
        blogs,
        "email_confirmation_info",
        "password_recovery_info",
        "security_device",
        users,
        answer,
        game,
        "game_question",
        questions
      RESTART IDENTITY CASCADE
    `);
  }
}
