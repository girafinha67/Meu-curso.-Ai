import { Trophy } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { ProgressBar } from '@/components/ui/progress-bar'
import type { SiteSettingsMap } from '@/types/database'

export function computeLevel(xp: number, levels: SiteSettingsMap['gamification']['levels']) {
  const sorted = [...levels].sort((a, b) => a.min_xp - b.min_xp)
  let current = sorted[0]
  let next: typeof sorted[number] | undefined
  for (let i = 0; i < sorted.length; i++) {
    if (xp >= sorted[i].min_xp) current = sorted[i]
    else {
      next = sorted[i]
      break
    }
  }
  return { current, next }
}

export function LevelCard({ xp, levels }: { xp: number; levels: SiteSettingsMap['gamification']['levels'] }) {
  const { current, next } = computeLevel(xp, levels)
  const range = next ? next.min_xp - current.min_xp : 1
  const progressInLevel = next ? Math.min(100, ((xp - current.min_xp) / range) * 100) : 100

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-50 text-accent-600">
            <Trophy className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs text-muted-foreground">Nível atual</p>
            <p className="font-semibold">{current.name}</p>
          </div>
          <span className="ml-auto text-sm font-medium text-muted-foreground">{xp} XP</span>
        </div>
        <div className="mt-4">
          <ProgressBar value={progressInLevel} size="sm" tone="accent" />
          {next && (
            <p className="mt-2 text-xs text-muted-foreground">
              {next.min_xp - xp} XP para chegar a {next.name}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
