import { useState, useEffect, useRef } from 'react';

function parseNumber(text) {
  const digits = String(text).replace(/[^0-9]/g, '');
  return digits ? parseInt(digits, 10) : 0;
}

/** Rolls numeric portion toward targetText (matches legacy animateAmount behaviour). */
export function useAnimatedAmount(targetText) {
  const [display, setDisplay] = useState(targetText);
  const displayRef = useRef(targetText);
  displayRef.current = display;

  useEffect(() => {
    const currentText = displayRef.current;
    if (currentText === targetText) return;

    let raf = 0;
    const fromVal = parseNumber(currentText);
    const toVal = parseNumber(targetText);
    const prefixMatch = targetText.match(/^[^0-9]*/);
    const prefix = prefixMatch ? prefixMatch[0] : '';
    const isYears = /years?$/i.test(targetText);

    if (fromVal === toVal) {
      setDisplay(targetText);
      return;
    }

    const duration = 350;
    const start = performance.now();
    const diff = toVal - fromVal;

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      let current = Math.round(fromVal + diff * eased);

      if (isYears) {
        setDisplay(current + ' years');
      } else {
        current = Math.round(current / 100) * 100;
        setDisplay(prefix + current.toLocaleString('en-IN'));
      }

      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setDisplay(targetText);
      }
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [targetText]);

  return display;
}
