import { NpcConfig }           from '../../../shared/interfaces/npc-config'
import { Observable, Subject } from 'rxjs'
import { filter, takeUntil }   from 'rxjs/operators'
import { Directions }          from '../../../shared/phaser/directions'
import { Mob }                 from '../../../shared/phaser/mob'
import { Repository }          from 'typeorm'
import { Distance }            from './entities/distance'

export class DistanceCalculator {
    stop = new Subject()

    directions: Directions = { down: false, left: false, right: false, up: false }

    position = {
        x: 0,
        y: 0
    }

    constructor(private config: NpcConfig, private repo: Repository<Distance>) {
        this.position.x = config.position[0]
        this.position.y = config.position[1]
    }

    start(serverStop: Subject<any>, npcUpdate: Observable<Mob>, playerUpdate: Observable<Mob>, playerChangedMap: Observable<number>) {
        npcUpdate.pipe(takeUntil(this.stop), takeUntil(serverStop))
                 .pipe(filter(mob => mob.map === this.config.map))
                 .subscribe(mob => this.npcUpdate(mob))
        playerUpdate.pipe(takeUntil(this.stop), takeUntil(serverStop))
                    .pipe(filter(mob => mob.map === this.config.map))
                    .subscribe(mob => this.playerUpdate(mob))
        playerChangedMap.pipe(takeUntil(this.stop), takeUntil(serverStop))
                        .subscribe(id => {
                            delete this.cached['player-' + id]
                            delete this.caching['player-' + id]
                        })
    }

    async npcUpdate(mob: Mob) {
        if (mob.instanceId === this.config.instanceId) {
            this.position.x = mob.x
            this.position.y = mob.y
            let distances   = await this.repo.find({
                where: [{
                    instanceId: mob.instanceId,
                    map       : this.config.map
                }]
            })
            if (distances) {
                for (let distance of distances) {
                    distance.x        = this.position.x
                    distance.y        = this.position.y
                    distance.distance = Phaser.Math.Distance.Between(this.position.x, this.position.y, distance.otherX, distance.otherY)
                    await this.repo.save(distance)
                }
            }
        } else {
            await this.updateDistance('npc', mob)
        }
    }


    async playerUpdate(mob: Mob) {
        await this.updateDistance('player', mob)
    }

    cached: { [key: string]: Distance } = {}
    caching: { [key: string]: boolean } = {}

    async updateDistance(otherType: 'player' | 'npc', mob: Mob) {
        let key = otherType + '-' + mob.instanceId
        if (!this.caching[key]) {
            this.caching[key] = true
            let distance      = this.cached[key] || await this.repo.findOne({
                instanceId: this.config.instanceId,
                map       : this.config.map,
                otherType : otherType,
                otherId   : mob.instanceId
            })
            distance          = distance || new Distance()
            this.cached[key]  = distance
            this.caching[key] = false
            distance.update(
                this.config.instanceId,
                this.config.map,
                this.position.x,
                this.position.y,
                otherType,
                mob.instanceId,
                mob.x,
                mob.y,
                Phaser.Math.Distance.Between(this.position.x, this.position.y, mob.x, mob.y)
            )
            await this.repo.save(distance)
        }
    }
}
