import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
  await page.getByLabel('Как тебя зовут?').fill('Миша')
  await page.getByRole('button', { name: 'Войти в лес' }).click()
})

test('главная показывает три готовые карточки и инструкции', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Лягушка на болоте' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Белочка и кладовая' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Бобёр строит мост' })).toBeVisible()
  await page.locator('.frog-card').getByRole('button', { name: 'Как играть' }).click()
  await expect(page.getByRole('dialog')).toContainText('Найди насекомое')
})

test('лягушка открывает интерактивное задание', async ({ page }) => {
  await page.locator('.frog-card').getByRole('button', { name: /Играть/ }).click()
  await expect(page.getByLabel('Летающие варианты букв')).toBeVisible()
  await expect(page.locator('.letter-fly')).toHaveCount(7)
  const stage = await page.locator('.frog-stage').boundingBox()
  expect(stage).not.toBeNull()
  const directions = new Set<string>()
  for (const x of [.02, .1, .19, .28, .37, .46, .54, .63, .72, .81, .9, .98]) {
    await page.mouse.move(stage!.x + stage!.width * x, stage!.y + stage!.height * .52)
    await page.waitForTimeout(55)
    const frog = page.locator('.frog-sprite > img')
    directions.add((await frog.getAttribute('src')) + '|' + (await frog.evaluate(element => getComputedStyle(element).transform)))
  }
  expect(directions.size).toBe(12)

  const viewport = page.viewportSize()
  expect(viewport).not.toBeNull()
  const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth)
  expect(documentWidth).toBeLessThanOrEqual(viewport!.width + 1)
  const flyArea = await page.locator('.flies').boundingBox()
  const flyBoxes = await page.locator('.fly-flight').evaluateAll(elements => elements.map(element => {
    const box = element.getBoundingClientRect()
    return { x: box.x, y: box.y, width: box.width, height: box.height }
  }))
  expect(flyArea).not.toBeNull()
  expect(flyArea!.width).toBeGreaterThan(0)
  expect(flyArea!.height).toBeGreaterThan(0)
  for (const box of flyBoxes) {
    expect(box.width).toBeLessThanOrEqual(viewport!.width <= 650 ? 77 : 132)
    expect(box.x).toBeGreaterThanOrEqual(flyArea!.x - 1)
    expect(box.x + box.width).toBeLessThanOrEqual(flyArea!.x + flyArea!.width + 1)
    expect(box.y).toBeGreaterThanOrEqual(flyArea!.y - 1)
    expect(box.y + box.height).toBeLessThanOrEqual(flyArea!.y + flyArea!.height + 1)
  }
  const beforeMove = await page.locator('.fly-flight').first().boundingBox()
  await page.waitForTimeout(700)
  const afterMove = await page.locator('.fly-flight').first().boundingBox()
  expect(beforeMove).not.toBeNull()
  expect(afterMove).not.toBeNull()
  expect(Math.hypot(afterMove!.x - beforeMove!.x, afterMove!.y - beforeMove!.y)).toBeGreaterThan(1)

  for (const size of [{ width: 900, height: 650 }, { width: 390, height: 844 }, { width: 1280, height: 720 }]) {
    await page.setViewportSize(size)
    await page.waitForTimeout(400)
    const resizedArea = await page.locator('.flies').boundingBox()
    const resizedBoxes = await page.locator('.fly-flight').evaluateAll(elements => elements.map(element => {
      const box = element.getBoundingClientRect()
      return { x: box.x, y: box.y, width: box.width, height: box.height }
    }))
    expect(resizedArea).not.toBeNull()
    for (const box of resizedBoxes) {
      expect(box.x).toBeGreaterThanOrEqual(resizedArea!.x - 1)
      expect(box.x + box.width).toBeLessThanOrEqual(resizedArea!.x + resizedArea!.width + 1)
      expect(box.y).toBeGreaterThanOrEqual(resizedArea!.y - 1)
      expect(box.y + box.height).toBeLessThanOrEqual(resizedArea!.y + resizedArea!.height + 1)
    }
    for (let first = 0; first < resizedBoxes.length; first += 1) {
      for (let second = first + 1; second < resizedBoxes.length; second += 1) {
        const firstBox = resizedBoxes[first]
        const secondBox = resizedBoxes[second]
        const distance = Math.hypot(
          secondBox.x + secondBox.width / 2 - (firstBox.x + firstBox.width / 2),
          secondBox.y + secondBox.height / 2 - (firstBox.y + firstBox.height / 2),
        )
        expect(distance).toBeGreaterThan(Math.min(firstBox.width, firstBox.height, secondBox.width, secondBox.height) * .2)
      }
    }
    const resizedBeforeMove = await page.locator('.fly-flight').first().boundingBox()
    await page.waitForTimeout(500)
    const resizedAfterMove = await page.locator('.fly-flight').first().boundingBox()
    expect(resizedBeforeMove).not.toBeNull()
    expect(resizedAfterMove).not.toBeNull()
    expect(Math.hypot(resizedAfterMove!.x - resizedBeforeMove!.x, resizedAfterMove!.y - resizedBeforeMove!.y)).toBeGreaterThan(1)
  }

  await page.locator('.letter-fly').first().dispatchEvent('click')
  await expect(page.locator('.captured-fly')).toBeVisible()
})

test('белочка открывает сундуки со слогами', async ({ page }) => {
  await page.locator('.squirrel-card').getByRole('button', { name: /Играть/ }).click()
  await expect(page.getByText('Прохлопай слово')).toBeVisible()
  await expect(page.locator('.treasure-chest')).toHaveCount(3)
})

test('бобёр открывает сборку круглого моста', async ({ page }) => {
  await page.locator('.beaver-card').getByRole('button', { name: /Играть/ }).click()
  await expect(page.getByText('Собери правильное предложение')).toBeVisible()
  expect(await page.locator('.round-log').count()).toBeGreaterThanOrEqual(2)
})
