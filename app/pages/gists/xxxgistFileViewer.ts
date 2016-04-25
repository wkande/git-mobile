import {Page, Modal, NavController, NavParams, ViewController} from 'ionic-angular';
//import {HttpService} from '../../providers/httpService.ts';
//import {GmError} from '../../components/gm-error';
//import {GmSpinner} from '../../components/gm-spinner';

@Page({
  templateUrl: 'build/pages/gists/gistFileViewer.html'//,
  //providers: [HttpService]//,
    //directives: [GmError, GmSpinner]
})
export class GistFileViewerPage {
  name:any;
  content: string;
  gistName: string;

  dataLoaded: boolean = false;
  //error = {flag:false, message:null};
  //spinner = {flag:false, message:null};

  constructor(private nav: NavController, navParams: NavParams) {
      this.name = navParams.get('name');
      this.content = navParams.get('content');
      this.gistName = navParams.get('gistName');
      this.dataLoaded = true;
      //console.log('GistFileViewerPage.constructor', this.gistName);
  }

}
