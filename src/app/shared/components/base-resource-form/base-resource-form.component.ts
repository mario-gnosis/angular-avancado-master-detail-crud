import { BaseResourceModel } from 'src/app/shared/models/base-resource.model';
import { ActivatedRoute, Router } from '@angular/router';
import { AfterContentChecked, OnInit, Injector } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { switchMap } from 'rxjs/operators';
import toastr from "toastr";
import {Location} from '@angular/common';
import { BaseResourceService } from '../../services/base-resource.service';


export abstract class BaseResourceFormComponent<T extends BaseResourceModel> implements OnInit, AfterContentChecked {

  currentAction: string;
  resourceForm: FormGroup;
  pageTitle: string;
  serverErrorMessage: string[] = null;
  submitingForm =  false;

  protected route: ActivatedRoute;
  protected router: Router;
  protected formBuilder: FormBuilder;

  constructor(
    protected injector: Injector,
    public resource: T, // new Resource()
    protected resourceService: BaseResourceService<T>,
    protected jsonDataToResourceFn: (jsonData) => T
  ) {
    this.route =  this.injector.get(ActivatedRoute);
    this.router =  this.injector.get(Router);
    this.formBuilder =  this.injector.get(FormBuilder);
   }

  ngOnInit() {
    this.setCurrentAction();
    this.buildResourceForm();
    this.loadResource();
  }

  ngAfterContentChecked() {
  this.setPageTitle();
  }

  submitForm() {
    this.submitingForm = true;
    if (this.currentAction == "new") {
        this.createResource();
    } else {
        this.updateResource();
    }
  }

  protected setCurrentAction() {
    //verifica o seguimento da url ex: categories/new
    if (this.route.snapshot.url[0].path == "new") {
      this.currentAction = "new"
    } else {
      this.currentAction = "edit"
    }
    }

    protected loadResource() {
      if (this.currentAction == 'edit') {
        this.route.paramMap.pipe(
          switchMap( params => this.resourceService.getById(+params.get('id')))
        ).subscribe(
          (resource) => {
            this.resource = resource;
            this.resourceForm.patchValue(resource); // binds loaded resource data to ResourceForm
          },
          (error) => alert('ocorreu um erro no servidor, tente mais tarde.')
        )
      }
    }

    protected setPageTitle() {
      if (this.currentAction == 'new') {
        this.pageTitle = this.creationPageTitle();
      } else {
        this.pageTitle = this.editionPageTitle();
      }
    }

    protected creationPageTitle(): string {
      return "Novo"
    }

    protected editionPageTitle(): string {
      return "Edição"
    }

    protected createResource() {
                      //Criar uma nova categoria e atribui a ela os valores que foram preenchidos
      const resource: T = this.jsonDataToResourceFn(this.resourceForm.value);
      this.resourceService.create(resource).subscribe(
        resource => this.actionsForSucess(resource),
        error => this.actionsForError(error)
      )
    }
    protected updateResource() {
      const resource: T = this.jsonDataToResourceFn(this.resourceForm.value);

      this.resourceService.update(resource).subscribe(
        resource => this.actionsForSucess(resource),
        error => this.actionsForError(error)
      )
    }

    protected actionsForSucess(resource: T) {
      toastr.success("Solicitação processada com sucesso!");
      const baseComponentPath: string = this.route.snapshot.parent.url[0].path;
                                             //navega sem deixar registro no histórico de navegação
      this.router.navigateByUrl(baseComponentPath, {skipLocationChange: true}).then(
        //redirect/reload component page
        () => this.router.navigate([baseComponentPath, resource.id, "edit"])
      )
    }

    protected actionsForError(error) {
      toastr.error("Ocorreu erro ao processar sua solicitação!");
      this.submitingForm = false;
      if (error.status === 422) {
        this.serverErrorMessage = JSON.parse(error._body).errors;
      } else {
        this.serverErrorMessage = ["Falha na comunicação com o servidor. Por favor tente mais tarde."]
      }
    }

    protected abstract buildResourceForm(): void;
}
