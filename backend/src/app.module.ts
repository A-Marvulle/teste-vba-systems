import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { join } from 'path';
import { GatewayModule } from './gateway/gateway.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(process.cwd(), '../.env'),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('MYSQL_HOST', 'localhost'),
        port: config.get<number>('MYSQL_PORT', 3306),
        username: config.get<string>('MYSQL_USER'),
        password: config.get<string>('MYSQL_PASSWORD'),
        database: config.get<string>('MYSQL_DATABASE'),
        entities: [join(__dirname, '**/*.entity{.ts,.js}')],
        synchronize: true,
      }),
    }),
    UsersModule,
    GatewayModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
