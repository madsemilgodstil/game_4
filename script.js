// Variabler til at gemme musens koordinater og armens position
var mouseX, mouseY
var armX, armY

// Spilrelaterede variabler
var score = 0
var shooting = false
var stopped = false
var paused = false
var interval
var lives = 3
var countdownTime = 1 * 60

// Lydobjekter til spil lyde
var zap = new Audio('./audio/laser1.wav')
var scream = new Audio('./audio/flesh.wav')
var fart = new Audio('./audio/fart1.wav')
var ambient = new Audio('./audio/ambient.wav')
var tryagain = new Audio('./audio/tryagain.wav')
var activated = new Audio('./audio/wactivated.wav')
var danger = new Audio('./audio/danger.wav')

// Funktion til at arrangere positionen af monstre på skærmen
function arrangeMonsters () {
  monsters.forEach(monster => {
    var monsterDiv = document.getElementById(`monster-${monster.index}`)
    monsterDiv.style['top'] = `${monster.top}%`
    monsterDiv.style['left'] = `${monster.left}%`

    if (monster.top > 100 && monster.type === 'human') {
      monsterDiv.remove()
      monsters.splice(monsters.indexOf(monster), 1)
      danger.play()

      // Decrement lives when a human hits the bottom
      lives--

      // Update the life count in the game interface
      document.getElementById('life_count').innerText = lives

      // Check if lives are exhausted
      if (lives <= 0) {
        tryagain.play()
        stop()
      }
    }
  })
}

// Funktion til at initialisere spilelementer og starte lyd
function startElementer () {
  ambient.play()
  activated.play()
  return
}

// Funktion til at opdatere nedtællingsdisplayet
function updateCountdown () {
  var minutes = Math.floor(countdownTime / 60)
  var seconds = countdownTime % 60
  document.getElementById('countdown').innerHTML = `${minutes}:${
    seconds < 10 ? '0' : ''
  }${seconds}`
}

// Funktion til at stoppe spillet, når tiden er udløbet
function stopGameOnTimeUp () {
  stop()
  clearInterval(interval) // Stop de faldende monstre
}

// Interval funktion til at formindske nedtællingstiden
function decrementCountdown () {
  if (!paused) {
    countdownTime--
    if (countdownTime <= 0) {
      stopGameOnTimeUp()
    }
    updateCountdown()
  }
}

// Opsæt interval for at formindske nedtællingen hvert sekund
var countdownInterval = setInterval(decrementCountdown, 1000)

// Opdater nedtællingsdisplayet initialt
updateCountdown()

// Funktion til at generere et tilfældigt tal mellem fra og til
function random (from, to) {
  return Math.floor(Math.random() * (to - from + 1) + from)
}

// Funktion til at rotere armen baseret på musens position
function rotateArm () {
  var angleDeg = (Math.atan2(mouseY - armY, mouseX - armX) * 180) / Math.PI
  document.getElementById('arm').style['transform'] = `rotate(${angleDeg}deg)`
}

// Funktion til at tegne laserstrålen baseret på musens position
function drawBeam () {
  var angleDeg = (Math.atan2(mouseY - armY, mouseX - armX) * 180) / Math.PI
  var a = armX - mouseX
  var b = armY - mouseY
  var distance = Math.sqrt(a * a + b * b)

  // Sæt stråleegenskaber
  document.getElementById('beam').style['top'] = `${armY * 1.03}px`
  document.getElementById('beam').style['left'] = `${armX}px`
  document.getElementById('beam').style['transform'] = `rotate(${angleDeg}deg)`
  document.getElementById('beam').style['width'] = `${distance + 20}px`
}

// Funktion til at sætte musens koordinater og opdatere armerotation og stråle
function setCursorPosition (event) {
  mouseX = event.pageX
  mouseY = event.pageY
  rotateArm()
  !shooting && drawBeam()
}

// Funktion til at sætte den initiale position af den udenjordiske arm
function setAlienArmPosition () {
  var arm = document.getElementById('arm')
  var position = arm.getBoundingClientRect()
  armX = position.x + window.scrollX
  armY = position.y + window.scrollY
}

// Funktion til at stoppe spillet
function stop () {
  stopped = true
  document.getElementById('game').classList.add('stopped')
  window.addEventListener('click', reset)
  clearInterval(interval)
}

// Funktion til at genstarte spillet
function restartGame () {
  // Luk info_box
  var infoBox = document.getElementById('info_box')
  infoBox.style.display = 'none'

  // Nulstil antallet af monstre og mennesker
  monsters = []
  humans = 0

  // Ryd eventuelle eksisterende monstre
  var monstersContainer = document.getElementById('monsters')
  while (monstersContainer.firstChild) {
    monstersContainer.removeChild(monstersContainer.firstChild)
  }

  // Nulstil spilelementer
  updateCountdown()
  document.getElementById('score').innerText = score

  clearInterval(countdownInterval)
  countdownInterval = setInterval(decrementCountdown, 1000)

  clearInterval(interval)

  // Start de faldende monstre efter en forsinkelse
  setTimeout(() => {
    addMonster()
    interval = setInterval(fall, 100)
  }, 700)

  setAlienArmPosition()

  // Fjern klikhændelseslytteren tilføjet under stop-tilstand
  window.removeEventListener('click', reset)

  // Fjern klassen stopped fra spilelementet
  document.getElementById('game').classList.remove('stopped')

  // Nulstil lydeffekter
  zap.currentTime = 0
  scream.currentTime = 0
  fart.currentTime = 0
  tryagain.currentTime = 0
  activated.currentTime = 0
  location.reload()
  startElementer()
}

// Funktion til at nulstille spillet
function reset () {
  if (stopped === true) {
    document.getElementById('game').classList.remove('stopped')
    stopped = false
    location.reload() // Denne linje genindlæser siden
    return
  }
}

// // Funktion til at arrangere positionen af monstre på skærmen
// function arrangeMonsters () {
//   monsters.forEach(monster => {
//     var monsterDiv = document.getElementById(`monster-${monster.index}`)
//     monsterDiv.style['top'] = `${monster.top}%`
//     monsterDiv.style['left'] = `${monster.left}%`

//     if (monster.top > 100 && monster.type === 'human') {
//       monsterDiv.remove()
//       monsters.splice(monsters.indexOf(monster), 1)
//       tryagain.play()
//       stop()
//     }
//   })
// }

// Variabler til monstres timing og positionering
var monsters = []
var time = [1000, 4000]
var offset = [1, 100]
var index = 0

// Funktion til at tilføje et nyt monster
function addMonster () {
  if (paused) {
    setTimeout(addMonster, random(time[0], time[1]))
    return
  }

  const monster = {
    index: ++index,
    top: 0,
    left: random(10, 90),
    type: random(1, 3) === 3 ? 'alien' : 'human',
    offset: random(offset[1], offset[1]) / 100
  }

  var monsterDiv = document.createElement('div')
  monsterDiv.id = `monster-${monster.index}`

  monster.type === 'human' && monsterDiv.classList.add('human')

  document.getElementById('monsters').appendChild(monsterDiv)

  monsters.push(monster)

  arrangeMonsters()

  // Juster timing og offset for det næste monster
  if (time[0] > 100) {
    time[0] -= 25
    time[1] -= 10
    offset[0] += 2
    offset[1] += 5
  }

  // Planlæg tilføjelsen af det næste monster
  !stopped && setTimeout(addMonster, random(time[0], time[1]))
}

// Funktion til at få monstre til at falde ned ad skærmen
function fall () {
  if (paused || stopped) {
    return
  }

  monsters.forEach(monster => {
    monster.top += monster.offset
  })

  arrangeMonsters()
}

// Sæt interval for monsternes fald
interval = setInterval(fall, 100)

// Planlæg tilføjelsen af det første monster
setTimeout(() => {
  addMonster()
}, 700)

// Variabler til skudposition
var shotPositionX = 0
var shotPositionY = 0

// Funktion til at håndtere skydning
function shoot (event) {
  if (shooting || paused || stopped) {
    return
  }

  shotPositionX = event.pageX
  shotPositionY = event.pageY

  shooting = true && zap.play()

  document.getElementById('beam').classList.add('shot')

  // Tjek om nogen monstre bliver ramt af skuddet
  setTimeout(() => {
    const monstersInArea = monsters.filter(monster => {
      const monsterDiv = document.getElementById(`monster-${monster.index}`)
      const bounds = monsterDiv.getBoundingClientRect()
      var posX = bounds.x + window.scrollX + monsterDiv.offsetWidth / 2
      var posY = bounds.y + window.scrollY + monsterDiv.offsetHeight / 2
      const toleranceX = monsterDiv.offsetWidth / 2
      const toleranceY = monsterDiv.offsetHeight / 2

      return (
        Math.abs(posX - shotPositionX) < toleranceX &&
        Math.abs(posY - shotPositionY) < toleranceY
      )
    })

    // Håndter konsekvenserne af at ramme monstre
    monstersInArea.forEach(monster => {
      const monsterDiv = document.getElementById(`monster-${monster.index}`)
      monsterDiv.remove()
      monsters.splice(monsters.indexOf(monster), 1)

      if (monster.type === 'human') {
        score += 100
        scream.play()
        scream.offsetLeft
      } else {
        score -= 100
        fart.play()
        fart.offsetLeft
      }

      // Tjek om spillet skal stoppes på grund af negativ score
      if (score < 0) {
        tryagain.play()
        tryagain.offsetLeft
        stop()
      }
    })

    // Nulstil skydetilstanden og opdater scoren
    document.getElementById('beam').classList.remove('shot')
    shooting = false
    document.getElementById('score').innerText = score
  }, 500)
}

// Sæt den indledende position af den udenjordiske arm
setAlienArmPosition()

// Hændelseslyttere for musens bevægelse, skydning, pauseknap og vinduesændring
window.addEventListener('load', startElementer)

window.addEventListener('mousemove', setCursorPosition)

window.addEventListener('click', shoot)

document.getElementById('pause').addEventListener('click', function (event) {
  event.stopPropagation()
  event.preventDefault()
  paused = !paused
  document.getElementById('pause').innerText = paused ? 'Start' : 'Pause'

  // Pause or resume the ambient sound based on the game state
  if (paused) {
    ambient.pause()
  } else {
    ambient.play()
  }
})

window.addEventListener('resize', setAlienArmPosition)

document.getElementById('info').addEventListener('click', function (event) {
  event.stopPropagation()
  event.preventDefault()

  // Skift visningen af info_box
  var infoBox = document.getElementById('info_box')
  infoBox.style.display = infoBox.style.display === 'block' ? 'none' : 'block'

  document
    .getElementById('restart')
    .addEventListener('click', function (event) {
      restartGame()
    })

  // Pause spillet, når info_box vises
  paused = infoBox.style.display === 'block'

  // Pause or resume the ambient sound based on the game state
  if (paused) {
    ambient.pause()
  } else {
    ambient.play()
  }
})
