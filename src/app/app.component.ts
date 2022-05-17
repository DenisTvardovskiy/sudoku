import {Component, ElementRef, HostListener, OnInit} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  @HostListener('window:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    this.key = event.key;
    if (this.selected.length) {
      const cellObj = this.map[this.selected[0]][this.selected[1]]
      cellObj.editable && this.regExpNumbersOnly.test(this.key) ? cellObj.value = this.key : 0
    }
  }

  @HostListener('window:keydown.backspace', ['$event'])
  handleBackSpace(event: KeyboardEvent) {
    if (this.selected.length) {
      this.map[this.selected[0]][this.selected[1]].value = 0
    }

  }

  key: any
  title = 'sudoku';
  numArray = [1, 2, 3, 4, 5, 6, 7, 8, 9]
  counter = 0
  blankBoard = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0]
  ]
  playBoard: number[][] = []
  result: any = []
  solvedBoard: any = []


  constructor(private elementRef: ElementRef) {

    // this.generateSudoku()
    this.result = this.newStartingBoard(28)
    this.playBoard = this.result[1]
    this.solvedBoard = this.solvedBoard[2]

    if(this.playBoard.length){
      this.mapBuilder()
    }
  }


  regExpNumbersOnly = /^\d+$/;

  selected: number[] = []

  cell = {
    value: 0,
    pencilMarks: [],
    note: '',
    editable: true,
    selected: true,
    inScope: false
  }

  map: any = []


  mapBuilder = () => {
    this.map = this.playBoard.map((row) => {
      return row.map((item) => {
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


  clickCell = (e: any) => {
    const element = (e.target as HTMLElement)
    const row = element.attributes[3].value
    const col = element.attributes[4].value
    let prevCell: any = this.selected
    this.selected = [+row, +col]

    if (prevCell.length) {
      this.toggleSelect(prevCell[0], prevCell[1])
    }

    this.toggleSelect(+row, +col)

    if (prevCell[0] === +row && prevCell[1] === +col) {
      this.toggleSelect(+row, +col)
      this.selected = []
    }
  }

  toggleSelect = (row: number, col: number) => {
    this.map[+row][+col].selected = !this.map[+row][+col].selected;
    this.getScopeRow(this.map, +row)
    this.getScopeCol(this.map, +col)
  }

  getScopeRow = (map: any, row: number) => {
    this.map[row] = map[+row].map((item: any) => {
      return {...item, inScope: !item.inScope}
    })
  }
  getScopeCol = (map: any, col: number) => {
    map.map((row: any) => {
      return row[col] = {...row[col], inScope: !row[col].inScope}
    })
  }

  // check if value is safe for row
  rowSafe = (puzzleArray: any[], emptyCell: IEmptyCell, num: number) => {
    return puzzleArray[emptyCell.rowIndex].indexOf(num) == -1
  }

  // check if value is safe for col
  colSafe = (puzzleArray: any[], emptyCell: IEmptyCell, num: number) => {
    return !puzzleArray.some(row => row[emptyCell.colIndex] == num)
  }

  // check if value is safe for box
  boxSafe = (puzzleArray: any[], emptyCell: IEmptyCell, num: number) => {
    //Define left top corner of box region for empty cell
    const boxStartRow = emptyCell.rowIndex - (emptyCell.rowIndex % 3)
    const boxStartCol = emptyCell.colIndex - (emptyCell.colIndex % 3)
    let safe = true

    for (let boxRow of [0, 1, 2]) { //Each box region has 3 rows
      for (let boxCol of [0, 1, 2]) { //Each box region has 3 cols
        // check if number is in the region
        if (puzzleArray[boxStartRow + boxRow][boxStartCol + boxCol] == num) {
          safe = false
        }
      }
    }
    return safe
  }

  // Check if number is safe to place according to 3 parameters
  safeToPlace = (puzzleArray: any[], emptyCell: IEmptyCell, num: number) => {
    return this.rowSafe(puzzleArray, emptyCell, num) &&
      this.colSafe(puzzleArray, emptyCell, num) &&
      this.boxSafe(puzzleArray, emptyCell, num)
  }

  nextEmptyCell = (puzzleArray: any) => {
    const emptyCell = {rowIndex: '', colIndex: ''}

    puzzleArray.forEach( (row:any, rowIndex:any) => {
      if (emptyCell.colIndex !== "" ) return // If this key has already been assigned, skip iteration
      let firstZero = row.find( (col:any) => col === 0) // find first zero-element
      if (firstZero === undefined) return; // if no zero present, skip to next row
      emptyCell.rowIndex = rowIndex
      emptyCell.colIndex = row.indexOf(firstZero)
    })

    if (emptyCell.colIndex !== "" ) return emptyCell
    // If emptyCell was never assigned, there are no more zeros
    return false
  }

  shuffle = (array: any[]) => {
    let newArray = [...array]

    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]]
    }
    return newArray
  }

  fillPuzzle = (startingBoard: any) => {
    const emptyCell: any = this.nextEmptyCell(startingBoard)

    if (!emptyCell) return startingBoard


    for (let num of this.shuffle(this.numArray)) {
      this.counter++
      //abort this attempt and restart if backtracking  takes to long
      if (this.counter > 20_000_000) throw new Error("Recursion Timeout")

      // If safe to place number, place it
      if (this.safeToPlace(startingBoard, emptyCell, num)) {
        startingBoard[emptyCell.rowIndex][emptyCell.colIndex] = num

        // Recursively call the fill function to place num in next empty cell
        if (this.fillPuzzle(startingBoard)) return startingBoard

        // If we were unable to place the future num, that num was wrong.
        // Reset it and try next
        startingBoard[emptyCell.rowIndex][emptyCell.colIndex] = 0
      }
    }
    return false
  }

  // @ts-ignore
  newSolvedBoard = () => {
    const newBoard = this.blankBoard.map((row: any) => row.slice()) // Create an unaffiliated clone of a fresh board
    this.fillPuzzle(newBoard) // Populate the board using backtracking algorithm
    return newBoard
  }

  pokeHoles = (startingBoard: any, holes: any) => {
    const removedVals: any = []

    while (removedVals.length < holes) {
      const val = Math.floor(Math.random() * 81) // Value between 0-81
      const randomRowIndex = Math.floor(val / 9) // Integer 0-8 for row index
      const randomColIndex = val % 9

      if (!startingBoard[randomRowIndex]) continue // guard against cloning error
      if (startingBoard[randomRowIndex][randomColIndex] == 0) continue // If cell already empty, restart loop

      removedVals.push({  // Store the current value at the coordinates
        rowIndex: randomRowIndex,
        colIndex: randomColIndex,
        val: startingBoard[randomRowIndex][randomColIndex]
      })
      startingBoard[randomRowIndex][randomColIndex] = 0 // "poke a hole" in the board at the coords
      const proposedBoard = startingBoard.map((row: any) => row.slice()) // Clone this changed board

      // Attempt to solve the board after removing value. If it cannot be solved, restore the old value.
      // and remove that option from the list
      if (!this.fillPuzzle(proposedBoard)) {
        startingBoard[randomRowIndex][randomColIndex] = removedVals.pop().val
      }
    }
    return [removedVals, startingBoard]
  }

  newStartingBoard = (holes: number):any => {
    try {
      this.counter = 0
      let solvedBoard = this.newSolvedBoard()

      // Clone the populated board and poke holes in it.
      // Stored the removed values for clues
      let [removedVals, startingBoard] = this.pokeHoles(solvedBoard.map(row => row.slice()), holes)

      return [removedVals, startingBoard, solvedBoard]

    } catch (error){
      return this.newStartingBoard(holes)
    }
  }
}


interface IEmptyCell {
  rowIndex: number;
  colIndex: number;
}
