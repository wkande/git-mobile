import {Page, NavController, NavParams} from 'ionic-angular';
import {HttpService} from '../../providers/httpService.ts';
import {Utils} from '../../providers/utils.ts';
import {GmError} from '../../components/gm-error';
import {GmSpinner} from '../../components/gm-spinner';
import {ProfilePage} from '../profile/profile';
import {GistFileViewerPage} from '../gists/gistFileViewer';
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

  owner: string;
  id: string;
  files: Array<any>;

  dataLoaded: boolean = false;
  profileLoaded: boolean = false;
  error = {flag:false, message:null};
  spinner = {flag:false, message:null};


  constructor(private nav: NavController, navParams: NavParams, private httpService: HttpService,
          private utils: Utils) {
        console.log('GistDetailPage.constructor ++++++++++++++++++++++++++++++++++++++++');
        this.owner = navParams.get('owner');
        this.id = navParams.get('id');
        this.files = [];
        this.url = 'https://api.github.com/gists/'+this.id;
  }

  onPageDidEnter() {
      if (!this.dataLoaded){ // Do not load on Back button since the Page is still in the DOM
          this.error.flag = false;
          this.spinner.flag = true;
          var self = this;

          if(this.owner != 'User unknown'){
              this.httpService.getProfile(this.owner)
              .then((data:any) => {
                  if ('gmErrorCode' in data) {
                      this.error = {flag:true, message:data.message};
                  }
                  else{
                      this.ownerProfile = data;
                      this.profileLoaded = true;
                  }
              }, function(error) {
                  self.error = {flag:true, message:error};
                  self.spinner.flag = false;
              });
          }
          else
          this.profileLoaded = true;

          this.httpService.load(this.url)
          .then((data:any) => {
              console.log('GistDetailPage.onPageDidEnter.DATA', data)
              this.spinner.flag = false;
              if ('gmErrorCode' in data) {
                  this.error = {flag:true, message:data.message};
              }
              else{
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
                  this.dataLoaded = true;
              }
          }, function(error) {
              self.error = {flag:true, message:error};
              self.spinner.flag = false;
          });
      }
  }

  itemTapped(event, item) {
    console.log('GistDetailPage.itemTapped',item);
      if(item == "forkof")
          this.nav.push(GistDetailPage, {
            owner: this.gist.fork_of.owner.login, id:this.gist.fork_of.id, description:this.gist.fork_of.description
          });
      else if(item.view == 'profile')
          this.nav.push(ProfilePage, {username: item.username});
      else if(item == 'comments')
          this.nav.push(GistCommentsPage, {gistName:this.gist.description, url: this.gist.comments_url});
      else {
          console.log('FILE', this.gist); // For the file
          this.nav.push(GistFileViewerPage, {gistName:this.gist.description, name:item.name, content:item.content});
      }

  }
}
