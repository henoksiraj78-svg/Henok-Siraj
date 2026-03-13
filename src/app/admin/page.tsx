"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import Navbar from '@/components/Navbar';

export default function AdminPage() {
  const [isAuth, setIsAuth] = useState(false);
  const [pass, setPass] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [entries, setEntries] = useState([]);

  const SECRET = "Asosa2026"; // Change this to your preferred password

  const fetchEntries = async () => {
    const q = query(collection(db, "journalEntries"), orderBy("date", "desc"));
    const snap = await getDocs(q);
    setEntries(snap.docs.map(d => ({ id: d.id, ...d.data() })) as any);
  };

  useEffect(() => { if (isAuth) fetchEntries(); }, [isAuth]);

  const handleSave = async () => {
    if (!title || !content) return alert("Please fill everything!");
    await addDoc(collection(db, "journalEntries"), {
      title, content, mood: "😊", date: new Date().toISOString()
    });
    setTitle(''); setContent(''); fetchEntries();
    alert("Memory Locked in the Cloud!");
  };

  if (!isAuth) return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <div className="p-8 bg-white shadow-xl rounded-2xl w-80 text-center">
        <h2 className="font-bold mb-4">Admin Access</h2>
        <input type="password" placeholder="Password" onChange={(e)=>setPass(e.target.value)} className="border p-2 w-full rounded mb-4" />
        <button onClick={() => pass === SECRET ? setIsAuth(true) : alert("Wrong!")} className="bg-black text-white w-full py-2 rounded">Unlock</button>
      </div>
    </div>
  );

  return (
    <main><Navbar />
      <div className="max-w-2xl mx-auto py-12 px-6">
        <h1 className="text-2xl font-bold mb-6">Write Today's Story</h1>
        <input placeholder="Title" value={title} onChange={(e)=>setTitle(e.target.value)} className="w-full text-xl font-bold p-2 border-b mb-4 outline-none" />
        <textarea placeholder="What happened today?" value={content} onChange={(e)=>setContent(e.target.value)} className="w-full h-40 p-2 outline-none mb-4" />
        <button onClick={handleSave} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">Publish</button>

        <h2 className="text-xl font-bold mt-16 mb-4 text-red-600">Delete Entries</h2>
        {entries.map((e: any) => (
          <div key={e.id} className="flex justify-between border-b py-4 items-center">
            <span>{e.title}</span>
            <button onClick={async () => { await deleteDoc(doc(db, "journalEntries", e.id)); fetchEntries(); }} className="text-red-500">Delete</button>
          </div>
        ))}
      </div>
    </main>
  );
}