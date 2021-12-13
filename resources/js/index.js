// Node selector
const btnContact = document.querySelector(".nav__btn--contact");
const popup = document.querySelector(".section-popup");
const popupClose = document.querySelector(".section-popup__close");
const btnForm = document.querySelector(".form__btn");

btnContact.addEventListener("click", () => {
  popup.classList.toggle("section-popup__hide");
});

popup.addEventListener("click", (e) => {
  if (e.target === popup || e.target === popupClose) {
    popup.classList.toggle("section-popup__hide");
  }
})

popupClose.addEventListener("click", () => {
  popup.classList.toggle("section-popup__hide");
})


btnForm.addEventListener("click", (e) => {
  e.preventDefault();
  
})