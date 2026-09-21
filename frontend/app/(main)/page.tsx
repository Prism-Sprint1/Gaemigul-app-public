import PheromoneTemperatureCard from "@/components/home/PheromoneTemperatureCard"
import TodayAntTermCard from "@/components/home/TodayAntTermCard"
import CalendarScheduleCard from "@/components/home/dashboard/CalendarScheduleCard"
import PheromoneSignalCard from "@/components/home/dashboard/PheromoneSignalCard"
import TradingActivityCard from "@/components/home/dashboard/TradingActivityCard"
import UsdKrwTrendCard from "@/components/home/dashboard/UsdKrwTrendCard"

export default function Page() {
  return (
    <div className="flex w-full flex-col gap-5 md:px-6 md:py-10">
      <div className="flex flex-col gap-6">
        <PheromoneTemperatureCard />

        <div className="flex flex-col gap-6 md:flex-row md:items-stretch">
          <div className="flex md:flex-3">
            <UsdKrwTrendCard />
          </div>
          <div className="md:flex-1.5 flex">
            <PheromoneSignalCard />
          </div>
        </div>

        <TradingActivityCard />
        <CalendarScheduleCard />
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-sm">
        <TodayAntTermCard />
      </div>
    </div>
  )
}
