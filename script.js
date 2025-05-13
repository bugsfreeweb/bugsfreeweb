const linksContainer = document.querySelector(".lists-container");
const toggleBtn = document.querySelector(".menu");
toggleBtn.addEventListener("click", () => {
  const linksHeight = document
    .querySelector(".nav-list")
    .getBoundingClientRect().height;
  const linksContainerHeight = linksContainer.getBoundingClientRect().height;
  if (linksContainerHeight == linksHeight) {
    linksContainer.style.maxHeight = 0;
  } else if (linksContainerHeight == 0) {
    linksContainer.style.maxHeight = `${linksHeight}px`;
  }
});

const themeToggle = document.querySelector(".icon i");
themeToggle.addEventListener("click", () => {
  if (themeToggle.classList.contains("fa-moon")) {
    themeToggle.classList.remove("fa-moon");
    themeToggle.classList.add("fa-sun");
    document.body.classList.remove("light-theme");
    localStorage.setItem("theme", "dark");
  } else {
    themeToggle.classList.remove("fa-sun");
    themeToggle.classList.add("fa-moon");
    document.body.classList.add("light-theme");
    localStorage.setItem("theme", "light");
  }
});

window.addEventListener("DOMContentLoaded", () => {
  const theme = localStorage.getItem("theme")
    ? localStorage.getItem("theme")
    : "dark";
  if (theme == "dark") {
    document.body.classList.remove("light-theme");
  } else if (theme == "light") {
    document.body.classList.add("light-theme");
  }
});
// timer function

const time = document.querySelectorAll('.operand')
const futureDate = new Date(2025, 2, 17, 12, 0, 0);
const futureTime = futureDate.getTime();
const timerFunction = () => {
  const currentDate = new Date();
    //get current milliseconds
    const currentTime = currentDate.getTime();
    
    const timeRemaining = futureTime - currentTime;
    const oneDay = 24 * 60 * 60 * 1000;
    const oneHour = oneDay / 24;
    const oneMinute = oneHour/60;

    const daysRemaining = Math.floor(timeRemaining / oneDay);
    const hoursRemaining = Math.floor((timeRemaining % oneDay) / oneHour);
    const minsRemaining = Math.floor((timeRemaining % oneHour) / oneMinute);
    const secRemaining = Math.floor((timeRemaining % oneMinute)/ 1000);
    const totalTimeRemaining = [daysRemaining, hoursRemaining, minsRemaining, secRemaining];
    const timerEl = document.querySelector('.timer');
  time.forEach((item, index)=>{
    item.textContent = totalTimeRemaining[index];
    if(timeRemaining <= 0){
      timerEl.innerHTML = `<button class="btn banner-btn">Mint Now</button>`;
      timerEl.classList.remove('grid');
    }else{
      timerEl.classList.add('grid');
    }
  });
  
};

setInterval(timerFunction, 0);
