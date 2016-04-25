import {Page, NavController, NavParams} from 'ionic-angular';
import {HttpService} from '../../providers/httpService.ts';
import {Utils} from '../../providers/utils.ts';
import {GmError} from '../../components/gm-error';
import {GmSpinner} from '../../components/gm-spinner';

@Page({
  templateUrl: 'build/pages/gists/gistComments.html',
  providers: [HttpService, Utils],
  directives: [GmError, GmSpinner]
})
export class GistCommentsPage {
  user:any;
  items: any;
  url: string;
  description: string;

  // LOADER
  dataLoaded: boolean = false;
  error = {flag:false, status:null, message:null};
  spinner = {flag:true, message:null};
  async = {cnt:1, completed:0}; // Number of async calls to load the view

  constructor(private nav: NavController, navParams: NavParams, private httpService: HttpService, private utils: Utils) {
      console.log('GistCommentsPage.constructor ++++++++++++++++++++++++++++++++++++++++');
      console.log(navParams);
      this.user = navParams.get('user');
      this.url = navParams.get('url');
      this.description = navParams.get('gistName');
      this.load();
  }

  load() {
      //console.log("GistCommentsPage.load");
      var self = this;
      this.httpService.load(this.url, this.user)
      .then((data:any) => {
          this.items = data;
          this.items.forEach(function(item){
              item.created_at = self.utils.formatDate(item.created_at);
              item.updated_at = self.utils.formatDate(item.updated_at);
              //item.public = ((item.public == true) ?  'md-unlock' : 'md-lock');
              self.httpService.mdToHtml(item.body.toString(), self.user)
              .then((data:any) => {
                  item.body = data._body.replace(/<p>/gi,"<br/><p>"); //var res = str.replace("Microsoft", "W3Schools");
                  console.log('gistComment', item.body );
              });
          })
          //console.log('GistCommentsPage.load.DATA-------------', data);
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

}
