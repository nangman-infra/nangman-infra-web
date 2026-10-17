// A local Security API preview without starting unrelated CMS synchronization jobs.
const { resolve } = require('node:path');
const { Module } = require('@nestjs/common');
const { NestFactory } = require('@nestjs/core');
const { ConfigModule } = require('@nestjs/config');
const { SecurityModule } = require(
  resolve(__dirname, '../dist/modules/security/security.module.js'),
);
const { ResponseInterceptor } = require(
  resolve(__dirname, '../dist/common/interceptors/response.interceptor.js'),
);

class SecurityPreviewModule {}
Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true }),
    SecurityModule,
  ],
})(SecurityPreviewModule);

async function bootstrap() {
  const app = await NestFactory.create(SecurityPreviewModule);
  app.setGlobalPrefix('api/v1');
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.enableShutdownHooks();
  await app.listen(Number(process.env.PORT || 3333), '127.0.0.1');
}

bootstrap().catch(() => {
  console.error(
    'Security preview failed to start. Check the local configuration.',
  );
  process.exitCode = 1;
});
