import {Injectable}                                from "@nestjs/common";
import {ClientProxy}                               from "@nestjs/microservices";
import {first, tap}                                from "rxjs/operators";
import {GetServers, RegisterServer, ServerOffline} from "../actions";

@Injectable()
export class PresenceClient {

    constructor(private client: ClientProxy) {

    }

    async register(host: string, port: number, constant: string, name: string, instanceId: number): Promise<string> {
        return await this.client.send(RegisterServer.event, new RegisterServer(
            host,
            port,
            constant,
            name,
            instanceId
        )).pipe(first()).toPromise();
    }

    async getServers() {
        return await this.client.send(GetServers.event, {}).pipe(first()).toPromise();
    }

    serverOffline(serverId: number) {
        this.client.emit(ServerOffline.event, new ServerOffline(serverId));
    }
}
