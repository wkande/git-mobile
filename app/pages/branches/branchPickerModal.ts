import {Page, Modal, NavParams, ViewController} from 'ionic-angular';
import {HttpService} from '../../providers/httpService.ts';
import {GmError} from '../../components/gm-error';
import {GmSpinner} from '../../components/gm-spinner';

@Page({
  templateUrl: 'build/pages/branches/branchPickerModal.html',
  providers: [HttpService],
  directives: [GmError, GmSpinner]
})
export default class BranchPickerModal {
    user:any;
    searchBranches: string;
    searchTags: string;
    branches: any;
    tags: any;
    branchItems: any;
    tagItems: any;
    segmentPane: string;
    repo: any;
    urlTags: string;
    urlBranches: string;
    loadedTags: boolean = false;
    loadedBranches: boolean = false;

    dataLoaded: boolean = false;
    error = {flag:false, status:null, message:null};
    spinner = {flag:false, message:null};
    async = {cnt:2, completed:0}; // Number of async calls to load the view

    constructor(private viewCtrl: ViewController, navParams: NavParams, private httpService: HttpService) {
        //console.log('\n\n| >>> +++++++++++++ BranchPickerModal.constructor +++++++++++++++');
        this.searchBranches = '';
        this.searchTags = '';
        this.segmentPane = 'branches';
        //console.log(navParams);
        this.repo = navParams.get('repo');
        this.user = navParams.get('user');
        this.urlTags = 'https://api.github.com/repos/'+this.repo.owner.login+'/'+this.repo.name+'/tags';
        this.urlBranches = 'https://api.github.com/repos/'+this.repo.owner.login+'/'+this.repo.name+'/branches';
        this.loadTags();
        this.loadBranches();
    }


    loadTags() {
        this.httpService.load(this.urlTags, this.user)
        .then((data:any) => {
            this.tags = data;
            this.tagItems = data;
            this.loadedTags = true;
            this.asyncController(true, null);
        }).catch(error => {
            this.asyncController(null, error);
        });
    }

    loadBranches() {
        this.httpService.load(this.urlBranches, this.user)
        .then((data:any) => {
            this.branches = data;
            this.branchItems = data;
            this.loadedBranches = true;
            this.asyncController(true, null);
        }).catch(error => {
            this.asyncController(null, error);
        });
    }


    getBranchItems(searchbar) {
        //console.log(searchbar)
        // Reset items back to all of the items
        this.branchItems = this.branches;

        // set q to the value of the searchbar
        var q = searchbar.value;

        // if the value is an empty string don't filter the items
        if (q.trim() == '') {
          return;
        }

        this.branchItems = this.branchItems.filter((v) => {
          //console.log(v.name);
          if (v.name.toLowerCase().indexOf(q.toLowerCase()) > -1) {
            return true;
          }
          return false;
        })
    }

    getTagItems(searchbar) {
        // Reset items back to all of the items
        this.tagItems = this.tags;
        // set q to the value of the searchbar
        var q = searchbar.value;
        // if the value is an empty string don't filter the items
        if (q.trim() == '') {
          return;
        }
        this.tagItems = this.tagItems.filter((v) => {
          if (v.name.toLowerCase().indexOf(q.toLowerCase()) > -1) {
            return true;
          }
          return false;
        })
    }

    itemSelected(item){
      let data = { 'ref': item.name };
      this.viewCtrl.dismiss(data);
    }

    dismiss() {
       let data = { 'ref': 'canceled' };
       this.viewCtrl.dismiss(data);
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
