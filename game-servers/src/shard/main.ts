import {NestFactory}    from '@nestjs/core';
import {ShardModule}    from './shard.module';
import {RedisIoAdapter} from "../lib/redis-io.adapter";
import {PORTS}          from "../constants";
import {createDatabase} from "../lib/database/database.module";

async function bootstrap() {
    await createDatabase('shard');
    const app = await NestFactory.create(ShardModule);
    app.useWebSocketAdapter(new RedisIoAdapter(app));
    app.enableCors({
        origin     : true,
        credentials: true
    });

    await app.listen(PORTS.SHARD);
}

bootstrap();
