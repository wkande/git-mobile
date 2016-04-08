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
  items: any;
  url: string;
  gistName: string;

  dataLoaded: boolean = false;
  error = {flag:false, status:null, message:null};
  spinner = {flag:false, message:null};

  constructor(private nav: NavController, navParams: NavParams, private httpService: HttpService, private utils: Utils) {
      console.log('GistCommentsPage.constructor ++++++++++++++++++++++++++++++++++++++++');
      this.url = navParams.get('url');
      this.gistName = navParams.get('gistName');
  }

  onPageDidEnter() {
      console.log("GistCommentsPage.onPageDidEnter");
      if (!this.dataLoaded){ // Do not load on Back button since the Page is still in the DOM
          this.error.flag = false;
          this.spinner.flag = true;
          var self = this;
          this.httpService.load(this.url)
          .then((data:any) => {
              this.spinner.flag = false;
              if ('gmErrorCode' in data) {
                  this.error = {flag:true, message:data.message};
              }
              else{
                  this.items = data;
                  this.items.forEach(function(item){
                      item.created_at = self.utils.formatDate(item.created_at);
                      item.updated_at = self.utils.formatDate(item.updated_at);
                      //item.public = ((item.public == true) ?  'md-unlock' : 'md-lock');
                            self.httpService.mdToHtml(item.body.toString())
                            .then((data:any) => {
                                if ('gmErrorCode' in data) {
                                    ; // do nothing//this.error = {flag:true, message:data.message};
                                }
                                else{

                                    item.body = data._body.replace(/<p>/gi,"<br/><p>"); //var res = str.replace("Microsoft", "W3Schools");
                                    console.log('gistComment', item.body );
                                }
                            });
                  })
                  console.log('GistCommentsPage.onPageDidEnter.DATA-------------', data);
                  this.dataLoaded = true;
              }
          }, function(error) {
              self.error = {flag:true, message:error};
              self.spinner.flag = false;
          });
      }
  }

  loadMarkdown(item){
      this.httpService.mdToHtml(item.body.toString())
      .then((data:any) => {
          this.spinner.flag = false;
          if ('gmErrorCode' in data) {
              ; // do nothing//this.error = {flag:true, message:data.message};
          }
          else{
              item.body = data;
          }
      }, function(error) {
          //self.error = {flag:true, message:error};
          //self.spinner.flag = false;
      });

  }

}
