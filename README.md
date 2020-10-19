# pdftron-sharepoint-web-part-sample
A simple SharePoint web part build with PDFTron WebViewer 

Before beginning it is highly recommended that you are using no version of Node higher than 10. 

To get started you'll need Yeoman and Gulp installed.

```
npm i -g yo
npm i -g gulp
```

After this is installed you'll need to install the *@microsoft/sharepoint* generator

```
npm i @microsoft/generator-sharepoint -g
```

After this is done you can run `npm init` and the web part will be built for you. Go into the `pdftron-webpart-sample` directory and run `gulp serve` to start a workbench with the sample WebViewer.

```
npm run init
cd pdftron-webpart-sample
gulp serve
```
You should be able to add a new *PDFTronSample* web part looking like the following below.

![image](https://raw.githubusercontent.com/mike-mh/pdftron-sharepoint-web-part-sample/main/.github/images/localhost-image.png)
