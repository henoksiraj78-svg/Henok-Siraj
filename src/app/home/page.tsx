"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

export default function HomePage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch posts from Firestore
  const fetchPosts = async () => {
    try {
      const q = query(collection(db, "journalEntries"), orderBy("date", "desc"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl font-mono">Loading Journal...</p>
      </div>
    );
  }

  return (
    <main className="max-w-3xl mx-auto py-12 px-6">
      <header className="mb-16 border-b-2 border-black pb-4">
        <h1 className="text-5xl font-serif font-bold italic">Journal</h1>
        <p className="text-gray-500 mt-2 font-mono uppercase tracking-widest text-sm">
          {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </p>
      </header>

      <div className="space-y-20">
        {posts.length > 0 ? (
          posts.map((post) => (
            <article key={post.id} className="group">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-3 w-3 rounded-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)]"></div>
                <time className="text-sm font-mono text-gray-400 uppercase">
                  {new Date(post.date).toDateString()}
                </time>
              </div>

              <h2 className="text-3xl font-bold mb-4 hover:text-blue-600 transition-colors cursor-pointer">
                {post.title}
              </h2>

              {/* IMAGE LOGIC: This displays your uploaded Firebase photo */}
              {post.image && (
                <div className="mb-6 overflow-hidden rounded-xl border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-[400px] object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              )}

              <p className="text-lg leading-relaxed text-gray-700 whitespace-pre-wrap">
                {post.content}
              </p>
              
              <div className="mt-6 flex gap-2">
                <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-bold uppercase">
                  #Academic
                </span>
              </div>
            </article>
          ))
        ) : (
          <div className="text-center py-20 border-2 border-dashed border-gray-300 rounded-xl">
            <p className="text-gray-400 italic">No posts found. Go to /admin to write your first story!</p>
          </div>
        )}
      </div>
    </main>
  );
}