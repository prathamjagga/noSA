import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Group from "@/lib/models/Group";
import { nanoid } from "nanoid";
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

    const { name, type } = await req.json();
    const inviteCode = nanoid(10);

    const group = await Group.create({
      name,
      type,
      admin: tokenData.userId,
      members: [tokenData.userId],
      inviteCode,
    });

    return NextResponse.json({ group });
  } catch (error) {
    return NextResponse.json(
      { error: "Error creating group" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
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

    const userId = tokenData.userId;
    const allGroups = await Group.find();
    let groups = [];

    for (let g = 0; g < allGroups.length; g++) {
      const group = allGroups[g];
      if (group.members.includes(userId)) {
        groups.push(group);
      }
    }
    return NextResponse.json({ groups });
  } catch (error) {
    return NextResponse.json(
      { error: "Error creating group" },
      { status: 500 }
    );
  }
}
