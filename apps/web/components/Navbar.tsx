export default function Navbar() {
  return (
    <nav className="bg-blue-600 text-white p-4 fixed w-full top-0 z-10">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-xl font-bold">Trading Dashboard</div>
        <div className="flex space-x-4">
          <button className="hover:bg-blue-700 px-3 py-2 rounded">Profile</button>
          <button className="hover:bg-blue-700 px-3 py-2 rounded">Settings</button>
          <button className="hover:bg-blue-700 px-3 py-2 rounded">Logout</button>
        </div>
      </div>
    </nav>
  );
}