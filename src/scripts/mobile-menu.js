"use strict";
function showMenu(e) {
  [...document.getElementsByClassName("mobile-nav")].forEach(m => {m.style.display = (m.style.display==="block") ? "none" : "block"; });
}