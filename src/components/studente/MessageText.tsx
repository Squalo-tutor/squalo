import { Fragment } from "react";

const SPLIT_REGEX = /(https?:\/\/[^\s]+)/g;
const isUrl = (s: string) => /^https?:\/\//.test(s);

// Rende cliccabili gli URL (es. il link alla posizione condivisa) e va a capo
// sui newline, mantenendo il resto come testo normale.
export default function MessageText({ content, own }: { content: string; own: boolean }) {
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
