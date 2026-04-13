import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  async sendVerificationEmail(email: string, token: string) {
    const url = `http://localhost:3000/auth/verify-email?token=${token}`;

    await this.transporter.sendMail({
      to: email,
      subject: 'Verifica tu cuenta',
      html: `<p>Haz clic para verificar tu cuenta:</p>
             <a href="${url}">${url}</a>`,
    });
  }

  async sendResetPasswordEmail(email: string, token: string) {
    const url = `http://localhost:3000/auth/reset-password?token=${token}`;

    await this.transporter.sendMail({
      to: email,
      subject: 'Recuperar contraseña',
      html: `<p>Haz clic para cambiar tu contraseña:</p>
             <a href="${url}">${url}</a>`,
    });
  }
}