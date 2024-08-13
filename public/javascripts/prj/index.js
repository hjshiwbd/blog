const clog = console.log
const keywordAutoComplete = $('#keywordAutoComplete')//自动完成
let keywordList = []
const maxHistory = 20
const keywordEle = $('#keyword')

$(function () {
    const url = '/crawlerdata'
    const cols = [{
        field: 'fid',
        title: 'fid',
        width: 4
    }, {
        field: 'title',
        title: 'title',
        width: 80,
        formatter(value, row) {
            const txt = replaceHightlight(value);
            return `<a target="_blank" rel="noreferrer" href="${row.link}">${txt}</a>`
        }
    }, {
        field: 'post_date',
        title: 'post_date',
        width: 15,
    }, {
        field: 'author_name',
        title: 'author_name',
        width: 7,
    },]
    const options = dgSetting1({
        url,
        cols,
        customHeight: 50
    })
    $('#fid').combobox({
        multiple: true,
        width: 150,
        editable: false,
        value: "",
        icons: [{
            iconCls: 'icon-clear',
            handler: function (e) {
                $(e.data.target).combobox('clear');
            }
        }]
    })
    //初始化dg
    $('#dg').datagrid(options)
    //搜索
    $("#search").on('click', function () {
        const keyword = keywordEle.val()
        keywordEle.textbox('setValue', simplized(keyword))
        search()
    })
    //繁体搜索
    $('#searchTraditional').on('click', function () {
        const keyword = keywordEle.val()
        keywordEle.textbox('setValue', traditionalized(keyword))
        search()
    })
    //输入框清空"x"按钮
    keywordEle.textbox({
        icons: [{
            iconCls: 'icon-clear',
            handler(e) {
                $(e.data.target).textbox('clear')
            }
        }]
    })
    //点击显示历史搜索记录
    keywordEle.textbox('textbox').on('click', () => {
        keywordAutoComplete.show();
    })
    //输入框键盘事件
    keywordEle.textbox('textbox').on('keyup', (e) => {
        //回车搜索
        if (e.which === 13) {
            search()
        }
        //esc关闭历史
        if (e.which === 27) {
            keywordAutoComplete.hide()
        }
    })
    //xhr最后更新数据
    $.post('/lastcrawlerdate', {}, function (r) {
        $('#lastUpdate').text(`${r.dd},${r.diff}天`)
    })
    //关闭历史记录
    $(document).click(e => {
        var showId = ['_easyui_textbox_input2', 'keywordAutoComplete']
        var id1 = $(e.target).parent().attr('id');
        var id2 = e.target.id;
        if (!showId.includes(id1) && !showId.includes(id2)) {
            keywordAutoComplete.hide()
        }
    })
    //填充历史记录
    fillAutoComplete()
})

//执行搜索
function search() {
    const keyword = keywordEle.val()
    keywordListAddItem(keyword)
    const fid = $('#fid').combobox('getValues')
    fillAutoComplete()
    $('#dg').datagrid('reload', {
        keyword,
        fid: fid ? fid.join(",") : ""
    })
}

//删除历史记录
function keywordListRemoveItem(keyword) {
    if (!keyword) {
        return
    }
    var i = keywordList.indexOf(keyword)
    if (i != -1) {
        keywordList.splice(i, 1)
    }
    setKeywordListHeight()
    lsSet('articleKeywordHistory', keywordList)
}

//新加历史记录
function keywordListAddItem(keyword) {
    if (!keyword) {
        return
    }
    var i = keywordList.indexOf(keyword)
    if (i != -1) {
        keywordList.splice(i, 1)
    }

    if (keywordList.length == maxHistory) {
        keywordList.pop()
    }
    keywordList.unshift(keyword)
    lsSet('articleKeywordHistory', keywordList)
}

//localStorage set
function lsGet(key) {
    var v = localStorage.getItem(key)
    v = JSON.parse(v)
    return v
}

//localStorage get
function lsSet(key, value) {
    var v = JSON.stringify(value)
    localStorage.setItem(key, v)
}

//填充历史记录
function fillAutoComplete() {
    keywordList = keywordList.length > 0 ? keywordList : lsGet('articleKeywordHistory') || []
    console.log(keywordList);
    keywordAutoComplete.html('')
    for (var i in keywordList) {
        var t = `
        <div class="line">
            <div class="text">${keywordList[i]}</div>
            <div class="del">X</div>
        </div>
        `
        keywordAutoComplete.append(t)
    }
    keywordAutoComplete.hide()
    setKeywordListHeight()
    autocompleteEvent()
}

//设置历史记录高度
function setKeywordListHeight() {
    var height = 21 * keywordList.length + 4
    keywordAutoComplete.height(height)
}

//历史记录点击事件
function autocompleteEvent() {
    //点击搜索
    $('#keywordAutoComplete .line').on('click', function () {
        var t = $(this).children().eq(0).text()
        keywordEle.val(t)
        keywordEle.textbox('setText', t)
        search()
        keywordAutoComplete.hide()
    })
    //点击删除
    $('#keywordAutoComplete .line .del').on('click', function (e) {
        var t = $(this).prev().text()
        keywordListRemoveItem(t)
        $(this).parent().remove()
        e.stopPropagation();
    })
}

function replaceHightlight(value) {
    const v = keywordEle.val()
    // 正则替换所有v, 不区分大小写
    const arr = v.split(' ');
    arr.forEach(s => {
        value = value.replace(new RegExp(s, 'ig'), `<span style="color:red">${s}</span>`)
    })
    return value

}