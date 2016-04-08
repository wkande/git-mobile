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
  trigger:string;
  path:any;
  repoOwner: string;
  repoName: string;
  repo:any;
  branchTagName: string;
  user:any;

  // DATA
  file: any;
  description:string;

  // URLS
  url: string;

  // LOADER
  dataLoaded: boolean = false;
  error = {flag:false, status:null, message:null};
  spinner = {flag:true, message:null};
  async = {cnt:1, completed:0}; // Number of async calls to load the view

  constructor(private nav: NavController, navParams: NavParams, private httpService: HttpService) {
      console.log('\n\n| >>> +++++++++++++ FileViewerPage.constructor +++++++++++++++');

      this.trigger = navParams.get('trigger');
      this.path = navParams.get('path');
      this.repo = navParams.get('repo')
      this.repoOwner = navParams.get('repoOwner');
      this.repoName = navParams.get('repoName');
      this.branchTagName = (navParams.get('branchTagName') == null) ? 'origin': navParams.get('branchTagName');
      this.user = navParams.get('user');

      if(this.trigger == 'readme'){
          // GET /repos/:owner/:repo/readme
          this.description = '';
          this.url = 'https://api.github.com/repos/'+this.repo.owner.login+'/'+this.repo.name+'/readme';
          this.loadMD();
      }
      else{
          // GET /repos/:owner/:repo/contents/:path
          this.url = 'https://api.github.com/repos/'+this.repo.owner.login+'/'+this.repo.name+'/contents/'+this.path+'?ref='+this.branchTagName;
          this.load();
      }


  }


  load(){
      //var self = this;
      console.log("| >>> FileViewerPage.load: ", this.url);
      this.httpService.load(this.url, this.user)
      .then((data: any) => {
          console.log('loaded file: ', data)
          this.file = data;
          this.description = data.path;
          this.file.content = new Buffer(this.file.content, 'base64');
          this.asyncController(true, null);
      }).catch(error => {
          this.asyncController(null, error);
      });
  }

  loadMD(){
      //var self = this;
      console.log("| >>> FileViewerPage.loadMD: ", this.url);
      this.httpService.loadMediaHtml(this.url, this.user)
      .then((data: any) => {
          console.log('loaded file: ', data)
          this.file = {};
          this.file.content = data;
          this.description = 'Default Repo README';
          console.log(this.file)
          this.asyncController(true, null);
      }).catch(error => {
          this.asyncController(null, error);
      });
  }

  asyncController(success, error){
      if(this.error.flag) return; // Onec async call has already failed so ignore the rest
      if(error){
          this.error = {flag:true, status:error.status, message:error.message};
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
