"use client";
import { useState, useEffect } from "react";
import { db, storage } from "@/lib/firebase";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function AdminPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchPosts = async () => {
    const q = query(collection(db, "journalEntries"), orderBy("date", "desc"));
    const querySnapshot = await getDocs(q);
    setPosts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleSave = async () => {
    if (!title || !content) return alert("Please fill title and content");
    setLoading(true);
    try {
      let imageUrl = "";
      if (imageFile) {
        const fileRef = ref(storage, `journal/${Date.now()}_${imageFile.name}`);
        await uploadBytes(fileRef, imageFile);
        imageUrl = await getDownloadURL(fileRef);
      }

      const postData: any = { title, content, date: new Date().toISOString() };
      if (imageUrl) postData.image = imageUrl;

      if (editingId) {
        await updateDoc(doc(db, "journalEntries", editingId), postData);
        setEditingId(null);
      } else {
        await addDoc(collection(db, "journalEntries"), postData);
      }

      setTitle(""); setContent(""); setImageFile(null);
      fetchPosts();
      alert("Success!");
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const startEdit = (post: any) => {
    setEditingId(post.id);
    setTitle(post.title);
    setContent(post.content);
    window.scrollTo(0, 0);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 font-sans">
      <div className="bg-white border-2 border-black p-6 rounded-lg mb-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <h2 className="text-2xl font-bold mb-4">{editingId ? "Edit Post" : "New Journal Entry"}</h2>
        <input className="w-full p-3 mb-3 border-2 border-black rounded" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
        <input type="file" className="mb-4 block" onChange={e => setImageFile(e.target.files?.[0] || null)} />
        <textarea className="w-full p-3 mb-4 border-2 border-black rounded h-40" placeholder="Write your content..." value={content} onChange={e => setContent(e.target.value)} />
        <button onClick={handleSave} disabled={loading} className="bg-black text-white px-8 py-3 rounded font-bold hover:bg-gray-800 transition">
          {loading ? "Processing..." : editingId ? "Update Post" : "Publish to Blog"}
        </button>
      </div>

      <div className="space-y-4">
        {posts.map(post => (
          <div key={post.id} className="flex justify-between items-center p-4 border-2 border-black rounded shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div>
              <p className="font-bold">{post.title}</p>
              <p className="text-xs text-gray-500">{new Date(post.date).toDateString()}</p>
            </div>
            <div className="flex gap-4">
              <button onClick={() => startEdit(post)} className="text-blue-600 font-bold hover:underline">Edit</button>
              <button onClick={async () => { if(confirm("Delete?")) { await deleteDoc(doc(db, "journalEntries", post.id)); fetchPosts(); } }} className="text-red-600 font-bold hover:underline">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}