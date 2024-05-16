import type { Page } from '@playwright/test'

import { expect, test } from '@playwright/test'
import path from 'path'
import { fileURLToPath } from 'url'

import {
  ensureAutoLoginAndCompilationIsDone,
  initPageConsoleErrorCatch,
  saveDocAndAssert,
} from '../../../helpers.js'
import { AdminUrlUtil } from '../../../helpers/adminUrlUtil.js'
import { initPayloadE2ENoConfig } from '../../../helpers/initPayloadE2ENoConfig.js'
import { reInitializeDB } from '../../../helpers/reInitializeDB.js'
import { RESTClient } from '../../../helpers/rest.js'
import { TEST_TIMEOUT_LONG } from '../../../playwright.config.js'

const filename = fileURLToPath(import.meta.url)
const currentFolder = path.dirname(filename)
const dirname = path.resolve(currentFolder, '../../')

const { beforeAll, beforeEach, describe } = test

let client: RESTClient
let page: Page
let serverURL: string
// If we want to make this run in parallel: test.describe.configure({ mode: 'parallel' })

describe('Block fields', () => {
  beforeAll(async ({ browser }, testInfo) => {
    testInfo.setTimeout(TEST_TIMEOUT_LONG)

    process.env.SEED_IN_CONFIG_ONINIT = 'false' // Makes it so the payload config onInit seed is not run. Otherwise, the seed would be run unnecessarily twice for the initial test run - once for beforeEach and once for onInit
    ;({ serverURL } = await initPayloadE2ENoConfig({
      dirname,
    }))

    const context = await browser.newContext()
    page = await context.newPage()
    initPageConsoleErrorCatch(page)
    await reInitializeDB({
      serverURL,
      snapshotKey: 'blockFieldsTest',
      uploadsDir: path.resolve(dirname, './collections/Upload/uploads'),
    })
    await ensureAutoLoginAndCompilationIsDone({ page, serverURL })
  })
  beforeEach(async () => {
    await reInitializeDB({
      serverURL,
      snapshotKey: 'blockFieldsTest',
      uploadsDir: path.resolve(dirname, './collections/Upload/uploads'),
    })

    if (client) {
      await client.logout()
    }
    client = new RESTClient(null, { defaultSlug: 'users', serverURL })
    await client.login()

    await ensureAutoLoginAndCompilationIsDone({ page, serverURL })
  })

  let url: AdminUrlUtil
  beforeAll(() => {
    url = new AdminUrlUtil(serverURL, 'block-fields')
  })

  test('should open blocks drawer and select first block', async () => {
    await page.goto(url.create)
    const addButton = page.locator('#field-blocks > .blocks-field__drawer-toggler')
    await expect(addButton).toContainText('Add Block')
    await addButton.click()

    const blocksDrawer = page.locator('[id^=drawer_1_blocks-drawer-]')
    await expect(blocksDrawer).toBeVisible()

    // select the first block in the drawer
    const firstBlockSelector = blocksDrawer
      .locator('.blocks-drawer__blocks .blocks-drawer__block')
      .first()
    await expect(firstBlockSelector).toContainText('Content')
    await firstBlockSelector.click()

    // ensure the block was appended to the rows
    const addedRow = page.locator('#field-blocks .blocks-field__row').last()
    await expect(addedRow).toBeVisible()
    await expect(addedRow.locator('.blocks-field__block-pill-content')).toContainText('Content')
  })

  test('should open blocks drawer from block row and add below', async () => {
    await page.goto(url.create)
    const firstRow = page.locator('#field-blocks #blocks-row-0')
    const rowActions = firstRow.locator('.collapsible__actions')
    await expect(rowActions).toBeVisible()

    await rowActions.locator('.array-actions__button').click()
    const addBelowButton = rowActions.locator('.array-actions__action.array-actions__add')
    await expect(addBelowButton).toBeVisible()
    await addBelowButton.click()

    const blocksDrawer = page.locator('[id^=drawer_1_blocks-drawer-]')
    await expect(blocksDrawer).toBeVisible()

    // select the first block in the drawer
    const firstBlockSelector = blocksDrawer
      .locator('.blocks-drawer__blocks .blocks-drawer__block')
      .first()
    await expect(firstBlockSelector).toContainText('Content')
    await firstBlockSelector.click()

    // ensure the block was inserted beneath the first in the rows
    const addedRow = page.locator('#field-blocks #blocks-row-1')
    await expect(addedRow).toBeVisible()
    await expect(addedRow.locator('.blocks-field__block-pill-content')).toContainText('Content') // went from `Number` to `Content`
  })

  test('should use i18n block labels', async () => {
    await page.goto(url.create)
    await expect(page.locator('#field-i18nBlocks .blocks-field__header')).toContainText('Block en')

    const addButton = page.locator('#field-i18nBlocks > .blocks-field__drawer-toggler')
    await expect(addButton).toContainText('Add Block en')
    await addButton.click()

    const blocksDrawer = page.locator('[id^=drawer_1_blocks-drawer-]')
    await expect(blocksDrawer).toBeVisible()

    // select the first block in the drawer
    const firstBlockSelector = blocksDrawer
      .locator('.blocks-drawer__blocks .blocks-drawer__block')
      .first()
    await expect(firstBlockSelector).toContainText('Text en')
    await firstBlockSelector.click()

    // ensure the block was appended to the rows
    const firstRow = page.locator('#field-i18nBlocks .blocks-field__row').first()
    await expect(firstRow).toBeVisible()
    await expect(firstRow.locator('.blocks-field__block-pill-text')).toContainText('Text en')
  })

  test('should add different blocks with similar field configs', async () => {
    await page.goto(url.create)

    async function addBlock(name: 'Block A' | 'Block B') {
      await page
        .locator('#field-blocksWithSimilarConfigs')
        .getByRole('button', { name: 'Add Blocks With Similar Config' })
        .click()
      await page.getByRole('button', { name }).click()
    }

    await addBlock('Block A')

    await page
      .locator('#blocksWithSimilarConfigs-row-0')
      .getByRole('button', { name: 'Add Item' })
      .click()
    await page
      .locator('input[name="blocksWithSimilarConfigs.0.items.0.title"]')
      .fill('items>0>title')

    await expect(
      page.locator('input[name="blocksWithSimilarConfigs.0.items.0.title"]'),
    ).toHaveValue('items>0>title')

    await addBlock('Block B')

    await page
      .locator('#blocksWithSimilarConfigs-row-1')
      .getByRole('button', { name: 'Add Item' })
      .click()
    await page
      .locator('input[name="blocksWithSimilarConfigs.1.items.0.title2"]')
      .fill('items>1>title')

    await expect(
      page.locator('input[name="blocksWithSimilarConfigs.1.items.0.title2"]'),
    ).toHaveValue('items>1>title')
  })

  test('should bypass min rows validation when no rows present and field is not required', async () => {
    await page.goto(url.create)
    await saveDocAndAssert(page)
    await expect(page.locator('.Toastify')).toContainText('successfully')
  })

  test('should fail min rows validation when rows are present', async () => {
    await page.goto(url.create)

    await page
      .locator('#field-blocksWithMinRows')
      .getByRole('button', { name: 'Add Blocks With Min Row' })
      .click()

    const blocksDrawer = page.locator('[id^=drawer_1_blocks-drawer-]')
    await expect(blocksDrawer).toBeVisible()

    const firstBlockSelector = blocksDrawer
      .locator('.blocks-drawer__blocks .blocks-drawer__block')
      .first()

    await firstBlockSelector.click()

    const firstRow = page.locator('input[name="blocksWithMinRows.0.blockTitle"]')
    await expect(firstRow).toBeVisible()
    await firstRow.fill('first row')
    await expect(firstRow).toHaveValue('first row')

    await page.click('#action-save', { delay: 100 })
    await expect(page.locator('.Toastify')).toContainText(
      'The following field is invalid: blocksWithMinRows',
    )
  })

  describe('row manipulation', () => {
    describe('react hooks', () => {
      test('should add 2 new block rows', async () => {
        await page.goto(url.create)

        await page
          .locator('.custom-blocks-field-management')
          .getByRole('button', { name: 'Add Block 1' })
          .click()

        const customBlocks = page.locator(
          '#field-customBlocks input[name="customBlocks.0.block1Title"]',
        )

        await page.mouse.wheel(0, 1750)

        await customBlocks.scrollIntoViewIfNeeded()

        await expect(customBlocks).toHaveValue('Block 1: Prefilled Title')

        await page
          .locator('.custom-blocks-field-management')
          .getByRole('button', { name: 'Add Block 2' })
          .click()
        await expect(
          page.locator('#field-customBlocks input[name="customBlocks.1.block2Title"]'),
        ).toHaveValue('Block 2: Prefilled Title')

        await page
          .locator('.custom-blocks-field-management')
          .getByRole('button', { name: 'Replace Block 2' })
          .click()
        await expect(
          page.locator('#field-customBlocks input[name="customBlocks.1.block1Title"]'),
        ).toHaveValue('REPLACED BLOCK')
      })
    })
  })
})
