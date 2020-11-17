const CHAR_NUM_0 = "0".charCodeAt(0);
const TIMER_IDS = ["hour-tens", "hour-ones", "minute-tens", "minute-ones", "second-tens", "second-ones"];
const TIMER_SECONDS = [36000, 3600, 600, 60, 10, 1];
const INPUT_SLOTS = TIMER_SECONDS.length;
const MAX_TIMER = 359999; // 36000*9 + 3600*9 + 600*5 + 60*9 + 10*5 + 1*9
const STATUS_ENUM = Object.freeze({"NOT_SET": 0, "RUNNING": 1, "PAUSED": 2});
let startButton;
let timeLeft = 0;
let status = STATUS_ENUM.NOT_SET;
let interval;
let alarm = new Audio("alarm.mp3");
alarm.loop = true;
let title = '';

function loaded() {
  startButton = document.getElementById("start");
  document.getElementById("title").addEventListener("keyup", function(event) {
    if (event.keyCode == 13) { // "Enter" key
	  setTitle();
	}
  });
}

function mod(n, m) {
  return ((n%m)+m)%m;
}

function changeNumber(delta, parentId) {
  let input = document.getElementById(parentId).getElementsByClassName("input-digit")[0];
  let inputVal = input.value;
  let previous;
  if (inputVal.length === 1) {
    previous = inputVal.charCodeAt(0) - CHAR_NUM_0;
    if (previous >= 0 && previous <= 9) {
      input.value = mod(previous + delta, 10);
    } else {
      input.value = "0";
    }
  } else {
    input.value = "0";
  }
}

function getTimeSeconds() {
  let t = 0;
  for (let i=0; i<INPUT_SLOTS; i++) {
    let auxVal = document.getElementById(TIMER_IDS[i]).getElementsByClassName("input-digit")[0].value;
    if (auxVal.length === 1) {
      let x = auxVal.charCodeAt(0) - CHAR_NUM_0;
      if (x >= 0 && x <= 9) {
        t += x * TIMER_SECONDS[i];
      } else {
        return -1;
      }
    } else {
      return -1;
    }
  }
  return t;
}

function seconds2Time(t) {
  let v = Array(INPUT_SLOTS);
  for (let i=0; i<INPUT_SLOTS; i++) {
    v[i] = Math.floor(t / TIMER_SECONDS[i]);
    t -= v[i] * TIMER_SECONDS[i];
  }
  return v;
}

function setTime(v) {
  for (let i=0; i<INPUT_SLOTS; i++) {
    document.getElementById(TIMER_IDS[i]).getElementsByClassName("input-digit")[0].value = v[i];
  }
  document.title = `${title} ${v[0]}${v[1]}:${v[2]}${v[3]}:${v[4]}${v[5]}`;
}

function resetTime() {
  timeLeft = 0;
  for (let i=0; i<INPUT_SLOTS; i++) {
    document.getElementById(TIMER_IDS[i]).getElementsByClassName("input-digit")[0].value = "0";
  }
}

function editVisibility(visible) {
  for (let i=0; i<INPUT_SLOTS; i++) {
    let aux = document.getElementById(TIMER_IDS[i]);
    let arrowUp = aux.getElementsByClassName("arrow-up")[0];
    let arrowDown = aux.getElementsByClassName("arrow-down")[0];
    arrowUp.style.visibility = visible ? "visible" : "hidden";
    arrowUp.disabled = !visible;
    arrowDown.style.visibility = visible ? "visible" : "hidden";
    arrowDown.disabled = !visible;
    aux.getElementsByClassName("input-digit")[0].readOnly = !visible;
  }
}

function startCountdown() {
  interval = setInterval(tick, 1000);
}

function tick() {
  timeLeft -= 1;
  if (timeLeft < 0) {
    clearInterval(interval);
    status = STATUS_ENUM.NOT_SET;
    document.title = "TIME IS UP!!!";
    alarm.play();
    alert("Time is up!");
    alarm.pause();
    alarm.currentTime = 0;
    reset();
  } else {
    setTime(seconds2Time(timeLeft));
  }
}

function startStop() {
  switch (status) {
    case STATUS_ENUM.NOT_SET:
      let t = getTimeSeconds();
      if (t > 0 && t <= MAX_TIMER) {
        status = STATUS_ENUM.RUNNING;
        timeLeft = t;
        startButton.value = "Pause";
        editVisibility(false);
        setTime(seconds2Time(timeLeft));
        startCountdown();
      } else {
        resetTime();
      }
      break;
    case STATUS_ENUM.RUNNING:
      clearInterval(interval);
      status = STATUS_ENUM.PAUSED;
      startButton.value = "Resume";
      break;
    case STATUS_ENUM.PAUSED:
      status = STATUS_ENUM.RUNNING;
      startButton.value = "Pause";
      startCountdown();
      break;
  }
}

function reset() {
  clearInterval(interval);
  resetTime();
  editVisibility(true);
  startButton.value = "Start";
  document.title = title || "Timer";
  status = STATUS_ENUM.NOT_SET;
}

function setTitle() {
  title = document.getElementById("title").value;
  document.title = title;
}

function clearTitle() {
  title = '';
  document.title = "Timer";
  document.getElementById("title").value = '';
}