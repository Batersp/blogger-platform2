import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '../domain/user.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

type UserSqlRow = {
  id: string;
  login: string;
  email: string;
  passwordHash: string;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  // из userEmailConfirmationInfo
  confirmationCode: string | null;
  confirmationExpirationDate: Date | null;
  isConfirmed: boolean | null;
  // из userPasswordRecoveryInfo
  recoveryCode: string | null;
  recoveryExpirationDate: Date | null;
};

@Injectable()
export class UsersRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  // Маппинг плоской строки из SQL в доменный объект
  private mapToDomain(row: UserSqlRow): User {
    const user = new User();
    user.id = row.id;
    user.login = row.login;
    user.email = row.email;
    user.passwordHash = row.passwordHash;
    user.deletedAt = row.deletedAt;
    user.createdAt = row.createdAt;
    user.updatedAt = row.updatedAt;

    user.emailConfirmation = row.confirmationCode
      ? {
          confirmationCode: row.confirmationCode,
          expirationDate: row.confirmationExpirationDate!,
          isConfirmed: row.isConfirmed!,
        }
      : null;

    user.passwordRecovery = row.recoveryCode
      ? {
          recoveryCode: row.recoveryCode,
          expirationDate: row.recoveryExpirationDate!,
        }
      : null;

    return user;
  }

  private getUserWithRelationsQuery(whereClause: string) {
    return `
      SELECT 
        u.id, u.login, u.email, u."passwordHash", u."deletedAt", u."createdAt", u."updatedAt",
        e."confirmationCode", e."expirationDate" as "confirmationExpirationDate", e."isConfirmed",
        r."recoveryCode", r."expirationDate" as "recoveryExpirationDate"
      FROM users u
      LEFT JOIN "userEmailConfirmationInfo" e ON e."userId" = u.id
      LEFT JOIN "userPasswordRecoveryInfo" r ON r."userId" = u.id
      ${whereClause}
    `;
  }

  async findByLogin(login: string): Promise<User | null> {
    const [row]: [UserSqlRow | null] = await this.dataSource.query(
      this.getUserWithRelationsQuery(
        `WHERE u.login = $1 AND u."deletedAt" IS NULL`,
      ),
      [login],
    );
    return row ? this.mapToDomain(row) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const [row]: [UserSqlRow | null] = await this.dataSource.query(
      this.getUserWithRelationsQuery(
        `WHERE u.email = $1 AND u."deletedAt" IS NULL`,
      ),
      [email],
    );
    return row ? this.mapToDomain(row) : null;
  }

  async findById(id: string): Promise<User | null> {
    const [row]: [UserSqlRow | null] = await this.dataSource.query(
      this.getUserWithRelationsQuery(
        `WHERE u.id = $1 AND u."deletedAt" IS NULL`,
      ),
      [id],
    );
    return row ? this.mapToDomain(row) : null;
  }

  async findByConfirmationCode(code: string): Promise<User | null> {
    const [row]: [UserSqlRow | null] = await this.dataSource.query(
      this.getUserWithRelationsQuery(`WHERE e."confirmationCode" = $1`),
      [code],
    );
    return row ? this.mapToDomain(row) : null;
  }

  async findByRecoveryCode(code: string): Promise<User | null> {
    const [row]: [UserSqlRow | null] = await this.dataSource.query(
      this.getUserWithRelationsQuery(`WHERE r."recoveryCode" = $1`),
      [code],
    );
    return row ? this.mapToDomain(row) : null;
  }

  async create(user: User): Promise<void> {
    const [row]: [UserSqlRow] = await this.dataSource.query(
      `INSERT INTO users (login, email, "passwordHash", "deletedAt", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, NULL, NOW(), NOW())
     RETURNING id`,
      [user.login, user.email, user.passwordHash],
    );
    user.id = row.id;
  }

  async save(user: User): Promise<void> {
    await this.dataSource.query(
      `UPDATE users SET 
        login = $1, email = $2, "passwordHash" = $3, "deletedAt" = $4, "updatedAt" = NOW()
       WHERE id = $5`,
      [user.login, user.email, user.passwordHash, user.deletedAt, user.id],
    );

    if (user.emailConfirmation) {
      // UPSERT — вставит если нет, обновит если есть
      await this.dataSource.query(
        `INSERT INTO "userEmailConfirmationInfo" ("userId", "confirmationCode", "expirationDate", "isConfirmed")
         VALUES ($1, $2, $3, $4)
         ON CONFLICT ("userId") DO UPDATE SET
           "confirmationCode" = $2,
           "expirationDate" = $3,
           "isConfirmed" = $4`,
        [
          user.id,
          user.emailConfirmation.confirmationCode,
          user.emailConfirmation.expirationDate,
          user.emailConfirmation.isConfirmed,
        ],
      );
    }

    if (user.passwordRecovery) {
      await this.dataSource.query(
        `INSERT INTO "userPasswordRecoveryInfo" ("userId", "recoveryCode", "expirationDate")
         VALUES ($1, $2, $3)
         ON CONFLICT ("userId") DO UPDATE SET
           "recoveryCode" = $2,
           "expirationDate" = $3`,
        [
          user.id,
          user.passwordRecovery.recoveryCode,
          user.passwordRecovery.expirationDate,
        ],
      );
    }
  }

  async findOrNotFoundFail(id: string): Promise<User> {
    const user = await this.findById(id);

    if (!user) {
      throw new NotFoundException('user not found');
    }

    return user;
  }
}
