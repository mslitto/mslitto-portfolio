const D = document
const M = Math
const W = window

const $ = (str, par) => {
  par = par || D

  if (str.startsWith('.')) {
    return par.getElementsByClassName(str.substr(1, str.length))
  } else if (str.startsWith('#')) {
    return par.getElementById(str.substr(1, str.length))
  } else {
    return par.getElementsByTagName(str)
  }
}

// global app state
let dragged = false
let startPos = false
let currentZ = 1

// loop over each item and call fn(item)
const forEach = (items, fn) => {
  for (let i = 0; i < items.length; i++) {
    if (items.hasOwnProperty(i)) {
      fn(items[i])
    }
  }
}

const cl = {
  has(e, c) {
    return e.className && e.className.indexOf(c) > -1
  },
  add(e, c) {
    if (!cl.has(e, c)) {
      if (e.className) {
        c = e.className + ' ' + c
      }
      e.className = c
    }
  },
  rm(e, c) {
    if (cl.has(e, c)) {
      e.className = e.className.replace(c, '').trim()
    }
  },
  toggle(e, c) {
    if (cl.has(e, c)) {
      cl.rm(e, c)
    } else {
      cl.add(e, c)
    }
  },
}

const on = (ele, listener, cb) => {
  if (ele) {
    ele.addEventListener(listener, cb)
  }
}

const getPos = e => parseInt(e.replace('%', ''))

const percentFromPixels = (dir, px) => (px / W[`inner${dir}`]) * 100
const pixelsFromPercent = (dir, pc) => (pc * W[`inner${dir}`]) / 100

// resize and reposition after load of images
const onLoad = (par, tar) => {
  if (cl.has(tar, 'bg')) {
    let width = tar.getBoundingClientRect().width
    let height = tar.getBoundingClientRect().height
    let left = 0
    let top = 0

    // resize if too wide
    const maxWidth = W.innerWidth * .7
    if (width > maxWidth) {
      const widthPercent = (width / maxWidth) + .1
      width /= widthPercent
      height /= widthPercent
    }

    // resize if too high
    const maxHeight = W.innerHeight * .7
    if (height > maxHeight) {
      const heightPercent = (height / maxHeight) + .1
      height /= heightPercent
      width /= heightPercent
    }

    const maxLeft = W.innerWidth - width
    const maxTop = W.innerHeight - height
    left = M.random() * maxLeft
    top = M.random() * maxTop
    left = `${M.floor(percentFromPixels('Width', left))}%`
    top = `${M.floor(percentFromPixels('Height', top))}%`

    par.style.left = left
    par.style.top = top
  }
}

// global drag dom elements, children of #draggables
const drag = $('.drag', $('#draggables'))

forEach(drag, draggable => {
  const ran = M.random()
  const pos = {
    left: '100%',
    top: '100%',
  }

  if (ran > 0.7) {
    pos.left = `-${pos.left}`
  } else if (ran < 0.3) {
    pos.top = `-${pos.top}`
  }

  draggable.style.left = pos.left
  draggable.style.top = pos.top

  const img = $('.bg', draggable)[0]
  const imgSrc = $('img', img)[0]

  if (!imgSrc.complete) {
    on(imgSrc, 'load', () => {
      onLoad(draggable, imgSrc.parentNode)
    })
  } else {
    onLoad(draggable, imgSrc.parentNode)
  }
})

const touchHandler = (event) => {
  const touch = event.changedTouches[0]
  const simulatedEvent = D.createEvent("MouseEvent")

  const eventNames = {
    touchstart: "mousedown",
    touchmove: "mousemove",
    touchend: "mouseup",
  }

  const evt = eventNames[event.type]

  simulatedEvent.initMouseEvent(
    evt, true, true, W, 1,
    touch.screenX, touch.screenY,
    touch.clientX, touch.clientY,
    false, false, false, false, 0, null
  )

  touch.target.dispatchEvent(simulatedEvent)
  event.preventDefault()
  event.stopPropagation()
  return false
}

const doNothing = (e) => {
  e.preventDefault()
  return false
}

const isOutOfBounds = e => (
  e.clientX >= W.innerWidth ||
  e.clientX <= 0 ||
  e.clientY >= W.innerHeight ||
  e.clientY <= 0
)

const onDrag = evt => {
  dragged = evt.currentTarget.parentNode

  cl.add(dragged, 'dragged')

  startPos = {
    left: pixelsFromPercent('Width', getPos(dragged.style.left)),
    top: pixelsFromPercent('Height', getPos(dragged.style.top)),
  }

  currentZ += 1
  dragged.style.zIndex = currentZ
  dragged.offset = {
    left: evt.clientX - pixelsFromPercent('Width', getPos(dragged.style.left)),
    top: evt.clientY - pixelsFromPercent('Height', getPos(dragged.style.top)),
  }
  dragged.style.opacity = 0.8

  on(D, 'mousemove', onMousemove)
  on(D, 'mouseup', onDrop)
  on(D, 'mouseout', onDropIfOutOfBounds)
}

const onDrop = () => {
  if (!dragged) {
    return
  }

  forEach(drag, draggable => {
    cl.rm(draggable, 'dragged')

    if (draggable === dragged) {
      cl.add(dragged, 'dropped')
    } else {
      cl.rm(draggable, 'dropped')
    }
  })

  dragged.style.opacity = 1

  dragged = false
  startPos = false
}

const onDropIfOutOfBounds = e => {
  if (isOutOfBounds(e)) {
    onDrop(e)
  }
}

const onMousemove = evt => {
  if (dragged) {
    const max = {
      left: W.innerWidth - dragged.clientWidth,
      top: W.innerHeight - dragged.clientHeight,
    }

    const newLeft = M.floor(M.max(0, M.min(evt.clientX - dragged.offset.left, max.left)))

    dragged.style.left = `${percentFromPixels('Width', newLeft)}%`

    let newTop = evt.clientY - dragged.offset.top
    if (newTop < 0) {
      newTop = 0
    } else if (newTop > max.top) {
      newTop = max.top
    }
    dragged.style.top = `${percentFromPixels('Height', newTop)}%`
  }
}

// Initiate this app on window load
W.onload = () => {
  forEach(drag, draggable => {
    const img = $('.bg', draggable)[0]
    if (img) {
      on(img, 'dragstart', doNothing)
      on(img, 'mousedown', onDrag)

      on(img, "touchstart", touchHandler, true)
      on(img, "touchmove", touchHandler, true)
      on(img, "touchend", touchHandler, true)
      on(img, "touchcancel", touchHandler, true)

      const parentStyle = img.parentNode.style
      if (parentStyle && parentStyle.left === '100%' || parentStyle.left === '-100%') {
        img.dispatchEvent(new Event('load'))
      }
    }

    const a = $('a', draggable)[0]
    if (a) {
      on(a, 'touchend', e => {
        e.stopPropagation()
        return false
      })
    }
  })
}


// Menu Toggler
const menuContainer = $('.nav')[0]
if (menuContainer) {
  // find active menu
  const active = $('.active', menuContainer)[0]

  // add click event handler to toggle the menu
  on(active, 'click', e => {
    e.preventDefault()
    cl.toggle(menuContainer, 'show')
    return false
  })
}

// About page Toggler
const t = $('.about-page-trigger')[0]

// if #about is in the url, show the about page
if (W.location.hash === '#about') {
  cl.toggle(D.body, "about-visible")
}

on(t, "click", e => {
  e.preventDefault()
  if (W.location.hash === '#about') {
    W.location.hash = ''
  } else {
    W.location.hash = '#about'
  }
  cl.toggle(D.body, "about-visible")
  return false
})
