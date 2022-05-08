import {Component, ElementRef, HostListener, OnInit} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent{

  @HostListener('window:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    this.key = event.key;
    if(this.selected.length){
      const cellObj = this.map[this.selected[0]][this.selected[1]]
      cellObj.editable && this.regExpNumbersOnly.test(this.key) ? cellObj.value = this.key: 0
    }
  }

  @HostListener('window:keydown.backspace', ['$event'])
  handleBackSpace(event: KeyboardEvent) {
    if(this.selected.length){
      this.map[this.selected[0]][this.selected[1]].value = 0
    }

  }
  key:any
  title = 'sudoku';
  constructor(private elementRef: ElementRef) {
    this.mapBuilder()
  }

  regExpNumbersOnly =/^\d+$/;

  selected: number[] = []

  cell = {
    value: 0,
    pencilMarks: [],
    note: '',
    editable: true,
    selected: true,
    inScope: false
  }

  map:any = []

  template = [
    [2,0,0, 5,4,9, 0,0,6],
    [0,0,0, 0,0,7, 0,0,0],
    [0,0,9, 6,2,0, 4,0,0],

    [7,1,0, 0,0,0, 6,0,5],
    [9,0,6, 0,0,0, 7,0,3],
    [5,0,3, 0,0,0, 0,1,9],

    [0,0,7, 0,5,1, 8,0,0],
    [0,0,0, 4,0,0, 0,0,0],
    [4,0,0, 8,9,3, 0,0,1],
  ]

  mapBuilder = () => {
    this.map = this.template.map((row)=>{
      return row.map((item)=> {
        return {
          value: item,
          pencilMarks: [],
          note: '',
          editable: item === 0,
          selected: false,
          inScope: false
        }
      })
    })
  }


  clickCell = (e:any) => {
    const element = (e.target as HTMLElement)
    const row = element.attributes[3].value
    const col = element.attributes[4].value
    let prevCell:any = this.selected
    this.selected = [+row, +col]

    if(prevCell.length){
      this.toggleSelect(prevCell[0], prevCell[1])
    }

    this.toggleSelect(+row, +col)

    if(prevCell[0] === +row && prevCell[1] ===+col){
      this.toggleSelect(+row, +col)
      this.selected = []
    }
  }

  toggleSelect = (row:number, col:number) => {
    this.map[+row][+col].selected = !this.map[+row][+col].selected;
    this.getScopeRow(this.map, +row)
    this.getScopeCol(this.map, +col)
  }

  getScopeRow = (map: any, row: number) => {
    this.map[row] = map[+row].map((item:any)=> {
      return {...item, inScope:  !item.inScope}
    })
  }
  getScopeCol = (map: any, col: number) => {
    map.map((row:any)=> {
      return row[col] = {...row[col], inScope:  !row[col].inScope}
    })
  }


}
