"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, doc, updateDoc, increment } from "firebase/firestore";
import ReactMarkdown from "react-markdown";

function PostEntry({ post, onReaction }: { post: any, onReaction: Function }) {
  const [userChoice, setUserChoice] = useState<string | null>(null);

  useEffect(() => {
    // Only runs on the client
    const saved = localStorage.getItem(`voted_${post.id}`);
    if (saved) setUserChoice(saved);

    const addView = async () => {
      try {
        const postRef = doc(db, "journalEntries", post.id);
        await updateDoc(postRef, { views: increment(1) });
      } catch (e) { console.error(e); }
    };
    addView();
  }, [post.id]);

  return (
    <article className="border-b-2 border-black pb-16 mb-16 last:border-0">
      <div className="flex justify-between items-center mb-6 text-sm font-mono font-bold text-gray-500">
        <time>{new Date(post.date).toDateString()}</time>
        <span>👁️ {post.views || 0} VIEWS</span>
      </div>

      {/* FIXED: Title is a standalone block */}
      <h2 className="text-5xl font-black mb-10 leading-none uppercase italic tracking-tighter">
        {post.title}
      </h2>

      {/* FIXED: Markdown is in its own div container */}
      <div className="prose prose-lg prose-slate max-w-none 
        prose-p:text-justify prose-p:leading-relaxed 
        prose-img:rounded-none prose-img:border-4 prose-img:border-black 
        prose-img:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <ReactMarkdown
          components={{
            img: ({node, ...props}) => (
              <img 
                {...props} 
                className="w-full md:w-1/2 md:float-right md:ml-8 mb-6 transition-transform hover:-translate-x-1" 
              />
            )
          }}
        >
          {post.content}
        </ReactMarkdown>
      </div>
      
      <div className="flex gap-4 mt-8 clear-both">
        <button 
          onClick={() => { onReaction(post.id, 'likes'); setUserChoice('likes'); }}
          className={`px-6 py-2 border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-1 transition-all ${userChoice === 'likes' ? 'bg-green-400' : 'bg-white'}`}
        >
          👍 {post.likes || 0}
        </button>

        <button 
          onClick={() => { onReaction(post.id, 'dislikes'); setUserChoice('dislikes'); }}
          className={`px-6 py-2 border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-1 transition-all ${userChoice === 'dislikes' ? 'bg-red-400' : 'bg-white'}`}
        >
          👎 {post.dislikes || 0}
        </button>
      </div>
    </article>
  );
}

export default function HomePage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fetchPosts = async () => {
      const q = query(collection(db, "journalEntries"), orderBy("date", "desc"));
      const querySnapshot = await getDocs(q);
      setPosts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchPosts();
  }, []);

  if (!mounted) return <div className="p-20 text-center font-black italic">LOADING...</div>;

  return (
    <main className="max-w-5xl mx-auto py-20 px-8">
      <header className="mb-24 border-b-8 border-black pb-4">
        <h1 className="text-8xl font-black italic tracking-tighter uppercase">Journal</h1>
      </header>
      <div className="space-y-12">
        {posts.map((post) => (
          <PostEntry key={post.id} post={post} onReaction={async (id: string, type: string) => {
            const storageKey = `voted_${id}`;
            const prev = localStorage.getItem(storageKey);
            if (prev === type) return;
            const postRef = doc(db, "journalEntries", id);
            let up: any = {};
            if (!prev) { up[type] = increment(1); } 
            else { up[prev] = increment(-1); up[type] = increment(1); }
            await updateDoc(postRef, up);
            localStorage.setItem(storageKey, type);
            // Instant refresh
            setPosts(prevPosts => prevPosts.map(p => {
              if (p.id === id) {
                const updated = { ...p };
                if (prev) updated[prev] -= 1;
                updated[type] += 1;
                return updated;
              }
              return p;
            }));
          }} />
        ))}
      </div>
    </main>
  );
}