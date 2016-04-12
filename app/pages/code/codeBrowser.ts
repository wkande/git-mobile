import {Page, Modal, NavController, NavParams, ViewController, Storage, LocalStorage} from 'ionic-angular';
import {HttpService} from '../../providers/httpService.ts';
import {Utils} from '../../providers/utils.ts';
import BranchPickerModal from '../../pages/branches/branchPickerModal';
import {CodeBrowserPage} from './codeBrowser';
import {FileViewerPage} from '../../pages/files/fileViewer';
import {GmError} from '../../components/gm-error';
import {GmSpinner} from '../../components/gm-spinner';

@Page({
  templateUrl: 'build/pages/code/codeBrowser.html',
  providers: [HttpService, Utils],
    directives: [GmError, GmSpinner]
})
export class CodeBrowserPage {

  // PARAMS
  user:any;
  repo: any;
  path: string;

  // DATA
  items: any;
  url: string;
  local: any;
  branchTagName = "default";

  dataLoaded: boolean = false;
  error = {flag:false, status:null, message:null};
  spinner = {flag:false, message:null};
  async = {cnt:1, completed:0}; // Number of async calls to load the view

  constructor(private nav: NavController, navParams: NavParams, private httpService: HttpService,
        private utils: Utils) {
      console.log('\n\n| >>> +++++++++++++ CodeBrowserPage.constructor +++++++++++++++');
      console.log(navParams);
      this.user = navParams.get('user');
      this.repo = navParams.get('repo');
      this.path = navParams.get('path');
      this.local = new Storage(LocalStorage);
      this.local.get('lastBranchTag')
      .then((data:any) => {
          this.load(data);
      });;
  }

  load(ref){
      console.log("CodeBrowserPage.load", this.path, ref);

      if (ref != 'canceled'){ // Modal may send canceled
          this.branchTagName = ref;
          this.local.set('lastBranchTag', ref);
          if(typeof this.path == 'undefined')
              this.url = 'https://api.github.com/repos/'+this.repo.owner.login+'/'+this.repo.name+'/contents/?ref='+ref;
          else
              this.url = 'https://api.github.com/repos/'+this.repo.owner.login+'/'+this.repo.name+'/contents/'+this.path+'?ref='+ref;

          var self = this;
          this.httpService.load(this.url, this.user)
          .then((data:any) => {
              self.items = [];

              data.forEach(function(item) {
                  if(item.type == 'dir'){
                      self.items.push({name:item.name, path:item.path, type:item.type, icon:'ios-folder-outline'});
                  }
              });
              data.forEach(function(item) {
                  if(item.type == 'file'){
                      self.items.push({name:item.name, path:item.path, type:item.type, icon:'ios-document-outline'});
                  }
              });
              data.forEach(function(item, i) {
                  self.setLastCommit(item, i);
              });
              console.log(self.items)
              this.asyncController(true, null);
          }).catch(error => {
              this.asyncController(null, error);
          });
      }
  }


  setLastCommit(item, rowNumb){
      var url = 'https://api.github.com/repos/'+this.repo.owner.login+'/'+this.repo.name+'/commits?sha='+this.branchTagName+'&path='+item.path;
      this.httpService.load(url, this.user)
      .then((data:any) => {
          if(data.length > 0){
              this.items[rowNumb].lastCommitted = this.utils.timeAgo(data[0].commit.committer.date);
              this.items[rowNumb].commitMsg = data[0].commit.message;
          }
      }).catch(error => {
          item.lastCommitted = 'ERROR: last commit not found';
          this.items[rowNumb].lastCommitted = this.items[rowNumb].name+': '+error;
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

  showModal() {
      let modal = Modal.create(BranchPickerModal, {repo:this.repo, user:this.user});
      modal.onDismiss(data => {
         this.load(data.ref);
       });
      this.nav.present(modal);
  }

  itemTapped(event, item) {
      if(item.type == 'dir'){
          this.nav.push(CodeBrowserPage, {user:this.user, repo: this.repo, path:item.path});
      }
      else{
          this.nav.push(FileViewerPage, {user:this.user, repo: this.repo, path:item.path, branchTagName:this.branchTagName});
      }
  }

}
