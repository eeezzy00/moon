import { useCallback, useState } from 'react'
import { useCurveProgress } from './hooks/useCurveProgress'
import { useReveal } from './hooks/useReveal'
import { useClickSfx } from './hooks/useClickSfx'
import Backdrop from './components/Backdrop'
import CursorTrail from './components/CursorTrail'
import Preloader from './components/Preloader'
import Header from './components/Header'
import BlackHole from './components/BlackHole'
import Hero from './components/Hero'
import About from './components/About'
import HowItWorks from './components/HowItWorks'
import Phases from './components/Phases'
import Story from './components/Story'
import Trail from './components/Trail'
import { CONFIG } from './lib/config'
import Launchpad from './components/Launchpad'
import LunaTeaser from './components/LunaTeaser'
import LunaChat from './components/LunaChat'
import LunaFab from './components/LunaFab'
import Token from './components/Token'
import Gallery from './components/Gallery'
import DocsCta from './components/DocsCta'
import Footer from './components/Footer'

export default function App() {
  const { gram } = useCurveProgress()
  // ?chat в адресе открывает чат сразу (удобно для ссылок «поговорить с LUNA»)
  const [chat, setChat] = useState(() => new URLSearchParams(window.location.search).has('chat'))
  const openChat = useCallback(() => setChat(true), [])
  const closeChat = useCallback(() => setChat(false), [])
  useReveal()
  useClickSfx()

  return (
    <>
      <Backdrop />
      {/* пока открыт чат, страница сдвигается влево и остаётся видимой */}
      <div className={`page ${chat ? 'page--chat' : ''}`}>
        <Header />
        <main>
          <Hero gram={gram} />
          <BlackHole />
          <About />
          <HowItWorks />
          <Trail gram={gram} unlockAt={CONFIG.phaseStep}>
            <Phases gram={gram} />
            <Story gram={gram} />
          </Trail>
          <Gallery />
          <Launchpad />
          <LunaTeaser onOpen={openChat} />
          <Token />
          <DocsCta />
        </main>
        <Footer />
      </div>
      <LunaFab onClick={openChat} hidden={chat} />
      <LunaChat open={chat} onClose={closeChat} gram={gram} />
      <CursorTrail />
      <Preloader />
    </>
  )
}
