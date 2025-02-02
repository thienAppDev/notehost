export const BODY_JS_STRING = `
/* eslint-disable no-unused-vars */
/* eslint-disable prefer-rest-params */
/* eslint-disable no-lonely-if */
/* eslint-disable no-restricted-globals */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-undef */
localStorage.__console = true

const el = document.createElement('div')
let redirected = false

function getPage() {
  return location.pathname.slice(-32)
}

function getSlug() {
  return location.pathname.slice(1)
}

function updateSlug() {
  const slug = PAGE_TO_SLUG[getPage()]

  if (slug != null) {
    history.replaceState(history.state, '', ['/', slug].join(''))
  }
}

const observer = new MutationObserver(() => {
  if (redirected) return

  const nav = document.querySelector('.notion-topbar')
  const mobileNav = document.querySelector('.notion-topbar-mobile')

  if ((nav && nav.firstChild && nav.firstChild.firstChild) || (mobileNav && mobileNav.firstChild)) {
    // console.log('redirected', getSlug())
    updateSlug()
    redirected = true

    const { onpopstate } = window

    window.onpopstate = function () {
      // console.log('onpopstate');
      if (slugs.includes(getSlug())) {
        const page = SLUG_TO_PAGE[getSlug()]

        if (page) {
          // console.log('slug:', getSlug())
          // console.log('redirecting to:', page)
          history.replaceState(history.state, 'bypass', ['/', page].join(''))
        }
      }

      onpopstate.apply(this, [].slice.call(arguments))
      updateSlug()
    }
  }
})

observer.observe(document.querySelector('#notion-app'), {
  childList: true,
  subtree: true,
})

const { replaceState, back, forward } = window.history

window.history.back = function () {
  back.apply(window.history, arguments)
}

window.history.forward = function () {
  forward.apply(window.history, arguments)
}

window.history.replaceState = function () {
  if (arguments[1] === 'bypass') {
    return
  }

  const slug = getSlug()
  const isKnownSlug = slugs.includes(slug)

  console.log('replaceState:', { slug, isKnownSlug, arguments })

  // console.log('replaceState arguments:', arguments)
  // console.log('replaceState state:', state)

  if (arguments[2] === '/login') {
    const page = SLUG_TO_PAGE[slug]

    if (page) {
      // console.log('slug:', slug)
      // console.log('redirecting to:', page)
      arguments[2] = ['/', page].join('')
      replaceState.apply(window.history, arguments)
      window.location.reload()

      return
    }
  } else {
    if (isKnownSlug && arguments[2] !== ['/', slug].join('')) {
      return
    }
  }

  replaceState.apply(window.history, arguments)
}

const { pushState } = window.history

window.history.pushState = function () {
  const dest = new URL(location.protocol + location.host + arguments[2])
  const id = dest.pathname.slice(-32)

  // console.log('pushState state:', state)
  // console.log('pushState id:', id)
  if (pages.includes(id)) {
    arguments[2] = ['/', PAGE_TO_SLUG[id]].join('')
  }

  return pushState.apply(window.history, arguments)
}

const { open } = window.XMLHttpRequest.prototype

window.XMLHttpRequest.prototype.open = function () {
  arguments[1] = arguments[1].replace(domain, notionDomain)

  if (arguments[1].indexOf('msgstore.' + notionDomain) > -1) {
    return
  }

  // console.log('XMLHttpRequest.open arguments:', arguments)
  open.apply(this, [].slice.call(arguments))
}
`
