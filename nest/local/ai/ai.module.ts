import { Module }          from '@nestjs/common'
import { ClientModule }    from '../../client/client.module'
import { MapClientModule } from '../map/client/map-client.module'
import { AiController }    from './ai.controller'
import { AiEmitter }       from './ai.emitter'
import { NpcService }      from './npc.service'

@Module({
    imports    : [
        ClientModule,
        MapClientModule
    ],
    controllers: [AiController],
    providers  : [AiEmitter, NpcService]
})
export class AiModule {

}
