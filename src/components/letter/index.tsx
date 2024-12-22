"use client";

import { useEffect, useState } from "react";
import styles from "./letter.module.css";

export default function Letter({ to, from }: { to: string; from: string }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setIsOpen(true);
    }, 800);
  }, []);

  return (
    <div className="relative inset-0 z-[100]">
      <section className="h-screen w-screen flex flex-col items-center justify-center">
        <div className={styles["envlope-wrapper"]}>
          <div
            id={styles.envelope}
            className={isOpen ? styles.open : styles.close}
          >
            <div className={`${styles.front} ${styles.flap}`}></div>
            <div className={`${styles.front} ${styles.pocket}`}></div>
            <div className={styles.letter}>
              <p>Dear {to ? to : "my friend"},</p>
              <br />
              <p>
                I hope this letter finds you well. I wanted to share something
                special with you.
              </p>
              <br />
              <p>
                Here are some memories we shared together. Whether we are in
                person, or separated by thousands of miles, I just want you to
                know that I am thinking of you.
              </p>
              <br />
              <p>Miss you,</p>
              <p className={styles.signature}>{from ? from : "Your friend"}</p>
            </div>
          </div>
          <button className="z-[100] absolute bottom-40 left-1/2 -translate-x-1/2 bg-white hover:bg-gray-900 hover:text-white px-3 py-1 rounded-md border border-gray-300 transition-all">
            Show my present
          </button>
        </div>
      </section>
      <div className="absolute inset-0 w-full h-full bg-white/50 backdrop-blur-md"></div>
    </div>
  );
}
