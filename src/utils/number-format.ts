// utils/formatters.ts

/**
 * Utilidades de formatação de números, moedas e percentuais de maneira
 * coerente com o locale **pt‑BR** (separador “.” para milhar e “,” para decimais).
 *
 * Todas as funções:
 *  ▸ Aceitam `number | string | null | undefined`;
 *  ▸ Retornam o caractere “—” (traço em‑dash) quando o valor é nulo/indisponível
 *    ou não pode ser convertido em número;
 *  ▸ Nunca lançam erro em produção: se o `Intl.NumberFormat` falhar, exibem “—”.
 */

const FALLBACK = '0';

/**
 * Converte qualquer entrada em `number`.
 * @param value  Valor numérico, string numérica, `null` ou `undefined`.
 * @returns      Número convertido ou `null` se a conversão falhar.
 *
 * @example
 * toNumber("1.234,56") // 1234.56
 * toNumber("abc")      // null
 */
function toNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;

  // Converte “1.234,56” → “1234.56” antes de chamar Number()
  const num =
    typeof value === 'number' ? value : Number(String(value).replace(/,/g, '.'));

  return Number.isFinite(num) ? num : null;
}

/**
 * Formata um número de forma segura, devolvendo o fallback se algo der errado.
 * @param num   Número (ou `null`) já validado.
 * @param opts  Opções do `Intl.NumberFormat`.
 */
function safelyFormat(
  num: number | null,
  opts: Intl.NumberFormatOptions
): string {
  if (num === null) return FALLBACK;

  try {
    return new Intl.NumberFormat('pt-BR', opts).format(num);
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[formatNumber] erro ao formatar:', err);
    }
    return FALLBACK;
  }
}

/**
 * Formata um valor como número decimal.
 *
 * @param value   Valor a ser formatado.
 * @param options Opções extras do `Intl.NumberFormat` (ex.: mínimo de casas).
 * @returns       String formatada ou “—”.
 *
 * @example
 * formatNumber(1736)                   // "1.736"
 * formatNumber("1234.56")              // "1.234,56"
 * formatNumber(12.3, { minimumFractionDigits: 2 })  // "12,30"
 */
export function formatNumber(
  value: number | string | null | undefined,
  options: Intl.NumberFormatOptions = { style: 'decimal' }
): string {
  return safelyFormat(toNumber(value), options);
}

/**
 * Formata um valor monetário em Reais (BRL) por padrão.
 *
 * @param value     Valor a ser formatado.
 * @param currency  Código ISO‑4217 da moeda (ex.: "USD"). Padrão: **"BRL"**.
 * @returns         String formatada ou “—”.
 *
 * @example
 * formatCurrency(1234.56)          // "R$ 1.234,56"
 * formatCurrency("89.9")           // "R$ 89,90"
 * formatCurrency(19.9, "USD")      // "US$ 19,90"
 */
export function formatCurrency(
  value: number | string | null | undefined,
  currency: string = 'BRL'
): string {
  return formatNumber(value, { style: 'currency', currency });
}

/**
 * Formata um valor percentual esperando a entrada já em escala **0‑100**.
 *
 * @param value     Valor percentual (ex.: 17.36 → 17,36 %).
 * @param decimals  Nº de casas decimais exibidas. Padrão: 2.
 * @returns         String formatada ou “—”.
 *
 * @example
 * formatPercent(17.361)        // "17,36 %"
 * formatPercent("5")           // "5 %"
 * formatPercent(null)          // "—"
 */
export function formatPercent(
  value: number | string | null | undefined,
  decimals = 2
): string {
  const num = toNumber(value);
  if (num === null) return FALLBACK;

  // Formata inicialmente com as casas decimais desejadas
  const formatted = safelyFormat(num / 100, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  if (decimals > 0) {
    // Remove “,00” (ou “.00”) quando for tudo zero antes do “%”
    // Exemplo: “76,00%” → “76%”
    return formatted.replace(/([0-9])([.,]0+)(%?)$/, '$1$3');
   
  }
  return formatted;
}

