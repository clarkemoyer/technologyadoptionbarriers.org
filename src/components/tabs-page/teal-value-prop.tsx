import { TABS_WEBSITE_QUALTRICS_SURVEY_URL } from '@/lib/tabs-survey'

const TealValueProp = () => {
  return (
    <section className="w-full py-[80px] bg-tabs-teal text-white">
      <div className="w-[90%] mx-auto max-w-[4096px]">
        <h2 className="text-[36px] font-bold mb-[30px] font-serif">
          Technology Adoption Barriers Survey (TABS)
        </h2>

        <div className="space-y-[20px] text-[18px] leading-[1.6]">
          <p>
            Taking the TABS survey is a direct way to benefit your organization and contribute to a
            wider understanding of technology adoption. By sharing your unique perspective as a
            senior leader, you provide invaluable insights that help identify the most common
            barriers organizations face when adopting new technologies.
          </p>
          <p>
            Completing the survey offers you a structured chance to reflect on your own
            organization&apos;s technology challenges and strengths. In return for your
            participation, you will receive summary reports and key findings from the combined data.
            These insights will serve as valuable benchmarks, offering you a clearer picture of
            trends and challenges relevant to your industry and role. Your input directly helps to
            create a deeper and more current understanding of how technology adoption succeeds,
            ultimately leading to more effective strategies, better organizational performance, and
            greater value from technology investments for organizations like yours. Our goal is to
            share findings on a regular basis as data collection progresses.
          </p>
        </div>

        <div className="mt-[40px]">
          <a
            href={TABS_WEBSITE_QUALTRICS_SURVEY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-[40px] py-[20px] border-2 border-white text-white text-[20px] font-bold rounded-[50px] hover:bg-white hover:text-tabs-teal transition-colors duration-300 uppercase tracking-wide"
          >
            Take The Survey Now
          </a>
        </div>
      </div>
    </section>
  )
}

export default TealValueProp
