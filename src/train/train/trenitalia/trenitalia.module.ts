import { Module } from '@nestjs/common';
import { TrenitaliaService } from './trenitalia.service';
import { TrenitaliaController } from './trenitalia.controller';
import {HttpModule} from "../../../http/http.module";

@Module({
  imports: [HttpModule],
  providers: [TrenitaliaService],
  controllers: [TrenitaliaController],
  exports: [TrenitaliaService]
})
export class TrenitaliaModule {}
