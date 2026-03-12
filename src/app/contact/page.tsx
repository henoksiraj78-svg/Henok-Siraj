 export default function Contact() {
  return (
    <div className="max-w-2xl mx-auto py-20 px-6">
      <h1 className="text-4xl font-bold mb-4">Let's Connect</h1>
      <p className="text-gray-600 mb-8">Currently open to software engineering opportunities and academic collaborations.</p>
      
      <div className="space-y-4">
        <div className="p-4 border rounded-xl hover:border-blue-500 cursor-pointer">
          <h3 className="font-bold">Email</h3>
          <p className="text-blue-600">yourname@university.edu</p>
        </div>
        <div className="p-4 border rounded-xl hover:border-blue-500 cursor-pointer">
          <h3 className="font-bold">Location</h3>
          <p className="text-gray-600">Assosa University, Ethiopia</p>
        </div>
      </div>
    </div>
  );
}