import { Page } from 'playwright-core';
// tslint:disable: no-console

export async function waitForTestIdWithText(window: Page, dataTestId: string, text?: string) {
  let builtSelector = `css=[data-testid=${dataTestId}]`;
  if (text) {
    builtSelector += `:has-text("${text}")`;
  }

  console.info('looking for selector', builtSelector);
  const found = await window.waitForSelector(builtSelector, { timeout: 55000 });
  console.info('found selector', builtSelector);

  return found;
}

export async function waitForReadableMessageWithText(window: Page, text: string) {
  return waitForTestIdWithText(window, 'readable-message', text);
}

export async function waitForMatchingText(window: Page, text: string) {
  const builtSelector = `css=:has-text("${text}")`;
  console.info(`waitForMatchingText: ${text}`);

  await window.waitForSelector(builtSelector, { timeout: 55000 });

  console.info(`got matchingText: ${text}`);
}

export async function clickOnMatchingText(window: Page, text: string, rightButton = false) {
  return window.click(`"${text}"`, rightButton ? { button: 'right' } : undefined);
}

export async function clickOnTestIdWithText(window: Page, dataTestId: string, text?: string) {
  if (text) {
    return window.click(`css=[data-testid=${dataTestId}]:has-text("${text}")`);
  }

  const builtSelector = `css=[data-testid=${dataTestId}]`;
  await window.waitForSelector(builtSelector);
  return window.click(builtSelector);
}

export function getMessageTextContentNow() {
  return `Test message timestamp: ${Date.now()}`;
}

export async function typeIntoInput(window: Page, dataTestId: string, text: string) {
  const builtSelector = `css=[data-testid=${dataTestId}]`;
  return window.fill(builtSelector, text);
}
