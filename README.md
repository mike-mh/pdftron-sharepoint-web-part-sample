# pdftron-sharepoint-web-part-sample
A simple SharePoint web part build with PDFTron WebViewer 

Before beginning it is highly recommended that you are using no version of Node higher than 10. 

To get started you'll need Yeoman and Gulp installed.

```
npm install -g yo
npm install --global gulp-cli
```

After this is installed you'll need to isntall the *@microsoft/sharepoint* generator

```
npm install @microsoft/generator-sharepoint -g
```

After this is done you can run `npm init` and the web part will be built for you. Go into the `pdftron-webpart-sample` directory and run `gulp serve` to start a workbench with the sample WebViewer.

```
cd pdftron-webpart-sample
gulp serve
```
