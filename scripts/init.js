const { spawn } = require("child_process");
const fs = require('fs');


const runNpmInstall = () => new Promise((res, rej) => {

  const npmInstallProcess = spawn('npm', [
    'i',
  ]);

  npmInstallProcess.stdout.pipe(process.stdout);
  npmInstallProcess.stderr.pipe(process.stderr);

  npmInstallProcess.on('exit', code => {
    if (!!code) {
      rej('Failed to install npm packages');
    } 
    res();
  });

});

const runYeomanSharePointGenerator = () => new Promise((res, rej) => {
  const generatorProcess = spawn('yo', [
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
  ]);

  generatorProcess.stdout.pipe(process.stdout);
  generatorProcess.stderr.pipe(process.stderr);

  generatorProcess.stdout.on('data', function (data) {
    if (data.toString().includes('?')) {
      generatorProcess.stdin.write("N\n")
    }
  });

  generatorProcess.stderr.on('data', function (data) {
    if (data.toString().includes('?')) {
      generatorProcess.stdin.write("N\n")
    }
  });

  generatorProcess.on('exit', code => {
    if (!!code) {
      rej('Failed to run @microsoft/sharepoint generator');
    } 
    res();
  });
});

const installPdfTronWebViewer = () => new Promise((res, rej) => {
  installPdfTronProcess = spawn('npm', [
    '--prefix',
    'pdftron-webpart-sample',
    'i',
    '@pdftron/webviewer',
    '--save',
  ]);

  installPdfTronProcess.stdout.pipe(process.stdout);
  installPdfTronProcess.stderr.pipe(process.stderr);

  installPdfTronProcess.on('exit', code => {
    if (!!code) {
      rej('Failed to install PDFTron WebViewer');
    } 
    res();
  });
});

const migratePdfTronWebPart = () => new Promise((res, rej) => {
  const ncp = require('ncp').ncp;
  ncp.limit = 16;

  fs.mkdirSync('./pdftron-webpart-sample/_catalogs/masterpage/pdftron/lib', { recursive: true });
  ncp('./pdftron-webpart-sample/node_modules/@pdftron/webviewer/public/', './pdftron-webpart-sample/_catalogs/masterpage/pdftron/lib/', e => {
    if (!!e) {
      rej('Failed to create PDFTron WebViewer path directories', e)
    }

    ncp('./web-part-src/', './pdftron-webpart-sample/src/webparts/pdfTronSample', e => {
      if (!!e) {
        rej('Failed to migrate sample web part source code', e);
      }

      ncp('./sample-documents/', './pdftron-webpart-sample/', e => !!e ? rej('Failed to migrate sample documents') : res());
    });
    
  });
});

async function main() {
  try {
    await runNpmInstall();
    await runYeomanSharePointGenerator();
    await installPdfTronWebViewer();
    await migratePdfTronWebPart();
  }
  catch (e) {
    console.log(e);
  }
}

main();

/*
installSharePointGenerator.stdout.pipe(process.stdout);
installSharePointGenerator.stderr.pipe(process.stderr);

installSharePointGenerator.stdout.on('data', function (data) {
  if (data.toString().includes('?')) {
    installSharePointGenerator.stdin.write("N\n")
  }
});

installSharePointGenerator.stderr.on('data', function (data) {
  if (data.toString().includes('?')) {
    installSharePointGenerator.stdin.write("N\n")
  }
});

installSharePointGenerator.on('exit', code => {
  console.log('child process exited with code ' + code.toString());

  const installPdfTronProcess = createPdfTronInstallProcess();
  installPdfTronProcess.stdout.pipe(process.stdout);
  installPdfTronProcess.stderr.pipe(process.stderr);

  installPdfTronProcess.on('exit', _ => {
    fs.mkdirSync('./pdftron-webpart-sample/_catalogs/masterpage/pdftron/lib', { recursive: true });
    ncp('./pdftron-webpart-sample/node_modules/@pdftron/webviewer/public/', './pdftron-webpart-sample/_catalogs/masterpage/pdftron/lib/', e => {
      if (!!e) {
        console.log(e);
      }
      ncp('./web-part-src/', './pdftron-webpart-sample/src/webparts/pdfTronSample', e => console.log(e));
      ncp('./sample-documents/', './pdftron-webpart-sample/', e => console.log(e));
    });
  });
});
*/
