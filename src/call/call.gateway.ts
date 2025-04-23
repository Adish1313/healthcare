import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
  
  @WebSocketGateway({ cors: { origin: '*' } })
  export class CallGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;
  
    handleConnection(client: Socket) {
      console.log(`Client connected: ${client.id}`);
    }
  
    handleDisconnect(client: Socket) {
      console.log(`Client disconnected: ${client.id}`);
    }
  
    @SubscribeMessage('join-room')
    handleJoinRoom(
      @MessageBody() data: { roomId: string },
      @ConnectedSocket() client: Socket,
    ) {
      client.join(data.roomId);
      client.to(data.roomId).emit('user-joined', client.id);
    }
  
    @SubscribeMessage('signal')
    handleSignal(
      @MessageBody() data: any,
      @ConnectedSocket() client: Socket,
    ) {
      const { roomId, signalData } = data;
      client.to(roomId).emit('signal', { signalData, from: client.id });
    }
  }