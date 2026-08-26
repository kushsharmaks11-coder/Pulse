import { login } from "./(auth)/login/actions";
import { Zap } from "lucide-react";
import Link from "next/link";

export default async function PortalPage({ searchParams }: { searchParams: Promise<{ message?: string }> }) {
  const { message } = await searchParams;
  
  return (
    <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Soft Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        {/* Main subtle background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#f8f6ff] to-[#f0f4ff]" />
        
        {/* Left Side: Tilted Rectangular Glass Layers */}
        <div className="absolute -left-[10%] top-[10%] w-[60%] h-[120%] bg-gradient-to-tr from-[#e9d5ff]/40 to-[#c084fc]/10 rounded-[3rem] -rotate-12 transform-gpu animate-blob" />
        <div className="absolute -left-[5%] top-[20%] w-[50%] h-[100%] bg-gradient-to-tr from-[#d8b4fe]/30 to-[#a855f7]/5 rounded-[3rem] -rotate-12 transform-gpu animate-blob animation-delay-2000 backdrop-blur-sm" />

        {/* Right Side: Mirrored Rectangular Glass Layers */}
        <div className="absolute -right-[10%] -top-[10%] w-[60%] h-[120%] bg-gradient-to-tl from-[#e9d5ff]/40 to-[#c084fc]/10 rounded-[3rem] rotate-12 transform-gpu animate-blob animation-delay-4000" />
        <div className="absolute -right-[5%] top-[0%] w-[50%] h-[100%] bg-gradient-to-tl from-[#d8b4fe]/30 to-[#a855f7]/5 rounded-[3rem] rotate-12 transform-gpu animate-blob animation-delay-2000 backdrop-blur-sm" />
        
        {/* Soft clouds at bottom */}
        <div className="absolute -bottom-[20%] right-[10%] w-[60%] h-[60%] rounded-full bg-white/60 blur-3xl" />
        <div className="absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-[#f3e8ff]/60 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-16 h-16 bg-black flex items-center justify-center rounded-2xl mb-4 shadow-xl shadow-[#818cf8]/20 group hover:scale-105 transition-transform">
            <Zap className="text-[#818cf8] w-8 h-8 group-hover:animate-pulse" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            Pulse <span className="text-[#818cf8] font-light">Portal</span>
          </h1>
          <p className="text-gray-500 mt-2 text-sm">Sign in to your client dashboard.</p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50">
          <form action={login} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                Email
              </label>
              <input
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#818cf8]/50 focus:border-[#818cf8] transition-all"
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
                Password
              </label>
              <input
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#818cf8]/50 focus:border-[#818cf8] transition-all"
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
              />
            </div>

            {message && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
                {message}
              </div>
            )}

            <button
              className="w-full py-3 px-4 bg-gradient-to-r from-[#818cf8] to-[#a78bfa] hover:from-[#6366f1] hover:to-[#8b5cf6] text-white rounded-xl font-medium shadow-md shadow-indigo-500/20 transition-all hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              type="submit"
            >
              Sign In
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Don't have an account?{" "}
            <Link href="/signup" className="text-[#818cf8] font-medium hover:underline">
              Create one
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
