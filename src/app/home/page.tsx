"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { 
  collection, getDocs, query, orderBy, 
  doc, updateDoc, increment 
} from "firebase/firestore";
import ReactMarkdown from "react-markdown";

// Separate component for each Post to handle individual "View" logic
function PostCard({ post, onReaction }: { post: any, onReaction: Function }) {
  
  useEffect(() => {
    // Increment view count in Firestore when the post is loaded
    const incrementView = async () => {
      try {
        const postRef = doc(db, "journalEntries", post.id);
        await updateDoc(postRef, {
          views: increment(1)
        });
      } catch (e) {
        console.error("View count error:", e);
      }
    };
    incrementView();
  }, [post.id]);

  return (
    <article className="border-l-4 border-gray-100 pl-8 relative">
      <div className="absolute -left-[10px] top-2 h-4 w-4 rounded-full bg-blue-600 border-4 border-white"></div>
      
      <div className="flex justify-between items-start mb-2">
        <time className="text-xs font-mono text-gray-400 uppercase tracking-widest">
          {new Date(post.date).toDateString()}
        </time>
        {/* VIEW COUNT DISPLAY */}
        <div className="flex items-center gap-1 text-gray-400 font-mono text-xs">
          <span>👁️</span>
          <span>{post.views || 0} views</span>
        </div>
      </div>

      <h2 className="text-4xl font-extrabold mb-8">{post.title}</h2>

      <div className="prose prose-lg prose-slate max-w-none 
        prose-img:rounded-2xl prose-img:border-2 prose-img:border-black 
        prose-img:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </div>
      
      <div className="mt-10 flex items-center gap-6">
        <button 
          onClick={() => onReaction(post.id, 'likes')}
          className="flex items-center gap-2 px-4 py-2 border-2 border-black rounded-lg hover:bg-green-50 transition shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
        >
          <span>👍</span>
          <span className="font-bold">{post.likes || 0}</span>
        </button>

        <button 
          onClick={() => onReaction(post.id, 'dislikes')}
          className="flex items-center gap-2 px-4 py-2 border-2 border-black rounded-lg hover:bg-red-50 transition shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
        >
          <span>👎</span>
          <span className="font-bold">{post.dislikes || 0}</span>
        </button>
      </div>
    </article>
  );
}

export default function HomePage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const q = query(collection(db, "journalEntries"), orderBy("date", "desc"));
      const querySnapshot = await getDocs(q);
      setPosts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleReaction = async (postId: string, type: 'likes' | 'dislikes') => {
    try {
      const postRef = doc(db, "journalEntries", postId);
      await updateDoc(postRef, { [type]: increment(1) });
      setPosts(prev => prev.map(p => 
        p.id === postId ? { ...p, [type]: (p[type] || 0) + 1 } : p
      ));
    } catch (e) { console.error(e); }
  };

  if (loading) return <div className="p-20 text-center font-mono uppercase tracking-widest text-gray-400">Loading Journal...</div>;

  return (
    <main className="max-w-4xl mx-auto py-16 px-6">
      <header className="mb-20 border-b-4 border-black pb-6">
        <h1 className="text-6xl font-black italic tracking-tighter uppercase">Journal</h1>
      </header>

      <div className="space-y-24">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} onReaction={handleReaction} />
        ))}
      </div>
    </main>
  );
}