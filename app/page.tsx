import Image from "next/image";
import {
  ArrowDown,
  ArrowDownRight,
  ArrowUpRight,
} from "lucide-react";
import { Intro } from "@/components/intro";
import { TodayDate } from "@/components/today-date";
import { WaterRipple } from "@/components/water-ripple";

const pieces = [
  {
    name: "The Route Tee",
    detail: "Black · Front",
    image: "/images/Black tee front.jpg",
    alt: "Front of the black Transit Club graphic T-shirt",
    className: "piece-tall",
  },
  {
    name: "The Route Tee",
    detail: "White · Front",
    image: "/images/White tee front .jpg",
    alt: "Front of the white Transit Club graphic T-shirt",
    className: "",
  },
  {
    name: "The City Trucker",
    detail: "Blue",
    image: "/images/TTC TRUCKER HAT BLUE.jpg",
    alt: "Blue Transit Club trucker hat",
    className: "",
  },
  {
    name: "The Route Tee",
    detail: "Black · Back",
    image: "/images/Black Tee back.jpg",
    alt: "Back of the black Transit Club graphic T-shirt",
    className: "piece-tall",
  },
  {
    name: "The Map Trucker",
    detail: "Map edition",
    image: "/images/TTC MAP Trucket hat 1.0_20261105194220.jpg",
    alt: "Transit Club map-edition trucker hat",
    className: "",
  },
  {
    name: "The City Trucker",
    detail: "Green",
    image: "/images/TTC TRUCKER HAT GREEN.jpg",
    alt: "Green Transit Club trucker hat",
    className: "",
  },
  {
    name: "The Route Tee",
    detail: "White · Back",
    image: "/images/White tee back.jpg",
    alt: "Back of the white Transit Club graphic T-shirt",
    className: "",
  },
  {
    name: "The City Trucker",
    detail: "Red",
    image: "/images/TTC TRUCKER HAT RED.jpg",
    alt: "Red Transit Club trucker hat",
    className: "piece-tall",
  },
];

export default function Home() {
  return (
    <main>
      <div className="announcement">
        <span>Independent goods for wherever you&apos;re going</span>
        <span className="announcement-date">
          <TodayDate />
        </span>
      </div>

      <header className="site-header">
        <a aria-label="The Transit Club home" className="brand" href="#">
          <Image
            src="/logo/logo.png"
            alt="The Transit Club Via Malaka emblem"
            width={245}
            height={190}
            priority
          />
          <span>THE TRANSIT CLUB</span>
        </a>
        <nav aria-label="Main navigation" className="main-nav">
          <a href="#collection">Collection</a>
          <a href="#about">Our point of view</a>
        </nav>
        <a className="header-link" href="#collection">
          Find your way <ArrowUpRight aria-hidden="true" size={15} />
        </a>
      </header>

      <section aria-labelledby="hero-heading" className="hero">
        <div className="hero-backdrop">
          <div className="hero-grain" />
          <WaterRipple />
        </div>
        <div className="hero-content">
          <Intro />
          <a className="hero-link" href="#collection">
            Explore the collection <ArrowDownRight aria-hidden="true" size={17} />
          </a>
        </div>
        <div className="hero-index">
          <span>01 — 08</span>
          <span>GOODS FOR THE JOURNEY</span>
        </div>
        <a aria-label="Scroll to collection" className="scroll-cue" href="#collection">
          <ArrowDown aria-hidden="true" size={16} />
        </a>
      </section>

      <section aria-labelledby="collection-title" className="collection" id="collection">
        <div className="section-heading">
          <div>
            <p className="eyebrow">The first departure</p>
            <h2 id="collection-title">In good company.</h2>
          </div>
          <p className="section-note">
            Everyday pieces, with a little more meaning.
            <br />
            Made to take the long way round.
          </p>
        </div>

        <div className="gallery">
          {pieces.map((piece, index) => (
            <article
              className={`piece ${piece.className}`}
              key={`${piece.name}-${piece.detail}`}
            >
              <a
                aria-label={`${piece.name}, ${piece.detail}`}
                className="piece-image"
                href={piece.image}
                rel="noreferrer"
                target="_blank"
              >
                <Image
                  alt={piece.alt}
                  className="product-image"
                  fill
                  priority={index < 2}
                  sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 25vw"
                  src={piece.image}
                />
                <span className="image-number">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span aria-hidden="true" className="image-arrow">
                  <ArrowUpRight size={17} />
                </span>
              </a>
              <div className="piece-caption">
                <h3>{piece.name}</h3>
                <span>{piece.detail}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="about-title" className="manifesto" id="about">
        <div className="manifesto-mark">TTC / 001</div>
        <div className="manifesto-content">
          <p className="eyebrow">The Transit Club, Via Malaka</p>
          <h2 id="about-title">
            It&apos;s not only
            <br />
            about the <em>destination.</em>
          </h2>
          <p className="manifesto-copy">
            We make keepsakes for the miles between here and there. Thoughtful
            everyday goods for the curious, the connected and those still on
            their way.
          </p>
          <a className="manifesto-link" href="#collection">
            Take a look around <ArrowUpRight aria-hidden="true" size={16} />
          </a>
        </div>
        <div aria-hidden="true" className="manifesto-orbit">
          <span>ALWAYS IN TRANSIT</span>
        </div>
      </section>

      <footer className="site-footer">
        <a className="footer-brand" href="#">
          THE TRANSIT CLUB <span>®</span>
        </a>
        <p>Made for the way there.</p>
        <a
          aria-label="Instagram"
          className="social-link"
          href="https://www.instagram.com/"
          rel="noreferrer"
          target="_blank"
        >
          <ArrowUpRight aria-hidden="true" size={18} />
        </a>
        <span className="footer-date">
          <TodayDate />
        </span>
      </footer>
    </main>
  );
}
