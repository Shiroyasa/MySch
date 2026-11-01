import React from 'react';

/**
 * High-Detail 2D Cel-Shaded Anime Academy Character with Out-of-Bounds Pop-Out Effect.
 * Designed specifically for the 50/50 split Login Card left panel:
 * - Left crystal wing & flowing royal academy cape break out past the left edge of the card.
 * - Top hair strands & celestial crown halo break out slightly above the top edge of the card.
 */
export const AnimeAcademyCharacter: React.FC = () => {
  return (
    <div
      className="pointer-events-none absolute -top-7 -left-8 -right-2 bottom-0 z-20 select-none overflow-visible"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 520 620"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full overflow-visible drop-shadow-[0_16px_28px_rgba(8,12,28,0.65)]"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Cel-Shaded Skin Gradients */}
          <linearGradient id="animeSkinBase" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF5EE" />
            <stop offset="65%" stopColor="#FFE4D6" />
            <stop offset="100%" stopColor="#F5C6B0" />
          </linearGradient>
          <linearGradient id="animeSkinShadow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#EBB49E" />
            <stop offset="100%" stopColor="#D99882" />
          </linearGradient>

          {/* Cel-Shaded Anime Hair Gradients (Deep Midnight Indigo-Silver with Cyan Rim Light) */}
          <linearGradient id="animeHairMain" x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#312E81" />
            <stop offset="38%" stopColor="#1E1B4B" />
            <stop offset="78%" stopColor="#0F172A" />
            <stop offset="100%" stopColor="#090D1A" />
          </linearGradient>
          <linearGradient id="animeHairBack" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E1B4B" />
            <stop offset="60%" stopColor="#0F172A" />
            <stop offset="100%" stopColor="#1E293B" />
          </linearGradient>
          <linearGradient id="animeHairHighlight" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#E0F2FE" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#818CF8" stopOpacity="0.85" />
          </linearGradient>

          {/* Anime Iris Gradients (Luminous Cyan-Violet Dual Tone) */}
          <linearGradient id="animeIrisGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1E1B4B" />
            <stop offset="30%" stopColor="#4F46E5" />
            <stop offset="68%" stopColor="#06B6D4" />
            <stop offset="100%" stopColor="#A5F3FC" />
          </linearGradient>

          {/* Royal Academy Blazer & Cape Gradients */}
          <linearGradient id="academyCapeOuter" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E3A8A" />
            <stop offset="50%" stopColor="#172554" />
            <stop offset="100%" stopColor="#090D1C" />
          </linearGradient>
          <linearGradient id="academyCapeInner" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4338CA" />
            <stop offset="55%" stopColor="#312E81" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>
          <linearGradient id="academyBlazer" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="45%" stopColor="#0F172A" />
            <stop offset="100%" stopColor="#090D16" />
          </linearGradient>
          <linearGradient id="goldTrimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="45%" stopColor="#FACC15" />
            <stop offset="80%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#FEF08A" />
          </linearGradient>
          <linearGradient id="crimsonTieGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#22D3EE" />
            <stop offset="55%" stopColor="#0284C7" />
            <stop offset="100%" stopColor="#1E3A8A" />
          </linearGradient>

          {/* Pop-Out Crystal Wing & Magic Gradients */}
          <linearGradient id="crystalWingMain" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E0F2FE" />
            <stop offset="35%" stopColor="#38BDF8" />
            <stop offset="75%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#4F46E5" />
          </linearGradient>
          <linearGradient id="crystalWingSub" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A5F3FC" />
            <stop offset="50%" stopColor="#06B6D4" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
          <radialGradient id="magicOrbRadial" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
            <stop offset="30%" stopColor="#67E8F9" stopOpacity="0.92" />
            <stop offset="65%" stopColor="#24B6D4" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="characterBackGlow" cx="52%" cy="42%" r="46%">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.32" />
            <stop offset="55%" stopColor="#6366F1" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#0F172A" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* ================================================================ */}
        {/* 1. AMBIENT HALO & CELESTIAL ASTROLABE BEHIND CHARACTER           */}
        {/* ================================================================ */}
        <circle cx="280" cy="250" r="210" fill="url(#characterBackGlow)" />

        {/* Rotating Golden-Cyan Magic Circle Behind Shoulders */}
        <g opacity="0.65" transform="translate(285, 215)">
          <circle
            cx="0"
            cy="0"
            r="142"
            stroke="url(#goldTrimGrad)"
            strokeWidth="1.4"
            strokeDasharray="10 6"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0"
              to="360"
              dur="50s"
              repeatCount="indefinite"
            />
          </circle>
          <circle
            cx="0"
            cy="0"
            r="126"
            stroke="#38BDF8"
            strokeWidth="1"
            strokeOpacity="0.7"
          />
          <polygon
            points="0,-126 109,63 -109,63"
            stroke="url(#goldTrimGrad)"
            strokeWidth="0.9"
            strokeOpacity="0.55"
            fill="none"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="360"
              to="0"
              dur="65s"
              repeatCount="indefinite"
            />
          </polygon>
        </g>

        {/* ================================================================ */}
        {/* 2. LEFT-EDGE 3D POP-OUT CRYSTAL WING & FLOWING CAPE              */}
        {/*    (Extends into x = 4..65, breaking out of the card's left edge)*/}
        {/* ================================================================ */}
        <g className="drop-shadow-[-10px_14px_18px_rgba(6,10,25,0.75)]">
          {/* Upper Pop-Out Arcane Crystal Shard (Breaks out past left border x=42) */}
          <polygon
            points="135,190 12,148 34,196 118,224"
            fill="url(#crystalWingMain)"
            stroke="#E0F2FE"
            strokeWidth="1.5"
          />
          <polygon
            points="135,190 12,148 75,186"
            fill="#FFFFFF"
            fillOpacity="0.45"
          />

          {/* Middle Pop-Out Crystal Feather (Extends furthest left to x=6) */}
          <polygon
            points="128,232 6,214 28,254 118,262"
            fill="url(#crystalWingSub)"
            stroke="#BAE6FD"
            strokeWidth="1.4"
          />
          <polygon
            points="128,232 6,214 68,242"
            fill="#E0F2FE"
            fillOpacity="0.5"
          />

          {/* Lower Pop-Out Crystal Shard */}
          <polygon
            points="122,272 18,284 42,314 116,298"
            fill="url(#crystalWingMain)"
            stroke="#7DD3FC"
            strokeWidth="1.2"
          />

          {/* Floating Mini Crystal Shards Outside Left Frame */}
          <polygon
            points="16,122 28,115 32,129 19,134"
            fill="#67E8F9"
            stroke="#FFFFFF"
            strokeWidth="1"
          >
            <animate
              attributeName="transform"
              type="translate"
              values="0,0; 0,-8; 0,0"
              dur="3.6s"
              repeatCount="indefinite"
            />
          </polygon>
          <polygon
            points="8,266 20,260 23,272 11,276"
            fill="#FDE047"
            stroke="#FFFBEB"
            strokeWidth="0.9"
          >
            <animate
              attributeName="transform"
              type="translate"
              values="0,0; 0,7; 0,0"
              dur="4.2s"
              repeatCount="indefinite"
            />
          </polygon>

          {/* Flowing Royal Academy Cape Billowing Out to the Left Edge */}
          <path
            d="M 210 245 C 135 255, 58 295, 14 378 C 48 392, 92 420, 128 485 L 245 485 Z"
            fill="url(#academyCapeOuter)"
            stroke="url(#goldTrimGrad)"
            strokeWidth="2"
          />
          <path
            d="M 210 262 C 148 278, 82 318, 38 382 C 72 396, 112 428, 146 485 L 235 485 Z"
            fill="url(#academyCapeInner)"
          />
          {/* Golden Filigree Trim along Cape Edge */}
          <path
            d="M 195 252 C 132 266, 65 305, 22 376"
            stroke="url(#goldTrimGrad)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </g>

        {/* ================================================================ */}
        {/* 3. BACK HAIR LAYER (Long Flowing Anime Locks)                    */}
        {/* ================================================================ */}
        <g>
          <path
            d="M 205 110 C 165 145, 140 215, 132 295 C 155 275, 175 250, 190 225 Z"
            fill="url(#animeHairBack)"
          />
          <path
            d="M 355 110 C 398 150, 422 225, 432 305 C 402 282, 382 252, 368 220 Z"
            fill="url(#animeHairBack)"
          />
          <path
            d="M 190 165 C 165 225, 155 295, 165 355 C 185 325, 200 285, 212 245 Z"
            fill="#0F172A"
          />
          <path
            d="M 372 165 C 398 225, 405 295, 392 355 C 375 320, 362 280, 352 245 Z"
            fill="#0F172A"
          />
        </g>

        {/* ================================================================ */}
        {/* 4. TORSO & ROYAL ACADEMY UNIFORM BLAZER                          */}
        {/* ================================================================ */}
        <g>
          {/* Neck & Collarbone with Cel-Shadow */}
          <path
            d="M 258 212 L 256 264 L 308 264 L 306 212 Z"
            fill="url(#animeSkinBase)"
          />
          <path
            d="M 258 212 Q 282 238 306 212 L 306 236 Q 282 252 258 236 Z"
            fill="url(#animeSkinShadow)"
          />

          {/* Crisp White Dress Shirt & Collar */}
          <polygon
            points="242,248 282,345 322,248 306,238 282,272 258,238"
            fill="#F8FAFC"
            stroke="#CBD5E1"
            strokeWidth="1.2"
          />
          {/* Shirt Collar Flaps */}
          <polygon
            points="255,235 236,266 268,278 282,262"
            fill="#FFFFFF"
            stroke="#94A3B8"
            strokeWidth="1.2"
          />
          <polygon
            points="309,235 328,266 296,278 282,262"
            fill="#FFFFFF"
            stroke="#94A3B8"
            strokeWidth="1.2"
          />

          {/* Royal Cyan-Blue Academy Tie with Gold Emblem Pin */}
          <polygon
            points="274,264 290,264 294,282 282,292 270,282"
            fill="url(#crimsonTieGrad)"
            stroke="#0F172A"
            strokeWidth="1.2"
          />
          <polygon
            points="274,286 290,286 297,375 282,398 267,375"
            fill="url(#crimsonTieGrad)"
            stroke="#0F172A"
            strokeWidth="1.2"
          />
          {/* Gold Tie Clip / Crest */}
          <polygon
            points="282,304 290,312 282,320 274,312"
            fill="url(#goldTrimGrad)"
            stroke="#FFFBEB"
            strokeWidth="0.9"
          />

          {/* Academy Blazer Body (Left & Right Tailored Sides) */}
          <path
            d="M 178 268 C 202 250, 232 244, 250 244 L 282 372 L 282 510 L 148 510 C 154 425, 162 332, 178 268 Z"
            fill="url(#academyBlazer)"
            stroke="#334155"
            strokeWidth="1.4"
          />
          <path
            d="M 386 268 C 362 250, 332 244, 314 244 L 282 372 L 282 510 L 416 510 C 410 425, 402 332, 386 268 Z"
            fill="url(#academyBlazer)"
            stroke="#334155"
            strokeWidth="1.4"
          />

          {/* Gold-Trimmed Blazer Lapels */}
          <polygon
            points="250,244 212,288 232,302 222,322 282,375 268,295"
            fill="#1E293B"
            stroke="url(#goldTrimGrad)"
            strokeWidth="2"
          />
          <polygon
            points="314,244 352,288 332,302 342,322 282,375 296,295"
            fill="#1E293B"
            stroke="url(#goldTrimGrad)"
            strokeWidth="2"
          />

          {/* Left & Right Royal Gold Epaulettes (Shoulder Pauldrons) */}
          <path
            d="M 152 278 Q 195 242 242 252 L 234 272 Q 192 266 158 292 Z"
            fill="url(#goldTrimGrad)"
            stroke="#FFFBEB"
            strokeWidth="1.2"
          />
          <path
            d="M 412 278 Q 369 242 322 252 L 330 272 Q 372 266 406 292 Z"
            fill="url(#goldTrimGrad)"
            stroke="#FFFBEB"
            strokeWidth="1.2"
          />

          {/* Gold Academy Buttons */}
          <circle cx="266" cy="396" r="4.5" fill="url(#goldTrimGrad)" />
          <circle cx="266" cy="426" r="4.5" fill="url(#goldTrimGrad)" />
          <circle cx="298" cy="396" r="4.5" fill="url(#goldTrimGrad)" />
          <circle cx="298" cy="426" r="4.5" fill="url(#goldTrimGrad)" />

          {/* Breast Pocket Academy Crest Emblem */}
          <path
            d="M 326 326 L 354 326 L 354 348 C 354 358, 340 366, 340 366 C 340 366, 326 358, 326 348 Z"
            fill="#0F172A"
            stroke="url(#goldTrimGrad)"
            strokeWidth="1.6"
          />
          <path
            d="M 340 332 L 343 340 L 350 342 L 343 345 L 340 352 L 337 345 L 330 342 L 337 340 Z"
            fill="#FDE047"
          />
        </g>

        {/* ================================================================ */}
        {/* 5. ANIME HEAD, EXPRESSIVE FACE & LUMINOUS EYES                   */}
        {/* ================================================================ */}
        <g>
          {/* Left & Right Ears */}
          <path
            d="M 210 156 C 198 154, 196 178, 214 186 Z"
            fill="url(#animeSkinBase)"
            stroke="#C88A74"
            strokeWidth="1.2"
          />
          <path
            d="M 354 156 C 366 154, 368 178, 350 186 Z"
            fill="url(#animeSkinBase)"
            stroke="#C88A74"
            strokeWidth="1.2"
          />

          {/* Anime Face Contour (Sharp Jawline & Chin) */}
          <path
            d="M 212 112 C 210 158, 218 194, 244 214 C 262 228, 274 234, 282 235 C 290 234, 302 228, 320 214 C 346 194, 354 158, 352 112 C 350 76, 322 58, 282 58 C 242 58, 214 76, 212 112 Z"
            fill="url(#animeSkinBase)"
            stroke="#B87B66"
            strokeWidth="1.4"
          />

          {/* Soft Anime Cheek Blush */}
          <ellipse cx="236" cy="178" rx="13" ry="6" fill="#FDA4AF" fillOpacity="0.38" />
          <ellipse cx="328" cy="178" rx="13" ry="6" fill="#FDA4AF" fillOpacity="0.38" />

          {/* LEFT ANIME EYE (Viewer's Left) */}
          <g transform="translate(226, 142)">
            {/* Sclera (White of Eye) */}
            <path
              d="M 2 14 C 7 3, 25 2, 34 11 C 32 23, 24 27, 13 26 C 5 25, 2 20, 2 14 Z"
              fill="#FFFFFF"
            />
            {/* Dual-Tone Cyan/Violet Iris */}
            <ellipse cx="19" cy="15" rx="10.5" ry="11.5" fill="url(#animeIrisGrad)" />
            {/* Deep Pupil */}
            <ellipse cx="19" cy="15.5" rx="4.8" ry="5.5" fill="#0F172A" />
            {/* Lower Cyan Luminescence */}
            <path
              d="M 11 19 Q 19 25 27 19"
              stroke="#67E8F9"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
            />
            {/* Anime Specular Catchlights (Large Top-Left + Small Bottom-Right) */}
            <circle cx="13.5" cy="10" r="3.8" fill="#FFFFFF" />
            <circle cx="24" cy="19.5" r="1.9" fill="#FFFFFF" />
            <circle cx="22.5" cy="9.5" r="1.3" fill="#E0F2FE" />
            {/* Bold Upper Eyelash */}
            <path
              d="M 0 15 C 6 1, 25 0, 36 11 C 33 6, 22 4, 12 6 C 5 8, 2 12, 0 15 Z"
              fill="#090D1A"
            />
            <path
              d="M 1 13 C 8 2, 26 2, 36 10"
              stroke="#090D1A"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
            {/* Eyelid Crease */}
            <path
              d="M 5 4 Q 19 -2 32 5"
              stroke="#7C5347"
              strokeWidth="1.2"
              fill="none"
            />
          </g>

          {/* RIGHT ANIME EYE (Viewer's Right) */}
          <g transform="translate(302, 142)">
            {/* Sclera */}
            <path
              d="M 2 11 C 11 2, 29 3, 34 14 C 34 20, 31 25, 23 26 C 12 27, 4 23, 2 11 Z"
              fill="#FFFFFF"
            />
            {/* Iris */}
            <ellipse cx="17" cy="15" rx="10.5" ry="11.5" fill="url(#animeIrisGrad)" />
            {/* Pupil */}
            <ellipse cx="17" cy="15.5" rx="4.8" ry="5.5" fill="#0F172A" />
            {/* Lower Cyan Luminescence */}
            <path
              d="M 9 19 Q 17 25 25 19"
              stroke="#67E8F9"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
            />
            {/* Specular Catchlights */}
            <circle cx="11.5" cy="10" r="3.8" fill="#FFFFFF" />
            <circle cx="22" cy="19.5" r="1.9" fill="#FFFFFF" />
            <circle cx="20.5" cy="9.5" r="1.3" fill="#E0F2FE" />
            {/* Bold Upper Eyelash */}
            <path
              d="M 0 10 C 10 2, 28 2, 35 13"
              stroke="#090D1A"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
            {/* Eyelid Crease */}
            <path
              d="M 4 5 Q 17 -2 31 4"
              stroke="#7C5347"
              strokeWidth="1.2"
              fill="none"
            />
          </g>

          {/* Expressive Anime Eyebrows */}
          <path
            d="M 225 132 Q 244 125 262 133"
            stroke="#1E1B4B"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
          <path
            d="M 302 133 Q 320 125 339 132"
            stroke="#1E1B4B"
            strokeWidth="2.6"
            strokeLinecap="round"
          />

          {/* Delicate Anime Nose & Shadow */}
          <path
            d="M 282 166 L 279 181 L 284 183"
            stroke="#B87B66"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polygon points="282,168 287,181 282,183" fill="#EBB49E" opacity="0.7" />

          {/* Confident Gentle Anime Smile */}
          <path
            d="M 271 199 Q 282 205 293 199"
            stroke="#9F5848"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 278 205 Q 282 207 286 205"
            stroke="#EBB49E"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </g>

        {/* ================================================================ */}
        {/* 6. FRONT LAYERED ANIME HAIR & TOP POP-OUT AHOGE / HALO           */}
        {/*    (Extends up to y = 4, popping out above the top card border)  */}
        {/* ================================================================ */}
        <g>
          {/* Main Crown & Sweeping Anime Bangs */}
          <path
            d="M 196 128 C 194 68, 232 34, 282 34 C 332 34, 370 68, 368 128 C 362 98, 348 82, 336 74 C 344 106, 336 138, 322 158 C 324 126, 316 102, 304 88 C 304 122, 294 148, 282 162 C 274 134, 268 106, 262 88 C 254 118, 244 144, 232 160 C 234 128, 228 100, 222 82 C 214 106, 206 136, 198 168 C 194 152, 195 138, 196 128 Z"
            fill="url(#animeHairMain)"
            stroke="#090D1A"
            strokeWidth="1.4"
          />

          {/* Side Framing Hair Locks (Left & Right) */}
          <path
            d="M 202 106 C 188 142, 188 192, 204 242 C 212 206, 214 166, 216 132 Z"
            fill="url(#animeHairMain)"
            stroke="#090D1A"
            strokeWidth="1.2"
          />
          <path
            d="M 362 106 C 376 142, 376 192, 360 242 C 352 206, 350 166, 348 132 Z"
            fill="url(#animeHairMain)"
            stroke="#090D1A"
            strokeWidth="1.2"
          />

          {/* Dynamic Pop-Out Top Hair Crest (Ahoge) Breaking Out Above Top Card Edge! */}
          <path
            d="M 278 36 C 266 10, 292 -2, 322 8 C 296 12, 288 24, 292 38 Z"
            fill="url(#animeHairMain)"
            stroke="#38BDF8"
            strokeWidth="1.2"
          />
          <path
            d="M 268 38 C 248 18, 232 14, 216 24 C 236 24, 250 32, 258 42 Z"
            fill="url(#animeHairMain)"
          />

          {/* Floating Gold & Cyan Diamond Crown Finial (Top Pop-Out Accent) */}
          <g transform="translate(282, 14)">
            <polygon
              points="0,-12 9,0 0,12 -9,0"
              fill="url(#goldTrimGrad)"
              stroke="#FFFBEB"
              strokeWidth="1.2"
            />
            <polygon points="-16,0 -11,-4 -6,0 -11,4" fill="#38BDF8" />
            <polygon points="16,0 11,-4 6,0 11,4" fill="#38BDF8" />
          </g>

          {/* Signature Anime Hair Angel-Ring Shine & Cyan Rim Highlights */}
          <path
            d="M 224 96 Q 252 84 278 92 Q 252 94 226 104 Z"
            fill="url(#animeHairHighlight)"
          />
          <path
            d="M 290 92 Q 318 84 342 98 Q 316 96 292 102 Z"
            fill="url(#animeHairHighlight)"
          />
        </g>

        {/* ================================================================ */}
        {/* 7. FOREGROUND SPELLCASTER HAND & HOLOGRAPHIC ACADEMY ORB         */}
        {/* ================================================================ */}
        <g transform="translate(345, 348)">
          {/* Pulsing Arcane Cyan Energy Orb */}
          <circle cx="42" cy="18" r="64" fill="url(#magicOrbRadial)">
            <animate
              attributeName="r"
              values="58;68;58"
              dur="3.2s"
              repeatCount="indefinite"
            />
          </circle>

          {/* Orbiting Mini Rune Ring Around Hand */}
          <ellipse
            cx="42"
            cy="22"
            rx="52"
            ry="18"
            stroke="#67E8F9"
            strokeWidth="1.5"
            strokeDasharray="6 4"
            transform="rotate(-18 42 22)"
          />
          <ellipse
            cx="42"
            cy="22"
            rx="38"
            ry="12"
            stroke="#FDE047"
            strokeWidth="1.1"
            transform="rotate(22 42 22)"
          />

          {/* Floating Crystal Emblem Inside the Magic Orb */}
          <g transform="translate(42, 12)">
            <polygon
              points="0,-22 14,0 0,22 -14,0"
              fill="#E0F2FE"
              stroke="#24B6D4"
              strokeWidth="1.8"
            >
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0,-3; 0,4; 0,-3"
                dur="2.8s"
                repeatCount="indefinite"
              />
            </polygon>
            <polygon points="0,-14 8,0 0,14 -8,0" fill="#FFFFFF" />
          </g>

          {/* Stylized Anime Hand & Blazer Cuff */}
          <path
            d="M 8 56 C 18 44, 34 40, 54 44 C 66 46, 74 40, 78 34 C 74 50, 60 58, 42 60 C 28 62, 18 68, 12 76 Z"
            fill="url(#animeSkinBase)"
            stroke="#B87B66"
            strokeWidth="1.3"
          />
          {/* Navy & Gold Sleeve Cuff */}
          <polygon
            points="-12,68 18,52 34,76 2,94"
            fill="#0F172A"
            stroke="url(#goldTrimGrad)"
            strokeWidth="2"
          />
        </g>

        {/* ================================================================ */}
        {/* 8. FLOATING STARLIGHT & SPARKLE PARTICLES AROUND CHARACTER       */}
        {/* ================================================================ */}
        {[
          { x: 54, y: 112, s: 1, color: '#67E8F9' },
          { x: 118, y: 78, s: 0.85, color: '#FDE047' },
          { x: 418, y: 108, s: 1.1, color: '#67E8F9' },
          { x: 446, y: 228, s: 0.9, color: '#FDE047' },
          { x: 96, y: 336, s: 1, color: '#A5F3FC' },
        ].map((sp, idx) => (
          <g key={idx} transform={`translate(${sp.x}, ${sp.y}) scale(${sp.s})`}>
            <path
              d="M 0 -10 L 2.5 -2.5 L 10 0 L 2.5 2.5 L 0 10 L -2.5 2.5 L -10 0 L -2.5 -2.5 Z"
              fill={sp.color}
            >
              <animate
                attributeName="opacity"
                values="0.35;1;0.35"
                dur={`${2.4 + idx * 0.5}s`}
                repeatCount="indefinite"
              />
            </path>
          </g>
        ))}
      </svg>
    </div>
  );
};
