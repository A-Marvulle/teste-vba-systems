import { Global, Module } from '@nestjs/common';
import { LeraBoxHttpService } from './lera-box-http.service';

@Global()
@Module({
  providers: [LeraBoxHttpService],
  exports: [LeraBoxHttpService],
})
export class LeraBoxHttpModule {}
