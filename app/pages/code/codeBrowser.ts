import {Modal, NavController, NavParams, ViewController, Storage, LocalStorage} from 'ionic-angular';
import {Component} from '@angular/core';
import {HttpService} from '../../providers/httpService.ts';
import {Utils} from '../../providers/utils.ts';
import BranchPickerModal from '../../pages/branches/branchPickerModal';
import {FileViewerPage} from '../../pages/files/fileViewer';
import {GmError} from '../../components/gm-error';
import {GmSpinner} from '../../components/gm-spinner';
import {PageClass} from '../../extendables/page';


@Component({
    templateUrl: 'build/pages/code/codeBrowser.html',
    providers: [HttpService, Utils],
    directives: [GmError, GmSpinner]
})


export class CodeBrowserPage extends PageClass{


  // PARAMS
  user:any;
  repo: any;
  path: string;
  history:Array<string> = [];

  // DATA
  items: any;
  url: string;
  local: any;
  branchTagName = "default";


  constructor(private nav: NavController, navParams: NavParams, private httpService: HttpService,
        private utils: Utils) {
      super();
      this.user = navParams.get('user');
      this.repo = navParams.get('repo');

      this.history.push(null); //First line is just the root path
      this.local = new Storage(LocalStorage);
      this.local.get('lastBranchTag')
      .then((data:any) => {
          this.load(data, null);
      });
  }


  load(ref, path){
      if (ref != 'canceled'){ // Modal may send canceled
          this.branchTagName = ref;
          this.path = path;
          this.local.set('lastBranchTag', ref);
          if(path == null)
              this.url = 'https://api.github.com/repos/'+this.repo.owner.login+'/'+this.repo.name+'/contents/?ref='+ref;
          else
              this.url = 'https://api.github.com/repos/'+this.repo.owner.login+'/'+this.repo.name+'/contents/'+path+'?ref='+ref;

          var self = this;
          this.startAsyncController(1, null);
          this.httpService.load(this.url, this.user)
          .then((data:any) => {
              self.items = [];
              data.forEach(function(item) {
                  if(item.type == 'dir'){
                      self.items.push({name:item.name, path:item.path, type:item.type, icon:'ios-folder-outline'}); //
                  }
              });
              data.forEach(function(item) {
                  if(item.type == 'symlink'){
                      self.items.push({name:item.name, path:item.path, type:item.type, icon:'octicon-file-symlink-directory'});
                  }
              });
              data.forEach(function(item) {
                  if(item.type == 'submodule'){
                      self.items.push({name:item.name, path:item.path, type:item.type, icon:'octicon-file-submodule'});
                  }
              });
              data.forEach(function(item) {
                  if(item.type == 'file'){
                      self.items.push({name:item.name, path:item.path, type:item.type, icon:'ios-document-outline'}); //
                  }
              });
              var limit = 0;
              data.forEach(function(item, i) {
                  if (limit < 100){
                    self.setLastCommit(item, i);
                  }
                  limit++;
              });
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


  showModal() {
      let modal = Modal.create(BranchPickerModal, {repo:this.repo, user:this.user});
      modal.onDismiss(data => {
          this.history = [null];
         this.load(data.ref, null);
       });
      this.nav.present(modal);
  }


  goBack(event){
    if(this.history.length == 1){
        this.nav.pop();
    }
    else{
        this.history.pop();
        this.load(this.branchTagName, this.history[this.history.length-1]);
    }

  }


  itemTapped(event, item) {
      if(item.type == 'dir'){
          this.history.push(item.path);
          this.load(this.branchTagName, item.path);
      }
      else{
          this.nav.push(FileViewerPage,
            {user:this.user,
            repo: this.repo,
            path:item.path,
            lastCommitted:item.lastCommitted,
            commitMsg:item.commitMsg,
            branchTagName:this.branchTagName}
          );
      }
  }

}
