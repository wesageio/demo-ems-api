import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { RulesController } from './rules.controller';
import { RulesService } from './rules.service';
import { RulesSchema } from './rules.model';
import { PropertiesModule } from '../properties/properties.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Rules', schema: RulesSchema }]),
    PropertiesModule,
  ],
  controllers: [RulesController],
  providers: [RulesService],
  exports: [RulesService],
})
export class RulesModule {}
