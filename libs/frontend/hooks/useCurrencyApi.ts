import { useQuery } from '@tanstack/react-query';

interface CurrencyData {
  [key: string]: {
    [currencyCode: string]: number;
  };
}

export const useCurrencyApi = (sourceCurrency: string) => {
  return useQuery<CurrencyData>({
    queryKey: ['currency', sourceCurrency],
    queryFn: async () => {
      if (!sourceCurrency || sourceCurrency.length < 3) {
        throw new Error('Invalid source currency');
      }

      const response = await fetch(
        `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${sourceCurrency.toLowerCase()}.json`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch currency data');
      }

      return response.json();
    },
    enabled: !!sourceCurrency && sourceCurrency.length >= 3,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });
};
