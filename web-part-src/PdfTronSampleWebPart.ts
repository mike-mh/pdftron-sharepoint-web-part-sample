import WebViewer from '@pdftron/webviewer';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { escape } from '@microsoft/sp-lodash-subset';

import styles from './PdfTronSampleWebPart.module.scss';
import * as strings from 'PdfTronSampleWebPartStrings';

const englishJson = require('./en.json');

export interface IPdfTronSampleWebPartProps {
  description: string;
}

export default class PdfTronSampleWebPart extends BaseClientSideWebPart<IPdfTronSampleWebPartProps> {

  public render(): void {
    this.domElement.style.height = '1000px';

    WebViewer(({
      path: '/_catalogs/masterpage/pdftron/lib',
      //html5Path: './ui/index.aspx',
      //initialDoc: '/Shared Documents/file-sample_100kb.docx',
      initialDoc: '/webviewer-demo.pdf',
    } as any), this.domElement).then((i) => {

      (i as any).i18n.on('loaded', () => {
        (i as any).i18n.addResourceBundle('en', 'translation', englishJson, true, true);
        (i as any).i18n.addResource('en', 'translation', 'option.signatureOverlay.addSignature', 'New signature!');
        i.setLanguage('en');
      });
    });
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}

