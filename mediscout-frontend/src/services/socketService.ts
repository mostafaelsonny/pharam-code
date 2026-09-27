import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
class SocketService {
  private socket: Socket | null = null;
  private currentUser: { userId?: string; role?: string } | null = null;

  public getSocket(): Socket {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        autoConnect: true,
        transports: ['websocket', 'polling'],
      });

      this.socket.on('connect', () => {
        console.log('🔌 Socket connected to server:', this.socket?.id);
        if (this.currentUser?.userId || this.currentUser?.role) {
          this.socket?.emit('join_room', this.currentUser);
        }
      });

      this.socket.on('disconnect', () => {
        console.log('❌ Socket disconnected from server');
      });
    }

    return this.socket;
  }

  public joinUserRoom(userId?: string, role?: string) {
    this.currentUser = { userId, role };
    const socket = this.getSocket();

    if (socket.connected && (userId || role)) {
      socket.emit('join_room', { userId, role });
    }
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketService = new SocketService();
