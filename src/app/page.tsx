import { Button } from "@/components/ui/button";
import { UserButton, auth } from "@clerk/nextjs";

export default async function Home() {
  const { userId } = await auth;
  const isAuth = !!userId;
  return (
    <div className="w-screen min-h-screen bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-rose-100 to-teal-100">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center">
            <h1 className="mr-3 text-5xl font-semibold">Chat with a PDF</h1>
            <UserButton afterSignOutUrl="/" />
          </div>
          <div className="flex mt-2">
            {isAuth && <Button>Go to Chats</Button>}
          </div>
          <p className="max-w-xxl mt-1 text-lg text-slate-600">Join millions of students, researchers and professionals embracing AI</p>
        </div>
      </div>
    </div>
  );
}
