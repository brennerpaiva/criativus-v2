import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade | Criativus",
  description:
    "Como a Criativus coleta, utiliza, armazena e compartilha seus dados pessoais.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="container mx-auto max-w-4xl py-10">
      <article className="prose dark:prose-invert mx-auto">
        <h1>Política de Privacidade</h1>
        <p className="text-sm text-muted-foreground">
          Última atualização: 30 de maio de 2025
        </p>

        {/* 1. Quem somos */}
        <section id="quem-somos" className="mt-8">
          <h2>1. Quem somos</h2>
          <p>
            Esta Política de Privacidade descreve como o <strong>Criativus</strong>,
            operado por <strong>Classe A Agência LTDA</strong>, CNPJ
            <strong> 33.281.263/0001-75</strong>, coleta, utiliza, armazena e
            compartilha dados pessoais quando você utiliza nosso aplicativo e
            serviços associados.
          </p>
        </section>

        {/* 2. Quais dados coletamos */}
        <section id="dados-coletados" className="mt-8">
          <h2>2. Quais dados coletamos</h2>
          <ul className="space-y-4">
            <li>
              <p className="font-semibold">Informações de conta</p>
              <p className="ml-4">
                <span className="block"><strong>Exemplos:</strong> Nome, e‑mail, foto pública, ID do usuário no Facebook.</span>
                <span className="block"><strong>Forma de coleta:</strong> Recebidas via <em>Login com Facebook</em>, mediante seu consentimento explícito.</span>
              </p>
            </li>
            <li>
              <p className="font-semibold">Métricas de uso</p>
              <p className="ml-4">
                <span className="block"><strong>Exemplos:</strong> Páginas visitadas, cliques, tempo de sessão, endereço IP encurtado.</span>
                <span className="block"><strong>Forma de coleta:</strong> Cookies e tecnologias similares.</span>
              </p>
            </li>
            <li>
              <p className="font-semibold">Dados de anúncios (se aplicável)</p>
              <p className="ml-4">
                <span className="block"><strong>Exemplos:</strong> ID das campanhas e anúncios no Facebook Ads, métricas de desempenho.</span>
                <span className="block"><strong>Forma de coleta:</strong> API oficial do Facebook, com tokens autorizados pelo usuário.</span>
              </p>
            </li>
          </ul>
        </section>

        {/* 3. Bases legais */}
        <section id="bases-legais" className="mt-8">
          <h2>3. Bases legais (LGPD, art. 7º)</h2>
          <ul className="space-y-4">
            <li>
              <p className="font-semibold">Consentimento</p>
              <p className="ml-4">Para acesso ao seu perfil público e e‑mail via Facebook Login.</p>
            </li>
            <li>
              <p className="font-semibold">Execução de contrato</p>
              <p className="ml-4">Para fornecer as funcionalidades principais do aplicativo.</p>
            </li>
            <li>
              <p className="font-semibold">Interesse legítimo</p>
              <p className="ml-4">Para melhorar serviços, prevenir fraudes e gerar estatísticas agregadas.</p>
            </li>
            <li>
              <p className="font-semibold">Cumprimento de obrigação legal</p>
              <p className="ml-4">Quando órgãos reguladores exigem retenção ou divulgação de dados.</p>
            </li>
          </ul>
        </section>

        {/* 4. Como utilizamos seus dados */}
        <section id="uso-dados" className="mt-8 space-y-3">
          <h2>4. Como utilizamos seus dados</h2>
          <ul className="list-disc pl-6">
            <li>Autenticar e identificar você dentro do aplicativo.</li>
            <li>Exibir relatórios e estatísticas de anúncios do Facebook.</li>
            <li>Personalizar experiência e conteúdo.</li>
            <li>Realizar análises agregadas para melhoria contínua.</li>
            <li>Detectar, investigar e prevenir fraudes, spam ou uso indevido.</li>
          </ul>
        </section>

        {/* 5. Compartilhamento de dados */}
        <section id="compartilhamento" className="mt-8 space-y-3">
          <h2>5. Compartilhamento de dados</h2>
          <p>
            Não vendemos nem trocamos seus dados pessoais. Compartilhamos apenas
            com:
          </p>
          <ul className="list-disc pl-6">
            <li>
              <strong>Provedores de infraestrutura:</strong> Vercel e Hostinger
            </li>
          </ul>
          <p>
            Todos os terceiros assinaram acordos de processamento de dados e
            obedecem a padrões de segurança equivalentes aos nossos.
          </p>
        </section>

        {/* 6. Cookies */}
        <section id="cookies" className="mt-8 space-y-3">
          <h2>6. Cookies e tecnologias semelhantes</h2>
          <ul className="list-disc pl-6">
            <li>Manter sua sessão autenticada;</li>
            <li>Lembrar preferências;</li>
            <li>Mensurar desempenho e audiência.</li>
          </ul>
          <p>
            Você pode bloquear cookies no navegador, mas algumas funções podem
            não operar corretamente.
          </p>
        </section>

        {/* 7. Proteção de dados */}
        <section id="protecao" className="mt-8">
          <h2>7. Proteção de dados</h2>
          <p>
            Empregamos criptografia TLS, firewalls, monitoramento 24/7, controle
            de acesso lógico e políticas de “privacy by design”. Apenas
            funcionários autorizados acessam dados mediante necessidade
            operacional e acordo de confidencialidade.
          </p>
        </section>

        {/* 8. Retenção */}
        <section id="retencao" className="mt-8 space-y-3">
          <h2>8. Retenção</h2>
          <p>Mantemos informações:</p>
          <ul className="list-disc pl-6">
            <li><strong>Conta:</strong> enquanto você mantiver cadastro ativo;</li>
            <li><strong>Dados de logs:</strong> por até 12 meses;</li>
            <li><strong>Backups:</strong> máximo de 6 meses.</li>
          </ul>
          <p>
            Após vencidos esses prazos ou mediante solicitação de exclusão, os
            dados são removidos ou anonimizados de forma segura.
          </p>
        </section>

        {/* 9. Seus direitos */}
        <section id="direitos" className="mt-8 space-y-3">
          <h2>9. Seus direitos (LGPD, art. 18)</h2>
          <p>Você pode, a qualquer momento:</p>
          <ul className="list-disc pl-6">
            <li>Confirmar a existência de tratamento;</li>
            <li>Acessar ou corrigir dados;</li>
            <li>Solicitar portabilidade;</li>
            <li>Requerer anonimização ou eliminação;</li>
            <li>Revogar consentimento.</li>
          </ul>
          <p>
            Para exercer seus direitos, envie e-mail para
            <a href="mailto:contato@classeaagencia.com.br" className="ml-1 underline">
              contato@classeaagencia.com.br
            </a>
            .
          </p>
        </section>
      </article>
    </main>
  );
}
