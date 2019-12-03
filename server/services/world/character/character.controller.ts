import {Controller, Logger}                    from '@nestjs/common';
import {EventPattern}                          from "@nestjs/microservices";
import {CharacterLoggedIn, CharacterLoggedOut} from "../../character/actions";
import {CharacterGateway}                      from "./character.gateway";
import {MapOnline}                             from "../../map/actions";
import {WORLD_PREFIX}                          from "../world.prefix";

@Controller()
export class CharacterController {


    constructor(
        private logger: Logger,
        private gateway: CharacterGateway
    ) {

    }

    @EventPattern(WORLD_PREFIX + MapOnline.event)
    async onMapOnline() {
        await this.gateway.sendCharacters();
    }

    @EventPattern(WORLD_PREFIX + CharacterLoggedIn.event)
    onCharacterJoin(data: CharacterLoggedIn) {
        console.log('Recieve Event');
        this.logger.log(data.name + ' is online.');
        this.gateway.server.emit(CharacterLoggedIn.event, data);
    }

    @EventPattern(WORLD_PREFIX + CharacterLoggedOut.event)
    onCharacterLeave(data: CharacterLoggedOut) {
        this.logger.log(data.name + ' is offline.');
        this.gateway.server.emit(CharacterLoggedOut.event, data);
    }
}
