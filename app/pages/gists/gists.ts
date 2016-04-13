import {Page, Modal, NavController, NavParams, ActionSheet} from 'ionic-angular';
import {OnInit} from 'angular2/core';
import {HttpService} from '../../providers/httpService.ts';
import {Utils} from '../../providers/utils.ts';
import {GistDetailPage} from './gistDetail';
import {GmError} from '../../components/gm-error';
import {GmSpinner} from '../../components/gm-spinner';

@Page({
  templateUrl: 'build/pages/gists/gists.html',
  providers: [HttpService, Utils],
  directives: [GmError, GmSpinner]
})
export class GistsPage {
  // PARAMS
  trigger: string;
  user:any;
  username:string;

  // DATA
  data: any;
  pagination:any;
  lastPage = 0;
  description:string;

  // URLS
  url: string;

  // LOADER
  dataLoaded: boolean = false;
  error = {flag:false, status:null, message:null};
  spinner = {flag:true, message:null};
  async = {cnt:1, completed:0}; // Number of async calls to load the view


  constructor(private nav: NavController, navParams: NavParams, private httpService: HttpService,
         private utils: Utils) {

      console.log('\n\n| >>> +++++++++++++ GistsPage.constructor +++++++++++++++');
      console.log(navParams)
      this.user = navParams.get('user');
      this.username = navParams.get('username');
      this.trigger = (navParams.get('trigger') == null) ? 'mine': navParams.get('trigger');
      this.setURL();
      this.load();
      /*if(this.type == 'Mine'){
          this.url = 'https://api.github.com/users/:user/gists'; // Owned
      }
      else if(this.type == 'Starred'){ // Current user starred repos
          this.url = 'https://api.github.com/gists/starred';
      }
      else if(this.type == 'Recent'){ //
          this.url = 'https://api.github.com/gists/public';
      }*/
      /*else if(this.type == 'Forked by me'){ // Current user starred repos
          this.url = 'https://api.github.com/gists/public';
      }*/
      /*else if(this.type == 'search'){
          this.url = 'https://api.github.com/search?q='+this.searchValue+'&ref=gists';
      }
      else{
          this.url = 'https://api.github.com/users/'+this.type+'/gists'; // Some user
      }*/
  }

  setURL(){
      console.log('setURL', this.trigger)
      if (this.trigger == 'mine' ){
          this.description = "Mine";
          this.url = 'https://api.github.com/users/'+this.user.login+'/gists';
      }
      else if (this.trigger == 'user' ){
        this.description = "Gists for: "+this.username;
        this.url = 'https://api.github.com/users/'+this.username+'/gists';
      }
      else if (this.trigger == 'starred-me' ){
          this.description = "Starred by Me";
          this.url = 'https://api.github.com/gists/starred';
      }
      else if (this.trigger == 'recent' ){
          this.description = "Recent";
          this.url = 'https://api.github.com/gists/public';
      }
  }

  load(){
      var self = this;
      this.dataLoaded = false;
      this.async = {cnt:1, completed:0};
      this.error = {flag:false, status:null, message:null};
      this.spinner = {flag:true, message:null};
      this.data = {}; // Jumps the view to the top
      console.log("| >>> GistsPage.load: ", this.url);
      this.httpService.load(this.url, this.user)
      .then((data:any) => {
          console.log('GISTS DATA', data);
          this.pagination = self.utils.formatPagination(data.gm_pagination);
          this.lastPage = (this.pagination.lastPageNumber != null) ? this.pagination.lastPageNumber: this.lastPage;
          this.data.gm_pagination = data.gm_pagination;

          this.data.items = data;
          this.data.items.forEach(function(item){
              item.timeAgo = self.utils.timeAgo(item.created_at);
              if(!item.owner){ // Some gist do not have owner, /gists/public
                  item.owner = {};
                  item.owner.login = 'User unknown';
                  item.owner.avatar_url = 'img/blank_avatar.png';
              }
              if(!item.description){
                for (var first in item.files) break;
                item.description = first;
              }
          })
          console.log(this.data);
          this.asyncController(true, null);
      }).catch(error => {
          this.asyncController(null, error);
      });
  }

  // Load for pagination
  paginationLoad(url){
      console.log(url)
      this.url = url;//.split('github.com')[1];
      this.load();
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


  presentActionSheet() {
      let actionSheet = ActionSheet.create({
        title: 'Filter Gists',
        buttons: [
          {
            text: 'Mine',
            handler: () => {
              this.trigger = 'mine';
              this.setURL();
              this.load();}
          },{
            text: 'Starred',
            handler: () => {
              this.trigger = 'starred-me';
              this.setURL();
              this.load();}
          },{
            text: 'Recent',
            handler: () => {
              this.trigger = 'recent';
              this.setURL();
              this.load();}
          },{
            text: 'Cancel',
            style: 'cancel',
            handler: () => {;}
          }
        ]
      });
      this.nav.present(actionSheet);
  }


  itemTapped(event, item) {
    this.nav.push(GistDetailPage, {user:this.user, owner: item.owner.login, id:item.id
    });
  }
}
