import { Controller }   from '@nestjs/common'
import { EventPattern } from '@nestjs/microservices'
import {
    AllPlayers,
    NpcAdded,
    NpcRemoved,
    NpcUpdate,
    PlayerEnteredMap,
    PlayerLeftMap,
    PlayerUpdate
}                       from '../../../../shared/events/map.events'
import { MapGateway }   from './map.gateway'
import { WORLD_PREFIX } from '../world.prefix'
import { Mob }          from '../../../../shared/phaser/mob'

@Controller()
export class MapController {

    maps: {
        [map: string]: {
            npcs: { [instanceId: number]: Mob },
            players: { [instanceId: number]: Mob }
        }
    } = {}

    constructor(
        private gateway: MapGateway
    ) {
    }

    @EventPattern(WORLD_PREFIX + PlayerEnteredMap.event)
    async onMapJoined(data: PlayerEnteredMap) {
        await this.gateway.playerJoin(data)
    }

    @EventPattern(WORLD_PREFIX + PlayerLeftMap.event)
    async onMapLeft(data: PlayerLeftMap) {
        await this.gateway.playerLeave(data)
    }

    @EventPattern(WORLD_PREFIX + AllPlayers.event)
    onAllPlayers(data: AllPlayers) {
        this.gateway.allPlayers(data)
    }

    @EventPattern(WORLD_PREFIX + NpcAdded.event + '.broadcast')
    onNpcAdded(data: NpcAdded) {
        this.gateway.server.to('map.' + data.map).emit(NpcAdded.event, data)
    }

    @EventPattern(WORLD_PREFIX + NpcRemoved.event + '.broadcast')
    onNpcRemoved(data: NpcRemoved) {
        this.gateway.server.to('map.' + data.map).emit(NpcRemoved.event, data)
    }

    @EventPattern(WORLD_PREFIX + PlayerUpdate.event)
    playerUpdate(data: PlayerUpdate) {
        this.maps[data.map]                                 = this.maps[data.map] || { players: {}, npcs: {} }
        this.maps[data.map].players[data.player.instanceId] = data.player
        this.gateway.server.to('map.' + data.map).emit(PlayerUpdate.event, data)
    }

    @EventPattern(WORLD_PREFIX + NpcUpdate.event)
    npcUpdate(data: NpcUpdate) {
        this.maps[data.map]                           = this.maps[data.map] || { players: {}, npcs: {} }
        this.maps[data.map].npcs[data.npc.instanceId] = data.npc
        this.gateway.server.to('map.' + data.map).emit(NpcUpdate.event, data)
    }
}
