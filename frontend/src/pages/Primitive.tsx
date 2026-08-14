import { useEffect, useRef } from "react";
import $ from "jquery";
import "turn.js";

const PAGE_COUNT = 8;
const BOOK_WIDTH = 800;
const BOOK_HEIGHT = 600;

const pages = Array.from(
  { length: PAGE_COUNT },
  (_, index) => `/instrucoes/pg-0${index + 1}.jpg`,
);

function Primitive() {
  const bookRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (!bookRef.current || initialized.current) return;
    initialized.current = true;

    const book = $(bookRef.current);
    book.turn({
      width: BOOK_WIDTH,
      height: BOOK_HEIGHT,
      autoCenter: true,
      display: "double",
    });

    return () => {
      book.turn("stop");
    };
  }, []);

  return (
    <div className="container mx-auto">
      <h2 className="text-center">Instruções</h2>
      <p className="text-center">PDF com as instruções do teste</p>
      <div
        ref={bookRef}
        className="book shadow mx-auto"
        style={{ width: BOOK_WIDTH, height: BOOK_HEIGHT }}
      >
        {pages.map((src, index) => (
          <div key={src} className="page">
            <img
              src={src}
              alt={`Página ${index + 1}`}
              className="h-full w-full object-contain"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default Primitive;
