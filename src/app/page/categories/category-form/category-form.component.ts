import { ActivatedRoute, Router } from '@angular/router';
import { AfterContentChecked, Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { Category } from '../shared/category.model';
import { CategoryService } from '../shared/category.service';
import { switchMap } from 'rxjs/operators';
import toastr from "toastr";

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.css']
})
export class CategoryFormComponent implements OnInit, AfterContentChecked {

  currentAction: string;
  categoryForm: FormGroup;
  pageTitle: string;
  serverErrorMessage: string[] = null;
  submitingForm =  false;
  category: Category = new Category();

  constructor(
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit() {
    this.setCurrentAction();
    this.buildCategoryForm();
    this.loadCategory();
  }

  ngAfterContentChecked() {
  this.setPageTitle();
  }

  submitForm() {
    this.submitingForm = true;
    if (this.currentAction == "new") {
        this.createCategory();
    } else {
        this.updateCategory();
    }
  }

  private setCurrentAction() {
    //verifica o seguimento da url ex: categories/new
    if (this.route.snapshot.url[0].path == "new") {
      this.currentAction = "new"
    } else {
      this.currentAction = "edit"
    }
    }

    private buildCategoryForm() {
      this.categoryForm = this.formBuilder.group({
        id: [null],
        name: [null, [Validators.required, Validators.minLength(2)]],
        description: [null]
      })
    }

    private loadCategory() {
      if (this.currentAction == 'edit') {
        this.route.paramMap.pipe(
          switchMap( params => this.categoryService.getById(+params.get('id')))
        ).subscribe(
          (category) => {
            this.category = category;
            this.categoryForm.patchValue(category); // binds loaded category data to categoryForm
          },
          (error) => alert('ocorreu um erro no servidor, tente mais tarde.')
        )
      }
    }

    private setPageTitle() {
      if (this.currentAction == 'new') {
        this.pageTitle = 'Cadastro de Nova Categoria';
      } else {
        const categoryName = this.category.name || ''
        this.pageTitle = 'Editando Categoria: ' + categoryName;
      }
    }

    private createCategory() {
                      //Criar uma nova categoria e atribui a ela os valores que foram preenchidos
      const category: Category = Object.assign(new Category(), this.categoryForm.value);
      this.categoryService.create(category).subscribe(
        category => this.actionsForSucess(category),
        error => this.actionsForError(error)
      )
    }
    private updateCategory() {
      const category: Category = Object.assign(new Category(), this.categoryForm.value);

      this.categoryService.update(category).subscribe(
        category => this.actionsForSucess(category),
        error => this.actionsForError(error)
      )
    }

    private actionsForSucess(category: Category) {
      toastr.success("Solicitação processada com sucesso!");
                                             //navega sem deixar registro no histórico de navegação
      this.router.navigateByUrl("categories", {skipLocationChange: true}).then(
        //redirect/reload component page
        () => this.router.navigate(["categories", category.id, "edit"])
      )
    }

    private actionsForError(error) {
      toastr.error("Ocorreu erro ao processar sua solicitação!");
      this.submitingForm = false;
      if (error.status === 422) {
        this.serverErrorMessage = JSON.parse(error._body).errors;
      } else {
        this.serverErrorMessage = ["Falha na comunicação com o servidor. Por favor tente mais tarde."]
      }
    }
}
