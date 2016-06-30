import {NavController, NavParams} from 'ionic-angular';
import {Component} from '@angular/core';
import {HttpService} from '../../providers/httpService.ts';
import {Utils} from '../../providers/utils.ts';
import {GmError} from '../../components/gm-error';
import {GmSpinner} from '../../components/gm-spinner';
import {ProfilePage} from '../profile/profile';
import {FileViewerPage} from '../files/fileViewer';
import {GistCommentsPage} from '../gists/gistComments';
import {PageClass} from '../../extendables/page';

@Component({
  templateUrl: 'build/pages/gists/gistDetail.html',
  providers: [HttpService, Utils],
  directives: [GmError, GmSpinner]
})
export class GistDetailPage extends PageClass{
  ownerProfile:any;
  gist: any;
  url: string;
  user:any;

  owner: string;
  id: string;
  files: Array<any>;


  constructor(private nav: NavController, navParams: NavParams, private httpService: HttpService,
          private utils: Utils) {
        super();
        console.log('GistDetailPage.constructor ++++++++++++++++++++++++++++++++++++++++');
        this.user = navParams.get('user');
        this.owner = navParams.get('owner');
        this.id = navParams.get('id');
        this.files = [];
        this.url = 'https://api.github.com/gists/'+this.id;
        this.startAsyncController(2, null);
        this.load();
        this.loadProfile();
  }

  load() {
      var self = this;
      this.httpService.load(this.url,this.user)
      .then((data:any) => {

          this.gist = data;
          this.gist.timeAgo = this.utils.timeAgo(this.gist.created_at);
          this.gist.created_at = this.utils.formatDate(this.gist.created_at);

          if(!this.gist.description){
              for (var first in this.gist.files) break;
              this.gist.description = first;
          }
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


  itemTapped(event, item) {
      if(item == "forkof")
          this.nav.push(GistDetailPage, {
            owner: this.gist.fork_of.owner.login, id:this.gist.fork_of.id, description:this.gist.fork_of.description
          });
      else if(item.view == 'profile')
          this.nav.push(ProfilePage, {trigger:'user', user:this.user, username: item.username});
      else if(item == 'comments')
          this.nav.push(GistCommentsPage, {user:this.user, gistName:this.gist.description, url: this.gist.comments_url});
      else {
          this.nav.push(FileViewerPage, {trigger:'gist-file', user:this.user, gistName:this.gist.description, gistFileName:item.name, content:item.content});
      }

  }
}
