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
  const ncp = require('ncp').ncp;
  ncp.limit = 16;

  fs.mkdirSync('./pdftron-webpart-sample/_catalogs/masterpage/pdftron/lib', { recursive: true });
  fs.mkdirSync('./pdftron-webpart-sample/Shared Documents');

  ncp('./pdftron-webpart-sample/node_modules/@pdftron/webviewer/public/', './pdftron-webpart-sample/_catalogs/masterpage/pdftron/lib/', e => {
    if (!!e) {
      rej('Failed to create PDFTron WebViewer path directories', e)
    }

    ncp('./web-part-src/', './pdftron-webpart-sample/src/webparts/pdfTronSample', e => {
      if (!!e) {
        rej('Failed to migrate sample web part source code', e);
      }

      ncp('./sample-documents/', './pdftron-webpart-sample/Shared Documents', e => !!e ? rej('Failed to migrate sample documents') : res());
    });

  });
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

