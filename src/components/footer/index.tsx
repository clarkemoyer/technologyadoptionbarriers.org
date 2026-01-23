'use client'

import React from 'react'
import Link from 'next/link'
import { Mail, Phone, MapPin, ArrowRight } from 'lucide-react'
import { TABS_WEBSITE_QUALTRICS_SURVEY_URL } from '@/lib/tabs-survey'

import { FaFacebookF, FaLinkedinIn, FaGithub } from 'react-icons/fa'
import { FaXTwitter } from 'react-icons/fa6'
import { personaNavigation } from '@/data/persona-navigation'
import { technologyAdoptionModelsSeries } from '@/data/technology-adoption-models-series'
// import { ImpactCounter } from '../impact/ImpactCounter'

const Footer: React.FC = () => {
  const currentYear = React.useMemo(() => new Date().getFullYear(), [])
  const socialLinks = [
    { icon: FaLinkedinIn, href: 'https://www.linkedin.com/in/clarkemoyer/', label: 'LinkedIn' },
    {
      icon: FaGithub,
      href: 'https://github.com/clarkemoyer/technologyadoptionbarriers.org',
      label: 'GitHub',
    },
  ]

  const policyLinks = [
    { name: 'Cookie Policy', href: '/cookie-policy' },
    { name: 'Privacy Policy', href: '/privacy-policy' },
    { name: 'Terms of Service', href: '/terms-of-service' },
    { name: 'Contribution Policy', href: '/contribution-policy' },
    { name: 'Vulnerability Disclosure', href: '/vulnerability-disclosure-policy' },
    { name: 'Security Acknowledgements', href: '/security-acknowledgements' },
  ]

  return (
    <footer className="w-full bg-black text-white">
      {/* Contact/CTA Section - Merged from BottomCTA */}
      <div
        id="contact"
        className="w-full py-[100px] bg-[#1a2b4b] text-white relative overflow-hidden"
      >
        <div className="w-[90%] mx-auto max-w-[1080px] text-center relative z-10">
          <h2 className="text-[48px] font-bold mb-[20px] font-serif tracking-wide">
            Get in Touch. Get Involved.
          </h2>
          <p className="text-[20px] text-blue-200 mb-[10px]">
            Do not hesitate to reach out with any question or to become part of the project.
          </p>

          <div className="flex flex-col md:flex-row justify-center items-center gap-[40px] mt-[30px] mb-[60px] text-[18px] font-medium">
            <div>
              <span className="text-blue-400 block text-[14px] uppercase tracking-wider mb-1">
                Location
              </span>
              State College PA
            </div>
            <div className="hidden md:block w-[1px] h-[40px] bg-blue-800"></div>
            <div>
              <span className="text-blue-400 block text-[14px] uppercase tracking-wider mb-1 font-sans">
                Phone
              </span>
              <a
                href="tel:5202228104"
                className="hover:text-blue-300 transition-colors font-sans text-[16px] font-bold"
              >
                (520) 222 8104
              </a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-[20px]">
            <a
              href={TABS_WEBSITE_QUALTRICS_SURVEY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-[40px] py-[18px] bg-[#F57C20] text-white text-[18px] font-bold rounded-[4px] hover:bg-[#d66a1a] transition-all duration-300 uppercase tracking-widest"
            >
              TAKE THE TABS
            </a>
            <a
              href="https://github.com/sponsors/clarkemoyer"
              target="_blank"
              rel="noopener noreferrer"
              className="px-[40px] py-[18px] bg-[#2EA3F2] text-white text-[18px] font-bold rounded-[4px] hover:bg-[#2589cc] transition-all duration-300 uppercase tracking-widest"
            >
              SUPPORT TABS
            </a>
          </div>
        </div>
      </div>

      {/* Disclaimer Block - Matches Live Site "NOTE" sections */}
      <div className="bg-black py-[40px] px-[20px] md:px-[60px] lg:px-[80px] xl:px-[100px] border-b border-gray-800">
        <div className="max-w-[4096px] mx-auto space-y-[20px] text-[14px] md:text-[16px] text-gray-300">
          <p>
            <strong className="text-white">NOTE:</strong> Content on this site has used AI. This
            includes video, audio, image, and text generation capabilities from multiple models.
            Reach out to Clarke Moyer at 520-222-8104 with any questions on methods.
          </p>
          <p>
            <strong className="text-white">NOTE:</strong> This project is in Draft. Not all items
            have been fully validated or property cited. If you find any gaps in citation or content
            issues, please reach out to Clarke Moyer 520-222-8104
          </p>
        </div>
      </div>

      {/* Navigation and Copyright */}
      <div className="py-[40px] px-[20px] md:px-[60px] bg-black">
        <div className="max-w-[4096px] mx-auto flex flex-col items-center gap-[20px]">
          {/* Navigation Links Grid */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 text-left mb-8 border-b border-gray-800 pb-8">
            {/* Main Navigation */}
            <div className="flex flex-col gap-2">
              <h3 className="text-[#26C699] font-bold uppercase tracking-wider text-sm mb-2">
                Main
              </h3>
              <Link href="/" className="text-gray-400 hover:text-white text-sm py-1">
                Home
              </Link>
              <a
                href={TABS_WEBSITE_QUALTRICS_SURVEY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white text-sm py-1"
              >
                Take the TABS
              </a>
              <Link href="/get-involved" className="text-gray-400 hover:text-white text-sm py-1">
                Get Involved
              </Link>
              <Link href="/barriers" className="text-gray-400 hover:text-white text-sm py-1">
                Barriers
              </Link>
              <Link href="/media" className="text-gray-400 hover:text-white text-sm py-1">
                Media
              </Link>
            </div>

            {/* See Yourself: Leaders */}
            <div className="flex flex-col gap-2">
              <h3 className="text-[#26C699] font-bold uppercase tracking-wider text-sm mb-2">
                For Leaders
              </h3>
              <Link
                href={personaNavigation.columns.individuals.path || '/start'}
                className="text-gray-400 hover:text-white text-sm py-1 font-semibold"
              >
                Overview
              </Link>
              {personaNavigation.columns.individuals.links.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className="text-gray-400 hover:text-white text-sm py-1"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* See Yourself: Organizations */}
            <div className="flex flex-col gap-2">
              <h3 className="text-[#26C699] font-bold uppercase tracking-wider text-sm mb-2">
                For Organizations
              </h3>
              <Link
                href={personaNavigation.columns.organizations.path || '/for-organizations'}
                className="text-gray-400 hover:text-white text-sm py-1 font-semibold"
              >
                Overview
              </Link>
              {personaNavigation.columns.organizations.links.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  target={link.isExternal ? '_blank' : undefined}
                  rel={link.isExternal ? 'noopener noreferrer' : undefined}
                  className="text-gray-400 hover:text-white text-sm py-1"
                >
                  {link.label}
                  {link.isExternal && <span className="ml-1 text-[10px]">↗</span>}
                </Link>
              ))}
            </div>

            {/* Models & Research */}
            <div className="flex flex-col gap-2">
              <h3 className="text-[#26C699] font-bold uppercase tracking-wider text-sm mb-2">
                Models & Research
              </h3>
              <Link
                href={technologyAdoptionModelsSeries.root.slug}
                className="text-gray-400 hover:text-white text-sm py-1 font-semibold"
              >
                Series Overview
              </Link>
              {technologyAdoptionModelsSeries.branches.map((branch) => (
                <Link
                  key={branch.slug}
                  href={branch.slug}
                  className="text-gray-400 hover:text-white text-sm py-1 block"
                >
                  {branch.title.split('–')[0].trim()}
                </Link>
              ))}
              <Link
                href={technologyAdoptionModelsSeries.bibliography!.slug}
                className="text-gray-400 hover:text-white text-sm py-1"
              >
                Bibliography
              </Link>
            </div>
          </div>

          {/* Policy Links */}
          <div className="w-full border-t border-gray-800 pt-[20px] mt-[10px]">
            <ul className="flex flex-wrap justify-center gap-[15px] md:gap-[20px] text-[13px] md:text-[14px]">
              {policyLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-[#26C699] transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Copyright */}
          <div className="text-center text-gray-500 text-[14px] mt-[20px]">
            © {currentYear} Clarke Moyer all rights reserved. Credit to Smeal and the PSU DBA
            program.
          </div>

          {/* Social Icons */}
          <div className="flex gap-4">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.label}
                className="text-white hover:text-[#26C699] transition-colors"
                aria-disabled={link.href === ''}
              >
                <link.icon className="w-5 h-5" />
              </a>
            ))}
          </div>

          {/* Public Impact Stats - Temporarily disabled due to CI build issues */}
          {/* <ImpactCounter /> */}
        </div>
      </div>
    </footer>
  )
}

export default Footer
