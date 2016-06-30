import {NavController, NavParams} from 'ionic-angular';
import {Component} from '@angular/core';
import {HttpService} from '../../providers/httpService.ts';
import {Utils} from '../../providers/utils.ts';
import {GmError} from '../../components/gm-error';
import {GmSpinner} from '../../components/gm-spinner';
import {PageClass} from '../../extendables/page';

@Component({
  templateUrl: 'build/pages/gists/gistComments.html',
  providers: [HttpService, Utils],
  directives: [GmError, GmSpinner]
})
export class GistCommentsPage extends PageClass{
  user:any;
  items: any;
  url: string;
  description: string;

  constructor(private nav: NavController, navParams: NavParams, private httpService: HttpService, private utils: Utils) {
      super();
      console.log('GistCommentsPage.constructor ++++++++++++++++++++++++++++++++++++++++');
      console.log(navParams);
      this.user = navParams.get('user');
      this.url = navParams.get('url');
      this.description = navParams.get('gistName');
      this.load();
  }

  load() {
      var self = this;
      this.startAsyncController(1, null);
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
          this.asyncController(true, null);
      }).catch(error => {
          this.asyncController(null, error);
      });
  }


}
