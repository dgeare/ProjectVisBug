import test from 'ava'

import { getBorderRadii, getBorderWidths } from '../utilities/styles'
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

test('Can adjust Border Width', async t => {
  const { page } = t.context

  await page.click(test_selector)
  await page.keyboard.press('ArrowRight')
  let border = await page.$eval(test_selector, getBorderWidths)
  t.true(border.right === 1)

  await page.keyboard.down(await pptrMetaKey(page))
  await page.keyboard.press('ArrowUp')

  border = await page.$eval(test_selector, getBorderWidths)

  t.true(border.top === 1)
  t.true(border.right === 2)
  t.true(border.bottom === 1)
  t.true(border.left === 1)

  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('ArrowDown')
  border = await page.$eval(test_selector, getBorderWidths)

  //also tests for regression where negative values prevent decreases in positive values
  t.true(border.top === 0)
  t.true(border.right === 0)
  t.true(border.bottom === 0)
  t.true(border.left === 0)

  t.pass()
})

test('Can adjust Border Radius', async t => {
  const { page } = t.context

  await page.click(test_selector)
  await page.keyboard.down('Shift')
  await page.keyboard.press('ArrowRight')
  let borderRadii = await page.$eval(test_selector, getBorderRadii)
  t.true(borderRadii.topRight === 1)

  await page.keyboard.down(await pptrMetaKey(page))
  await page.keyboard.press('ArrowUp')

  borderRadii = await page.$eval(test_selector, getBorderRadii)

  t.true(borderRadii.topLeft === 1)
  t.true(borderRadii.topRight === 2)
  t.true(borderRadii.bottomRight === 1)
  t.true(borderRadii.bottomLeft === 1)

  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('ArrowDown')
  borderRadii = await page.$eval(test_selector, getBorderRadii)

  //also tests for regression where negative values prevent decreases in positive values
  t.true(borderRadii.topLeft === 0)
  t.true(borderRadii.topRight === 0)
  t.true(borderRadii.bottomRight === 0)
  t.true(borderRadii.bottomLeft === 0)

  t.pass()
})

test.afterEach(teardownPptrTab)
