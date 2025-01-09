"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface Group {
  _id: string;
  name: string;
  type: "general" | "anonymous";
  inviteCode: string;
}

export default function GroupsPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [newGroup, setNewGroup] = useState({ name: "", type: "general" });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("here");
      router.push("/");
      return;
    }
  }, [router]);

  // fetch groups
  useEffect(() => {
    async function x() {
      let response = await fetch("/api/groups", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      let statusCode = response.status;
      if (statusCode == 401) {
        localStorage.clear();
        router.push("/");
      }
      let data = await response.json();
      setGroups(data.groups);
    }
    x();
  }, []);

  const handleCreateGroup = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newGroup),
      });

      if (response.status == 401) {
        localStorage.clear();
        router.push("/");
      }

      if (response.ok) {
        const data = await response.json();
        setGroups([...groups, data.group]);
        setNewGroup({ name: "", type: "general" });
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-white">My Groups</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="ios-btn">
                <Plus className="w-4 h-4 mr-2" />
                Create Group
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-morphism border-none">
              <DialogHeader>
                <DialogTitle className="text-white">
                  Create New Group
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-white">Group Name</Label>
                  <Input
                    value={newGroup.name}
                    onChange={(e) =>
                      setNewGroup({ ...newGroup, name: e.target.value })
                    }
                    className="bg-white/20 border-0 text-white placeholder:text-white/60"
                    placeholder="Enter group name"
                  />
                </div>
                <div>
                  <Label className="text-white">Group Type</Label>
                  <RadioGroup
                    value={newGroup.type}
                    onValueChange={(value) =>
                      setNewGroup({
                        ...newGroup,
                        type: value as "general" | "anonymous",
                      })
                    }
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="general"
                        id="general"
                        className="border-white"
                      />
                      <Label htmlFor="general" className="text-white">
                        General
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="anonymous"
                        id="anonymous"
                        className="border-white"
                      />
                      <Label htmlFor="anonymous" className="text-white">
                        Anonymous
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                <Button onClick={handleCreateGroup} className="w-full ios-btn">
                  Create Group
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button
            className="ios-btn"
            onClick={() => {
              localStorage.clear();
              router.push("/");
            }}
          >
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => (
            <div
              key={group._id}
              className="glass-morphism p-4 rounded-xl cursor-pointer hover:bg-white/30 transition-all"
              onClick={() => router.push(`/groups/${group._id}`)}
            >
              <div className="flex items-center space-x-3">
                <Users className="w-8 h-8 text-white" />
                <div>
                  <h3 className="text-lg font-medium text-white">
                    {group.name}
                  </h3>
                  <p className="text-sm text-white/70 capitalize">
                    {group.type}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {groups.length === 0 && (
          <div className="text-center text-white/70 mt-8">
            <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No groups yet. Create one to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}
