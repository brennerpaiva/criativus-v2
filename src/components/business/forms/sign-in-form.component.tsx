'use client';

import { Button } from '@/components/ui/button';
import ErrorMessage from '@/components/ui/custom/error-message';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/auth.context';
import { signInFormSchema } from '@/schemas/auth.schema';
import AuthService from '@/service/auth.service';
import { useUserStore } from '@/store/report/user.store';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from "next/navigation";
import nookies from 'nookies';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import { AlertDestructive } from '../alert-erro/alert-erro.component';


type SignInUserFormData = z.infer<typeof signInFormSchema>;

export const SignInFormComponent = () => {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();
  const authService = new AuthService();
  const setUser = useUserStore((s) => s.setUser);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInUserFormData>({
    resolver: zodResolver(signInFormSchema),
  });

  const onSubmit: SubmitHandler<SignInUserFormData> = async (formData) => {
    setIsLoading(true);
    try {
      const token = await authService.login(formData);
      nookies.set(null, 'access_token', token, { 
        maxAge: 60 * 60 * 24 * 365 * 10,
        path: '/' 
      });
      const profile = await authService.getProfile();
      console.log(profile);
      setUser(profile);
      
      if (profile.onboardingCompleted) {
        router.push('/top-criativos-vendas');
      } else {
        router.push('/onboarding');
        // return await loginWithFacebook();
      }
    } catch (err: any) {
      console.error("Erro no login:", err);
      // Tenta extrair a mensagem do erro
      const errorMessage = 'Erro ao realizar login. Tente novamente.';
      setError(errorMessage);
    } finally {
      setIsLoading(true);
    }
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
      {/* Campo de E-mail */}
      <div className="grid gap-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          type="email"
          placeholder="m@example.com"
          {...register('email')}
          className={errors.email ? 'focus-visible:ring-destructive' : ''}
          aria-invalid={!!errors.email}
        />
        {errors.email && <ErrorMessage message={errors.email.message} />}
      </div>

      {/* Campo de Senha */}
      <div className="grid gap-2">
        <div className="flex items-center">
          <Label htmlFor="password">Senha</Label>
          <Link href="/forgot-password" className="ml-auto inline-block text-sm underline">
            Esqueceu sua senha?
          </Link>
        </div>
        <Input
          id="password"
          type="password"
          placeholder="*********"
          {...register('password')}
          className={errors.password ? 'focus-visible:ring-destructive' : ''}
          aria-invalid={!!errors.password}
        />
        {errors.password && <ErrorMessage message={errors.password.message} />}
      </div>

      {/* Botão de Login */}
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? <Loader2 className="animate-spin" /> : 'Entrar'}
      </Button>

      {/* Exibição de mensagem de erro, se houver */}
      {error && <AlertDestructive title="Erro" description={error} />}
    </form>
  );
};
