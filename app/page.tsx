import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import {
  ArrowDown,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Menu,
} from "lucide-react";
import { Reveal } from "@/components/reveal";
import { HeroRoadScene } from "@/components/hero-road-scene";
import { WaterRipple } from "@/components/water-ripple";
import {
  UpcomingEvents,
  UpcomingEventsFallback,
} from "@/components/upcoming-events";

const gallery = [
  {
    image: "/images/Black tee front.jpg",
    alt: "The Transit Club black tee",
    caption: "A familiar route",
  },
  {
    image: "/images/TTC TRUCKER HAT BLUE.jpg",
    alt: "Blue Transit Club trucker cap",
    caption: "Blue skies ahead",
  },
  {
    image: "/images/White tee front .jpg",
    alt: "The Transit Club white tee",
    caption: "Somewhere, slowly",
  },
  {
    image: "/images/TTC MAP Trucket hat 1.0_20261105194220.jpg",
    alt: "Transit Club map trucker cap",
    caption: "A map, not a plan",
  },
  {
    image: "/images/Black Tee back.jpg",
    alt: "The back of the black Transit Club tee",
    caption: "A little further",
  },
  {
    image: "/images/TTC TRUCKER HAT GREEN.jpg",
    alt: "Green Transit Club trucker cap",
    caption: "Take the long way",
  },
  {
    image: "/images/White tee back.jpg",
    alt: "The back of the white Transit Club tee",
    caption: "Carry it with you",
  },
  {
    image: "/images/TTC TRUCKER HAT RED.jpg",
    alt: "Red Transit Club trucker cap",
    caption: "Meet us out there",
  },
];

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <Link aria-label="The Transit Club home" className="brand" href="/">
          <Image
            alt=""
            height={64}
            priority
            src="/logo/logo.png"
            width={100}
          />
          <span>THE TRANSIT CLUB</span>
        </Link>
        <nav aria-label="Main navigation" className="main-nav">
          <a href="#about">About</a>
          <a href="#events">Gatherings</a>
          <a href="#gallery">Gallery</a>
        </nav>
        <div className="header-actions">
          <Link className="header-sign-in" href="/auth/sign-in">
            Sign in
          </Link>
          <Link className="button button-small" href="/auth/sign-up">
            Join the club <ArrowUpRight aria-hidden="true" size={14} />
          </Link>
        </div>
        <a aria-label="Skip to gatherings" className="mobile-menu" href="#events">
          <Menu aria-hidden="true" size={21} />
        </a>
      </header>

      <section aria-labelledby="hero-title" className="hero">
        <div className="hero-image">
          <Image
            alt="Transit Club map-edition hat from the collection"
            className="hero-photo"
            fill
            priority
            sizes="100vw"
            src="/images/TTC MAP Trucket hat 1.0_20261105194220.jpg"
          />
          <div className="hero-wash" />
          <WaterRipple />
        </div>
        <HeroRoadScene />
        <div className="hero-content">
          <p className="eyebrow hero-eyebrow">A community for the in-between</p>
          <h1 id="hero-title">
            Not all who
            <br />
            wander are <em>lost.</em>
          </h1>
          <p className="hero-description">
            A space to find your people, collect your stories, and go a little
            further.
          </p>
          <Link className="button button-light" href="#events">
            Find your next gathering <ArrowDownRight aria-hidden="true" size={16} />
          </Link>
        </div>
        <div className="hero-footer">
          <span>01 / THE JOURNEY IS THE POINT</span>
          <a aria-label="Scroll to about section" href="#about">
            <ArrowDown size={17} />
          </a>
          <span>LAGOS · EVERYWHERE</span>
        </div>
      </section>

      <section aria-labelledby="about-title" className="about-section" id="about">
        <Reveal className="about-copy">
          <p className="eyebrow">A note from Malak</p>
          <h2 id="about-title">
            For the places
            <br />
            <em>in between.</em>
          </h2>
        </Reveal>
        <Reveal className="about-detail" delay={90}>
          <p>
            An experiential arm and collective archive by Malak. We are a
            community built for explorers, nomads, and those navigating the
            space between destinations.
          </p>
          <a className="text-link" href="#gallery">
            A little more about us <ArrowDownRight aria-hidden="true" size={15} />
          </a>
        </Reveal>
      </section>

      <section
        aria-labelledby="events-title"
        className="events-section"
        id="events"
      >
        <Reveal className="section-intro">
          <div>
            <p className="eyebrow">Come as you are</p>
            <h2 id="events-title">Upcoming events</h2>
          </div>
          <p className="section-aside">
            Shared journeys, unhurried conversations,
            <br />
            and room for what comes next.
          </p>
        </Reveal>

        <div className="event-list">
          <Suspense fallback={<UpcomingEventsFallback />}>
            <UpcomingEvents />
          </Suspense>
        </div>
        <p className="events-footnote">
          Each gathering opens in its own time. Keep an eye on this space.
        </p>
      </section>

      <section
        aria-labelledby="gallery-title"
        className="gallery-section"
        id="gallery"
      >
        <Reveal className="section-intro gallery-heading">
          <div>
            <p className="eyebrow">Collected along the way</p>
            <h2 id="gallery-title">From the archive</h2>
          </div>
          <a
            className="text-link"
            href="https://www.instagram.com/thetransitclub_"
            rel="noreferrer"
            target="_blank"
          >
            Follow along <ArrowUpRight aria-hidden="true" size={15} />
          </a>
        </Reveal>
        <div className="gallery-grid">
          {gallery.map((item, index) => (
            <Reveal
              className={`gallery-item gallery-item-${index + 1}`}
              delay={(index % 4) * 55}
              key={item.image}
            >
              <a
                aria-label={`${item.caption}, view image`}
                className="gallery-image"
                href={item.image}
                rel="noreferrer"
                target="_blank"
              >
                <Image
                  alt={item.alt}
                  className="gallery-photo"
                  fill
                  loading="lazy"
                  sizes="(max-width: 640px) 50vw, (max-width: 1000px) 33vw, 25vw"
                  src={item.image}
                />
                <span aria-hidden="true" className="gallery-open">
                  <ArrowUpRight size={16} />
                </span>
              </a>
              <p>{item.caption}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section aria-labelledby="join-title" className="join-section" id="join">
        <Reveal className="join-inner">
          <p className="eyebrow">The best stories are shared</p>
          <h2 id="join-title">
            Wherever you&apos;re
            <br />
            <em>headed, come along.</em>
          </h2>
          <p className="join-copy">
            Find your way into the conversation. The next chapter is better
            together.
          </p>
          <div className="join-actions">
            <a
              className="button button-primary"
              href="https://chat.whatsapp.com/Jk7ETjQL9ad1EPmpy9lwJZ?s=cl&p=a&mlu=4&ilr=4&iam=2"
              rel="noreferrer"
              target="_blank"
            >
              Join our WhatsApp <ArrowUpRight aria-hidden="true" size={15} />
            </a>
            <a
              aria-label="Follow The Transit Club on Instagram"
              className="button button-outline"
              href="https://www.instagram.com/thetransitclub_"
              rel="noreferrer"
              target="_blank"
            >
              <svg
                aria-hidden="true"
                className="instagram-glyph"
                fill="none"
                viewBox="0 0 24 24"
              >
                <rect
                  height="18"
                  rx="5"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  width="18"
                  x="3"
                  y="3"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="4"
                  stroke="currentColor"
                  strokeWidth="1.7"
                />
                <circle cx="18" cy="6" fill="currentColor" r="1" />
              </svg>
              Instagram <ArrowRight aria-hidden="true" size={14} />
            </a>
          </div>
        </Reveal>
        <div aria-hidden="true" className="join-orbit join-orbit-one" />
        <div aria-hidden="true" className="join-orbit join-orbit-two" />
      </section>

      <footer className="site-footer">
        <Link aria-label="The Transit Club home" className="footer-brand" href="/">
          <Image alt="" height={49} src="/logo/logo.png" width={76} />
          <span>THE TRANSIT CLUB</span>
        </Link>
        <p>An experiential arm and collective archive by Malak.</p>
        <div className="footer-links">
          <Link href="/auth/sign-in">Member sign in</Link>
          <a
            aria-label="Instagram"
            href="https://www.instagram.com/thetransitclub_"
            rel="noreferrer"
            target="_blank"
          >
            Instagram <ArrowUpRight aria-hidden="true" size={13} />
          </a>
        </div>
        <span className="footer-note">LAGOS · EVERYWHERE</span>
      </footer>
    </main>
  );
}
