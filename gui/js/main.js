/**
 * main.js
 *
 * Only runs in modern browsers via feature detection
 */

if('querySelector' in document && 'localStorage' in window && 'addEventListener' in window) {

  // Add class "js" to html element
  document.querySelector('html').classList.add('js');

}
