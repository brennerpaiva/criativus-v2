import { ForgotPasswordFormComponent } from "@/components/business/forms/forgot-password-form.component";

export default function LoginPage() {
  return (
    <div className="w-full lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Esqueci minha senha</h1>
            <p className="text-balance text-muted-foreground">
              Enter your email below to login to your account
            </p>
          </div>
          <ForgotPasswordFormComponent />
          <div className="mt-4 text-center text-sm">
            Já tem uma conta?{' '}
            <a href="/login" className="underline">
              Fazer login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
