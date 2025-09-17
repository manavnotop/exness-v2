"use client";


export default function Home() {
  const handleSubmit = (email: string) => {
    console.log("Magic link requested for:", email);
    // In a real app, you would send a request to your backend here
    alert(`Magic link sent to ${email}!`);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      hello world
    </div>
  );
}
