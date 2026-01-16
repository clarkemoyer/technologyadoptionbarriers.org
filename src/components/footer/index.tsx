'use client'

import React from 'react'
import Link from 'next/link'
import { Mail, Phone, MapPin, ArrowRight } from 'lucide-react'

import { FaFacebookF, FaLinkedinIn, FaGithub } from 'react-icons/fa'
import { FaXTwitter } from 'react-icons/fa6'

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
    { name: 'Donation Policy', href: '/donation-policy' },
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
              href="https://smeal.qualtrics.com/jfe/form/SV_bkMopd73A8fzfwO"
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
              MAKE A DONATION
            </a>
          </div>
        </div>
      </div>

      {/* Disclaimer Block - Matches Live Site "NOTE" sections */}
      <div className="bg-black py-[40px] px-[20px] md:px-[60px] border-b border-gray-800">
        <div className="max-w-[1080px] mx-auto space-y-[20px] text-[14px] md:text-[16px] text-gray-300">
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
      <div className="py-[40px] px-[20px] bg-black">
        <div className="max-w-[1080px] mx-auto flex flex-col items-center gap-[20px]">
          {/* Navigation Links */}
          <ul className="flex flex-wrap justify-center gap-[20px] md:gap-[40px] text-[16px] font-medium">
            {[
              { name: 'Home', href: '/' },
              {
                name: 'Take the TABS',
                href: 'https://smeal.qualtrics.com/jfe/form/SV_bkMopd73A8fzfwO',
              },
              { name: 'Tech Adoption Barriers', href: '/barriers' },
              { name: 'Technology Adoption Models', href: '/technology-adoption-models' },
              { name: 'Media', href: '/media' },
            ].map((link) => (
              <li key={link.name}>
                <Link
                  href={link.href}
                  target={link.href.startsWith('http') ? '_blank' : undefined}
                  className="hover:text-[#26C699] transition-colors"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>

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
              >
                <link.icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
