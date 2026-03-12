export default function Home() {
  const projects = [
    {
      title: "Agri-Tech Marketplace",
      description: "A full-stack platform connecting rural Ethiopian farmers with urban buyers. Features real-time pricing and inventory management.",
      tech: ["Next.js", "SQL", "Tailwind"],
      link: "#"
    },
    {
      title: "University WAN Management System",
      description: "Centralized academic system for Assosa University to digitize registration, grading, and internal collaboration.",
      tech: ["React", "Node.js", "Software Architecture"],
      link: "#"
    },
    {
      title: "Weather & Utility Dashboard",
      description: "Integrated dashboard utilizing public APIs to provide localized weather data and task tracking for productivity.",
      tech: ["JavaScript", "API Integration", "CSS3"],
      link: "#"
    }
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center border-b border-gray-50">
        <span className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-full mb-4">
          Electrical & Computer Engineer
        </span>
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6">
          Building systems that <br />
          <span className="text-blue-600">Solve Real Problems</span>
        </h1>
        <p className="max-w-2xl text-lg text-gray-600 mb-10">
          Specializing in Software Architecture and Full-stack development. 
          Currently focusing on digital transformation projects in Ethiopia.
        </p>
      </section>

      {/* Projects Section */}
      <section className="max-w-6xl mx-auto py-24 px-6">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold">Featured Projects</h2>
            <p className="text-gray-500 mt-2">Architecture & Development</p>
          </div>
          <button className="text-blue-600 font-semibold hover:underline">View All →</button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <div key={index} className="group p-8 border border-gray-100 rounded-3xl hover:border-blue-200 hover:shadow-xl transition-all duration-300 bg-white">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl mb-6 flex items-center justify-center text-white font-bold text-xl">
                {project.title[0]}
              </div>
              <h3 className="text-xl font-bold mb-3 group-hover:text-blue-600 transition">
                {project.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                {project.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {project.tech.map((t, i) => (
                  <span key={i} className="text-[10px] uppercase tracking-widest font-bold px-2 py-1 bg-gray-100 text-gray-500 rounded-md">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}