function downloadFile(data, name) {
    console.log(name);
    if (!name) {
        name = "Безымянный";
    }
    let a = document.createElement("a");
    let file = new Blob([data], {type: 'application/json'});
    a.href = URL.createObjectURL(file);
    a.download = name + ".json";
    a.click();
}

function download(object) {
    var file = object.files[0];
    var reader = new FileReader();
    reader.onload = function() {
        let data = JSON.parse(reader.result);

    
        try {
            localStorage.setItem('settings', JSON.stringify(data.settings));
            localStorage.setItem('tableData', JSON.stringify(data.program));
            localStorage.setItem('states', data.states);
            localStorage.setItem('tape', data.tape);

            $('#tape').value = localStorage.getItem('tape');

            let setts = data.settings;
            for (let setting in setts) {
                setSetting(setting, setts[setting]);
            }

            tab.setStates(JSON.parse(data.states));
            tab.setTableData(data.program);

            tab.build();
        } catch (err) {
            console.log("ОШИБКА ЧТЕНИЯ ФАЙЛА");
        }
    }
    reader.readAsText(file);
}

$('#download-button').onclick = () => {
    if (! localStorage.getItem('tableData')) {
        localStorage.setItem('tableData', {});
    }
    if (! localStorage.getItem('settings')) {
        localStorage.setItem('settings', {
            'program-name': ''
        });
    }
    downloadFile(
        JSON.stringify({
            'settings': JSON.parse(localStorage.getItem('settings')),
            'program': JSON.parse(localStorage.getItem('tableData')),
            'tape': localStorage.getItem('tape'),
            'states': localStorage.getItem('states')
        }, null, '\t'),
        JSON.parse(localStorage.getItem('settings'))['program-name']
    );
}

$('#fl').oninput = () => {
    download($('#fl'));
}