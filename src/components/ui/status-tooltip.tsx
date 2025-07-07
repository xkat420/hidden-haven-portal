import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { TranslationKey } from '@/utils/translations';

interface StatusTooltipProps {
  status: string;
  className?: string;
}

const statusDescriptionMap: Record<string, TranslationKey> = {
  pending: 'pendingDesc',
  accepted: 'acceptedDesc',
  preparing: 'preparingDesc',
  delivering: 'deliveringDesc',
  delivered: 'deliveredDesc',
  cancelled: 'cancelledDesc',
  refused: 'refusedDesc'
};

export const StatusTooltip: React.FC<StatusTooltipProps> = ({ status, className }) => {
  const { t } = useLanguage();
  
  const descriptionKey = statusDescriptionMap[status.toLowerCase()];
  if (!descriptionKey) return null;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Info className={`w-4 h-4 text-muted-foreground hover:text-foreground cursor-help ${className}`} />
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs">{t(descriptionKey)}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};