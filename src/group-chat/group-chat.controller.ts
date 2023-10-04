import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GroupChatService } from './group-chat.service';
import { CustomerAuthGuard } from '../auth/customer-auth.guard';
import { SendMessageDto } from './SendMessage/send-message.dto';

//group-chat.controller.ts
@Controller('group-chat')
export class GroupChatController {
  constructor(private readonly groupChatService: GroupChatService) {}

  @UseGuards(CustomerAuthGuard)
  @Post()
  async sendMessageToGroup(@Body() sendMessageDto: SendMessageDto) {
    return this.groupChatService.sendMessageToGroup(sendMessageDto);
  }

  @UseGuards(CustomerAuthGuard)
  @Get('group-by-user-ids')
  async getGroupChatByUserIds(@Query('userIds') userIds: string) {
    const users = userIds ? userIds.split(',').map((id) => id.trim()) : [];

    if (users.length < 2) {
      throw new BadRequestException('Please provide at least two user IDs.');
    }

    const groupChat = await this.groupChatService.getGroupChatByUserIds(users);
    if (!groupChat) {
      throw new NotFoundException(
        'No group chat found with the specified users.',
      );
    }

    return groupChat;
  }

  @UseGuards(CustomerAuthGuard)
  @Get()
  async getGroupMessages(
    @Query('senderId') senderId: string,
    @Query('groupMemberIds') groupMemberIds: string,
  ) {
    const members = groupMemberIds
      ? groupMemberIds.split(',').map((id) => id.trim())
      : [];

    return this.groupChatService.getGroupMessages(senderId, members);
  }

  @UseGuards(CustomerAuthGuard)
  @Get('getGroupById/:groupChatId') // Define the route parameter for groupChatId
  async getGroupChatById(@Param('groupChatId') groupChatId: string) {
    console.log(groupChatId);
    const groupChat = await this.groupChatService.getGroupChatById(groupChatId);

    if (!groupChat) {
      // Handle the case when the group chat is not found (return a 404 response)
      throw new NotFoundException('Group chat not found');
    }

    return groupChat;
  }
  @UseGuards(CustomerAuthGuard)
  @Get(':userId')
  async getGroupChatByUserId(@Param('userId') userId: string) {
    return this.groupChatService.getGroupChatByUserId(userId);
  }

  @UseGuards(CustomerAuthGuard)
  @Get('allGroupChats/all')
  async getAllGroupChats() {
    return await this.groupChatService.getAllGroupChats();
  }

  @Delete('all')
  async deleteAllGroupChatMessages(): Promise<void> {
    await this.groupChatService.deleteAllGroupChatMessages();
  }
}
