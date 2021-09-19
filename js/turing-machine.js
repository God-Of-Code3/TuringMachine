// Класс машины
const defaultSymbol = "^";

class TuringMachine {
	constructor (tape, program) {
		this.tape = tape;
		this.program = program;

		this.state = 1;
		this.position = 0;

		this.log = [];

		this.log.push("[Info] Программа запущена");

		this.steps = 0;
	}

	getCurrentCell () {
		if (!(this.position in this.tape)) {
			this.tape[this.position] = "^";
		}
		return this.tape[this.position];
	}

	getCurrentCommand () {
		if (!(this.state in this.program)) {
			return -1;
		}

		let cell = this.getCurrentCell();
		if (!(cell in this.program[this.state])) {
			return -2;
		}

		let cmd = this.program[this.state][cell];
		return cmd;
	}

	action () {

		if (this.state == 0) {
			this.log.push(`[Info] Программа завершена. Шагов: ${this.steps}`);
			return false;
		}

		this.steps += 1;

		let cmd = this.getCurrentCommand();
		let time = new Date();
		if (cmd == -1) {
			this.log.push(`[Error] Указанного состояния Q${this.state} нет в программе!`);
			return false;
		} else if (cmd == -2) {
			this.log.push(`[Error] Нет команды для данного состояния Q${this.state} и данной буквы '${this.tape[this.position]}'!`);
			return false;
		}

		this.tape[this.position] = cmd.fill;
		switch (cmd.direction) {
			case "<":
				this.position -= 1;
				break;
			case ">":
				this.position += 1;
		}
		this.state = cmd.state;

		if (this.state != 0) {
			return true;
		} else {
			this.log.push(`[Info] Программа завершена. Шагов: ${this.steps}`);
			return false;
		}
		
	}

	getStringFormat (showState=false) {
		let string = "";
		for (let i in this.tape) {
			if (i == this.position) {
				if (showState) {
					string += `(${this.state})`;
				} else {
					string += `<b>${this.tape[i]}</b>`;
				}
			} else {
				string += this.tape[i];
			}
		}

		return string;
	}
}


let turing = null;
let timerInterval = null;

const start = () => {
	turing = new TuringMachine(getTapeValue(), tab.get());
	execCurrent.innerHTML = "";
}

startActionAdditionalFunction = () => {
	if (currentExecutionState == 0) {
		start();
	}
	action();
}

pauseActionAdditionalFunction = () => {
	clearInterval(timerInterval);
}

const action = () => {
	let success = turing.action();
	if (success) {
		let speed = 100;
		if (settings.speed > 0 && settings.speed <= 500) {
			speed = Math.floor(1000 / settings.speed);
		}
		timerInterval = setTimeout(action, speed);
	} else {
		pauseAction();
		stopAction();
	}
	execCurrent.innerHTML += turing.getStringFormat(true) + "\n";
	execVisualTape.innerHTML = turing.getStringFormat();
	execLog.innerHTML = turing.log.join("\n");
}