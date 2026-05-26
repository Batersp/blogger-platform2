import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailService } from './email.service';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        service: 'gmail',
        auth: {
          user: 'ismukovppavelp@gmail.com',
          pass: 'ukra cmlq pgnf cjkr',
        },
      },
      defaults: {
        from: `"Pavel" <${process.env.GOOGLE_MAIL_USER}>`,
      },
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class NotificationsModule {}
