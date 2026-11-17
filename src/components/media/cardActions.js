// A card's interactions, set per row. `menu`: what the card's dots menu offers ('favorite', 'watchlist',
// 'pin'). `markers`: which of them stay on the card while active, without opening the menu (favourite and
// watchlist stay in the menu pill, a pin gets its own top-left marker). Objects are hoisted so a memo'd
// card gets the same one every render.
export const CARD_ACTIONS = {
  none: { menu: [], markers: [] },
  // Any title: favourite or save it, and see that you did
  browse: { menu: ['favorite', 'watchlist'], markers: ['favorite', 'watchlist'] },
  // Someone else's watchlist: save a title to yours
  save: { menu: ['watchlist'], markers: ['watchlist'] },
  // Titles already on your watchlist (Watch together): a saved marker says nothing, the menu removes
  saved: { menu: ['watchlist'], markers: [] },
  // /watchlist: as `saved`, plus pinning to Up next and the pin marker
  watchlist: { menu: ['watchlist', 'pin'], markers: ['pin'] },
}
