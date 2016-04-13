import {Page, NavController, NavParams} from 'ionic-angular';
import {HttpService} from '../../providers/httpService.ts';
import {Utils} from '../../providers/utils.ts';
import {ProfilePage} from '../profile/profile';
import {GmError} from '../../components/gm-error';
import {GmSpinner} from '../../components/gm-spinner';

@Page({
  templateUrl: 'build/pages/issues/issueComments.html',
  providers: [HttpService, Utils],
  directives: [GmError, GmSpinner]
})
export class IssueCommentsPage {
  user:any;
  items: any;
  comment:any;
  issueTitle:string;


  // LOADER
  dataLoaded: boolean = false;
  error = {flag:false, status:null, message:null};
  spinner = {flag:true, message:null};
  async = {cnt:1, completed:0}; // Number of async calls to load the view

  constructor(private nav: NavController, navParams: NavParams, private httpService: HttpService, private utils: Utils) {
      console.log('IssueCommentsPage.constructor ++++++++++++++++++++++++++++++++++++++++');
      console.log(navParams);
      this.user = navParams.get('user');
      this.comment = navParams.get('comment');
      this.issueTitle = navParams.get('issueTitle');
      this.asyncController(true, null);
  }

  asyncController(success, error){
      if(this.error.flag) return;
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

  itemTapped(event, item) {
    console.log(item)
      if(item == "profile")
          this.nav.push(ProfilePage, {trigger:'user', user:this.user, username:this.comment.user.login});
  }

}
