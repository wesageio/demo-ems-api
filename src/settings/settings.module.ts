import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
// import { SettingsSchema } from './settings.model';
import { AuthModule } from '../auth/auth.module';
import { Settings } from './settings.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forFeature([Settings]),
    // MongooseModule.forFeature([{ name: 'Settings', schema: SettingsSchema }]),
    AuthModule,
  ],
  controllers: [SettingsController],
  providers: [SettingsService],
})
export class SettingsModule {}
