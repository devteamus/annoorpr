// সার্ভার-রেন্ডার্ড পেজের শেয়ার্ড শেল — হেডার + কনটেইনার + ফুটার
// (SPA home পেজের লেআউটের মিরর, যাতে ডিজাইন হুবহু এক থাকে)
import { AppHeader } from "@/components/app/header";
import { AppFooter } from "@/components/app/footer";

export function ViewShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col pattern-bg">
      <AppHeader />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-5xl px-3 py-5 sm:px-6 sm:py-7">
          {children}
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
