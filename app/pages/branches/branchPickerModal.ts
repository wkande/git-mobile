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

    error = {flag:false, message:null};
    spinner = {flag:false, message:null};

    constructor(private viewCtrl: ViewController, navParams: NavParams, private httpService: HttpService) {
        this.searchBranches = '';
        this.searchTags = '';
        this.segmentPane = 'branches';
        console.log('repo', navParams.get('repo'));
        this.repo = navParams.get('repo');
        // GET /repos/:owner/:repo/tags
        // GET /repos/:owner/:repo/branches
        this.urlTags = 'https://api.github.com/repos/'+this.repo.owner+'/'+this.repo.name+'/tags';
        this.urlBranches = 'https://api.github.com/repos/'+this.repo.owner+'/'+this.repo.name+'/branches';
    }

    onPageDidEnter() {
        console.log("BranchPickerModal.onPageDidEnter");
        this.error.flag = false;
        this.spinner.flag = true;
        var self = this;
        this.httpService.load(this.urlTags)
        .then((data:any) => {
            this.spinner.flag = false;
            //console.log('DATA TAGS >>>',data)
            if ('gmErrorCode' in data) {
                this.error = {flag:true, message:data.message};
            }
            else{
                this.tags = data;
                this.tagItems = data;
                this.loadedTags = true;
            }
        }, function(error) {
            //console.log('BranchPickerModal.onPageDidEnter.ERROR.tags', error);
            self.error = {flag:true, message:error};
            self.spinner.flag = false;
        });
        this.httpService.load(this.urlBranches)
        .then((data:any) => {
            this.spinner.flag = false;
            //console.log('DATA BRANCHES >>>',data)
            if ('gmErrorCode' in data) {
                this.error = {flag:true, message:data.message};
            }
            else{
                this.branches = data;
                this.branchItems = data;
                this.loadedBranches = true;
            }
        }, function(error) {
            //console.log('BranchPickerModal.onPageDidEnter.BRANCHES.tags', error);
            self.error = {flag:true, message:error};
            self.spinner.flag = false;
        });
    }


    getBranchItems(searchbar) {
        console.log(searchbar)
        // Reset items back to all of the items
        this.branchItems = this.branches;

        // set q to the value of the searchbar
        var q = searchbar.value;

        // if the value is an empty string don't filter the items
        if (q.trim() == '') {
          return;
        }

        this.branchItems = this.branchItems.filter((v) => {
          console.log(v.name);
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
}
