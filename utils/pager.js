export function pager(page = 1, pageSize = 20) {
    const pager = {}
    pager.page = page;
    pager.pageSize = pageSize;
    pager.total = 0;
    pager.limit0 = (pager.page - 1) * pager.pageSize

    return pager
}