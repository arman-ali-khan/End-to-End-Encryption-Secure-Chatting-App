"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Send, Paperclip, Smile, Image, MoreVertical } from "lucide-react";

interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: Date;
  isCurrentUser: boolean;
}

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [user, setUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sample data - replace with actual API calls
  useEffect(() => {
    // Simulate fetching user data
    setUser({
      id: "1",
      name: "John Doe",
      avatar: "https://github.com/shadcn.png",
    });

    // Simulate fetching messages
    const sampleMessages: Message[] = [
      {
        id: "1",
        content: "Hey there! How are you?",
        sender: "2",
        timestamp: new Date(Date.now() - 3600000),
        isCurrentUser: false,
      },
      {
        id: "2",
        content: "I'm good, thanks! How about you?",
        sender: "1",
        timestamp: new Date(Date.now() - 3500000),
        isCurrentUser: true,
      },
      {
        id: "3",
        content: "Doing well! Just working on this new project.",
        sender: "2",
        timestamp: new Date(Date.now() - 3400000),
        isCurrentUser: false,
      },
      {
        id: "4",
        content: "That sounds interesting. Tell me more about it!",
        sender: "1",
        timestamp: new Date(Date.now() - 3300000),
        isCurrentUser: true,
      },
    ];

    setMessages(sampleMessages);
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender: user?.id || "1",
      timestamp: new Date(),
      isCurrentUser: true,
    };

    setMessages([...messages, message]);
    setNewMessage("");

    // Here you would typically send the message to your API
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Avatar>
            <img src="https://github.com/shadcn.png" alt="User" />
          </Avatar>
          <div>
            <h2 className="font-semibold">Jane Smith</h2>
            <p className="text-xs text-muted-foreground">Active now</p>
          </div>
        </div>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.isCurrentUser ? "justify-end" : "justify-start"
            }`}
          >
            <div className="flex items-end space-x-2">
              {!message.isCurrentUser && (
                <Avatar className="w-8 h-8">
                  <img src="https://github.com/shadcn.png" alt="User" />
                </Avatar>
              )}
              <div
                className={`max-w-xs px-4 py-2 rounded-2xl ${
                  message.isCurrentUser
                    ? "bg-primary text-primary-foreground rounded-br-none"
                    : "bg-muted text-muted-foreground rounded-bl-none"
                }`}
              >
                <p>{message.content}</p>
                <span
                  className={`text-xs ${
                    message.isCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground/70"
                  } block mt-1`}
                >
                  {formatTime(message.timestamp)}
                </span>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-card border-t p-4">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <Button type="button" variant="ghost" size="icon">
            <Paperclip className="h-5 w-5" />
          </Button>
          <Button type="button" variant="ghost" size="icon">
            <Image className="h-5 w-5" />
          </Button>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button type="button" variant="ghost" size="icon">
            <Smile className="h-5 w-5" />
          </Button>
          <Button type="submit" size="icon" disabled={!newMessage.trim()}>
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}