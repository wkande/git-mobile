import {Page, NavController, NavParams} from 'ionic-angular';
import {HttpService} from '../../providers/httpService.ts';
import {Utils} from '../../providers/utils.ts';
import {GmError} from '../../components/gm-error';
import {GmSpinner} from '../../components/gm-spinner';
import {ProfilePage} from '../profile/profile';
import {FileViewerPage} from '../files/fileViewer';
import {GistCommentsPage} from '../gists/gistComments';

@Page({
  templateUrl: 'build/pages/gists/gistDetail.html',
  providers: [HttpService, Utils],
  directives: [GmError, GmSpinner]
})
export class GistDetailPage {
  ownerProfile:any;
  gist: any;
  url: string;
  user:any;

  owner: string;
  id: string;
  files: Array<any>;

  // LOADER
  dataLoaded: boolean = false;
  error = {flag:false, status:null, message:null};
  spinner = {flag:true, message:null};
  async = {cnt:2, completed:0}; // Number of async calls to load the view

  constructor(private nav: NavController, navParams: NavParams, private httpService: HttpService,
          private utils: Utils) {
        console.log('GistDetailPage.constructor ++++++++++++++++++++++++++++++++++++++++');
        this.user = navParams.get('user');
        this.owner = navParams.get('owner');
        this.id = navParams.get('id');
        this.files = [];
        this.url = 'https://api.github.com/gists/'+this.id;
        this.load();
        this.loadProfile();
  }

  load() {
      var self = this;
      this.httpService.load(this.url,this.user)
      .then((data:any) => {
          console.log('GistDetailPage.onPageDidEnter.DATA', data)

          this.gist = data;
          this.gist.timeAgo = this.utils.timeAgo(this.gist.created_at);
          this.gist.created_at = this.utils.formatDate(this.gist.created_at);

          if(!this.gist.description){
              for (var first in this.gist.files) break;
              this.gist.description = first;
              //this.gist.description = "No description available";
          }
          /*if(!this.gist.owner){
              this.gist.owner.hide = true;
              this.gist.owner = {};
              this.gist.owner.login = 'Unknown';
              this.gist.owner.avatar_url = 'img/blank_avatar.png';
          }*/
          //this.gist.public = ((this.gist.public == true) ?  'md-unlock' : 'md-lock');
          for (var key in this.gist.files) {
              self.files.push( {name:this.gist.files[key].filename, content:this.gist.files[key].content} );
          }
          this.asyncController(true, null);
      }).catch(error => {
          this.asyncController(null, error);
      });
  }

  loadProfile() {
      var self = this;
      if(this.owner != 'User unknown'){
          this.httpService.getProfile(this.owner, this.user)
          .then((data:any) => {
              this.ownerProfile = data;
              this.asyncController(true, null);
          }).catch(error => {
              this.asyncController(null, error);
          });
      }
      else{
        this.asyncController(true, null);
      }
  }

  asyncController(success, error){
      if(this.error.flag) return; // Once async call has already failed so ignore the rest
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

  itemTapped(event, item) {
    console.log('GistDetailPage.itemTapped',item);
      if(item == "forkof")
          this.nav.push(GistDetailPage, {
            owner: this.gist.fork_of.owner.login, id:this.gist.fork_of.id, description:this.gist.fork_of.description
          });
      else if(item.view == 'profile')
          this.nav.push(ProfilePage, {trigger:'user', user:this.user, username: item.username});
      else if(item == 'comments')
          this.nav.push(GistCommentsPage, {user:this.user, gistName:this.gist.description, url: this.gist.comments_url});
      else {
          console.log('FILE', this.gist); // For the file
          this.nav.push(FileViewerPage, {trigger:'gist-file', user:this.user, gistName:this.gist.description, gistFileName:item.name, content:item.content});
      }

  }
}
