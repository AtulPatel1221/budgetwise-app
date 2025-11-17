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
    <div
      className="
        min-h-screen 
        px-4 md:px-6 py-10 
        bg-gradient-to-br 
        from-[#4c1d95] via-[#6d28d9] to-[#db2777]
      "
    >
      <div className="max-w-3xl mx-auto">

        {/* 🟢 SECTION HEADER */}
        <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <span className="text-green-300 text-xl">💬</span> Latest Discussions
        </h1>

        {/* 🟢 Create New Post */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white shadow-md rounded-2xl p-5 mb-10 border border-gray-200"
        >
          <h2 className="text-gray-700 font-semibold mb-3">
            What's on your mind?
          </h2>

          <textarea
            className="w-full border border-gray-300 p-3 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Share your thoughts..."
            rows={3}
            value={newPost.content}
            onChange={(e) =>
              setNewPost({ ...newPost, content: e.target.value })
            }
          />

          <button
            onClick={createPost}
            className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl font-semibold transition"
          >
            Post to Community
          </button>
        </motion.div>

        {/* 🟢 Posts List */}
        {posts.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white shadow-md rounded-2xl p-5 mb-6 border border-gray-200"
          >
            {/* USER */}
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-indigo-100 text-indigo-700 w-10 h-10 rounded-full flex items-center justify-center font-bold">
                {p.user.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-800">{p.user.username}</p>
                <p className="text-xs text-gray-500">
                  {new Date(p.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            {/* CONTENT */}
            <p className="text-gray-700 leading-relaxed">{p.content}</p>

            {/* ACTIONS */}
            <div className="flex items-center gap-6 text-gray-600 text-sm mt-4">

              <button
                onClick={() => likePost(p.id)}
                className="flex items-center gap-1 hover:text-green-600 transition"
              >
                <Heart
                  size={18}
                  className={`${
                    likedPosts.has(p.id) ? "text-red-500 fill-red-500" : ""
                  }`}
                />
                {p.likesCount} Likes
              </button>

              <div className="flex items-center gap-1">
                <MessageCircle size={18} />
                {p.comments.length} Comments
              </div>
            </div>

            {/* COMMENT INPUT */}
            <div className="mt-4 flex items-center gap-2">
              <input
                className="flex-1 border border-gray-300 p-2 rounded-xl bg-gray-50 focus:ring-2 focus:ring-indigo-400"
                placeholder="Write a comment..."
                value={commentText[p.id] || ""}
                onChange={(e) =>
                  setCommentText({ ...commentText, [p.id]: e.target.value })
                }
              />

              <button
                onClick={() => addComment(p.id)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-xl"
              >
                <Send size={18} />
              </button>
            </div>

            {/* COMMENTS */}
            {p.comments.length > 0 && (
              <div className="mt-4 space-y-3">
                {p.comments.map((c) => (
                  <div
                    key={c.id}
                    className="bg-gray-50 border border-gray-200 p-2 rounded-xl shadow-sm"
                  >
                    <p className="text-gray-700 text-sm">{c.content}</p>
                    <p className="text-xs text-gray-500">— {c.user.username}</p>
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
