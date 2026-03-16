"use client";

import { PageHeader } from "@/components/dashboard/page-header";
import { BalanceCard } from "@/components/finance/balance-card";
import { PayoutTable } from "@/components/finance/payout-table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { mockPayouts } from "@/lib/mock/data";

export default function ManagerFinancePage() {
  return (
    <div>
      <PageHeader
        title="Финансы"
        description="Выплаты и комиссии агентов"
        breadcrumbs={[
          { title: "Дашборд", href: "/manager/dashboard" },
          { title: "Финансы" },
        ]}
      />

      <div className="mb-8">
        <BalanceCard balance={137000} pending={88000} totalEarned={2450000} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Все выплаты</CardTitle>
        </CardHeader>
        <CardContent>
          <PayoutTable payouts={mockPayouts} />
        </CardContent>
      </Card>
    </div>
  );
}
