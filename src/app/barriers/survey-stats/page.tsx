import Header from '@/components/header'
import Footer from '@/components/footer'
import QualtricsSurveyStats from '@/components/survey-stats/qualtrics-survey-stats'

export default function SurveyStatsPage() {
  return (
    <>
      <Header />
      <main className="pt-[80px]">
        <div className="bg-blue-600 py-[60px] text-center text-white">
          <h1 className="text-[48px] font-bold">Survey stats</h1>
          <p className="text-[20px] opacity-90">
            Metrics pulled from Qualtrics via GitHub Actions.
          </p>
        </div>
        <QualtricsSurveyStats />
      </main>
      <Footer />
    </>
  )
}
