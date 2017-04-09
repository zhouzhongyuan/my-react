function ReactDOMTextComponent(text) {
    this._currentElement = ' ' + text;
    this._rootNodeID = null;
}

ReactDOMTextComponent.prototype.mountComponent = function (rootID) {
    this._rootNodeID = rootID;
    return '<span data-reactid="' + rootID + '">' + this._currentElement + '</span>';
}

function instantiateReactComponent(node) {
    if(typeof node === 'string' || typeof node === 'number'){
        return new ReactDOMTextComponent(node);
    }
}


React = {
    nextReactRootIndex: 0,
    render: function (element, container) {
        var componentInstance = instantiateReactComponent(element);
        var markup = componentInstance.mountComponent(React.nextReactRootIndex++);
        $(container).html(markup);
        $(document).trigger('mountReady');
    }

}