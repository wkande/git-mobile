import {Modal, NavController, NavParams, ActionSheet} from 'ionic-angular';
import {Component} from '@angular/core';
import {HttpService} from '../../providers/httpService.ts';
import {ProfilePage} from './profile';
import {Utils} from '../../providers/utils.ts';
import {GmError} from '../../components/gm-error';
import {GmSpinner} from '../../components/gm-spinner';
import {PageClass} from '../../extendables/page';
import {SearchPage} from '../search/search';

@Component({
  templateUrl: 'build/pages/profile/users.html',
  providers: [HttpService, Utils],
  directives: [GmError, GmSpinner]
})
export class UsersPage extends PageClass{

  // PARAMS > DATA
  trigger: string;
  user:any;
  username: string;
  repo: any;
  description: string;

  // DATA
  data = {row:null, total_count:null, items:[], gm_pagination:null, next:null}; // TMP declarations prevent compile warnings
  pagination:any;
  lastPage = 0;
  foundExcess:string;
  searchValue:string;

  // URLS
  url: string;


  constructor(private nav: NavController, navParams: NavParams,
              private httpService: HttpService, private utils: Utils) {
      super();
      console.log('\n\n| >>> +++++++++++++ UsersPage.constructor +++++++++++++++');
      console.log(navParams)
      this.trigger = (navParams.get('trigger') == null) ? 'followers-me': navParams.get('trigger');
      this.user = navParams.get('user');
      this.username = navParams.get('username');
      this.repo = navParams.get('repo');
      this.searchValue = navParams.get('searchValue');
      this.setUrl();
      this.loadScrolling(null);
  }

  setUrl(){
      if(this.trigger == 'wyosoft-members'){ //called by the roadmap page
          this.description = 'Wyoming Software Team Members:';
          this.url = 'https://api.github.com/orgs/WyomingSoftware/members';
      }
      else if(this.trigger == 'followers'){
          this.description = 'Followers of: '+ this.username ;
          this.url = 'https://api.github.com/users/'+this.username+'/followers';
      }
      else if(this.trigger == 'following'){
          this.description = this.username +' is following';
          this.url = 'https://api.github.com/users/'+this.username+'/following';
      }
      if(this.trigger == 'followers-me'){
          this.description = "My Followers";
          this.url = 'https://api.github.com/user/followers';
      }
      else if(this.trigger == 'following-me'){
          this.description = "I'm Following";
          this.url = 'https://api.github.com/user/following';
      }
      else if(this.trigger == 'stargazers'){
          this.description = 'Stargazers of: '+this.repo.name;
          this.url = 'https://api.github.com/repos/'+this.repo.owner.login+'/'+this.repo.name+'/stargazers';
      }
      else if(this.trigger == 'watchers'){
          this.description = 'Watchers of: '+this.repo.name;
          this.url = 'https://api.github.com/repos/'+this.repo.owner.login+'/'+this.repo.name+'/subscribers';
      }
      else if(this.trigger == 'orgs'){
          this.description = 'Organizations: '+this.username;
          this.url = 'https://api.github.com/users/'+this.username+'/orgs';
      }
      else if(this.trigger == 'orgs-me'){
          this.description = 'My Organizations';
          this.url = 'https://api.github.com/user/orgs';
      }
      else if(this.trigger == 'members'){
          this.description = 'Members of: '+this.username;
          this.url = 'https://api.github.com/orgs/'+this.username+'/members';
      }
      else if(this.trigger == 'search'){
          this.description = 'Search: '+this.searchValue;
          // ISSUE
          // Adding the fields for email,fullname,login seems to limit the search,
          // fullname is not allwas serached
          //
          // +" in:email,fullname,login"
          // adam location:cheyenne
          //
          this.url = 'https://api.github.com/search/users?q='+this.searchValue.toLowerCase();
      }
  }


  loadScrolling(infiniteScroll){
      // Disable infiniteScroll if no more data
      if(infiniteScroll != null && this.data.next == null){
          infiniteScroll.complete();
          return;
      }

      var self = this;

      // New load
      if(infiniteScroll == null){
          this.data.items = [];
          this.startAsyncController(1, null, false);
      }
      // Infinite scroll load
      else{
          this.startAsyncController(1, null, true);
          this.url = this.data.next;
      }

      this.httpService.load(this.url, this.user)
      .then((data:any) => {
          this.pagination = this.utils.formatPagination(data.gm_pagination);
          this.data.next = this.pagination.next;
          this.lastPage = (this.pagination.lastPageNumber == null) ? this.lastPage : this.pagination.lastPageNumber;

          this.data.gm_pagination = data.gm_pagination;

          // Populate items
          var row = this.data.items.length;
          if(this.trigger == 'search') {
              for(var i=0; i< data.items.length; i++){
                  data.items[i].row = row++;
                  this.data.items.push(data.items[i]);
              }
              this.data.total_count = data.total_count;
          }
          else {
              for(var i=0; i< data.length; i++){
                  data[i].row = row++;
                  this.data.items.push(data[i]);
              }
              this.data.total_count = 0; // outside of a search we do not have the total_count
              if(this.trigger == 'orgs' || this.trigger == 'orgs-me' ){
                  this.data.items.forEach(function(entry) {
                      entry.type = 'Organization';
                  });
              }
          }

          if(this.data.total_count <= (30 * this.lastPage)  || this.lastPage == 0)
              this.foundExcess = null;
          else
              this.foundExcess = 'Found '+this.data.total_count.toLocaleString('en')+'; Viewable '+(30 * this.lastPage).toLocaleString('en')+'; Please narrow the search.';
          // Must follow above calcs or the math will fail
          this.data.total_count = this.data.total_count.toLocaleString('en');

          if(infiniteScroll != null){
              infiniteScroll.complete();
          }

          this.asyncController(true, null);
      }).catch(error => {
          if(infiniteScroll != null){
              infiniteScroll.complete();
          }
          this.asyncController(null, error);
      });
  }


  /*loadxxxx(){
      var self = this;
      this.startAsyncController(1, null);
      this.httpService.load(this.url, this.user)
      .then((data:any) => {
          this.pagination = this.utils.formatPagination(data.gm_pagination);
          this.lastPage = (this.pagination.lastPageNumber == null) ? this.lastPage : this.pagination.lastPageNumber;

          this.data = {};
          this.data.gm_pagination = data.gm_pagination;
          if(this.trigger == 'search') {
              this.data.items = data.items;
              this.data.total_count = data.total_count;
          }
          else {
              this.data.items = data;
              this.data.total_count = 0; // outside of a search we do not have the total_count
              if(this.trigger == 'orgs' || this.trigger == 'orgs-me' ){
                  this.data.items.forEach(function(entry) {
                      entry.type = 'Organization';
                  });
              }
          }

          if(this.data.total_count <= (30 * this.lastPage)  || this.lastPage == 0)
              this.foundExcess = null;
          else
              this.foundExcess = 'Found '+this.data.total_count.toLocaleString('en')+'; Viewable '+(30 * this.lastPage).toLocaleString('en')+'; Please narrow the search.';
          // Must follow above calcs or the math will fail
          this.data.total_count = this.data.total_count.toLocaleString('en');

          this.asyncController(true, null);
      }).catch(error => {
          this.asyncController(null, error);
      });
  }*/


  // Load for pagination
  /*paginationLoad(url){
      this.url = url;
      this.load();
  }*/


  presentActionSheet() {
      let actionSheet = ActionSheet.create({
        title: 'Users/Orgs',
        buttons: [
            {
              text: "Following",
              handler: () => {
                this.trigger = "following-me";
                this.setUrl();
                this.loadScrolling(null);}
            },{
              text: 'Followers',
              handler: () => {
                this.trigger = "followers-me";
                this.setUrl();
                this.loadScrolling(null);}
            },{
              text: 'Organizations',
              handler: () => {
                this.trigger = "orgs-me";
                this.username = this.user.login;
                this.setUrl();
                this.loadScrolling(null);}
            },{
              text: 'Search',
              handler: () => {
                this.nav.push(SearchPage, {triggered_for:'users2', user:this.user});
              }
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
      var trigger = (item.type == "Organization") ? 'org' : 'user';
      this.nav.push(ProfilePage, {trigger:trigger, user:this.user, username:item.login});
  }
}
