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
  ]
  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 py-12 px-4 md:px-6 lg:px-8">
        {/* Column 1: Credits */}
        <div className="space-y-6 px-4 sm:px-0">
          <h3 className="text-[28px] text-white">Credits</h3>

          <div className="space-y-4">
            <p className="text-gray-400 text-[18px]">
              Technology Adoption Barriers Survey (TABS) is a research initiative led by Clarke
              Moyer.
            </p>
            <p className="text-gray-400 text-[18px]">
              Special thanks to Smeal College of Business and the PSU DBA program for their support
              in this research.
            </p>
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div className="space-y-6 px-4 sm:px-0">
          <ul className="space-y-2 text-sm" id="lato-font">
            {[
              { name: 'Home', href: '/' },
              {
                name: 'Take the TABS',
                href: 'https://smeal.qualtrics.com/jfe/form/SV_0PRpizHAb9P7vXk',
              },
              { name: 'Tech Adoption Barriers', href: '/barriers' },
              { name: 'Technology Adoption Models', href: '/technology-adoption-models' },
              { name: 'Media', href: '/media' },
            ].map((link) => (
              <li key={link.name}>
                <Link
                  href={link.href}
                  target={link.href.startsWith('http') ? '_blank' : undefined}
                  className="hover:text-[#F58C23] transition-all text-[16px] font-[500]"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3: Contact Us */}
        <div className="space-y-6 px-4 sm:px-0">
          <h3 className="text-[28px] text-white">Contact Us</h3>

          <div className="space-y-4 text-sm">
            <div className="flex items-start gap-3">
              <Mail className="w-10 h-10 text-orange-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-[500] text-[22px]">E-mail</p>
                <a
                  href="mailto:clarke@technologyadoptionbarriers.org"
                  className="font-[500] text-[15px] hover:text-cyan-400 transition-colors break-all"
                  id="aria-font"
                >
                  clarke@technologyadoptionbarriers.org
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-10 h-10 text-orange-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-[500] text-[22px]">Call Us Today</p>
                <a
                  href="tel:5202228104"
                  className="font-[500] text-[16px] hover:text-cyan-400 transition-colors"
                  id="aria-font"
                >
                  (520) 222-8104
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-10 h-10 text-orange-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-[500] text-[22px]">Research Office</p>
                <p className="font-[500] text-[16px]" id="aria-font">
                  Technology Adoption Barriers Survey
                  <br />
                  Pennsylvania State University
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              {socialLinks.map(({ icon: Icon, href, label }, index) => (
                <a
                  key={index}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="bg-orange-500 p-2 rounded-full hover:bg-orange-600 transition-colors"
                >
                  <Icon className="w-6 h-6 text-white" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div
        className="mt-12 py-6 px-4 border-t border-gray-800 text-center text-[18px] font-[500] w-full"
        id="aria-font"
      >
        <p>
          © {currentYear} Clarke Moyer all rights reserved. Credit to Smeal and the PSU DBA program.
        </p>
      </div>
    </footer>
  )
}

export default Footer
