"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { 
  collection, getDocs, query, orderBy, 
  doc, updateDoc, increment 
} from "firebase/firestore";
import ReactMarkdown from "react-markdown";

// Component for each individual post
function PostEntry({ post, onReaction }: { post: any, onReaction: Function }) {
  const [userChoice, setUserChoice] = useState<string | null>(null);

  useEffect(() => {
    // 1. Check local storage for existing vote color
    const saved = localStorage.getItem(`voted_${post.id}`);
    if (saved) setUserChoice(saved);

    // 2. Increment VIEW count once when post mounts
    const addView = async () => {
      try {
        const postRef = doc(db, "journalEntries", post.id);
        await updateDoc(postRef, { views: increment(1) });
      } catch (e) { console.error("View error", e); }
    };
    addView();
  }, [post.id]);

  return (
    <article className="border-l-4 border-black pl-8 relative pb-12">
      <div className="absolute -left-[10px] top-2 h-4 w-4 rounded-full bg-blue-600 border-4 border-white shadow-sm"></div>
      
      <div className="flex justify-between items-center mb-4">
        <time className="text-xs font-mono text-gray-400 uppercase tracking-widest">
          {new Date(post.date).toDateString()}
        </time>
        <div className="text-[10px] font-mono bg-gray-100 px-2 py-1 rounded text-gray-500">
          👁️ {post.views || 0} VIEWS
        </div>
      </div>

      <h2 className="text-4xl font-black mb-8 leading-tight">{post.title}</h2>

      <div className="prose prose-lg prose-slate max-w-none mb-10 
        prose-img:rounded-xl prose-img:border-2 prose-img:border-black 
        prose-img:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </div>
      
      <div className="flex gap-6">
        <button 
          onClick={() => { onReaction(post.id, 'likes'); setUserChoice('likes'); }}
          className={`flex items-center gap-2 px-6 py-2 border-2 border-black font-bold transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1
            ${userChoice === 'likes' ? 'bg-green-400' : 'bg-white hover:bg-gray-50'}`}
        >
          👍 {post.likes || 0}
        </button>

        <button 
          onClick={() => { onReaction(post.id, 'dislikes'); setUserChoice('dislikes'); }}
          className={`flex items-center gap-2 px-6 py-2 border-2 border-black font-bold transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1
            ${userChoice === 'dislikes' ? 'bg-red-400' : 'bg-white hover:bg-gray-50'}`}
        >
          👎 {post.dislikes || 0}
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

  const handleReaction = async (postId: string, newType: 'likes' | 'dislikes') => {
    const storageKey = `voted_${postId}`;
    const previousType = localStorage.getItem(storageKey);

    if (previousType === newType) return;

    try {
      const postRef = doc(db, "journalEntries", postId);
      let updates: any = {};

      if (!previousType) {
        updates[newType] = increment(1);
      } else {
        updates[previousType] = increment(-1);
        updates[newType] = increment(1);
      }

      await updateDoc(postRef, updates);
      localStorage.setItem(storageKey, newType);
      fetchPosts(); // Refresh data to show updated counts
    } catch (e) { console.error(e); }
  };

  if (loading) return <div className="p-20 text-center font-mono animate-pulse">Initializing Journal...</div>;

  return (
    <main className="max-w-4xl mx-auto py-20 px-6">
      <header className="mb-24">
        <h1 className="text-7xl font-black italic tracking-tighter border-b-8 border-black pb-4 inline-block">BLOG</h1>
      </header>

      <div className="space-y-32">
        {posts.map((post) => (
          <PostEntry key={post.id} post={post} onReaction={handleReaction} />
        ))}
      </div>
    </main>
  );
}