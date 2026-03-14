"use client";
import { useState, useEffect, useRef } from "react";
import { db, storage } from "@/lib/firebase";
import { 
  collection, addDoc, getDocs, doc, 
  updateDoc, deleteDoc, query, orderBy 
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import ReactMarkdown from "react-markdown";
import imageCompression from 'browser-image-compression';

export default function AdminPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mounted, setMounted] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Fetch Posts from Firebase
  const fetchPosts = async () => {
    try {
      const q = query(collection(db, "journalEntries"), orderBy("date", "desc"));
      const querySnapshot = await getDocs(q);
      setPosts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (e) { console.error("Error fetching posts:", e); }
  };

  useEffect(() => {
    setMounted(true);
    fetchPosts();
  }, []);

  // 2. The Edit Function (This fixes the red line)
  const startEdit = (post: any) => {
    setEditingId(post.id);
    setTitle(post.title);
    setContent(post.content);
    // Smooth scroll back to the editor at the top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 3. Optimized Image Upload
  const handleImageUpload = async () => {
    if (!imageFile) return alert("Please select an image first!");
    setLoading(true);
    setProgress(1);

    try {
      const options = {
        maxSizeMB: 0.15, // 150KB for fast uploads in Assosa
        maxWidthOrHeight: 1000,
        useWebWorker: true,
      };

      const compressedFile = await imageCompression(imageFile, options);
      const storageRef = ref(storage, `journal-media/${Date.now()}_${compressedFile.name}`);
      const uploadTask = uploadBytesResumable(storageRef, compressedFile);

      uploadTask.on('state_changed', 
        (snapshot) => {
          const pct = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(Math.round(pct));
        }, 
        (error) => {
          console.error("Upload error:", error);
          setLoading(false);
          setProgress(0);
        }, 
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          setContent(prev => prev + `\n\n![Image](${url})\n\n`);
          setImageFile(null);
          if (fileInputRef.current) fileInputRef.current.value = "";
          setProgress(0);
          setLoading(false);
        }
      );
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  // 4. Save or Update Post
  const handleSavePost = async () => {
    if (!title || !content) return alert("Fill in title and content!");
    setLoading(true);
    try {
      if (editingId) {
        await updateDoc(doc(db, "journalEntries", editingId), { 
          title, content, lastUpdated: new Date().toISOString() 
        });
        setEditingId(null);
      } else {
        await addDoc(collection(db, "journalEntries"), {
          title, content, date: new Date().toISOString(),
          likes: 0, dislikes: 0, views: 0
        });
      }
      setTitle(""); setContent(""); fetchPosts();
      alert("Success!");
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  if (!mounted) return null;

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen font-sans">
      <header className="mb-10 border-b-8 border-black pb-4 flex justify-between items-end">
        <h1 className="text-6xl font-black uppercase italic tracking-tighter">Admin</h1>
        {editingId && (
          <button 
            onClick={() => {setEditingId(null); setTitle(""); setContent("");}} 
            className="bg-red-600 text-white px-4 py-2 font-black uppercase text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none"
          >
            Cancel Edit
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* LEFT: EDITOR */}
        <div className="bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
          <input 
            className="w-full p-4 mb-6 border-4 border-black font-bold text-2xl outline-none focus:bg-yellow-50"
            placeholder="POST TITLE..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className="mb-8 p-6 bg-gray-100 border-4 border-dashed border-black">
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="text-xs mb-4 block w-full file:mr-4 file:py-2 file:px-4 file:border-2 file:border-black file:font-black file:uppercase file:bg-white"
            />
            
            <div className="h-10 w-full bg-gray-200 border-2 border-black mb-4 relative flex items-center justify-center overflow-hidden">
                <div 
                    className="absolute left-0 top-0 h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                ></div>
                <span className="relative z-10 font-black text-xs uppercase mix-blend-difference text-white">
                    {loading ? `Uploading: ${progress}%` : "Ready"}
                </span>
            </div>

            <button 
              onClick={handleImageUpload}
              disabled={!imageFile || loading}
              className="w-full bg-black text-white py-3 font-black uppercase text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]"
            >
              {loading ? "Working..." : "Insert Compressed Image"}
            </button>
          </div>

          <textarea 
            className="w-full p-6 border-4 border-black h-[400px] font-mono text-sm outline-none focus:bg-yellow-50"
            placeholder="Write your content..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <button 
            onClick={handleSavePost}
            className="w-full mt-8 bg-black text-white py-6 font-black uppercase text-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
          >
            {editingId ? "Update Entry" : "Publish to Journal"}
          </button>
        </div>

        {/* RIGHT: PREVIEW */}
        <div className="bg-white border-4 border-black p-8 sticky top-10 h-fit max-h-[85vh] overflow-y-auto">
          <p className="text-[10px] font-black text-gray-400 mb-6 uppercase tracking-widest">Live Rendering</p>
          <h2 className="text-4xl font-black mb-6 italic border-b-2 border-gray-100 pb-4">{title || "Untitled"}</h2>
          <div className="prose prose-slate max-w-none 
            prose-img:rounded-none prose-img:border-4 prose-img:border-black prose-img:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <ReactMarkdown>{content || "*Preview...*"}</ReactMarkdown>
          </div>
        </div>
      </div>

      {/* RECENT POSTS (Archive) */}
      <div className="mt-24">
        <h2 className="text-2xl font-black mb-6 uppercase border-b-4 border-black inline-block">Post Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((post: any) => (
            <div key={post.id} className="bg-white border-4 border-black p-4 flex flex-col justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <p className="font-black uppercase text-xs truncate mb-4">{post.title}</p>
              <div className="flex gap-4">
                {/* NO MORE RED LINE HERE */}
                <button onClick={() => startEdit(post)} className="text-[10px] font-black text-blue-600 uppercase hover:underline">Edit</button>
                <button 
                  onClick={async () => {
                    if(confirm("Delete this?")) {
                      await deleteDoc(doc(db, "journalEntries", post.id));
                      fetchPosts();
                    }
                  }} 
                  className="text-[10px] font-black text-red-600 uppercase hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}