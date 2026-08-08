import { expect, test } from '@playwright/test'
import { squirrelTasks } from '../src/games/squirrel/data/tasks'

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
  await expect(page.getByText(/Подсказка:/)).toHaveCount(0)
  await expect(page.getByText('Поймай муху с нужной буквой')).toHaveCount(0)
  await expect(page.locator('.game-bar')).toHaveCount(0)
  await expect(page.locator('.game-stats')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'На главную' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Как играть' })).toBeVisible()
  await expect(page.locator('.letter-fly')).toHaveCount(7)
  const progressBox = await page.locator('.frog-quest-progress').boundingBox()
  const wordBox = await page.locator('.word-lily').boundingBox()
  const wordTextBox = await page.locator('.word-lily strong').boundingBox()
  expect(progressBox).not.toBeNull()
  expect(wordBox).not.toBeNull()
  expect(wordTextBox).not.toBeNull()
  expect(progressBox!.y + progressBox!.height).toBeLessThanOrEqual(wordBox!.y + 1)
  const stage = await page.locator('.frog-stage').boundingBox()
  expect(stage).not.toBeNull()
  expect(Math.abs((wordBox!.x + wordBox!.width / 2) - (stage!.x + stage!.width / 2))).toBeLessThanOrEqual(1)
  expect(Math.abs((wordTextBox!.x + wordTextBox!.width / 2) - (wordBox!.x + wordBox!.width / 2))).toBeLessThanOrEqual(1)
  expect(wordBox!.width / wordBox!.height).toBeCloseTo(1400 / 438, 1)
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
  const documentHeight = await page.evaluate(() => document.documentElement.scrollHeight)
  expect(documentHeight).toBeLessThanOrEqual(viewport!.height + 1)
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
  const beforeMove = await page.locator('.fly-flight').evaluateAll(elements => elements.map(element => {
    const box = element.getBoundingClientRect()
    return { x: box.x, y: box.y }
  }))
  await page.waitForTimeout(700)
  const afterMove = await page.locator('.fly-flight').evaluateAll(elements => elements.map(element => {
    const box = element.getBoundingClientRect()
    return { x: box.x, y: box.y }
  }))
  const largestMovement = Math.max(...afterMove.map((position, index) => Math.hypot(position.x - beforeMove[index].x, position.y - beforeMove[index].y)))
  expect(largestMovement).toBeGreaterThan(1)

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
    const resizedBeforeMove = await page.locator('.fly-flight').evaluateAll(elements => elements.map(element => {
      const box = element.getBoundingClientRect()
      return { x: box.x, y: box.y }
    }))
    await page.waitForTimeout(500)
    const resizedAfterMove = await page.locator('.fly-flight').evaluateAll(elements => elements.map(element => {
      const box = element.getBoundingClientRect()
      return { x: box.x, y: box.y }
    }))
    const resizedLargestMovement = Math.max(...resizedAfterMove.map((position, index) => Math.hypot(position.x - resizedBeforeMove[index].x, position.y - resizedBeforeMove[index].y)))
    expect(resizedLargestMovement).toBeGreaterThan(1)
  }

  if (viewport!.width <= 650) {
    const targetIndex = await page.locator('.letter-fly').evaluateAll(elements => elements.reduce((rightmost, element, index) => element.getBoundingClientRect().x > elements[rightmost].getBoundingClientRect().x ? index : rightmost, 0))
    const target = page.locator('.letter-fly').nth(targetIndex)
    await target.dispatchEvent('pointerdown', { pointerType: 'touch' })
    await target.dispatchEvent('click')
    await expect(page.locator('.captured-fly')).toBeVisible()
    await page.waitForTimeout(800)
    await expect(page.locator('.frog-sprite > img')).toHaveAttribute('src', /frog-sprite-0/)
    await expect(page.locator('.frog-sprite > img')).not.toHaveClass(/mirrored/)
  } else {
    await page.locator('.letter-fly').first().dispatchEvent('click')
    await expect(page.locator('.captured-fly')).toBeVisible()
  }
})

test('белочка переносит жёлудь в правильный сундук', async ({ page }) => {
  await page.locator('.squirrel-card').getByRole('button', { name: /Играть/ }).click()
  const stage = page.locator('.squirrel-stage')
  await expect(stage).toBeVisible()
  await expect(page.locator('.oak-drop strong')).toBeVisible()
  await expect(page.locator('.treasure-chest')).toHaveCount(3)
  await expect(page.locator('.squirrel-progress li')).toHaveCount(10)
  const word = (await page.locator('.oak-drop strong').textContent())!.toLocaleLowerCase('ru-RU')
  const task = squirrelTasks.find(item => item.word === word)!
  const correctChest = page.locator(`.treasure-chest[data-category="${task.syllables}"]`)
  await correctChest.click()
  await expect(page.locator('.treasure-chest:disabled')).toHaveCount(3)
  await expect(page.locator('.squirrel-character img')).toHaveAttribute('src', /squirrel-(run|catch)-/)
  await page.waitForTimeout(320)
  await expect(page.locator('.treasure-chest.selected img')).toHaveAttribute('src', /-open/)
  await expect(page.locator('.flying-acorn')).toBeVisible()
  await page.waitForTimeout(520)
  await expect(page.locator('.squirrel-progress li.filled')).toHaveCount(1)
  await expect(page.getByRole('status')).toContainText('Верно')
  const box = await stage.boundingBox()
  expect(box).not.toBeNull()
  expect(box!.width / box!.height).toBeCloseTo(1672 / 941, 1)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true)
})

test('ошибка на пустом запасе завершает попытку белочки поражением', async ({ page }) => {
  await page.locator('.squirrel-card').getByRole('button', { name: /Играть/ }).click()
  const word = (await page.locator('.oak-drop strong').textContent())!.toLocaleLowerCase('ru-RU')
  const task = squirrelTasks.find(item => item.word === word)!
  const wrongCategory = task.syllables === 1 ? 2 : 1
  await page.locator(`.treasure-chest[data-category="${wrongCategory}"]`).click()
  await page.waitForTimeout(330)
  await expect(page.locator('.answer-mark.wrong')).toHaveText('×')
  await expect(page.locator('.squirrel-character img')).toHaveAttribute('src', /squirrel-wrong-v2/)
  await expect(page.locator('.oak-drop strong')).toContainText(word, { ignoreCase: true })
  await expect(page.getByRole('heading', { name: 'Попробуем ещё раз!' })).toBeVisible()
  await expect(page.getByText('Поражение: уровень уже 0')).toBeVisible()
})

test('бобёр открывает сборку круглого моста', async ({ page }) => {
  await page.locator('.beaver-card').getByRole('button', { name: /Играть/ }).click()
  await expect(page.getByRole('group', { name: 'Доступные брёвна' })).toBeVisible()
  expect(await page.locator('.word-log').count()).toBeGreaterThanOrEqual(2)
})
