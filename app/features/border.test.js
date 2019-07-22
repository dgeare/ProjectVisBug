import test from 'ava'

import { setupPptrTab, teardownPptrTab, changeMode, getActiveTool, pptrMetaKey }
from '../../tests/helpers'

const tool            = 'border'
const test_selector   = '[intro] b'


test.beforeEach(async t => {
  await setupPptrTab(t)

  await changeMode({
    tool,
    page: t.context.page,
  })
})

test('Can Be Activated', async t => {
  const { page } = t.context
  t.is(await getActiveTool(page), tool)
  t.pass()
})

// test('Can adjust X position', async t => {
//   const { page } = t.context

//   await page.click(test_selector)
//   await page.keyboard.press('ArrowRight')
//   let shadow = await getShadowValues(page)
//   t.true(shadow.x === "1px")
//   //test shift case
//   await page.keyboard.down('Shift')
//   await page.keyboard.press('ArrowRight')
//   shadow = await getShadowValues(page)
//   t.true(shadow.x === "11px")

//   t.pass()
// })

test.afterEach(teardownPptrTab)
