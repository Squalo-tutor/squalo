import { Fragment } from "react";

const SPLIT_REGEX = /(https?:\/\/[^\s]+)/g;
const isUrl = (s: string) => /^https?:\/\//.test(s);
const IMG_REGEX = /^https?:\/\/\S+\.(png|jpe?g|gif|webp)(\?\S*)?$/i;

// Rende cliccabili gli URL (es. il link alla posizione condivisa) e va a capo
// sui newline, mantenendo il resto come testo normale. Se il messaggio è solo
// una foto, la mostra come immagine.
export default function MessageText({ content, own }: { content: string; own: boolean }) {
  const trimmed = content.trim();
  if (IMG_REGEX.test(trimmed)) {
    return (
      <a href={trimmed} target="_blank" rel="noopener noreferrer">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={trimmed} alt="foto" className="max-h-64 w-full rounded-xl object-cover" />
      </a>
    );
  }
  return (
    <>
      {content.split("\n").map((line, li) => (
        <Fragment key={li}>
          {li > 0 && <br />}
          {line.split(SPLIT_REGEX).map((part, pi) =>
            isUrl(part) ? (
              <a
                key={pi}
                href={part}
                target="_blank"
                rel="noopener noreferrer"
                className={`underline underline-offset-2 ${own ? "text-cyan-100" : "text-[#06B6D4]"}`}
              >
                apri posizione
              </a>
            ) : (
              <Fragment key={pi}>{part}</Fragment>
            )
          )}
        </Fragment>
      ))}
    </>
  );
}
