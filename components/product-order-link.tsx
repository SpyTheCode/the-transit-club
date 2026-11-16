"use client";

import { siteConfig } from "@/lib/site-config";

export function ProductOrderLink({ productName }: { productName: string }) {
  const normalizedNumber =
    siteConfig.contact.malakOrderWhatsAppNumber.replace(/\D/g, "");
  if (!normalizedNumber) {
    return <p className="order-note">Ordering details coming soon</p>;
  }

  return (
    <a
      className="portal-button portal-button-primary"
      href={`https://wa.me/${normalizedNumber}`}
      onClick={(event) => {
        const message = `Hello, I am interested in ${productName}: ${window.location.href}`;
        event.currentTarget.href = `https://wa.me/${normalizedNumber}?text=${encodeURIComponent(message)}`;
      }}
      rel="noreferrer"
      target="_blank"
    >
      ORDER VIA WHATSAPP
    </a>
  );
}
