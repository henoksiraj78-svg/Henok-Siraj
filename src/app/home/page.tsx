"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, doc, updateDoc, increment } from "firebase/firestore";
import ReactMarkdown from "react-markdown";

function PostEntry({ post, onReaction }: { post: any, onReaction: Function }) {
  const [userChoice, setUserChoice] = useState<string | null>(null);

  useEffect(() => {
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
      <div className="flex justify-between items-center mb-6">
        <time className="text-sm font-mono font-bold text-gray-500 uppercase">
          {new Date(post.date).toDateString()}
        </time>
        <span className="text-xs bg-black text-white px-2 py-0.5 font-mono">
          👁️ {post.views || 0} VIEWS
        </span>
      </div>

      <h2 className="text-5xl font-black mb-10 leading-[0.9] tracking-tighter uppercase italic">
        {post.title}
      </h2>

      {/* BEAUTIFUL WRAPPING CONTENT */}
      <div className="prose prose-lg prose-slate max-w-none 
        prose-p:text-justify prose-p:leading-relaxed prose-p:mb-6
        prose-headings:text-black prose-headings:font-black">
        <ReactMarkdown
          components={{
            // This logic makes images float and allows text to wrap around them
            img: ({node, ...props}) => (
              <img 
                {...props} 
                className="w-full md:w-1/2 md:float-right md:ml-8 mb-6 rounded-none border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-x-1 hover:-translate-y-1" 
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
          className={`flex items-center gap-2 px-6 py-2 border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all
            ${userChoice === 'likes' ? 'bg-green-400' : 'bg-white'}`}
        >
          👍 {post.likes || 0}
        </button>

        <button 
          onClick={() => { onReaction(post.id, 'dislikes'); setUserChoice('dislikes'); }}
          className={`flex items-center gap-2 px-6 py-2 border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all
            ${userChoice === 'dislikes' ? 'bg-red-400' : 'bg-white'}`}
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
    const q = query(collection(db, "journalEntries"), orderBy("date", "desc"));
    const querySnapshot = await getDocs(q);
    setPosts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, []);

  if (loading) return <div className="p-20 text-center font-black text-2xl italic">LOADING...</div>;

  return (
    <main className="max-w-5xl mx-auto py-20 px-8">
      <header className="mb-24 border-b-8 border-black pb-4">
        <h1 className="text-8xl font-black italic tracking-tighter">JOURNAL.</h1>
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
            fetchPosts();
          }} />
        ))}
      </div>
    </main>
  );
}