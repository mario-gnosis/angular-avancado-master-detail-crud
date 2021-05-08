import { CategoryService } from './../../categories/shared/category.service';
import { Injectable, Injector } from '@angular/core';
import { Entry } from './entry.module';
import { BaseResourceService } from 'src/app/shared/services/base-resource.service';
import { catchError, flatMap, map } from 'rxjs/operators';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class EntryService extends BaseResourceService<Entry>{

  constructor(
    protected  injector: Injector,
    private categoryService: CategoryService
    ) {
     super("api/entries", injector, Entry.newFromJson); //Entry.newFromJson não executa a função, senão que amazenando os comando q são executados dentro do objeto jsonDataToResourceFn
   }

   create(entry: Entry): Observable<Entry> {
  return this.setCategoryAndSendToServer(entry, super.create.bind(this) );
   }

   update(entry: Entry): Observable<Entry> {
    return this.setCategoryAndSendToServer(entry, super.update.bind(this));
   }

   private setCategoryAndSendToServer(entry: Entry, sendFn: any): Observable<Entry> {
          //o flatMap vai achatar o Observable para retornar um Observable<Entry>, senão seria Observable<Observable<Entry>>
    return this.categoryService.getById(entry.categoryId).pipe(
      flatMap(category => {
        entry.category =  category;
        return sendFn(entry)
      }),
      catchError(this.handleError)
    );

   }

}
