import { ChevronsUpDown } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/libs/frontend/components/core/collapsible';
import { Label } from '@/libs/frontend/components/core/label';
import { Switch } from '@/libs/frontend/components/core/switch';
import { useConfig } from '@/libs/frontend/components/UserConfigProvider';

export const UserConfig = memo(() => {
  const { t } = useTranslation();
  const {
    shouldShowPresets,
    setShowPresets,
    isDrawerView,
    setResultViewMode: setDrawerMode,
  } = useConfig();

  return (
    <Collapsible
      defaultOpen
      className="rounded-lg border bg-card p-4 text-card-foreground"
    >
      <CollapsibleTrigger asChild>
        <h3 className="flex cursor-pointer flex-row items-center justify-between text-lg font-semibold select-none">
          {t('calculator.config.title', {
            defaultValue: 'User Config',
          })}
          <ChevronsUpDown size="14" />
          <span className="sr-only">{'Toggle'}</span>
        </h3>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-4 pt-4">
        <div className="flex items-center space-x-2">
          <Switch
            checked={shouldShowPresets}
            id="should-show-preset"
            onCheckedChange={setShowPresets}
          />
          <Label htmlFor="should-show-preset">
            {t('calculator.fields.shouldShowPresets', {
              defaultValue: 'Show Presets',
            })}
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            checked={isDrawerView}
            id="drawer-mode"
            onCheckedChange={setDrawerMode}
          />
          <Label htmlFor="drawer-mode">
            {t('calculator.fields.drawerMode', {
              defaultValue: 'Drawer Mode',
            })}
          </Label>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
});
