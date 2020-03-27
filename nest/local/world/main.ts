import { NestFactory }    from '@nestjs/core'
import { WorldModule }    from './world.module'
import { environment }    from '../../lib/config/environment'
import { Logger }         from '@nestjs/common'
import { WorldConstants } from '../../lib/constants/world.constants'
import { createDatabase } from '../../lib/config/db.config'

const logger = new Logger(WorldConstants.NAME + ' Server')

async function bootstrap() {
    await createDatabase(WorldConstants.DB_NAME + process.env.NODE_APP_INSTANCE, true)
    const app = await NestFactory.create(WorldModule)
    app.connectMicroservice({
        transport: environment.microservice.transport,
        options  : {
            ...environment.microservice.global,
            name : WorldConstants.NAME + ' Server',
            queue: WorldConstants.CONSTANT + '.' + process.env.NODE_APP_INSTANCE
        }
    })
    app.connectMicroservice({
        transport: environment.microservice.transport,
        options  : {
            ...environment.microservice.local,
            name : WorldConstants.NAME + ' Server',
            queue: WorldConstants.CONSTANT + '.' + process.env.NODE_APP_INSTANCE
        }
    })
    app.enableCors({
        origin     : true,
        credentials: true
    })
    app.useLogger(logger)
    await app.enableShutdownHooks()
    await app.startAllMicroservices()
    await app.listen(environment.servers.world.port)
}

bootstrap().catch(e => console.error(e))
