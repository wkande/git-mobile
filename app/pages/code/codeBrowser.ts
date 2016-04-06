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
  items: any;
  repo: any;
  url: string;
  branchTagName = "default";
  path: string;
  local: any;

  dataLoaded: boolean = false;
  error = {flag:false, message:null};
  spinner = {flag:false, message:null};

  constructor(private nav: NavController, navParams: NavParams, private httpService: HttpService,
        private utils: Utils) {
      this.repo = {owner: null, name: null};
      this.repo.owner = navParams.get('owner');
      this.repo.name = navParams.get('name');
      this.path = navParams.get('path');
      console.log('CodeBrowserPage.constructor.repo', this.repo, this.path, this.branchTagName);
      console.log('CodeBrowserPage.onPageDidEnter >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')
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
              this.url = 'https://api.github.com/repos/'+this.repo.owner+'/'+this.repo.name+'/contents/?ref='+ref;
          else
              this.url = 'https://api.github.com/repos/'+this.repo.owner+'/'+this.repo.name+'/contents/'+this.path+'?ref='+ref;

          this.error.flag = false;
          this.spinner.flag = true;
          var self = this;
          this.httpService.load(this.url)
          .then((data:any) => {
              this.spinner.flag = false;
              if ('gmErrorCode' in data) {
                  this.error = {flag:true, message:data.message};
              }
              else{
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
                  this.dataLoaded = true;
              }
          }, function(error) {
              self.error = {flag:true, message:error};
              self.spinner.flag = false;
          });
      }
  }


  setLastCommit(item, rowNumb){
      var url = 'https://api.github.com/repos/'+this.repo.owner+'/'+this.repo.name+'/commits?sha='+this.branchTagName+'&path='+item.path;
      this.httpService.load(url)
      .then((data:any) => {
          console.log(item)
          console.log(data)
          if ('gmErrorCode' in data) {
              this.items[rowNumb].lastCommitted = this.items[rowNumb].name+': last commit not found';
          }
          else{
              if(data.length > 0){
                  this.items[rowNumb].lastCommitted = this.utils.timeAgo(data[0].commit.committer.date);
                  this.items[rowNumb].commitMsg = data[0].commit.message;
              }
          }
      }, function(error) {
          item.lastCommitted = 'ERROR: last commit not found';
          this.items[rowNumb].lastCommitted = this.items[rowNumb].name+': '+error;
      });

  }

  showModal() {
      let modal = Modal.create(BranchPickerModal, {repo:this.repo});
      modal.onDismiss(data => {
         this.load(data.ref);
       });
      this.nav.present(modal);
  }

  itemTapped(event, item) {
      console.log(item)
      console.log(this.repo)
      if(item.type == 'dir'){
          this.nav.push(CodeBrowserPage, {owner: this.repo.owner, name:this.repo.name, path:item.path});
      }
      else{
          this.nav.push(FileViewerPage, {repoOwner: this.repo.owner, repoName:this.repo.name, path:item.path, branchTagName:this.branchTagName});
      }
  }

}
