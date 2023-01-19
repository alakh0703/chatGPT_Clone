import bot from './assets/bot.svg'
import user from './assets/user.svg'

const form = document.querySelector('form')
const chatContainer = document.querySelector('#chat_container')
const area51 = document.querySelector('#textArea51');
let loadInterval;
let toggleText = document.getElementById("botchat");
let isChatStarted = false;
const toggle = document.getElementById("bluetooth");

const jobTitle = document.getElementById("jobTitle");
const gar = document.getElementById("garesponse");
const jobTitleContainer = document.getElementById("job");
const rr = document.getElementById("rresponse");
let track = 0;
let job = "Programmer";
toggle.addEventListener('click', () => {

  if (isChatStarted == false) {
    isChatStarted = true;
    toggleText.innerHTML = "Resume Maker";
    area51.placeholder = "Enter your experience as " + job + " here ...."
    if (track == 0) {
      jobTitleContainer.style.display = "block";
      area51.disabled = true;

    }
    track = 1;

  }
  else if (isChatStarted == true) {
    isChatStarted = false;
    toggleText.innerHTML = "ChatBot";
    area51.placeholder = "Start chat ...."
    jobTitleContainer.style.display = "none";
    area51.disabled = false;
  }
});

let history = []

function loader(element) {
  element.textContent = ''

  loadInterval = setInterval(() => {
    // Update the text content of the loading indicator
    element.textContent += '.';

    // If the loading indicator has reached three dots, reset it
    if (element.textContent === '....') {
      element.textContent = '';
    }
  }, 300);
}

function typeText(element, text) {
  let index = 0
  gar.style.display = "block";
  rr.style.display = "none";
  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index)
      index++
    } else {
      clearInterval(interval)
      gar.style.display = "none";
      rr.style.display = "block";


    }
  }, 20)



}

// generate unique ID for each message div of bot
// necessary for typing text effect for that specific reply
// without unique ID, typing text will work on every element
function generateUniqueId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe(isAi, value, uniqueId) {
  return (
    `
        <div class="wrapper ${isAi == false && 'ai'}">
            <div class="chat">
                <div class="profile">
                    <img 
                      src=${isAi ? bot : user} 
                      alt="${isAi ? 'bot' : 'user'}" 
                    />
                </div>
                <div class="message" id=${uniqueId}>${value}</div>
            </div>
        </div>
    `
  )
}

const handleSubmit = async (e) => {

  area51.innerHTML = "";
  e.preventDefault()

  const data = new FormData(form)
  let inputExp = data.get('prompt');

  if (isChatStarted == true) {
    inputExp = "I am a " + job + ". Act as a resume builder and rewrite the below experience in form of bullet points of resume in tangible way:\n" + inputExp;
    console.log(inputExp);
  }
  addToHistory(data.get('prompt'));

  // user's chatstripe     
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'))

  // to clear the textarea input 
  form.reset()

  // bot's chatstripe
  const uniqueId = generateUniqueId()
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId)

  // to focus scroll to the bottom 
  chatContainer.scrollTop = chatContainer.scrollHeight;

  // specific message div 
  const messageDiv = document.getElementById(uniqueId)

  // messageDiv.innerHTML = "..."
  loader(messageDiv)
  // https://codex-im0y.onrender.com/
  const response = await fetch('http://localhost:5000', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: inputExp
    })
  })
  // prompt: data.get('prompt')
  clearInterval(loadInterval)
  messageDiv.innerHTML = " "

  if (response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim() // trims any trailing spaces/'\n' 

    typeText(messageDiv, parsedData)
  } else {
    const err = await response.text()

    messageDiv.innerHTML = "Something went wrong"
    alert(err)
  }



}

form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e)
  }
})

jobTitle.addEventListener('submit', handleSubmit)
jobTitle.addEventListener('keyup', (e) => {
  if (e.keyCode === 13) {
    job = e.target.value;;
    jobTitleContainer.style.display = "none";
    area51.disabled = false;
    area51.focus();
    area51.placeholder = "Enter your experience as " + job + "here ....";
  }
})

let currentIndex = -1;

document.addEventListener("keydown", function (e) {

  console.log(history);
  if (e.keyCode === 38) { // up arrow key
    if (currentIndex > 0) {
      currentIndex--;
      area51.innerHTML = history[currentIndex];
    }
  } else if (e.keyCode === 40) { // down arrow key
    if (currentIndex < history.length - 1) {
      currentIndex++;
      area51.innerHTML = history[currentIndex];

    }
    else {
      currentIndex = history.length;
      area51.innerHTML = "";
    }
  }
});

function addToHistory(message) {
  history.push(message);
  currentIndex = history.length;
}

rr.addEventListener('click', regenerateResponse);
function regenerateResponse() {
  if (history.length > 0) {
    let response = history[history.length - 1];
    area51.value = response;
    handleSubmit(event);

  };

}
