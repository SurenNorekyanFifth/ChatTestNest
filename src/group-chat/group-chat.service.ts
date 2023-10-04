import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CustomersService } from '../customers/customers.service';
import { ChatGateway } from '../gateway/chat.gateway';
import { GroupChatMessage } from './group-chat.schema';
import { SendMessageDto } from './SendMessage/send-message.dto';

//group-chat.service
@Injectable()
export class GroupChatService {
  constructor(
    @InjectModel(GroupChatMessage.name)
    private readonly groupChatMessageModel: Model<GroupChatMessage>,
    private readonly customerService: CustomersService,
    private readonly chatGateway: ChatGateway,
  ) {}

  async sendMessageToGroup(
    sendMessageDto: SendMessageDto,
  ): Promise<GroupChatMessage> {
    const { senderId, groupMemberIds, message, groupChatId } = sendMessageDto;

    const sender = await this.customerService.findOneById(senderId);
    const sendersGroupChats = await this.getGroupChatByUserId(senderId);
    const AllGroupChatIds = sendersGroupChats?.map((singleGroupChat) =>
      singleGroupChat._id.toString(),
    );
    // console.log(AllGroupChatIds, 'ROOM GROUP CHAT IDS');
    const groupMembers = await this.customerService.findManyByIds(
      groupMemberIds,
    );

    if (!sender) {
      throw new NotFoundException('Invalid sender');
    }

    if (!groupMemberIds.includes(senderId)) {
      groupMembers.push(sender);
    }

    const newMessage = { message, sender, groupChatId, AllGroupChatIds };

    // Check if a chat already exists between the users
    const existingGroupChat = await this.groupChatMessageModel.findOne({
      groupMembers: {
        $size: groupMembers.length,
        $all: groupMembers.map((member) => member._id),
      },
    });

    if (!groupChatId) {
      if (existingGroupChat) {
        // Chat exists, but groupChatId is missing
        throw new BadRequestException(
          'groupChatId is required for existing chats',
        );
      }

      // Create a new group chat
      const groupChatMessage: GroupChatMessage = new this.groupChatMessageModel(
        {
          messages: [newMessage],
          groupMembers,
        },
      );

      await groupChatMessage.save();
      // this.chatGateway.server
      //   .to(groupChatMessage.groupChatId)
      //   .emit('newGroupMessage', groupChatMessage);
      AllGroupChatIds.forEach((chatId) => {
        this.chatGateway.server
          .to(chatId)
          .emit('newGroupMessage', groupChatMessage);
      });

      return groupChatMessage;
    } else {
      if (!existingGroupChat) {
        throw new NotFoundException('Group chat not found');
      }

      if (!existingGroupChat._id.equals(groupChatId)) {
        throw new BadRequestException('Invalid groupChatId');
      }

      existingGroupChat.messages.push(newMessage);
      await existingGroupChat.save();
      // this.chatGateway.server
      //   .to(groupChatId)
      //   .emit('newGroupMessage', newMessage);
      const roomsData = {
        AllGroupChatIds,
      };
      AllGroupChatIds.forEach((chatId) => {
        this.chatGateway.server.to(chatId).emit('newGroupMessage', newMessage);
      });
      return existingGroupChat;
    }
  }

  async getGroupMessages(senderId: string, groupMemberIds: string[]) {
    // Convert groupMemberIds to ObjectId if needed
    const groupMemberObjectIds = groupMemberIds.map(
      (id) => new Types.ObjectId(id),
    );

    return await this.groupChatMessageModel
      .find({
        'messages.sender': senderId,
        groupMembers: { $in: groupMemberObjectIds },
      })
      .populate('messages.sender')
      .populate('groupMembers')
      .exec();
  }

  async getAllGroupChats(): Promise<GroupChatMessage[]> {
    try {
      return await this.groupChatMessageModel
        .find()
        .populate('messages.sender')
        .populate('groupMembers')
        .exec();
    } catch (error) {
      // Handle any errors
      console.error('Error fetching all group chats:', error);
      return [];
    }
  }

  async getGroupChatByUserIds(
    userIds: string[],
  ): Promise<GroupChatMessage | null> {
    return await this.groupChatMessageModel
      .findOne({
        groupMembers: userIds, // Use exact match for groupMembers
      })
      .populate('messages.sender')
      .populate('groupMembers')
      .exec();
  }

  async getGroupChatById(
    groupChatId: string,
  ): Promise<GroupChatMessage | null> {
    try {
      return await this.groupChatMessageModel
        .findOne({
          _id: groupChatId,
        })
        .populate('messages.sender')
        .populate('groupMembers')
        .exec();
    } catch (error) {
      // Handle any errors (e.g., invalid groupChatId)
      console.error('Error fetching group chat by ID:', error);
      return null;
    }
  }

  async getGroupChatByUserId(userId: string) {
    return this.groupChatMessageModel
      .find({
        groupMembers: userId, // Check if the provided user ID is in groupMembers
      })
      .populate('messages.sender')
      .populate('groupMembers')
      .exec();
  }

  async deleteAllGroupChatMessages(): Promise<void> {
    await this.groupChatMessageModel.deleteMany({}).exec();
  }

  async findOneById(id: string): Promise<GroupChatMessage | undefined> {
    return this.groupChatMessageModel.findById(id).exec();
  }
}
