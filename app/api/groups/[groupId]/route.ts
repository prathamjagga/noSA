import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Group from "@/lib/models/Group";
import { getTokenData } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { groupId: string } }
) {
  try {
    console.log("GID", params.groupId);
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

    return NextResponse.json({ group });
  } catch (error) {
    return NextResponse.json(
      { error: "Error fetching group" },
      { status: 500 }
    );
  }
}
