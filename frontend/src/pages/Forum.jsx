import React, { useEffect, useState } from "react";
import API from "../services/api";
import { motion } from "framer-motion";
import { MessageCircle, Heart, Send } from "lucide-react";

export default function Forum() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({ content: "" });
  const [commentText, setCommentText] = useState({});
  const [likedPosts, setLikedPosts] = useState(new Set());

  // Load Posts
  const fetchPosts = async () => {
    try {
      const res = await API.get("/forum/posts");
      setPosts(res.data);
    } catch (err) {
      console.error("❌ Error fetching posts:", err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Create Post
  const createPost = async () => {
    if (!newPost.content.trim()) return alert("Please write something!");

    try {
      await API.post("/forum/posts", {
        title: "Discussion",
        content: newPost.content,
      });

      setNewPost({ content: "" });
      fetchPosts();
    } catch (err) {
      console.error("❌ Error creating post:", err);
    }
  };

  // Comment
  const addComment = async (postId) => {
    if (!commentText[postId]?.trim()) return;

    try {
      await API.post(`/forum/comments/${postId}`, {
        content: commentText[postId],
      });

      setCommentText({ ...commentText, [postId]: "" });
      fetchPosts();
    } catch (err) {
      console.error("❌ Error adding comment:", err);
    }
  };

  // Like
  const likePost = async (postId) => {
    if (likedPosts.has(postId)) return;

    try {
      await API.post(`/forum/like/${postId}`);
      const updated = new Set(likedPosts);
      updated.add(postId);
      setLikedPosts(updated);
      fetchPosts();
    } catch (err) {
      console.error("❌ Error liking post:", err);
    }
  };

  return (
    <div className="min-h-screen px-4 md:px-6 py-10 bg-gradient-to-br from-[#4c1d95] via-[#6d28d9] to-[#db2777]">
      <div className="max-w-3xl mx-auto">

        <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          💬 Latest Discussions
        </h1>

        {/* CREATE POST */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white shadow-md rounded-2xl p-5 mb-10"
        >
          <textarea
            className="w-full border p-3 rounded-xl"
            placeholder="Share your thoughts..."
            rows={3}
            value={newPost.content}
            onChange={(e) =>
              setNewPost({ ...newPost, content: e.target.value })
            }
          />

          <button
            onClick={createPost}
            className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-xl"
          >
            Post to Community
          </button>
        </motion.div>

        {/* POSTS */}
        {posts.map((p) => (
          <motion.div
            key={p.id}
            className="bg-white shadow-md rounded-2xl p-5 mb-6"
          >
            {/* USER HEADER */}
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-indigo-100 text-indigo-700 w-10 h-10 rounded-full flex items-center justify-center font-bold">
                {(p.username || "U")[0].toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-800">
                  {p.username || "Unknown"}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(p.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            {/* CONTENT */}
            <p className="text-gray-700">{p.content}</p>

            {/* ACTIONS */}
            <div className="flex items-center gap-6 text-gray-600 text-sm mt-4">
              <button
                onClick={() => likePost(p.id)}
                className="flex items-center gap-1"
              >
                <Heart
                  size={18}
                  className={likedPosts.has(p.id) ? "text-red-500 fill-red-500" : ""}
                />
                {p.likesCount} Likes
              </button>

              <div className="flex items-center gap-1">
                <MessageCircle size={18} />
                {(p.comments || []).length} Comments
              </div>
            </div>

            {/* COMMENT INPUT */}
            <div className="mt-4 flex items-center gap-2">
              <input
                className="flex-1 border p-2 rounded-xl"
                placeholder="Write a comment..."
                value={commentText[p.id] || ""}
                onChange={(e) =>
                  setCommentText({ ...commentText, [p.id]: e.target.value })
                }
              />

              <button
                onClick={() => addComment(p.id)}
                className="bg-indigo-600 text-white p-2 rounded-xl"
              >
                <Send size={18} />
              </button>
            </div>

            {/* COMMENTS LIST */}
            {(p.comments || []).length > 0 && (
              <div className="mt-4 space-y-2">
                {p.comments.map((c) => (
                  <div
                    key={c.id}
                    className="bg-gray-50 border p-2 rounded-xl"
                  >
                    <p className="text-sm">{c.content}</p>
                    <p className="text-xs text-gray-500">
                      — {c.username || "Anonymous"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
