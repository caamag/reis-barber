import Header from '../components/Header'
import Hero from '../components/Hero'
import Services from '../components/Services'
import Visit from '../components/Visit'
import FinalCta from '../components/FinalCta'
import Footer from '../components/Footer'
import WhatsAppFloat from '../components/WhatsAppFloat'

export default function Home() {
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
