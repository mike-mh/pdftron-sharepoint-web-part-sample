const { spawn } = require("child_process");
const fs = require('fs');

const createProcessPromise = (command, args, failureMessage, eventCallbackModifier) => new Promise((res, rej) => {
  const newProcess = spawn(command, args);

  newProcess.stdout.pipe(process.stdout);
  newProcess.stderr.pipe(process.stderr);

  if (!!eventCallbackModifier) {
    eventCallbackModifier(newProcess);
  }

  newProcess.on('exit', code => {
    if (!!code) {
      rej(failureMessage);
    }
    res();
  });
});

const runNpmInstall = () => createProcessPromise('npm', ['i'], 'Failed to install npm packages');

const runYeomanSharePointGenerator = () => createProcessPromise('yo', [
  '@microsoft/sharepoint',
  '--skip-cache',
  '--solution-name',
  'pdftron-webpart-sample',
  '--component-type',
  'webpart',
  '--framework',
  'none',
  '--environment',
  'spo',
  '--component-name',
  'PDFTronSample',
  '--component-description',
  '"PDFTron WebViewer sample web part"',
],
  'Failed to run @microsoft/sharepoint generator',
  p => {
    p.stdout.on('data', function (data) {
      if (data.toString().includes('?')) {
        p.stdin.write("N\n")
      }
    });

    p.stderr.on('data', function (data) {
      if (data.toString().includes('?')) {
        p.stdin.write("N\n")
      }
    });
  });

const installPdfTronWebViewer = () => createProcessPromise('npm', [
  '--prefix',
  'pdftron-webpart-sample',
  'i',
  '@pdftron/webviewer',
  '--save',
],
  'Failed to install PDFTron WebViewer');

const trustDevCert = async () => {
  process.chdir('./pdftron-webpart-sample');
  await createProcessPromise('gulp', ['trust-dev-cert'], 'Failed to trust dev certificate');
  process.chdir('..');
  return Promise.resolve();
};

const migratePdfTronWebPart = () => new Promise((res, rej) => {

  // Create directories to match routes for what guides will show
  fs.mkdirSync('./pdftron-webpart-sample/_catalogs/masterpage/pdftron/lib', { recursive: true });
  fs.mkdirSync('./pdftron-webpart-sample/Shared Documents');

  const ncp = require('ncp').ncp;
  ncp.limit = 16;

  const migrateFiles = (src, dest, callback) => ncp(src, dest, callback);

  const migrateSampleDocs = () => migrateFiles(
    './sample-documents/',
    './pdftron-webpart-sample/Shared Documents',
    e => !!e ? rej('Failed to migrate sample documents') : res());

  const migratePdfTronWebPartSourceCode = () => migrateFiles(
    './web-part-src/',
    './pdftron-webpart-sample/src/webparts/pdfTronSample',
    e => !!e ? rej('Failed to migrate PDFTron web part source code') : migrateSampleDocs());

  const migratePdfTronWebViewerSource = () => migrateFiles(
    './pdftron-webpart-sample/node_modules/@pdftron/webviewer/public/',
    './pdftron-webpart-sample/_catalogs/masterpage/pdftron/lib/',
    e => !!e ? rej('Failed to migrate PDFTron WebViewer source code from node_modules') : migratePdfTronWebPartSourceCode());

  migratePdfTronWebViewerSource();
});

const launchWebPart = () => {
  process.chdir('./pdftron-webpart-sample');
  return createProcessPromise('gulp', ['serve'], 'Failed to start SharePoint server');
};

async function main() {
  try {
    await runNpmInstall();
    await runYeomanSharePointGenerator();
    await trustDevCert();
    await installPdfTronWebViewer();
    await migratePdfTronWebPart();
    await launchWebPart();
  }
  catch (e) {
    console.log(e);
  }
}

main();
