import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Header from '../components/Header'
import Hero from '../components/Hero'
import Services from '../components/Services'
import Visit from '../components/Visit'
import FinalCta from '../components/FinalCta'
import Footer from '../components/Footer'
import WhatsAppFloat from '../components/WhatsAppFloat'

export default function Home() {
  const { hash } = useLocation()

  // Vindo de outra página com âncora (ex: /#servicos), rola até a seção.
  useEffect(() => {
    if (hash) document.querySelector(hash)?.scrollIntoView()
  }, [hash])

  return (
    <>
      <Header />
      <main>
        <Hero />
        <Services />
        <Visit />
        <FinalCta />
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  )
}
