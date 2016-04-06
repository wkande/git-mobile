
import {Injectable} from 'angular2/core';


@Injectable()
export class Utils {

    constructor() {
    }

    formatPagination = function(value){
        var pagination = {next:null,first:null,last:null,prev:null,currPageNumber:null, lastPageNumber:null};
        var curr = 0;
        //console.log('++++++++++++++++++++++++START++++++++++++++++++++++++++')
        //console.log(value)
        if (value != null){
            var arr = value.split(",");
            for(var i=0; i<arr.length; i++){

                if( arr[i].indexOf('rel="next"') > -1 ){
                    //console.log('next')
                    pagination.next = arr[i].split(";")[0].replace('>','').replace('<','');
                    var arr2 = pagination.next.split('=');
                    pagination.currPageNumber = parseInt(arr2[arr2.length-1]) -1;
                    //pagination.currPageNumber = parseInt(pagination.next.split('=')[1])-1;
                }
                else if(arr[i].indexOf('rel="last"') > -1){
                    //console.log('last')
                    pagination.last = arr[i].split(";")[0].replace('>','').replace('<','');
                    var arr2 = pagination.last.split('=');
                    pagination.lastPageNumber = parseInt(arr2[arr2.length-1]);
                    //pagination.lastPageNumber = pagination.last.split('=')[1];
                }
                else if(arr[i].indexOf('rel="prev"') > -1){
                    //console.log('prev')
                    pagination.prev = arr[i].split(";")[0].replace('>','').replace('<','');
                    var arr2 = pagination.prev.split('=');
                    pagination.currPageNumber = parseInt( (arr2[arr2.length-1]) ) +1;
                    //pagination.currPageNumber = parseInt(pagination.prev.split('=')[1])+1;
                }
                else if(arr[i].indexOf('rel="first"') > -1){
                    //console.log('first')
                    pagination.first = arr[i].split(";")[0].replace('>','').replace('<','');
                }
            }
        }
        //console.log(pagination)
        //console.log('++++++++++++++++++++++++END++++++++++++++++++++++++++')
        return pagination;
    }

    formatDate = function(dateString){
      var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      var create = new Date(dateString);
      return months[create.getMonth()]+"-"+create.getDate()+"-"+create.getFullYear();
    }


    // http://www.sitepoint.com/calculate-twitter-time-tweet-javascript/
    timeAgo = function (datetime) {
        var tTime:any = new Date(datetime);
        var cTime:any = new Date();
        var sinceMin=Math.round((cTime-tTime)/60000);
        if(sinceMin==0)
        {
            var sinceSec=Math.round((cTime-tTime)/1000);
            if(sinceSec<10)
              var since='less than 10 seconds ago';
            else if(sinceSec<20)
              var since='less than 20 seconds ago';
            else
              var since='half a minute ago';
        }
        else if(sinceMin==1)
        {
            var sinceSec=Math.round((cTime-tTime)/1000);
            if(sinceSec==30)
              var since='half a minute ago';
            else if(sinceSec<60)
              var since='less than a minute ago';
            else
              var since='1 minute ago';
        }
        else if(sinceMin<45)
            var since=sinceMin+' minutes ago';
        else if(sinceMin>44&&sinceMin<60)
            var since='about 1 hour ago';
        else if(sinceMin<1440){
            var sinceHr=Math.round(sinceMin/60);
        if(sinceHr==1)
          var since='about 1 hour ago';
        else
          var since='about '+sinceHr+' hours ago';
        }
        else if(sinceMin>1439&&sinceMin<2880)
            var since='1 day ago';
        else
        {
            var sinceDay=Math.round(sinceMin/1440);
            var since=sinceDay+' days ago';
        }
        return since;

    }

}
