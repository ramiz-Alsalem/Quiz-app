const countSpan = document.querySelector(".quiz-info .count span");
const bullets = document.querySelector(".bullets");
const bulletsSpanContainer = document.querySelector(
  ".bullets .spans-container"
);
const quizArea = document.querySelector(".quiz-area");
const answersArea = document.querySelector(".answers-area");
const submitBtn = document.getElementById("submit-button");
const resultsContainer = document.querySelector(".results");
const countDownEle = document.querySelector(".countdown");
const category = document.getElementById("theCategory");
const categoryOpt = document.querySelectorAll(".theCategory option");

let currentIndex = 0;
let rightAnswersCount = 0;
let countDownInterval;
let categoryValue;

if (localStorage.getItem("category")) {
  categoryValue = localStorage.getItem("category");
} else {
  categoryValue = category.value;
}

handleSelect();

getQuestions();

function handleSelect() {
  const selectedOpt = document.querySelector(
    `.category option[value="${categoryValue}"]`
  );
  selectedOpt.selected = true;
  localStorage.setItem("category", categoryValue);
  category.onchange = () => {
    categoryValue = category.value;
    console.log(categoryValue);
    localStorage.setItem("category", categoryValue);
    location.reload();
  };
}

function getQuestions() {
  const myRequest = new XMLHttpRequest();
  myRequest.open(
    "get",
    `languages-questions/${localStorage.getItem("category")}_questions.json`,
    true
  );
  myRequest.send();
  myRequest.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
      const questionsObject = JSON.parse(this.responseText);
      const qCount = questionsObject.length;
      createBullets(qCount);
      addQuestionData(questionsObject[currentIndex], qCount);
      countDown(270, qCount);
      submitBtn.addEventListener("click", () => {
        if (currentIndex < qCount) {
          const rightAnswer = questionsObject[currentIndex]["right_answer"];
          currentIndex++;
          checkAnswer(rightAnswer, qCount);
          quizArea.innerHTML = "";
          answersArea.innerHTML = "";
          addQuestionData(questionsObject[currentIndex], qCount);
          handleBulletsClass();
          showResult(qCount);
          clearInterval(countDownInterval);
          countDown(270, qCount);
        }
      });
    }
  };
}

function createBullets(number) {
  countSpan.textContent = number;
  for (let i = 0; i < number; i++) {
    const bullet = document.createElement("span");
    if (i == 0) {
      bullet.classList.add("on");
    }
    bulletsSpanContainer.appendChild(bullet);
  }
}

function addQuestionData(obj, count) {
  if (currentIndex < count) {
    const questionTitle = document.createElement("h2");
    const questionText = document.createTextNode(obj["title"]);
    questionTitle.appendChild(questionText);
    quizArea.appendChild(questionTitle);
    for (let i = 1; i <= 4; i++) {
      const answerCon = document.createElement("div");
      answerCon.classList.add("answer");

      const input = document.createElement("input");
      input.type = "radio";
      input.name = "question";
      input.id = `answer_${i}`;
      input.dataset["answer"] = obj[`answer_${i}`];

      i === 1 ? (input.checked = true) : "";

      const label = document.createElement("label");
      label.setAttribute("for", input.id);
      const labelText = document.createTextNode(obj[`answer_${i}`]);
      label.appendChild(labelText);
      answerCon.append(input, label);
      answersArea.appendChild(answerCon);
    }
  }
}

function checkAnswer(rightAnswer, count) {
  const theChoosenAnswer = document.querySelector(
    "input[name='question']:checked"
  ).dataset.answer;
  if (theChoosenAnswer === rightAnswer) {
    rightAnswersCount++;
  }
}

function handleBulletsClass() {
  const bulletsSpan = document.querySelectorAll(
    ".bullets .spans-container span"
  );
  bulletsSpan.forEach((bullet, index) => {
    if (index === currentIndex) {
      bullet.classList.add("on");
    }
  });
}

function showResult(count) {
  if (currentIndex === count) {
    let theResults;
    quizArea.remove();
    answersArea.remove();
    submitBtn.remove();
    bullets.remove();
    if (rightAnswersCount > count / 2 && rightAnswersCount < count) {
      theResults = `<span class="good">Good</span>, You answered ${rightAnswersCount} of ${count}`;
    } else if (rightAnswersCount === count) {
      theResults = `<span class="perfect">perfect</span>, You answered ${rightAnswersCount} of ${count}`;
    } else {
      theResults = `<span class="bad">Bad</span>, You answered ${rightAnswersCount} of ${count}`;
    }
    resultsContainer.innerHTML = theResults;
    resultsContainer.style.padding = "1rem";
    resultsContainer.style.backgroundColor = "#fff";
    resultsContainer.style.marginTop = "1rem";
  }
}

function countDown(duration, count) {
  if (currentIndex < count) {
    let minutes, seconds;
    countDownInterval = setInterval(() => {
      minutes = parseInt(duration / 60);
      seconds = parseInt(duration % 60);
      minutes = minutes < 10 ? `0${minutes}` : minutes;
      seconds = seconds < 10 ? `0${seconds}` : seconds;
      countDownEle.innerHTML = `${minutes} : ${seconds}`;
      if (--duration < 0) {
        clearInterval(countDownInterval);
        submitBtn.click();
      }
    }, 1000);
  }
}
