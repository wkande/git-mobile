import {Page, Modal, NavController, NavParams, ActionSheet} from 'ionic-angular';
import {HttpService} from '../../providers/httpService.ts';
import {ProfileService} from '../../providers/profileService.ts';
import SearchModal from './searchModal';
import {Utils} from '../../providers/utils.ts';
import {RepoDetailPage} from './repoDetail';
import {GmError} from '../../components/gm-error';
import {GmSpinner} from '../../components/gm-spinner';


@Page({
  templateUrl: 'build/pages/repos/repos.html',
  providers: [HttpService, ProfileService, Utils],
  directives: [GmError, GmSpinner]
})
export class ReposPage {

  // PARAMS
  trigger: string;
  user:any;
  username:string;

  // DATA
  data = {total_count:null, items:null, gm_pagination:null}; // TMP decalrations prevent compile warnings
  profileServiceData:any;
  pagination:any;
  lastPage = 0;
  type = 'public';
  searchValue:string;

  description:string;
  foundExcess:string;

  // URLS
  url: string;

  // LOADER
  dataLoaded: boolean = false;
  error = {flag:false, status:null, message:null};
  spinner = {flag:true, message:null};
  async = {cnt:1, completed:0}; // Number of async calls to load the view

  constructor(private nav: NavController, navParams: NavParams, private httpService: HttpService,
          private profileService: ProfileService, private utils: Utils) {

      console.log('\n\n| >>> +++++++++++++ ReposPage.constructor +++++++++++++++');
      console.log(navParams)
      this.user = navParams.get('user');
      this.username = navParams.get('username');
      this.trigger = (navParams.get('trigger') == null) ? 'affiliations-me-all': navParams.get('trigger');
      this.setURL();
      this.load();
  }


  setURL(){
      if(this.trigger == 'owned-me'){
          this.description = "Owned by Me";
          this.url = 'https://api.github.com/user/repos?type=owner';
      }
      else if(this.trigger == 'owned-user'){
          this.description = "Owned by: "+this.username;
          this.url = 'https://api.github.com/users/'+this.username+'/repos?type=owner';
      }
      else if(this.trigger == 'affiliations-me-all'){
          this.description = "My Affiliations";
          this.url = 'https://api.github.com/user/repos';
      }
      else if(this.trigger == 'starred-me'){
          this.description = "Starred by Me";
          this.url = 'https://api.github.com/user/starred';
      }
      else if(this.trigger == 'starred-user'){
          this.description = "Starred by: "+this.username;
          this.url = 'https://api.github.com/users/'+this.username+'/starred';
      }
      else if(this.trigger == 'watching-me'){ // Current user watching repos
        this.description = "I\'m Watching";
          this.url = 'https://api.github.com/user/subscriptions';
      }
      else if(this.trigger == 'user'){ // Current user watching repos
        this.description = "Repositories for: "+this.username;
          this.url = 'https://api.github.com/users/'+this.username+'/repos';
      }
      else if(this.trigger == 'search'){
          this.description = 'Search on: '+this.searchValue;
          this.url = 'https://api.github.com/search/repositories?q='+this.searchValue;
      }
      //else{ // A specific user's repos
      //    this.url = 'https://api.github.com/users/'+this.action+'/repos';
      //}
  }

  load(){
      var self = this;
      this.dataLoaded = false;
      this.async = {cnt:1, completed:0};
      this.error = {flag:false, status:null, message:null};
      this.spinner = {flag:true, message:null};

      var url = this.url;
      if(this.trigger == 'affiliations-me-all' && this.type != 'all' && this.url.indexOf('?') > -1)
          url = url+'&type='+this.type;
      else if(this.trigger == 'affiliations-me-all' && this.type != 'all')
          url = url+'?type='+this.type;
      //console.log("| >>> ReposPage.load: ", url);

      this.httpService.load(url, this.user)
      .then((data:any) => {
          //console.log('REPO DATA', data)
          this.pagination = this.utils.formatPagination(data.gm_pagination);
          this.lastPage = (this.pagination.lastPageNumber == null) ? this.lastPage : this.pagination.lastPageNumber;
          this.data.gm_pagination = data.gm_pagination;
          if(this.trigger == 'search'){
              this.data.items = data.items;
              this.data.total_count = data.total_count;
          }
          else{
              this.data.items = data;
              this.data.total_count = 0;
          }

          if(this.data.total_count <= (30 * this.lastPage) )
              this.foundExcess = null;
          else
              this.foundExcess = 'Found '+this.data.total_count.toLocaleString('en')+'; Viewable '+(30 * this.lastPage).toLocaleString('en')+'; Please narrow the search.';
          // Must follow above calcs or the math will fail
          this.data.total_count = this.data.total_count.toLocaleString('en');

          //console.log(this.data)
          this.asyncController(true, null);
      }).catch(error => {
          console.log('+++++++++++++++++++++++++++++++++', error)
          this.asyncController(null, error);
      });
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
              this.url = data.url;
              this.load();
           }
       });
      this.nav.present(modal);
  }

  presentActionSheet() {
      var self = this;
      let actionSheet = ActionSheet.create({
        title: 'Filter Repositories',
        buttons: [
          {
            text: 'Owned',
            handler: () => {
              this.trigger = 'owned-me';
              this.setURL();
              this.load();}
          },
          {
            text: 'Affiliations',
            handler: () => {
              this.trigger = 'affiliations-me-all';
              this.setURL();
              this.load();}
          },{
            text: 'Starred',
            handler: () => {
              this.trigger = 'starred-me';
              this.setURL();
              this.load();}
          },{
            text: 'Watching',
            handler: () => {
              this.trigger = 'watching-me';
              this.setURL();
              this.load();}
          },{
            text: 'Search',
            handler: () => {
                this.showSearchModal();
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
      this.nav.push(RepoDetailPage, {repo:item, user:this.user});
  }
}
