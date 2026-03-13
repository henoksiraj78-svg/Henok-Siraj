"use client";
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import Navbar from '@/components/Navbar';

export default function HomePage() {
 const [entries, setEntries] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, "journalEntries"), orderBy("date", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
     setEntries(snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-2xl mx-auto py-12 px-6">
        <h1 className="text-4xl font-serif font-bold mb-10 text-gray-900">Journal</h1>
        <div className="space-y-12">
          {entries.map((entry: any) => (
            <article key={entry.id} className="border-l-2 border-blue-500 pl-6 relative">
              <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[7px] top-2"></div>
              <p className="text-xs font-mono text-gray-400 uppercase tracking-widest">
                {entry.mood} — {new Date(entry.date).toDateString()}
              </p>
              <h2 className="text-2xl font-bold mt-2 text-gray-800">{entry.title}</h2>
              <p className="text-gray-600 mt-4 leading-relaxed whitespace-pre-wrap">{entry.content}</p>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}