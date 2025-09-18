export default function Navbar() {
  return (
    <nav className="w-full bg-blue-600 text-white p-4 flex justify-between items-center shadow-md">
      <h1 className="text-xl font-bold">QuizMaster 🎯</h1>
      <ul className="flex gap-6">
        <li className="cursor-pointer hover:text-yellow-300">Home</li>
        <li className="cursor-pointer hover:text-yellow-300">Categories</li>
        <li className="cursor-pointer hover:text-yellow-300">About</li>
      </ul>
    </nav>
  );
}
