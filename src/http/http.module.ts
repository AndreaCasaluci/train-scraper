import { Module } from '@nestjs/common';
import { HttpService } from './http.service';
import { HttpModule as AxiosHttpModule } from '@nestjs/axios';

@Module({
  imports: [AxiosHttpModule],
  providers: [HttpService],
  exports: [HttpService],
})
export class HttpModule {}