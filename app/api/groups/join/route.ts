import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Group from "@/lib/models/Group";
import { getTokenData } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
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

    const { inviteCode } = await req.json();
    const group = await Group.findOne({ inviteCode });

    if (!group) {
      return NextResponse.json(
        { error: "Invalid invite code" },
        { status: 404 }
      );
    }

    // Check if user is already a member
    if (group.members.includes(tokenData.userId)) {
      return NextResponse.json(
        { error: "Already a member of this group" },
        { status: 400 }
      );
    }

    // Add user to group members
    group.members.push(tokenData.userId);
    await group.save();

    return NextResponse.json({ group });
  } catch (error) {
    return NextResponse.json({ error: "Error joining group" }, { status: 500 });
  }
}
