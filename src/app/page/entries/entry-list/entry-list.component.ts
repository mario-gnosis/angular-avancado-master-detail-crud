import { Component, OnInit } from '@angular/core';
import { Entry } from '../shared/entry.module';
import { EntryService } from '../shared/entry.service';


@Component({
  selector: 'app-category-list',
  templateUrl: './entry-list.component.html',
  styleUrls: ['./entry-list.css']
})
export class EntryListComponent implements OnInit {

  entries: Entry[] = [];

  constructor(private categoryService: EntryService) { }

  ngOnInit() {
    this.categoryService.getAll().subscribe(
      entries => this.entries = entries.sort((a,b) => b.id - a.id),
      error => alert('Erro ao carregar a lista')
      )
  }


  deleteEntry (entry) {
    const mustDelete = confirm('Deseja realmente excluir este item?');

    if (mustDelete) {
      this.categoryService.detele(entry.id).subscribe(
        () => this.entries = this.entries.filter(element => element != entry),
        () => alert("Error ao tentar excluir!")
      )
    }
  }

}
