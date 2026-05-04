import React, { useState, useEffect, useRef, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageCircle,
  Send,
  ArrowLeft,
  User,
} from "lucide-react";
import { format } from "date-fns";

/**
 * Replace this with your real backend (Supabase / Firebase / REST API)
 */
const api = {
  getCurrentUser: async () => {
    return JSON.parse(localStorage.getItem("user"));
  },

  getMessages: async (email) => {
    const res = await fetch(`/api/messages?email=${email}`);
    return res.json();
  },

  createMessage: async (data) => {
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  markAsRead: async (id) => {
    await fetch(`/api/messages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_read: true }),
    });
  },
};

export default function Messages() {
  const [user, setUser] = useState(null);
  const [selectedConv, setSelectedConv] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef(null);
  const queryClient = useQueryClient();

  // Load user
  useEffect(() => {
    api.getCurrentUser().then(setUser).catch(() => {});
  }, []);

  // Load messages
  const { data: allMessages = [] } = useQuery({
    queryKey: ["messages", user?.email],
    queryFn: () => api.getMessages(user.email),
    enabled: !!user?.email,
    refetchInterval: 10000,
  });

  /**
   * Group messages into conversations
   */
  const conversations = useMemo(() => {
    const map = {};

    allMessages.forEach((msg) => {
      const id = msg.conversation_id;

      if (!map[id]) {
        map[id] = {
          id,
          messages: [],
          otherName:
            msg.sender_email === user?.email
              ? msg.receiver_email
              : msg.sender_name || msg.sender_email,
          otherEmail:
            msg.sender_email === user?.email
              ? msg.receiver_email
              : msg.sender_email,
          listingTitle: msg.listing_title,
        };
      }

      map[id].messages.push(msg);
    });

    return Object.values(map).sort((a, b) => {
      const aLast = a.messages[a.messages.length - 1];
      const bLast = b.messages[b.messages.length - 1];
      return new Date(bLast.created_date) - new Date(aLast.created_date);
    });
  }, [allMessages, user?.email]);

  const currentConv = conversations.find(
    (c) => c.id === selectedConv
  );

  const currentMessages = currentConv?.messages || [];

  /**
   * Mark messages as read
   */
  useEffect(() => {
    if (!selectedConv || !user?.email) return;

    currentMessages.forEach((msg) => {
      if (msg.receiver_email === user.email && !msg.is_read) {
        api.markAsRead(msg.id);
      }
    });
  }, [selectedConv, currentMessages, user?.email]);

  /**
   * Auto scroll
   */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop =
        scrollRef.current.scrollHeight;
    }
  }, [currentMessages.length]);

  /**
   * Send message
   */
  const sendMessage = useMutation({
    mutationFn: () =>
      api.createMessage({
        conversation_id: selectedConv,
        sender_email: user.email,
        sender_name: user.full_name,
        receiver_email: currentConv.otherEmail,
        content: newMessage,
        listing_title: currentConv.listingTitle,
      }),

    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries(["messages"]);
    },
  });

  if (!user) return null;

  return (
    <div className="pb-20">
      <h1 className="font-bold text-2xl mb-6">Messages</h1>

      <div className="grid md:grid-cols-3 gap-4 h-[calc(100vh-200px)]">

        {/* ================= CONVERSATIONS ================= */}
        <div className={`md:col-span-1 border rounded-xl bg-card ${selectedConv ? "hidden md:block" : ""}`}>
          <ScrollArea className="h-full">
            {conversations.length > 0 ? (
              conversations.map((conv) => {
                const lastMsg =
                  conv.messages[conv.messages.length - 1];

                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConv(conv.id)}
                    className="w-full p-4 text-left border-b hover:bg-secondary/50"
                  >
                    <div className="flex items-center gap-3">

                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>

                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {conv.otherName}
                        </p>

                        {conv.listingTitle && (
                          <p className="text-xs text-primary">
                            {conv.listingTitle}
                          </p>
                        )}

                        <p className="text-xs text-muted-foreground truncate">
                          {lastMsg?.content}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <MessageCircle className="mx-auto mb-2" />
                No messages yet
              </div>
            )}
          </ScrollArea>
        </div>

        {/* ================= CHAT ================= */}
        <div className={`md:col-span-2 border rounded-xl flex flex-col bg-card ${!selectedConv ? "hidden md:flex" : ""}`}>

          {selectedConv ? (
            <>
              {/* Header */}
              <div className="p-4 border-b flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setSelectedConv(null)}
                >
                  <ArrowLeft />
                </Button>

                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>

                <div>
                  <p className="font-medium text-sm">
                    {currentConv.otherName}
                  </p>

                  {currentConv.listingTitle && (
                    <p className="text-xs text-muted-foreground">
                      Re: {currentConv.listingTitle}
                    </p>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div
                ref={scrollRef}
                className="flex-1 overflow-auto p-4 space-y-3"
              >
                {currentMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.sender_email === user.email
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`px-4 py-2 rounded-xl text-sm max-w-[75%] ${
                        msg.sender_email === user.email
                          ? "bg-primary text-white"
                          : "bg-secondary"
                      }`}
                    >
                      <p>{msg.content}</p>
                      <p className="text-[10px] mt-1 opacity-70">
                        {format(
                          new Date(msg.created_date),
                          "HH:mm"
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (newMessage.trim()) sendMessage.mutate();
                }}
                className="p-4 border-t flex gap-2"
              >
                <Input
                  value={newMessage}
                  onChange={(e) =>
                    setNewMessage(e.target.value)
                  }
                  placeholder="Type a message..."
                />

                <Button
                  type="submit"
                  disabled={!newMessage.trim()}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              Select a conversation
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
