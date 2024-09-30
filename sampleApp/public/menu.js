let menudata = document.querySelector(".menudata");
function showMenu() {
  let menuNone = getComputedStyle(document.querySelector(".menudata"));

  if (menuNone.display == "none") {
    console.log("entered");

    menudata.style.display = "block";
  } else {
    menudata.style.display = "none";
  }
}
let menu = document.querySelector(".menu");
console.log(menu);

menu.addEventListener("click", (e) => {
  showMenu();
});
document.addEventListener("click", (e) => {
  if (!menu.contains(e.target)) {
    menudata.style.display = "none";
  }
});
