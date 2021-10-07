const clog = console.log
$(function() {
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
            return `<a target="_blank" href="${row.link}">${row.title}</a>`
        }
    }, {
        field: 'post_date',
        title: 'post_date',
        width: 15,
    }, {
        field: 'author_name',
        title: 'author_name',
        width: 7,
    }, ]
    const options = dgSetting1({
        url,
        cols,
        customHeight: 50
    })
    $('#fid').combobox({
        multiple: true,
        width: 250,
        value: "",
        icons: [{
            iconCls: 'icon-clear',
            handler: function(e) {
                $(e.data.target).combobox('clear');
            }
        }]
    })
    $('#dg').datagrid(options)

    $("#search").on('click', function() {
        search()
    })
    $('#keyword').textbox({
        icons: [{
            iconCls: 'icon-clear',
            handler(e) {
                $(e.data.target).textbox('clear')
            }
        }]
    })
    $('#keyword').textbox('textbox').on('keyup', (e) => {
        if (e.which === 13) {
            search()
        }
    })
    $.post('/lastcrawlerdate', {}, function(r) {
        $('#lastUpdate').text(`${r.dd},${r.diff}天`)
    })
})

function search() {
    const keyword = $('#keyword').val()
    const fid = $('#fid').combobox('getValues')
    $('#dg').datagrid('reload', {
        keyword,
        fid: fid ? fid.join(",") : ""
    })
}