import {Page, NavController, NavParams} from 'ionic-angular';
import {HttpService} from '../../providers/httpService.ts';
import {GmError} from '../../components/gm-error';
import {GmSpinner} from '../../components/gm-spinner';

@Page({
  templateUrl: 'build/pages/files/fileViewer.html',
  providers: [HttpService],
  directives: [GmError, GmSpinner]
})
export class FileViewerPage {

  // PARAMS
  path:any;
  repoOwner: string;
  repoName: string;
  branchTagName: string;

  // DATA
  file: any;

  // URLS
  url: string;

  // LOADER
  dataLoaded: boolean = false;
  error = {flag:false, message:null};
  spinner = {flag:true, message:null};
  async = {cnt:1, completed:0}; // Number of async calls to load the view

  constructor(private nav: NavController, navParams: NavParams, private httpService: HttpService) {
      this.path = navParams.get('path');
      this.repoOwner = navParams.get('repoOwner');
      this.repoName = navParams.get('repoName');
      this.branchTagName = navParams.get('branchTagName');

      // GET /repos/:owner/:repo/contents/:path
      this.url = 'https://api.github.com/repos/'+this.repoOwner+'/'+this.repoName+'/contents/'+this.path+'?ref='+this.branchTagName;
      console.log('FileViewerPage.constructor', this.url);
      this.load();
  }


  load(){
      var self = this;
      this.httpService.load(this.url)
      .then((data: any) => {
          if ('gmErrorCode' in data) {
              this.asyncController(null, data);
          }
          else{
              console.log('loaded file: ', data)
              this.file = data;
              this.file.content = new Buffer(this.file.content, 'base64');
              this.asyncController(true, null);

          }
      }, function(error) {
          self.asyncController(null, error);
      });
  }

  asyncController(success, error){
      if(this.error.flag) return; // Onec async call has already failed so ignore the rest
      if(error){
          this.error = {flag:true, message:error.message};
          this.spinner.flag = false;
      }
      else{
          this.async.completed++;
          if(this.async.cnt == this.async.completed){
              this.spinner.flag = false;
              this.dataLoaded = true;
          }
      }
      console.log('asyncCnt', this.async.completed)
  }


}
