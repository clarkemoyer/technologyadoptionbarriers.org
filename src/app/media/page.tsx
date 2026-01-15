import React from 'react'
import Header from '@/components/header'
import Footer from '@/components/footer'

const MediaPage = () => {
    return (
        <>
            <Header />
            <main className="pt-[80px]">
                <div className="bg-gray-800 py-[60px] text-white text-center">
                    <h1 className="text-[48px] font-bold">Media</h1>
                    <p className="text-[20px] opacity-90">Information for media contacts and outcomes.</p>
                </div>
                <section className="py-[100px] w-[90%] mx-auto max-w-[1280px]">
                    <div className="bg-white p-[60px] rounded-[20px] shadow-xl text-center">
                        <h2 className="text-[32px] font-bold mb-[20px]">Media Inquiries</h2>
                        <p className="text-[20px] text-gray-700 mb-[40px]">
                            Page for media contacts and outcomes. Please check back regularly for updates.
                        </p>
                        <a href="mailto:info@technologyadoptionbarriers.org" className="px-[40px] py-[15px] bg-blue-600 text-white font-semibold rounded-[30px] hover:bg-blue-700 transition-colors">
                            Contact Media Team
                        </a>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    )
}

export default MediaPage
