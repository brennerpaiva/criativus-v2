import { z } from 'zod';

export const onboardingSchema = z.object({
 organizationName: z.string().min(1, 'Nome da organização é obrigatório'),
 selectedAccountId: z.string().min(1, 'Selecione uma conta'),
 workspaceName: z.string().min(1, 'Nome do workspace é obrigatório'),
});

export type OnboardingData = z.infer<typeof onboardingSchema>;
