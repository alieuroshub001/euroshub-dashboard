import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Chat, Message, User } from '@/models';
import { IApiResponse, IChat, IChatWithDetails, IChatFilter } from '@/types';
import { verifyAuth } from '@/lib/auth';

// GET /api/chats - Get user's chats with filters
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const authResult = await verifyAuth(req);
    if (!authResult.success) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Unauthorized'
      }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') as 'direct' | 'group' | 'channel';
    const isArchived = searchParams.get('isArchived') === 'true';

    // Build filter
    const filter: any = {
      'members.userId': authResult.user.userId,
      isArchived
    };

    if (type) filter.type = type;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { topic: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    // Get chats with member details
    const chats = await Chat.aggregate([
      { $match: filter },
      { $sort: { lastActivity: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: 'members.userId',
          foreignField: '_id',
          as: 'memberDetails'
        }
      },
      {
        $lookup: {
          from: 'messages',
          localField: 'lastMessage',
          foreignField: '_id',
          as: 'lastMessageDetails'
        }
      },
      {
        $addFields: {
          memberDetails: {
            $map: {
              input: '$members',
              as: 'member',
              in: {
                $let: {
                  vars: {
                    userDetail: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: '$memberDetails',
                            as: 'user',
                            cond: { $eq: ['$$user._id', '$$member.userId'] }
                          }
                        },
                        0
                      ]
                    }
                  },
                  in: {
                    userId: '$$member.userId',
                    role: '$$member.role',
                    name: '$$userDetail.name',
                    email: '$$userDetail.email',
                    profileImage: '$$userDetail.profileImage',
                    isOnline: false, // This would come from real-time service
                    lastSeen: '$$userDetail.updatedAt'
                  }
                }
              }
            }
          },
          lastMessageDetails: { $arrayElemAt: ['$lastMessageDetails', 0] },
          unreadCount: 0 // This would be calculated based on user's lastRead
        }
      }
    ]);

    const total = await Chat.countDocuments(filter);

    return NextResponse.json<IApiResponse>({
      success: true,
      message: 'Chats retrieved successfully',
      data: {
        chats,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Chats GET error:', error);
    return NextResponse.json<IApiResponse>({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST /api/chats - Create new chat
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const authResult = await verifyAuth(req);
    if (!authResult.success) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Unauthorized'
      }, { status: 401 });
    }

    const data = await req.json();
    const { name, description, type, isPrivate = false, members = [], avatar, topic } = data;

    if (!type || !['direct', 'group', 'channel'].includes(type)) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Valid chat type is required (direct, group, channel)'
      }, { status: 400 });
    }

    // For direct chats, ensure only 2 members
    if (type === 'direct' && members.length !== 1) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Direct chats must have exactly 2 members'
      }, { status: 400 });
    }

    // Check if direct chat already exists
    if (type === 'direct') {
      const existingChat = await Chat.findOne({
        type: 'direct',
        'members.userId': { $all: [authResult.user.userId, members[0]] }
      });

      if (existingChat) {
        return NextResponse.json<IApiResponse>({
          success: false,
          message: 'Direct chat already exists',
          data: { chatId: existingChat._id }
        }, { status: 409 });
      }
    }

    // Validate member IDs
    const memberIds = [authResult.user.userId, ...members];
    const validUsers = await User.find({ 
      _id: { $in: memberIds },
      isActive: true
    });

    if (validUsers.length !== memberIds.length) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Some member IDs are invalid'
      }, { status: 400 });
    }

    // Create chat members array
    const chatMembers = memberIds.map(userId => ({
      userId,
      role: userId === authResult.user.userId ? 'admin' : 'member',
      joinedAt: new Date(),
      notifications: true,
      isMuted: false
    }));

    // Create chat
    const chat = new Chat({
      name: type === 'direct' ? undefined : name,
      description,
      type,
      isPrivate,
      createdBy: authResult.user.userId,
      members: chatMembers,
      avatar,
      topic,
      lastActivity: new Date()
    });

    await chat.save();

    // Populate member details
    const populatedChat = await Chat.findById(chat._id)
      .populate('members.userId', 'name email profileImage')
      .lean();

    return NextResponse.json<IApiResponse<IChat>>({
      success: true,
      message: 'Chat created successfully',
      data: populatedChat
    }, { status: 201 });

  } catch (error) {
    console.error('Chats POST error:', error);
    return NextResponse.json<IApiResponse>({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}