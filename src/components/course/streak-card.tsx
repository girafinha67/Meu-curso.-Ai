import { Flame } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const WEEKDAY_LABELS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

interface StreakCardProps {
  streak: number
  last7Days: { date: Date; studied: boolean }[]
}

export function StreakCard({ streak, last7Days }: StreakCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-50 text-accent-600">
            <Flame className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs text-muted-foreground">Sequência de estudos</p>
            <p className="font-semibold">
              {streak > 0 ? `${streak} dia${streak === 1 ? '' : 's'} seguidos` : 'Comece hoje'}
            </p>
          </div>
        </div>

        <div className="mt-4 flex justify-between">
          {last7Days.map(({ date, studied }, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <span
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold',
                  studied ? 'bg-accent-500 text-white' : 'bg-muted text-muted-foreground'
                )}
              >
                {WEEKDAY_LABELS[date.getDay()]}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
