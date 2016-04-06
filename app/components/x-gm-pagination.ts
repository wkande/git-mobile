import {Component, Input} from 'angular2/core';

@Component({
    selector: 'gm-pagination',
    template: `<ion-toolbar position="bottom">
        <ion-buttons start>
            <button [disabled]="!pagination.first" [class._lightgray]="!pagination.first" (click)="getFirstPage()" style="width:46px;">
              <ion-icon name="ios-arrow-back-outline" style="font-size:22pt"></ion-icon><ion-icon name="ios-arrow-back-outline" style="font-size:22pt"></ion-icon>
            </button>
            <button [disabled]="!pagination.prev" [class._lightgray]="!pagination.prev" (click)="getPreviousPage()" style="width:46px;">
              <ion-icon name="ios-arrow-back-outline"></ion-icon>
            </button>
        </ion-buttons>
        <ion-title>{{pagination.currPageNumber}} of {{lastPage}}</ion-title>
        <ion-buttons end>
            <button [disabled]="!pagination.next" [class._lightgray]="!pagination.next" (click)="getNextPage()" style="width:46px;">
              <ion-icon name="ios-arrow-forward-outline"></ion-icon>
            </button>
            <button [disabled]="!pagination.last" [class._lightgray]="!pagination.last" (click)="getLastPage()" style="width:46px;">
              <ion-icon name="ios-arrow-forward-outline" style="font-size:22pt"></ion-icon><ion-icon name="ios-arrow-forward-outline" style="font-size:22pt"></ion-icon>
            </button>
        </ion-buttons>
    </ion-toolbar>`,
    directives: [],
    inputs:['pagination', 'lastPage']
})

export class GmPagination {
    public pagination = {first:null, prev:null, next:null, last:null, lastPageNumber:null, currPageNumber:null};
}
