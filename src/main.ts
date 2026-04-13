import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {ValidationPipe} from '@nestjs/common';

async function bootstrap() {
  
  const app = await NestFactory.create(AppModule);
    app.enableCors({
    origin: '*', // Permitir solicitudes desde cualquier origen
    });
  app.useGlobalPipes(new ValidationPipe());
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Servidor escuchando en el puerto ${port}`);
}
bootstrap();
