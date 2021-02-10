import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Entry } from './entry.module';

@Injectable({
  providedIn: 'root'
})
export class EntryService {
  [x: string]: any;

  private apiPath: string = "api/entries";

  constructor(private  http: HttpClient) {

   }

   getAll(): Observable<entry[]> {
     return this.http.get(this.apiPath).pipe(
       catchError(this.handleError),
       map(this.jsonDataToEntres)
     )
   }

   getById(id: number): Observable<entry> {
      const url =`${this.apiPath}/${id}`;
      return  this.http.get(url).pipe(
        catchError(this.handleError),
        map(this.jsonDataToEntry)
      )
   }

   create(entry: Entry): Observable<entry> {
    return this.http.post(this.apiPath, entry).pipe(
      catchError(this.handleError),
      map(this.jsonDataToEntry)
    )
   }

   update(entry: Entry): Observable<entry> {
    const url =`${this.apiPath}/${entry.id}`;
    return this.http.put(url, entry).pipe(
      catchError(this.handleError),
      map(() => entry)
    )
   }

   detele(id: number): Observable<any> {
    const url =`${this.apiPath}/${id}`;
     return this.http.delete(url).pipe(
      catchError(this.handleError),
      map(() => null)
     )
   }

//PRIVATE METHODS
   private jsonDataToEntres(jsonData: any[]): Entry[] {
     const entries: Entry[] = [];
     jsonData.forEach(element => entries.push(element as Entry));
     return entries;
   }

   private handleError(error: any): Observable<any> {
     console.log("Error na aquisição", error);
     return throwError(error);
   }

   private jsonDataToEntry(jsonData: any): Entry {
     return jsonData as Entry;
   }
}