console.clear();

const form = document.querySelector(".usrInput");
const container = document.querySelector(".container");

// DATA STORE
let lifts = 0; //number of lifts
let floors = 0; //number of floors

let idleLifts = []; //array to track lifts which are idle
let liftPos = [-1]; //array to track position of lifts

let requests = {  //object to store lift requests
  head : 0,
  length : 0,
  itr: 0
};

const debug = () => console.log(idleLifts, liftPos);
const dataStore = () => {console.log({
  'Lifts':lifts, 
  'Floors':floors, 
  'Idle Lifts': idleLifts,
  'Position of Lifts' : liftPos.filter(e => e != -1), 
  'Requests' : requests
})}

const renderFn = (event) => {
  event && event.preventDefault();

  container.innerHTML = "";

  lifts = event &&event.target.elements[0].value || 4;
  floors = event && event.target.elements[1].value || 5;
  
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
                <button class='btn f${i}up ' role="button" onclick='btnFn(event)'>UP</button>
              </div>

              <div class='lift-block b${i}'>
                ${liftstr}
              </div>

            </div>

          `;
    }
    else if (i === floors) {

      htmlStr = `
      <div class='floor floor${i}'>

        <div class='lift-btn'>
          <button class='btn f${i}dwn ' role="button" onclick='btnFn(event)'>DOWN</button>
        </div>

        <div class='lift-block b${i}'>
        </div>

      </div>

    `;

    } else {
      htmlStr = `
            <div class='floor floor${i}'>

              <div class='lift-btn'>
                <button class='btn f${i}up ' role="button" onclick='btnFn(event)'>UP</button>
                <button class='btn f${i}dwn ' role="button" onclick='btnFn(event)'>DOWN</button>
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


const btnFn = async (event) => {
  const req = Number(event.target.classList[1][1]);
  if(liftPos.includes(req) ) {
    const lift = liftPos.indexOf(req)
    if(idleLifts.includes(lift)) await doorAnimationFunction(lift)
    else {
      const temp = setInterval( async() => {
        if(idleLifts.includes(lift)) {
          await doorAnimationFunction(lift).then(clearInterval(temp))
        }
      }, 1000)
    }
  }
  else{
    requests.itr += 1;
    requests.length += 1;
    const ref = `${requests.itr}`
    requests[ref] = Number(req);
    if(requests.head === 0) requests.head = requests.itr  
  }


}


const checkRequests = setInterval(async() => {
  if(requests.head  && requests.head <= requests.length) {
    let limit = requests.length

    for(let i = requests.head; i <= limit; i++) {
      limit = requests.length
      await checkIdleLift(requests[i]).then(() => {
        requests.head += 1;
        delete requests[requests.head - 1]
      })
    }
  }
}, 1000)

const checkIdleLift = async(requestedFloor) => {
  let flag = false;
  const handler = setInterval(() => {
    // console.log(`checking if any lifts are idle for ${requestedFloor}`)
    if(idleLifts.length > 0) {
      // console.log('lifts are idle now')
      flag = true;
    } 
  },100)

  await new Promise(async(resolve) => {
    const checkFlag = async() => {
      if(flag)  {
        // console.log('executing find lift function')
        clearInterval(handler)
        return await findNearestIdleLift(requestedFloor).then(() => resolve())
      }
      else {
        setTimeout(checkFlag, 100)
      }
    }
    await checkFlag().then(() => resolve())
  })
}

const findNearestIdleLift = async(requestedFloor) => {
  // console.log('finding lift')
  let diff = floors + 10
  let resLift = 0;
  for(let i = 0; i < idleLifts.length; i++ ) {
    const lift = idleLifts[i]
    const diff2 = Math.abs(liftPos[lift] - requestedFloor)
    if(diff2 < diff) {
      diff = diff2
      resLift = lift
    } 
  }

  if(!resLift)  await checkIdleLift(requestedFloor)

  else {
    await new Promise(async(resolve) => {
      idleLifts = idleLifts.filter(e => e !== resLift)
  
      if(liftPos[resLift] === requestedFloor) {
        await doorAnimationFunction(resLift)
        resolve()
      }
    
      else {
        await moveAndOpenDoorLift(resLift, requestedFloor).then(() => {
          idleLifts.push(resLift)
        })
        resolve()
      }
    })
  }

}

const moveAndOpenDoorLift = async(resLift, requestedFloor) => {
  await  moveLift(resLift, requestedFloor)
  await doorAnimationFunction(resLift)
}

const moveLift = async (liftNumber, requestedFloor) => {
  const liftPosInitial = liftPos[liftNumber]
  liftPos[liftNumber] = parseInt(requestedFloor);
  // console.log({liftNumber, requestedFloor})
  const el = document.querySelector(`.lift-${liftNumber}`);
  const liftSpeedModifier = Math.abs(liftPos[liftNumber] - liftPosInitial) * 2
  // console.log({liftPosInitial, "a": liftPos[liftNumber], requestedFloor}, liftSpeedModifier)

  await new Promise((resolve) => {
    idleLifts = idleLifts.filter((e) => e !== liftNumber);

    const movePx = (requestedFloor - 1) * 150;
    el.style.transition = `all linear ${liftSpeedModifier}s`
    el.style.transform = `translateY(-${movePx}px)`;
    

    setTimeout(() => {
      resolve();
    }, liftSpeedModifier*1000);
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
    }, 5500);
  });
}
