"use client";

import {
  DEFAULT_LETTER_MESSAGE,
  DEFAULT_LETTER_SIGNATURE,
  DEFAULT_LETTER_TO,
} from "@/lib/constant";
import { useEffect, useRef, useState } from "react";
import { useClickAway } from "react-use";
import { useAppContext } from "../AppContext";
import styles from "./letter.module.css";

export default function Letter() {
  const { setIsLetterShowed, letter } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const envelopeRef = useRef(null);

  useEffect(() => {
    setTimeout(() => {
      setIsOpen(true);
    }, 800);
  }, []);

  useClickAway(envelopeRef, () => {
    setIsLetterShowed(true);
  });

  return (
    <div className="relative inset-0 z-[100]">
      <section className="h-screen w-screen flex flex-col items-center justify-center">
        <div className={styles["envlope-wrapper"]}>
          <div
            id={styles.envelope}
            className={isOpen ? styles.open : styles.close}
            ref={envelopeRef}
          >
            <div className={`${styles.front} ${styles.flap}`}></div>
            <div className={`${styles.front} ${styles.pocket}`}></div>
            <div className={styles.letter}>
              <div className={styles.letter_content}>
                <p>{letter.to ?? DEFAULT_LETTER_TO},</p>
                <br />
                <p className="whitespace-pre-wrap">
                  {letter.message != null || letter.message != ""
                    ? letter.message
                    : DEFAULT_LETTER_MESSAGE}
                </p>
                <p className={styles.signature}>
                  {letter.from ?? DEFAULT_LETTER_SIGNATURE}
                </p>
              </div>
            </div>
          </div>
          <button
            className="z-[100] absolute bottom-40 left-1/2 -translate-x-1/2 bg-white hover:bg-gray-900 hover:text-white px-3 py-1 rounded-md border border-gray-300 transition-all"
            onClick={() => setIsLetterShowed(true)}
          >
            Show my present
          </button>
        </div>
      </section>
      <div className="absolute inset-0 w-full h-full bg-white/50 backdrop-blur-md"></div>
    </div>
  );
}
