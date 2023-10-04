import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  WsResponse,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Customer } from '../customers/customer.schema';
import { GroupChatMessage } from '../group-chat/group-chat.schema';
import path, { join } from 'path';

//chat.gateway.ts
@WebSocketGateway({ cors: true })
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  private onlineUsers: Set<string> = new Set();
  private latestMessages: any = [];
  private appendLatestMessage(latestMessage: any) {
    this.latestMessages.push(latestMessage);
    this.server.emit('latestMessageUpdated', this.latestMessages);
  }
  @SubscribeMessage('sendGroupMessage')
  handleGroupMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    payload: {
      sender: Customer;
      message: string;
      groupChatId: string;
      AllGroupChatIds: string[];
    },
  ) {
    for (const groupChatId of payload.AllGroupChatIds) {
      this.server.to(groupChatId).emit('newGroupMessage', payload);
    }

    this.appendLatestMessage(payload);
    return payload;
  }

  @SubscribeMessage('join_rooms')
  async handleJoinRooms(
    @MessageBody()
    payload: {
      AllGroupChatIds: string[];
    },
    @ConnectedSocket() socket: Socket,
  ) {
    const { AllGroupChatIds } = payload;
    console.log('Joining rooms:', AllGroupChatIds);

    for (const groupChatId of payload.AllGroupChatIds) {
      socket.join(groupChatId);
    }
  }

  @SubscribeMessage('createRoom')
  createRoom(
    socket: Socket,
    roomName: string,
    users: string[],
  ): WsResponse<unknown> {
    socket.join(roomName);
    socket.to(roomName).emit('roomCreated', { room: roomName, users });

    return { event: 'roomCreated', data: { room: roomName, users } };
  }

  @SubscribeMessage('updateOnlineUsers')
  handleUpdateOnlineUsers(): void {
    this.updateOnlineUsers();
  }

  @SubscribeMessage('connectOnlineStatus')
  handleManualConnection(client: Socket, payload: { userId: string }): void {
    const userId = payload.userId;
    if (userId) {
      this.onlineUsers.add(userId);
      this.updateOnlineUsers();
    }
  }

  @SubscribeMessage('disconnectOfflineStatus')
  handleManualDisconnect(client: Socket, payload: { userId: string }): void {
    const userId = payload.userId;
    if (userId) {
      this.onlineUsers.delete(userId);
      this.updateOnlineUsers();
    }
  }

  private async updateOnlineUsers(): Promise<void> {
    try {
      const onlineUsersArray = Array.from(this.onlineUsers);
      console.log('Updated online users:', onlineUsersArray);
      this.server.emit('onlineUsers', onlineUsersArray);
    } catch (error) {
      console.error('Error updating online users:', error);
    }
  }
}
