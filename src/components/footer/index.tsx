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
    <footer className="w-full bg-black text-white">
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

          {/* Copyright */}
          <div className="text-center text-gray-500 text-[14px] mt-[20px]">
            © {currentYear} Clarke Moyer all rights reserved. Credit to Smeal and the PSU DBA
            program.
          </div>

          {/* Social Icon (LinkedIn) - Kept as it was on live site footer if present, else just nav */}
          <div className="flex gap-4">
            <a
              href="https://www.linkedin.com/in/clarkemoyer/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="text-white hover:text-[#26C699] transition-colors"
            >
              <FaLinkedinIn className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
