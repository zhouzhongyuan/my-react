// 如果key不同，直接 重新渲染。
var _shouldUpdateReactComponent = function (prevElement, nextElement) {
    if (prevElement != null && nextElement != null) {
        var prevType = typeof prevElement;
        var nextType = typeof nextElement;
        if (prevType === 'string' || prevType === 'number') {
            return nextType === 'string' || nextType === 'number';
        } else {
            return nextType === 'object' && prevElement.type === nextElement.type && prevElement.key === nextElement.key;
        }
    }
    return false;
}