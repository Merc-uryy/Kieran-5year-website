/* ================================================================
   LOVE NOTE POPUPS
   Shows a random "thing I love about you" note at random intervals.
   Popups now stack instead of replacing each other, and stay put
   until he actually taps the X — nothing disappears on its own.

   To use on a page, add this line near the bottom of the <body>:
   <script src="/js/popup.js"></script>
   ================================================================ */

const loveNotes = [
  "I love how hard you work for us.",
  "I love that you always cuddle me first, before anything else.",
  "I love how thoughtful you are, even about the small things.",
  "I love that you always find a way to make me laugh.",
  "I love how you never give up on us.",
  "I love your hands on the handlebars and mine around you.",
  "I love how you're the most gorgeous man!",
  "I love everything about you!",
  "I love how you love me!",
  "I love how you make even boring errands feel fun.",
  "I love that you check in on me without me having to ask.",
  "I love how you remember the little things I say.",
  "I love that you're patient with me on my off days.",
  "I love how safe I feel when I'm with you.",
  "I love that you still get excited to see me.",
  "I love how you make me want to be a better person.",
  "I love that you're my favorite person to do nothing with.",
  "I love how you protect the people you care about.",
  "I love that you know exactly when I need a hug.",
  "I love how you make our little moments feel huge.",
  "I love that you never make me feel silly for how I feel.",
  "I love how your voice sounds first thing in the morning.",
  "I love that you choose me, every single day.",
  "I love how you make home feel like wherever you are."
];



let lastNoteIndex = -1;

function pickRandomNote() {
  let index;
  do {
    index = Math.floor(Math.random() * loveNotes.length);
  } while (index === lastNoteIndex && loveNotes.length > 1);
  lastNoteIndex = index;
  return loveNotes[index];
}

function getPopupStack() {
  let stack = document.getElementById("lovePopupStack");
  if (!stack) {
    stack = document.createElement("div");
    stack.className = "love-popup-stack";
    stack.id = "lovePopupStack";
    document.body.appendChild(stack);
  }
  return stack;
}

function showLovePopup() {
  const stack = getPopupStack();

  const popup = document.createElement("div");
  popup.className = "love-popup";
  popup.innerHTML = `
    <button class="love-popup-close" aria-label="Close">✕</button>
    <span class="love-popup-label">a thing I love about you</span>
    <p>${pickRandomNote()}</p>
  `;
  stack.appendChild(popup);

  popup.querySelector(".love-popup-close").addEventListener("click", () => {
    popup.remove();
  });

  // no auto-dismiss — it stays until he closes it himself

  scheduleNextPopup();
}

function scheduleNextPopup() {
  // random delay between 6–15 seconds — lower these to make it MORE annoying
  const delay = Math.random() * (45000 - 20000) + 20000;
  setTimeout(showLovePopup, delay);
}

scheduleNextPopup();