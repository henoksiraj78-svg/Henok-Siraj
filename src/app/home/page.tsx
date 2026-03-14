"use client";
import { useState, useEffect, useRef } from "react";
import { db, storage } from "@/lib/firebase";
import { 
  collection, addDoc, getDocs, doc, 
  updateDoc, deleteDoc, query, orderBy 
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import ReactMarkdown from "react-markdown";

export default function AdminPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Ref to directly control the file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchPosts = async () => {
    const q = query(collection(db, "journalEntries"), orderBy("date", "desc"));
    const querySnapshot = await getDocs(q);
    setPosts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => { fetchPosts(); }, []);

  // Logic to Upload and immediately insert into the text
  const handleImageUpload = async () => {
    if (!imageFile) return alert("Please select an image first!");
    
    setLoading(true);
    try {
      const storageRef = ref(storage, `journal-media/${Date.now()}_${imageFile.name}`);
      const snapshot = await uploadBytes(storageRef, imageFile);
      const url = await getDownloadURL(snapshot.ref);
      
      // Inserts the markdown image syntax into your content
      setContent(prev => prev + `\n\n![Image description](${url})\n\n`);
      
      // Clear the selection so you can pick another one later
      setImageFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      alert("Image uploaded and added to text!");
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed. Ensure Firebase Storage is set to public.");
    }
    setLoading(false);
  };

  const handleSavePost = async () => {
    if (!title || !content) return alert("Fill in title and content!");
    setLoading(true);
    try {
      const postData = {
        title,
        content,
        date: new Date().toISOString(),
        likes: 0,
        dislikes: 0,
        views: 0
      };

      if (editingId) {
        await updateDoc(doc(db, "journalEntries", editingId), { 
          title, content, lastUpdated: new Date().toISOString() 
        });
        setEditingId(null);
      } else {
        await addDoc(collection(db, "journalEntries"), postData);
      }

      setTitle("");
      setContent("");
      fetchPosts();
      alert("Post saved successfully!");
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 font-sans bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-black mb-8 border-b-4 border-black pb-2 uppercase italic tracking-tighter">
        Admin Panel
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* LEFT: THE EDITOR */}
        <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <input 
            className="w-full p-4 mb-4 border-2 border-black font-bold text-xl outline-none focus:bg-yellow-50"
            placeholder="POST TITLE..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className="mb-6 p-4 bg-gray-100 border-2 border-dashed border-black">
            <label className="block text-xs font-black uppercase mb-2">Insert Media</label>
            <div className="flex flex-col gap-4">
              {/* Native Choose File Input */}
              <input 
                type="file" 
                ref={fileInputRef}
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="text-sm block w-full file:mr-4 file:py-2 file:px-4 file:border-2 file:border-black file:text-xs file:font-black file:uppercase file:bg-white hover:file:bg-gray-100 cursor-pointer"
              />
              <button 
                onClick={handleImageUpload}
                disabled={!imageFile || loading}
                className="bg-blue-600 text-white py-2 font-black uppercase text-xs shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 disabled:bg-gray-300"
              >
                {loading ? "UPLOADING..." : "Confirm & Insert into Text"}
              </button>
            </div>
          </div>

          <textarea 
            className="w-full p-4 border-2 border-black h-96 font-mono text-sm outline-none focus:bg-yellow-50 leading-relaxed"
            placeholder="Write your story using Markdown..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <button 
            onClick={handleSavePost}
            disabled={loading}
            className="w-full mt-6 bg-black text-white py-4 font-black uppercase tracking-widest hover:bg-gray-900 transition shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]"
          >
            {editingId ? "Update Changes" : "Publish to Journal"}
          </button>
        </div>

        {/* RIGHT: LIVE PREVIEW */}
        <div className="bg-white border-2 border-gray-200 p-8 sticky top-6 h-fit max-h-[90vh] overflow-y-auto">
          <p className="text-[10px] font-black text-gray-400 mb-4 uppercase tracking-widest">Live Rendering</p>
          <h2 className="text-3xl font-black mb-6 italic tracking-tight">{title || "No Title"}</h2>
          <div className="prose prose-slate max-w-none 
            prose-img:rounded-none prose-img:border-4 prose-img:border-black prose-img:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <ReactMarkdown>
              {content || "*Write something to see the preview...*"}
            </ReactMarkdown>
          </div>
        </div>
      </div>

      {/* POST MANAGEMENT LIST */}
      <div className="mt-20">
        <h2 className="text-2xl font-black mb-6 uppercase">Existing Entries</h2>
        <div className="grid gap-4">
          {posts.map(post => (
            <div key={post.id} className="bg-white border-2 border-black p-4 flex justify-between items-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <span className="font-bold uppercase text-sm tracking-tighter">{post.title}</span>
              <div className="flex gap-4">
                <button 
                  onClick={() => { setEditingId(post.id); setTitle(post.title); setContent(post.content); window.scrollTo(0,0); }} 
                  className="text-blue-600 font-black text-xs uppercase hover:underline"
                >
                  Edit
                </button>
                <button 
                  onClick={async () => { if(confirm("Delete forever?")) { await deleteDoc(doc(db, "journalEntries", post.id)); fetchPosts(); } }} 
                  className="text-red-600 font-black text-xs uppercase hover:underline"
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