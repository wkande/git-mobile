import {Component, Input} from '@angular/core';

@Component({
    selector: 'gm-error',
    template: `
      <div *ngIf="error.flag === true"
          class="error-box">
          <div class="_center-text">
          <span class="octicon octicon-megaphone" style="font-size:20pt;margin-right:10px;"></span>
          <span style="font-size:x-large;">Aw, Snap</span>
          </div>
          <hr/>
          <p class="_gray">Well something snapped. Try again by going back or using the menu to return to this page.</p>
          <hr/>
          {{error.status}} - {{error.message}}
      </div>`,
    directives: [],
    inputs:['error']
})

export class GmError {
    public error = {flag:false, status:null, message:null};
}
