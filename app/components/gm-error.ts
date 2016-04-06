import {Component, Input} from 'angular2/core';

@Component({
    selector: 'gm-error',
    template: `
      <div *ngIf="error.flag === true"
          class="error-box">{{error.status}} - {{error.message}}
      </div>`,
    directives: [],
    inputs:['error']
})

export class GmError {
    public error = {flag:false, message:null};
}
