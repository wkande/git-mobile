import {Page, Modal, NavController, NavParams, ActionSheet} from 'ionic-angular';
import {HttpService} from '../../providers/httpService.ts';
import {ProfilePage} from './profile';
import SearchModal from './searchModal';
import {Utils} from '../../providers/utils.ts';
import {GmError} from '../../components/gm-error';
import {GmSpinner} from '../../components/gm-spinner';

@Page({
  templateUrl: 'build/pages/profile/users.html',
  providers: [HttpService, Utils],
  directives: [GmError, GmSpinner]
})
export class UsersPage {

  // PARAMS > DATA
  trigger: string;
  user:any;
  username: string;
  repo: any;
  description: string;

  // DATA
  data: any;
  pagination:any;
  lastPage = 0;
  foundExcess:string;

  // URLS
  url: string;

  // LOADER
  dataLoaded: boolean = false;
  error = {flag:false, status:null, message:null};
  spinner = {flag:true, message:null};
  async = {cnt:1, completed:0}; // Number of async calls to load the view

  constructor(private nav: NavController, navParams: NavParams,
              private httpService: HttpService, private utils: Utils) {

      console.log('\n\n| >>> +++++++++++++ UsersPage.constructor +++++++++++++++');
      console.log(navParams)
      this.trigger = (navParams.get('trigger') == null) ? 'followers-me': navParams.get('trigger');
      this.user = navParams.get('user');
      this.username = navParams.get('username');
      this.repo = navParams.get('repo');
      this.setUrl();
      this.load();
  }

  setUrl(){
      if(this.trigger == 'followers'){
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
  }


  load(){
      var self = this;
      this.dataLoaded = false;
      this.async = {cnt:1, completed:0};
      this.error = {flag:false, status:null, message:null};
      this.spinner = {flag:true, message:null};
      console.log('| >>> UsersPage.load', this.url)
      this.httpService.load(this.url, this.user)
      .then((data:any) => {
          console.log("| >>> UsersPage.load", data);
          this.pagination = this.utils.formatPagination(data.gm_pagination);
          this.lastPage = (this.pagination.lastPageNumber == null) ? this.lastPage : this.pagination.lastPageNumber;

          this.data = {};
          this.data.gm_pagination = data.gm_pagination;
          console.log(this.trigger);
          if(this.trigger == 'search') {
              this.data.items = data.items;
              console.log(data.total_count)
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

          if(this.data.total_count <= (30 * this.lastPage) )
              this.foundExcess = null;
          else
              this.foundExcess = 'Found '+this.data.total_count.toLocaleString('en')+'; Viewable '+(30 * this.lastPage).toLocaleString('en')+'; Please narrow the search.';
          // Must follow above calcs or the math will fail
          this.data.total_count = this.data.total_count.toLocaleString('en');

          console.log(this.data);
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

  // Load for pagination
  paginationLoad(url){
      this.url = url;
      this.load();
  }

  showSearchModal() {
      let modal = Modal.create(SearchModal, {user:this.user});
      modal.onDismiss(data => {
           if(data.ref != 'canceled'){
              this.trigger = 'search';
              this.description = 'Search'
              this.url = 'https://api.github.com'+data.url;
              this.load();
           }
       });
      this.nav.present(modal);
  }

  presentActionSheet() {
      let actionSheet = ActionSheet.create({
        title: 'Filters',
        buttons: [
            {
              text: "Following",
              handler: () => {
                this.trigger = "following-me";
                this.setUrl();
                this.load();}
            },{
              text: 'Followers',
              handler: () => {
                this.trigger = "followers-me";
                this.setUrl();
                this.load();}
            },{
              text: 'Organizations',
              handler: () => {
                this.trigger = "orgs-me";
                this.username = this.user.login;
                this.setUrl();
                this.load();}
            },{
              text: 'Search',
              handler: () => {
                  this.showSearchModal()
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
