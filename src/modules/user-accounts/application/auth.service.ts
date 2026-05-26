import { BadRequestException, Injectable } from '@nestjs/common';
import { UserContextDto } from '../guards/dto/user-context.dto';
import { UsersRepository } from '../infrastructure/users.repository';
import { BcryptService } from '../../../core/services/bcrypt.service';
import { JwtService } from '@nestjs/jwt';
import { ConfirmRegistrationDto } from '../dto/confirmRegistration.dto';
import { ResendConfirmationCodeDto } from '../dto/resendConfirmationCode.dto';
import { randomUUID } from 'node:crypto';
import { add } from 'date-fns';
import { EmailService } from '../../notifications/email.service';
import { PasswordRecoveryDto } from '../dto/passwordRecovery.dto';
import { CreateNewPasswordDto } from '../dto/createNewPassword.dto';
import { DomainException } from '../../../core/exceptions/domain-exceptions';

@Injectable()
export class AuthService {
  constructor(
    private usersRepository: UsersRepository,
    private bcryptService: BcryptService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async validateUser(
    login: string,
    password: string,
  ): Promise<UserContextDto | null> {
    const user = await this.usersRepository.findByLogin(login);
    if (!user) {
      return null;
    }

    const isPasswordValid = await this.bcryptService.compareSync(
      password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      return null;
    }

    return { id: user._id.toString() };
  }

  async login(
    userId: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = this.jwtService.sign({ id: userId });
    const refreshToken = this.jwtService.sign(
      { id: userId },
      { secret: 'refresh-secret', expiresIn: '30d' },
    );
    return {
      accessToken,
      refreshToken,
    };
  }

  async confirmRegistration(dto: ConfirmRegistrationDto) {
    const user = await this.usersRepository.findByConfirmationCode(dto.code);

    if (!user) {
      throw DomainException.badRequest([
        { message: 'Code is invalid', field: 'code' },
      ]);
    }
    if (user.emailConfirmation!.expirationDate < new Date()) {
      throw DomainException.badRequest([
        { message: 'Code has expired', field: 'code' },
      ]);
    }
    if (user.emailConfirmation!.isConfirmed) {
      throw DomainException.badRequest([
        { message: 'Email already confirmed', field: 'code' },
      ]);
    }

    user.confirmCode();
    await this.usersRepository.save(user);
  }

  async resendConfirmationCode(dto: ResendConfirmationCodeDto) {
    const { email } = dto;
    const user = await this.usersRepository.findByEmail(email);
    if (!user) {
      throw DomainException.badRequest([
        {
          message: 'user with this email not found',
          field: 'email',
        },
      ]);
    }
    if (user.emailConfirmation?.isConfirmed) {
      throw DomainException.badRequest([
        {
          message: 'Email already confirmed',
          field: 'email',
        },
      ]);
    }

    const newCode = randomUUID();
    const newExpiration = add(new Date(), {
      hours: 1,
      minutes: 30,
    });
    user.updateConfirmationCode(newCode, newExpiration);
    await this.usersRepository.save(user);
    await this.emailService.sendConfirmationEmail(dto.email, newCode);
  }

  async passwordRecovery(dto: PasswordRecoveryDto) {
    const { email } = dto;
    const user = await this.usersRepository.findByEmail(email);
    if (!user) return;
    const code = randomUUID();
    const expirationDate = add(new Date(), { hours: 1 });

    user.savePasswordRecoveryCode(code, expirationDate);
    await this.usersRepository.save(user);
    await this.emailService.sendPasswordRecovery(email, code);
  }

  async createNewPassword(dto: CreateNewPasswordDto) {
    const { newPassword, recoveryCode } = dto;
    const user = await this.usersRepository.findByRecoveryCode(recoveryCode);
    if (!user) throw new BadRequestException();
    if (!user.passwordRecovery) throw new BadRequestException();
    if (user.passwordRecovery.expirationDate < new Date())
      throw new BadRequestException();

    const passHash = await this.bcryptService.createHash(newPassword);
    user.updatePassword(passHash);
    await this.usersRepository.save(user);
  }
}
