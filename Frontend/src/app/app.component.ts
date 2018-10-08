import {Component, OnInit} from '@angular/core';
import {ModalService} from './shared/services/modal.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Smart Power Reader';

  isOnHomepage: boolean;

  constructor(private modalService: ModalService,
              private router: Router) {

  }

  ngOnInit(): void {
    this.router.events.subscribe(val => {
      this.isOnHomepage = this.router.url === '/';
    });
  }

  closeModal() {
    this.modalService.destroy();
  }
}
