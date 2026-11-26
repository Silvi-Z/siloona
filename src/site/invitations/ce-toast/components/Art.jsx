// The cover's drawing, in the reference card's retro ink style: Santa
// tumbling into a coupe glass, legs up, an olive on a skewer held high,
// splashes and bubbles. Drawn for Siloona as SVG (assets/CREDITS.md):
// crisp at any size, a few KB, and its parts can move (see ce-toast.css,
// "motion"). The red and the olive are printed slightly out of register
// with a grain, like a screen print; the black lines wobble a little.
//
// Coordinates were drawn on a 932 × 1304 card; the group is shifted so
// the drawing starts at 0,0 — the CSS pivots (hip, hand) use these. The
// filters work in the drawing's own (unshifted) coordinates, so their
// region covers the whole card.
const INK = '#1d1b1b'
const RED = '#c8412f'
const CREAM = '#f7f3ec'

export default function Art() {
  return (
    <svg className="art" viewBox="0 0 700 1050" aria-hidden="true" focusable="false">
      <defs>
        <filter id="ctt-grain" filterUnits="userSpaceOnUse" x="0" y="0" width="1000" height="1300">
          <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="4" result="n" />
          <feColorMatrix in="n" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 -.9 1.28" result="a" />
          <feComposite in="SourceGraphic" in2="a" operator="in" />
        </filter>
        <filter id="ctt-ink" filterUnits="userSpaceOnUse" x="0" y="0" width="1000" height="1300">
          <feTurbulence type="fractalNoise" baseFrequency=".04" numOctaves="2" seed="7" result="t" />
          <feDisplacementMap in="SourceGraphic" in2="t" scale="2.4" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
      <g transform="translate(-100 -120)">
        {/* splashes and bubbles */}
        <g className="splash splash-l" fill="none" stroke={INK} strokeLinecap="round" filter="url(#ctt-ink)">
          <path d="M160 412 C 205 410, 240 428, 262 452" strokeWidth="7" />
          <path d="M124 476 C 175 468, 222 480, 250 500" strokeWidth="6" />
          <path d="M140 596 C 175 568, 215 552, 252 548" strokeWidth="6" />
        </g>
        <g className="splash splash-r" fill="none" stroke={INK} strokeLinecap="round" filter="url(#ctt-ink)">
          <path d="M770 470 C 730 476, 690 492, 664 520" strokeWidth="6.5" />
          <path d="M708 464 C 690 470, 668 486, 652 502" strokeWidth="5" />
          <path d="M762 560 C 732 548, 700 546, 676 552" strokeWidth="6" />
        </g>
        <g fill="none" stroke={INK} strokeWidth="3.5">
          <circle className="bub b1" cx="236" cy="396" r="9" />
          <circle className="bub b2" cx="166" cy="526" r="10" />
          <circle className="bub b3" cx="706" cy="448" r="8" />
        </g>

        <g className="santa">
          {/* the olive on its skewer, rocking in Santa's hand */}
          <g className="skewer">
            <path d="M398 320 L 748 150" stroke={INK} strokeWidth="4.5" strokeLinecap="round" filter="url(#ctt-ink)" />
            <g transform="rotate(-18 628 208)">
              <ellipse cx="634" cy="212" rx="58" ry="50" fill="#8e9a3f" filter="url(#ctt-grain)" />
              <ellipse cx="628" cy="208" rx="58" ry="50" fill="none" stroke={INK} strokeWidth="3" opacity=".55" filter="url(#ctt-ink)" />
              <ellipse cx="624" cy="166" rx="24" ry="11" fill={RED} />
              <ellipse cx="608" cy="196" rx="14" ry="8" fill="#b6bf6c" opacity=".6" />
            </g>
          </g>
          {/* legs, kicking from the hip */}
          <g className="leg leg1">
            <path d="M452 462 L 338 400" stroke={RED} strokeWidth="44" strokeLinecap="round" filter="url(#ctt-grain)" />
            <path d="M330 372 L 352 418" stroke={CREAM} strokeWidth="26" strokeLinecap="round" />
            <path d="M286 360 C 300 340, 322 346, 332 372 L 346 412 C 318 420, 296 410, 288 396 Z" fill={INK} filter="url(#ctt-ink)" />
          </g>
          <g className="leg leg2">
            <path d="M462 520 L 342 520" stroke={RED} strokeWidth="46" strokeLinecap="round" filter="url(#ctt-grain)" />
            <path d="M336 496 L 344 546" stroke={CREAM} strokeWidth="28" strokeLinecap="round" />
            <path d="M268 500 C 286 488, 312 488, 334 496 L 344 544 C 318 552, 288 548, 270 532 Z" fill={INK} filter="url(#ctt-ink)" />
          </g>
          {/* body, the red a little out of register */}
          <path d="M432 452 C 440 396, 520 380, 584 420 C 640 456, 640 560, 590 616 C 548 660, 452 650, 420 590 C 400 550, 410 500, 432 452 Z" fill={RED} filter="url(#ctt-grain)" transform="translate(6 4)" />
          <path d="M432 452 C 440 396, 520 380, 584 420 C 640 456, 640 560, 590 616 C 548 660, 452 650, 420 590 C 400 550, 410 500, 432 452 Z" fill="none" stroke={INK} strokeWidth="3.5" filter="url(#ctt-ink)" />
          <path d="M452 420 L 600 600" stroke={INK} strokeWidth="20" filter="url(#ctt-ink)" />
          <rect x="508" y="490" width="34" height="28" rx="3" transform="rotate(50 525 504)" fill="none" stroke={CREAM} strokeWidth="5" />
          <path d="M470 640 C 500 600, 540 590, 590 608" stroke={CREAM} strokeWidth="18" fill="none" strokeLinecap="round" />
          <path d="M470 640 C 500 600, 540 590, 590 608" stroke={INK} strokeWidth="2.5" fill="none" opacity=".7" filter="url(#ctt-ink)" />
          {/* the arm, holding the skewer up */}
          <path d="M474 440 L 470 344" stroke={RED} strokeWidth="40" strokeLinecap="round" filter="url(#ctt-grain)" />
          <path d="M454 352 L 492 352" stroke={CREAM} strokeWidth="20" strokeLinecap="round" />
          <path d="M448 300 C 446 276, 470 266, 488 280 C 500 292, 498 324, 490 334 L 452 336 C 446 326, 448 312, 448 300 Z" fill={INK} filter="url(#ctt-ink)" />
          {/* head: beard, face, hat */}
          <g className="head">
            <path d="M520 400 C 506 440, 520 478, 556 490 C 590 500, 624 480, 630 450 C 610 456, 560 448, 540 420 Z" fill={CREAM} stroke={INK} strokeWidth="3" filter="url(#ctt-ink)" />
            <circle cx="566" cy="412" r="42" fill={CREAM} stroke={INK} strokeWidth="3" filter="url(#ctt-ink)" />
            <circle cx="552" cy="430" r="9" fill="#f2a7a0" />
            <circle cx="596" cy="426" r="8" fill="#f2a7a0" />
            <path d="M556 410 q 8 6 16 0 M584 404 q 7 5 14 -1" stroke={INK} strokeWidth="2.6" fill="none" strokeLinecap="round" />
            <path d="M560 446 q 14 10 30 0" stroke={INK} strokeWidth="2.6" fill="none" strokeLinecap="round" />
            <path d="M540 378 C 560 340, 640 330, 690 372 C 700 382, 712 396, 718 404 C 690 398, 650 396, 628 404 Z" fill={RED} filter="url(#ctt-grain)" />
            <path d="M540 378 C 560 340, 640 330, 690 372 C 700 382, 712 396, 718 404" stroke={INK} strokeWidth="3" fill="none" filter="url(#ctt-ink)" />
            <path d="M534 386 C 560 362, 610 360, 640 388 L 646 412 C 616 388, 566 388, 540 408 Z" fill={CREAM} stroke={INK} strokeWidth="3" filter="url(#ctt-ink)" />
            <circle className="pom" cx="722" cy="404" r="17" fill={CREAM} stroke={INK} strokeWidth="3" filter="url(#ctt-ink)" />
          </g>
        </g>

        {/* the glass, drawn over Santa */}
        <g className="glass" fill="none" stroke={INK} strokeLinecap="round" strokeLinejoin="round" filter="url(#ctt-ink)">
          <path d="M268 566 L 664 558" strokeWidth="4.5" />
          <path d="M268 566 C 270 690, 380 772, 466 772 C 560 772, 662 690, 664 558" strokeWidth="5" />
          <path d="M352 732 C 344 700, 362 676, 372 700 C 382 726, 360 744, 368 700 M402 744 C 396 712, 412 690, 422 712 C 432 736, 412 752, 418 712 M452 748 C 446 716, 462 694, 472 716 C 482 740, 462 756, 468 716 M502 744 C 496 712, 512 690, 522 712 C 532 736, 512 752, 518 712 M552 732 C 546 704, 562 684, 572 704 C 580 724, 562 738, 566 706" strokeWidth="3.5" />
          <circle cx="462" cy="788" r="14" strokeWidth="4" />
          <path d="M450 802 L 440 1110 M474 802 L 484 1110 M462 806 L 462 1108" strokeWidth="4" />
          <path d="M440 1110 L 316 1150 L 606 1150 L 484 1110" strokeWidth="4.5" />
        </g>
      </g>
    </svg>
  )
}

// A four-pointed sparkle, for the cover and the dividers.
export function Sparkle({ className = '', style }) {
  return (
    <svg className={`sparkle ${className}`.trim()} style={style} viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      <path d="M20 1 C 21 14, 26 19, 39 20 C 26 21, 21 26, 20 39 C 19 26, 14 21, 1 20 C 14 19, 19 14, 20 1 Z" fill={INK} />
      <path d="M20 9 L 20 31 M9 20 L 31 20" stroke={INK} strokeWidth="1.2" />
    </svg>
  )
}
