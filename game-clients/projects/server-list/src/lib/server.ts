export interface Server {
    id: number;
    socketId: string;
    ip: string;
    name: string;
    capacity: number;
    current: number;
    status: 'online' | 'offline';
}
