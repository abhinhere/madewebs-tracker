"use client";

import { useState } from "react";
import { format, isPast, addDays, isBefore } from "date-fns";
import { Globe, Search, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function DomainsClient({ domains }: { domains: any[] }) {
  const [search, setSearch] = useState("");

  const filteredDomains = domains.filter((d) => 
    d.name.toLowerCase().includes(search.toLowerCase()) || 
    d.client?.name.toLowerCase().includes(search.toLowerCase()) ||
    d.websiteUrl?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Domain Renewals</h1>
          <p className="text-muted-foreground">Track website domains and their renewal dates.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Active Domains</CardTitle>
              <CardDescription>Manage your clients' website domains.</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search domains..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/50">
                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Project</th>
                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Client</th>
                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">URL</th>
                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Renewal Date</th>
                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDomains.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-muted-foreground">
                        No domains found.
                      </td>
                    </tr>
                  ) : (
                    filteredDomains.map((domain) => {
                      const date = new Date(domain.renewalDate);
                      const isExpired = isPast(date);
                      const isExpiringSoon = isBefore(date, addDays(new Date(), 30)) && !isExpired;
                      
                      return (
                        <tr key={domain.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                          <td className="p-4 font-medium">{domain.name}</td>
                          <td className="p-4 text-muted-foreground">{domain.client?.name}</td>
                          <td className="p-4">
                            <a 
                              href={domain.websiteUrl.startsWith('http') ? domain.websiteUrl : `https://${domain.websiteUrl}`} 
                              target="_blank" 
                              rel="noreferrer"
                              className="flex items-center gap-1.5 text-blue-500 hover:underline"
                            >
                              <Globe className="h-3 w-3" />
                              {domain.websiteUrl.replace(/^https?:\/\//, '')}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </td>
                          <td className="p-4">{format(date, "MMM dd, yyyy")}</td>
                          <td className="p-4">
                            {isExpired ? (
                              <Badge variant="destructive" className="bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-600 border-red-200">Expired</Badge>
                            ) : isExpiringSoon ? (
                              <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 hover:text-amber-700 border-amber-200">Expiring Soon</Badge>
                            ) : (
                              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 hover:text-emerald-700 border-emerald-200">Active</Badge>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
