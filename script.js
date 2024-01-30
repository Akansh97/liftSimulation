console.clear();

const form = document.querySelector(".usrInput");
const container = document.querySelector(".container");

let lifts = 0;
let floors = 0;

let idleLifts = [];
let liftPos = [-1];

const debug = () => console.log(idleLifts, liftPos);

const renderFn = (event) => {
  event && event.preventDefault();

  container.innerHTML = "";

//   lifts = (event && event.target.elements["lifts-inp"].value) || 3;
//   floors = (event && event.target.elements["floors-inp"].value) || 5;

  lifts = event &&event.target.elements[0].value || 4;
  floors = event && event.target.elements[1].value || 3;
  
  idleLifts = [];
  liftPos = [-1];
  for (let i = 0; i < lifts; i++) {
    liftPos.push(1);
    idleLifts.push(i + 1);
  }

  for (let i = floors; i >= 1; i--) {
    let htmlStr = "";
    if (i === 1) {
      let liftstr = "";

      for (let j = 1; j <= lifts; j++) {
        liftstr += `
          <div class='lift lift-${j}'>
             <div id='lift-${j}-leftDoor' class="leftDoor"></div>
             <div id='lift-${j}-rightDoor' class="rightDoor"></div>
          </div> 
        `;
      }

      htmlStr = `
            <div class='floor floor${i}'>

              <div class='lift-btn'>
                <button class='btn f${i}up ' role="button" onClick='btnFn()'>UP</button>
                <button class='btn f${i}dwn ' role="button" onClick='btnFn()'>DOWN</button>
              </div>

              <div class='lift-block b${i}'>
                ${liftstr}
              </div>

            </div>

          `;
    } else {
      htmlStr = `
            <div class='floor floor${i}'>

              <div class='lift-btn'>
                <button class='btn f${i}up ' role="button" onClick='btnFn()'>UP</button>
                <button class='btn f${i}dwn ' role="button" onClick='btnFn()'>DOWN</button>
              </div>

              <div class='lift-block b${i}'>
              </div>

            </div>

          `;
    }

    const div = document.createElement("div");
    div.innerHTML = htmlStr;
    container.appendChild(div);
  }
};

form.addEventListener("submit", renderFn);

renderFn();

let requests = [];

const btnFn = async (e) => {
  const req = event.target.classList[1][1];
  await findNearestIdleLift(req);
  requests.push(req);
  // processArrayAsync()
};

async function processArrayAsync() {
  for (const element of requests) {
    await new Promise((resolve) => {
      setTimeout(async () => {
        await findNearestIdleLift(element);
        resolve();
      }, 0);
    });
  }
}

const findNearestIdleLift = async (requestedFloor) => {
  let resLift = -1;
  if (lifts >= 1 && idleLifts.length > 0) {
    let diff = floors + 10;
    // console.log(requestedFloor);
    for (let j = 0; j < idleLifts.length; j++) {
      const diff2 = Math.abs(requestedFloor - liftPos[idleLifts[j]]);
      if (diff2 < diff) {
        diff = diff2;
        resLift = idleLifts[j];
      }
    }
  }

else return

  if (liftPos[resLift] === parseInt(requestedFloor)) {
    await new Promise((resolve) => {
      doorAnimationFunction(resLift);
      resolve();
    });
    idleLifts = idleLifts.filter((e) => e !== resLift);
    const el2 = document.getElementById(`lift-${resLift}-leftDoor`);
    const el3 = document.getElementById(`lift-${resLift}-rightDoor`);
    el2.classList.add("leftDoorAnimationClass");
    el3.classList.add("rightDoorAnimationClass");
    setTimeout(() => {
      el2.classList.remove("leftDoorAnimationClass");
      el3.classList.remove("rightDoorAnimationClass");
      idleLifts.push(resLift);
    }, 3200);
  } else {
    const f11 = async () => {
      await moveLift(resLift, requestedFloor).then(() =>
        doorAnimationFunction(resLift)
      );
    };
    f11();
  }
};

const moveLift = async (liftNumber, requestedFloor) => {
  liftPos[liftNumber] = parseInt(requestedFloor);
  const el = document.querySelector(`.lift-${liftNumber}`);
  const el2 = document.getElementById(`lift-${liftNumber}-leftDoor`);
  const el3 = document.getElementById(`lift-${liftNumber}-rightDoor`);

  await new Promise((resolve) => {
    idleLifts = idleLifts.filter((e) => e !== liftNumber);

    const movePx = (requestedFloor - 1) * 150;
    el.style.transform = `translateY(-${movePx}px)`;
    // el.style.transition = "all 3s";

    setTimeout(() => {
      resolve();
    }, 2000);
  });
};

async function doorAnimationFunction(liftNumber) {
  idleLifts = idleLifts.filter((e) => e !== liftNumber);
//   console.log({ liftNumber });
  const el2 = document.getElementById(`lift-${liftNumber}-leftDoor`);
  const el3 = document.getElementById(`lift-${liftNumber}-rightDoor`);

  await new Promise((resolve) => {
    el2.classList.add("leftDoorAnimationClass");
    el3.classList.add("rightDoorAnimationClass");

    setTimeout(() => {
      el2.classList.remove("leftDoorAnimationClass");
      el3.classList.remove("rightDoorAnimationClass");
      idleLifts.push(liftNumber);
      resolve();
    }, 3200);
  });
}
