#!/usr/bin/env node

/**
 * dev-space-audit CLI entry point
 * Uses @inquirer/prompts for menu (arrow keys + visual selection).
 */

const { select, checkbox, confirm: confirmPrompt, Separator } = require('@inquirer/prompts');
const scanner = require('./scanner');
const formatter = require('./formatter');
const remover = require('./remover');
const { getAllPaths } = require('./paths');
const { formatBytes } = require('./utils');

/**
 * Main menu: Scan / Quit (arrow keys + Enter)
 */
async function showMainMenu() {
  return select({
    message: 'Dev Space Audit',
    choices: [
      { value: 'scan', name: 'Scan – Show disk usage' },
      { value: 'quit', name: 'Quit' }
    ]
  });
}

/**
 * After showing scan results: Delete caches or back to main menu
 */
async function showAfterScanMenu() {
  return select({
    message: 'What next?',
    choices: [
      { value: 'delete', name: 'Delete caches (choose targets)' },
      { value: 'back', name: 'Back to main menu' }
    ]
  });
}

/**
 * Run scan once, show results, then offer: delete or back to menu
 */
async function runScanFlow() {
  const pathConfigs = getAllPaths();
  const results = await scanner.scanAllPaths();

  const groupedResults = scanner.groupResultsByCategory(results);
  const categoryTotals = scanner.calculateCategoryTotals(groupedResults);
  const grandTotal = scanner.calculateTotal(results);
  const topDirectories = scanner.getTopDirectories(results, 5);
  const output = formatter.formatResults(
    groupedResults,
    categoryTotals,
    grandTotal,
    topDirectories
  );
  console.log(output);

  const deletable = pathConfigs
    .map((c) => ({ config: c, result: results.find((r) => r.path === c.path) }))
    .filter(({ result }) => result && result.exists && result.size > 0)
    .sort((a, b) => (b.result.size - a.result.size));

  const next = await showAfterScanMenu();
  if (next === 'back') return;

  if (deletable.length === 0) {
    console.log('No cache or paths to delete.');
    return;
  }

  const cancelChoice = { value: { __cancel: true }, name: 'Cancel (back to menu)' };
  const choices = [
    cancelChoice,
    new Separator(),
    ...deletable.map((d) => ({
      value: d,
      name: `${d.config.name}  ${formatBytes(d.result.size).padStart(10)}`
    }))
  ];

  const selected = await checkbox({
    message: 'Select targets to delete (Space to toggle, Enter to confirm)',
    choices,
    loop: false
  });

  const cancelled = selected.some((x) => x && x.__cancel);
  if (cancelled || selected.length === 0) {
    console.log('Cancelled.');
    return;
  }

  const selectedEntries = selected.filter((x) => x && !x.__cancel);
  const selectedConfigs = selectedEntries.map((d) => d.config);
  const selectedSize = selectedEntries.reduce((sum, d) => sum + d.result.size, 0);

  const confirmed = await confirmPrompt({
    message: `Delete ${selectedConfigs.length} path(s) (${formatBytes(selectedSize)})?`,
    default: false
  });

  if (!confirmed) {
    console.log('Cancelled.');
    return;
  }

  const { deleted, errors } = await remover.deletePathConfigs(selectedConfigs, { dryRun: false });
  if (deleted.length) {
    console.log('\nDeleted:', deleted.length, 'path(s).');
  }
  if (errors.length) {
    console.error('\nError(s) while deleting:');
    errors.forEach((e) => console.error('  ', e.path, ':', e.message));
  }
}

/**
 * Main loop: show menu → run action → show menu again (until Quit)
 */
async function main() {
  const isTTY = process.stdin.isTTY;

  if (!isTTY) {
    console.error('Interactive menu requires a TTY. Run without piping stdin.');
    console.error('Example: dev-space-audit');
    process.exit(1);
  }

  try {
    while (true) {
      const choice = await showMainMenu();

      if (choice === 'quit') {
        console.log('Bye.');
        break;
      }
      if (choice === 'scan') {
        await runScanFlow();
        continue;
      }
    }
  } catch (err) {
    if (err && (err.name === 'ExitPromptError' || err.name === 'AbortError')) {
      console.log('\nBye.');
      process.exit(0);
    }
    console.error('Error:', err.message);
    if (process.env.DEBUG) {
      console.error(err.stack);
    }
    process.exit(1);
  }
}


if (require.main === module) {
  main();
}

module.exports = { main };
