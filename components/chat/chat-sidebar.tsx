"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Search, Settings, Edit } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface Conversation {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: Date;
  unread: number;
}

export default function ChatSidebar() {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Sample conversations - replace with actual data from API
  const conversations: Conversation[] = [
    {
      id: "1",
      name: "Jane Smith",
      avatar: "https://github.com/shadcn.png",
      lastMessage: "That sounds interesting. Tell me more about it!",
      timestamp: new Date(Date.now() - 1000000),
      unread: 0,
    },
    {
      id: "2",
      name: "Alex Johnson",
      avatar: "https://github.com/shadcn.png",
      lastMessage: "Hey, are we still meeting tomorrow?",
      timestamp: new Date(Date.now() - 2000000),
      unread: 3,
    },
    {
      id: "3",
      name: "Sarah Williams",
      avatar: "https://github.com/shadcn.png",
      lastMessage: "I just sent you the files you requested",
      timestamp: new Date(Date.now() - 3000000),
      unread: 0,
    },
    {
      id: "4",
      name: "Michael Brown",
      avatar: "https://github.com/shadcn.png",
      lastMessage: "Thanks for your help yesterday!",
      timestamp: new Date(Date.now() - 4000000),
      unread: 0,
    },
  ];

  const filteredConversations = conversations.filter((conversation) =>
    conversation.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const day = 24 * 60 * 60 * 1000;
    
    if (diff < day) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diff < 7 * day) {
      return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="w-80 border-r bg-card flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">Chats</h1>
          <div className="flex space-x-2">
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Edit className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations"
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.map((conversation) => (
          <Link href={`/chat/${conversation.id}`} key={conversation.id}>
            <div 
              className={`p-3 flex items-center space-x-3 hover:bg-accent cursor-pointer ${
                pathname === `/chat/${conversation.id}` ? "bg-accent" : ""
              }`}
            >
              <Avatar className="h-12 w-12">
                <img src={conversation.avatar} alt={conversation.name} />
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-medium truncate">{conversation.name}</h3>
                  <span className="text-xs text-muted-foreground">
                    {formatTime(conversation.timestamp)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
              </div>
              {conversation.unread > 0 && (
                <div className="bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {conversation.unread}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}