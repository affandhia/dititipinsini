'use client';

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { useCopyToClipboard } from 'react-use';

import { Button } from '@/libs/frontend/components/core/button';
import { useTranslation } from '@/libs/i18n/client';

interface CopyButtonProps {
  textToCopy: string;
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function CopyButton({
  textToCopy,
  variant = 'ghost',
  size = 'sm',
  className,
}: CopyButtonProps) {
  const { t } = useTranslation('common');
  const [, copyToClipboard] = useCopyToClipboard();
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      copyToClipboard(textToCopy);
      setIsCopied(true);

      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      // Could add error state handling here if needed
    }
  };

  return (
    <Button
      className={className}
      size={size}
      title={
        isCopied
          ? t('calculator.actions.copied')
          : t('calculator.actions.copyResults')
      }
      variant={variant}
      onClick={handleCopy}
    >
      {isCopied ? (
        <Check className="h-4 w-4 text-green-600" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
      <span className="sr-only">
        {isCopied
          ? t('calculator.actions.copied')
          : t('calculator.actions.copyResults')}
      </span>
    </Button>
  );
}
