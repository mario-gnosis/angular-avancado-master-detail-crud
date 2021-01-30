import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { Category } from './category.model';
import { map, catchError, flatMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  [x: string]: any;

  private apiPath: string = "api/categories";

  constructor(private  http: HttpClient) {

   }

   getAll(): Observable<Category[]> {
     return this.http.get(this.apiPath).pipe(
       catchError(this.handleError),
       map(this.jsonDataToCategories)
     )
   }

   getById(id: number): Observable<Category> {
      const url =`${this.apiPath}/${id}`;
      return  this.http.get(url).pipe(
        catchError(this.handleError),
        map(this.jsonDataToCategory)
      )
   }

   create(category: Category): Observable<Category> {
    return this.http.post(this.apiPath, category).pipe(
      catchError(this.handleError),
      map(this.jsonDataToCategory)
    )
   }

   update(category: Category): Observable<Category> {
    const url =`${this.apiPath}/${category.id}`;
    return this.http.put(url, category).pipe(
      catchError(this.handleError),
      map(() => category)
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
   private jsonDataToCategories(jsonData: any[]): Category[] {
     const categories: Category[] = [];
     jsonData.forEach(element => categories.push(element as Category));
     return categories;
   }

   private handleError(error: any): Observable<any> {
     console.log("Error na aquisição", error);
     return throwError(error);
   }

   private jsonDataToCategory(jsonData: any): Category {
     return jsonData as Category;
   }
}
