import { DataSource } from 'typeorm';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';

const configService = new ConfigService();

const DEFAULT_HOST = 'localhost';
const DEFAULT_PORT = 5432;
const DEFAULT_USERNAME = 'postgres';
const DEFAULT_PASSWORD = '1111';
const DEFAULT_DATABASE = 'project-managment';

export const connectionSource = new DataSource({
  type: 'postgres',
  host: configService.get('POSTGRES_HOST') || DEFAULT_HOST,
  port: configService.get('POSTGRES_PORT') || DEFAULT_PORT,
  username: configService.get('POSTGRES_USERNAME') || DEFAULT_USERNAME,
  password: configService.get('POSTGRES_PASSWORD') || DEFAULT_PASSWORD,
  database: configService.get('POSTGRES_DB') || DEFAULT_DATABASE,
  logging: true,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [join(__dirname, '/../../../../', 'migrations/**/*{.ts,.js}')],
  synchronize: false,
  migrationsTableName: 'typeorm_migrations',
  migrationsRun: false,
});
