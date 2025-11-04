import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sparkles, Activity, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import {
  calculateLifePath,
  countDigits,
  getText,
  type Language,
} from "@/lib/numerology/utils";
import {
  analyzeRecurringNumbers,
  checkForSpecialRemedies,
  evaluateYogas,
  type DigitCounts,
} from "@/lib/numerology/utils";

type Props = {
  dob: string;                        // e.g., "12-05-1992"
  language: Language;                 // 'en' | 'hi' | 'en-hi'
  mahaDasha?: number | null;
  annualDasha?: number | null;
};

export default function NumerologyInsights({
  dob,
  language,
  mahaDasha = null,
  annualDasha = null,
}: Props) {
  const destinyNumber = useMemo(() => calculateLifePath(dob), [dob]);

  const digitCounts: DigitCounts = useMemo(() => {
    const counts = countDigits(dob);
    for (let i = 1; i <= 9; i++) if (typeof counts[i] !== "number") (counts as any)[i] = 0;
    return counts as DigitCounts;
  }, [dob]);

  const recurring = useMemo(
    () => analyzeRecurringNumbers(digitCounts, destinyNumber),
    [digitCounts, destinyNumber]
  );

  const yogas = useMemo(() => evaluateYogas(digitCounts), [digitCounts]);

  const remedies = useMemo(
    () => checkForSpecialRemedies(digitCounts, destinyNumber, mahaDasha, annualDasha),
    [digitCounts, destinyNumber, mahaDasha, annualDasha]
  );

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="h-full">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span>Recurring Numbers</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-muted-foreground">
              Destiny: <Badge variant="secondary">{destinyNumber}</Badge>
            </div>
            <Separator />
            {recurring.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No significant repetitions detected (2+ occurrences).
              </p>
            ) : (
              <ul className="space-y-2">
                {recurring.map((r) => (
                  <li key={r.number} className="text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">#{r.number}</Badge>
                      <Badge variant="secondary">×{r.occurrences}</Badge>
                    </div>
                    <p className="mt-1 leading-relaxed">{r.influence}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card className="h-full">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span>Active Yogas</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {yogas.length === 0 ? (
              <p className="text-sm text-muted-foreground">No yogas active for this chart.</p>
            ) : (
              <ul className="space-y-3">
                {yogas.map((y) => {
                  const name = typeof y.name === "string" ? y.name : getText(y.name as any, language);
                  const desc =
                    typeof y.description === "string"
                      ? y.description
                      : y.description
                      ? getText(y.description as any, language)
                      : "";
                  return (
                    <li key={y.key}>
                      <div className="font-medium">{name}</div>
                      {desc && <p className="text-sm text-muted-foreground mt-1">{desc}</p>}
                      {Array.isArray(y.traits) && y.traits.length > 0 && (
                        <ul className="mt-2 flex flex-wrap gap-2">
                          {y.traits.map((t, idx) => {
                            const text = typeof t === "string" ? t : getText(t as any, language);
                            return (
                              <Badge key={`${y.key}-t-${idx}`} variant="outline">
                                {text}
                              </Badge>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="h-full">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              <span>Special Remedies</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {remedies.length === 0 ? (
              <p className="text-sm text-muted-foreground">No special remedies triggered.</p>
            ) : (
              <ul className="space-y-3">
                {remedies.map((rem, idx) => (
                  <li key={`rem-${idx}`}>
                    <div className="font-medium">{rem.title}</div>
                    <p className="text-sm text-muted-foreground mt-1">{rem.text}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
