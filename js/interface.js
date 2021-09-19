const $ = (s, item=document) => item.querySelector(s);
const $$ = (s, item=document) => item.querySelectorAll(s);
const contextmenu = $('.context-menu');

document.body.onclick = () => {
	contextmenu.classList.remove('active');
}

// =========== РАБОТА С ТАБЛИЦЕЙ ===========

const table = prog => {
	// =========== КОНСТАНТЫ ===========

	const tableEl = $('table.program-table', prog);
	const addButtons = {
		state: $('#add-state', prog),
		letter: $('#add-letter', prog)
	}

	// Память

	let tableData = {
		'^': {

		},
		'1': {

		},
	}
	if (localStorage.getItem('tableData')) {
		tableData = JSON.parse(localStorage.getItem('tableData'));
	}

	let headers = [1, 2];
	if (localStorage.getItem('states')) {
		headers = JSON.parse(localStorage.getItem('states'));
	}
	// =========== КОНСТАНТЫ - КОНЕЦ ===========

	// =========== РАБОТА С КОМАНДАМИ ===========

	// Создание изменяемой ячейки таблицы
	const buildCell = (tag, data, callBack) => {
		let cell = document.createElement(tag);
		cell.classList.add('cell');

		cell.innerHTML = `
			<div class="cell-input"><input value="${data}" type="text"></div>
			<div class="cell-visual">${tag == "th" || data == "" ? data : renderCommand(parseCommand(data))}</div>
		`;

		let input = $('input', cell);
		let visual = $('.cell-visual', cell);

		cell.onclick = () => {
			cell.classList.add('editing');
			input.focus();
		}

		input.onblur = () => {
			cell.classList.remove('editing');
			visual.getAttribute('data-last');
			visual.innerHTML = callBack(visual.innerHTML, input.value, cell); // Коллбэк возвращает html визуальной 
			// части ячейки таблицы, построенный на основе вводимых данных
			visual.setAttribute('data-last', input.value);

			// Запоминание текущей таблицы
			localStorage.setItem('tableData', JSON.stringify(tableData));
		}

		return cell;
	}

	// Разбор команды. Выделение направления, состояния, заполнения
	const parseCommand = cmd => {
		let list = cmd.split(' ');
		let data = {direction: null, state: null, fill: null};
		list.forEach(el => {
			// Если мы спарсили состояние
			if (el.startsWith('Q')) {
				try {
					if (headers.includes(Number(el.replace('Q', ''))) || el == "Q0") {

						data.state = Number(el.replace('Q', ''));
					}
				} catch (err) {

				}
			}
			// Если мы спарсили направление
			if (el == ">" || el == "<") {
				data.direction = el;
			}
			// Если мы спарсили заполнение
			if (el in tableData) {
				data.fill = el;
			}
		});

		if (data.direction != null && data.state != null && data.fill != null) {
			return data;
		}
		return -1;
	}

	// Создание html кода визуальной части ячейки команды
	const renderCommand = cmd => {
		return `${cmd.fill} <b>${cmd.direction}</b> Q${cmd.state}`;
	}
	// =========== РАБОТА С КОМАНДАМИ - КОНЕЦ ===========


	// =========== ПОСТРОЕНИЕ ТАБЛИЦЫ ===========
	const build = () => {
		tableEl.innerHTML = "";

		// Создание шапки
		let tr = document.createElement('tr');

		// Пустая первая клетка
		tr.appendChild(document.createElement('td'));

		headers.forEach(h => { // h будет содержать в себе заголовок (он же состояние)
			let th = document.createElement('th');
			th.innerHTML = "Q" + h;

			// Привязка функции вызова контекстного меню для удаления состояния
			
			th.oncontextmenu = ev => {
				ev.preventDefault();

				if (h != 1) { // Первое состояние нельзя удалить
					contextmenu.classList.add('active');
					contextmenu.style.left = `${ev.pageX}px`;
					contextmenu.style.top = `${ev.pageY}px`;

					$('button', contextmenu).onclick = () => {
						let val = Number(th.innerHTML.replace('Q', ''));
						headers.splice(headers.indexOf(val), 1);
						build();
					}
				}
			}
			

			// Добавление заголовка в ряд
			tr.appendChild(th);
		});

		// Добавление ряда с заголовками в таблицу
		tableEl.appendChild(tr);

		// Создание рядов данных
		for (let key in tableData) {
			let el = tableData[key];

			// Создание th заголовка
			let tr = document.createElement('tr');

			// Первая клетка с буквой алфавита
			let th = buildCell(
				'th',
				key,
				(last, data, element) => {

					let row = tableData[last];
					tableData[data] = row;

					if (row) {
						delete tableData[last];
					} else {
						tableData[data] = {};
					}

					return data;
				}
			);

			th.oncontextmenu = ev => {
				ev.preventDefault();

				contextmenu.classList.add('active');
				contextmenu.style.left = `${ev.pageX}px`;
				contextmenu.style.top = `${ev.pageY}px`;

				$('button', contextmenu).onclick = () => {
					delete tableData[$('.cell-visual', th).innerHTML];
					build();
				}
			}

			tr.appendChild(th);

			// Создание клеток самой таблицы
			for (let state of headers) {
				// Если уже есть данные
				let data = (state in el) ? `${el[state].fill} ${el[state].direction} Q${el[state].state}` : '';
				
				tr.appendChild(
					buildCell(
						'td',
						data,
						(last, data, element) => {
							if (data == "") {
								return "";
							}

							let parsed = parseCommand(data);

							if (parsed != -1) {
								// Для получения ключа в объекте tableData обращаемся к родительскому
								// элементу и берем его html, это и есть ключ
								let letter = $('th .cell-visual', element.parentNode).innerHTML;
								tableData[letter][state] = parsed;
								return renderCommand(parsed);
							} else {
								return "Ошибка";
							}
						}
					)
				);
			}

			tableEl.appendChild(tr);
		}

		// Запоминание текущей таблицы
		localStorage.setItem('tableData', JSON.stringify(tableData));
	}
	// =========== ПОСТРОЕНИЕ ТАБЛИЦЫ - КОНЕЦ ===========

	// =========== КНОПКИ ДОБАВЛЕНИЯ ===========

	addButtons.state.onclick = () => {
		headers.push(headers[headers.length - 1] + 1);
		build();
		localStorage.setItem('states', JSON.stringify(headers));
	}

	let letterNumb = 2;

	addButtons.letter.onclick = () => {
		letterNumb += 1;
		tableData[String(letterNumb)] = {};
		build();
		localStorage.setItem('tableData', JSON.stringify(tableData));
	}
	// =========== КНОПКИ ДОБАВЛЕНИЯ - КОНЕЦ ===========

	// =========== ВЫДАЧА ИНФОРМАЦИИ ИЗ ТАБЛИЦЫ ===========

	const getProgram = () => {
		const program = {};

		headers.forEach(h => program[h] = {});

		for (let key in tableData) {
			for (let state in tableData[key]) {
				let stateData = tableData[key][state];

				program[state][key] = {
					fill: stateData.fill,
					state: stateData.state,
					direction: stateData.direction
				}
			}
		}

		return program;
	}

	const getAlphabet = () => {
		return Object.keys(tableData);
	}

	// =========== ВЫДАЧА ИНФОРМАЦИИ ИЗ ТАБЛИЦЫ - КОНЕЦ ===========

	return {
		build: build,
		get: getProgram,
		alphabet: getAlphabet,
		setTableData: (data) => { tableData = data; },
		setStates: states => { headers = states; }
	};
}
// =========== РАБОТА С ТАБЛИЦЕЙ - КОНЕЦ ===========

tab = table($('.program'));
tab.build();

// =========== РАБОТА С ЛЕНТОЙ ===========

const tape = $('#tape');

if (localStorage.getItem('tape')) {
	tape.value = localStorage.getItem('tape');
}

tape.oninput = () => {
	let string = tape.value;

	let alphabet = tab.alphabet();

	let newString = "";

	for (let i = 0; i < string.length; i ++ ) {
		if (alphabet.indexOf(string[i]) != -1) {
			newString += string[i];
		}
	}

	tape.value = newString;
	localStorage.setItem('tape', newString);
}

const getTapeValue = () => {
	let tapeData = {};
	tape.value.split("").forEach((symb, index) => {
		tapeData[index] = symb;
	});
	return tapeData;
}
// =========== РАБОТА С ЛЕНТОЙ - КОНЕЦ ===========


// =========== РАБОТА С КНОПКАМИ УПРАВЛЕНИЯ ===========

const startButton = $('#start');
const stopButton = $('#stop');
const pauseButton = $('#pause');
const stepForwardButton = $('#step-forward');

let currentExecutionState = 0;

let startActionAdditionalFunction = () => {};
let pauseActionAdditionalFunction = () => {};
let stopActionAdditionalFunction = () => {};
let stepActionAdditionalFunction = () => {};

startAction = () => {
	if (currentExecutionState == 0 || currentExecutionState == 2) {

		startActionAdditionalFunction();
		currentExecutionState = 1;
		startButton.disabled = true;
		pauseButton.disabled = false;
		stopButton.disabled = true;
		stepForwardButton.disabled = true;

		
	}
}

pauseAction = () => {
	if (currentExecutionState == 1) {
		currentExecutionState = 2;
		stopButton.disabled = false;
		startButton.disabled = false;
		stepForwardButton.disabled = false;
		pauseButton.disabled = true;

		pauseActionAdditionalFunction();
	}
}

stopAction = () => {
	if (currentExecutionState == 2) {
		currentExecutionState = 0;
		stopButton.disabled = true;
		startButton.disabled = false;
		stepForwardButton.disabled = false;
		pauseButton.disabled = true;

		stopActionAdditionalFunction();
	}
}

startButton.onclick = () => {
	startAction();
}

pauseButton.onclick = () => {
	pauseAction();
}

stopButton.onclick = () => {
	stopAction();
}

stepForwardButton.onclick = () => {
	stepActionAdditionalFunction();
}

let execCurrent = $('#exec-current');
let execLog = $('#exec-log');
let execVisualTape = $('#exec-visual-tape');

// =========== РАБОТА С КНОПКАМИ УПРАВЛЕНИЯ - КОНЕЦ ===========

// =========== НАСТРОЙКИ ===========

let settings = {
	speed: 10,
	name: ""
}

const setSetting = (setting, value) => {
	settings[setting] = value;
	if ($(`[data-setting=${setting}]`)) {
		$(`[data-setting=${setting}]`).value = value;
	}
}

const saveSettings = () => {
	$$('[data-setting]').forEach(setting => {
		settings[setting.getAttribute('data-setting')] = setting.value;
	});
	localStorage.setItem('settings', JSON.stringify(settings));
	
}

if (localStorage.getItem("settings")) {
	let setts = JSON.parse(localStorage.getItem('settings'));

	for (let setting in setts) {
		setSetting(setting, setts[setting]);
	}
}

// Специально для некоторых настроек
$('[data-setting=speed]').oninput = (ev) => {
	if (ev.target.value > 500) {
		ev.target.value = 500;
	}
	if (ev.target.value < 1) {
		ev.target.value = 1;
	}
}
$('[data-setting=program-name]').onchange = () => {
	saveSettings();
}

// =========== НАСТРОЙКИ - КОНЕЦ ===========

// =========== РАБОТА С МОДАЛЬНЫМИ ОКНАМИ ===========
let timerIntervalValue = 100;

const showModal = modal => {
	pauseAction();
	$$('.modal').forEach(modal => modal.classList.remove('active'));
	modal.classList.add('active');
}

$('#settings-button').onclick = () => {
	showModal($('#settings-modal'));
}

$$('.modal .close').forEach(close => close.onclick = () => {
	close.parentNode.parentNode.parentNode.classList.remove('active');
});

$('#save-settings').onclick = () => {
	saveSettings();
}
// =========== РАБОТА С МОДАЛЬНЫМИ ОКНАМИ - КОНЕЦ ===========