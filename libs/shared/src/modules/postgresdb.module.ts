import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        console.log(__dirname + '/../**/*.entity.{js,ts}');
        return {
          type: 'postgres',
          url: configService.get('POSTGRES_URI'),
          entities: [__dirname + '/../**/*.entity.{js,ts}'],
          autoLoadEntities: true,
          logging: false,
          synchronize: false,
          migrationsTableName: 'typeorm_migrations',
          migrationsRun: false,
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class PostgresDBModule {}
