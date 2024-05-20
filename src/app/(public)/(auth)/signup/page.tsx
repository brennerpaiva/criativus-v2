import Image from 'next/image';
import Link from 'next/link';

import { SignUpFormComponent } from '@/components/business/forms/sign-up-form.component';
import { Button } from '@/components/ui/button';

export default function SignupPage() {
  return (
    <div className="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
      <div className="hidden bg-muted lg:block">
        <Image
          src="/signup.jpg"
          alt="Image"
          width="1920"
          height="1080"
          className="h-screen w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Crie sua conta</h1>
            <p className="text-balance text-muted-foreground">Crie sua conta</p>
          </div>
          
          <div className="grid gap-4">
            <Button variant="outline" className="w-full">
              Login with Google
            </Button>
            <SignUpFormComponent/>
          </div>
          <div className="mt-4 text-center text-sm">
            Já tem uma conta? {''}
            <Link href="/login" className="underline">
              Fazer login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
