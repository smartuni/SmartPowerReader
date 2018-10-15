import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {catchError, tap} from 'rxjs/operators';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {LOCAL_STORAGE_AUTH_TOKEN} from '../constants/constants';
import {environment} from '../../../environments/environment';
import {User} from '../interfaces/user.interface';

@Injectable({providedIn: 'root'})
export class AuthService {
  authUser: User;
  fetched = false;
  authU: BehaviorSubject<any> = new BehaviorSubject(null);
  getAuthUser = this.authU.asObservable();

  constructor(private httpClient: HttpClient) {

  }

  isAuthenticated() {
    return this.authUser != null;
  }

  checkPass(email: string, password: string): Observable<boolean> {
    return this.httpClient.post<any>(`${environment.tokenApi}`, null, {
      params: new HttpParams().set('username', email)
        .set('password', password)
        .set('grant_type', 'password')
        .set('client_id', 'acme')
        .set('client_secret', 'acmesecret')
    }).pipe(
      tap(r => {
        // console.log('response', r);
        return r === null;
      }),
      catchError(this.handleError('login', null))
    );
  }


  login(email: string, password: string): Observable<any> {
    const options = {};
    return this.httpClient.post<any>(`${environment.tokenApi}`, null, {
      params: new HttpParams().set('username', email)
        .set('password', password)
        .set('grant_type', 'password')
        .set('client_id', 'acme')
        .set('client_secret', 'acmesecret')
    }).pipe(
      tap(r => {
        if (r === null) {
          // console.log('login failed');
          localStorage.removeItem(LOCAL_STORAGE_AUTH_TOKEN);
          delete this.authUser;
          this.fetched = true;
          return false;
        } else {
          // console.log('success', r);
          localStorage.setItem(LOCAL_STORAGE_AUTH_TOKEN, r.access_token);
          this.getUserData();
          return true;
        }
      }),
      catchError(this.handleError('login', null))
    );
  }

  getToken() {
    return localStorage.getItem(LOCAL_STORAGE_AUTH_TOKEN);
  }

  fetchUser() {
    // console.log('fetching with token: ', this.getToken());
    return this.httpClient.get(`${environment.authApi}/me`);
  }

  getUserData() {
    const token = this.getToken();
    if (token == null) {
      return null;
    }
    this.fetchUser().subscribe(r => {
      if (r != null) {
        this.authUser = r;
        this.fetched = true;
        // console.log('user', r);
        this.authU.next(this.authUser);
        // console.log('user', this.authUser);
        return this.authUser;
      }
    }, () => {
      this.logout();
    });
  }

  logout() {
    localStorage.removeItem(LOCAL_STORAGE_AUTH_TOKEN);
    delete this.authUser;
    this.authU.next(null);

  }

  performAutoLogin() {
    const token = this.getToken();
    if (token === null) {
      return;
    }
    this.authUser = this.getUserData();
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      // console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      // console.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

}
