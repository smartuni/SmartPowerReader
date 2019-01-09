import {Component, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import * as fromRoot from 'store/reducers';
import {AutoUpdateAction} from 'store/actions/header';


@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

    constructor(private store: Store<fromRoot.State>) {
    }

    ngOnInit() {
    }


    onChangeUpdate(event) {
        this.store.dispatch(new AutoUpdateAction(event.checked));
    }
}
