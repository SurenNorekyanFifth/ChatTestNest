export class SendMessageDto {
  senderId: string;
  groupMemberIds: string[];
  message: string;
  groupChatId?: string;
}
