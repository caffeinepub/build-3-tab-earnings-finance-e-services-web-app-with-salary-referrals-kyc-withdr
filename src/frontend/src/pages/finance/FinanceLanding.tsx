import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MicroLoanPage } from './MicroLoanPage';
import { DPSPage } from './DPSPage';
import { MoneyTransferPage } from './MoneyTransferPage';
import { DollarBuySellPage } from './DollarBuySellPage';
import { CreditCard, PiggyBank, Send, DollarSign, ArrowLeft } from 'lucide-react';

type View = 'landing' | 'loan' | 'dps' | 'transfer' | 'dollar';

export function FinanceLanding() {
  const [currentView, setCurrentView] = useState<View>('landing');

  if (currentView === 'loan') {
    return (
      <div>
        <Button variant="ghost" onClick={() => setCurrentView('landing')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Finance
        </Button>
        <MicroLoanPage />
      </div>
    );
  }

  if (currentView === 'dps') {
    return (
      <div>
        <Button variant="ghost" onClick={() => setCurrentView('landing')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Finance
        </Button>
        <DPSPage />
      </div>
    );
  }

  if (currentView === 'transfer') {
    return (
      <div>
        <Button variant="ghost" onClick={() => setCurrentView('landing')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Finance
        </Button>
        <MoneyTransferPage />
      </div>
    );
  }

  if (currentView === 'dollar') {
    return (
      <div>
        <Button variant="ghost" onClick={() => setCurrentView('landing')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Finance
        </Button>
        <DollarBuySellPage />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Banking & Finance
        </h2>
        <p className="text-muted-foreground">
          Access micro loans, savings plans, transfers, and currency exchange
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-primary/20" onClick={() => setCurrentView('loan')}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary/80 shadow-md">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle>Micro Loan</CardTitle>
                <CardDescription>Quick small loans</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Apply for micro loans with flexible repayment terms. NID verification required.
            </p>
            <Button className="w-full bg-gradient-to-r from-primary to-primary/80 text-white">
              Apply for Loan
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-primary/20" onClick={() => setCurrentView('dps')}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent shadow-md">
                <PiggyBank className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle>DPS (Savings Plan)</CardTitle>
                <CardDescription>Deposit & save regularly</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Start a deposit pension scheme to save money with attractive returns.
            </p>
            <Button className="w-full bg-gradient-to-r from-primary to-accent text-white">
              Start DPS
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-accent/20" onClick={() => setCurrentView('transfer')}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-accent to-accent/80 shadow-md">
                <Send className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle>Money Transfer</CardTitle>
                <CardDescription>Send money securely</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Transfer money to other users or external accounts quickly and securely.
            </p>
            <Button className="w-full bg-gradient-to-r from-accent to-accent/80 text-white">
              Transfer Money
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-accent/20" onClick={() => setCurrentView('dollar')}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-accent to-accent/90 shadow-md">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle>Dollar Buy/Sell</CardTitle>
                <CardDescription>Currency exchange</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Buy or sell US dollars at competitive rates for your financial needs.
            </p>
            <Button className="w-full bg-gradient-to-r from-accent to-accent/90 text-white">
              Exchange Currency
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
