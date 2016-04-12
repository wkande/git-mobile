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
  repo:any;
  branchTagName: string;
  user:any;

  // DATA
  file: any;
  content:any;
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
      console.log(navParams);
      this.trigger = navParams.get('trigger');
      this.path = navParams.get('path');
      this.repo = navParams.get('repo')
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
      var self = this;
      console.log("| >>> FileViewerPage.load: ", this.url);
      this.httpService.load(this.url, this.user)
      .then((data: any) => {
          console.log('loaded file: ', data)
          this.file = data;
          this.description = data.path;
          this.file.content = new Buffer(this.file.content, 'base64').toString();
          var arr = self.file.content.split('\n');
          var numb = 1;
          arr.forEach(function(line){
              var spaces;
              if(numb < 10)
                  spaces = '&nbsp;&nbsp;&nbsp;'+numb+'&nbsp;';
              else if(numb < 100)
                  spaces = '&nbsp;&nbsp;'+numb+'&nbsp;';
              else if(numb < 1000)
                  spaces = '&nbsp;'+numb+'&nbsp;';
              spaces = '<span style="border-left: 1px solid #387ef5;border-right: 1px solid gray;">'+spaces+'</span>&nbsp;';




              var newLine = spaces + line.replace(/\t/g, '&nbsp;').replace(/\ /g, '&nbsp;').replace(/\</g, '&lt') +'<br/>';
              if(numb == 1)
                self.content = newLine;
              else
                self.content = self.content+newLine;
              numb++;
          })


          this.asyncController(true, null);
      }).catch(error => {
          this.asyncController(null, error);
      });
  }

  loadMD(){
      console.log("| >>> FileViewerPage.loadMD: ", this.url);
      this.httpService.loadMediaHtml(this.url, this.user)
      .then((data: any) => {
          console.log('loaded file: ', data)
          //this.file = {};
          this.content = data;
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
  }

}
