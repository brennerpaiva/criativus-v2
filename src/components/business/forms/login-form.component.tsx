'use client';
import { Button } from '@/components/ui/button';
import ErrorMessage from '@/components/ui/custom/error-message';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { loginUserFormSchema } from '@/schemas/auth.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

export const LoginFormComponent = () => {
  type LoginUserFormData = z.infer<typeof loginUserFormSchema>;

  const [output, setOutput] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginUserFormData>({
    resolver: zodResolver(loginUserFormSchema),
  });
  const loginUser = (data: LoginUserFormData) => {
    setOutput(JSON.stringify(data, null, 2));
    console.log(data);
  };

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(loginUser)}>
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
          <Link href="/forgot-password" className="ml-auto inline-block text-sm underline">
            Esqueceu sua senha?
          </Link>
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
        Login
      </Button>
      <Button type="button" variant="outline" className="w-full">
        Login with Google
      </Button>
      <div>{output}</div>
    </form>
  );
};
