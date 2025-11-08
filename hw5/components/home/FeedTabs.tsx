"use client"

import { useState } from "react"
import { PostFeed } from "@/components/post/PostFeed"

export function FeedTabs() {
  const [activeTab, setActiveTab] = useState<"all" | "following">("all")

  return (
    <>
      {/* Feed Tabs */}
      <div className="flex border-b border-gray-800">
        <button
          onClick={() => setActiveTab("all")}
          className={`flex-1 py-4 text-center font-semibold hover:bg-gray-900 transition-colors relative ${
            activeTab === "all"
              ? "text-white"
              : "text-gray-500"
          }`}
        >
          For you
          {activeTab === "all" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab("following")}
          className={`flex-1 py-4 text-center font-semibold hover:bg-gray-900 transition-colors relative ${
            activeTab === "following"
              ? "text-white"
              : "text-gray-500"
          }`}
        >
          Following
          {activeTab === "following" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></div>
          )}
        </button>
      </div>

      {/* Post Feed */}
      <PostFeed filter={activeTab} />
    </>
  )
}

