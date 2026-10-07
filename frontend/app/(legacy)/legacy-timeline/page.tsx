import { notFound } from "next/navigation"
import { timelineItems } from "@/lib/constant/timeline"
import { PageTitle, IndexCard } from "@/components/common"

export default function timeline() {
  // 어디에서도 연결되지 않은 옛 화면(고정 더미 값 포함)이라 운영(production)에서는 열리지 않게 한다
  if (process.env.NODE_ENV === "production") notFound()

  return (
    <div className="flex flex-col gap-6 px-4 py-6 md:p-6">
      <PageTitle
        title="개미들을 위한 실시간 시장 신호"
        description="시장의 급박한 변화의 핵심 뉴스 요약을 페로몬 흔적처럼 빠르게 따라갑니다."
      ></PageTitle>
      {/* <Subtitle title="글로벌 시황 요약" time="07 : 30"></Subtitle> */}
      <IndexCard
        name="KOSPI"
        value="6,995.39"
        change="4.61%"
        isIncrease={true}
      ></IndexCard>
      {timelineItems.map((item) => (
        <section
          key={item.id}
          id={item.id}
          className="scroll-mt-6 rounded-lg border p-4"
        >
          <p className="text-sm text-neutral-500">{item.time}</p>
          <h2 className="text-lg font-semibold">{item.title}</h2>
          <p className="text-sm text-neutral-500">{item.description}</p>
        </section>
      ))}
    </div>
  )
}
