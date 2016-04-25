import {Page, NavController, NavParams} from 'ionic-angular';
import {HttpService} from '../../providers/httpService.ts';
import {Utils} from '../../providers/utils.ts';
import {ProfilePage} from '../profile/profile';
import {GmError} from '../../components/gm-error';
import {GmSpinner} from '../../components/gm-spinner';

@Page({
  templateUrl: 'build/pages/releases/releaseDetail.html',
  providers: [HttpService, Utils],
  directives: [GmError, GmSpinner]
})
export class ReleaseDetailPage {

  // PARAMS
  repo: any;
  release:any;
  user:any;

  // DATA
  releaseBody:string;

  // URLS
  url: string;

  // LOADER
  dataLoaded: boolean = false;
  error = {flag:false, status:null, message:null};
  spinner = {flag:true, message:null};
  async = {cnt:2, completed:0}; // Number of async calls to load the view

  constructor(private nav: NavController, navParams: NavParams, private httpService: HttpService,
        private utils: Utils) {
      console.log('\n\n| >>> +++++++++++++ ReleaseDetailPage.constructor +++++++++++++++');
      console.log(navParams)

      this.user = navParams.get('user');
      this.repo = navParams.get('repo');
      this.release = navParams.get('release');
      this.releaseBody = this.release.body;
      this.url = 'https://api.github.com/repos/'+this.repo.owner.login+'/'+this.repo.name+'/releases/'+this.release.id;
  }


  ngOnInit() {
      this.load();
      this.loadMD()
  }


  load(){
      //console.log("| >>> ReleasePage.load: ", this.url);
      this.httpService.load(this.url, this.user)
      .then((data:any) => {
          //console.log(data)
          this.release = data;
          this.release.created_at = this.utils.formatDate(this.release.created_at);
          this.release.published_at = (this.release.published_at == null) ? 'Draft' : this.utils.formatDate(this.release.published_at);
          this.release.draft = (this.release.draft == null) ? null : 'Draft';
          this.release.prerelease = (this.release.prerelease == null) ? null : 'Pre-release';
          this.release.tag_name = (this.release.tag_name == null) ? 'Draft' : this.release.tag_name;
          this.asyncController(true, null);
      }).catch(error => {
          this.asyncController(null, error);
      });
  }

  loadMD(){
      //console.log("| >>> ReleasePage.loadMD: ", this.url);
      this.httpService.mdToHtml(this.releaseBody, this.user)
      .then((data:any) => {
          //console.log(data)
          this.releaseBody = data._body;
          this.asyncController(true, null);
      }).catch(error => {
          this.asyncController(null, error);
      });
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
      //console.log('item', item)
      if(item == 'profile'){
          this.nav.push(ProfilePage, {trigger:'user', user:this.user, username:this.release.author.login}  );
      }

  }
}
