export default function Blog() {
  const articles = [
    {
      id: 1,
      title: "Optimizing WAN for Academic Management",
      excerpt: "How we centralized registration for Assosa University students.",
      date: "March 10, 2026"
    },
    {
      id: 2,
      title: "The Future of Agri-Tech in Ethiopia",
      excerpt: "Bridging the gap between rural farmers and urban markets using Next.js.",
      date: "March 05, 2026"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-20 px-6">
      <h1 className="text-4xl font-black mb-12">Engineering Log</h1>
      <div className="grid gap-10">
        {articles.map((post) => (
          <article key={post.id} className="group cursor-pointer">
            <p className="text-sm text-blue-600 font-bold mb-2">{post.date}</p>
            <h2 className="text-2xl font-bold group-hover:text-blue-600 transition mb-3">
              {post.title}
            </h2>
            <p className="text-gray-600 leading-relaxed">{post.excerpt}</p>
            <div className="mt-4 text-sm font-bold border-b-2 border-black inline-block">Read Article</div>
          </article>
        ))}
      </div>
    </div>
  );
}