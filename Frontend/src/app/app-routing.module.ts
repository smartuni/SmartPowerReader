import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HomePageComponent} from './modules/home/pages/home-page.component';
import {LogInComponent} from './modules/login/log-in.component';

const routes: Routes = [
  {path: '', component: HomePageComponent},
  {path: '*', component: HomePageComponent},
  {path: 'login', component: LogInComponent},
  {path: '**', redirectTo: ''},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
