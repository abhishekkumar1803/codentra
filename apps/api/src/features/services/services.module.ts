import { Module } from '@nestjs/common';
import { RolesGuard } from '../../common/guards/roles.guard';
import { RazorpayModule } from '../razorpay/razorpay.module';
import { MentorController } from './mentor.controller';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';

@Module({
  imports: [RazorpayModule],
  controllers: [ServicesController, MentorController],
  providers: [ServicesService, RolesGuard],
  exports: [ServicesService],
})
export class ServicesModule {}
