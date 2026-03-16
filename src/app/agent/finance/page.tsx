"use client";

import { PageHeader } from "@/components/dashboard/page-header";
import { BalanceCard } from "@/components/finance/balance-card";
import { PayoutTable } from "@/components/finance/payout-table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { mockPayouts } from "@/lib/mock/data";

export default function AgentFinancePage() {
  const myPayouts = mockPayouts.filter((p) => p.agentId === "a1");

  return (
    <div>
      <PageHeader
        title="Финансы"
        description="Баланс, выплаты и комиссии"
        breadcrumbs={[
          { title: "Дашборд", href: "/agent/dashboard" },
          { title: "Финансы" },
        ]}
      />

      <div className="mb-8">
        <BalanceCard balance={45000} pending={60000} totalEarned={1240000} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">История выплат</CardTitle>
        </CardHeader>
        <CardContent>
          <PayoutTable payouts={myPayouts} />
        </CardContent>
      </Card>
    </div>
  );
}
