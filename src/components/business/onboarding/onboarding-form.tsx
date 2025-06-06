'use client';
import { Button } from '@/components/ui/button';
import ErrorMessage from '@/components/ui/custom/error-message';
import { Input } from '@/components/ui/input';
import { onboardingSchema, OnboardingData } from '@/schemas/onboarding.schema';
import FacebookAdsService from '@/service/graph-api.service';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { AdAccount } from '@/types/model/ad-account.model';

export function OnboardingForm() {
 const [accounts, setAccounts] = useState<AdAccount[]>([]);
 const [connected, setConnected] = useState<AdAccount | null>(null);
 const router = useRouter();

 const {
  register,
  handleSubmit,
  watch,
  setValue,
  formState: { errors },
 } = useForm<OnboardingData>({
  resolver: zodResolver(onboardingSchema),
 });

 const selectedId = watch('selectedAccountId');

 useEffect(() => {
  async function load() {
   try {
    const res = await FacebookAdsService.getAdAccounts();
    setAccounts(res);
   } catch (err) {
    console.error(err);
   }
  }
  load();
 }, []);

 const connect = () => {
  const account = accounts.find((a) => a.id === selectedId);
  if (!account) return;
  setConnected(account);
  setValue('workspaceName', account.name);
 };

 const onSubmit = (data: OnboardingData) => {
  console.log(data);
  router.push('/top-criativos-vendas');
 };

 return (
  <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
   <section className="space-y-2">
    <h2 className="text-xl font-bold">Crie sua organização</h2>
    <p className="text-sm text-muted-foreground">
     A organização será a central do seu time
    </p>
    <Input
     placeholder="Nome da organização"
     {...register('organizationName')}
    />
    {errors.organizationName && (
     <ErrorMessage message={errors.organizationName.message} />
    )}
   </section>

   <section className="space-y-2">
    <h2 className="text-xl font-bold">Conecte uma conta</h2>
    <p className="text-sm text-muted-foreground">
     Você terá acesso a essa conta no primeiro Workspace
    </p>
    <div className="overflow-auto rounded-md border">
     <table className="w-full text-sm">
      <thead>
       <tr className="border-b bg-muted/50">
        <th className="px-3 py-2 text-left font-medium">Account name</th>
        <th className="px-3 py-2 text-left font-medium">Account id</th>
        <th className="px-3 py-2" />
       </tr>
      </thead>
      <tbody>
       {accounts.map((acc) => (
        <tr key={acc.id} className="border-b">
         <td className="px-3 py-2">{acc.name}</td>
         <td className="px-3 py-2">{acc.account_id}</td>
         <td className="px-3 py-2 text-center">
          <input
           type="radio"
           value={acc.id}
           checked={selectedId === acc.id}
           {...register('selectedAccountId')}
           onChange={() => setValue('selectedAccountId', acc.id)}
          />
         </td>
        </tr>
       ))}
      </tbody>
     </table>
    </div>
    <Button
     type="button"
     onClick={connect}
     disabled={!selectedId || !!connected}
    >
     Connect
    </Button>
    {errors.selectedAccountId && (
     <ErrorMessage message={errors.selectedAccountId.message} />
    )}
   </section>

   {connected && (
    <section className="space-y-2">
     <h2 className="text-xl font-bold">
      Crie um workspace para {connected.name}
     </h2>
     <p className="text-sm text-muted-foreground">
      Configure um espaço de trabalho que usará dados do {connected.name}
     </p>
     <Input placeholder="Nome do workspace" {...register('workspaceName')} />
     {errors.workspaceName && (
      <ErrorMessage message={errors.workspaceName.message} />
     )}
    </section>
   )}

   <Button type="submit" disabled={!connected}>
    Finalizar
   </Button>
  </form>
 );
}
