function ReactDOMComponent(element) {
    this._currentElement = element;
    this._rootNodeID = null;
}
ReactDOMComponent.prototype.mountComponent = function (rootID) {
    this._rootNodeID  = rootID;
    var props = this._currentElement.props;
    var tagOpen = '<' + this._currentElement.type;
    var tagClose = '</' + this._currentElement.type + '>';

    tagOpen += ' data-reactid=' + this._rootNodeID;

    //props
    for(let property in props){
        // event
        if(/^on[A-Za-z]/.test(property)){
            var eventType = property.replace('on', '');
            $(document).delegate('[data-reactid="' + this._rootNodeID + '"]', eventType + '.' + this._rootNodeID, props[property]);

        }
        // normal props
        if(props[property] && property !== 'children' && !/^on[A-Za-z]/.test(property) ){
            tagOpen += ' ' + property + '=' + props[property];
        }
    }

    //children
    var content = '';
    var children = props.children || [];

    var childrenInstances = [];
    var that = this;

    $.each(children, function (key, child) {
        var childComponentInstance = instantiateReactComponent(child);
        childComponentInstance._mountIndex = key;

        childrenInstances.push(childComponentInstance);

        var curRootId  = that._rootNodeID + '.' + key;

        var childMarkup = childComponentInstance.mountComponent(curRootId);

        content += ' ' + childMarkup;
    })

    this._renderedChildren = childrenInstances;
    // All
    return tagOpen + '>' + content + tagClose;
}
ReactDOMComponent.prototype.receiveComponent = function (nextElement) {
    var lastProps = this._currentElement.props;
    var nextProps = nextElement.props;

    this._currentElement = nextElement;

    // 更新当前节点
    this._updateDOMProperties(lastProps, nextProps);

    // 更新子节点
    this._updateDOMChildren(nextElement.props.children);
}