var
    $field = $('#gameFieldJS'),
    $resetGame = $('button#resetGame');

var view = {

    pxTableWidth: 1200,

    createField: function(){

        var
            size = ( this.pxTableWidth / model.fieldSize[1] ).toFixed(6) + 'px',
            tableLine = '';

        tableLine = '<tbody>';

        for ( var i = 0; i < model.fieldSize[0]; i++ ) {

            tableLine += '<tr>';

            for ( var j = 0; j < model.fieldSize[1]; j++ )
                tableLine += '<td class="closed" style="width: ' + size + '; height: ' + size + ';"></td>';

            tableLine += '</tr>';

        }

        tableLine += '</tbody>';

        $field.html(tableLine);

    },

    showCell: function ($cell, mineNear) {

        if (!!mineNear)
            $cell.addClass('mine-near').text(mineNear);

        $cell.removeClass('flag closed').addClass('open');

    },

    showMine: function ($cell) {

        $cell.removeClass('closed flag').addClass('mine');

    },

    showFlag: function ($cell) {

        $cell.addClass('flag');

    },

    removeFlag: function ($cell) {

        $cell.removeClass('flag');

    },

    toggleHighLight: function ($cell, toggle) {

        if (toggle)
            $cell.addClass('highLight');
        else
            $cell.removeClass('highLight');

    },

    changeFlagCnt: function (i) {

        $('input#flag_cnt').val(i);

    },

    changeGameTime: function (i) {

        $('input#game_time').val(i);

    }

};

var model = {

    fieldSize: [15, 30],
    minesNum: 40,

    minMinePercent: 8,
    maxMinePercent: 16,

    minHSize: 10,
    maxHSize: 50,

    minVSize: 5,
    maxVSize: 25,

    startPosition: [],
    fieldsObj: [],
    openCellCnt : 0,

    fillStartPosition: function (position) {

        var
            newPosition = [],
            pos = position.split(':');

        for (var i = -1; i <= 1; i++) {

            for (var j = -1; j <= 1; j++) {

                if ((i == 0) && (j == 0))
                    this.startPosition.push(position);
                else{

                    newPosition = [
                        parseInt(pos[0]) + i,
                        parseInt(pos[1]) + j
                    ];

                    if (
                        (newPosition[0] >= 0 && newPosition[1] >= 0) &&
                        (newPosition[0] < this.fieldSize[0] && newPosition[1] < this.fieldSize[1])
                    ){
                        newPosition = newPosition[0] + ':' + newPosition[1];
                        this.startPosition.push(newPosition);
                    }
                }

            }

        }

    },

    getRandomPos: function (i) {

        return Math.floor(Math.random() * this.fieldSize[i]);

    },

    createMinePos: function () {

        return this.getRandomPos(0) + ':' + this.getRandomPos(1);

    },

    createMinesCheckPos: function (position) {

        var startPosition = this.startPosition;

        if (startPosition.length > 0)
            for (var i = 0; i < startPosition.length; i++)
                if (startPosition[i] == position)
                    return true;

        for (var key in this.fieldsObj)
            if (key == position)
                return true;

        return false;
    },

    createMines: function () {

        var position;

        for (var i = 0; i < this.minesNum; i++) {

            do {
                position = this.createMinePos();
            } while (this.createMinesCheckPos(position));

            this.fieldsObj[position] = {};
            this.fieldsObj[position].isMine = true;
            this.fieldsObj[position].isOpen = false;
            this.fieldsObj[position].mineNear = 0;

        }

    },

    setFields: function(){

        for (var i = 0; i < this.fieldSize[0]; i++) {

            for (var j = 0; j < this.fieldSize[1]; j++) {

                var thisPos = i + ':' + j;

                if (!(this.fieldsObj.hasOwnProperty(thisPos))) {

                    this.fieldsObj[thisPos] = {};
                    this.fieldsObj[thisPos].isMine = false;
                    this.fieldsObj[thisPos].isOpen = false;
                    this.fieldsObj[thisPos].mineNear = this.getMineNear(thisPos);

                }

            }

        }

    },

    getPosition: function ($this) {

        var $tr = $this.closest('tr');

        return $tr.index() + ':' + $this.index();

    },

    findCell: function (position) {

        var
            pos = position.split(':'),
            $cell = {};

        $cell = $field.find('tr').filter(':nth-child('+ (parseInt(pos[0])+1) +')')
                    .find('td').filter(':nth-child('+ (parseInt(pos[1])+1) +')');

        return $cell;

    },

    checkCell: function (position) {

        var result = false;

        if (this.fieldsObj.hasOwnProperty(position) && this.fieldsObj[position].isMine)
            result = true;

        return result;

    },

    getMineNear: function (position) {

        var
            newPosition = '',
            minesCounter = 0,
            pos = position.split(':'),
            pos0 = 0,
            pos1 = 0;

        for (var i = -1; i <= 1; i++) {

            for (var j = -1; j <= 1; j++) {

                if ( (i != 0) || (j != 0) ) {

                    pos0 = parseInt(pos[0]) + i;
                    pos1 = parseInt(pos[1]) + j;

                    if (
                        (pos0 >= 0 && pos1 >= 0) &&
                        (pos0 < this.fieldSize[0] && pos1 < this.fieldSize[1])
                    ) {

                        newPosition = pos0 + ':' + pos1;

                        if (this.checkCell(newPosition))
                            ++minesCounter;

                    }

                }

            }

        }

        return minesCounter;

    },

    markPosition: function (position) {
        this.fieldsObj[position].isOpen = true;
        ++this.openCellCnt;
    },

    openNeighbor: function (position, clearCell) {

        clearCell = clearCell || [];

        if(($.inArray(position, clearCell) == -1) && (!this.fieldsObj[position].isOpen)){

            clearCell.push(position);
            this.markPosition(position);

            var pos = position.split(':');

            for (var i = -1; i <= 1; i++){

                for(var j = -1; j <= 1; j++){

                    if ( (i != 0) || (j != 0) ){

                        var
                            pos0 = parseInt(pos[0]) + i,
                            pos1 = parseInt(pos[1]) + j;

                        if (
                            (pos0 >= 0 && pos1 >= 0) &&
                            (pos0 < this.fieldSize[0] && pos1 < this.fieldSize[1])
                        ){

                            var newPosition = pos0 + ':' + pos1;

                            if (!this.fieldsObj[newPosition].isOpen) {

                                var
                                    $cell = this.findCell(newPosition),
                                    mineNear = parseInt(this.fieldsObj[newPosition].mineNear),
                                    isMine = this.fieldsObj[newPosition].isMine;

                                view.showCell($cell, mineNear);

                                if(mineNear == 0)
                                    this.openNeighbor(newPosition, clearCell);
                                else if (mineNear > 0)
                                    this.markPosition(newPosition);

                            }

                        }

                    }

                }

            }

        }

    },

    getFlagCount: function (position) {

        var
            pos = position.split(':'),
            flagCnt = 0;

        for (var i = -1; i <= 1; i++){

            for(var j = -1; j <= 1; j++){

                if((i != 0) || (j != 0)){

                    var
                        pos0 = parseInt(pos[0]) + i,
                        pos1 = parseInt(pos[1]) + j;

                    if(
                        (pos0 >= 0 && pos1 >= 0) &&
                        (pos0 < this.fieldSize[0] && pos1 < this.fieldSize[1])
                    ){

                        var newPosition = pos0 + ':' + pos1;
                        if (this.findCell(newPosition).hasClass('flag'))
                            ++flagCnt;

                    }

                }

            }

        }

        return flagCnt;

    },

    getCellToOpen: function (position) {

        var
            pos = position.split(':'),
            cellObj = [];

        for (var i = -1; i <= 1; i++){

            for(var j = -1; j <= 1; j++){

                if((i != 0) || (j != 0)){

                    var
                        pos0 = parseInt(pos[0]) + i,
                        pos1 = parseInt(pos[1]) + j;

                    if(
                        (pos0 >= 0 && pos1 >= 0) &&
                        (pos0 < this.fieldSize[0] && pos1 < this.fieldSize[1])
                    ){

                        var
                            newPosition = pos0 + ':' + pos1,
                            $cell = this.findCell(newPosition);

                        if ($cell.hasClass('closed') && (!$cell.hasClass('flag')))
                            cellObj.push($cell);

                    }

                }

            }

        }

        return cellObj;

    },

    gameStatus: function () {

        var
            fieldSize = this.fieldSize[0] * this.fieldSize[1],
            openCellCnt = fieldSize - this.minesNum;

        return (this.openCellCnt >= openCellCnt) ? true : false;

    },

    showField: function () {

        for (var key in this.fieldsObj){

            if (!this.fieldsObj[key].isOpen) {

                if (this.fieldsObj[key].isMine)
                    view.showMine(this.findCell(key));
                else
                    view.showCell(this.findCell(key), this.fieldsObj[key].mineNear);

            }

        }

    },

    gameOptions: function ($this) {

        var
            $form = $this.closest('form'),
            hSize = parseInt($form.find('input[name="h_size"]').val()),
            vSize = parseInt($form.find('input[name="v_size"]').val()),
            mineCnt = parseInt($form.find('input[name="mine_cnt"]').val());

        if (!vSize)
            return 'Необходимо указать число в поле "Кол-во клеток по вертикали"';
        else if (vSize < this.minVSize || vSize > this.maxVSize)
            return 'Размер поля по вертикали не должен быть меньше ' + this.minVSize + ' и не больше ' + this.maxVSize;

        if (!hSize)
            return 'Необходимо указать число в поле "Кол-во клеток по горизонтали"';
        else if (hSize < this.minHSize || hSize > this.maxHSize)
            return 'Размер поля по горизонтали не должен быть меньше ' + this.minHSize + ' и не больше ' + this.maxHSize;

        if (!mineCnt)
            return 'Необходимо указать число в поле "Кол-во бомб"';

        var
            fieldSquare = hSize*vSize,
            minMineCtn = Math.ceil(fieldSquare*this.minMinePercent/100),
            maxMineCtn = Math.ceil(fieldSquare*this.maxMinePercent/100);

        if (mineCnt < minMineCtn || mineCnt > maxMineCtn)
            return 'При размере поля ' + hSize + ' на ' + vSize + ', количество мин должно быть в диапазоне от ' + minMineCtn + ' до ' + maxMineCtn;

        this.fieldSize = [vSize, hSize];
        this.minesNum = mineCnt;

        return false;

    }

};

var controller = {

    firstClick: true,
    flagCnt: 0,
    gameTime: 0,
    gameInterval: {},

    createField: function () {
        view.createField();
    },

    generateField: function (position){

        model.fillStartPosition(position);
        model.createMines();
        model.setFields();
        this.firstClick = false;

    },

    openCell: function ($this) {

        var position = model.getPosition($this);

        if (this.firstClick) {
            this.generateField(position);

            this.gameInterval = setInterval(function (){
                controller.gameTime++;
                view.changeGameTime(controller.gameTime);
            }, 1000);
        }

        if (model.checkCell(position)) {

            model.showField();

            setTimeout(function(){
                if (confirm("Вы проиграли. Сыграем еще?"))
                    controller.newGame();
            }, 500);

            return false;

        } else {

            var
                mineNear = parseInt(model.fieldsObj[position].mineNear);

            if (mineNear > 0) {
                view.showCell($this, mineNear);
                model.markPosition(position);
            }
            else if (mineNear == 0) {
                view.showCell($this, false);
                model.openNeighbor(position);
            }

            if (model.gameStatus()) {

                model.showField();

                clearInterval(this.gameInterval);

                setTimeout(function(){
                    if (confirm('Вы выиграли. Ваше время: ' + controller.gameTime + ' сек. Сыграем еще?'))
                        controller.newGame();
                }, 500);

            }

        }

    },

    newGame: function ($this) {

        $this = $this || $resetGame;

        var gameOptions = model.gameOptions($this);

        if (gameOptions)
            alert(gameOptions);
        else {

            $field.html('');
            this.firstClick = true;

            this.flagCnt = 0;
            view.changeFlagCnt(this.flagCnt);

            clearInterval(this.gameInterval);
            this.gameTime = 0;
            view.changeGameTime(this.gameTime);

            this.createField();
            model.fieldsObj = [];
            model.openCellCnt = 0;

        }

    },

    toggleFlag: function ($this) {

        if ($this.hasClass('flag')) {

            --this.flagCnt;
            view.removeFlag($this);

        } else {

            ++this.flagCnt;
            view.showFlag($this);

        }

        view.changeFlagCnt(this.flagCnt);

    },

    safeClick: function ($this) {

        var
            position = model.getPosition($this),
            mineNear = model.fieldsObj[position].mineNear,
            flagCnt = model.getFlagCount(position);

        if (flagCnt == mineNear) {

            var cellObj = model.getCellToOpen(position);

            for (var key in cellObj)
                this.openCell(cellObj[key]);

        }

    },

    backLight: function ($this, toggle) {

        // есть баги с кликами...
        var
            position = model.getPosition($this),
            cellObj = model.getCellToOpen(position);

        for (var key in cellObj)
            view.toggleHighLight(cellObj[key], toggle);

    }

};

(function() {

    var app = {

        init: function () {
            this.control();
            this.event();
        },

        // control() - Запускаем необходимые методы объекта "controller"
        control: function () {

            controller.createField();

        },

        // event() - Здесь мы регистрируем, вызываем "Обработчики событий"
        event: function () {

            var lDown = false,
                rDown = false;

            $field.on('contextmenu', function() {
                return false;
            }).on('mousedown', 'td', function (e){

                if (e.which == 1)
                    lDown = true;
                else if (e.which == 3)
                    rDown = true;

                if (lDown && rDown)
                    controller.backLight($(this), true);

            }).on('mouseup', 'td.closed', function (e) {

                var $this = $(this);

                if (!lDown || !rDown) {

                    switch (e.which) {
                        case 1:
                            controller.openCell($this);
                            break;
                        case 3:
                            controller.toggleFlag($this);
                            break;
                        default:
                            console.log('Unknown mouse button');
                    }

                }

            }).on('mouseup', 'td.mine-near', function (e){

                if((lDown && rDown) && ((e.which == 1) || (e.which == 3)))
                    controller.safeClick($(this));

            }).on('mouseup', 'td', function (e){

                if ((lDown && rDown) && (e.which == 1) || (e.which == 3))
                    controller.backLight($(this), false);

                if (e.which == 1)
                    lDown = false;
                else if (e.which == 3)
                    rDown = false;

            });

            $resetGame.on('click', function (){
                controller.newGame($(this));
                return false;
            });

        }

    };

    // запускаем init() - выполняет запуск всего кода
    app.init();

}());