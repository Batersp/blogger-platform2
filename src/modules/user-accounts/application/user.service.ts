import { Injectable } from '@nestjs/common';
import { User, type UserModelType } from '../domain/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { UsersRepository } from '../infrastructure/users.repository';
import { BcryptService } from '../../../core/services/bcrypt.service';
import { CreateUserDto } from '../dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private UserModel: UserModelType,
    private usersRepository: UsersRepository,
    private bcryptService: BcryptService,
  ) {}

  async createUser(dto: CreateUserDto): Promise<string> {
    const { login, email, password } = dto;
    const passwordHash = this.bcryptService.createHash(password);
    const user = this.UserModel.createInstance({
      login,
      email,
      passwordHash,
    });

    await this.usersRepository.save(user);
    return user._id.toString();
  }

  async deleteUser(id: string) {
    const user = await this.usersRepository.findOrNotFoundFail(id);

    user.makeDeleted();

    await this.usersRepository.save(user);
  }
}
