document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('info-open').addEventListener('click', () => {
        document.getElementById('info-dialog').showModal();
    });
    document.getElementById('import-open').addEventListener('click', () => {
        document.getElementById('import-form').showModal();
    });
    document.getElementById('import-file').addEventListener('change', () => {
        document.getElementById('import-file').files[0].text().then((data) => {
            document.getElementById('body').replaceChildren(...JSON2HTML(data));
            document.getElementById('import-form').close();
        });
    });
    document.getElementById('import-text-submit').addEventListener('click', () => {
        document.getElementById('body').replaceChildren(...JSON2HTML(document.getElementById('import-text').value));
        document.getElementById('import-form').close();
    });
    document.getElementById('body').replaceChildren(...JSON2HTML('{"name": "サンプルデータ", "description": "読み込み欄からデータを見たいファイルを選択してください。"}'));
});

function JSON2HTML(data) {
    try {
        data = JSON.parse(data);
    } catch (error) {
        let title = 'JSONを開けませんでした。';
        let message = error.message;
        message = message.replaceAll(/JSON(?: |\.)(?:P|p)arse(?: error|): /g, 'JSONの解析に問題が発生しました。\n');
        message = message.replaceAll(/(.*)(?: in JSON|) at(?: position \d*|) (?:\(|)line (\d*) column (\d*)(?:\)|)(?: of the JSON data|)/g, '「$2」行目の「$3」文字目付近で$1');
        message = message.replaceAll(/(?:U|u)nexpected (?:EOF|end of (?:data|JSON input))/g, 'JSONの構文の捜索中にデータの最後に到達してしまい、JSON構文を見つけられませんでした。');
        message = message.replaceAll(/(?:U|u)nterminated string/g, '文字列が最後まで続いていて閉じられていません。「"」が脱落している又は「“」や「”」になってしまっている可能性があります。');
        message = message.replaceAll('Unable to parse JSON string', 'このデータではJSONの解析が不可能です。構文エラーなどがないか再度ご確認ください。');
        message = message.replaceAll(/(?:U|u)nexpected(?: identifier| token|) (.*)/g, '想定外の$1が現れた！');
        message = message.replaceAll(/(?:E|e)xpected (.*)/g, '$1が脱落している箇所があります。');
        message = message.replaceAll(/,(.*)is not valid JSON(.*)/g, '$2$1は有効なJSONではありません。');
        message = message.replaceAll(/end of data (.*)/g, '$1でデータが途切れています。');
        message = message.replaceAll(/when (.*) was expected/g, '$1が想定されている場所');
        message = message.replaceAll(/after (.*) in object/g, 'オブジェクトの$1の後');
        message = message.replaceAll('non-whitespace character', 'スペースじゃない文字');
        message = message.replaceAll(/(.*)after ([a-zA-Z0-9 ]*)/g, '$2の後ろなのに、$1');
        message = message.replaceAll('JSON data', 'JSONデータ');
        message = message.replaceAll('array element', '配列');
        message = message.replaceAll('character', '文字');
        message = message.replaceAll('property name', 'プロパティの名前');
        message = message.replaceAll('property value', 'プロパティの値');
        message = message.replaceAll(' or ', 'または');
        message = message.replaceAll(' in JSON', '');
        message = message.replaceAll(/(?:"|')(.*?)(?:'|")/g, '「$1」');
        alert(`${title}\n\n〜エラー詳細〜\n${message}`);
        throw new Error(error);
    }
    return Data2HTML(data);
}

function Data2HTML(data, level) {
    let keys = Object.keys(data);
    if (!level || level > 4) {
        level = 1;
    }
    let html = [];
    for (let i = 0; i < keys.length; i++) {
        html.push(createItemBlock(keys[i], data[keys[i]], level));
    }
    return html;
}

function createItemBlock(nameData, valueData, level) {
    let item = document.createElement('div');
    item.className = 'item';
    item.dataset.level = level;
    let name = document.createElement('h3');
    name.className = 'item-name';
    name.innerText = nameData;
    item.append(name);
    if (typeof valueData === "object" && valueData !== null) {
        if (Array.isArray(valueData)) {
            let type = document.createElement('small');
            type.className = 'item-type';
            type.innerText = '配列';
            name.append(type);
        } else {
            let type = document.createElement('small');
            type.className = 'item-type';
            type.innerText = 'オブジェクト';
            name.append(type);
        }
        item.append(...Data2HTML(valueData, (level + 1)));
    } else {
        let type = document.createElement('small');
        type.className = 'item-type';
        if (valueData === null) {
            type.innerText = 'Null型';
            valueData = 'null';
        } else if (typeof valueData === "string") {
            type.innerText = '文字列';
        } else if (typeof valueData === "number") {
            type.innerText = '数字';
        } else if (typeof valueData === "boolean") {
            type.innerText = '論理値';
        } else {
            type.innerText = '形式不明';
        }
        name.append(type);
        let value = document.createElement('p');
        value.className = 'item-value';
        value.innerText = valueData;
        item.append(value);
    }
    return item;
}