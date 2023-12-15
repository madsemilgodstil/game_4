const svgElement = document.getElementById('spaceship')
const shadowElement = document.getElementById('shadow') // Add this line to get the shadow element

function moveSvg (event) {
  // Get the mouse coordinates
  const mouseX = event.clientX
  const mouseY = event.clientY

  // Calculate new position for the SVG (adjust values as needed)
  const newX = mouseX - svgElement.clientWidth / 3
  const newY = mouseY - svgElement.clientHeight / 2

  // Update the SVG position
  svgElement.style.left = `${newX}px`
  svgElement.style.top = `${newY}px`
}

// Add the mousemove event listener to trigger the moveSvg function
document.addEventListener('mousemove', moveSvg)
