import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EarnLanding } from '../../pages/earn/EarnLanding';
import { FinanceLanding } from '../../pages/finance/FinanceLanding';
import { EServiceLanding } from '../../pages/eservices/EServiceLanding';
import { DollarSign, Building2, FileText } from 'lucide-react';
import { t } from '../../i18n';

export function PrimaryTabs() {
  return (
    <Tabs defaultValue="earn" className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-8 h-auto p-1 bg-card/80 shadow-sm">
        <TabsTrigger value="earn" className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-white">
          <DollarSign className="h-4 w-4" />
          <span className="hidden sm:inline">{t('tabs.earn')}</span>
          <span className="sm:hidden">{t('tabs.earnShort')}</span>
        </TabsTrigger>
        <TabsTrigger value="finance" className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white">
          <Building2 className="h-4 w-4" />
          <span className="hidden sm:inline">{t('tabs.finance')}</span>
          <span className="sm:hidden">{t('tabs.financeShort')}</span>
        </TabsTrigger>
        <TabsTrigger value="eservices" className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-accent data-[state=active]:to-accent/80 data-[state=active]:text-white">
          <FileText className="h-4 w-4" />
          <span className="hidden sm:inline">{t('tabs.eservices')}</span>
          <span className="sm:hidden">{t('tabs.eservicesShort')}</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="earn" className="mt-0">
        <EarnLanding />
      </TabsContent>

      <TabsContent value="finance" className="mt-0">
        <FinanceLanding />
      </TabsContent>

      <TabsContent value="eservices" className="mt-0">
        <EServiceLanding />
      </TabsContent>
    </Tabs>
  );
}
