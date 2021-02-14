import { Entry } from './../shared/entry.module';
import { ActivatedRoute, Router } from '@angular/router';
import { AfterContentChecked, Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { switchMap } from 'rxjs/operators';
import toastr from "toastr";
import {Location} from '@angular/common';
import { EntryService } from '../shared/entry.service';

@Component({
  selector: 'app-entry-form',
  templateUrl: './entry-form.component.html',
  styleUrls: ['./entry-form.component.css']
})
export class EntryFormComponent implements OnInit, AfterContentChecked {

  currentAction: string;
  entryForm: FormGroup;
  pageTitle: string;
  serverErrorMessage: string[] = null;
  submitingForm =  false;
  entry: Entry = new Entry();

  constructor(
    private entryService: EntryService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private location: Location
  ) { }

  ngOnInit() {
    this.setCurrentAction();
    this.buildEntryForm();
    this.loadEntry();
  }

  ngAfterContentChecked() {
  this.setPageTitle();
  }

  submitForm() {
    this.submitingForm = true;
    if (this.currentAction == "new") {
        this.createEntry();
    } else {
        this.updateEntry();
    }
  }

  private setCurrentAction() {
    //verifica o seguimento da url ex: entries/new
    if (this.route.snapshot.url[0].path == "new") {
      this.currentAction = "new"
    } else {
      this.currentAction = "edit"
    }
    }

    private buildEntryForm() {
      this.entryForm = this.formBuilder.group({
        id: [null],
        name: [null, [Validators.required, Validators.minLength(2)]],
        description: [null],
        type: [null, [Validators.required]],
        amount: [null,[Validators.required]],
        date: [null, [Validators.required]],
        paid: [null, [Validators.required]],
        categoryId: [null, [Validators.required]]

      })
    }

    private loadEntry() {
      if (this.currentAction == 'edit') {
        this.route.paramMap.pipe(
          switchMap( params => this.entryService.getById(+params.get('id')))
        ).subscribe(
          (entry) => {
            this.entry = entry;
            this.entryForm.patchValue(entry); // binds loaded entry data to entryForm
          },
          (error) => alert('ocorreu um erro no servidor, tente mais tarde.')
        )
      }
    }

    private setPageTitle() {
      if (this.currentAction == 'new') {
        this.pageTitle = 'Cadastro de Novo Lançamnto';
      } else {
        const entryName = this.entry.name || ''
        this.pageTitle = 'Editando Lançamnto: ' + entryName;
      }
    }

    private createEntry() {
                      //Criar uma nova categoria e atribui a ela os valores que foram preenchidos
      const entry: Entry = Object.assign(new Entry(), this.entryForm.value);
      this.entryService.create(entry).subscribe(
        entry => this.actionsForSucess(entry),
        error => this.actionsForError(error)
      )
    }
    private updateEntry() {
      const entry: Entry = Object.assign(new Entry(), this.entryForm.value);

      this.entryService.update(entry).subscribe(
        entry => this.actionsForSucess(entry),
        error => this.actionsForError(error)
      )
    }

    private actionsForSucess(entry: Entry) {
      toastr.success("Solicitação processada com sucesso!");
                                             //navega sem deixar registro no histórico de navegação
      this.router.navigateByUrl("entries", {skipLocationChange: true}).then(
        //redirect/reload component page
        () => this.router.navigate(["entries", entry.id, "edit"])
      )
      this.location.back();
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