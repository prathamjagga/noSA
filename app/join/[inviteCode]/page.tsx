"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Users, Loader2 } from "lucide-react";

interface JoinPageProps {
  params: {
    inviteCode: string;
  };
}

export default function JoinPage({ params }: JoinPageProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [groupName, setGroupName] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }

    const joinGroup = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("/api/groups/join", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ inviteCode: params.inviteCode }),
        });

        if (response.status === 401) {
          localStorage.clear();
          router.push("/");
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error);
        }

        setGroupName(data.group.name);
        // Redirect to the group chat after a brief delay
        setTimeout(() => {
          router.push(`/groups/${data.group._id}`);
        }, 2000);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    joinGroup();
  }, [params.inviteCode, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="glass-morphism rounded-3xl p-8 w-full max-w-md text-center">
          <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
          <h1 className="text-2xl font-semibold text-white mb-2">
            Joining Group...
          </h1>
          <p className="text-white/70">
            Please wait while we process your invitation
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="glass-morphism rounded-3xl p-8 w-full max-w-md text-center">
          <Users className="w-12 h-12 text-white mx-auto mb-4" />
          <h1 className="text-2xl font-semibold text-white mb-4">
            Unable to Join Group
          </h1>
          <p className="text-white/70 mb-6">{error}</p>
          <Button onClick={() => router.push("/groups")} className="ios-btn">
            Go to My Groups
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="glass-morphism rounded-3xl p-8 w-full max-w-md text-center">
        <Users className="w-12 h-12 text-white mx-auto mb-4" />
        <h1 className="text-2xl font-semibold text-white mb-2">
          Successfully Joined!
        </h1>
        <p className="text-white/70 mb-4">
          You have joined {groupName}. Redirecting to the group chat...
        </p>
        <div className="animate-pulse">
          <Loader2 className="w-6 h-6 text-white mx-auto" />
        </div>
      </div>
    </div>
  );
}
