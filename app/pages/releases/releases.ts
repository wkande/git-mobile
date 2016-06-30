import {Modal, NavController, NavParams, ActionSheet} from 'ionic-angular';
import {Component} from '@angular/core';
import {OnInit} from '@angular/core';
import {HttpService} from '../../providers/httpService.ts';
import {Utils} from '../../providers/utils.ts';
import {ReleaseDetailPage} from './releaseDetail';
import {GmError} from '../../components/gm-error';
import {GmSpinner} from '../../components/gm-spinner';
import {PageClass} from '../../extendables/page';


@Component({
  templateUrl: 'build/pages/releases/releases.html',
  providers: [HttpService, Utils],
  directives: [GmError, GmSpinner]
})


export class ReleasesPage extends PageClass{
  // PARAMS
  trigger: string;
  user:any;
  username:string;
  repo:any;
  // DATA
  data: any;
  pagination:any;
  lastPage = 0;
  description:string;
  // URLS
  url: string;


  constructor(private nav: NavController, navParams: NavParams, private httpService: HttpService,
         private utils: Utils) {
      super();
      console.log('\n\n| >>> +++++++++++++ ReleaasesPage.constructor +++++++++++++++');
      console.log(navParams)
      this.user = navParams.get('user');
      this.repo = navParams.get('repo');
      this.trigger = (navParams.get('trigger') == null) ? 'repo': navParams.get('trigger');
      this.setURL();
      this.load();
  }


  setURL(){
      //console.log('setURL', this.trigger)
      if (this.trigger == 'repo' ){
          this.description = this.repo.name;
          this.url = 'https://api.github.com/repos/'+this.repo.owner.login+'/'+this.repo.name+'/releases';
      }
  }


  load(){
      var self = this;
      this.startAsyncController(1, null);
      this.data = {}; // Jumps the view to the top
      this.httpService.load(this.url, this.user)
      .then((data:any) => {
          this.pagination = self.utils.formatPagination(data.gm_pagination);
          this.lastPage = (this.pagination.lastPageNumber != null) ? this.pagination.lastPageNumber: this.lastPage;
          this.data.gm_pagination = data.gm_pagination;

          this.data.items = data;
          this.data.items.forEach(function(item){
            item.published = (item.published_at == null) ? null : self.utils.formatDate(item.published_at);
          })
          this.asyncController(true, null);
      }).catch(error => {
          this.asyncController(null, error);
      });
  }


  // Load for pagination
  paginationLoad(url){
      this.url = url;//.split('github.com')[1];
      this.load();
  }


  itemTapped(event, item) {
    this.nav.push(ReleaseDetailPage, {user:this.user,
      repo: this.repo, release:item
    });
  }
}
