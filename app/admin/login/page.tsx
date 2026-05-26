import { LoginForm } from "@/components/auth/login-form";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8">
      <LoginForm initialError={error ?? ""} />
    </div>
  );
}
