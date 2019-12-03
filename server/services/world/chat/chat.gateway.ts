import {SubscribeMessage, WebSocketGateway, WebSocketServer} from "@nestjs/websockets";
import {WorldConstants}                                      from "../../../lib/constants/world.constants";
import {Namespace, Server, Socket}                           from "socket.io";
import {GameCharacter}                                       from "../../../lib/interfaces/game-character";
import {
    ErrorMessage,
    GlobalMessage,
    LocalMessage,
    PrivateMessage,
    RegionMessage,
    TradeMessage,
    ZoneMessage
}                                                            from "./actions";
import {MapClient}                                           from "../../map/client/map.client";
import {WorldService}                                        from "../world.service";
import {ClientProxy}                                         from "@nestjs/microservices";
import {Inject}                                              from "@nestjs/common";
import {WORLD_PREFIX}                                        from "../world.prefix";
import {RedisNamespace}                                      from "../redis.namespace";
import {RedisSocket}                                         from "../redis.socket";

@WebSocketGateway({
    namespace   : 'world',
    pingInterval: WorldConstants.PING_INTERVAL,
    pingTimeout : WorldConstants.PING_TIMEOUT
})
export class ChatGateway {
    @WebSocketServer()
    server: RedisNamespace;


    constructor(
        @Inject('WORLD_CLIENT') private client: ClientProxy,
        private world: WorldService,
        private map: MapClient
    ) {

    }

    @SubscribeMessage(WORLD_PREFIX + LocalMessage.event)
    async localMessage(client: RedisSocket, message: string) {
        let character = this.world.sockets[client.id].character;
        let map       = this.world.getMapOf(client);
        if (character && map !== '') {
            let position = await this.map.getPlayer(character.id, map);
            this.client.emit(WORLD_PREFIX + LocalMessage.event, new LocalMessage(character, map, position.x, position.y, message));
        }
    }

    @SubscribeMessage(WORLD_PREFIX + ZoneMessage.event)
    zoneMessage(client: RedisSocket, message: string) {
        let character = this.world.sockets[client.id].character;
        let map       = this.world.getMapOf(client);
        if (character && map !== '') {
            this.client.emit(WORLD_PREFIX + ZoneMessage.event, new ZoneMessage(character, map, message));
        }
    }

    @SubscribeMessage(WORLD_PREFIX + RegionMessage.event)
    regionMessage(client: RedisSocket, message: string) {
        let character = this.world.sockets[client.id].character;
        let map       = this.world.getMapOf(client);
        if (character && map !== '') {
            this.client.emit(WORLD_PREFIX + RegionMessage.event, new ZoneMessage(character, map, message));
        }
    }

    @SubscribeMessage(WORLD_PREFIX + TradeMessage.event)
    tradeMessage(client: RedisSocket, message: string) {
        let character = this.world.sockets[client.id].character;
        let map       = this.world.getMapOf(client);
        if (character && map !== '') {
            this.client.emit(WORLD_PREFIX + TradeMessage.event, new TradeMessage(character, message));
        }
    }

    @SubscribeMessage(WORLD_PREFIX + GlobalMessage.event)
    globalMessage(client: RedisSocket, message: string) {
        let character = this.world.sockets[client.id].character;
        let map       = this.world.getMapOf(client);
        if (character && map !== '') {
            this.client.emit(WORLD_PREFIX + GlobalMessage.event, new GlobalMessage(character, message));
        }
    }

    @SubscribeMessage(WORLD_PREFIX + PrivateMessage.event)
    privateMessage(client: RedisSocket, data: { to: GameCharacter, message: string }) {
        let character = this.world.sockets[client.id].character;
        let map       = this.world.getMapOf(client);
        if (character && map !== '') {
            let sent = false;
            this.client.emit(WORLD_PREFIX + PrivateMessage.event, new PrivateMessage(character, data.to, data.message))
                .subscribe({
                    next(delivered) {
                        if (delivered) {
                            sent = true;
                        }
                    },
                    complete() {
                        if (!sent) {
                            client.emit(ErrorMessage.event, new ErrorMessage('Could not send private message to the specified user at this time.'));
                        }
                    }
                });
        }
    }
}