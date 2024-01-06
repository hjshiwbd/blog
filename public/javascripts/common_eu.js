/**
 *
 <pre>datagrid公用配置

 cols:可用属性
 field:数据属性名
 title:列名中文名
 width:宽度
 formatter:格式化
 checkbox:多选框
 align:左右对齐
 datetype:内置的数据转换:
 - timestamp13:13位时间戳转yyyy-MM-dd hh:mm
 - datetime10:10位时间戳转yyyy-MM-dd
 </pre>
 * @param url
 * @param cols
 * @param  isLoad
 * @param customHeight 自定义高度
 * @param option
 * @returns
 */
function dgSetting1({
    url,
    cols,
    isLoad,
    customHeight,
    option = {}
}) {
    var col = formatCols(cols);
    isLoad = isLoad === undefined ? true : isLoad;
    var h = $(window).height();
    if (customHeight) {
        h = h - customHeight;
    }
    var defaultPageSize = 50;
    var defaultFitColumns = true;
    var loadCount = 0;
    var o = {
        clientPaging: false,
        idField: 'id',
        async: true,
        height: h,
        fitColumns: defaultFitColumns,
        autoRowHeight: true,
        striped: true,
        nowrap: true,
        singleSelect: true,
        checkOnSelect: true,
        pagination: true,
        pageSize: defaultPageSize,
        pageList: [10, 20, 50, 100, 200, 300, 500, 1000],
        columns: col,
        onBeforeLoad: function() {
            if (!isLoad) {
                if (loadCount++ === 0) {
                    return false;
                }
            }
        },
        // onSelect: function (index, row) {
        //     // 点击row不会高亮
        //     $(this).datagrid('clearSelections');
        // }
        ...option
    };
    if (url) {
        o.url = url;
    }
    return o;
}

/**
 * 构建dg字段属性
 *
 * @param coldata
 * @returns
 */
function formatCols(coldata) {
    var result = [];
    for (var i = 0; i < coldata.length; i++) {
        var mycol = coldata[i];
        var dgcol = {
            field: mycol['field'],
            title: '<h3 class="dg-title">' + mycol['title'] + '<h3>',
            halign: 'center',
            width: mycol['width'] || 100,
            formatter: mycol['formatter'] || undefined,
            checkbox: mycol['checkbox'] || undefined,
            align: mycol['align'] || 'center'
        };
        if (mycol['datetype'] == 'timestamp13') {
            dgcol['formatter'] = function(value, row) {
                return dateParser(value, row, 'yyyy-MM-dd hh:mm');
            }
        } else if (mycol['datetype'] == 'datetime10') {
            dgcol['formatter'] = function(value, row) {
                return dateParser(value, row, 'yyyy-MM-dd');
            }
        }
        $.each(Object.keys(mycol), function(i, key) {
            dgcol[key] = mycol[key];
        });
        result.push(dgcol);
    }
    return [result];
}

/**
 * 日期转换器
 *
 * @param value
 * @param row
 * @param legnth
 * @returns
 */
function dateParser(value, row, format) {
    if (!value || value == '') {
        return '';
    }
    return dateFormat(value, format);
}

/**
 * 在鼠标滑过的title中显示全部内容
 */
function showFulltxt() {
    $('.datagrid-cell').each(function(i, o) {
        var txt = $(o).text();
        $(o).attr('title', txt);
    });
}

/**
 * 根据权限控制dom
 */
function dgShowPriv() {
    var marker = 'globalpriv';
    var dom = $('[' + marker + ']');
    if (dom.size() > 0) {
        let remoteData = easyuitool.datagrid.getPrivData();
        doPriv(remoteData);
    }

    function doPriv(remoteData) {
        if (Object.prototype.toString.call(remoteData) === '[object String]' && remoteData === 'rzadmin') {
            dom.each(function(i, o) {
                $(o).removeClass('privhide').removeAttr(marker);
            });
        } else if (Object.prototype.toString.call(remoteData) === '[object Array]' && remoteData.length > 0) {
            dom.each(function(i, o) {
                var json = $(o).attr(marker);
                if (isHasPriv(remoteData, json)) {
                    $(o).removeClass('privhide').removeAttr(marker);
                } else {
                    $(o).remove();
                }
            });
        } else {
            dom.each(function(i, o) {
                $(o).remove();
            });
        }
    }
}

function isHasPriv(arr, json) {
    try {
        var webArr = $.parseJSON(decodeURI(json));
        for (var i = 0; i < arr.length; i++) {
            var o1 = arr[i]; // 后台权限
            for (var j = 0; j < webArr.length; j++) {
                // console.log(o1,webArr[j]);
                var o2 = webArr[j]; // 页面权限
                var id = o2['id'];
                var type = o2['type'] || 'action'; // 默认action
                if (o1['resourceid'] == id && o1['resourcetype'] == type) {
                    return true;
                }
            }
        }
        return false;
    } catch (e) {
        clog(`ishaspriv err:${e.message},json:${json}`);
        return false;
    }
}

/**
 * 页面中的配置是以","隔开的</br>如: id="id1,id2..." type="type1,type2..."</br>将其组装成[{id1,type1},{id2,type2}...]的形式
 *
 *
 * @param obj
 * @returns {Array}
 */
function parsePriv(obj) {
    var ids = obj['resource_id'].split(',')
    var types = obj['resource_type'].split(',')
    var arr = [];
    for (var i = 0; i < ids.length; i++) {
        var o = {
            resource_id: ids[i],
            resource_type: types[i]
        };
        arr.push(o);
    }
    return arr;
}

function eualert(msg, callback, title, icon) {
    title = title ? title : '提示信息';
    icon = icon ? icon : 'info';
    $.messager.alert(title, msg, icon, callback);
}


function euconfirm(msg, callback, title) {
    title = title ? title : '提示信息';
    $.messager.confirm(title, msg, callback);
}

function removetxt() {
    return [{
        iconCls: 'icon-clear',
        handler: function(e) {
            if ($(e.data.target).hasClass('combobox-f')) {
                $(e.data.target).combobox('clear');
            } else {
                $(e.data.target).textbox('reset');
            }
        }
    }];
}

function addKeyupEvent(combobox) {
    var timer = undefined;
    combobox.next().on('keyup', function(e) {
        window.clearTimeout(timer);
        timer = setTimeout(function() {
            doInputSearch(combobox);
        }, 200);
    });
    combobox.next().find('.textbox-text').on('focus', function() {
        // combobox.combobox('showPanel');
    });
}

function doInputSearch(combobox) {
    var v = combobox.combobox('getText');
    if (v == '') {
        combobox.combobox('setValue', undefined);
        combobox.combobox('setText', undefined);
    } else {
        var data = combobox.combobox('getData');
        // clog(v);
        // clog(data);
        for (var i in data) {
            var o = data[i];
            var dm = combobox.combobox('options')['valueField'];
            var mc = combobox.combobox('options')['textField'];
            if (startsWith(o[mc], v)) {
                combobox.combobox('select', o[dm]);
                break;
            }
        }
    }
}

function onUpOrDown(obj, offset) {
    var v = obj.combobox('getValue');
    var data = obj.combobox('getData');
    if (data == undefined || data.length == 0) {
        return;
    }
    var dm = obj.combobox('options')['valueField'];
    // var mc = obj.combobox('options')['textField'];
    var index = getIndex(data, v, dm);
    index = route(index, offset, data.length);
    if (index != -1) {
        obj.combobox('select', data[index][dm]);
    }
}

function route(i, offset, length) {
    // 第一位,-1,到最后一位
    if (i == 0 && offset == -1) {
        return length - 1;
    }
    // 最后一位,1,到第一位
    if (i == (length - 1) && offset == 1) {
        return 0;
    }
    return i + offset;
}

function getIndex(data, v, dm) {
    for (var i in data) {
        var o = data[i];
        if (o[dm] == v) {
            return parseInt(i, 10);
        }
    }
    return -1;
}