/**
 * Quantum Research Lab (QRL) - Complex Number Arithmetic
 * Scientific accuracy, zero-drift complex operations for statevectors and unitaries.
 */

export interface Complex {
  re: number;
  im: number;
}

export const Complex = {
  create(re: number = 0, im: number = 0): Complex {
    return { re, im };
  },

  zero(): Complex {
    return { re: 0, im: 0 };
  },

  one(): Complex {
    return { re: 1, im: 0 };
  },

  i(): Complex {
    return { re: 0, im: 1 };
  },

  add(a: Complex, b: Complex): Complex {
    return { re: a.re + b.re, im: a.im + b.im };
  },

  sub(a: Complex, b: Complex): Complex {
    return { re: a.re - b.re, im: a.im - b.im };
  },

  mul(a: Complex, b: Complex): Complex {
    return {
      re: a.re * b.re - a.im * b.im,
      im: a.re * b.im + a.im * b.re,
    };
  },

  scale(a: Complex, s: number): Complex {
    return { re: a.re * s, im: a.im * s };
  },

  div(a: Complex, b: Complex): Complex {
    const denom = b.re * b.re + b.im * b.im;
    if (denom === 0) return { re: 0, im: 0 };
    return {
      re: (a.re * b.re + a.im * b.im) / denom,
      im: (a.im * b.re - a.re * b.im) / denom,
    };
  },

  conj(a: Complex): Complex {
    return { re: a.re, im: -a.im };
  },

  abs(a: Complex): number {
    return Math.hypot(a.re, a.im);
  },

  absSq(a: Complex): number {
    return a.re * a.re + a.im * a.im;
  },

  phase(a: Complex): number {
    return Math.atan2(a.im, a.re);
  },

  fromPolar(r: number, theta: number): Complex {
    return {
      re: r * Math.cos(theta),
      im: r * Math.sin(theta),
    };
  },

  exp(a: Complex): Complex {
    const expRe = Math.exp(a.re);
    return {
      re: expRe * Math.cos(a.im),
      im: expRe * Math.sin(a.im),
    };
  },

  format(c: Complex, precision: number = 3): string {
    const r = c.re.toFixed(precision);
    const i = Math.abs(c.im).toFixed(precision);
    if (Math.abs(c.im) < 1e-6) return `${r}`;
    if (Math.abs(c.re) < 1e-6) {
      return c.im < 0 ? `-${i}i` : `${i}i`;
    }
    const sign = c.im >= 0 ? '+' : '-';
    return `${r} ${sign} ${i}i`;
  },
};
