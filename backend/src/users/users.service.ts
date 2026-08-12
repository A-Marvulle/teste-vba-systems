import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import { QueryFailedError, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

const MYSQL_DUPLICATE_ENTRY_ERRNO = 1062;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const passwordHash = await argon2.hash(createUserDto.password);
    const user = this.usersRepository.create({
      name: createUserDto.name,
      email: createUserDto.email,
      passwordHash,
    });

    try {
      return await this.usersRepository.save(user);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { errno?: number })?.errno ===
          MYSQL_DUPLICATE_ENTRY_ERRNO
      ) {
        throw new ConflictException('E-mail já cadastrado');
      }
      throw error;
    }
  }

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findById(id: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }

  findByEmailWithPassword(email: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email })
      .getOne();
  }
}
