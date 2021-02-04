const TWOPI = Math.PI * 2

let scale, canvas, c, w, h, soundFx
let spheres

let sphere, startPos, endPos, startTime, endTime

const init = () => {
  scale = devicePixelRatio;
  canvas = document.createElement('canvas')
  w = innerWidth
  h = innerHeight
  canvas.width = w * scale
  canvas.height = h * scale
  canvas.style.width = `${w}px`
  canvas.style.height = `${h}px`
  c = canvas.getContext('2d')
  c.scale(scale, scale)
  c.shadowColor = 'rgba(0,0,0,0.5)'
  c.shadowOffsetX = -5
  c.shadowOffsetY = 5
  c.shadowBlur = 5
  document.body.appendChild(canvas)
  addEvent()
  soundFx = new Audio()
  soundFx.src = 'audio/hit.mp3'
  soundFx.autoplay = false
  spheres = []
  while(spheres.length < 10){
    const newSphere = new Sphere(Math.random() * w, Math.random() * h, 30, `hsl(${Math.random()*360},100%,50%)`)
    let valid = true
    for(const sphere of spheres){
      if(Math.sqrt((sphere.pos.x - newSphere.pos.x) ** 2 + (sphere.pos.y - newSphere.pos.y) ** 2) <= sphere.r + newSphere.r){
        valid = false
        break
      }
    }
    if(valid)
      spheres.push(newSphere)
  }
  resetSphereParams()
  update()
}

const update = () => {
  show()
  for(const sphere of spheres)
    sphere.update()
  spheresCollision()
  window.requestAnimationFrame(update)
}

const show = () => {
  c.clearRect(0, 0, w, h)
  for(const sphere of spheres)
    sphere.show()
}

const spheresCollision = () => {
  for(let i = 0; i < spheres.length - 1; i++)
    for(let j = i + 1; j < spheres.length; j++)
      if(d = spheres[i].collide(spheres[j])){
        let tmp = soundFx.cloneNode(true)
        tmp.volume = Math.min(Math.max(d, 0.1), 0.98)
        tmp.currentTime = 0
        tmp.play()
      }
}

const resetSphereParams = () => sphere = startPos = endPos = startTime = endTime = null

const getPos = e => {
  if('changedTouches' in e){
    return {x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY}
  } else {
    return {x: e.clientX, y: e.clientY}
  }
}

const getSphere = (pos) => {
  for(const sphere of spheres)
    if((sphere.pos.x - pos.x) ** 2 + (sphere.pos.y - pos.y) ** 2 < sphere.r ** 2)
      return sphere
  return null
}

const playSphere = (e) => {
  const pos = getPos(e)
  sphere = getSphere(pos)
  if(!sphere)
    return
  startPos = pos
  startTime = performance.now()
}

const dropSphere = (e) => {
  if(!sphere)
    return
  endPos = getPos(e)
  endTime = performance.now()
  const a = Math.atan2(startPos.y - endPos.y, startPos.x - endPos.x)
  const deltaTime = endTime - startTime
  const l = -Math.max(Math.sqrt((startPos.x - endPos.x) ** 2 + (startPos.y - endPos.y) ** 2) / deltaTime * 12, 7)
  sphere.acc = new Vec2(Math.cos(a) * l, Math.sin(a) * l)
  resetSphereParams()
}

const addEvent = () => {
  document.addEventListener("touchmove", e => e.preventDefault())
  canvas.addEventListener('mousedown', playSphere)
  canvas.addEventListener('mouseup', dropSphere)
  canvas.addEventListener('touchstart', playSphere)
  canvas.addEventListener('touchend', dropSphere)
}

init()
