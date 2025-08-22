import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { Chat, Message, User } from '@/models';
import { IApiResponse, IChat, IMessage } from '@/types';
import { verifyAuth } from '@/lib/auth';

// GET /api/chats/[id] - Get specific chat details
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    
    const authResult = await verifyAuth(req);
    if (!authResult.success) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Unauthorized'
      }, { status: 401 });
    }

    const { id } = params;

    // Find chat and verify user is a member
    const chat = await Chat.findOne({
      _id: id,
      'members.userId': authResult.user.userId
    }).populate('members.userId', 'name email profileImage');

    if (!chat) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Chat not found or access denied'
      }, { status: 404 });
    }

    // Update user's last read timestamp
    const member = chat.members.find(m => m.userId.toString() === authResult.user.userId);
    if (member) {
      member.lastRead = new Date();
      await chat.save();
    }

    return NextResponse.json<IApiResponse<IChat>>({
      success: true,
      message: 'Chat retrieved successfully',
      data: chat.toObject()
    });

  } catch (error) {
    console.error('Chat GET [id] error:', error);
    return NextResponse.json<IApiResponse>({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PUT /api/chats/[id] - Update chat details
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    
    const authResult = await verifyAuth(req);
    if (!authResult.success) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Unauthorized'
      }, { status: 401 });
    }

    const { id } = params;
    const data = await req.json();
    const { name, description, avatar, topic, isArchived } = data;

    // Find chat and verify user is admin
    const chat = await Chat.findOne({
      _id: id,
      'members.userId': authResult.user.userId
    });

    if (!chat) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Chat not found or access denied'
      }, { status: 404 });
    }

    // Check if user is admin or creator
    const member = chat.members.find(m => m.userId.toString() === authResult.user.userId);
    if (!member || (member.role !== 'admin' && chat.createdBy.toString() !== authResult.user.userId)) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Insufficient permissions to update chat'
      }, { status: 403 });
    }

    // Update chat
    if (name !== undefined) chat.name = name;
    if (description !== undefined) chat.description = description;
    if (avatar !== undefined) chat.avatar = avatar;
    if (topic !== undefined) chat.topic = topic;
    if (isArchived !== undefined) {
      chat.isArchived = isArchived;
      if (isArchived) {
        chat.archivedBy = authResult.user.userId;
        chat.archivedAt = new Date();
      }
    }

    await chat.save();

    const updatedChat = await Chat.findById(chat._id)
      .populate('members.userId', 'name email profileImage');

    return NextResponse.json<IApiResponse<IChat>>({
      success: true,
      message: 'Chat updated successfully',
      data: updatedChat?.toObject()
    });

  } catch (error) {
    console.error('Chat PUT [id] error:', error);
    return NextResponse.json<IApiResponse>({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE /api/chats/[id] - Delete chat (admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    
    const authResult = await verifyAuth(req);
    if (!authResult.success) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Unauthorized'
      }, { status: 401 });
    }

    const { id } = params;

    // Find chat and verify user is creator or superadmin
    const chat = await Chat.findOne({
      _id: id,
      'members.userId': authResult.user.userId
    });

    if (!chat) {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Chat not found or access denied'
      }, { status: 404 });
    }

    // Only creator or superadmin can delete
    if (chat.createdBy.toString() !== authResult.user.userId && authResult.user.role !== 'superadmin') {
      return NextResponse.json<IApiResponse>({
        success: false,
        message: 'Only chat creator or superadmin can delete chat'
      }, { status: 403 });
    }

    // Delete all messages in the chat
    await Message.deleteMany({ chatId: id });

    // Delete the chat
    await Chat.findByIdAndDelete(id);

    return NextResponse.json<IApiResponse>({
      success: true,
      message: 'Chat deleted successfully'
    });

  } catch (error) {
    console.error('Chat DELETE [id] error:', error);
    return NextResponse.json<IApiResponse>({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}