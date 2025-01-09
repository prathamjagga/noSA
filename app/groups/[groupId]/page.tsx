"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Share2, ArrowLeft } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Message {
  _id: string;
  content: string;
  sender: {
    _id: string;
    username: string;
  };
  createdAt: string;
}

interface Group {
  _id: string;
  name: string;
  type: "general" | "anonymous";
  inviteCode: string;
}

export default function GroupChat({ params }: { params: { groupId: string } }) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [group, setGroup] = useState<Group | null>(null);
  const [user, setUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`/api/groups/${params.groupId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.status === 401) {
          localStorage.clear();
          router.push("/");
        }
        if (response.ok) {
          const data = await response.json();
          setGroup(data.group);
        }
      } catch (error) {
        console.error("Error fetching group:", error);
      }
    };

    fetchGroup();
  }, [params.groupId]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`/api/messages/${params.groupId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.status == 401) {
          localStorage.clear();
          router.push("/");
        }
        if (response.ok) {
          const data = await response.json();
          setMessages(data.messages);
          scrollToBottom();
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
    // Set up polling for new messages
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [params.groupId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/messages/${params.groupId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newMessage }),
      });
      if (response.status == 401) {
        localStorage.clear();
        router.push("/");
      }

      if (response.ok) {
        const data = await response.json();
        setMessages([...messages, data.message]);
        console.log("MSG", data.message);
        setNewMessage("");
        scrollToBottom();
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="glass-morphism p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/groups")}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-semibold text-white">{group?.name}</h1>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
            >
              <Share2 className="w-5 h-5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-morphism border-none">
            <DialogHeader>
              <DialogTitle className="text-white">Invite Link</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                readOnly
                value={`${window.location.origin}/join/${group?.inviteCode}`}
                className="bg-white/20 border-0 text-white"
              />
              <Button
                onClick={() =>
                  navigator.clipboard.writeText(
                    `${window.location.origin}/join/${group?.inviteCode}`
                  )
                }
                className="w-full ios-btn"
              >
                Copy Link
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`message-bubble ${
              message.sender && message.sender._id === user?.id
                ? "sent"
                : "received"
            }`}
          >
            {group?.type === "general" &&
              message.sender &&
              message.sender._id !== user?.id && (
                <p className="text-xs text-white/70 mb-1">
                  {message.sender.username}
                </p>
              )}
            <p className="text-white">{message.content}</p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 glass-morphism">
        <div className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-white/20 border-0 text-white placeholder:text-white/60"
          />
          <Button type="submit" className="ios-btn">
            Send
          </Button>
        </div>
      </form>
    </div>
  );
}
