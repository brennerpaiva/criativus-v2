'use client';
import { Button } from '@/components/ui/button';
import ErrorMessage from '@/components/ui/custom/error-message';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signUpUserFormSchema } from '@/schemas/auth.schema';
import AuthService from '@/service/auth.service';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

export const SignUpFormComponent = () => {
  type SignUpUserFormData = z.infer<typeof signUpUserFormSchema>;
  const authService = new AuthService();
  const router = useRouter();
  const [output, setOutput] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpUserFormData>({
    resolver: zodResolver(signUpUserFormSchema),
  });
  const RegisterUser = async (data: SignUpUserFormData) => {
    setOutput(JSON.stringify(data, null, 2));
    console.log(data);
    try {
      await authService.signUp(data);
      router.push('/login');
    } catch (err) {
      console.log(err);
      alert('Falha ao registrar o usuário:');
      // Tratar a falha apropriadamente, por exemplo, mostrar uma mensagem de erro ao usuário
    }
  };

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(RegisterUser)}>
      <div className="grid gap-2">
        <div className="flex items-center">
          <Label htmlFor="name">Nome</Label>
        </div>
        <Input
          id="name"
          type="string"
          placeholder="Nome"
          {...register('name')}
          className={errors.name ? 'focus-visible:ring-red-700' : ''}
        />
        {errors.name && <ErrorMessage message={errors.name.message} />}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          type="email"
          placeholder="m@example.com"
          {...register('email')}
          className={errors.email ? 'focus-visible:ring-red-700' : ''}
        />
        {errors.email && <ErrorMessage message={errors.email.message} />}
      </div>
      <div className="grid gap-2">
        <div className="flex items-center">
          <Label htmlFor="password">Senha</Label>
        </div>
        <Input
          id="password"
          type="password"
          placeholder="*********"
          {...register('password')}
          className={errors.password ? 'focus-visible:ring-red-700' : ''}
        />
        {errors.password && <ErrorMessage message={errors.password.message} />}
      </div>
      <Button type="submit" className="w-full">
        Criar Conta
      </Button>
    </form>
  );
};
