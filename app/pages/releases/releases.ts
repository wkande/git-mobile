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
  data = {row:null, items:[], gm_pagination:null, next:null, published:null}; // TMP declarations prevent compile warnings
  pagination:any;
  lastPage = 0;
  description:string;
  // URLS
  url: string;


  constructor(private nav: NavController, navParams: NavParams, private httpService: HttpService,
         private utils: Utils) {
      super();
      this.user = navParams.get('user');
      this.repo = navParams.get('repo');
      this.trigger = (navParams.get('trigger') == null) ? 'repo': navParams.get('trigger');
      this.setURL();
      this.loadScrolling(null);
  }


  setURL(){
      //console.log('setURL', this.trigger)
      if (this.trigger == 'repo' ){
          this.description = this.repo.name;
          this.url = 'https://api.github.com/repos/'+this.repo.owner.login+'/'+this.repo.name+'/releases';
      }
  }


  loadScrolling(infiniteScroll){
      // Disable infiniteScroll if no more data
      if(infiniteScroll != null && this.data.next == null){
        console.log('setting scroll to complete')
          infiniteScroll.complete();
          return;
      }
      var self = this;

      // New load
      if(infiniteScroll == null){
          //this.data = {}; // Jumps the view to the top
          this.startAsyncController(1, null, false);
      }
      // InfiniteScroll load
      else{
          this.startAsyncController(1, null, true);
          this.url = this.data.next;
      }

      this.httpService.load(this.url, this.user)
      .then((data:any) => {
          // Pagination, need last page number
          this.pagination = this.utils.formatPagination(data.gm_pagination);
          this.data.next = this.pagination.next;
          this.lastPage = (this.pagination.lastPageNumber == null) ? this.lastPage : this.pagination.lastPageNumber;
          this.data.gm_pagination = data.gm_pagination;

          //this.data.items = data;

          // Populate items
          var row = this.data.items.length;
          for(var i=0; i< data.length; i++){
              data[i].row = row++;
              data[i].published = (data[i].published_at == null) ? null : self.utils.formatDate(data[i].published_at);
              this.data.items.push(data[i]);
          }

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


  itemTapped(event, item) {
    this.nav.push(ReleaseDetailPage, {user:this.user,
      repo: this.repo, release:item
    });
  }
}
