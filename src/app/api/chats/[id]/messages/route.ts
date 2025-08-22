import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Chat, Message, User } from '@/models';
import { IApiResponse, IMessage, IMessageWithDetails } from '@/types';
import { verifyAuth } from '@/lib/auth';

// GET /api/chats/[id]/messages - Get messages for a chat
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const authResult = await verifyAuth(req);
    if (!authResult.success) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Unauthorized'
      }, { status: 401 });
    }

    const { id: chatId } = params;
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';

    // Verify user is a member of the chat
    const chat = await Chat.findOne({
      _id: chatId,
      'members.userId': authResult.user.userId
    });

    if (!chat) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Chat not found or access denied'
      }, { status: 404 });
    }

    // Build filter
    const filter: any = { 
      chatId,
      isDeleted: false
    };

    if (search) {
      filter.content = { $regex: search, $options: 'i' };
    }

    const skip = (page - 1) * limit;

    // Get messages with sender details
    const messages = await Message.aggregate([
      { $match: filter },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: 'senderId',
          foreignField: '_id',
          as: 'senderDetails'
        }
      },
      {
        $lookup: {
          from: 'messages',
          localField: 'replyToId',
          foreignField: '_id',
          as: 'replyToMessage'
        }
      },
      {
        $addFields: {
          senderDetails: {
            $let: {
              vars: { sender: { $arrayElemAt: ['$senderDetails', 0] } },
              in: {
                id: '$$sender._id',
                name: '$$sender.name',
                profileImage: '$$sender.profileImage'
              }
            }
          },
          replyToMessage: {
            $let: {
              vars: { reply: { $arrayElemAt: ['$replyToMessage', 0] } },
              in: {
                $cond: {
                  if: { $ne: ['$$reply', null] },
                  then: {
                    id: '$$reply._id',
                    content: '$$reply.content',
                    senderName: '$$reply.senderId', // This would need another lookup for sender name
                    attachments: '$$reply.attachments'
                  },
                  else: null
                }
              }
            }
          }
        }
      },
      { $sort: { createdAt: 1 } } // Return in chronological order
    ]);

    const total = await Message.countDocuments(filter);

    return NextResponse.json<IApiResponse>({
      success: true,
      message: 'Messages retrieved successfully',
      data: {
        messages,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Messages GET error:', error);
    return NextResponse.json<IApiResponse>({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST /api/chats/[id]/messages - Send new message
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const authResult = await verifyAuth(req);
    if (!authResult.success) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Unauthorized'
      }, { status: 401 });
    }

    const { id: chatId } = params;
    const data = await req.json();
    const { content, replyToId, attachments = [], mentionedUsers = [] } = data;

    // Verify user is a member of the chat
    const chat = await Chat.findOne({
      _id: chatId,
      'members.userId': authResult.user.userId
    });

    if (!chat) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Chat not found or access denied'
      }, { status: 404 });
    }

    // Validate message content
    if (!content && (!attachments || attachments.length === 0)) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Message must have content or attachments'
      }, { status: 400 });
    }

    // Validate reply message if replyToId is provided
    if (replyToId) {
      const replyMessage = await Message.findOne({
        _id: replyToId,
        chatId,
        isDeleted: false
      });

      if (!replyMessage) {
        return NextResponse.json<IApiResponse>({
          success: false,
          message: 'Reply message not found'
        }, { status: 400 });
      }
    }

    // Create message
    const message = new Message({
      content,
      senderId: authResult.user.userId,
      chatId,
      replyToId,
      attachments,
      mentionedUsers,
      status: 'sent'
    });

    await message.save();

    // Update chat's last message and activity
    chat.lastMessage = message._id.toString();
    chat.lastActivity = new Date();
    await chat.save();

    // Populate sender details
    const populatedMessage = await Message.findById(message._id)
      .populate('senderId', 'name profileImage')
      .lean();

    return NextResponse.json<IApiResponse<IMessage>>({
      success: true,
      message: 'Message sent successfully',
      data: populatedMessage
    }, { status: 201 });

  } catch (error) {
    console.error('Messages POST error:', error);
    return NextResponse.json<IApiResponse>({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}