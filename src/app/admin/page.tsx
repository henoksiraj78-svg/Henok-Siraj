"use client";
import { useState, useEffect } from "react";
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

  // Load posts for the management list
  const fetchPosts = async () => {
    const q = query(collection(db, "journalEntries"), orderBy("date", "desc"));
    const querySnapshot = await getDocs(q);
    setPosts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => { fetchPosts(); }, []);

  // 1. Upload image and insert the Markdown syntax into the textarea
  const insertImageToText = async () => {
    if (!imageFile) return alert("Please select an image first!");
    setLoading(true);
    try {
      const fileRef = ref(storage, `journal-media/${Date.now()}_${imageFile.name}`);
      await uploadBytes(fileRef, imageFile);
      const url = await getDownloadURL(fileRef);
      
      // Appends the markdown image code to your current content
      setContent(prev => prev + `\n\n![Image](${url})\n\n`);
      setImageFile(null); 
      alert("Image link added to text editor!");
    } catch (e) {
      console.error(e);
      alert("Upload failed.");
    }
    setLoading(false);
  };

  // 2. Save new post or Update existing post
  const handleSave = async () => {
    if (!title || !content) return alert("Title and Content are required!");
    setLoading(true);
    try {
      if (editingId) {
        // UPDATE EXISTING
        const postRef = doc(db, "journalEntries", editingId);
        await updateDoc(postRef, {
          title,
          content,
          lastUpdated: new Date().toISOString()
        });
        setEditingId(null);
      } else {
        // CREATE NEW
        await addDoc(collection(db, "journalEntries"), {
          title,
          content,
          date: new Date().toISOString(),
          likes: 0,
          dislikes: 0,
          views: 0
        });
      }

      setTitle("");
      setContent("");
      fetchPosts();
      alert("Success!");
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const startEdit = (post: any) => {
    setEditingId(post.id);
    setTitle(post.title);
    setContent(post.content);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 font-sans min-h-screen bg-gray-50">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter">Admin Control</h1>
          <p className="text-gray-500 font-mono text-xs">Manage your journal entries and media</p>
        </div>
        {editingId && (
          <button onClick={() => {setEditingId(null); setTitle(""); setContent("");}} className="text-red-600 font-bold border-2 border-red-600 px-3 py-1 rounded hover:bg-red-50">
            Cancel Edit
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* EDITOR SECTION */}
        <div className="bg-white border-4 border-black p-6 rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <label className="block font-bold mb-2 uppercase text-sm">Post Title</label>
          <input 
            className="w-full p-3 mb-6 border-2 border-black rounded-none focus:ring-2 ring-blue-500 outline-none"
            value={title} 
            onChange={e => setTitle(e.target.value)} 
          />

          <label className="block font-bold mb-2 uppercase text-sm">Media Upload</label>
          <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-gray-100 border-2 border-black border-dashed">
            <input type="file" onChange={e => setImageFile(e.target.files?.[0] || null)} className="text-sm" />
            <button 
              onClick={insertImageToText}
              disabled={loading || !imageFile}
              className="bg-blue-600 text-white px-4 py-2 font-bold text-xs uppercase hover:bg-blue-700 disabled:bg-gray-400"
            >
              Insert Image into Text
            </button>
          </div>

          <label className="block font-bold mb-2 uppercase text-sm">Content (Markdown)</label>
          <textarea 
            className="w-full p-4 mb-6 border-2 border-black rounded-none h-96 font-mono text-sm focus:ring-2 ring-blue-500 outline-none"
            value={content} 
            onChange={e => setContent(e.target.value)}
          />

          <button 
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-black text-white py-4 font-black uppercase tracking-widest hover:bg-gray-800 transition shadow-[4px_4px_0px_0px_rgba(100,100,100,1)] active:shadow-none"
          >
            {loading ? "Processing..." : editingId ? "Save Changes" : "Publish to Journal"}
          </button>
        </div>

        {/* PREVIEW SECTION */}
        <div className="hidden lg:block">
          <h3 className="font-bold mb-4 uppercase text-gray-400 tracking-widest text-xs">Live Preview</h3>
          <div className="bg-white border-2 border-gray-200 p-8 min-h-[600px] rounded-xl shadow-inner">
             <h1 className="text-3xl font-extrabold mb-6">{title || "Untitled Entry"}</h1>
             <div className="prose prose-slate max-w-none prose-img:rounded-lg prose-img:border prose-img:shadow-md">
                <ReactMarkdown>{content || "*Start writing to see preview...*"}</ReactMarkdown>
             </div>
          </div>
        </div>
      </div>

      {/* POST LIST */}
      <section className="mt-20">
        <h2 className="text-2xl font-black mb-6 uppercase border-b-4 border-black pb-2 inline-block">Recent Entries</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {posts.map(post => (
            <div key={post.id} className="bg-white border-2 border-black p-4 flex justify-between items-center hover:bg-yellow-50 transition shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div>
                <p className="font-bold truncate max-w-[200px]">{post.title}</p>
                <p className="text-[10px] font-mono text-gray-400 uppercase">{new Date(post.date).toDateString()}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => startEdit(post)} className="text-xs font-bold uppercase text-blue-600 hover:underline">Edit</button>
                <button 
                  onClick={async () => {
                    if(confirm("Permanently delete this post?")) {
                      await deleteDoc(doc(db, "journalEntries", post.id));
                      fetchPosts();
                    }
                  }} 
                  className="text-xs font-bold uppercase text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}