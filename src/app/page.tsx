'use client'
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    router.push("/sign-in");
  }, []);


  return (
    <div className="w-screen min-h-screen max-w-full overflow-hidden">
    </div>
  );
}
