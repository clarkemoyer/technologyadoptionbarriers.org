import {
  Open_Sans,
  Lato,
  Raleway,
  Faustina,
  Cantata_One,
  Fauna_One,
  Montserrat,
  Cinzel,
  Outfit,
  Plus_Jakarta_Sans,
  Fira_Code,
} from 'next/font/google'

// Configure fonts with proper subsets and display strategy
export const openSans = Open_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-open-sans',
  weight: ['400', '500', '600', '700', '800'],
})

export const lato = Lato({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-lato',
  weight: ['400', '700'],
})

export const raleway = Raleway({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-raleway',
  weight: ['400', '500', '600', '700'],
})

export const faustina = Faustina({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-faustina',
  weight: ['400', '500', '600', '700'],
})

export const cantataOne = Cantata_One({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-cantata-one',
  weight: '400',
})

export const faunaOne = Fauna_One({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-fauna-one',
  weight: '400',
})

export const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat',
  weight: ['400', '500', '600', '700'],
})

export const cinzel = Cinzel({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-cinzel',
  weight: ['400', '500', '600', '700'],
})

export const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit',
  weight: ['300', '400', '600', '700'],
})

export const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-plus-jakarta-sans',
  weight: ['400', '500', '700'],
})

export const firaCode = Fira_Code({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-fira-code',
  weight: ['400', '500'],
})
