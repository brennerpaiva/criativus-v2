'use client';
import { Button } from '@/components/ui/button';
import ErrorMessage from '@/components/ui/custom/error-message';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { forgotPasswordUserFormSchema } from '@/schemas/auth.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

export const ForgotPasswordFormComponent = () => {
  type ForgotPasswordUserFormData = z.infer<typeof forgotPasswordUserFormSchema>;

  const [output, setOutput] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordUserFormData>({
    resolver: zodResolver(forgotPasswordUserFormSchema),
  });
  const loginUser = (data: ForgotPasswordUserFormData) => {
    setOutput(JSON.stringify(data, null, 2));
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
      <Button type="submit" className="w-full">
        Enviar redefinição de senha
      </Button>
    </form>
  );
};
