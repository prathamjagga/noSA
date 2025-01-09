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
import { set } from "mongoose";

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
  const [isLoading, setIsLoading] = useState(false);

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
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 netflix-gradient">
      <div className="float-right">
        {/* add logo here */}
        <Button
          className="netflix-btn"
          onClick={() => {
            localStorage.clear();
            router.push("/");
          }}
        >
          Logout
        </Button>
      </div>
      <br />
      <br />
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">My Groups</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="netflix-btn">
                <Plus className="w-4 h-4 mr-2" />
                Create Group
              </Button>
            </DialogTrigger>
            <DialogContent className="netflix-dialog border-none">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-white">
                  Create New Group
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6 mt-4">
                <div>
                  <Label className="text-gray-300 mb-2">Group Name</Label>
                  <Input
                    value={newGroup.name}
                    onChange={(e) =>
                      setNewGroup({ ...newGroup, name: e.target.value })
                    }
                    className="netflix-input"
                    placeholder="Enter group name"
                  />
                </div>
                <div>
                  <Label className="text-gray-300 mb-2">Group Type</Label>
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
                        className="border-netflix-red"
                      />
                      <Label htmlFor="general" className="text-white">
                        General
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="anonymous"
                        id="anonymous"
                        className="border-netflix-red"
                      />
                      <Label htmlFor="anonymous" className="text-white">
                        Anonymous
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                <Button
                  onClick={handleCreateGroup}
                  className="netflix-btn w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="netflix-loader mx-auto"></div>
                  ) : (
                    "Create Group"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <div
              key={group._id}
              className="netflix-card p-6 cursor-pointer"
              onClick={() => router.push(`/groups/${group._id}`)}
            >
              <div className="flex items-center space-x-4">
                <Users className="w-10 h-10 text-netflix-red" />
                <div>
                  <h3 className="text-xl font-bold text-white">{group.name}</h3>
                  <p className="text-gray-400 capitalize">{group.type}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {groups.length === 0 && (
          <div className="text-center text-gray-400 mt-12">
            <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-xl">No groups yet. Create one to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}
