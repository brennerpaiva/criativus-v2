'use client';

import { Button } from '@/components/ui/button';
import ErrorMessage from '@/components/ui/custom/error-message';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { AlertDestructive } from '../alert-erro/alert-erro.component';

import { useAuth } from '@/context/auth.context';
import { loginUserFormSchema } from '@/schemas/auth.schema';
import AuthService from '@/service/auth.service';
import FacebookAdsService from '@/service/graph-api.service';
import { AdAccount } from '@/types/model/ad-account.model';
import { AxiosError } from 'axios';
import { Loader2 } from 'lucide-react';

// -------------------------------------------------------
// 1. Tipo definido fora do componente
// -------------------------------------------------------
type LoginUserFormData = z.infer<typeof loginUserFormSchema>;

export const LoginFormComponent = () => {
  const router = useRouter();
  const authService = new AuthService();
  const { login, user, logout } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // -----------------------------------------------------
  // 3. Setando o resolver com a schema do Zod
  // -----------------------------------------------------
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginUserFormData>({
    resolver: zodResolver(loginUserFormSchema),
  });

  // -----------------------------------------------------
  // 4. Função de login com useCallback
  // -----------------------------------------------------
  const handleLogin = useCallback(
    async (data: LoginUserFormData) => {
      setIsLoading(true);
  
      try {
        // Adiciona delay de 1 segundo
        // await new Promise((resolve) => setTimeout(resolve, 1000));
        // const user = await authService.login(data);
        const user = { 
          name: 'brenner Paiva Ausgto Asdasd',
          access_token: '123',
          adAccounts: [] as AdAccount[],
        }

        const adAccounts = await FacebookAdsService.getAdAccounts();
        user.adAccounts = adAccounts

        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('activeAdAccount', JSON.stringify(adAccounts[0]));
        router.push('/dashboard');
      } catch (err) {
        const axiosError = err as AxiosError<IErrorResponse>;

        if (axiosError?.response?.data) {
          console.log(axiosError.response);
          setError(axiosError.response.data.message);
        }
        setError('Erro ao realizar login. Tente novamente.');
      } finally {
        setIsLoading(false);
      }
    },
    [authService, router],
  );
  

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(handleLogin)}>
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
          <Link
            href="/forgot-password"
            className="ml-auto inline-block text-sm underline"
          >
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
      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
        // aria-busy={isLoading}
        // aria-disabled={isLoading}
      >
        {isLoading ? <Loader2 className="animate-spin" /> : 'Entrar'}
      </Button>

      {/* Botão de Login via Google (exemplo) */}
      {/* <Button
        type="button"
        variant="outline"
        className="w-full"
        // Aqui você poderia implementar a lógica de login com Google.
      >
        Login com Google
      </Button> */}

      {/* Exibição de Alert se houver erro */}
      {error && (
        <AlertDestructive
          title="Erro"
          description={error}
        />
      )}
    </form>
  );
};
