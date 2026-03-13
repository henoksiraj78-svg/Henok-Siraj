import Navbar from '@/components/Navbar';

export default function BlogListPage() {
  const articles = [
    { title: "My Journey in Engineering", date: "2026-03-10" },
    { title: "Building an Agri-Tech Startup", date: "2026-02-15" }
  ];

  return (
    <main><Navbar />
      <div className="max-w-2xl mx-auto py-12 px-6">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Long Reads</h1>
        <div className="space-y-6">
          {articles.map((art, i) => (
            <div key={i} className="p-4 border rounded-xl hover:bg-gray-50 cursor-pointer transition">
              <h2 className="text-xl font-semibold">{art.title}</h2>
              <p className="text-gray-400 text-sm mt-1">{art.date}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}