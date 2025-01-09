import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Message from "@/lib/models/Message";
import Group from "@/lib/models/Group";
import { getTokenData } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { groupId: string } }
) {
  try {
    await connectDB();
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tokenData = getTokenData(token);
    if (!tokenData) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const group = await Group.findById(params.groupId);
    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    if (!group.members.includes(tokenData.userId)) {
      return NextResponse.json(
        { error: "Not a member of this group" },
        { status: 403 }
      );
    }

    const messages = await Message.find({ group: params.groupId })
      .populate("sender", "username")
      .sort("createdAt");

    return NextResponse.json({ messages });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Error fetching messages" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: { groupId: string } }
) {
  try {
    await connectDB();
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tokenData = getTokenData(token);
    if (!tokenData) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { content } = await req.json();

    const group = await Group.findById(params.groupId);
    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    if (!group.members.includes(tokenData.userId)) {
      return NextResponse.json(
        { error: "Not a member of this group" },
        { status: 403 }
      );
    }

    const message = await Message.create({
      content,
      group: params.groupId,
      sender: tokenData.userId,
    });

    const populatedMessage = await Message.findById(message._id).populate(
      "sender",
      "username"
    );

    return NextResponse.json({ message: populatedMessage });
  } catch (error) {
    return NextResponse.json(
      { error: "Error sending message" },
      { status: 500 }
    );
  }
}
